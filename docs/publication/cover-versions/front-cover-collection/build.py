"""Read-only assembly of saved front covers: overview and six labelled A4 pages."""
from pathlib import Path
from io import BytesIO
import json, hashlib
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pypdf import PdfReader, PdfWriter, Transformation

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
VERSIONS = HERE.parent
OUTPUT = HERE / 'The-Vegetable-Guru-Front-Covers-Versions-1-to-6.pdf'
DESCRIPTIONS = {
    1: 'Photographic-style vegetables',
    2: 'Original garden photographs',
    3: 'Photo-based illustrations',
    4: 'Courgette illustration',
    5: 'Garlic and upper title',
    6: 'Offset title and raised sticker',
}
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
sources = {}
readers = {}
for n in range(1, 7):
    ext = 'png' if n == 1 else 'pdf'
    source = VERSIONS / f'version-{n}/Version-{n}.{ext}'
    sources[str(n)] = {'path': str(source.relative_to(ROOT)), 'sha256': sha(source), 'bytes': source.stat().st_size, 'description': DESCRIPTIONS[n]}
    if n == 1:
        b = BytesIO(); c = canvas.Canvas(b, pagesize=(185*mm, 240*mm))
        c.drawImage(str(source), 0, 0, 185*mm, 240*mm); c.showPage(); c.save()
        readers[n] = PdfReader(BytesIO(b.getvalue()))
    else:
        readers[n] = PdfReader(source)
    assert len(readers[n].pages) == 1, (n, 'Expected a single front cover')

def background(width, height, label, description=None, header_top=15):
    b = BytesIO(); c = canvas.Canvas(b, pagesize=(width*mm, height*mm))
    c.setFillColorRGB(1, 1, 1); c.rect(0, 0, width*mm, height*mm, fill=1, stroke=0)
    c.setFillColorRGB(.06, .23, .12); c.setFont('Helvetica-Bold', 16)
    c.drawString(12.5*mm, (height-header_top)*mm, label)
    if description:
        c.setFont('Helvetica', 10); c.setFillColorRGB(.3, .34, .3)
        c.drawString(12.5*mm, (height-header_top-8)*mm, description)
    return b, c

b, c = background(297, 210, 'The Vegetable Guru', 'Front-cover designs - Versions 1 to 6', header_top=10)
placements = {}
for n in range(1, 7):
    col, row = (n-1) % 3, (n-1) // 3
    x, y = 18 + col*99.5, 100.5 if row == 0 else 10
    width, height = 62, 62*240/185
    c.setFillColorRGB(.06, .23, .12); c.setFont('Helvetica-Bold', 10)
    c.drawString(x*mm, (y+height+3)*mm, f'Version {n}')
    placements[n] = [x, y, width, height]
c.showPage(); c.save()
overview = PdfReader(BytesIO(b.getvalue())).pages[0]
for n, (x, y, width, height) in placements.items():
    p = readers[n].pages[0]
    overview.merge_transformed_page(p, Transformation().scale(width*mm/float(p.mediabox.width), height*mm/float(p.mediabox.height)).translate(x*mm, y*mm))
w = PdfWriter(); w.add_page(overview); w.add_outline_item('All six front covers', 0)
for n in range(1, 7):
    b, c = background(210, 297, f'Version {n}', DESCRIPTIONS[n])
    c.showPage(); c.save()
    page = PdfReader(BytesIO(b.getvalue())).pages[0]
    source_page = readers[n].pages[0]
    page.merge_transformed_page(source_page, Transformation().scale(185*mm/float(source_page.mediabox.width), 240*mm/float(source_page.mediabox.height)).translate(12.5*mm, 18*mm))
    w.add_page(page); w.add_outline_item(f'Version {n}', n)
w.add_metadata({'/Title': 'The Vegetable Guru - Front Covers, Versions 1 to 6', '/Author': 'Prepared for John Lennon', '/Subject': 'Six saved front-cover designs, overview and individual pages; no back covers.'})
w.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
with OUTPUT.open('wb') as f: w.write(f)
for source in sources.values():
    assert sha(ROOT/source['path']) == source['sha256'], 'Source changed during assembly'
check = PdfReader(OUTPUT)
assert len(check.pages) == 7
record = {'date': '2026-11-16', 'scope': 'Saved numbered front covers 1–6 only; 4a is the retained development source of saved Version 6.', 'output': str(OUTPUT.relative_to(ROOT)), 'sha256': sha(OUTPUT), 'bytes': OUTPUT.stat().st_size, 'pages': 7, 'overview': {'page': 1, 'dimensions_mm': [297, 210], 'placements_mm': placements}, 'individual_pages': {'pages': [2, 3, 4, 5, 6, 7], 'dimensions_mm': [210, 297], 'cover_dimensions_mm': [185, 240]}, 'sources': sources, 'preservation': 'Saved source bytes unchanged. PDF fronts reused as PDF content; Version 1 wraps the exact saved PNG. No artwork regenerated. No back covers.'}
(HERE/'COLLECTION.json').write_text(json.dumps(record, indent=2, ensure_ascii=False)+'\n')
print(json.dumps({'file': str(OUTPUT), 'bytes': OUTPUT.stat().st_size, 'pages': len(check.pages)}))
