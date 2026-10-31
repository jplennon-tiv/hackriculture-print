"""Check and assemble the Brassica 25% larger-image comparison."""
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
EV = ROOT / 'docs/publication/troubles-image-size-study'
TMP = ROOT / 'tmp/pdfs/troubles-image-size-study'
OUT = ROOT / 'output/pdf/troubles-image-size-study/brassica-larger-images-comparison.pdf'
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
    for mode in ['current', 'larger']:
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
for mode, title in [('current', f'Previous image size: {MARGIN_MM} mm gap'), ('larger', f'Images 25% larger: {MARGIN_MM} mm gap')]:
    page = PdfReader(TMP / f'imperial-{mode}.pdf').pages[0]
    page.mediabox = RectangleObject([0, 0, 185 * 72 / 25.4, 240 * 72 / 25.4])
    page.cropbox = page.mediabox
    writer.add_page(page)
    writer.add_outline_item(title, len(writer.pages) - 1)
writer.add_metadata({'/Title': f'Brassica: images 25% larger, retaining the {MARGIN_MM} mm gap',
                     '/Subject': f'Folio 106. Page 1 previous image size; page 2 images enlarged by 25% in width and height. Both retain the {MARGIN_MM} mm gap. Review proposal only.'})
with OUT.open('wb') as f:
    writer.write(f)
subprocess.run(['pdftoppm', '-scale-to', '1600', '-png', str(OUT), str(EV / 'proof')], check=True)

pages = [Image.open(EV / f'proof-{i}.png').convert('RGB') for i in [1, 2]]
font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 25)
canvas = Image.new('RGB', (1140, 950), '#fff8e8')
draw = ImageDraw.Draw(canvas)
for x, title, page in [(10, f'Previous size - {MARGIN_MM} mm gap', pages[0]), (580, f'25% larger - {MARGIN_MM} mm gap', pages[1])]:
    draw.text((x + 12, 14), title, font=font, fill='#21452c')
    canvas.paste(page.crop((580, 270, 1130, 1150)), (x, 62))
canvas.save(EV / 'comparison-detail.png')

# Context review uses the unchanged saved render of the actual facing folio 107.
facing_path = ROOT / 'docs/publication/troubles-header-refinement/folio-107.png'
facing = Image.open(facing_path).convert('RGB').resize(pages[1].size, Image.Resampling.LANCZOS)
spread = Image.new('RGB', (pages[1].width * 2 + 12, pages[1].height), '#dce1d5')
spread.paste(pages[1], (0, 0))
spread.paste(facing, (pages[1].width + 12, 0))
spread.save(EV / 'trial-spread-106-107.jpg', quality=90)

report = {'scope': 'Brassica opening only; comparison PDF and unchanged facing-page context',
          'shapeMarginMm': MARGIN_MM, 'imageScale': 1.25,
          'checks': checks, 'trimMm': [185, 240], 'outputPages': len(PdfReader(OUT).pages),
          'output': str(OUT.relative_to(ROOT)), 'sha256': hashlib.sha256(OUT.read_bytes()).hexdigest(),
          'facingContextSource': str(facing_path.relative_to(ROOT)),
          'facingContextSha256': hashlib.sha256(facing_path.read_bytes()).hexdigest()}
(EV / 'PDF-CHECKS.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
