from pathlib import Path
from pypdf import PdfReader, PdfWriter
import subprocess
root = Path(__file__).resolve().parents[2]
scratch = root / 'tmp/pdfs/vegetable-earlier-pests'
out = root / 'output/pdf/vegetable-earlier-pests-review.pdf'
writer = PdfWriter()
for crop in ('radish','beetroot','carrot','lettuce','bean_broad','bean_french','bean_runner'):
    for units in ('metric','imperial'):
        reader=PdfReader(scratch/f'{crop}-{units}.pdf')
        assert len(reader.pages)==2, (crop,units,len(reader.pages))
        text=''.join(''.join(p.extract_text().split()) for p in reader.pages).lower()
        assert 'finaltips' in text
        assert not any(x in text for x in ('permethrin','heptenophos','mancozeb','lindane','cheshunt','pirimicarb'))
        if units=='metric': writer.append(reader,outline_item=crop.replace('_',' ').title())
writer.write(out)
assert len(PdfReader(out).pages)==14
subprocess.run(['/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm','-scale-to','1250','-png',str(out),str(scratch/'review')],check=True)
print(out)
