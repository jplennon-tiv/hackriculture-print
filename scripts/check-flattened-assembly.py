"""Check saved derivative books and compare representative assembly rasters.

Physical checks cover every page. Raster comparisons are explicitly sampled;
their success is not whole-book visual review or supplier/PDF-X acceptance.
"""
from pathlib import Path
import argparse, datetime, hashlib, json, subprocess
from pypdf import PdfReader
from PIL import Image, ImageChops

root = Path(__file__).resolve().parents[1]
evidence = root / 'docs/publication/book-preparation'
parser = argparse.ArgumentParser()
parser.add_argument('--supplier', choices=['kdp', 'bookvault'], required=True)
args = parser.parse_args()
receipt = evidence / f'ASSEMBLY-FLATTENED-{args.supplier.upper()}.json'
assembly = json.loads(receipt.read_text())
scratch = root / 'tmp/pdfs/book-preparation/flattened-assembly' / args.supplier
scratch.mkdir(parents=True, exist_ok=True)
digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
assert assembly['flatteningSignature'] == digest(root / 'scripts/flatten-book-pdf.py')

def resolved(value):
    return value.get_object() if hasattr(value, 'get_object') else value

def check_resources(res, fonts, seen):
    res = resolved(res)
    for ref in resolved(res.get('/Font', {})).values():
        font = resolved(ref)
        for child in font.get('/DescendantFonts', [font]):
            child = resolved(child)
            descriptor = resolved(child.get('/FontDescriptor', {}))
            embedded = child.get('/Subtype') == '/Type3' or any(k in descriptor for k in ('/FontFile', '/FontFile2', '/FontFile3'))
            assert embedded, ('Unembedded font', font.get('/BaseFont'))
            fonts.add(str(font.get('/BaseFont') or font.get('/Subtype')))
    for state in resolved(res.get('/ExtGState', {})).values():
        state = resolved(state)
        assert float(state.get('/ca', 1)) == 1 and float(state.get('/CA', 1)) == 1
        assert state.get('/BM', '/Normal') in ('/Normal', '/Compatible')
        assert state.get('/SMask', '/None') == '/None'
    for ref in resolved(res.get('/XObject', {})).values():
        ob = resolved(ref)
        if id(ob) in seen:
            continue
        seen.add(id(ob))
        assert '/SMask' not in ob and resolved(ob.get('/Group', {})).get('/S') != '/Transparency'
        if '/Resources' in ob:
            check_resources(ob['/Resources'], fonts, seen)

def render(pdf, page, name):
    prefix = scratch / name
    subprocess.run(['pdftoppm', '-f', str(page), '-l', str(page), '-scale-to', '1150', '-png', str(pdf), str(prefix)], check=True, timeout=90, stderr=subprocess.DEVNULL)
    return next(scratch.glob(name + '-*.png'))

report = {'checkedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'supplier': args.supplier, 'assemblyReceiptSha256': digest(receipt),
          'scope': 'Every assembled page: source text/boxes, fonts, transparency and folios; eight sampled non-blank rasters compared to flattened inputs, plus four sampled blank pages. Actual image viewing recorded separately. Not PDF/X or supplier approval.', 'results': []}
for edition in assembly['results']:
    pdf = root / edition['pdf']
    assert digest(pdf) == edition['sha256']
    reader = PdfReader(pdf)
    assert len(reader.pages) == edition['pages'] == 148
    assert not reader.is_encrypted
    assert not any(k in reader.trailer['/Root'] for k in ('/AcroForm', '/OpenAction', '/AA'))
    assert pdf.stat().st_size < 650_000_000
    assert not reader.metadata
    fonts, compared, samples = set(), set(), []
    for source in edition['sources']:
        source_pdf = root / source['pdf']
        assert digest(source_pdf) == source['sha256']
        individual = PdfReader(source_pdf)
        for local, original in enumerate(individual.pages, 1):
            folio = source['startPage'] + local - 1
            page = reader.pages[folio - 1]
            assert page.extract_text() == original.extract_text(), ('Text changed', folio)
            for box in ('/MediaBox', '/CropBox', '/TrimBox', '/BleedBox'):
                assert page[box] == original[box], ('Box changed', folio)
            assert not page.get('/Annots')
            assert resolved(page.get('/Group', {})).get('/S') != '/Transparency'
            check_resources(page['/Resources'], fonts, set())
            compared.add(folio)
        key = source['id'].split('/', 1)[1]
        local_samples = {'opening': [4], 'vegetable/kale': [1, 2], 'trouble/celery_troubles': [1]}.get(key, [])
        for local in local_samples:
            folio = source['startPage'] + local - 1
            name = f'{edition["units"]}-{folio}'
            a = render(pdf, folio, name + '-assembled')
            b = render(source_pdf, local, name + '-source')
            with Image.open(a) as aa, Image.open(b) as bb:
                assert aa.size == bb.size and ImageChops.difference(aa.convert('RGB'), bb.convert('RGB')).getbbox() is None
            samples.append({'physicalPage': folio, 'sourceId': source['id'], 'sourcePage': local, 'sourceSha256': source['sha256'], 'result': 'pixel_identical_to_flattened_input_at_1150px', 'raster': str(a.relative_to(root))})
    for folio in edition['blankFolios']:
        page = reader.pages[folio - 1]
        assert not page.extract_text().strip()
        assert page.get_contents() is not None
        assert [op for values, op in page.get_contents().operations] == [b'q', b'rg', b're', b'f', b'Q'], ('Unexpected blank-page paint', folio)
        check_resources(page.get('/Resources', {}), fonts, set())
        assert not page.get('/Annots') and resolved(page.get('/Group', {})).get('/S') != '/Transparency'
        if folio in (15, 91):
            raster = render(pdf, folio, f'{edition["units"]}-{folio}-blank')
            with Image.open(raster) as image:
                # Poppler's integer raster width leaves one antialiased edge
                # column for a fractional PDF boundary. Check the solid field
                # inset by one pixel, plus the exact paint-operation list above.
                field = image.convert('RGB').crop((1, 1, image.width - 1, image.height - 1))
                assert all(low == high for low, high in field.getextrema()), ('Blank page is not uniform', folio)
            samples.append({'physicalPage': folio, 'result': 'uniform_unprinted_background_inset_one_pixel; exact_solid_fill_operations', 'raster': str(raster.relative_to(root))})
        compared.add(folio)
    assert compared == set(range(1, len(reader.pages) + 1))
    report['results'].append({'units': edition['units'], 'pdf': edition['pdf'], 'sha256': edition['sha256'], 'pagesChecked': len(compared), 'fontNamesEmbedded': sorted(fonts), 'transparencyIssues': [], 'metadata': None, 'bytes': pdf.stat().st_size, 'samples': samples, 'visualReview': 'pending'})
    print(args.supplier, edition['units'], len(compared), 'assembled pages checked', flush=True)
target = evidence / f'FLATTENED-ASSEMBLY-CHECKS-{args.supplier.upper()}.json'
target.write_text(json.dumps(report, indent=2) + '\n')
