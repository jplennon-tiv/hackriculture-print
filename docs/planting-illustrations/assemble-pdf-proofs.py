"""Validate and bundle review PDFs; render actual PDF pages for visual inspection."""
from pathlib import Path
import json
import re
import subprocess
from pypdf import PdfReader, PdfWriter

root = Path(__file__).resolve().parents[2]
out = root / "output/pdf/planting-proofs"
qa = out / "qa"
qa.mkdir(exist_ok=True)
poppler = Path("/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm")
crops = ["beetroot", "carrot", "potato", "leek", "chicory"]
audit = json.loads((out / "content-audit.json").read_text())
assert len(audit["results"]) == 30
norm = lambda s: re.sub(r"\s+", "", s).replace("\u2013", "-").replace("\u2014", "-")
checks = []
def embedded_fonts(resources):
    names = set()
    for font in resources.get("/Font", {}).values():
        item = font.get_object()
        descriptor = item.get("/FontDescriptor")
        names.add(str(item.get("/BaseFont") or (descriptor.get_object().get("/FontName") if descriptor else None)))
    for obj in resources.get("/XObject", {}).values():
        item = obj.get_object()
        if "/Resources" in item:
            names.update(embedded_fonts(item["/Resources"]))
    return names
for crop in crops:
    for units in ("metric", "imperial"):
        original = PdfReader(out / f"{crop}-{units}-baseline.pdf")
        assert len(original.pages) == 2, (crop, units, "baseline")
        for variant in ("baseline", "column", "wide"):
            stem = f"{crop}-{units}-{variant}"
            pdf = out / f"{stem}.pdf"
            reader = PdfReader(pdf)
            assert len(reader.pages) == 2, (stem, "page count", len(reader.pages))
            assert reader.pages[0].extract_text() == original.pages[0].extract_text(), (stem, "page one changed")
            record = next(r for r in audit["results"] if (r["crop"], r["units"], r["variant"]) == (crop, units, variant))
            text = norm(reader.pages[1].extract_text())
            for note in record["before"]["notes"]:
                assert norm(note) in text, (stem, "missing planting note", note)
            for section in ("soil", "right"):
                # Each original text line must survive, even if cards move.
                for line in record["before"][section].splitlines():
                    if line.strip() and not line.isdigit():
                        assert norm(line) in text, (stem, "missing original text", line)
            fonts = sorted(set().union(*(embedded_fonts(page["/Resources"]) for page in reader.pages)))
            assert any("Inter" in f for f in fonts), (stem, "Inter font absent", fonts)
            checks.append({"file": pdf.name, "pages": len(reader.pages), "pageOneTextUnchanged": True, "visibleNotesRetained": True, "otherAdviceRetained": True, "fonts": fonts})
            # Both units: complete page two, not just a widget screenshot.
            subprocess.run([str(poppler), "-f", "2", "-l", "2", "-singlefile", "-scale-to", "1250", "-png", str(pdf), str(qa / stem)], check=True, capture_output=True)
        if units == "metric":
            subprocess.run([str(poppler), "-f", "1", "-l", "1", "-singlefile", "-scale-to", "1250", "-png", str(out / f"{crop}-metric-baseline.pdf"), str(qa / f"{crop}-front")], check=True, capture_output=True)

for variant, name in (("baseline", "01-existing-layout"), ("column", "02-illustrated-column"), ("wide", "03-full-width-planting")):
    writer = PdfWriter()
    writer.add_metadata({"/Title":f"Planting review: {variant} layout", "/Subject":"A4 metric review proofs; not installed in normal exports", "/Author":"Hackriculture"})
    for crop in crops:
        writer.append(out / f"{crop}-metric-{variant}.pdf", outline_item=crop.capitalize())
    destination = out / f"{name}.pdf"
    with destination.open("wb") as stream:
        writer.write(stream)
    assert len(PdfReader(destination).pages) == 10
(out / "verification.json").write_text(json.dumps({"masterHash":audit["masterHash"], "checks":checks, "visualReview":"This script performs automated checks only. See docs/planting-illustrations/PDF-CONTENT-REVIEW.md for manual inspection scope."}, indent=2))
print("PASS: 30 two-page A4 PDFs; identical page-one text; baseline planting notes and other advice retained; Inter embedded. Three 10-page metric review PDFs assembled.")
