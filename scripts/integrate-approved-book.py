"""Assemble the current requested order using exact, preserved PDF bodies.

This replaces the legacy full-preview route. No guide or topic is regenerated.
The current contents plan owns every final folio, including later focused copy proofs.
"""
from pathlib import Path
import ast, gc, hashlib, json, logging, re
from collections import Counter
from pypdf import PdfReader, PdfWriter, PageObject, Transformation
from pypdf.generic import ContentStream, RectangleObject
from pypdf.annotations import Link
import pdfplumber
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'docs/publication/whole-book-order-preview';I=D/'integration-2026-10-18'
OUT=ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
CANDIDATE=ROOT/'tmp/pdfs/whole-book-order-preview/integrated.pdf'
MM=72/25.4;W=185*MM;H=240*MM
logging.getLogger('pdfminer').setLevel(logging.ERROR)
j=lambda p:json.loads((ROOT/p).read_text())
sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
write=lambda p,v:(ROOT/p).write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n')
relative=lambda p:str(p.relative_to(ROOT))
base=relative(I/'baseline.pdf');assert sha(base)=='39d437e8571d92aca177c31a2da4e2f371dada19a5f66465e4826678ac747cd6'
oldmap=j(relative(I/'baseline-PAGE-MAP.json'))
plan=j('docs/publication/contents-update/ASSEMBLY-PROPOSAL.json');e=plan['editions']['imperial'];total=e['plannedEvenTotal'];index_start=e['index']['startPage'];index_end=e['index']['endPage'];assert total==168 and index_start==164
section='docs/publication/techniques-sequence/references/approved-2026-10-18/growing-techniques.pdf'
section_map=j('docs/publication/techniques-sequence/references/approved-2026-10-18/PAGE-MAP.json')
assert sha(section)=='31f6607ad253ba30eb4d9819c833fbfd4085d2d0253bcbc6296018332a5db1a6'
toc=next(r for r in j('docs/publication/contents-update/CHECKS.json')['results'] if r['units']=='imperial')
idx=j('docs/publication/whole-book-order-preview/index/CHECKS.json');assert idx['pages']==4
resolved=j('docs/publication/whole-book-order-preview/index/RESOLVED.json');assert resolved['identicalEditionReferences']
foot=j(relative(I/'FOOTERS.json'));nav=foot['navigation'];nav_pages={p['folio']:p for p in nav['pages']}
key=j('docs/publication/reader-edit-pass/navigation/PROOF-MANIFEST.json')['units']['imperial']['guide-key']['clean']
inputs={base:sha(base),section:sha(section),toc['pdf']:toc['sha256'],idx['pdf']['path']:idx['pdf']['sha256'],foot['pdf']:foot['sha256'],key['pdf']:key['sha256']}
inputs.update(nav['inputs'])
for d in e['documents']:
 if d.get('readerApprovedReplacement'):inputs[d['pdf']]=d['sha256']
topic_edits={}
subsection_path='docs/publication/techniques-subsections/MANIFEST.json'
subsection=j(subsection_path);inputs[subsection_path]=sha(subsection_path);inputs.update(subsection['inputs'])
subproof=next(r for r in subsection['results'] if r['units']=='imperial')
inputs[subproof['pdf']]=subproof['sha256']
for i,r in enumerate(subproof['pages']):
 topic_edits[r['folio']]={'folio':r['folio'],'label':r['label'],'kind':'technique','source':subproof['pdf'],'sourcePage':i+1}
assert sorted(topic_edits)==list(range(146,index_start))
for d in e['additions']:
 if d['source']=='technique:why-grow':continue
 entry=next(x for x in subsection['entries'] if x['source']==d['source'])
 assert entry['folio']==d['startPage'] and d['pdf']==subproof['pdf'] and d['sha256']==subproof['sha256']
canonical={p:h for p,h in nav['inputs'].items() if p.startswith('../hackriculture-data/vegetables/') or p.startswith('../hackriculture-data/troubles/')}
assert len(canonical)==58
for p,h in inputs.items():assert sha(p)==h,p
# Import only the recursive footer-removal helpers; never run the old assembler.
helper=ROOT/'scripts/assemble-whole-book-preview.py';tree=ast.parse(helper.read_text())
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ('mult','remove_footer')],type_ignores=[]),str(helper),'exec'))
readers={};clones=[];records=[];comparisons=[];removed=0
reader=lambda p:readers.setdefault(p,PdfReader(ROOT/p)) if p not in readers else readers[p]
writer=PdfWriter();footerreader=reader(foot['pdf']);footers={p['folio']:footerreader.pages[i] for i,p in enumerate(foot['pages'])}
for p in footers.values():p.pop('/Annots',None)
replacements={}
for d in e['documents']:
 if d.get('readerApprovedReplacement'):
  for i in range(d['physicalPages']):replacements[d['startPage']+i]=(d['pdf'],i+1)
specs=[dict(oldmap[0],source=base,sourcePage=1),dict(oldmap[1],source=base,sourcePage=2)]
for f in range(1,total+1):
 if f<=144:
  r=dict(oldmap[f+1],source=base,sourcePage=f+2)
  if f in replacements:r.update(source=replacements[f][0],sourcePage=replacements[f][1])
  if f==9:r.update(source=key['pdf'],sourcePage=1)
  if f in [4,5]:r.update(source=toc['pdf'],sourcePage=f-3)
 elif f==145:
  s=section_map[0];r={'folio':f,'label':s['label'],'kind':s['kind'],'source':section,'sourcePage':1}
 elif f in topic_edits:r=topic_edits[f]
 elif index_start<=f<=index_end:r={'folio':f,'label':'Index'+(' — continued' if f>index_start else ''),'kind':'index','source':idx['pdf']['path'],'sourcePage':f-index_start+1}
 else:r={'folio':f,'label':'Blank — end balancing page','kind':'blank','source':base,'sourcePage':168}
 specs.append(r)
specs.extend([dict(oldmap[-2],source=base,sourcePage=169),dict(oldmap[-1],source=base,sourcePage=170)])
for spec in specs:
 f=spec['folio'];original=reader(spec['source']).pages[spec['sourcePage']-1]
 clone=PdfWriter();body=clone.add_page(original);clones.append(clone);body.pop('/Annots',None)
 # The two contents pages carry 3 mm production bleed; all other sources are trim-sized.
 trim=original.trimbox;dx=-float(trim.left);dy=-float(trim.bottom)
 page=PageObject.create_blank_page(width=W,height=H)
 page.merge_transformed_page(body,Transformation().translate(dx,dy))
 if f in footers:
  n=remove_footer(page,clone);assert n>0,('Missing old footer',f);removed+=n
 if f in footers:page.merge_page(footers[f])
 added=writer.add_page(page)
 for box in ['mediabox','cropbox','trimbox']:setattr(added,box,RectangleObject([0,0,W,H]))
 r={k:spec[k] for k in ['folio','label','kind','source','sourcePage']};r['pdfPage']=len(records)+1;records.append(r)
 comparisons.append(dict(r,dx=dx,dy=dy))
 if f and f%30==0:print('Assembled page',f,flush=True)
assert len(writer.pages)==total+4
links=[]
def link(f,target,rect,kind):
 assert 1<=target<=total
 a=writer.add_annotation(f+1,Link(rect=rect,target_page_index=target+1));a['/Dest'][0]=writer.pages[target+1].indirect_reference
 links.append({'folio':f,'target':target,'kind':kind})
for p in nav['pages']:
 for l in p['links']:link(p['folio'],l['target'],(l['left']*MM,H-l['bottom']*MM,l['right']*MM,H-l['top']*MM),'see-also')
entry_folios={entry:index_start+i for i,p in enumerate(idx['dom']) for entry in p['entryIds']}
for i,p in enumerate(reader(idx['pdf']['path']).pages):
 for ref in p.get('/Annots',[]):
  a=ref.get_object();target=None
  if '/A' in a:
   m=re.search(r'#page=(\d+)$',a['/A'].get('/URI',''))
   if m:target=int(m[1])-2
  elif '/Dest' in a:target=entry_folios.get(str(a['/Dest']).removeprefix('/entry-'))
  assert target is not None,dict(a)
  link(index_start+i,target,tuple(a['/Rect']),'index')
normal=lambda s:re.sub(r'\s+','',s).replace('\u00ad','')
for ref in toc['references']:
 matches=[]
 for d in toc['dom']:
  for b in d['blocks']:
   if normal(b['text'])==normal(ref['label']):
    nums=[n for n in d['blocks'] if n['text']==str(ref['startPage']) and abs(n['top']-b['top'])<2]
    if len(nums)==1:matches.append((d['folio'],b,nums[0]))
 assert len(matches)==1,('Contents link missing',ref,matches)
 f,b,n=matches[0];link(f,ref['startPage'],(b['left']*MM,H-max(b['bottom'],n['bottom'])*MM,n['right']*MM,H-min(b['top'],n['top'])*MM),'contents')
# Three explicit cross-references in approved topic bodies; preserve their wording.
body_refs=[]
for f,pattern,target in [(147,r'pages 148[–-]149',148),(149,r'pages 40[–-]41',40),(163,r'pages 56[–-]59',56)]:
 spec=records[f+1]
 with pdfplumber.open(ROOT/spec['source']) as doc:
  hits=doc.pages[spec['sourcePage']-1].search(pattern);assert len(hits)==1,(f,hits)
  m=hits[0];link(f,target,(m['x0'],H-m['bottom'],m['x1'],H-m['top']),'body-reference');body_refs.append({'folio':f,'text':m['text'],'target':target})
writer.add_outline_item('Front cover — G2',0)
opening=writer.add_outline_item('Opening pages',2)
for f in [1,2,4,7]:writer.add_outline_item(records[f+1]['label'],f+1,parent=opening)
parents={}
for d in e['sectionOpeners']:parents[d['source']]=writer.add_outline_item(d['label'],d['startPage']+1)
writer.add_outline_item('Vegetable guides — how to use',10,parent=parents['opening:varieties'])
for d in e['documents']:writer.add_outline_item(d['label'],d['startPage']+1,parent=parents['opening:varieties' if d['type']=='vegetable' else 'opening:troubles'])
labels={r['source']:r['label'] for r in toc['references'] if 'source' in r}
for d in e['additions']:
 if d['source']!='technique:why-grow':writer.add_outline_item(labels[d['source']],d['startPage']+1,parent=parents['opening:techniques'])
writer.add_outline_item('Index',index_start+1);writer.add_outline_item('Back cover — B5',total+3)
writer.set_page_label(0,0,prefix='Front cover');writer.set_page_label(1,1,prefix='Inside front cover');writer.set_page_label(2,total+1,style='/D',start=1);writer.set_page_label(total+2,total+2,prefix='Inside back cover');writer.set_page_label(total+3,total+3,prefix='Back cover')
writer.page_layout='/TwoPageRight';writer.page_mode='/UseOutlines'
writer.add_metadata({'/Title':'The Vegetable Guru — Complete book preview','/Author':'John Lennon','/Subject':'Author-requested changes integrated 19 October 2026; 168 interior pages plus four cover leaves. Imperial screen review.'})
writer.write(CANDIDATE);del writer;clones.clear();gc.collect()
# Verify every reused body against its exact PDF source, including coordinates and type size.
body_checks=[];footer_checks=[];numeric_body_refs=[];sources={}
with pdfplumber.open(CANDIDATE) as final:
 for r in comparisons:
  current=final.pages[r['pdfPage']-1];f=r['folio'];name=r['source']
  if name not in sources:sources[name]=pdfplumber.open(ROOT/name)
  before=sources[name].pages[r['sourcePage']-1]
  old=[c for c in before.chars if c['y0']+r['dy']>12*MM]
  new=[c for c in current.chars if c['y0']>12*MM]
  assert len(old)==len(new),('Body length',f,len(old),len(new))
  for a,b in zip(old,new):
   assert a['text']==b['text'] and abs(a['size']-b['size'])<.03,('Body glyph',f,a['text'],b['text'])
   assert abs(a['x0']+r['dx']-b['x0'])<.03 and abs(a['y0']+r['dy']-b['y0'])<.03,('Body coordinates',f)
  assert len(before.images)==len(current.images),('Images',f)
  body_checks.append({'folio':f,'pdfPage':r['pdfPage'],'glyphs':len(new),'images':len(current.images),'textSizeAndPositionsPreserved':True})
  if r['kind']=='blank':assert not current.chars,('Blank has text',f)
  if f in nav_pages:
   text=current.crop((0,228*MM,W,H)).extract_text() or '';expected=nav_pages[f]
   assert normal(expected['label']) in normal(text) and normal(text).endswith(str(f)),('Footer',f,text)
   bottom=max((c['bottom'] for c in current.chars if c['y0']>12*MM),default=0)
   top=min(c['top'] for c in current.chars if c['y0']<12*MM)
   assert (top-bottom)/MM>=2.95,('Footer clearance',f,(top-bottom)/MM)
   footer_checks.append({'folio':f,'bodyToFooterMm':(top-bottom)/MM,'links':len(expected['links'])})
  if f and r['kind'] not in ['index','contents','blank']:
   text=current.crop((0,0,W,228*MM)).extract_text(x_tolerance=1,y_tolerance=2) or ''
   numeric_body_refs.extend({'folio':f,'text':m.group(0)} for m in re.finditer(r'\bpages?\s+\d+(?:[–-]\d+)?',text))
  current.close()
 for source in sources.values():source.close()
# Resolve every reference independently against the placement plan.
registry={d['type']+':'+d['key']:d for d in e['documents']};registry.update({d['source']:d for d in e['additions']});registry.update({d['source']:d for d in e['sectionOpeners']});registry.update({'opening:how-to':{'startPage':9},'back:index':e['index']})
for r in toc['references']:assert registry[r.get('source') or r['type']+':'+r['key']]['startPage']==r['startPage']
numeric=0
for entry in resolved['editions']['imperial']:
 for r in entry['references']:
  d=registry[r['source']];offset=r['page']-(d.get('sourcePage') or 1)
  assert r['folio']==d['startPage']+offset and not r['prefix'],('Index reference',r)
  numeric+=1
with pdfplumber.open(CANDIDATE) as final:
 mentioned={}
 for decision in nav['decisions']:
  for l in decision['links']:
   assert [x['folio'] for x in l['evidence']]==list(range(l['start'],l['end']+1))
   for evidence in l['evidence']:
    f=evidence['folio'];assert registry[evidence['source']]['startPage']+evidence['offset']==f
    if f not in mentioned:mentioned[f]=re.sub(r'[^a-z0-9]+',' ',(final.pages[f+1].extract_text(x_tolerance=1,y_tolerance=2) or '').lower())
    assert re.search(r'\b'+re.escape(evidence['term'])+r'\b',mentioned[f]),('Missing crop mention',decision['key'],f)
result=PdfReader(CANDIDATE);ids={p.indirect_reference.idnum:i for i,p in enumerate(result.pages)};actual=[];fonts={}
def check_fonts(resources,stream):
 used=set();active=None
 for args,op in stream.operations if stream else []:
  if op==b'Tf':active=args[0]
  elif op in (b'Tj',b'TJ',b"'",b'"') and active:
   values=args[0] if op==b'TJ' else args
   if any(isinstance(v,(str,bytes)) and len(v) for v in values):used.add(active)
 for key,ref in resources.get('/Font',{}).items():
  if key not in used:continue
  font=ref.get_object();name=str(font.get('/BaseFont',font.get('/Name','Type3')))
  if font.get('/Subtype')=='/Type3':assert font.get('/CharProcs')
  else:
   for child in font.get('/DescendantFonts',[font]):
    desc=child.get_object().get('/FontDescriptor',{});assert any(k in desc for k in ['/FontFile','/FontFile2','/FontFile3']),name
  fonts[name]=True
 for ref in resources.get('/XObject',{}).values():
  obj=ref.get_object()
  if obj.get('/Subtype')=='/Form':check_fonts(obj.get('/Resources',{}),ContentStream(obj,result))
for i,p in enumerate(result.pages):
 assert abs(float(p.mediabox.width)-W)<.01 and abs(float(p.mediabox.height)-H)<.01
 check_fonts(p.get('/Resources',{}),p.get_contents())
 for ref in p.get('/Annots',[]):
  a=ref.get_object();assert '/A' not in a;actual.append((i-1,ids[a['/Dest'][0].idnum]-1))
assert Counter(actual)==Counter((l['folio'],l['target']) for l in links)
assert all(d['physicalPages']==2 and d['startPage']%2==0 for d in e['documents'] if d['type']=='vegetable')
assert [d['startPage'] for d in e['sectionOpeners']]==[9,99,145]
assert sorted(b['page'] for b in e['extraBlanks'])==[3,6,8,98,168]
for p,h in inputs.items():assert sha(p)==h,p
CANDIDATE.replace(OUT)
receipt={'date':'2026-10-19','status':'Approved changes integrated; actual PDF checks passed','pdf':relative(OUT),'sha256':sha(relative(OUT)),'bytes':OUT.stat().st_size,'units':'imperial','interiorPages':total,'pdfPages':total+4,'trimMm':[185,240],'folioMapping':'PDF page = interior folio + 2','guidesReexported':0,'guidePagesReused':133,'readerEditedGuidePages':len(replacements),'bodyPagesVerified':len(body_checks),'updatedFootersVerified':len(footer_checks),'contentsReferences':len(toc['references']),'indexEntries':idx['entries'],'indexSeeReferences':idx['crossReferences'],'indexNumericReferencesVerified':numeric,'internalIndexLinks':sum(l['kind']=='index' for l in links),'internalContentsLinks':sum(l['kind']=='contents' for l in links),'bodyReferences':body_refs,'blankFolios':[3,6,8,98,168],'sourceFilesUnchanged':True,'canonicalGardeningRecordsUnchanged':len(canonical),'navigation':{'internalLinks':sum(l['kind']=='see-also' for l in links),'pagesWithLinks':sum(bool(p['links']) for p in nav['pages']),'pageChecks':footer_checks,'highlights':'None'},'limits':['Screen preview; not a supplier upload.','Full assembled edition is imperial; contents and index references checked in both units.','Publication metadata placeholders retained. Final stock, print-resolution export, preflight, cover wrap and physical proof remain separate work.']}
if topic_edits:
 receipt['status']='Approved baseline plus John-requested subsection grouping and internal blank removal; actual PDF checks passed; revised pages for review'
 receipt['finalCopyEditFolios']=[146,152,157,158]
 receipt['subsectionRevisionFolios']=sorted(topic_edits)
 receipt['subsectionManifest']=subsection_path
write(relative(D/'CHECKS.json'),receipt);write(relative(D/'PAGE-MAP.json'),records)
write(relative(I/'INTEGRATION-CHECKS.json'),{'pdfSha256':receipt['sha256'],'inputs':inputs,'bodyChecks':body_checks,'bodyReferencesFound':numeric_body_refs,'fontsEmbedded':list(fonts),'oldFooterTextObjectsRemoved':removed,'allLinks':links,'canonicalRecords':canonical,'priorSourcesPreserved':True})
write(relative(D/'NAVIGATION-PDF-CHECKS.json'),{'date':'2026-10-19','status':'passed','pdfSha256':receipt['sha256'],'linksByKind':dict(Counter(l['kind'] for l in links)),'actualDestinationPagesMentionChecked':len(mentioned),'cropsWithoutLinks':[d['key'] for d in nav['decisions'] if not d['links']],'minimumBodyToFooterMm':min(p['bodyToFooterMm'] for p in footer_checks),'fontsEmbedded':True,'numericBodyReferences':numeric_body_refs})
write(relative(D/'SEQUENCE-CHECKS.json'),{'date':'2026-10-19','pdfSha256':receipt['sha256'],'interiorPages':total,'firstLeaves':records[:11],'sectionStartFolios':[9,99,145],'sectionStartSides':['recto']*3,'vegetableFacingPairs':44,'techniqueFacingPairs':[[f,f+1] for f in range(146,index_start,2)],'blankFolios':receipt['blankFolios'],'indexFolios':[index_start,index_end]})
write(relative(D/'COMPONENT-CHECKS.json'),{'date':'2026-10-19','status':'Current integration; supersedes earlier component regeneration route','pdfSha256':receipt['sha256'],'integrationReceipt':relative(I/'INTEGRATION-CHECKS.json'),'sourcePlan':'docs/publication/contents-update/ASSEMBLY-PROPOSAL.json','approvedTechniques':'docs/publication/techniques-sequence/APPROVAL-2026-10-18.json','approvedReaderEdits':'docs/publication/reader-edit-pass/APPROVAL-2026-10-16.json','baseline':base,'copyUpdate':relative(I/'BOOK-COPY-UPDATE.json')})
print(json.dumps({k:receipt[k] for k in ['pdfPages','interiorPages','bytes','readerEditedGuidePages','contentsReferences','indexEntries','indexNumericReferencesVerified']}))
