"""Offline checks of the separate Cover C panel proposals; no interior exports."""
from pathlib import Path
from math import hypot
import hashlib, json, logging
from pypdf import PdfReader
import pdfplumber

logging.getLogger('pdfminer').setLevel(logging.ERROR)
root = Path(__file__).resolve().parents[1]
receipt = root/'docs/publication/cover-c-compact/CHECKS.json'
report = json.loads(receipt.read_text())
mm = 72/25.4

def fonts_in(resources, found):
    resources = resources.get_object()
    for ref in resources.get('/Font', {}).values():
        font = ref.get_object()
        for child in font.get('/DescendantFonts', [font]):
            child = child.get_object()
            descriptor = child.get('/FontDescriptor', {})
            if hasattr(descriptor, 'get_object'):
                descriptor = descriptor.get_object()
            found[str(font.get('/BaseFont', font.get('/Subtype')))] = (
                child.get('/Subtype') == '/Type3' or
                any(key in descriptor for key in ['/FontFile', '/FontFile2', '/FontFile3']))
    for ref in resources.get('/XObject', {}).values():
        obj = ref.get_object()
        if '/Resources' in obj:
            fonts_in(obj['/Resources'], found)

for item in report['results']:
    file = root/item['pdf']
    assert hashlib.sha256(file.read_bytes()).hexdigest() == item['sha256']
    reader = PdfReader(file)
    assert len(reader.pages) == 2
    fonts, images = {}, []
    texts = []
    for number, page in enumerate(reader.pages, 1):
        assert abs(float(page.mediabox.width)/mm - 191) < .001
        assert abs(float(page.mediabox.height)/mm - 246) < .001
        assert abs(float(page.trimbox.width)/mm - 185) < .001
        assert abs(float(page.trimbox.height)/mm - 240) < .001
        assert list(page.bleedbox) == list(page.mediabox)
        fonts_in(page['/Resources'], fonts)
        expected = {str(k): ref.get_object() for k, ref in page['/Resources'].get('/XObject', {}).items()
                    if ref.get_object().get('/Subtype') == '/Image'}
        seen = set()
        def placed(op, args, cm, tm):
            if op != b'Do' or str(args[0]) not in expected:
                return
            key = str(args[0]); obj = expected[key]; seen.add(key)
            images.append({'panel': number, 'resource': key,
                           'pixels': [int(obj['/Width']), int(obj['/Height'])],
                           'actualPpi': round(min(float(obj['/Width'])*72/hypot(cm[0], cm[1]),
                                                 float(obj['/Height'])*72/hypot(cm[2], cm[3])), 2)})
        texts.append(' '.join(page.extract_text(visitor_operand_before=placed).split()))
        assert seen == set(expected)
    assert fonts and all(fonts.values())
    # Chromium paints outlined headings twice and separates some rotated glyphs.
    # Normalize extraction whitespace and the known fill/stroke heading layers.
    front = ''.join(texts[0].split()).replace('VegVeg', 'Veg').replace('SortedSorted', 'Sorted')
    for wording in ['Veg Sorted', 'The vegetable grower’s cheat book',
                    '44 at-a-glance growing guides & 14 troubleshooting guides']:
        assert ''.join(wording.split()) in front, (item['id'], wording, texts[0])
    assert '£17.50' in texts[1]
    assert 'ISBN / BARCODE' in texts[1]
    assert 'CHEAT SHEETS' not in texts[0]
    with pdfplumber.open(file) as pdf:
        minimum = min(c['size'] for p in pdf.pages for c in p.chars if c['text'].strip())
    assert minimum > 6.9
    item['physical'] = {'geometry': 'Exact 185 × 240 mm trim, 3 mm bleed; two independent panels',
                        'embeddedFonts': fonts, 'minimumVectorTextPt': round(minimum, 3),
                        'images': images, 'requestedFrontCopyAfterExtractionNormalization': True,
                        'priceVerified': True}
for source, expected in report['sourceHashes'].items():
    assert hashlib.sha256((root/source).read_bytes()).hexdigest() == expected
receipt.write_text(json.dumps(report, indent=2, ensure_ascii=False)+'\n')
print('Both PDFs: exact boxes, requested wording, price, embedded fonts and source hashes verified.')
print('Raster resolution recorded separately: concepts remain below production resolution.')
