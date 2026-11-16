"""Three editable lettering trials in the unchanged T05 B composition."""
from pathlib import Path
import hashlib
import io
import json
import runpy

from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

OUT = Path(__file__).resolve().parent
BASE = OUT.parent
ROOT = BASE.parents[2]
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
baseline = json.loads((BASE / 'LAYOUTS.json').read_text())
old_b = baseline['layouts']['B']
VectorFont = runpy.run_path(str(BASE / 'font-outlines.py'))['VectorFont']
fonts = {
    'Lilita': VectorFont(ROOT / 'public/fonts/richer-a-1.woff2'),
    'Nunito600': VectorFont(ROOT / 'public/fonts/richer-a-6.woff2', 600),
    'Nunito800': VectorFont(ROOT / 'public/fonts/richer-a-6.woff2', 800),
    'Nunito900': VectorFont(ROOT / 'public/fonts/richer-a-6.woff2', 900),
}
photo_path = ROOT / baseline['source']
assert sha(photo_path) == baseline['source_sha256']
photo = Image.open(photo_path).convert('RGB')
assert photo.size == (3840, 2160)
photo_bytes = io.BytesIO()
photo.save(photo_bytes, format='JPEG', quality=96, subsampling=0)
photo_bytes.seek(0)
photo_reader = ImageReader(photo_bytes)
MM = 72 / 25.4
CW, CH = 185 * MM, 240 * MM
CREAM, INK, FOREST = '#fff8e9', '#173e2c', '#064d32'
variants = {
    'B1': {
        'name': 'Lilita One',
        'strap': 'The interior heading font',
        'note': 'Both main title lines use Lilita One. Smaller than trial A, with the clear space and frame of B.',
        'title': [('Vegetable', 'Lilita', 54, 38), ('Guru', 'Lilita', 74, 64)],
    },
    'B2': {
        'name': 'Nunito Sans',
        'strap': 'A quieter, consistent voice',
        'note': 'Both main title lines use Nunito Sans 900. A cleaner treatment using the interior supporting family.',
        'title': [('Vegetable', 'Nunito900', 48, 38), ('Guru', 'Nunito900', 70, 64)],
    },
    'B3': {
        'name': 'Combined lettering',
        'strap': 'Lilita character on one word',
        'note': 'Nunito Sans 800 for Vegetable, with Lilita One for Guru. A balance of restraint and familiar character.',
        'title': [('Vegetable', 'Nunito800', 48, 38), ('Guru', 'Lilita', 74, 64)],
    },
}
metadata = {
    'date': '2026-11-11',
    'status': 'Three proposed lettering trials; B composition preferred by John, lettering not approved',
    'base_layout': 'B - Forest frame',
    'base_manifest_sha256': sha(BASE / 'LAYOUTS.json'),
    'original_review_sha256': sha(BASE / 'Cover-layouts-review.pdf'),
    'source': baseline['source'],
    'source_sha256': baseline['source_sha256'],
    'trim_mm': [185, 240],
    'copy': baseline['copy'],
    'fixed_elements': ['T05 source pixels and crop', 'photo position and size', 'green field', 'cream frame', 'subtitle', 'author'],
    'type_treatment': 'Original local font vector outlines, no artificial weight or width modification. Sizes differ to compare similar visual widths. Cover text remains editable in this script, not selectable as PDF text.',
    'layouts': {},
}
c = canvas.Canvas(str(OUT / 'B-typography-review.pdf'), pagesize=(842, 595), pageCompression=1)
c.setTitle('The Vegetable Guru - B lettering trials')
c.setAuthor('Typography proposals for John Lennon')
current = None


def rect(x, y, w, h, colour):
    c.setFillColor(HexColor(colour))
    c.rect(x * MM, (240 - y - h) * MM, w * MM, h * MM, fill=1, stroke=0)


def label(text, face, size, baseline_mm, tracking=0):
    f = fonts[face]
    width = f.width(text, size, tracking)
    x = (CW - width) / 2
    assert x >= 12 * MM and x + width <= CW - 12 * MM
    c.setFillColor(HexColor(CREAM))
    f.draw(c, text, x, (240 - baseline_mm) * MM, size, tracking)
    metadata['layouts'][current]['text'].append({
        'text': text, 'font': face, 'point_size': size,
        'x_mm': round(x / MM, 3), 'baseline_from_top_mm': baseline_mm,
        'width_mm': round(width / MM, 3), 'tracking_pt': tracking,
    })


def framed_photo():
    x, y, w, h = old_b['photo']['panel_mm']
    crop_h, cx, cy = 1800, 2020, 0
    crop_w = crop_h * w / h
    crop_x = cx - crop_w / 2
    crop = [round(crop_x, 3), cy, round(crop_x + crop_w, 3), cy + crop_h]
    assert crop == old_b['photo']['source_crop_xyxy']
    scale = h * MM / crop_h
    c.saveState()
    p = c.beginPath()
    p.rect(x * MM, (240 - y - h) * MM, w * MM, h * MM)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(photo_reader, x * MM - crop_x * scale,
                (240 - y) * MM - (2160 - cy) * scale, 3840 * scale, 2160 * scale)
    c.restoreState()
    metadata['layouts'][current]['photo'] = old_b['photo']


for key, spec in variants.items():
    current = key
    metadata['layouts'][key] = {'name': spec['name'], 'text': []}
    c.beginForm(key, 0, 0, CW, CH)
    rect(0, 0, 185, 240, FOREST)
    label('The', 'Nunito800', 14, 17)
    for text, font, size, y in spec['title']:
        label(text, font, size, y)
    label(baseline['copy']['subtitle'], 'Nunito600', 12.5, 77)
    rect(11.5, 87.5, 162, 127, CREAM)
    framed_photo()
    label(baseline['copy']['author'], 'Nunito800', 17, 231, .65)
    c.endForm()

pdfmetrics.registerFont(TTFont('Review', '/System/Library/Fonts/Supplemental/Arial.ttf'))
pdfmetrics.registerFont(TTFont('ReviewBold', '/System/Library/Fonts/Supplemental/Arial Bold.ttf'))


def para(text, x, top, width, size=11, bold=False, colour=INK):
    p = Paragraph(text, ParagraphStyle('p', fontName='ReviewBold' if bold else 'Review',
                  fontSize=size, leading=size * 1.32, textColor=HexColor(colour)))
    _, h = p.wrap(width, 1000)
    p.drawOn(c, x, top - h)
    return top - h


def review_page(title, sub, number):
    c.setPageSize((842, 595))
    c.setFillColor(HexColor('#e9eddf'))
    c.rect(0, 0, 842, 595, fill=1, stroke=0)
    para('THE VEGETABLE GURU  /  B: LETTERING COMPARISON', 28, 575, 786, 9, True)
    para(title, 28, 550, 786, 27, True)
    para(sub, 28, 510, 786, 10, colour='#526158')
    para('11 November 2026 | Lettering proposals for review; original B preserved', 28, 22, 750, 8, colour='#526158')
    para(str(number), 798, 22, 16, 8)


def place(key, x, top, width):
    s = width / CW
    c.saveState()
    c.translate(x, top - CH * s)
    c.scale(s, s)
    c.doForm(key)
    c.restoreState()


review_page('One layout, three lettering treatments',
            'Same B composition, photograph, crop and wording. Pages 2-4 are individual 185 x 240 mm front panels.', 1)
for n, (key, spec) in enumerate(variants.items()):
    x = 28 + n * 267
    place(key, x, 478, 250)
    y = para(key + ' - ' + spec['name'], x, 142, 250, 14, True)
    y = para(spec['strap'], x, y - 7, 250, 10, True, '#a44007')
    para(spec['note'], x, y - 7, 250, 10)
c.showPage()
for key, spec in variants.items():
    c.setPageSize((CW, CH))
    c.bookmarkPage(key)
    c.addOutlineEntry(key + ' - ' + spec['name'], key, 0)
    c.doForm(key)
    c.showPage()

review_page('Which feels part of the same book?',
            'The title treatment changes; the approved interior below is reused unchanged.', 5)
for n, key in enumerate(variants):
    top = 478 - n * 144
    place(key, 28, top, 92)
    para(key, 126, top - 4, 25, 10, True)
interior_path = ROOT / baseline['context_spread']['path']
assert sha(interior_path) == baseline['context_spread']['sha256']
interior = Image.open(interior_path)
width = 650
height = width * interior.height / interior.width
c.drawImage(str(interior_path), 162, 478 - height, width, height)
para('Approved Greenhouse Tomato working spread, pages 92-93. Font relationship and thumbnail comparison.',
     162, 478 - height - 11, 650, 9, colour='#526158')
c.showPage()
c.save()
metadata['context_spread'] = baseline['context_spread']
metadata['font_inputs'] = {str(p.relative_to(ROOT)): sha(p) for p in [
    ROOT / 'public/fonts/richer-a-1.woff2', ROOT / 'public/fonts/richer-a-6.woff2']}
(OUT / 'TYPOGRAPHY.json').write_text(json.dumps(metadata, indent=2) + '\n')
print('Created five-page B typography review; B1/B2/B3 are 185 x 240 mm. All three photo crops match B exactly.')
