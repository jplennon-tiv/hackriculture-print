"""Rebuild the one-page square-photo proof from the retained image masters."""

import hashlib
import io
import json
from pathlib import Path
import sys

from PIL import Image, ImageChops, ImageDraw
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DictionaryObject, NameObject
from reportlab.lib.units import mm
from reportlab.pdfgen.canvas import Canvas
import pypdfium2 as pdfium


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
OVERNIGHT = HERE.parent / "Vegetable-Guru-Growing-Techniques-Photographic-Proof.pdf"
FOLIO_INDEX = 3
SQUARE = 24 * mm
CENTRE_X = 100.875
PLACEMENTS = [
    ("/X11", (78., 226.92, 45., 68.25), 261.045),
    ("/X14", (57., 155.67, 87.75, 44.25), 177.795),
    ("/X16", (57., 58.92, 87.75, 58.50), 88.170),
]


def digest(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def clip_to_square(canvas, file, crop, x, y):
    with Image.open(file) as image:
        w, h = image.size
    left, top, side = crop
    assert min(left, top) >= 0 and side > 0
    assert left + side <= w and top + side <= h
    scale = SQUARE / side
    canvas.saveState()
    clip = canvas.beginPath()
    clip.rect(x, y, SQUARE, SQUARE)
    canvas.clipPath(clip, stroke=0, fill=0)
    canvas.drawImage(str(file), x - left * scale, y - (h - top - side) * scale,
                     w * scale, h * scale)
    canvas.restoreState()


def remove_previous_photos(page, names):
    contents = page.get_contents()
    operations = contents.operations
    drawn = {str(args[0]) for args, op in operations if op == b"Do"}
    assert names == drawn
    contents.operations = [(args, op) for args, op in operations if op != b"Do"]
    page.replace_contents(contents)
    resources = DictionaryObject(page["/Resources"])
    resources.pop(NameObject("/XObject"))
    page[NameObject("/Resources")] = resources


def verify_render(output, scratch, rectangles):
    before = pdfium.PdfDocument(OVERNIGHT)[FOLIO_INDEX]
    after = pdfium.PdfDocument(output)[0]
    assert before.get_size() == after.get_size()
    assert before.get_textpage().get_text_range() == after.get_textpage().get_text_range()
    scale = 2.0
    new_image = after.render(scale=scale).to_pil().convert("RGB")
    old_image = before.render(scale=scale).to_pil().convert("RGB")
    new_image.save(scratch / "page-149-proof.png")
    changes = ImageChops.difference(new_image, old_image)
    clear = ImageDraw.Draw(changes)
    for x, y, w, h in rectangles:
        clear.rectangle((x * scale - 2, changes.height - (y + h) * scale - 2,
                         (x + w) * scale + 2, changes.height - y * scale + 2), fill="black")
    assert changes.getbbox() is None, changes.getbbox()


def main(artwork, output, scratch):
    images = json.loads(artwork.read_text())
    assert len(images) == len(PLACEMENTS)
    source = PdfReader(OVERNIGHT)
    assert source.page_labels[FOLIO_INDEX] == "149"
    previous = source.pages[FOLIO_INDEX]
    writer = PdfWriter()
    page = writer.add_page(previous, excluded_keys=("/Annots",))
    remove_previous_photos(page, {name for name, _, _ in PLACEMENTS})
    buf = io.BytesIO()
    canvas = Canvas(buf, pagesize=tuple(map(float, (page.mediabox.width, page.mediabox.height))))
    rectangles = [old for _, old, _ in PLACEMENTS]
    for art, (_, _, centre_y) in zip(images, PLACEMENTS, strict=True):
        file = ROOT / art["master"]
        crop = art["square_crop_xy_side"]
        if crop == "full-square":
            with Image.open(file) as image:
                assert image.width == image.height
                crop = [0, 0, image.width]
        x, y = CENTRE_X - SQUARE / 2, centre_y - SQUARE / 2
        clip_to_square(canvas, file, crop, x, y)
        rectangles.append((x, y, SQUARE, SQUARE))
    canvas.save()
    page.merge_page(PdfReader(buf).pages[0])
    writer.add_metadata({"/Title": "The Vegetable Guru - Page 149 square photography proof",
                         "/Subject": "Nutrient cycles artwork review"})
    writer.write(output)
    saved = PdfReader(output).pages[0]
    assert saved.trimbox == previous.trimbox
    assert len(saved.images) == 3
    verify_render(output, scratch, rectangles)
    checks = {
        "proof_sha256": digest(output),
        "original_proof_sha256": digest(OVERNIGHT),
        "folio": 149,
        "square_frame_mm": [24, 24],
        "original_text_and_trim_verified": True,
        "render_dpi": 144,
        "identical_pixels_outside_image_areas": True,
        "masters_sha256": {art["master"]: digest(ROOT / art["master"]) for art in images},
    }
    (scratch / "checks.json").write_text(json.dumps(checks, indent=2) + "\n")
    print(f"{output}: three 24 mm square photos; text, trim and surrounding artwork unchanged")


if __name__ == "__main__":
    main(*(Path(arg) for arg in sys.argv[1:]))
