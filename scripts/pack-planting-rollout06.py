"""Assemble all metric results; report pagination instead of withholding drafts."""
from pathlib import Path
import json
import subprocess
from pypdf import PdfReader, PdfWriter

root=Path(__file__).resolve().parents[1]
out=root/'output/pdf/planting-rollout06'
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
    if item['crop'] in ['asparagus','mushroom']:
        subprocess.run([renderer,'-f','2','-singlefile','-scale-to','1150','-png',str(source),str(qa/item['crop'])],check=True,capture_output=True)
writer.add_metadata({'/Title':'Planting rollout 06 - final twelve review results','/Subject':'Metric A4. Twelve labelled POC layout-review drafts; pagination not final.'})
with (out/'planting-rollout06-A4-metric.pdf').open('wb') as stream:
    writer.write(stream)
(out/'page-counts.json').write_text(json.dumps(counts,indent=2))
(out/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(counts,indent=2))
print('Review pack pages:',len(writer.pages))
