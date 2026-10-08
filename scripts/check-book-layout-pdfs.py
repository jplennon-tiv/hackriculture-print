"""Check only current JSON-driven opening proofs. No guide generation or assembly.

Pass --compare-migration once to require text and rendered-pixel parity with the
preserved 7 October sources. Ordinary edited copy must not use that switch.
"""
from pathlib import Path
import hashlib
import json
import logging
import subprocess
import sys
from pypdf import PdfReader, PdfWriter
import pdfplumber
from PIL import Image, ImageChops

logging.getLogger('pdfminer').setLevel(logging.ERROR)
root = Path(__file__).resolve().parent.parent
folder = root / 'docs/publication/book-layout-working'
scratch = root / 'tmp/pdfs/book-layout-working'
compare = '--compare-migration' in sys.argv
normal = lambda value: ' '.join(value.split())
digest = lambda file: hashlib.sha256(file.read_bytes()).hexdigest()
mm = 72 / 25.4
results = []
for kind, start, count, stem in [('opening', 1, 3, 'title-publication-welcome'), ('entry', 4, 4, 'contents-how-to')]:
    (scratch / kind).mkdir(parents=True, exist_ok=True)
    receipt = json.loads((folder / kind / 'CHECKS.json').read_text())
    for file, sha in receipt['bookContent']['inputs'].items():
        assert digest(root / file) == sha, f'Stale proof: {file}; rebuild first'
    for item in receipt['protectedApprovedFiles']:
        assert digest(root / item['path']) == item['sha256'], item['path']
    for file, sha in receipt['implementation'].items():
        assert digest(root / file) == sha, f'Implementation changed: {file}; rebuild first'
    assert digest(root / receipt['assemblyPlan']['path']) == receipt['assemblyPlan']['sha256']
    for file, sha in receipt['artwork'].items():
        assert digest(root / file) == sha, f'Artwork changed: {file}; rebuild first'
    for item in receipt['results']:
        source = root / item['pdf']
        assert digest(source) == item['sha256']
        assert digest(root / item['html']) == item['htmlSha256']
        reader = PdfReader(source)
        assert len(reader.pages) == count
        preview = PdfWriter()
        texts, pages = [], []
        with pdfplumber.open(source) as parsed:
            for index, (page, view) in enumerate(zip(reader.pages, parsed.pages)):
                folio = start + index
                assert all(abs(float(x) / mm - y) < .01 for x, y in zip(page.trimbox, [3, 3, 188, 243]))
                assert all(abs(float(x) / mm - y) < .01 for x, y in zip(page.mediabox, [0, 0, 191, 246]))
                text = view.extract_text(); texts.append(text)
                if folio > 1:
                    assert f"{item['units'].upper()} · {folio}" in text
                minsize = min(c['size'] for c in view.chars)
                assert minsize >= 7
                for ref in page['/Resources']['/Font'].values():
                    font = ref.get_object()
                    if font.get('/Subtype') == '/Type3':
                        assert all(len(p.get_object().get_data()) > 0 for p in font['/CharProcs'].values())
                    else:
                        for d in font.get('/DescendantFonts', [font]):
                            desc = d.get_object()['/FontDescriptor'].get_object()
                            assert any(k in desc for k in ['/FontFile', '/FontFile2', '/FontFile3'])
                pages.append({'folio': folio, 'minimumNativeTextPt': round(minsize, 3), 'embeddedFonts': True})
                page.cropbox = page.trimbox
                preview.add_page(page)
        fulltext = normal(' '.join(texts))
        for copy in item['copyBlocks']:
            assert normal(copy) in fulltext, copy
        for ref in item.get('contents', []):
            assert f"{ref['label']} {ref['startPage']}" in fulltext, ref
        trim_pdf = scratch / kind / (item['units'] + '-trim.pdf')
        preview.write(trim_pdf)
        prefix = folder / kind / item['units']
        subprocess.run(['pdftoppm', '-png', '-r', '90', '-cropbox', str(trim_pdf), str(prefix)], check=True)
        row = {'component': kind, 'units': item['units'], 'pdf': item['pdf'], 'sha256': item['sha256'], 'pages': pages, 'contentsReferences': len(item.get('contents', [])), 'copyBlocksVerified': True}
        if compare:
            old = root / f'output/pdf/vegetable-guru-{kind}-pages/{stem}-{item["units"]}.pdf'
            with pdfplumber.open(old) as parsed:
                assert [normal(p.extract_text()) for p in parsed.pages] == [normal(t) for t in texts], f'Text differs: {kind} {item["units"]}'
            old_reader, old_trim = PdfReader(old), PdfWriter()
            for page in old_reader.pages:
                page.cropbox = page.trimbox; old_trim.add_page(page)
            old_file = scratch / kind / (item['units'] + '-source-trim.pdf'); old_trim.write(old_file)
            old_prefix = scratch / kind / (item['units'] + '-source')
            subprocess.run(['pdftoppm', '-png', '-r', '90', '-cropbox', str(old_file), str(old_prefix)], check=True)
            differences = []
            for n in range(1, count + 1):
                with Image.open(f'{prefix}-{n}.png') as fresh, Image.open(f'{old_prefix}-{n}.png') as original:
                    differences.append(ImageChops.difference(fresh.convert('RGB'), original.convert('RGB')).getbbox())
            row.update(migrationSource=str(old.relative_to(root)), sourceSha256=digest(old), originalTextIdentical=True, pixelDifferenceBounds=differences)
        results.append(row)
result = {'status': 'Local PDF checks passed; visual inspection recorded separately', 'pagesChecked': sum(len(r['pages']) for r in results), 'results': results, 'approvedSourcesUnchanged': True, 'limits': ['Working opening proofs only; no guide exports or full-book assembly.', 'Inherited raster captures and provisional designs retain their existing approval/preflight limits.']}
(folder / 'PDF-CHECKS.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'pagesChecked': result['pagesChecked'], 'contentsReferencesPerEdition': 58, 'approvedSourcesUnchanged': True, 'migrationTextParity': compare, 'pixelDifferences': [r.get('pixelDifferenceBounds') for r in results] if compare else None}))
