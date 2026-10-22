"""Check the four requested headings against the retained body text and type."""
from pathlib import Path
from collections import Counter
import json, subprocess, logging, re
import pdfplumber
from PIL import Image

logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'docs/publication/cultivation-headings'
manifest=json.loads((D/'CHECKS.json').read_text())
book=ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
edit=json.loads((ROOT/'src/print/book/final-text-edits/digging.json').read_text())
lead=re.sub(r'</?b>','',edit['lead'])
def phrase(page,text):
    return page.search(r'\s+'.join(re.escape(s) for s in text.split()),return_chars=True)
# The title is the only text above 22 pt. Omit running titles and replaced footers.
def body(page,skip_edits=False):
    removed=set()
    if skip_edits:
        for choices in [[lead,edit['beforeLead']],[edit['doubleTitle'],edit['beforeDoubleTitle']]]:
            for text in choices:
                matches=phrase(page,text)
                if matches:
                    assert len(matches)==1,(text,len(matches))
                    removed.update(id(c) for c in matches[0]['chars'])
                    break
            else:raise AssertionError('Expected source/replacement copy missing: '+str(choices))
    return Counter((c['text'],round(c['size'],2)) for c in page.chars
                   if id(c) not in removed and c['text'].strip() and c['size']<22 and 16*72/25.4<c['top']<227*72/25.4)
with pdfplumber.open(book) as pdf:
    imperial=[body(pdf.pages[n],n==159) for n in range(157,161)]
approval=json.loads((ROOT/'docs/publication/topic-pages/cultivation-dig-no-dig/APPROVAL.json').read_text())
frozen=ROOT/next(f['path'] for f in approval['files'] if f['path'].endswith('metric.pdf') and 'approved-2026-10-08' in f['path'])
with pdfplumber.open(frozen) as pdf:
    metric=[body(p) for p in pdf.pages[:2]]
with pdfplumber.open(ROOT/'output/pdf/digging-order/digging-metric.pdf') as pdf:
    metric.extend(body(p,i==0) for i,p in enumerate(pdf.pages))
titles=['CultivationDigorNo-Dig?','CultivationNo-Dig','CultivationDigging','CultivationDiggingcontinued']
results=[]
for proof in manifest['results']:
    units=proof['units'];path=ROOT/proof['pdf'];base=imperial if units=='imperial' else metric
    with pdfplumber.open(path) as pdf:
        assert len(pdf.pages)==4
        for i,p in enumerate(pdf.pages):
            actual=body(p,i==2)
            assert actual==base[i], {'units':units,'folio':156+i,'missing':dict(base[i]-actual),'added':dict(actual-base[i])}
            heading=[c for c in p.chars if c['size']>22 and c['text'].strip()]
            assert ''.join(c['text'] for c in heading)==titles[i]
            for c in heading:
                colour=tuple(round(v*255) for v in c['non_stroking_color'])
                assert colour==((23,62,44) if c['size']>30 else (164,64,7)), colour
            assert abs(p.width-185*72/25.4)<1 and abs(p.height-240*72/25.4)<1
        texts=[p.extract_text() for p in pdf.pages]
        assert 'Single digging: the annual job' not in texts[2] and 'Single digging: the annual job' in texts[3]
        assert 'Fill the final gap' in texts[2] and 'Settle and plant' in texts[2]
        assert 'Smothering' in texts[3]
        page=pdf.pages[2]
        assert len(phrase(page,lead))==1 and len(phrase(page,edit['doubleTitle']))==1
        regular_fonts={c['fontname'] for c in phrase(page,'There are two ways of digging:')[0]['chars'] if c['text'].strip()}
        emphasis=[]
        for word in ['Single digging','Double digging']:
            hit=phrase(page,word)[0]
            fonts={c['fontname'] for c in hit['chars'] if c['text'].strip()}
            assert not fonts.intersection(regular_fonts),(word,fonts,regular_fonts)
            emphasis.append({'text':word,'fonts':sorted(fonts)})
    subprocess.run(['/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm','-r','140','-png',str(path),str(D/units)],check=True)
    for a,b in [(1,2),(3,4)]:
        images=[Image.open(D/f'{units}-{i}.png').convert('RGB') for i in [a,b]]
        images=[im.resize((650,round(im.height*650/im.width))) for im in images]
        spread=Image.new('RGB',(1314,max(i.height for i in images)),'#d9dfcf')
        spread.paste(images[0],(0,0));spread.paste(images[1],(664,0))
        spread.save(D/f'{units}-spread-{155+a}-{155+b}.png')
    results.append({'units':units,'pdf':proof['pdf'],'sha256':proof['sha256'],'pages':4,'unchangedBodyGlyphsAndFontSizesPreserved':True,'exactHeadingsAndColours':True,'diggingOrderPreserved':True,'exactIntroductionAndDoubleDiggingHeading':True,'boldEmphasis':emphasis})
report={'date':'2026-10-18','status':'passed','results':results,'copyEdits':'src/print/book/final-text-edits/digging.json','scope':'All four actual pages in both units; unchanged body glyph/type comparison against current imperial book, approved metric cultivation source and previous reordered metric digging proof. Requested introduction and double-digging title checked separately, including distinct bold PDF fonts. Header text/colour checked in PDF; source footers excluded from body comparison.'}
(D/'PDF-CHECKS.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
