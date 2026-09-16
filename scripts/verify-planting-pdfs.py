"""Check real pilot exports against their pre-implementation PDFs and render QA pages."""
from pathlib import Path
import json
import re
import subprocess
from pypdf import PdfReader, PdfWriter

root=Path(__file__).resolve().parents[1]
out=root/'output/pdf/planting-production'
qa=out/'qa'
qa.mkdir(exist_ok=True)
baseline=json.loads((out/'baseline.json').read_text())
production=json.loads((out/'production.json').read_text())
assert len(baseline)==10 and len(production)==30
norm=lambda s: re.sub(r'\s+','',s).replace('–','-').replace('—','-')
checks=[]
for result in production:
    before=next(b for b in baseline if (b['crop'],b['units'])==(result['crop'],result['units']))
    old=PdfReader(out/before['file'])
    new=PdfReader(out/result['file'])
    assert len(old.pages)==2 and len(new.pages)==2, result['file']
    assert norm(old.pages[0].extract_text())==norm(new.pages[0].extract_text()), (result['file'],'changed page-one content')
    text=norm(new.pages[1].extract_text())
    for card in before['cards']:
        if card['title']=='SOWING & PLANTING':
            lines=card['text'].splitlines()
            first_number=next((i for i,line in enumerate(lines) if line.isdigit()),len(lines))
            lines=lines[first_number:]
        else:
            lines=card['text'].splitlines()
        for line in lines:
            if line.strip() and not line.isdigit():
                assert norm(line) in text, (result['file'],'baseline advice missing',line)
    # The runtime's final text includes dynamic measurements and optional notes.
    planting=next(c for c in result['cards'] if c['title']=='SOWING & PLANTING')
    for line in planting['text'].splitlines():
        if line.strip() and not line.isdigit():
            assert norm(line) in text, (result['file'],'new planting content missing',line)
    expected={'A4':(595,842),'A5':(420,595),'A6':(298,420)}[result['paper']]
    w,h=map(float,(new.pages[0].mediabox.width,new.pages[0].mediabox.height))
    assert abs(w-expected[0])<2 and abs(h-expected[1])<2,(result['file'],'paper size',w,h)
    checks.append({'file':result['file'],'pages':2,'paper':[w,h],'pageOneUnchanged':True,'baselineAdviceRetained':True,'plantingTextPresent':True,'layout':result['planting']})
    if result['paper']=='A4' or (result['units']=='metric' and result['crop'] in ['carrot','chicory']):
        subprocess.run(['/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm','-f','2','-l','2','-singlefile','-scale-to','1250','-png',str(out/result['file']),str(qa/Path(result['file']).stem)],check=True,capture_output=True)

writer=PdfWriter()
writer.add_metadata({'/Title':'Illustrated planting: five production pilots','/Subject':'Normal export output, A4 metric. Existing-column layout.'})
for crop in ['beetroot','carrot','potato','leek','chicory']:
    writer.append(out/f'{crop}-metric-A4-illustrated.pdf',outline_item=crop.capitalize())
with (out/'planting-pilots-A4-metric.pdf').open('wb') as stream: writer.write(stream)
assert len(PdfReader(out/'planting-pilots-A4-metric.pdf').pages)==10
(out/'verification.json').write_text(json.dumps({'checks':checks,'visualReview':'Recorded separately in docs/planting-illustrations/IMPLEMENTATION.md'},indent=2))
print('PASS: 30 real single-export PDFs, each two pages, correct paper size, original page-one content and baseline advice retained. Ten-page pilot review pack assembled.')
