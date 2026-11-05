from pathlib import Path
import json, hashlib
import numpy as np
import pypdfium2 as pdfium
from PIL import ImageChops, ImageStat
from pypdf import PdfReader
root=Path(__file__).resolve().parents[2];d=root/'docs/publication/sowing-rollout'
r=sorted([json.loads(p.read_text()) for p in (d/'checks').glob('*.json')],key=lambda p:p['imperial']['folio'])
assert len(r)==39
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
sample=root/'docs/publication/sowing-planting-mockups'
for key in ('carrot','leek','beetroot','potato','tomato_outdoor'):
    for f,h in json.loads((sample/f'{key}-revision/APPROVAL.json').read_text())['files'].items():assert digest(root/f)==h,f
for f,h in json.loads((sample/'conventional/CHECKS.json').read_text())['inputs'].items():
    if 'the-vegetable-guru-order-preview.pdf' in f:assert digest(root/f)==h
summary={}
for unit in ('imperial','metric'):
    path=root/f'output/pdf/sowing-rollout/vegetable-guides-review-{unit}.pdf'
    merged=pdfium.PdfDocument(path);diffs=[]
    for i,row in enumerate(r):
        info=row[unit];k=info['key'];working=pdfium.PdfDocument(root/info['pdf'])
        assert digest(root.parent/f'hackriculture-data/vegetables/{k}/{k}.json')==info['masterHash']
        assert digest(root/f'tmp/sowing-rollout/{k}-{unit}.html')==info['baselineHash']
        for n in (0,1):
            a=working[n];b=merged[2*i+n]
            text_a=a.get_textpage();text_b=b.get_textpage()
            assert text_a.get_text_range()==text_b.get_text_range(),(k,unit,n)
            text_a.close();text_b.close()
            x=a.render(scale=1.1).to_pil().convert('RGB');y=b.render(scale=1.1).to_pil().convert('RGB')
            diffs.append(max(ImageStat.Stat(ImageChops.difference(x,y)).rms))
            a.close();b.close()
        working.close()
    merged.close()
    assert max(diffs)<6,(unit,max(diffs))
    summary[unit]={'pagesCompared':len(diffs),'selectableTextMatches':True,'maxPageChannelRmsOf255':round(max(diffs),2),'bytes':path.stat().st_size}
(d/'DELIVERY-CHECKS.json').write_text(json.dumps(summary,indent=2)+'\n')
print(summary)
