"""Separate mirrored-gutter diagnostic; retain exact source image/font resources."""
from pathlib import Path
import hashlib, importlib.util, json
from collections import Counter
import pypdfium2 as pdfium
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DecodedStreamObject, NameObject

DOC = Path(__file__).resolve().parent
ROOT = DOC.parents[4]
SOURCE = ROOT / 'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-All-300dpi.pdf'
OUTPUT = SOURCE.with_name('Vegetable-Guru-Interior-Gutter20-Native.pdf')
EXPECTED = 'e63823a8d71b559622758918dc8809f460d5bc7a6426b00058cc1ecabca29a6f'
MM = 72 / 25.4
SCALE = .99
SHIFT = 3.4 * MM
BLANKS = {4, 6, 96, 174}


def main():
    assert not OUTPUT.exists(), 'Preserve existing test files'
    assert hashlib.file_digest(SOURCE.open('rb'), 'sha256').hexdigest() == EXPECTED
    spec = importlib.util.spec_from_file_location('pdfx', DOC.parent / 'pdfx-retry/verify-pdfx.py')
    helper = importlib.util.module_from_spec(spec); spec.loader.exec_module(helper)
    reader = PdfReader(SOURCE); writer = PdfWriter(clone_from=reader)
    records = []
    for index, page in enumerate(writer.pages):
        folio = index + 1
        raw = page.get_contents().get_data()
        if folio in BLANKS:
            records.append({'folio': folio, 'changed': False, 'reason': 'Blank page'})
            continue
        images = []
        def walk(res):
            for ref in res.get('/XObject', {}).values():
                ob = ref.get_object()
                if ob.get('/Subtype') == '/Image':
                    images.append(ob)
                elif ob.get('/Subtype') == '/Form':
                    walk(ob.get('/Resources', {}))
        walk(page['/Resources'])
        full = [ob for ob in images if int(ob['/Width']) == 2256 and int(ob['/Height']) == 2906]
        assert len(full) == 1, (folio, len(full))
        ob = full[0]; assert ob['/ColorSpace'] == '/DeviceCMYK'
        pixels = helper.image_bytes(ob)
        width, height = int(ob['/Width']), int(ob['/Height'])
        # Existing clear bottom border supplies the page's exact CMYK paper.
        samples = [tuple(pixels[((height - 3) * width + x) * 4:((height - 3) * width + x + 1) * 4])
                   for x in range(width // 3, width * 2 // 3)]
        colour, count = Counter(samples).most_common(1)[0]
        assert count >= len(samples) * .95, (folio, Counter(samples).most_common(3))
        left, bottom, right, top = map(float, page.trimbox)
        tx = (1 - SCALE) * (left if folio % 2 else right) + (SHIFT if folio % 2 else -SHIFT)
        ty = (1 - SCALE) * top
        mw, mh = float(page.mediabox.width), float(page.mediabox.height)
        fill = ' '.join(f'{v / 255:.10f}' for v in colour)
        prefix = (f'q {fill} k 0 0 {mw:.10f} {mh:.10f} re f Q\n'
                  f'q {SCALE} 0 0 {SCALE} {tx:.10f} {ty:.10f} cm\n').encode()
        stream = DecodedStreamObject(); stream.set_data(prefix + raw + b'\nQ\n')
        page[NameObject('/Contents')] = writer._add_object(stream)
        page.compress_content_streams()
        records.append({'folio': folio, 'changed': True, 'scale': SCALE,
                        'matrix': [SCALE, 0, 0, SCALE, tx, ty], 'paperCMYK8': colour,
                        'sourceContentSHA256': hashlib.sha256(raw).hexdigest()})
        del pixels
        if folio % 30 == 0: print('Positioned', folio, flush=True)
    writer.write(OUTPUT)
    out = PdfReader(OUTPUT); doc = pdfium.PdfDocument(OUTPUT)
    checks = []
    for index, page in enumerate(out.pages):
        native = doc[index]; tp = native.get_textpage(); boxes = []
        for n in range(tp.count_chars()):
            char = tp.get_text_range(n, 1)
            if not char or char.isspace() or all(ord(c) < 32 for c in char): continue
            box = tp.get_charbox(n)
            if box[2] > box[0] and box[3] > box[1]: boxes.append(box)
        if boxes:
            left = (min(b[0] for b in boxes) - float(page.trimbox.left)) / MM
            right = (float(page.trimbox.right) - max(b[2] for b in boxes)) / MM
            inner, outer = (left, right) if index % 2 == 0 else (right, left)
            checks.append({'folio': index + 1, 'gutterMm': inner, 'outerMm': outer})
        tp.close(); native.close()
    doc.close()
    assert all(p['gutterMm'] >= 20 and p['outerMm'] >= 5 for p in checks), [p for p in checks if p['gutterMm'] < 20 or p['outerMm'] < 5]
    report = {'source': str(SOURCE.relative_to(ROOT)), 'sourceSHA256': EXPECTED,
              'output': str(OUTPUT.relative_to(ROOT)), 'bytes': OUTPUT.stat().st_size,
              'sha256': hashlib.file_digest(OUTPUT.open('rb'), 'sha256').hexdigest(),
              'pageCount': len(out.pages), 'scale': SCALE, 'mirroredShiftMm': 3.4,
              'verticalAnchor': 'Top trim edge', 'pageBoxesChanged': False,
              'minimumGutterMm': min(p['gutterMm'] for p in checks),
              'minimumOuterMm': min(p['outerMm'] for p in checks),
              'method': 'Uniform 1% reduction of all page content, mirrored 3.4 mm outward shift measured relative to trim, top-trim anchored vertically; exact sampled CMYK paper fills exposed edges. Fonts and images untouched; no reflow or source replacement.',
              'pages': records, 'nativeTextMargins': checks}
    (DOC / 'GUTTER-CHANGES.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({k:v for k,v in report.items() if k not in ('pages', 'nativeTextMargins')}, indent=2), flush=True)
    assert hashlib.file_digest(SOURCE.open('rb'), 'sha256').hexdigest() == EXPECTED


if __name__ == '__main__': main()
