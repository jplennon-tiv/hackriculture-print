"""Check and render the eight focused navigation PDFs; never modify source proofs."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import unicodedata

import pdfplumber
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / 'docs/publication/reader-edit-pass/navigation'
manifest = json.loads((DIR / 'PROOF-MANIFEST.json').read_text())
save = json.loads((DIR / 'SAVE-RECEIPT.json').read_text())
normal = lambda s: re.sub(r'\s+', '', unicodedata.normalize('NFKC', s)).lower()
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
reports = []
signatures = {}
images = {}
frozen_page = PdfReader(ROOT / 'docs/publication/combined-guides-opening/references/approved-2026-10-15/opening.pdf').pages[0]
expected_size = (float(frozen_page.mediabox.width), float(frozen_page.mediabox.height))

for units, components in manifest['units'].items():
    for component, data in components.items():
        for variant in ['clean', 'highlight']:
            item = data[variant]
            source = ROOT / item['pdf']
            assert sha(source) == item['sha256'], source
            reader = PdfReader(source)
            assert len(reader.pages) == len(data['folios']), source
            texts, character_geometry = [], []
            with pdfplumber.open(source) as pdf:
                for number, page in enumerate(pdf.pages):
                    # Chromium rounds this CSS trim exactly as in the frozen component.
                    assert abs(page.width - expected_size[0]) < .01
                    assert abs(page.height - expected_size[1]) < .01
                    text = page.extract_text() or ''
                    texts.append(text)
                    # The same visible text and character placement must survive highlighting.
                    character_geometry.append([(c['text'], round(c['x0'], 3), round(c['top'], 3), round(c['size'], 3)) for c in page.chars])
                    assert all(c['x0'] >= 0 and c['x1'] <= page.width + .1 and c['top'] >= 0 and c['bottom'] <= page.height + .1 for c in page.chars)
                    assert normal(str(data['folios'][number])) in normal(text[-60:]), (source, number, text[-60:])
                    for block in data['checks'][number]['blocks']:
                        # Adjacent calendar/key columns interleave in whole-page extraction.
                        # Check each actual PDF block at the measured source coordinates.
                        pt = 72 / 25.4
                        bbox = (max(0, block['left'] * pt - 1), max(0, block['top'] * pt - 1), min(page.width, block['right'] * pt + 1), min(page.height, block['bottom'] * pt + 1))
                        block_text = page.crop(bbox).extract_text() or ''
                        assert normal(block['text']) in normal(block_text), (source, number, block['text'], block_text)
            combined = '\n'.join(texts)
            if component == 'guide-key':
                assert normal(save['calendar']['after'][0]) in normal(combined)
                assert 'Warmer climates' not in combined
                assert 'Check crop advice' in combined
            else:
                for entry in manifest['index']['added']:
                    assert normal(entry['term']) in normal(combined), entry['term']
            key = (units, component, variant)
            signatures[key] = character_geometry
            render_dir = DIR / 'pages' / units / variant
            render_dir.mkdir(parents=True, exist_ok=True)
            prefix = render_dir / component
            subprocess.run(['pdftoppm', '-r', '120', '-png', str(source), str(prefix)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
            pages = sorted(render_dir.glob(component + '-*.png'))
            assert len(pages) == len(data['folios'])
            item['images'] = [{'folio': folio, 'path': str(p.relative_to(ROOT)), 'sha256': sha(p)} for folio, p in zip(data['folios'], pages)]
            images[key] = pages
            reports.append({'pdf': item['pdf'], 'pages': len(texts), 'folios': data['folios'], 'cssTrimMm': [185, 240], 'actualMediaBoxMm': [round(n * 25.4 / 72, 6) for n in expected_size], 'matchesFrozenComponentSize': True, 'textAndBounds': 'pass', 'characters': sum(len(x) for x in character_geometry)})

for component in ['guide-key', 'index']:
    reference = signatures[('imperial', component, 'clean')]
    for units in ['imperial', 'metric']:
        for variant in ['clean', 'highlight']:
            assert signatures[(units, component, variant)] == reference, (units, component, variant)
    for variant in ['clean', 'highlight']:
        for a, b in zip(images[('imperial', component, variant)], images[('metric', component, variant)]):
            assert sha(a) == sha(b), ('Edition raster differs', a, b)

# A five-page contact sheet for each variant; full-size page renders are retained.
contacts = []
for variant in ['clean', 'highlight']:
    paths = images[('imperial', 'guide-key', variant)] + images[('imperial', 'index', variant)]
    canvas = Image.new('RGB', (5 * 370, 520), '#d9dfcf')
    draw = ImageDraw.Draw(canvas)
    for i, (p, folio) in enumerate(zip(paths, [9, 162, 163, 164, 165])):
        im = Image.open(p).convert('RGB'); im.thumbnail((350, 470))
        canvas.paste(im, (i * 370 + 10, 30)); draw.text((i * 370 + 12, 8), f'{folio} — {variant}', fill='#173e2c')
    dest = DIR / f'{variant}-contact.png'; canvas.save(dest); contacts.append(str(dest.relative_to(ROOT)))

report = {'status': 'PDF checks passed; visual review recorded separately', 'proofs': reports, 'sameCharacterGeometryAcrossUnitsAndHighlightVariants': True, 'sameRasterBytesBetweenUnits': True, 'contactSheets': contacts, 'coverage': 'All 20 PDF pages: page 9 plus four index pages, clean/highlight, imperial/metric. All expected DOM text blocks found in actual PDFs. Entire both-unit renders compared exactly.', 'geometryNote': 'Actual MediaBoxes retain the approved standalone component’s Chromium rounding (184.827326 × 239.860660 mm). Whole-book assembly normalises its reused component pages to exact 185 × 240 mm; this focused derivative does not modify that assembly.'}
(DIR / 'PDF-CHECKS.json').write_text(json.dumps(report, indent=2) + '\n')
manifest['status'] = report['status']
manifest['pdfChecks'] = str((DIR / 'PDF-CHECKS.json').relative_to(ROOT))
manifest['contactSheets'] = contacts
(DIR / 'PROOF-MANIFEST.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({'pdfs': len(reports), 'pagesChecked': sum(x['pages'] for x in reports), 'sameGeometry': True, 'sameEditionRasters': True}))
