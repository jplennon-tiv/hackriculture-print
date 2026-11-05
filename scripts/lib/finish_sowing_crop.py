"""Check and render the requested two-edition crop proof."""
from pathlib import Path
from hashlib import sha256
import json
import logging
import os
import re
import subprocess
import tempfile
import unicodedata

import pdfplumber
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, DictionaryObject, NameObject, NumberObject, RectangleObject, TextStringObject

logging.getLogger("pdfminer").setLevel(logging.ERROR)
def compact(text):
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", text))


def finish(folder):
    if (folder / "APPROVAL.json").exists():
        raise ValueError("This proof is approved. Start a separate revision to change it.")
    root = folder.parents[3]
    checks = json.loads((folder / "CHECKS.json").read_text())
    crop = checks.get("crop", "carrot")
    verified = {}
    book = root / "output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf"
    main = PdfReader(book)
    page_map = json.loads((root / "docs/publication/whole-book-order-preview/PAGE-MAP.json").read_text())
    recto_number = next(p["pdfPage"] for p in page_map if p["folio"] == checks["folios"][1])
    main_links = main.pages[recto_number - 1]["/Annots"]
    targets = [main.get_page_number(a.get_object()["/Dest"][0].get_object()) + 1 for a in main_links]
    assert targets == [link["pdfPage"] for link in checks["links"]]


    for unit, info in checks["byUnit"].items():
        path = root / info["pdf"]
        reader = PdfReader(path)
        assert len(reader.pages) == 2
        writer = PdfWriter()
        for page in reader.pages:
            width, height = (float(v) * 25.4 / 72 for v in (page.mediabox.width, page.mediabox.height))
            assert abs(width - 185) < .25 and abs(height - 240) < .25
            for attr in ("mediabox", "trimbox", "cropbox"):
                setattr(page, attr, RectangleObject([0, 0, 185 * 72 / 25.4, 240 * 72 / 25.4]))
            writer.add_page(page)
        writer.add_metadata({"/Title": f"{crop.title()} • Sowing & planting ({unit} review spread)"})
        relative_book = os.path.relpath(book, path.parent)
        annotations = writer.pages[1]["/Annots"]
        assert len(annotations) == len(targets)
        for annotation, target in zip(annotations, targets):
            action = annotation.get_object()
            old = action["/A"]
            if old["/S"] == "/URI":
                assert old["/URI"].endswith(f"#page={target}")
            action[NameObject("/A")] = DictionaryObject({
                NameObject("/S"): NameObject("/GoToR"),
                NameObject("/F"): TextStringObject(relative_book),
                NameObject("/D"): ArrayObject([NumberObject(target - 1), NameObject("/Fit")]),
            })
        writer.write(path)
        saved = PdfReader(path)
        for ref, target in zip(saved.pages[1]["/Annots"], targets):
            action = ref.get_object()["/A"]
            assert action["/S"] == "/GoToR" and (path.parent / action["/F"]).resolve() == book
            assert list(action["/D"]) == [target - 1, "/Fit"]

        with pdfplumber.open(path) as pdf:
            front, back = pdf.pages
            left = 17 * 72 / 25.4
            col_width = info["columnWidths"][0] * 72 / 25.4
            column_end = left + col_width + 1
            right_start = column_end + 8
            _, top, _, bottom = info["geometry"]["areaPt"]
            sow = compact(back.crop((left - 2, top, column_end, bottom)).extract_text())
            care = compact(back.crop((right_start, top, back.width, bottom)).extract_text())
            assert all(compact(method["text"]) in sow for method in info["methods"]), (unit, sow)
            assert compact(info["care"]) in care, (unit, care)
            if crop == "leek":
                front_text = compact(front.extract_text())
                assert "TRANSPLANT" in front.extract_text().split()
                assert compact(info["transplantFact"]) in front_text
                assert "MOVEOUT" not in front_text and "Foranearliercrop" not in compact(back.extract_text())
            elif crop == "carrot":
                fact = compact(front.crop((front.width * .5, 58 * 72 / 25.4, front.width, 99 * 72 / 25.4)).extract_text())
                assert compact(info["extended"]) in fact, (unit, fact)
            if crop in ("beetroot", "tomato_outdoor", "potato"):
                for item in info["geometry"]["newFacts"]:
                    assert item["icon"], (crop,item)
                    assert compact(item["text"]) in compact(front.crop(tuple(item["box"])).extract_text() or ""), (unit,item["text"])
                for item in info["geometry"]["tableCells"]:
                    assert compact(item["text"]) in compact(back.crop(tuple(item["box"])).extract_text() or ""), (unit,item["text"])
                printed = compact(front.extract_text())
                assert all(compact(label) in printed for label in info["geometry"]["calendarBands"])
            else:
                assert "SOW" in front.extract_text().split()
            back_text = compact(back.extract_text())
            assert compact("See also: " + " · ".join(link["text"] for link in checks["links"])) in back_text
            assert all(compact(name) not in back_text for name in checks["omitted"])

        with tempfile.TemporaryDirectory() as scratch:
            prefix = Path(scratch) / unit
            subprocess.run(["pdftoppm", "-png", "-scale-to", "1500", str(path), str(prefix)], check=True)
            pages = [Image.open(prefix.with_name(unit + suffix)).convert("RGB") for suffix in ("-1.png", "-2.png")]
            w, h = pages[0].size
            spread = Image.new("RGB", (w * 2 + 4, h), "#ddd6c9")
            spread.paste(pages[0], (0, 0))
            spread.paste(pages[1], (w + 4, 0))
            spread.save(folder / f"{crop}-{unit}-spread.jpg", quality=92)
        verified[unit] = {"pdf":info["pdf"], "pages":2, "trimMm":[185,240],
                           "sha256":sha256(path.read_bytes()).hexdigest(),
                           "seeAlsoBookPages":targets,
                           "verifiedInPDF":["SOW", "sowing paragraphs", "care", "three book links",
                                            "TRANSPLANT and its Quick fact" if crop == "leek" else "extended season"]}
    (folder / "PDF-CHECKS.json").write_text(json.dumps(verified, indent=2) + "\n")
