"""Install hash-bound approved pages into the full review, retaining native PDF art.

This offline route consumes saved proofs. It never exports or rewrites guides,
canonical data, cover sources or supplier files.
"""
from pathlib import Path
import hashlib,json,re,os,copy,sys
from collections import Counter
from pypdf import PdfReader,PdfWriter,PageObject,Transformation
from pypdf.generic import ContentStream,NameObject,DecodedStreamObject,NumberObject,BooleanObject,DictionaryObject
from pypdf.annotations import Link
from pypdf._cmap import get_encoding
from PIL import Image
import pdfplumber
R=Path(__file__).resolve().parents[1]
D=R/'docs/publication/whole-book-order-preview/integration-2026-11-22'
M=json.loads((D/'SOURCES.json').read_text())
MM=72/25.4;W=185*MM;H=240*MM
def save(name,obj):(D/name).write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n')
def sha(path):
 with Path(path).open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
for file,h in M['inputs'].items():assert sha(R/file)==h,('Source changed',file)
print('Verified all approved source bindings.',flush=True)
readers={};plumbers={}
def reader(file):
 if file not in readers:readers[file]=PdfReader(R/file)
 return readers[file]
def plumber(file):
 if file not in plumbers:plumbers[file]=pdfplumber.open(R/file)
 return plumbers[file]
def stream(page):
 s=page.get_contents();return s.get_data() if s is not None else b''
def decode(value,em):
 raw=value.original_bytes if isinstance(value,str) else bytes(value);enc,mp=em
 coded=raw.decode(enc,errors='strict') if isinstance(enc,str) else ''.join(enc.get(b,chr(b)) for b in raw)
 return ''.join(mp.get(c,c) for c in coded)
def text_blocks(obj,pdf):
 rs=obj.get('/Resources',{});fonts={k:get_encoding(v.get_object()) for k,v in rs.get('/Font',{}).items()}
 s=obj.get_contents() if isinstance(obj,PageObject) else ContentStream(obj,pdf)
 blocks=[];active=None;start=0;txt=''
 if s is not None:
  for i,(args,op) in enumerate(s.operations):
   if op==b'BT':start=i;txt=''
   elif op==b'Tf':active=args[0]
   elif op==b'Tj' and active in fonts:txt+=decode(args[0],fonts[active])
   elif op==b'TJ' and active in fonts:txt+=''.join(decode(x,fonts[active]) for x in args[0] if isinstance(x,(str,bytes)))
   elif op==b'ET':blocks.append((start,i,txt))
 return s,blocks
def remove_native_block(obj,pdf,phrase,align_placeholder=False):
 rs=obj.get('/Resources',{});s,blocks=text_blocks(obj,pdf);hits=[b for b in blocks if b[2]==phrase];n=len(hits)
 if hits:
  assert len(hits)==1
  start,end,_=hits[0]
  if align_placeholder:
   oldtm=next(args for args,op in s.operations[start:end+1] if op==b'Tm')
   placeholder=next(b for b in blocks if b[2]=='[Edition and year]')
   args=next(args for args,op in s.operations[placeholder[0]:placeholder[1]+1] if op==b'Tm')
   assert args[:4]==oldtm[:4] and args[5]==oldtm[5]
   args[4]=oldtm[4]
  del s.operations[start:end+1]
  if isinstance(obj,PageObject):obj.replace_contents(s)
  else:obj.set_data(s.get_data())
 for ref in rs.get('/XObject',{}).values():
  form=ref.get_object()
  if form.get('/Subtype')=='/Form':n+=remove_native_block(form,pdf,phrase,align_placeholder)
 return n
def swap_image(obj,key,new,pdf):
 rs=obj.get('/Resources',{});xs=rs.get('/XObject',{});count=0
 for k,ref in list(xs.items()):
  item=ref.get_object()
  if k==key and item.get('/Subtype')=='/Image':
   assert [int(item['/Width']),int(item['/Height'])]==new['expectedPixels']
   im=Image.open(R/new['file']).convert('RGB');s=DecodedStreamObject();s.set_data(im.tobytes());s=s.flate_encode()
   s.update({NameObject('/Type'):NameObject('/XObject'),NameObject('/Subtype'):NameObject('/Image'),NameObject('/Width'):NumberObject(im.width),NameObject('/Height'):NumberObject(im.height),NameObject('/ColorSpace'):NameObject('/DeviceRGB'),NameObject('/BitsPerComponent'):NumberObject(8),NameObject('/Interpolate'):BooleanObject(True)})
   copied=DictionaryObject(xs);copied[NameObject(k)]=pdf._add_object(s);rs[NameObject('/XObject')]=copied;count+=1
  elif hasattr(item,'get') and item.get('/Subtype')=='/Form':count+=swap_image(item,key,new,pdf)
 return count
def source_links(doc,page,index):
 ids={p.indirect_reference.idnum:i for i,p in enumerate(doc.pages)};out=[]
 for ref in page.get('/Annots',[]):
  a=ref.get_object()
  if a.get('/Subtype')!='/Link':continue
  record={'sourcePage':index,'rect':[float(x) for x in a['/Rect']]}
  if '/Dest' in a:record['targetPage']=ids[a['/Dest'][0].idnum]
  elif '/A' in a:
   action=a['/A'];kind=action['/S']
   if kind=='/GoToR':
    assert 'whole-book-order-preview' in str(action['/F']),str(action)
    record['targetPage']=int(action['/D'][0])
   elif kind=='/URI':
    uri=str(action['/URI']);match=re.search(r'whole-book-order-preview[^#]*#page=(\d+)',uri)
    if match:record['targetPage']=int(match.group(1))-1
    else:record['uri']=uri
   else:raise ValueError(('Unknown link action',str(action)))
  else:raise ValueError(('Unknown annotation',str(a)))
  out.append(record)
 return out
writer=PdfWriter();links=[];pagechecks=[];modifications=[]
for index,p in enumerate(M['pages']):
 doc=reader(p['source']);source=doc.pages[p['sourcePage']-1]
 assert abs(float(source.mediabox.height)-H)<0.1
 if 'cropXMM' in p:
  target=writer.add_blank_page(width=W,height=H)
  target.merge_transformed_page(source,Transformation().translate(-p['cropXMM']*MM,0),expand=False)
  exact=False
 else:
  assert abs(float(source.mediabox.width)-W)<0.1
  target=writer.add_page(source,excluded_keys=('/Annots',))
  assert stream(target)==stream(source)
  links.extend(source_links(doc,source,index));exact=True
 if p['folio']==2:
  assert remove_native_block(target,writer,'Imperial edition · ',True)==1
  modifications.append({'folio':2,'edit':'Removed measurement-edition prefix; aligned existing edition/year placeholder'});exact=False
 if p['folio']==164:
  assert remove_native_block(target,writer,'The materials and their uses are shown schematically, not to scale.')==1
  modifications.append({'folio':164,'edit':'Removed approved covering-material caption from native content stream'});exact=False
 if 'imageReplacement' in p:
  assert swap_image(target,p['imageReplacement']['resource'],p['imageReplacement'],writer)==1
  modifications.append({'folio':p['folio'],'edit':p['changes'][-1],'pixels':p['imageReplacement']['pixels']});exact=False
 expected=source.extract_text()
 if p['folio']==2:expected=expected.replace('Imperial edition · ','')
 if p['folio']==164:expected=expected.replace('The materials and their uses are shown schematically, not to scale.','')
 if 'cropXMM' in p:expected=None # The clipped wrap has native text outside the visible panel.
 pagechecks.append({'pdfPage':index+1,'folio':p['folio'],'source':p['source'],'sourcePage':p['sourcePage'],'nativeContentStreamExact':exact,'expectedText':expected})
 if (index+1)%20==0:print(f'Placed {index+1}/180 native pages.',flush=True)
# The new opening pages are native standalone proofs without cross-book links.
opening_numbers=[9,99,147]
for folio in opening_numbers:
 row=M['pages'][folio+1];page=plumber(row['source']).pages[row['sourcePage']-1]
 for word in page.extract_words():
  match=re.fullmatch(r'(\d{1,3})(?:[–−-]\d{1,3})?',word['text'])
  if not match or word['top']>H-35:continue
  n=int(match.group(1));assert 10<=n<=171,(folio,word)
  links.append({'sourcePage':folio+1,'targetPage':n+1,'rect':[word['x0']-3,H-word['bottom']-2,word['x1']+3,H-word['top']+2],'kind':'opener','printedFolio':n})
counts=Counter(x['sourcePage']-1 for x in links if x.get('kind')=='opener')
assert counts=={9:44,99:14,147:19},counts
tocfile='docs/publication/overnight-2026-11-19/openings/contents-no-category-colours/swapped-headers/CHECKS.json'
toc=json.loads((R/tocfile).read_text())['entries'];assert len(toc)==84
for e in toc:
 links.append({'sourcePage':e['page']+1,'targetPage':e['destination']+1,'rect':[e['xMM']*MM,H-(e['yMM']+e['heightMM'])*MM,(e['xMM']+e['widthMM'])*MM,H-e['yMM']*MM],'kind':'contents','label':e['label'],'printedFolio':e['destination']})
for link in links:
 if 'targetPage' in link:
  assert 0<=link['targetPage']<180
  writer.add_annotation(link['sourcePage'],Link(rect=link['rect'],target_page_index=link['targetPage']))
 else:writer.add_annotation(link['sourcePage'],Link(rect=link['rect'],url=link['uri']))
base=reader(M['baseline']['file']);outlines=[]
def outlines_from(items,parent=None):
 for item in items:
  if isinstance(item,list):outlines_from(item,parent)
  else:
   title=item.title;dest=base.get_destination_page_number(item)
   if dest==8:title='Introduction'
   if dest==10:title='Vegetable Guides'
   if dest==0:title='Front cover'
   if dest==179:title='Back cover'
   if not any(x['title']==title and x['targetPage']==dest for x in outlines):
    parent=writer.add_outline_item(title,dest);outlines.append({'title':title,'targetPage':dest})
outlines_from(base.outline)
writer.add_metadata({'/Title':'The Vegetable Guru — Updated complete book review','/Author':'John Lennon','/Subject':'Approved photographic openings, Techniques, November guide revisions and varieties. Traditional measurements edition. Screen proof; supplier files unchanged.'})
writer.set_page_label(0,0,prefix='Front cover');writer.set_page_label(1,1,prefix='Inside front cover');writer.set_page_label(2,177,style='/D',start=1);writer.set_page_label(178,178,prefix='Inside back cover');writer.set_page_label(179,179,prefix='Back cover')
print('Deduplicating shared PDF resources without changing artwork.',flush=True)
writer.compress_identical_objects(remove_duplicates=True,remove_unreferenced=True)
candidate=D/'integrated-native.pdf'
temporary_candidate=candidate.with_name(candidate.name+'.new')
writer.write(temporary_candidate)
os.replace(temporary_candidate,candidate)
print(f'Wrote native candidate: {candidate.stat().st_size/1e6:.1f} MB. Verifying text and destinations.',flush=True)
check=PdfReader(candidate);assert len(check.pages)==180
ids={p.indirect_reference.idnum:i for i,p in enumerate(check.pages)};actual=[]
for index,page in enumerate(check.pages):
 expected=pagechecks[index].pop('expectedText')
 if expected is not None:
  actual_text=page.extract_text()
  if pagechecks[index]['folio'] in [2,164]:
   assert ' '.join(actual_text.split())==' '.join(expected.split()),('Changed copy outside approved removal',index)
  else:assert actual_text==expected,('Text changed while saving',index)
 for ref in page.get('/Annots',[]):
  a=ref.get_object();assert a.get('/Subtype')=='/Link'
  if '/Dest' in a:actual.append((index,ids[a['/Dest'][0].idnum]))
  else:assert a['/A']['/S']=='/URI'
 assert not re.search(r'(?i)\bimperial\s*(?:edition|·)',page.extract_text()),('Edition label remains',index)
assert sorted(actual)==sorted((x['sourcePage'],x['targetPage']) for x in links if 'targetPage' in x)
assert 'The materials and their uses are shown schematically' not in check.pages[165].extract_text()
assert '[Edition and year]' in check.pages[3].extract_text()
for file,h in M['inputs'].items():assert sha(R/file)==h,('Source mutated',file)
receipt={'date':'2026-11-22','status':'Native assembly and structural checks passed; resolution and visual review pending','candidate':str(candidate.relative_to(R)),'sha256':sha(candidate),'bytes':candidate.stat().st_size,'interiorPages':176,'pdfPages':180,'guidePairsIntegrated':44,'guidesReexported':0,'sourceFilesUnchanged':len(M['inputs']),'nativeExactPages':sum(x['nativeContentStreamExact'] for x in pagechecks),'modifications':modifications,'pages':pagechecks,'allLinks':links,'internalLinks':len(actual),'contentsLinks':84,'newOpenerLinks':77,'bookmarks':outlines,'sourceManifest':str((D/'SOURCES.json').relative_to(R)),'scope':'Approved-page integration and screen-review preparation only; no supplier submission, canonical gardening edits or new artwork.'}
save('NATIVE-CHECKS.json',receipt)
print(json.dumps({k:v for k,v in receipt.items() if k not in ['pages','allLinks','bookmarks','scope']}),flush=True)
