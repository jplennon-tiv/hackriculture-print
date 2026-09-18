"""Check real pilot exports against their pre-implementation PDFs and render QA pages."""
from pathlib import Path
import json
import re
import subprocess
import sys
from pypdf import PdfReader, PdfWriter

root=Path(__file__).resolve().parents[1]
rollout='04' if '--rollout04' in sys.argv else '03' if '--rollout03' in sys.argv else '02' if '--rollout02' in sys.argv else '01' if '--rollout01' in sys.argv else None
batch=bool(rollout)
out=root/(f'output/pdf/planting-rollout{rollout}' if batch else 'output/pdf/planting-production')
qa=out/'qa'
qa.mkdir(exist_ok=True)
baseline=json.loads((out/'baseline.json').read_text())
production=json.loads((out/'production.json').read_text())
assert len(baseline)==(10 if rollout=='04' else 12 if batch else 10) and len(production)==(6 if rollout=='04' else 10 if rollout=='03' else 12 if batch else 30)
norm=lambda s: re.sub(r'\s+','',s).replace('–','-').replace('—','-')
corrections=json.loads((root.parent/f'hackriculture-data/provenance/planting-rollout{rollout}-rhs-2026-09-16.json').read_text())['changes'] if rollout in ['01','02'] else []
def corrected(text,crop):
    value=norm(text)
    for change in corrections:
        if change['path'].startswith(crop+'.') and isinstance(change['before'],str):
            value=value.replace(norm(change['before']),norm(change['after']))
    return value
def embedded_fonts(resources):
    names=set()
    for font in resources.get('/Font',{}).values():
        item=font.get_object()
        descriptor=item.get('/FontDescriptor')
        names.add(str(item.get('/BaseFont') or (descriptor.get_object().get('/FontName') if descriptor else None)))
    for obj in resources.get('/XObject',{}).values():
        item=obj.get_object()
        if '/Resources' in item: names.update(embedded_fonts(item['/Resources']))
    return names
checks=[]
for result in production:
    before=next(b for b in baseline if (b['crop'],b['units'])==(result['crop'],result['units']))
    old=PdfReader(out/before['file'])
    new=PdfReader(out/result['file'])
    fonts=sorted(set().union(*(embedded_fonts(page['/Resources']) for page in new.pages)))
    assert any('Inter' in f for f in fonts),(result['file'],'Inter font absent',fonts)
    if batch: assert result['planting'].endswith(':images'),(result['file'],'expected illustrated rollout, not text fallback')
    assert len(old.pages)==2 and len(new.pages)==2, result['file']
    assert corrected(old.pages[0].extract_text(),result['crop'])==norm(new.pages[0].extract_text()), (result['file'],'unexpected changed page-one content')
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
                assert corrected(line,result['crop']) in text, (result['file'],'baseline advice missing',line)
    # The runtime's final text includes dynamic measurements and optional notes.
    planting=next(c for c in result['cards'] if c['title']=='SOWING & PLANTING')
    for line in planting['text'].splitlines():
        if line.strip() and not line.isdigit():
            assert norm(line) in text, (result['file'],'new planting content missing',line)
    expected={'A4':(595,842),'A5':(420,595),'A6':(298,420)}[result['paper']]
    w,h=map(float,(new.pages[0].mediabox.width,new.pages[0].mediabox.height))
    assert abs(w-expected[0])<2 and abs(h-expected[1])<2,(result['file'],'paper size',w,h)
    checks.append({'file':result['file'],'pages':2,'paper':[w,h],'pageOneUnchangedExceptRecordedCorrections':True,'baselineAdviceRetainedExceptRecordedCorrections':True,'plantingTextPresent':True,'layout':result['planting'],'fonts':fonts})
    if result['paper']=='A4' or (result['units']=='metric' and result['crop'] in ['carrot','chicory']):
        subprocess.run(['/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm','-f','2','-l','2','-singlefile','-scale-to','1250','-png',str(out/result['file']),str(qa/Path(result['file']).stem)],check=True,capture_output=True)
    if batch and result['units']=='metric':
        subprocess.run(['/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm','-f','1','-l','1','-singlefile','-scale-to','1250','-png',str(out/result['file']),str(qa/(Path(result['file']).stem+'-front'))],check=True,capture_output=True)

writer=PdfWriter()
writer.add_metadata({'/Title':f'Illustrated planting: rollout {rollout}' if batch else 'Illustrated planting: five production pilots','/Subject':'Normal export output, A4 metric. Existing-column layout.'})
crops=['bean_broad','bean_french','sweet_corn'] if rollout=='04' else ['garlic','onion_shallot','lettuce','endive','oriental_leaves'] if rollout=='03' else ['broccoli','brussels_sprouts','cabbage','cauliflower','kale','kohl_rabi'] if rollout=='02' else ['parsnip','radish','turnip','swede','spinach','salsify_scorzonera'] if batch else ['beetroot','carrot','potato','leek','chicory']
for crop in crops:
    writer.append(out/f'{crop}-metric-A4-illustrated.pdf',outline_item=crop.capitalize())
pack=f'planting-rollout{rollout}-A4-metric.pdf' if batch else 'planting-pilots-A4-metric.pdf'
with (out/pack).open('wb') as stream: writer.write(stream)
assert len(PdfReader(out/pack).pages)==len(crops)*2
(out/'verification.json').write_text(json.dumps({'checks':checks,'visualReview':'Recorded separately in docs/planting-illustrations/'+(f'ROLLOUT-{rollout}.md' if batch else 'IMPLEMENTATION.md')},indent=2))
print(f'PASS: {len(checks)} real single-export PDFs, each two pages, correct paper size and Inter font; page-one content and baseline advice retained except documented source corrections. {len(crops)*2}-page review pack assembled.')
