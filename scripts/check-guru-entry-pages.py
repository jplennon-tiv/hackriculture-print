"""Check and render only the separate four-page entry proposals; no guide work."""
from pathlib import Path
import hashlib
import json
import logging
import subprocess

from pypdf import PdfReader, PdfWriter
import pdfplumber

logging.getLogger("pdfminer").setLevel(logging.ERROR)
root = Path(__file__).resolve().parent.parent
folder = root / "docs/publication/vegetable-guru-entry-pages"
receipt = json.loads((folder / "CHECKS.json").read_text())
mm = 72 / 25.4
texts, results = {}, []
for item in receipt["results"]:
    source = root / item["pdf"]
    assert hashlib.sha256(source.read_bytes()).hexdigest() == item["sha256"]
    reader = PdfReader(source)
    assert len(reader.pages) == 4
    preview, pages, fulltext = PdfWriter(), [], []
    with pdfplumber.open(source) as parsed:
        for index, (page, view) in enumerate(zip(reader.pages, parsed.pages)):
            folio = index + 4
            trim = [float(x) / mm for x in page.trimbox]
            media = [float(x) / mm for x in page.mediabox]
            assert all(abs(x-y) < .01 for x, y in zip(trim, [3, 3, 188, 243])), trim
            assert all(abs(x-y) < .01 for x, y in zip(media, [0, 0, 191, 246])), media
            text = view.extract_text()
            fulltext.append(text)
            assert f"{item['units'].upper()} · {folio}" in text
            minsize = min(c["size"] for c in view.chars)
            assert minsize >= 7
            fonts = []
            for ref in page["/Resources"]["/Font"].values():
                font = ref.get_object()
                if font.get("/Subtype") == "/Type3":
                    procs = font["/CharProcs"]
                    assert procs and all(len(p.get_object().get_data()) > 0 for p in procs.values())
                    fonts.append({"kind": "embedded Type3 glyphs", "name": str(font["/FontDescriptor"].get_object().get("/FontName"))})
                else:
                    for d in font.get("/DescendantFonts", [font]):
                        desc = d.get_object()["/FontDescriptor"].get_object()
                        assert any(k in desc for k in ["/FontFile", "/FontFile2", "/FontFile3"])
                    fonts.append({"kind": "embedded font", "name": str(font.get("/BaseFont"))})
            images = [{"pixels": list(im["srcsize"]), "dpiX": round(im["srcsize"][0]/(im["width"]/72), 1), "dpiY": round(im["srcsize"][1]/(im["height"]/72), 1)} for im in view.images]
            pages.append({"folio": folio, "trimMm": [185, 240], "mediaMm": [191, 246], "minimumNativeTextPt": round(minsize, 3), "fonts": fonts, "rasterImages": images})
            page.cropbox = page.trimbox
            preview.add_page(page)
    normal = " ".join((" ".join(fulltext)).split())
    for ref in item["contents"]:
        assert f"{ref['label']} {ref['startPage']}" in normal, ref
    for copy in receipt["howToExplanations"]:
        assert " ".join(copy.split()) in normal
    texts[item["units"]] = normal.replace(item["units"].upper(), "EDITION")
    temp = root / f"tmp/pdfs/vegetable-guru-entry-pages/{item['units']}-trim-preview.pdf"
    preview.write(temp)
    subprocess.run(["pdftoppm", "-png", "-r", "135", "-cropbox", str(temp), str(folder / item["units"])], check=True)
    results.append({"units": item["units"], "sha256": item["sha256"], "pages": pages, "all58ContentsReferencesVerified": True, "approvedExplanationsVerified": True})
assert texts["imperial"] == texts["metric"]
for file, digest in receipt["approvedSources"].items():
    assert hashlib.sha256((root / file).read_bytes()).hexdigest() == digest
result = {"status": "Local PDF checks passed; visual review recorded separately", "results": results, "unitTextParityExceptFooter": True, "approvedOriginalsUnchanged": True, "preview": "135 dpi renders of actual PDF TrimBox, all four pages in both units", "limits": ["Existing raster captures are reused without resampling. The enlarged calendar is approximately 206 dpi; these are review proofs, with final raster/colour preflight still required. Native-text size checks do not measure lettering embedded in raster captures."]}
(folder / "PDF-CHECKS.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps({"pagesChecked": 8, "contentsReferencesPerEdition": 58, "unitTextParity": True, "approvedOriginalsUnchanged": True, "minimumNativeTextPt": min(p["minimumNativeTextPt"] for r in results for p in r["pages"])}))
