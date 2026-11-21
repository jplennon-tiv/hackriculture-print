"""Build a separate compact proof using the current pages as the text layer."""

import hashlib
import io
import json
from pathlib import Path
import textwrap

from PIL import Image, ImageOps
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DictionaryObject, NameObject
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
import pypdfium2 as pdfium


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
OUTPUT = ROOT / "output/pdf/overnight-2026-11-19/Vegetable-Guru-Opening-Pages-Photo-Study.pdf"
SCRATCH = Path("/tmp/vg-overnight-20261119")
ASSETS = HERE / "thumbnails"
BOOK = ROOT / "output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf"
COVER = ROOT / "output/pdf/selected-gold-cover/The-Vegetable-Guru-Selected-Cover.pdf"
PAGE_MAP = ROOT / "docs/publication/whole-book-order-preview/PAGE-MAP.json"
TRIM = (524.409449, 680.314961)
PAPER = HexColor("#fff8e8")
INK = HexColor("#173e2c")
ORANGE = HexColor("#a44007")
RULE = HexColor("#d4d6bf")
FOLIOS = (1, 4, 5, 7, 9, 99, 147)

REAR = "docs/publication/cover-versions/version-1-1/rear-cream-harvest/photo-grid/revision-04/protected-master/crops"
CROP = "docs/publication/summer-cover-photo-search/selected-stills"
STOCK = "docs/assets/vegetable-guru-stock/photo-derived-2026-11-17/sources"
LOC = "docs/assets/garden-media-library/local-references"

# Horizontal crop centres are measured on the original image from its left edge.
# Vertical centres are measured from its top edge.
PHOTOS = {
    "tomato": (f"{CROP}/P01-tomato-trusses.png", "Ripening tomatoes", (.43, .46)),
    "roots": (f"{CROP}/P06-carrot-and-beetroot.jpg", "Carrot and beetroot", (.48, .50)),
    "flower": (f"{CROP}/P04-courgette-flower.jpeg", "Courgette flower", (.44, .50)),
    "peas": (f"{CROP}/P02-peas-on-the-plant.png", "Peas on the plant", (.52, .50)),
    "greens": (f"{STOCK}/L023-lettuces.jpeg", "Lettuces in the bed", (.46, .50)),
    "potatoes": (f"{CROP}/P03-potatoes-in-hands.png", "Potatoes just lifted", (.50, .49)),
    "squash": (f"{STOCK}/X446-squash-on-vine.jpeg", "Squash on the vine", (.49, .53)),
    "beans": (f"{STOCK}/L030-broad-bean-pods.jpeg", "Broad bean pods", (.52, .48)),
    "onions": (f"{STOCK}/03-onions.jpeg", "Onion harvest", (.48, .53)),
    "peppers": (f"{STOCK}/01-pepper-harvest.jpeg", "Peppers from the garden", (.50, .50)),
    "colander": (f"{REAR}/07.jpg", "Garden salad in a colander", (.49, .50)),
    "harvest": (f"{REAR}/15.jpg", "John's tomato harvest", (.50, .29)),
    "plot": (f"{LOC}/allotment/A02-0017-00135.000.jpg", "Allotment beds and paths", (.42, .62)),
    "glass": (f"{LOC}/home-garden/H08-0122-00080.774.jpg", "John at his greenhouse", (.44, .47)),
    "compost": (f"{LOC}/home-garden/H22-0148-00259.799.jpg", "John at his compost bays", (.53, .53)),
    "no-dig": (f"{LOC}/home-garden/H17-DSC01823.JPG", "Making a no-dig bed", (.46, .53)),
    "sowing": (f"{LOC}/allotment/A11-0139-00101.301.jpg", "Working at the allotment", (.48, .56)),
    "hoops": (f"{LOC}/home-garden/H19-DSC01926.JPG", "Beds and low hoops", (.49, .50)),
}

# All values use PDF points, measured on the assembled imperial interior.
# Tiles are listed from upper left. None leaves the paper visible.
LAYOUTS = {
    1: ((47.8, 88.7, 454.1, 142), [(48, 102, 82, 112, 5, 5, 5,
         ["tomato", "roots", None, "peas", "flower"])]),
    4: ((365.5, 577.5, 110.5, 83), [(390, 595, 25, 25, 3, 4, 3,
         [None, "roots", "greens", "peas", None, "flower"])]),
    5: ((391, 577.5, 110.5, 83), [(415, 595, 25, 25, 3, 4, 3,
         ["beans", "onions", None, None, "squash", "greens"])]),
    7: ((372.5, 566.6, 119.8, 80), [(390, 582, 45, 48, 2, 5, 0,
         ["harvest", "intro-harvest"])]),
    9: ((329, 526.5, 167, 126), [(354, 537, 56, 47, 2, 6, 6,
         ["tomato", None, "potatoes", "greens"])]),
    99: ((36, 132, 477, 292), [(49, 178, 105, 99, 4, 7, 8,
         ["aphids", None, "slug", None, None, "mildew", None, "mesh"])]),
    147: ((69.8, 142.5, 410, 273), [(49, 178, 105, 99, 4, 7, 8,
         ["plot", "no-dig", None, "glass", None, "compost", "sowing", "hoops"])]),
}
SECOND_CONTENTS_ART = (91.1, 158.5, 128.0, 96.3)
REPLACED_IMAGES = {
    1: {"/X10", "/X12", "/X14", "/X16", "/X18"},
    4: {"/X9"},
    5: {"/X15", "/X19"},
    7: {"/Im1"},
    9: {"/X36"},
    99: {"/X9", "/X12", "/X14"},
    147: {"/X19"},
}
SECTIONS = [
    ("Title page", "A photographic strip with one empty space.", 1),
    ("Contents spread", "Small crops in the two headers and a quiet lower vignette.", 4),
    ("Introduction", "Two present-day thumbnail details above the original 1991 photograph.", 7),
    ("Vegetable Guides", "Three crops in the header, with the how-to panels below.", 9),
    ("Vegetable Troubles", "Close-ups and material details in a partial grid.", 99),
    ("Growing Techniques", "The plot and recognisable jobs in a partial grid.", 147),
]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def register_fonts():
    fonts = ROOT / "docs/assets/vegetable-guru-stock/allotment-handover-2026-11-19/atlas/source/fonts"
    for name, file in (("ReviewBold", "NotoSans-Bold.ttf"), ("ReviewBody", "NotoSans-Regular.ttf")):
        pdfmetrics.registerFont(TTFont(name, fonts / file))


def photographic_tiles():
    record = {}
    for name, (relative, label, centre) in PHOTOS.items():
        source = ROOT / relative
        file = ASSETS / f"{name}.jpg"
        if not source.is_file():
            raise FileNotFoundError(source)
        with Image.open(source) as original:
            img = ImageOps.exif_transpose(original).convert("RGB")
            # Common 4:5 master with enough peripheral scene to make the
            # final tile fits without forcing the source and final sizes alike.
            native = min(img.width, round(img.height * 4 / 5), 740)
            thumbnail = ImageOps.fit(img, (native, round(native * 5 / 4)),
                                     Image.Resampling.LANCZOS, centering=centre)
            thumbnail.save(file, quality=93, subsampling=0, optimize=True)
        record[name] = {"name": label, "source": relative, "sourceSHA256": digest(source),
                        "kind": "camera source", "cropCentre": centre, "thumbnailSHA256": digest(file)}
    record.update(json.loads((HERE / "constructed-thumbnails.json").read_text()))
    return record


def image(canvas, file, x, y, width, height):
    # 210-300 ppi displayed images in this review copy. Native source crops
    # remain available for the next design pass.
    w = round(width * 3.5)
    h = round(height * 3.5)
    with Image.open(file) as original:
        rendered = ImageOps.fit(original.convert("RGB"), (w, h), Image.Resampling.LANCZOS)
    data = io.BytesIO()
    rendered.save(data, format="JPEG", quality=92, subsampling=0, optimize=True)
    data.seek(0)
    canvas.drawImage(ImageReader(data), x, y, width, height)


def tiles(canvas, x, y, width, height, cols, gx, gy, names):
    rows = (len(names) + cols - 1) // cols
    for i, name in enumerate(names):
        if name is not None:
            art = ASSETS / f"{name}.jpg"
            image(canvas, art, x + i % cols * (width + gx),
                  y + (rows - 1 - i // cols) * (height + gy), width, height)


def make_overlay(folio):
    data = io.BytesIO()
    canvas = Canvas(data, pagesize=TRIM)
    mask, arrangements = LAYOUTS[folio]
    canvas.setFillColor(PAPER)
    canvas.rect(*mask, fill=1, stroke=0)
    if folio == 5:
        canvas.rect(*SECOND_CONTENTS_ART, fill=1, stroke=0)
        tiles(canvas, 112, 178, 42, 51, 2, 5, 0, ["colander", "peppers"])
    for arrangement in arrangements:
        tiles(canvas, *arrangement)
    canvas.save()
    return PdfReader(data).pages[0]


def remove_replaced_images(page, folio):
    names = REPLACED_IMAGES[folio]
    contents = page.get_contents()
    draws = {str(args[0]) for args, op in contents.operations if op == b"Do"}
    if not names <= draws:
        raise ValueError(f"Image objects for page {folio} have changed")
    contents.operations = [(args, op) for args, op in contents.operations
                           if op != b"Do" or str(args[0]) not in names]
    page.replace_contents(contents)
    resources = DictionaryObject(page["/Resources"])
    xobjects = resources["/XObject"]
    resources[NameObject("/XObject")] = DictionaryObject({
        name: xobjects.raw_get(name) for name in xobjects if str(name) not in names
    })
    page[NameObject("/Resources")] = resources


def text(canvas, value, x, y, size=10, face="ReviewBody", colour=INK):
    canvas.setFillColor(colour)
    canvas.setFont(face, size)
    canvas.drawString(x, y, value)


def study_heading(canvas, title, sub):
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, *TRIM, fill=1, stroke=0)
    text(canvas, title, 39, 613, 27, "ReviewBold")
    text(canvas, sub, 40, 583)
    canvas.setStrokeColor(RULE)
    canvas.line(39, 566, 483, 566)


def make_intros(proof_pages):
    data = io.BytesIO()
    canvas = Canvas(data, pagesize=TRIM)
    study_heading(canvas, "Opening pages", "The Vegetable Guru  |  photographic artwork study")
    cover = pdfium.PdfDocument(COVER)
    w, h = cover[0].get_size()
    # The wrap is rear, spine, front. Show the settled 185 mm rear panel.
    back = cover[0].render(scale=.7, crop=(0, 0, w - h * 185 / 240, 0)).to_pil()
    back_file = SCRATCH / "rear-reference.jpg"
    back.convert("RGB").save(back_file, quality=94)
    image(canvas, back_file, 39, 315, 116, 151)
    text(canvas, "Selected back cover", 39, 296, 9)
    canvas.setFillColor(ORANGE)
    text(canvas, "Across the opening pages", 174, 536, 15, "ReviewBold")
    for i, (label, note, folio) in enumerate(SECTIONS):
        top = 520 - 45 * i
        text(canvas, f"{label}  ·  {folio}", 175, top, 13, "ReviewBold")
        for line_no, line in enumerate(textwrap.wrap(note, 54)):
            text(canvas, line, 175, top - 15 - 12 * line_no, 9)
    text(canvas, "Original text, folios and guide panels carry through the studies.", 39, 237, 11)
    text(canvas, "Source photographs and generated detail studies are listed at the end.", 39, 218, 10)
    text(canvas, "Comparison", 39, 171, 16, "ReviewBold", ORANGE)
    text(canvas, "The existing openings and photo proposals are shown side by side.", 39, 148, 10)
    text(canvas, "The following pages show each proposal at its actual trim size.", 39, 133, 10)
    text(canvas, "Artwork proposals for review", 39, 59, 9, "ReviewBody", ORANGE)
    canvas.showPage()

    study_heading(canvas, "Artwork before and after", "Assembled page on the left  |  photographic study on the right")
    proof = pdfium.PdfDocument(proof_pages)
    for i, folio in enumerate(FOLIOS):
        x = 29 + (i % 3) * 155
        y = 408 - (i // 3) * 141
        for j, photo in enumerate((SCRATCH / f"book-{folio}.jpg", SCRATCH / f"proposal-{folio}.jpg")):
            if j == 1:
                proof[i].render(scale=1.4).to_pil().convert("RGB").save(photo, quality=95)
            image(canvas, photo, x + 70 * j, y, 66, 85.5)
        text(canvas, f"Page {folio}", x, y - 15, 9)
    canvas.showPage()

    canvas.save()
    return data.getvalue()


def make_atlas(records):
    data = io.BytesIO()
    canvas = Canvas(data, pagesize=TRIM)
    for family, names in (
        ("Harvest and garden", [*PHOTOS, "intro-harvest"]),
        ("Vegetable Troubles", ["aphids", "slug", "mildew", "mesh"]),
    ):
        study_heading(canvas, family, "Thumbnails retained for the next design pass")
        for i, name in enumerate(names):
            x = 39 + i % 4 * 114
            y = 453 - (i // 4) * 101
            image(canvas, ASSETS / f"{name}.jpg", x, y, 93, 73)
            title = records[name]["name"]
            point_size = min(8, 106 * 8 / pdfmetrics.stringWidth(title, "ReviewBody", 8))
            text(canvas, title, x, y - 12, point_size)
            kind = records[name]["kind"]
            text(canvas, kind.capitalize(), x, y - 23, 7, "ReviewBody", ORANGE)
        if family == "Vegetable Troubles":
            text(canvas, "Generated details are illustrative studies for the divider.", 39, 328, 10)
            text(canvas, "The existing diagnostic artwork in the guides stays in place.", 39, 311, 10)
        canvas.showPage()
    canvas.save()
    return data.getvalue()


def main():
    SCRATCH.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    register_fonts()
    records = photographic_tiles()
    book = PdfReader(BOOK)
    folios = {row["folio"]: row["pdfPage"] - 1
              for row in json.loads(PAGE_MAP.read_text()) if isinstance(row.get("folio"), int)}
    rendered_base = pdfium.PdfDocument(BOOK)
    pages = PdfWriter()
    for folio in FOLIOS:
        rendered_base[folios[folio]].render(scale=1.4).to_pil().convert("RGB").save(
            SCRATCH / f"book-{folio}.jpg", quality=93
        )
        page = pages.add_page(book.pages[folios[folio]], excluded_keys=("/Annots",))
        remove_replaced_images(page, folio)
        page.merge_page(make_overlay(folio))
    proof = io.BytesIO()
    pages.write(proof)
    preludes = PdfReader(io.BytesIO(make_intros(proof.getvalue())))
    atlas = PdfReader(io.BytesIO(make_atlas(records)))
    writer = PdfWriter()
    writer.add_metadata({"/Title": "The Vegetable Guru · Opening Pages Photo Study",
                         "/Author": "John Lennon", "/Subject": "Draft photographic artwork"})
    for page in preludes.pages[:2]:
        writer.add_page(page, excluded_keys=("/Annots",))
    for page in pages.pages:
        writer.add_page(page)
    for page in atlas.pages:
        writer.add_page(page)
    from pypdf.annotations import Link
    positions = {folio: i + 2 for i, folio in enumerate(FOLIOS)}
    for i, (label, _, folio) in enumerate(SECTIONS):
        top = 520 - 45 * i
        writer.add_annotation(0, Link(rect=(172, top - 23, 483, top + 13),
                                      target_page_index=positions[folio], border=[0, 0, 0]))
        writer.add_outline_item(label, positions[folio])
    writer.add_annotation(0, Link(rect=(37, 123, 486, 190), target_page_index=1, border=[0, 0, 0]))
    for i, folio in enumerate(FOLIOS):
        x = 29 + (i % 3) * 155
        y = 408 - (i // 3) * 141
        writer.add_annotation(1, Link(rect=(x, y - 20, x + 138, y + 86),
                                      target_page_index=positions[folio], border=[0, 0, 0]))
    writer.add_outline_item("Thumbnail sources", 2 + len(FOLIOS))
    writer.write(OUTPUT)
    saved = PdfReader(OUTPUT)
    rendered_output = pdfium.PdfDocument(OUTPUT)
    assert len(saved.pages) == 11
    for folio, i in positions.items():
        base, changed = book.pages[folios[folio]], saved.pages[i]
        base_text = rendered_base[folios[folio]].get_textpage().get_text_range()
        output_text = rendered_output[i].get_textpage().get_text_range()
        assert base_text == output_text, folio
        assert list(base.trimbox) == list(changed.trimbox), folio
    (HERE / "THUMBNAILS.json").write_text(json.dumps(records, indent=2) + "\n")
    print(OUTPUT)


if __name__ == "__main__":
    main()
