"""Correct Key risks heading case using the original embedded Lilita font."""
from pathlib import Path
from collections import Counter
import ast,hashlib,json,logging,importlib.util,struct
import pdfplumber
from pypdf import PdfReader,PdfWriter,PageObject
from pypdf.generic import ContentStream,ByteStringObject,FloatObject,NameObject,NumberObject,ArrayObject
from pypdf._cmap import get_encoding
ROOT=Path(__file__).resolve().parents[3];D=Path(__file__).parent
OUT=ROOT/'output/pdf/key-risk-title-case/corrected-opening-pages.pdf';OUT.parent.mkdir(parents=True,exist_ok=True)
logging.getLogger('pdfminer').setLevel(logging.ERROR)
assert not (D/'PDF-CHECKS.json').exists(),'Completed correction is frozen; use a new revision'
plan=json.loads((D/'PDF-PLAN.json').read_text());sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
for p,h in plan['inputs'].items():assert sha(p)==h,p
spec=importlib.util.spec_from_file_location('reference',ROOT/'scripts/lib/pdf-reference-text.py');ref=importlib.util.module_from_spec(spec);spec.loader.exec_module(ref)
tree=ast.parse((ROOT/'scripts/assemble-whole-book-preview.py').read_text());exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='mult'],type_ignores=[]),'matrix','exec'))
readers={p:PdfReader(ROOT/p) for p in plan['inputs'] if p.endswith('.pdf')}

def cid_widths(font):
 descendant=font['/DescendantFonts'][0].get_object();values=descendant.get('/W',[]);widths={};i=0
 while i<len(values):
  start=int(values[i]);i+=1;value=values[i];i+=1
  if isinstance(value,list):
   widths.update({start+j:float(w) for j,w in enumerate(value)})
  else:
   end=int(value);width=float(values[i]);i+=1
   widths.update({cid:width for cid in range(start,end+1)})
 return widths,float(descendant.get('/DW',1000))

# Extend a subset only from an identical embedded Lilita face whose glyph set
# includes every original character. Verify glyph bytes and metrics first.
def glyph_bytes(data,gid):
 tables={}
 for i in range(struct.unpack_from('>H',data,4)[0]):
  tag,checksum,offset,length=struct.unpack_from('>4sIII',data,12+16*i);tables[tag]=(offset,length)
 head=tables[b'head'][0];long=struct.unpack_from('>h',data,head+50)[0]
 loca=tables[b'loca'][0];fmt='>I' if long else '>H';step=4 if long else 2;factor=1 if long else 2
 start=struct.unpack_from(fmt,data,loca+gid*step)[0]*factor;end=struct.unpack_from(fmt,data,loca+(gid+1)*step)[0]*factor
 offset=tables[b'glyf'][0];return data[offset+start:offset+end].rstrip(b'\0')

def embedded_lilita(reader):
 out=[];seen=set()
 def visit(obj):
  res=obj.get('/Resources',{})
  for f in res.get('/Font',{}).values():
   font=f.get_object()
   if font.get('/Subtype')=='/Type0' and 'LilitaOne' in str(font.get('/BaseFont')) and id(font) not in seen:seen.add(id(font));out.append(font)
  for ref in res.get('/XObject',{}).values():
   form=ref.get_object()
   if form.get('/Subtype')=='/Form':visit(form)
 for page in reader.pages:visit(page)
 return out

donors=[font for reader in readers.values() for font in embedded_lilita(reader)]

def ensure_glyphs(font,text,pdf):
 encoding,mapping=get_encoding(font);known={char:cid for cid,char in mapping.items() if isinstance(cid,str)}
 missing=set(text)-known.keys()
 if not missing:return
 desc=font['/DescendantFonts'][0].get_object();fd=desc['/FontDescriptor'].get_object();old_bytes=fd['/FontFile2'].get_object().get_data();widths,default=cid_widths(font)
 for donor in donors:
  enc,cmap=get_encoding(donor);other={char:cid for cid,char in cmap.items() if isinstance(cid,str)}
  if not (known.keys()|set(text))<=other.keys() or any(other[c]!=cid for c,cid in known.items()):continue
  d=donor['/DescendantFonts'][0].get_object();dfd=d['/FontDescriptor'].get_object();new_bytes=dfd['/FontFile2'].get_object().get_data();other_widths,other_default=cid_widths(donor)
  if any(widths.get(ord(cid),default)!=other_widths.get(ord(cid),other_default) or glyph_bytes(old_bytes,ord(cid))!=glyph_bytes(new_bytes,ord(cid)) for cid in known.values()):continue
  fd[NameObject('/FontFile2')]=dfd.raw_get('/FontFile2').clone(pdf)
  for c in sorted(missing):
   cid=ord(other[c]);desc['/W'].extend([NumberObject(cid),ArrayObject([FloatObject(other_widths.get(cid,other_default))])])
   unicode=font['/ToUnicode'].get_object();addition=f'1 beginbfchar\n<{cid:04X}> <{ord(c):04X}>\nendbfchar\n'.encode();unicode.set_data(unicode.get_data().replace(b'endcmap',addition+b'endcmap'))
  return
 raise AssertionError(('No exact superset font donor',text,missing))

def replace(obj,pdf,targets,cm=None):
 cm=list(cm or [1,0,0,1,0,0]);stack=[];tm=[1,0,0,1,0,0]
 stream=obj.get_contents() if isinstance(obj,PageObject) else ContentStream(obj,pdf)
 resources=obj.get('/Resources',{});fonts={k:v.get_object() for k,v in resources.get('/Font',{}).items()};maps={k:get_encoding(v) for k,v in fonts.items()}
 active=None;size=None;runs=[];blocks=[]
 for i,(args,op) in enumerate(stream.operations):
  if op==b'q':stack.append(cm[:])
  elif op==b'Q':cm=stack.pop()
  elif op==b'cm':cm=mult(list(map(float,args)),cm)
  elif op==b'BT':runs=[];tm=[1,0,0,1,0,0]
  elif op==b'Tf':active,size=args[0],float(args[1])
  elif op==b'Tm':tm=list(map(float,args))
  elif op in [b'Td',b'TD']:tm=mult([1,0,0,1,float(args[0]),float(args[1])],tm)
  elif op==b'Tj':
   enc,mapping=maps[active];v=args[0];raw=v.original_bytes if isinstance(v,str) else bytes(v)
   coded=raw.decode(enc) if isinstance(enc,str) else ''.join(enc.get(b,chr(b)) for b in raw)
   text=''.join(mapping.get(c,c) for c in coded);runs.append((i,text,active,size,mult(tm,cm)[4:]))
  elif op==b'TJ':raise AssertionError('Unexpected kerned array; inspect before editing')
  elif op==b'ET' and runs:
   text=''.join(r[1] for r in runs);x,y=runs[0][4]
   found=[t for t in targets if t['old']==text and abs(t['x']-x)<.03 and abs(t['y']-y)<.03]
   assert len(found)<=1
   if found:blocks.append((runs[:],found[0]))
  elif op==b'Do':
   form=resources['/XObject'][args[0]].get_object()
   if form.get('/Subtype')=='/Form':replace(form,pdf,targets,mult(list(map(float,form.get('/Matrix',[1,0,0,1,0,0]))),cm))
 for runs,t in reversed(blocks):
  assert not t.get('replaced'),t
  first,last=runs[0][0],runs[-1][0];fontkey,size=runs[0][2:4]
  assert all(r[2:4]==(fontkey,size) for r in runs)
  font=fonts[fontkey];assert font['/Subtype']=='/Type0' and 'LilitaOne' in str(font['/BaseFont'])
  ensure_glyphs(font,t['new'],pdf)
  encoding,mapping=get_encoding(font);assert encoding=='utf-16-be'
  reverse={char:cid for cid,char in mapping.items() if isinstance(cid,str)}
  missing=set(t['new'])-reverse.keys();assert not missing,('Missing original-font glyph',t['old'],missing)
  encoded=''.join(reverse[c] for c in t['new']).encode('utf-16-be')
  widths,default=cid_widths(font)
  width=sum(widths.get(ord(reverse[c]),default) for c in t['new'])*t['size']/1000
  assert t['x']+width<=t['availableRight']-.25,('New label overlaps adjacent text',t,width)
  t['checkRect']=t['rect'][:];t['checkRect'][2]=max(t['rect'][2],t['x']+width)
  assert all(op in [b'Tj',b'Td'] for args,op in stream.operations[first:last+1])
  stream.operations[first:last+1]=[([ByteStringObject(encoded)],b'Tj')]
  t['replaced']=True;t['newWidthPt']=width
 if blocks:
  if isinstance(obj,PageObject):obj.replace_contents(stream)
  else:obj.set_data(stream.get_data())

writer=PdfWriter();clones=[]
for p in plan['pages']:
 clone=PdfWriter();clones.append(clone);page=clone.add_page(readers[p['source']].pages[p['sourcePage']-1]);page.pop('/Annots',None)
 targets=[line for label in p['labels'] for line in label['lines'] if line['old']!=line['new']]
 with pdfplumber.open(ROOT/p['source']) as old_doc:
  old_page=old_doc.pages[p['sourcePage']-1]
  for t in targets:
   following=[c['x0'] for c in old_page.chars if not c['text'].isspace() and c['x0']>=t['rect'][2]-.01 and abs(c['matrix'][5]-t['y'])<.1]
   t['availableRight']=min(following) if following else old_page.width-22
 replace(page,clone,targets);assert all(t.get('replaced') for t in targets),('Missing replacements',p['key'],[t['old'] for t in targets if not t.get('replaced')])
 writer.add_page(page);p['replacementPage']=len(writer.pages)
 print(p['key'],len(targets),'lines',flush=True)
writer.add_metadata({'/Title':'The Vegetable Guru — sentence-case Key risks headings','/Author':'John Lennon','/Subject':'Native opening-page derivatives. Case only; source bodies and embedded font retained.'});writer.write(OUT)

sig=lambda c:(c['text'],round(c['x0'],3),round(c['top'],3),round(c['size'],3),str(c.get('non_stroking_color')))
def label_chars(page,lines):
 return [c for c in page.chars if any(t['rect'][0]-.02<=c['x0'] and c['x1']<=t.get('checkRect',t['rect'])[2]+.02 and t['rect'][1]-.02<=c['top']<=t['rect'][3]+.02 for t in lines)]
checks=[]
with pdfplumber.open(OUT) as after:
 for p in plan['pages']:
  with pdfplumber.open(ROOT/p['source']) as doc:
   old=doc.pages[p['sourcePage']-1];new=after.pages[p['replacementPage']-1]
   targets=[l for label in p['labels'] for l in label['lines'] if l['old']!=l['new']]
   assert Counter(map(sig,old.chars))-Counter(map(sig,label_chars(old,targets)))==Counter(map(sig,new.chars))-Counter(map(sig,label_chars(new,targets))),('Body changed outside labels',p['key'])
   for t in targets:
    cs=label_chars(new,[t]);assert ''.join(c['text'] for c in cs)==t['new'],(p['key'],t,''.join(c['text'] for c in cs))
    assert all(abs(c['size']-t['size'])<.02 and c['non_stroking_color']==tuple(t['colour']) and c['fontname']==t['font'] for c in cs)
    assert abs(cs[0]['x0']-t['x'])<.02 and abs(cs[0]['matrix'][5]-t['y'])<.02
   images=lambda page:[(i['x0'],i['top'],i['x1'],i['bottom'],i['srcsize'],hashlib.sha256(i['stream'].get_data()).hexdigest()) for i in page.images]
   assert images(old)==images(new),('Image changed',p['key'])
   checks.append({'key':p['key'],'folio':p['folio'],'labels':len(p['labels']),'changedLabels':sum(l['old']!=l['new'] for l in p['labels']),'allOtherGlyphsExact':True,'fontSizeColourBaselineRetained':True,'imagesExact':True,'noLabelTextCollision':True})
for p,h in plan['inputs'].items():assert sha(p)==h,p
plan.update(pdf=str(OUT.relative_to(ROOT)),sha256=sha(OUT.relative_to(ROOT)),checks=checks)
(D/'PDF-CHECKS.json').write_text(json.dumps(plan,indent=2)+'\n')
print(json.dumps({'pages':len(checks),'changedLabels':sum(c['changedLabels'] for c in checks),'pdf':plan['pdf']}))
