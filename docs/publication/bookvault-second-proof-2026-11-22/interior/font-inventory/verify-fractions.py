"""Check the two-glyph font cleanup and create focused facing-spread proofs."""
from collections import Counter
from pathlib import Path
import hashlib
import json
import math
import runpy

import numpy as np
import pypdfium2 as pdfium
from PIL import Image, ImageDraw
from pypdf import PdfReader, PdfWriter
from pypdf.generic import IndirectObject, NameObject, StreamObject

DOC = Path(__file__).resolve().parent
ROOT = DOC.parents[4]
PLAN = json.loads((DOC / "FRACTION-REPLACEMENT.json").read_text())
BEFORE = ROOT / PLAN["source"]
AFTER = ROOT / PLAN["output"]
CHANGES = {r["folio"]: r for r in PLAN["changes"]}


def fingerprint_factory():
    cache = {}
    def fingerprint(obj):
        if isinstance(obj, IndirectObject):
            if obj.idnum not in cache:
                cache[obj.idnum] = fingerprint(obj.get_object())
            return cache[obj.idnum]
        if isinstance(obj, dict):
            values = [(str(k), fingerprint(v)) for k, v in sorted(obj.items()) if k != "/Length"]
            if isinstance(obj, StreamObject):
                values.append(("encodedStreamSHA256", hashlib.sha256(obj._data).hexdigest()))
            data = repr(values)
        elif isinstance(obj, list):
            data = repr([fingerprint(v) for v in obj])
        else:
            data = repr(obj)
        return hashlib.sha256(data.encode()).hexdigest()
    return fingerprint


def main():
    a, b = PdfReader(BEFORE), PdfReader(AFTER)
    da, db = pdfium.PdfDocument(BEFORE), pdfium.PdfDocument(AFTER)
    assert len(a.pages) == len(b.pages) == 174
    fa, fb = fingerprint_factory(), fingerprint_factory()
    checks = {"file": PLAN["output"], "sha256": PLAN["sha256"], "pages": 174, "pageChecks": []}
    checks["metadataExact"] = dict(a.metadata) == dict(b.metadata)
    checks["outputIntentExact"] = fa(a.trailer["/Root"]["/OutputIntents"]) == fb(b.trailer["/Root"]["/OutputIntents"])
    assert checks["metadataExact"] and checks["outputIntentExact"]
    details = []
    for folio, (pa, pb) in enumerate(zip(a.pages, b.pages), 1):
        row = {"folio": folio}
        row["boxesExact"] = all(list(pa[k]) == list(pb[k]) for k in ("/MediaBox", "/CropBox", "/TrimBox", "/BleedBox"))
        old_resources = dict(pa["/Resources"])
        if folio in CHANGES:
            old_resources["/Font"] = dict(pa["/Resources"]["/Font"])
            del old_resources["/Font"][CHANGES[folio]["removedResource"]]
        row["retainedResourcesExact"] = fa(old_resources) == fb(pb["/Resources"])
        assert row["boxesExact"] and row["retainedResourcesExact"], row
        xa, xb = da[folio - 1], db[folio - 1]
        ta, tb = xa.get_textpage(), xb.get_textpage()
        sa, sb = ta.get_text_range(), tb.get_text_range()
        row["expectedTextExact"] = sb == (sa.replace("⅝", "5/8") if folio in CHANGES else sa)
        assert row["expectedTextExact"], (folio, sa, sb)
        if folio not in CHANGES:
            row["pageInstructionsExact"] = pa.get_contents().get_data() == pb.get_contents().get_data()
            assert row["pageInstructionsExact"], row
        else:
            index = sa.index("⅝")
            end = sa.index("\r", index)
            original_boxes = [ta.get_charbox(j) for j in range(index, end)]
            left = min(v[0] for v in original_boxes) - 1
            bottom = min(v[1] for v in original_boxes) - 1
            right = max(v[2] for v in original_boxes) + CHANGES[folio]["followingTextShiftPoints"] + 2
            top = max(v[3] for v in original_boxes) + 1
            scale = 300 / 72
            ia, ib = xa.render(scale=scale).to_pil().convert("RGB"), xb.render(scale=scale).to_pil().convert("RGB")
            height = xa.get_size()[1]
            mask = np.zeros((ia.height, ia.width), dtype=bool)
            crop = (math.floor(left * scale), math.floor((height - top) * scale),
                    math.ceil(right * scale), math.ceil((height - bottom) * scale))
            mask[crop[1]:crop[3], crop[0]:crop[2]] = True
            difference = np.any(np.asarray(ia) != np.asarray(ib), axis=2)
            row["pixelsChangedOutsideEditedLineAt300dpi"] = int(np.count_nonzero(difference & ~mask))
            assert row["pixelsChangedOutsideEditedLineAt300dpi"] == 0, row
            row["allowedEditBoxPoints"] = [left, bottom, right, top]
            row["oldLineSuffix"] = sa[index:end]
            row["newLineSuffix"] = sb[index:end + 2]
            for label, im in (("before", ia), ("after", ib)):
                im.save(DOC / f"page-{folio}-{label}.jpg", quality=96)
                wide = (max(0, int((left - 95) * scale)), max(0, crop[1] - 40),
                        min(im.width, crop[2] + 40), min(im.height, crop[3] + 100))
                part = im.crop(wide)
                details.append((f"Page {folio} - {label}", part))
        ta.close(); tb.close(); xa.close(); xb.close()
        checks["pageChecks"].append(row)
    # A fresh inventory must find no remaining five-eighths font CMap.
    inventory = runpy.run_path(str(DOC / "compare-fonts.py"))["inventory"]
    _, inv = inventory(AFTER)
    checks["fontResourcesAfter"] = inv["fontResources"]
    checks["fiveEighthsFontResourcesAfter"] = sum(r["mapsFiveEighths"] for r in inv["resources"])
    assert inv["fontResources"] == 1041
    assert checks["fiveEighthsFontResourcesAfter"] == 0
    # Keep left/right pages together in a small, exact production-page proof.
    proof = AFTER.with_name("Vegetable-Guru-Fraction-Font-Checks.pdf")
    w = PdfWriter()
    for folio in (60, 61, 66, 67):
        w.add_page(b.pages[folio - 1])
    w.root_object[NameObject("/OutputIntents")] = b.trailer["/Root"]["/OutputIntents"].clone(w)
    w.add_metadata({"/Title": "The Vegetable Guru - fraction font checks, pages 60-61 and 66-67"})
    w.write(proof)
    checks["proof"] = str(proof.relative_to(ROOT))
    checks["proofBytes"] = proof.stat().st_size
    # Full facing spreads for visual inspection, preserving actual page order.
    for left in (60, 66):
        pages = [db[n - 1].render(scale=1.6).to_pil().convert("RGB") for n in (left, left + 1)]
        canvas = Image.new("RGB", (sum(p.width for p in pages) + 16, max(p.height for p in pages)), "#ddd8ce")
        canvas.paste(pages[0], (0, 0)); canvas.paste(pages[1], (pages[0].width + 16, 0))
        canvas.save(DOC / f"spread-{left}-{left + 1}.jpg", quality=95)
    width = max(im.width for _, im in details)
    height = sum(im.height + 30 for _, im in details)
    contact = Image.new("RGB", (width, height), "white"); draw = ImageDraw.Draw(contact); y = 0
    for label, im in details:
        draw.text((8, y + 7), label, fill="black"); contact.paste(im, (0, y + 30)); y += im.height + 30
    contact.save(DOC / "Fraction-Before-After.jpg", quality=97)
    (DOC / "FRACTION-CHECKS.json").write_text(json.dumps(checks, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({k: v for k, v in checks.items() if k != "pageChecks"}, indent=2))


if __name__ == "__main__":
    main()
