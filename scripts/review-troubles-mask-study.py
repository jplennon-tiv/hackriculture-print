"""Check and assemble the bounded Brassica wrapping comparison."""
from pathlib import Path
from collections import Counter
import hashlib
import json
import logging
import subprocess

import pdfplumber
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
from PIL import Image, ImageDraw, ImageFont

logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT = Path(__file__).resolve().parents[1]
EV = ROOT / 'docs/publication/troubles-mask-study'
TMP = ROOT / 'tmp/pdfs/troubles-mask-study'
OUT = ROOT / 'output/pdf/troubles-mask-study/brassica-mask-comparison.pdf'
if (ROOT / 'docs/publication/troubles-image-size-study/APPROVAL.json').exists():
    raise SystemExit('Frozen approved specimen: use the separate full-guide preview workflow')
OUT.parent.mkdir(parents=True, exist_ok=True)
MARGIN_MM = json.loads((EV / 'CHECKS.json').read_text())['shapeMarginMm']


def image_hashes(resources):
    images = []
    for ref in resources.get('/XObject', {}).get_object().values() if '/XObject' in resources else []:
        obj = ref.get_object()
        if obj.get('/Subtype') == '/Image':
            images.append((int(obj['/Width']), int(obj['/Height']), hashlib.sha256(obj.get_data()).hexdigest()))
        elif obj.get('/Subtype') == '/Form' and '/Resources' in obj:
            images.extend(image_hashes(obj['/Resources']))
    return sorted(images)


checks = []
for units in ['imperial', 'metric']:
    variants = []
    for mode in ['current', 'masked']:
        filename = TMP / f'{units}-{mode}.pdf'
        with pdfplumber.open(filename) as doc:
            assert len(doc.pages) == 1
            p = doc.pages[0]
            glyphs = Counter((c['text'], round(c['size'], 2)) for c in p.chars if not c['text'].isspace())
        images = image_hashes(PdfReader(filename).pages[0]['/Resources'])
        assert len(images) == 4
        variants.append((glyphs, images))
    assert variants[0] == variants[1], f'Changed text, type size or embedded artwork: {units}'
    checks.append({'units': units, 'onePagePerVariant': True,
                   'glyphsAndTypeSizesPreserved': True, 'embeddedImagesIdentical': 4})

writer = PdfWriter()
for mode, title in [('current', 'Current rectangular wrapping'), ('masked', f'Separate-mask wrapping: {MARGIN_MM} mm gap')]:
    page = PdfReader(TMP / f'imperial-{mode}.pdf').pages[0]
    page.mediabox = RectangleObject([0, 0, 185 * 72 / 25.4, 240 * 72 / 25.4])
    page.cropbox = page.mediabox
    writer.add_page(page)
    writer.add_outline_item(title, len(writer.pages) - 1)
writer.add_metadata({'/Title': f'Brassica: current layout and {MARGIN_MM} mm mask trial',
                     '/Subject': f'Folio 106. Page 1 current rectangular wrap; page 2 separate alpha-mask wrap with {MARGIN_MM} mm gap. Review proposal only.'})
with OUT.open('wb') as f:
    writer.write(f)
subprocess.run(['pdftoppm', '-scale-to', '1600', '-png', str(OUT), str(EV / 'proof')], check=True)

pages = [Image.open(EV / f'proof-{i}.png').convert('RGB') for i in [1, 2]]
font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 25)
canvas = Image.new('RGB', (1140, 850), '#fff8e8')
draw = ImageDraw.Draw(canvas)
for x, title, page in [(10, 'Current rectangular wrap', pages[0]), (580, f'Separate mask: {MARGIN_MM} mm gap', pages[1])]:
    draw.text((x + 12, 14), title, font=font, fill='#21452c')
    canvas.paste(page.crop((580, 270, 1130, 1050)), (x, 62))
canvas.save(EV / 'comparison-detail.png')

# Context review uses the unchanged saved render of the actual facing folio 107.
facing_path = ROOT / 'docs/publication/troubles-header-refinement/folio-107.png'
facing = Image.open(facing_path).convert('RGB').resize(pages[1].size, Image.Resampling.LANCZOS)
spread = Image.new('RGB', (pages[1].width * 2 + 12, pages[1].height), '#dce1d5')
spread.paste(pages[1], (0, 0))
spread.paste(facing, (pages[1].width + 12, 0))
spread.save(EV / 'trial-spread-106-107.jpg', quality=90)

report = {'scope': 'Brassica opening only; comparison PDF and unchanged facing-page context',
          'shapeMarginMm': MARGIN_MM,
          'checks': checks, 'trimMm': [185, 240], 'outputPages': len(PdfReader(OUT).pages),
          'output': str(OUT.relative_to(ROOT)), 'sha256': hashlib.sha256(OUT.read_bytes()).hexdigest(),
          'facingContextSource': str(facing_path.relative_to(ROOT)),
          'facingContextSha256': hashlib.sha256(facing_path.read_bytes()).hexdigest()}
(EV / 'PDF-CHECKS.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
