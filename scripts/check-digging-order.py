"""Validate and render only the author-requested two-page digging revision."""
from pathlib import Path
from collections import Counter
import json, subprocess, logging
import pdfplumber
from PIL import Image

logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'docs/publication/digging-order'
manifest=json.loads((D/'CHECKS.json').read_text())
book=ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
old=[]
with pdfplumber.open(book) as pdf:
    for n in [159,160]:
        page=pdf.pages[n]
        # The assembler replaces source footers; compare body and source notes.
        chars=[c for c in page.chars if c['top']<227*72/25.4]
        if n==159:
            match=page.search(r'Finish the bed on the next page\.',return_chars=True)
            if match:
                assert len(match)==1
                omitted={id(c) for c in match[0]['chars']}
                chars=[c for c in chars if id(c) not in omitted]
        old.extend(chars)
def glyphs(chars):
    return Counter((c['text'],round(c['size'],2)) for c in chars if c['text'].strip())
base=glyphs(old);results=[]
for proof in manifest['results']:
    units=proof['units'];path=ROOT/proof['pdf']
    with pdfplumber.open(path) as pdf:
        assert len(pdf.pages)==2
        actual=glyphs([c for p in pdf.pages for c in p.chars if c['top']<227*72/25.4])
        assert actual==base,{'missing':dict(base-actual),'added':dict(actual-base)}
        first,second=[p.extract_text() for p in pdf.pages]
        assert 'Single digging: the annual job' not in first
        assert 'Single digging: the annual job' in second
        assert 'Fill the final gap' in first and 'Settle and plant' in first
        assert 'Smothering' in second
    subprocess.run(['/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm','-r','140','-png',str(path),str(D/units)],check=True)
    images=[Image.open(D/f'{units}-{i}.png').convert('RGB') for i in [1,2]]
    images=[im.resize((650,round(im.height*650/im.width))) for im in images]
    spread=Image.new('RGB',(1314,max(i.height for i in images)),'#d9dfcf')
    spread.paste(images[0],(0,0));spread.paste(images[1],(664,0))
    spread.save(D/f'{units}-spread.png')
    results.append({'units':units,'pdf':proof['pdf'],'sha256':proof['sha256'],'pages':2,'allBodyGlyphsAndFontSizesPreserved':True,'allFiveDoubleDiggingStepsOn158':True,'singleDiggingAndSmotheringOn159':True})
identical=all(Image.open(D/f'imperial-{n}.png').tobytes()==Image.open(D/f'metric-{n}.png').tobytes() for n in [1,2])
report={'date':'2026-10-18','status':'passed','results':results,'unitRendersPixelIdentical':identical,'omitted':'Only the obsolete Finish the bed on the next page navigation sentence.','footerScope':'Source-proof footers use the retained CSS; final assembly replaces them with current book navigation footers.'}
(D/'PDF-CHECKS.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
