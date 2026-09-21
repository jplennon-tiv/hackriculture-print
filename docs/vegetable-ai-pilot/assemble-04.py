from pathlib import Path
from pypdf import PdfReader, PdfWriter
import json, subprocess
root=Path(__file__).resolve().parents[2]
scratch=root/'tmp/pdfs/vegetable-batch-04'
checks=json.loads((root/'docs/vegetable-ai-pilot/batch-04-checks.json').read_text())
writer=PdfWriter()
for key in ['cauliflower','kale','kohl_rabi']:
    for units in ['metric','imperial']:
        c=next(c for c in checks if c['key']==key and c['units']==units)
        assert c['pages']==2 and not c['warnings'] and not c['missing'] and not c['error'],(key,units,c['warnings'])
        assert all(a['column_bottom_gap_px']<=1 for a in c['alignment'])
        reader=PdfReader(scratch/f'{key}-{units}.pdf')
        assert len(reader.pages)==2
        text='\n'.join(p.extract_text() for p in reader.pages)
        (scratch/f'{key}-{units}.txt').write_text(text)
        compact=''.join(text.lower().split())
        assert 'finaltips' in compact
        assert not any(w in compact for w in ['permethrin','heptenophos','thiophanate','mancozeb','lindane','cheshunt'])
        if units=='metric':writer.append(reader,outline_item=key.replace('_',' ').title())
out=root/'output/pdf/vegetable-batch-04-review.pdf';writer.write(out)
assert len(PdfReader(out).pages)==6
poppler='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
subprocess.run([poppler,'-scale-to','1450','-png',str(out),str(scratch/'review')],check=True)
subprocess.run([poppler,'-f','2','-l','2','-scale-to','1450','-png',str(scratch/'kohl_rabi-imperial.pdf'),str(scratch/'kohl-imperial')],check=True)
print(out)
