"""Split exact approved spreads for assembly; preserve original proofs and source JSON."""
from pathlib import Path
import json,hashlib
from pypdf import PdfReader,PdfWriter
ROOT=Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
read=lambda p:json.loads((ROOT/p).read_text())
folder=ROOT/'docs/publication/whole-book-order-preview/integration-2026-10-15';folder.mkdir(exist_ok=True)
if not (folder/'ORIGINAL-INPUTS.json').exists():
 nav=read('docs/publication/whole-book-order-preview/NAVIGATION.json')
 original={p:h for p,h in nav['inputs'].items() if p.startswith('../hackriculture-data/')}
 for p in (ROOT/'../hackriculture-data/book-layout').glob('*.json'):
  rel='../hackriculture-data/book-layout/'+p.name;original[rel]=sha(rel)
 for p,h in original.items():assert sha(p)==h,p
 (folder/'ORIGINAL-INPUTS.json').write_text(json.dumps(original,indent=2)+'\n')
records=[];inputs={}
for base,pairs in [('vegetable-two-page-review',[('carrot','carrot',0),('onion_shallot','onions_and_shallots',2)]),('tomato-two-page-review',[('tomato_greenhouse','tomato_greenhouse',0),('tomato_outdoor','tomato_outdoor',2)])]:
 approval='docs/publication/'+base+'/APPROVAL.json';a=read(approval);inputs[approval]=sha(approval)
 for p,h in a['inputs'].items():assert sha(p)==h,p
 for unit,pdf in a['pdfs'].items():
  assert sha(pdf['path'])==pdf['sha256'];inputs[pdf['path']]=pdf['sha256'];source=PdfReader(ROOT/pdf['path']);assert len(source.pages)==4
  for key,slug,start in pairs:
   out=f'output/pdf/approved-two-page-guides/{unit}/{slug}.pdf';(ROOT/out).parent.mkdir(parents=True,exist_ok=True)
   writer=PdfWriter()
   for n in [start,start+1]:writer.add_page(source.pages[n])
   writer.write(ROOT/out);actual=PdfReader(ROOT/out);assert len(actual.pages)==2
   for i,page in enumerate(actual.pages):assert page.extract_text()==source.pages[start+i].extract_text()
   records.append({'units':unit,'key':key,'slug':slug,'pdf':out,'sha256':sha(out),'physicalPages':2,'approval':approval,'approvedSource':pdf['path'],'sourcePages':[start+1,start+2]})
for p,h in read(str((folder/'ORIGINAL-INPUTS.json').relative_to(ROOT))).items():assert sha(p)==h,p
(folder/'APPROVED-GUIDES.json').write_text(json.dumps({'date':'2026-10-15','status':'Exact approved PDF pages split for full-book integration; no layout or copy changes','inputs':inputs,'records':records},indent=2)+'\n')
print('Prepared eight exact two-page guide PDFs from the four approved layouts in both units.')
