"""Read-only audit of the exact failed 300-dpi interior against John's checklist.

Gutter measurements use PDFium's tight native-character boxes, not background
image bounds. They are text checks, not a claim to detect every raster label.
The source print PDF is never modified.
"""
from pathlib import Path
from collections import Counter
import hashlib, importlib.util, json, re, subprocess

import pypdfium2 as pdfium
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[5]
DOC = Path(__file__).resolve().parent
FILE = ROOT / 'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-All-300dpi.pdf'
EXPECTED = 'e63823a8d71b559622758918dc8809f460d5bc7a6426b00058cc1ecabca29a6f'
POPPLER = Path('/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin')
MM = 72 / 25.4


def main():
    digest = hashlib.file_digest(FILE.open('rb'), 'sha256').hexdigest()
    assert digest == EXPECTED
    reader = PdfReader(FILE)
    spec = importlib.util.spec_from_file_location('prior_preflight', DOC.parent / 'pdfx-retry/verify-pdfx.py')
    prior = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(prior)
    checks = prior.preflight(reader)
    pages = []
    raster = pdfium.PdfDocument(FILE)
    for index, page in enumerate(reader.pages):
        folio = index + 1
        trim = [float(v) for v in page.trimbox]
        native = raster[index]
        tp = native.get_textpage()
        text = tp.get_text_range()
        chars = []
        invalid = []
        for n in range(tp.count_chars()):
            char = tp.get_text_range(n, 1)
            if not char or char.isspace() or all(ord(c) < 32 for c in char):
                continue
            box = list(tp.get_charbox(n))
            if box[2] <= box[0] or box[3] <= box[1]:
                invalid.append({'index': n, 'text': char, 'box': box})
                continue
            clearance = ((box[0] - trim[0]) if folio % 2 else (trim[2] - box[2])) / MM
            chars.append({'index': n, 'text': char, 'gutterMm': clearance, 'boxPt': box})
        chars.sort(key=lambda item: item['gutterMm'])
        near = chars[:1]
        for item in near:
            start = max(0, item['index'] - 45)
            item['context'] = tp.get_text_range(start, min(95, tp.count_chars() - start)).replace('\r', ' ').replace('\n', ' ')
        boxes = {key[1:]: [float(v) / MM for v in page.get(key, [])]
                 for key in ('/MediaBox', '/CropBox', '/TrimBox', '/BleedBox', '/ArtBox')}
        pages.append({
            'folio': folio, 'gutterSide': 'left' if folio % 2 else 'right',
            'rotation': int(page.get('/Rotate', 0)), 'userUnit': float(page.get('/UserUnit', 1)),
            'boxesMm': boxes, 'portrait': page.mediabox.height > page.mediabox.width,
            'visibleNativeCharacters': len(chars), 'invalidCharacterBoxes': invalid,
            'nativeTextMinimumGutterMm': chars[0]['gutterMm'] if chars else None,
            'charactersInside20mm': sum(c['gutterMm'] < 20 - .01 for c in chars),
            'nearestCharacter': near[0] if near else None,
            'openingText': re.sub(r'\s+', ' ', text[:150]),
            'annotationCount': len(page.get('/Annots', [])),
        })
        tp.close(); native.close()
        if folio % 30 == 0:
            print('Measured native lettering', folio, flush=True)
    raster.close()

    for tool, args, output in (
        ('pdfimages', ['-list'], 'PDFIMAGES.txt'),
        ('pdffonts', [], 'PDFFONTS.txt'),
        ('pdfinfo', ['-box'], 'PDFINFO.txt'),
    ):
        result = subprocess.run([str(POPPLER / tool), *args, str(FILE)], capture_output=True, text=True)
        (DOC / output).write_text(result.stdout)
        (DOC / (output + '.stderr')).write_text(result.stderr)
        assert result.returncode == 0, (tool, result.stderr)
    images = []
    for line in (DOC / 'PDFIMAGES.txt').read_text().splitlines()[2:]:
        row = line.split()
        if row:
            images.append({'page': int(row[0]), 'kind': row[2], 'dpi': [int(row[12]), int(row[13])]})
    fonts = (DOC / 'PDFFONTS.txt').read_text().splitlines()[2:]
    unembedded = [line for line in fonts if line.split()[-5] != 'yes']

    seen = set(); special = Counter(); registration = []; external = []
    def walk(obj, where='root'):
        if hasattr(obj, 'idnum'):
            key = (obj.idnum, obj.generation)
            if key in seen:
                return
            seen.add(key)
            obj = obj.get_object()
        if isinstance(obj, dict):
            for key in ('/OCProperties', '/PieceInfo', '/PresSteps', '/Perms', '/Encrypt', '/CropMarks', '/BleedMarks'):
                if key in obj:
                    special[key] += 1
            if obj.get('/Type') == '/Filespec' or (obj.get('/Subtype') == '/Form' and '/Ref' in obj):
                external.append(where)
            for key, value in obj.items():
                if key != '/Parent':
                    walk(value, where + '/' + str(key))
        elif isinstance(obj, list):
            if obj and str(obj[0]) == '/Separation' and len(obj) > 1 and str(obj[1]) == '/All':
                registration.append(where)
            for i, value in enumerate(obj):
                walk(value, where + f'[{i}]')
    walk(reader.trailer['/Root'])
    minima = [p['nativeTextMinimumGutterMm'] for p in pages if p['nativeTextMinimumGutterMm'] is not None]
    summary = {
        'file': str(FILE.relative_to(ROOT)), 'sha256': digest, 'bytes': FILE.stat().st_size,
        'pageCount': len(pages), 'allSinglePortraitPages': all(p['portrait'] for p in pages),
        'rotationCounts': dict(Counter(p['rotation'] for p in pages)),
        'userUnitCounts': dict(Counter(p['userUnit'] for p in pages)),
        'pageBoxesIdentical': all(p['boxesMm'] == pages[0]['boxesMm'] for p in pages),
        'boxesMm': pages[0]['boxesMm'], 'encrypted': reader.is_encrypted,
        'encryptKeyPresent': '/Encrypt' in reader.trailer,
        'metadata': dict(reader.metadata), 'preflight': checks,
        'fontResources': len(fonts), 'unembeddedFontRows': unembedded,
        'imagePlacements': len(images),
        'imageDpiCounts': dict(Counter(f"{i['dpi'][0]}x{i['dpi'][1]}" for i in images)),
        'specialFeatureCounts': dict(special), 'registrationColourLocations': registration,
        'externalReferenceLocations': external,
        'annotationCount': sum(p['annotationCount'] for p in pages),
        'gutter': {
            'criterionMm': 20, 'nominalSavedLayoutGutterMm': 17,
            'measurement': 'Tight non-whitespace native-character bounds from the relevant TrimBox edge; odd left, even right. 0.01 mm threshold tolerance.',
            'limitations': 'Not OCR. Backgrounds/decorative edge illustrations excluded. Raster labels/diagrams are not comprehensively measured. No layout change or approval implied.',
            'pagesWithNativeText': len(minima),
            'pagesWithNativeTextInside20mm': sum(p['charactersInside20mm'] > 0 for p in pages),
            'nativeMinimumMm': min(minima),
            'pagesWithoutNativeText': [p['folio'] for p in pages if not p['visibleNativeCharacters']],
            'pagesWithInvalidCharacterBoxes': [p['folio'] for p in pages if p['invalidCharacterBoxes']],
        },
        'pdfxStatus': 'Export lineage uses Ghostscript -dPDFX=1, retained valid 2001 identification pair and exact FOGRA39 output intent. Focused local structure/render checks are not independent ISO conformance certification.',
        'trimMarksStatus': 'No registration colour, mark metadata, annotations or added mark code found; visual edge review recorded separately. Artwork-only marks cannot be exhaustively classified from these structural checks.',
    }
    (DOC / 'CHECKLIST-CHECKS.json').write_text(json.dumps({**summary, 'pages': pages}, indent=2) + '\n')
    print(json.dumps(summary, indent=2), flush=True)
    print('Nearest native text:', json.dumps([{'folio': p['folio'], 'gutterMm': p['nativeTextMinimumGutterMm'], 'context': p['nearestCharacter']['context']} for p in sorted([p for p in pages if p['nearestCharacter']], key=lambda p: p['nativeTextMinimumGutterMm'])[:12]], indent=2), flush=True)
    assert hashlib.file_digest(FILE.open('rb'), 'sha256').hexdigest() == EXPECTED


if __name__ == '__main__':
    main()
