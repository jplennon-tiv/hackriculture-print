"""Check actual final PDFs at identical device origins, then make review files."""
from pathlib import Path
import hashlib, importlib.util, json, gc
import numpy as np
from PIL import Image, ImageDraw
import pypdfium2 as pdfium
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject

ROOT = Path(__file__).resolve().parents[4]
DOC = Path(__file__).resolve().parent
OUT = ROOT / 'output/pdf/header-placement-review-2026-11-23'
SOURCE = ROOT / 'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Colour-Managed.pdf'
TARGET = OUT / 'Vegetable-Guru-Interior-Corrected-Headers.pdf'
sha = lambda p: hashlib.file_digest(p.open('rb'), 'sha256').hexdigest()

def render(page):
    bitmap = pdfium.PdfBitmap.new_native(1910, 2460, format=pdfium.raw.FPDFBitmap_BGR)
    bitmap.fill_rect((255, 255, 255, 255), 0, 0, 1910, 2460)
    pdfium.raw.FPDF_RenderPageBitmap(bitmap, page, 0, 0, 1910, 2460, 0, 0)
    result = bitmap.to_pil().convert('RGB').copy()
    bitmap.close()
    return result

def main():
    receipt = json.loads((DOC / 'INSTALL-CHECKS.json').read_text())
    assert sha(SOURCE) == receipt['sourceSHA256']
    assert sha(TARGET) == receipt['sha256']
    before, after = pdfium.PdfDocument(SOURCE), pdfium.PdfDocument(TARGET)
    renders = DOC / 'headers'
    renders.mkdir(exist_ok=True)
    checks = []
    for f in receipt['affectedPages']:
        a, b = render(before[f-1]), render(after[f-1])
        pixels_a, pixels_b = np.asarray(a), np.asarray(b)
        changed = np.any(pixels_a != pixels_b, axis=2)
        inside = int(changed[30:2430, 30:1880].sum())
        protected = int(changed[33:2430, 30:1877].sum())
        assert protected == 0, (f, protected)
        if f in range(9, 96, 2): assert inside == 0, (f, inside)
        # Below these fixed-size headers the outer margin is plain background.
        # Expanding native clipping can reveal a historical white canvas sliver;
        # require a clean solid continuation, including the first bleed column.
        seam_max = None
        if f not in range(9, 96, 2):
            right_delta = np.abs(pixels_b[450:2430, 1880:1910].astype(np.int16)
                                 - pixels_a[450:2430, 1875:1876].astype(np.int16))
            seam_max = int(right_delta.max())
            assert seam_max <= 1, (f, 'Right-edge background seam', seam_max)
        ys, xs = np.where(changed)
        checks.append({'folio': f, 'changedPixelsInsideTrim': inside,
                       'changedPixelsBeyondPointThreeMMTopRightRepairBoundary': protected,
                       'changedPixelsTotal': int(changed.sum()),
                       'maximumRightBackgroundSeamChannelDifference': seam_max,
                       'changedBounds': [int(xs.min()), int(ys.min()), int(xs.max()+1), int(ys.max()+1)] if len(xs) else None})
        b.crop((0, 0, 1910, 450)).resize((764, 180), Image.Resampling.LANCZOS).save(renders / f'header-{f:03}.png')
        if f in (17, 19, 24, 98):
            a.save(renders / f'before-{f:03}.png')
            b.save(renders / f'after-{f:03}.png')
        a.close(); b.close(); gc.collect()
        if len(checks) % 15 == 0: print('Rendered and checked', len(checks), 'headers', flush=True)
    # All appended repairs have a safety clip excluding the page body beyond
    # the previous 0.2mm synthetic trim-edge repair. Original image bytes and
    # native content have already passed the installation check.
    # Check native font programs independently using the established inspector.
    modpath = ROOT / 'docs/publication/bookvault-second-proof-2026-11-22/interior/prepare.py'
    spec = importlib.util.spec_from_file_location('native_preservation', modpath)
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    aa, bb = PdfReader(SOURCE), PdfReader(TARGET)
    for f, (p, q) in enumerate(zip(aa.pages, bb.pages), 1):
        assert mod.font_programs(p) == mod.font_programs(q), f
    # These are the three examples corresponding to John's captures.
    proof = PdfWriter()
    for i, f in enumerate((19, 24, 98)):
        proof.add_page(bb.pages[f-1]); proof.set_page_label(i, i, style='/D', start=f)
    proof.root_object[NameObject('/OutputIntents')] = bb.trailer['/Root']['/OutputIntents'].clone(proof)
    proof.add_metadata({'/Title': 'The Vegetable Guru - corrected header checks', '/Author': 'John Lennon', '/Subject': 'Current folios 19,24,98; exact pages from corrected production interior'})
    proof_path = OUT / 'Vegetable-Guru-Corrected-Header-Checks.pdf'
    proof.write(proof_path)
    contacts = []
    for label, folios in [('opening-guides', list(range(8, 95, 2))), ('practical-guides', list(range(9, 96, 2))), ('troubles', list(range(98, 145)))]:
        for start in range(0, len(folios), 10):
            group = folios[start:start+10]
            sheet = Image.new('RGB', (1568, 1060), '#dddddd')
            draw = ImageDraw.Draw(sheet)
            for j, f in enumerate(group):
                x, y = 12 + (j % 2) * 784, 22 + (j // 2) * 210
                draw.text((x, y-16), f'Folio {f}', fill='black')
                with Image.open(renders / f'header-{f:03}.png') as im: sheet.paste(im, (x, y))
            path = DOC / f'{label}-{start+1:02}.png'
            sheet.save(path); contacts.append(str(path.relative_to(ROOT)))
    record = {'date': '2026-11-23', 'finalSHA256': receipt['sha256'], 'renderDPI': 254,
              'renderMethod': 'PDFium actual before/after PDFs at identical 1910x2460 pixel origin; TrimBox exactly x30..1880,y30..2430',
              'affectedPages': len(checks), 'changedPixelsInsideTrim': sum(r['changedPixelsInsideTrim'] for r in checks),
              'changedPixelsBeyondPointThreeMMTopRightRepairBoundary': sum(r['changedPixelsBeyondPointThreeMMTopRightRepairBoundary'] for r in checks),
              'trimEdgeScope': 'Only the earlier synthetic 0.2mm top/right reflected sliver may change; actual renders are identical beyond a 0.3mm raster-boundary guard. Practical-page corrections are outside trim only.',
              'all174EmbeddedFontProgramsAndCmapsIdentical': True,
              'reviewPDF': str(proof_path.relative_to(ROOT)), 'reviewSHA256': sha(proof_path),
              'pages': checks, 'contactSheets': contacts,
              'status': 'Exact protected-page render and font preservation passed; contact-sheet visual review still required'}
    (DOC / 'RENDER-CHECKS.json').write_text(json.dumps(record, indent=2) + '\n')
    print(proof_path, flush=True)

if __name__ == '__main__':
    main()
