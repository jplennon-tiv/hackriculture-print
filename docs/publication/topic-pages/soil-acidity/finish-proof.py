"""Finish and inspect this separate review proof; run with the bundled PDF Python."""
from pathlib import Path
import hashlib, json, re, subprocess
from PIL import Image
from pypdf import PdfReader, PdfWriter

HERE = Path(__file__).resolve().parent
if (HERE / 'APPROVAL.json').exists():
    raise RuntimeError('Approved page is frozen; use a new revision path.')
ROOT = HERE.parents[3]
checks = json.loads((HERE / 'CHECKS.json').read_text())
pdf = Path(checks['output'])
copy = json.loads(Path(checks['copyPath']).read_text())
reader = PdfReader(pdf)
assert len(reader.pages) == len(copy['pages']) == 1
writer = PdfWriter()
original_sizes = []
for page in reader.pages:
    original_sizes.append([float(page.mediabox.width)*25.4/72, float(page.mediabox.height)*25.4/72])
    # Chromium rounds CSS millimetres to device pixels; normalise the review trim.
    page.scale_to(185*72/25.4, 240*72/25.4)
    writer.add_page(page)
writer.page_layout = '/SinglePage'
writer.add_metadata({'/Title': 'The Vegetable Guru — Organic growing: testing and adjusting pH', '/Author': 'John Lennon', '/Subject': 'Single-page review draft at the end of Organic growing; illustrative folio 152'})
with pdf.open('wb') as stream:
    writer.write(stream)

reader = PdfReader(pdf)
normalise = lambda s: re.sub(r'\s+', '', s).lower()
body_fields = ['lead','title','subtitle']
pdf_checks = []
for source, page in zip(copy['pages'], reader.pages):
    extracted = page.extract_text()
    expected = [source[k] for k in body_fields if k in source]
    for block in source['panels']:
        expected.extend([block['title'], *block['paragraphs'], block['note']])
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
for i, folio in enumerate([p['folio'] for p in copy['pages']], start=1):
    (HERE/f'page-{i}.png').replace(HERE/f'page-{folio}.png')

checks['chromiumTrimBeforeNormalisationMm'] = original_sizes
checks['pdfChecks'] = pdf_checks
checks['pdfSha256'] = hashlib.sha256(pdf.read_bytes()).hexdigest()
checks['sources'] = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in [HERE/'build.mjs', HERE/'finish-proof.py', HERE/'draft.css', HERE/'draft.html', HERE.parent/'plant-protection-supports/draft.css']}
checks['artwork'] = []
for asset in sorted((HERE/'assets').glob('*.png')):
    im = Image.open(asset)
    checks['artwork'].append({'file': asset.name, 'pixels': list(im.size), 'mode': im.mode, 'alphaRange': list(im.getchannel('A').getextrema()), 'sha256': hashlib.sha256(asset.read_bytes()).hexdigest()})
(HERE/'CHECKS.json').write_text(json.dumps(checks, indent=2)+'\n')
print(json.dumps({'pages':len(reader.pages),'trimMm':[185,240],'copyVerified':True,'fontsEmbedded':True,'pdf':str(pdf),'preview':str(HERE/'page-152.png')}))
