"""Finish and inspect this separate review proof; run with the bundled PDF Python."""
from pathlib import Path
import hashlib, json, re, subprocess
from PIL import Image
from pypdf import PdfReader, PdfWriter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
checks = json.loads((HERE / 'CHECKS.json').read_text())
pdf = Path(checks['output'])
copy = json.loads(Path(checks['copyPath']).read_text())
reader = PdfReader(pdf)
assert len(reader.pages) == 2
writer = PdfWriter()
original_sizes = []
for page in reader.pages:
    original_sizes.append([float(page.mediabox.width)*25.4/72, float(page.mediabox.height)*25.4/72])
    # Chromium rounds CSS millimetres to device pixels; normalise the review trim.
    page.scale_to(185*72/25.4, 240*72/25.4)
    writer.add_page(page)
writer.page_layout = '/TwoPageLeft'
writer.add_metadata({'/Title': 'The Vegetable Guru — Netting, revised — review draft', '/Author': 'John Lennon', '/Subject': 'Proposed facing pages 160–161; not approved or integrated'})
with pdf.open('wb') as stream:
    writer.write(stream)

reader = PdfReader(pdf)
normalise = lambda s: re.sub(r'\s+', '', s).lower()
body_fields = ['lead', 'method', 'check', 'pollination', 'wildlife', 'caption', 'detailCaption', 'closing', 'cageText', 'cageCaption', 'comparisonCaption']
pdf_checks = []
for source, page in zip(copy['pages'], reader.pages):
    extracted = page.extract_text()
    expected = [source[k] for k in body_fields if k in source]
    for key in ['materials', 'sections']:
        for block in source.get(key, []):
            expected.append(block['text'])
            if 'caption' in block:
                expected.append(block['caption'])
    missing = [s for s in expected if normalise(s) not in normalise(extracted)]
    assert not missing, missing
    fonts = []
    for ref in page['/Resources'].get('/Font', {}).values():
        font = ref.get_object()
        parts = font.get('/DescendantFonts', [font])
        for part in parts:
            part = part.get_object()
            descriptor = part.get('/FontDescriptor')
            descriptor = descriptor.get_object() if descriptor else {}
            embedded = any(k in descriptor for k in ['/FontFile', '/FontFile2', '/FontFile3']) or (part.get('/Subtype') == '/Type3' and bool(part.get('/CharProcs')))
            fonts.append({'name': str(part.get('/BaseFont', 'Embedded glyph program')), 'type': str(part.get('/Subtype')), 'embedded': embedded})
    assert fonts and all(f['embedded'] for f in fonts)
    pdf_checks.append({'folio': source['folio'], 'trimMm': [185,240], 'allBodyCopyPresent': True, 'fonts': fonts})

subprocess.run(['pdftoppm', '-r', '170', '-png', str(pdf), str(HERE/'page')], check=True, capture_output=True)
for i, folio in enumerate([160,161], start=1):
    (HERE/f'page-{i}.png').replace(HERE/f'page-{folio}.png')
pages = [Image.open(HERE/f'page-{folio}.png').convert('RGB') for folio in [160,161]]
spread = Image.new('RGB', (pages[0].width+pages[1].width+16, max(p.height for p in pages)), '#d9dfcf')
spread.paste(pages[0], (0,0))
spread.paste(pages[1], (pages[0].width+16,0))
spread.save(HERE/'spread.png')

checks['chromiumTrimBeforeNormalisationMm'] = original_sizes
checks['pdfChecks'] = pdf_checks
checks['pdfSha256'] = hashlib.sha256(pdf.read_bytes()).hexdigest()
checks['artwork'] = []
for asset in sorted((HERE/'assets').glob('*.png')):
    im = Image.open(asset)
    checks['artwork'].append({'file': asset.name, 'pixels': list(im.size), 'mode': im.mode, 'alphaRange': list(im.getchannel('A').getextrema()), 'sha256': hashlib.sha256(asset.read_bytes()).hexdigest()})
(HERE/'CHECKS.json').write_text(json.dumps(checks, indent=2)+'\n')
print(json.dumps({'pages':len(reader.pages),'trimMm':[185,240],'copyVerified':True,'fontsEmbedded':True,'pdf':str(pdf),'spread':str(HERE/'spread.png')}))
