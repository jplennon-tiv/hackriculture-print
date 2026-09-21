from pathlib import Path
from pypdf import PdfReader, PdfWriter
import json, subprocess

root=Path(__file__).resolve().parents[2]
scratch=root/'tmp/pdfs/vegetable-widgets'
checks=json.loads((root/'docs/vegetable-ai-pilot/widget-checks.json').read_text())
keys=['broccoli','brussels_sprouts','cabbage','radish','beetroot','carrot','lettuce','bean_broad','bean_french','bean_runner','asparagus','celery']
writer=PdfWriter()
for key in keys:
    for units in ['metric','imperial']:
        check=next(c for c in checks if c['key']==key and c['units']==units)
        assert check['pages']==2 and not check['warnings'] and not check['missing'] and not check['error'], (key,units,check['warnings'])
        assert all(a['column_bottom_gap_px']<=1 for a in check['alignment']),key
        reader=PdfReader(scratch/f'{key}-{units}.pdf')
        assert len(reader.pages)==2
        text='\n'.join(p.extract_text() for p in reader.pages)
        (scratch/f'{key}-{units}.txt').write_text(text)
        assert 'FINALTIPS' in ''.join(reader.pages[1].extract_text().split())
        assert not any(s in ''.join(text.lower().split()) for s in ['permethrin','heptenophos','mancozeb','lindane','pirimicarb','carbendazim'])
        if key=='brussels_sprouts':
            compact=''.join(text.lower().split())
            assert 'nov' in compact and 'feb' in compact and '28' in compact and '36' in compact
        if key=='radish':
            assert ('15–20cm' if units=='metric' else '6–8in.') in ''.join(text.split())
        if units=='metric':writer.append(reader,outline_item=key.replace('_',' ').title())
out=root/'output/pdf/vegetable-widgets-review.pdf'
writer.write(out)
assert len(PdfReader(out).pages)==24
poppler='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
for key in ['brussels_sprouts','bean_french','radish','celery','cabbage']:
    for units in ['metric','imperial']:
        subprocess.run([poppler,'-scale-to','1450','-png',str(scratch/f'{key}-{units}.pdf'),str(scratch/f'{key}-{units}')],check=True)
print(out)
