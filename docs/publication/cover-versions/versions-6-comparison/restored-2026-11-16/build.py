"""Rebuild the comparison using a common clean base and lossless PDF overlays.

Writes only this revision directory. Does not edit source images or saved fronts.
"""
from pathlib import Path
from io import BytesIO
import hashlib
import json
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pypdf import PdfReader, PdfWriter, Transformation
from pypdf.generic import NameObject, BooleanObject

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
BASE = ROOT / 'generated_images/exec-df679729-f2e0-445a-8c36-443fd445d2cf.png'
OVERLAY = ROOT / 'generated_images/exec-f936ef10-07a0-47ba-9e33-4298c2306942.png'
OUTPUT = HERE / 'The-Vegetable-Guru-Versions-6-6-1-6-2.pdf'
IDS = ['6', '6-1', '6-2']
W, H = 1100, 1430
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
source_hashes = {str(p.relative_to(ROOT)): sha(p) for p in [BASE, OVERLAY]}
originals = [ROOT / f'docs/publication/cover-versions/version-{n}/Version-{n}.{ext}'
             for n in IDS for ext in ['png', 'pdf']]
original_hashes = {str(p.relative_to(ROOT)): sha(p) for p in originals}
assert all(Image.open(p).size == (W, H) for p in [BASE, OVERLAY])


def smooth_display(page):
    # A PDF display hint only: preserves every source pixel, avoiding nearest-
    # neighbour jaggies when a viewer displays these rasters at another scale.
    def visit(resources):
        for ref in resources.get('/XObject', {}).values():
            obj = ref.get_object()
            if obj.get('/Subtype') == '/Image':
                obj[NameObject('/Interpolate')] = BooleanObject(True)
            elif obj.get('/Subtype') == '/Form':
                visit(obj.get('/Resources', {}))
    visit(page.get('/Resources', {}))


def draw_cover(c, version):
    c.saveState()
    c.scale(185 * mm / W, 240 * mm / H)
    c.drawImage(str(BASE), 0, 0, W, H)
    if version in ['6-1', '6-2']:
        # Triangle includes the existing ribbon and its small external shadow.
        c.saveState()
        p = c.beginPath()
        p.moveTo(0, H)
        p.lineTo(270, H)
        p.lineTo(0, H - 255)
        p.close()
        c.clipPath(p, stroke=0, fill=0)
        c.drawImage(str(OVERLAY), 0, 0, W, H)
        c.restoreState()
    if version == '6-2':
        # Circle retains the restored sticker pixels and subtle exterior shadow.
        c.saveState()
        p = c.beginPath()
        p.circle(182, H - 1293, 102)
        c.clipPath(p, stroke=0, fill=0)
        c.drawImage(str(OVERLAY), 0, 0, W, H)
        c.restoreState()
    c.restoreState()


readers = {}
for n in IDS:
    path = HERE / f'Version-{n}-clean.pdf'
    c = canvas.Canvas(str(path), pagesize=(185*mm, 240*mm), pageCompression=1)
    c.setTitle(f'The Vegetable Guru — Version {n}, cleaned artwork')
    c.setAuthor('John Lennon')
    draw_cover(c, n)
    c.showPage()
    c.save()
    native = PdfReader(path, strict=True)
    smooth_display(native.pages[0])
    single = PdfWriter()
    single.add_page(native.pages[0])
    single.add_metadata({'/Title':f'The Vegetable Guru — Version {n}, cleaned artwork', '/Author':'John Lennon'})
    with path.open('wb') as f:
        single.write(f)
    readers[n] = PdfReader(path, strict=True)


def page_base(width, height, title, subtitle):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=(width*mm, height*mm))
    c.setFillColorRGB(1, 1, 1)
    c.rect(0, 0, width*mm, height*mm, stroke=0, fill=1)
    c.setFillColorRGB(.06, .23, .12)
    c.setFont('Helvetica-Bold', 16)
    c.drawString(12.5*mm, (height-15)*mm, title)
    c.setFillColorRGB(.30, .34, .30)
    c.setFont('Helvetica', 10)
    c.drawString(12.5*mm, (height-23)*mm, subtitle)
    return buffer, c


buffer, c = page_base(297, 210, 'The Vegetable Guru',
                      'Front-cover comparison — Versions 6, 6-1 and 6-2 | Cleaned artwork')
placements = {}
captions = {'6': 'Original arrangement', '6-1': 'Adds the red organic ribbon',
            '6-2': 'Adds the Traditional Measurements sticker'}
for i, n in enumerate(IDS):
    x, y, width = 10 + i*94.5, 49, 88
    height = width * 240 / 185
    c.setFillColorRGB(.06, .23, .12)
    c.setFont('Helvetica-Bold', 12)
    c.drawString(x*mm, (y+height+5)*mm, 'Version '+n)
    c.setFont('Helvetica', 8.5)
    c.setFillColorRGB(.30, .34, .30)
    c.drawString(x*mm, (y-6)*mm, captions[n])
    placements[n] = [x, y, width, height]
c.showPage()
c.save()
overview = PdfReader(BytesIO(buffer.getvalue())).pages[0]
for n, (x, y, width, height) in placements.items():
    p = readers[n].pages[0]
    overview.merge_transformed_page(p, Transformation().scale(width/185, height/240).translate(x*mm, y*mm))
writer = PdfWriter()
writer.add_page(overview)
writer.add_outline_item('Side-by-side comparison', 0)
for i, n in enumerate(IDS, 1):
    buffer, c = page_base(210, 297, 'Version '+n, 'Cleaned artwork — '+captions[n])
    c.showPage()
    c.save()
    page = PdfReader(BytesIO(buffer.getvalue())).pages[0]
    page.merge_transformed_page(readers[n].pages[0], Transformation().translate(12.5*mm, 18*mm))
    writer.add_page(page)
    writer.add_outline_item('Version '+n, i)
writer.add_metadata({'/Title':'The Vegetable Guru — Versions 6, 6-1 and 6-2 — Cleaned artwork',
                     '/Author':'John Lennon', '/Subject':'Cleaned comparison: overview and three full-size fronts.'})
writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
for page in writer.pages:
    smooth_display(page)
with OUTPUT.open('wb') as f:
    writer.write(f)

pdf = PdfReader(OUTPUT, strict=True)
assert len(pdf.pages) == 4
expected_pixels = [Image.open(p).convert('RGB').tobytes() for p in [BASE, OVERLAY]]
for i, page in enumerate(pdf.pages):
    for embedded in page.images:
        assert embedded.image.size == (W, H)
        assert embedded.image.convert('RGB').tobytes() in expected_pixels
    if i:
        assert 'Version '+IDS[i-1] in page.extract_text()
assert all(sha(ROOT/p) == checksum for p, checksum in {**source_hashes, **original_hashes}.items())
checks = {'date':'2026-11-16', 'strict_pdf_parse':True, 'pages':4,
          'embedded_images_exact_source_RGB':True, 'JPEG_recompression':False,
          'PDF_image_interpolation_enabled':True,
          'full_size_fronts_mm':[185,240], 'source_raster_px':[W,H],
          'effective_dpi':round(W/(185/25.4),1),
          'original_numbered_fronts_unchanged':True,
          'source_hashes':source_hashes, 'original_front_hashes':original_hashes,
          'visual_review':'Pending rendered overview and overlay-edge checks.'}
(HERE/'CHECKS.json').write_text(json.dumps(checks, indent=2)+'\n')
collection = {'date':'2026-11-16', 'output':str(OUTPUT.relative_to(ROOT)),
              'sha256':sha(OUTPUT), 'bytes':OUTPUT.stat().st_size,
              'pages':4, 'source_images':source_hashes,
              'base_for_all_versions':str(BASE.relative_to(ROOT)),
              'ribbon_and_sticker_source':str(OVERLAY.relative_to(ROOT)),
              'overlay_clips_top_origin_px':{'ribbon_triangle':[[0,0],[270,0],[0,255]],
                  'measurement_sticker_circle':{'centre':[182,1293],'radius':102}},
              'placements_mm':placements,
              'preservation':'Common clean artwork; original restored ribbon/sticker pixels used in native PDF clips. Original saved fronts and local earlier comparison remain unchanged.',
              'limitation':'Cleaner illustration, not increased native pixel resolution or final layered print master.'}
(HERE/'COLLECTION.json').write_text(json.dumps(collection, indent=2)+'\n')
print(json.dumps({'pdf':str(OUTPUT),'pages':4,'bytes':OUTPUT.stat().st_size,'checks':'passed'}))
