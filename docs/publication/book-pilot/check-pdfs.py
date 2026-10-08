"""Bounded PDF dimension/font check and preview rendering for this pilot only."""
from pathlib import Path

if (Path(__file__).resolve().parent / 'DESIGN-APPROVAL.json').exists():
    raise SystemExit('Approved compact-book reference is frozen. Render new working proofs separately; see docs/BOOK-PRINT-STYLE.md.')

import json
import shutil
import subprocess
from pypdf import PdfReader

pilot = Path(__file__).resolve().parent
root = pilot.parents[2]
output = root / 'output/pdf/publication-book-pilot'
previews = pilot / 'previews'
previews.mkdir(exist_ok=True)
renderer = shutil.which('pdftoppm')
assert renderer, 'Poppler pdftoppm is required'
report = []
for file in sorted(output.glob('*.pdf')):
    reader = PdfReader(file)
    expected = (210, 297) if file.stem.startswith('a4') else (185, 240)
    sizes = [(round(float(p.mediabox.width)*25.4/72, 2),
              round(float(p.mediabox.height)*25.4/72, 2)) for p in reader.pages]
    assert all(abs(w-expected[0]) < .3 and abs(h-expected[1]) < .3 for w, h in sizes), (file.name, sizes)
    fonts = {}
    for page in reader.pages:
        for ref in page['/Resources'].get('/Font', {}).values():
            font = ref.get_object()
            for child in font.get('/DescendantFonts', [font]):
                child = child.get_object()
                descriptor = child.get('/FontDescriptor', {})
                if hasattr(descriptor, 'get_object'):
                    descriptor = descriptor.get_object()
                fonts[str(font.get('/BaseFont'))] = child.get('/Subtype') == '/Type3' or any(
                    k in descriptor for k in ['/FontFile', '/FontFile2', '/FontFile3'])
    assert all(fonts.values()), fonts
    subprocess.run([renderer, '-r', '110', '-png', str(file), str(previews/file.stem)], check=True)
    for old in previews.glob(file.stem+'-*.png'):
        if int(old.stem.rsplit('-', 1)[1]) > len(reader.pages):
            old.unlink()
    report.append({'file': file.name, 'pages': len(reader.pages), 'sizesMm': sizes, 'embeddedFonts': fonts})
(pilot/'PDF-CHECKS.json').write_text(json.dumps(report, indent=2)+'\n')
print([(x['file'], x['pages'], x['sizesMm'][0]) for x in report])
