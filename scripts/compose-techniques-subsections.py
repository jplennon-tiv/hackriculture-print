"""Replace bounded header text, mirror native bodies, and verify every glyph."""
from pathlib import Path
import ast,hashlib,json,sys,logging
import pdfplumber
from pypdf import PdfReader,PdfWriter,PageObject,Transformation
from pypdf.generic import ContentStream,RectangleObject,DecodedStreamObject,NameObject
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'docs/publication/techniques-subsections'
MM=72/25.4;W=185*MM;H=240*MM;HEADER_CUT=0
j=lambda p:json.loads((ROOT/p).read_text())
sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
write=lambda p,v:(ROOT/p).write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n')
config=j('src/print/book/techniques-subsections.json');sources=j('docs/publication/techniques-subsections/SOURCES.json')
inputs={p:sha(p) for p in ['src/print/book/techniques-subsections.json','docs/publication/techniques-subsections/SOURCES.json','public/fonts/richer-a-1.woff2','public/fonts/richer-a-6.woff2']}
editions={}
for units,items in sources['editions'].items():
 rows=[]
 for item in items:
  assert sha(item['pdf'])==item['sha256'],item['pdf'];inputs[item['pdf']]=item['sha256']
  with pdfplumber.open(ROOT/item['pdf']) as doc:
   for offset in range(item['physicalPages']):
    p=doc.pages[item['sourcePage']-1+offset];h=config['headers'].get(item['source'])
    title=[c for c in p.chars if c['size']>22 and c['top']<50*MM]
    eyebrow=[c for c in p.chars if c['top']<15*MM and c['size']<10]
    assert title and eyebrow,(units,item['source'])
    bottom=max(c['bottom'] for c in title)
    body_top=min(c['top'] for c in p.chars if c['top']>bottom+.1)
    cut=(bottom+body_top)/2 if h and h.get('main') else (max(c['bottom'] for c in eyebrow)+min(c['top'] for c in title))/2
    folio=item['folio']+offset;source_folio=item['sourceFolio']+offset
    actual_left=min(c['x0'] for c in eyebrow)/MM
    source_left=min([8,17],key=lambda n:abs(n-actual_left))
    assert abs(source_left-actual_left)<.2,('Unknown source margin',units,item['source'],actual_left)
    rows.append({'source':item['source'],'pdf':item['pdf'],'sha256':item['sha256'],'sourcePage':item['sourcePage']+offset,'sourceFolio':source_folio,'sourceLeftMm':source_left,'folio':folio,'headerCutPt':cut if h else 0,'firstBodyTopPt':body_top,'label':h['main']+' · '+h['qualifier'] if h and h.get('main') else item['label'],'dxMm':(17 if folio%2 else 8)-source_left})
 editions[units]=rows
assert all([r['folio'] for r in rows]==list(range(146,164)) for rows in editions.values())
if '--prepare' in sys.argv:
 write('docs/publication/techniques-subsections/PREPARED.json',{'editions':editions});print('Prepared 18 content pages per edition; no internal blanks.');sys.exit()
helper=ROOT/'scripts/assemble-whole-book-preview.py';tree=ast.parse(helper.read_text())
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ('mult','remove_footer')],type_ignores=[]),str(helper),'exec'))
headers=j('docs/publication/techniques-subsections/HEADERS.json');results=[]
for units,rows in editions.items():
 head=next(r for r in headers['proofs'] if r['units']==units)
 assert sha(head['pdf'])==head['sha256'];inputs[head['pdf']]=head['sha256'];inputs[head['html']]=head['htmlSha256']
 overlays=PdfReader(ROOT/head['pdf']);writer=PdfWriter();clones=[];readers={}
 for i,r in enumerate(rows):
  reader=readers.setdefault(r['pdf'],PdfReader(ROOT/r['pdf']))
  clone=PdfWriter();body=clone.add_page(reader.pages[r['sourcePage']-1]);clones.append(clone);body.pop('/Annots',None)
  assert remove_footer(body,clone)>0,('Missing footer',r)
  if r['headerCutPt']:
   HEADER_CUT=r['headerCutPt'];assert remove_footer(body,clone,header=True)>0,('Missing header',r)
  page=PageObject.create_blank_page(width=W,height=H)
  # A mirrored native background moves with its artwork; fill the uncovered edge.
  paper=DecodedStreamObject();paper.set_data(f'q 1 0.9725490196 0.9137254902 rg 0 0 {W} {H} re f Q'.encode())
  page[NameObject('/Contents')]=paper
  page.merge_transformed_page(body,Transformation().translate(r['dxMm']*MM,0));page.merge_page(overlays.pages[i])
  writer.add_page(page)
 pdf='output/pdf/techniques-subsections/techniques-'+units+'.pdf';writer.write(ROOT/pdf)
 checks=[]
 with pdfplumber.open(ROOT/pdf) as actual:
  assert len(actual.pages)==18
  for i,r in enumerate(rows):
   p=actual.pages[i];cut=r['headerCutPt']
   with pdfplumber.open(ROOT/r['pdf']) as original:
    old=original.pages[r['sourcePage']-1]
    a=[c for c in old.chars if c['top']>cut and c['y0']>12*MM]
    b=[c for c in p.chars if c['top']>cut and c['y0']>12*MM]
    assert len(a)==len(b),('Body length',units,r['folio'],len(a),len(b))
    for x,y in zip(a,b):
     assert x['text']==y['text'] and abs(x['size']-y['size'])<.03,('Body glyph/type',r['folio'])
     assert abs(x['x0']+r['dxMm']*MM-y['x0'])<.03 and abs(x['y0']-y['y0'])<.03,('Body position',r['folio'])
    assert len(old.images)==len(p.images),('Artwork',r['folio'])
   h=config['headers'].get(r['source']);text=p.extract_text()
   if h:
    norm=lambda s:''.join(s.split())
    assert norm('GROWING TECHNIQUES - '+h['running'].upper()) in norm(text)
    if h.get('main'):
     assert norm(h['main']+' '+h['qualifier']) in norm(text)
     head_chars=[c for c in p.chars if c['size']>22 and c['top']<50*MM]
     # Nutrients retains its approved compact header gap (about 0.86 mm).
     body_top=min(H-c['y1'] for c in a)
     assert max(c['bottom'] for c in head_chars)<body_top-.5*MM,('Heading collision',r['folio'])
   footer=min(c['top'] for c in p.chars if c['y0']<12*MM)
   gap=(footer-max(c['bottom'] for c in p.chars if c['y0']>12*MM))/MM
   assert gap>=2.95,('Footer collision',r['folio'],gap)
   left=17 if r['folio']%2 else 8
   assert all(c['x0']>=left*MM-.5 and c['x1']<=(left+160)*MM+.5 for c in p.chars),('Unsafe text edges',r['folio'])
   checks.append({'folio':r['folio'],'sourceFolio':r['sourceFolio'],'unchangedBodyGlyphs':len(a),'allBodySizesAndPositionsPreserved':True,'horizontalShiftMm':r['dxMm'],'images':len(p.images),'footerGapMm':gap,'headerChanged':bool(h)})
 results.append({'units':units,'pdf':pdf,'sha256':sha(pdf),'pages':rows,'checks':checks})
 print(units+': all 18 pages retain body glyphs, type, positions and artwork; requested headers fit.')
for p,h in inputs.items():assert sha(p)==h,p
entries=[]
for item in sources['editions']['imperial']:
 entries.append({'source':item['source'],'folio':item['folio'],'physicalPages':item['physicalPages'],'proofs':[{'units':r['units'],'pdf':r['pdf'],'sha256':r['sha256'],'sourcePage':item['folio']-145,'sourcePdfPages':18,'physicalPages':item['physicalPages']} for r in results]})
write('docs/publication/techniques-subsections/PREPARED.json',{'editions':editions})
write('docs/publication/techniques-subsections/MANIFEST.json',{'date':config['date'],'status':'Author-requested subsection headings and blank removal; for review','inputs':inputs,'entries':entries,'results':results,'canonicalDataChanged':False})
