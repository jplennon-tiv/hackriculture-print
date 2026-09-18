"""Assemble all metric results; report pagination instead of withholding drafts."""
from pathlib import Path
import json
import subprocess
from pypdf import PdfReader, PdfWriter

root=Path(__file__).resolve().parents[1]
out=root/'output/pdf/planting-rollout05'
results=json.loads((out/'results.json').read_text())
writer=PdfWriter()
counts=[]
qa=out/'qa'
qa.mkdir(exist_ok=True)
renderer='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
for item in results:
    item['review']=item['review'] is True or item['review']=='true'
    source=out/item['file']
    reader=PdfReader(source)
    pages=len(reader.pages)
    counts.append({'crop':item['crop'],'pages':pages,'review':item['review'],'layout':item['layout']})
    writer.append(source,outline_item=item['crop'].replace('_',' ').title()+(' - layout review' if item['review'] else ''))
    if item['crop'] in ['beet_leaf','bean_runner','marrow_courgette','cucumber_outdoor']:
        subprocess.run([renderer,'-f','2','-singlefile','-scale-to','1150','-png',str(source),str(qa/item['crop'])],check=True,capture_output=True)
writer.add_metadata({'/Title':'Planting rollout 05 - all seven review results','/Subject':'Metric A4. Three labelled layout-review drafts plus four normal illustrated guides.'})
with (out/'planting-rollout05-A4-metric.pdf').open('wb') as stream:
    writer.write(stream)
(out/'page-counts.json').write_text(json.dumps(counts,indent=2))
(out/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(counts,indent=2))
print('Review pack pages:',len(writer.pages))
