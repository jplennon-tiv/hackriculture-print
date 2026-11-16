"""Preserve original JPEG bytes in native PDFs, then check the focused cover proof."""
from pathlib import Path
import hashlib
import json
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject
from PIL import Image, ImageChops
from io import BytesIO

root = Path(__file__).resolve().parents[4]
out = root / 'output/pdf/cover-refined-direction/revision-07'
work = Path(__file__).resolve().parent
checks = json.loads((work / 'CHECKS.json').read_text())
spread_path = root / checks['spread']['source']
spread_bytes = spread_path.read_bytes()
spread_size = Image.open(spread_path).size

# CoreGraphics re-encodes NSImage JPEGs. Embed the exact approved JPEG instead.
for filename in ['Back-cover.pdf', 'The-Vegetable-Guru-Cover-Development.pdf']:
    path = out / filename
    writer = PdfWriter(clone_from=path)
    changed = 0
    for page in writer.pages:
        for ref in page.get('/Resources', {}).get('/XObject', {}).values():
            obj = ref.get_object()
            if obj.get('/Subtype') == '/Image' and (obj.get('/Width'), obj.get('/Height')) == spread_size:
                obj._data = spread_bytes
                obj[NameObject('/Filter')] = NameObject('/DCTDecode')
                for key in ['/DecodeParms', '/Decode']:
                    if key in obj:
                        del obj[key]
                changed += 1
    assert changed > 0
    temp = path.with_suffix('.verified.pdf')
    with temp.open('wb') as stream:
        writer.write(stream)
    temp.replace(path)

reader = PdfReader(out / 'The-Vegetable-Guru-Cover-Development.pdf')
assert len(reader.pages) == 4
text = ' '.join(reader.pages[2].extract_text().split())
for paragraph in checks['bodyCopy']:
    assert ' '.join(paragraph.split()) in text
for label in ['The', 'Vegetable Guru', '44 growing guides and 14 troubleshooting guides', 'John Lennon', '£17.50', 'ISBN / BARCODE']:
    assert label in text
page = PdfReader(out / 'Back-cover.pdf').pages[0]
images = []
for im in page.images:
    item = {'name': im.name, 'size': im.image.size}
    if im.image.size == (3840, 2160):
        source = Image.open(root / checks['photo']['source']).convert('RGB')
        assert ImageChops.difference(source, im.image.convert('RGB')).getbbox() is None
        item['matchesDecodedOriginalPhotoPixels'] = True
    if im.image.size == spread_size:
        source = Image.open(spread_path).convert('RGB')
        # pypdf's convenience image extractor can itself re-encode JPEG data.
        # Compare the PDF stream directly to avoid measuring that extra encoding.
        streams = [ref.get_object() for ref in page['/Resources']['/XObject'].values()]
        stream = next(o for o in streams if (o.get('/Width'),o.get('/Height')) == spread_size)
        assert stream.get_data() == spread_bytes
        decoded = Image.open(BytesIO(stream.get_data())).convert('RGB')
        assert ImageChops.difference(source, decoded).getbbox() is None
        item['matchesDecodedApprovedSpreadPixels'] = True
        item['originalJpegBytesEmbedded'] = True
    images.append(item)
assert any(i.get('matchesDecodedOriginalPhotoPixels') for i in images)
assert any(i.get('matchesDecodedApprovedSpreadPixels') for i in images)
fonts = []
for font_ref in page['/Resources']['/Font'].values():
    font = font_ref.get_object()
    descriptor = font.get('/FontDescriptor', {}).get_object()
    fonts.append({'name': str(font.get('/BaseFont')), 'embedded': any(k in descriptor for k in ['/FontFile', '/FontFile2', '/FontFile3'])})
assert all(font['embedded'] for font in fonts)
checks['pdfVerification'] = {
    'pages': len(reader.pages),
    'dimensionsMm': [[round(float(p.mediabox.width)*25.4/72, 2), round(float(p.mediabox.height)*25.4/72, 2)] for p in reader.pages],
    'allMainBackCopyPresent': True,
    'images': images,
    'fonts': fonts,
    'sha256': hashlib.sha256((out / 'The-Vegetable-Guru-Cover-Development.pdf').read_bytes()).hexdigest(),
}
(work / 'CHECKS.json').write_text(json.dumps(checks, indent=2)+'\n')
print(json.dumps(checks['pdfVerification'], indent=2))
