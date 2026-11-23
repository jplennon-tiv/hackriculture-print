"""Verify a strictly image-only resolution test against its exact input."""
from pathlib import Path
import hashlib
import importlib.util
import json
import multiprocessing as mp
import subprocess
from collections import Counter

import numpy as np
import pypdfium2 as pdfium
from pypdf import PdfReader

DOC = Path(__file__).resolve().parent
ROOT = DOC.parents[4]


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


build = module('build300', DOC / 'build-all-300dpi.py')
old_verify = module('old_verify', DOC.parent / 'image-payload-retry/verify-payload.py')
font_verify = module('font_verify', DOC.parent / 'font-inventory/verify-fractions.py')
SOURCE, OUTPUT = build.SOURCE, build.OUTPUT
DETAILS = {7, 24, 25, 61, 67, 98, 146, 167}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def init():
    global before, after
    before, after = pdfium.PdfDocument(SOURCE), pdfium.PdfDocument(OUTPUT)


def compare(folio):
    a, b = before[folio - 1], after[folio - 1]
    ta, tb = a.get_textpage(), b.get_textpage()
    assert ta.get_text_range() == tb.get_text_range(), ('text', folio)
    ca, cb = ta.count_chars(), tb.count_chars()
    assert ca == cb
    geometry = max((max(abs(x-y) for x,y in zip(ta.get_charbox(j), tb.get_charbox(j))) for j in range(ca)), default=0)
    assert geometry == 0, ('text geometry', folio, geometry)
    ai, bi = a.render(scale=100/72).to_pil().convert('RGB'), b.render(scale=100/72).to_pil().convert('RGB')
    aa, bb = np.asarray(ai), np.asarray(bi)
    assert aa.shape == bb.shape
    diff = np.abs(aa.astype(np.int16) - bb.astype(np.int16))
    result = {'folio': folio, 'textExact': True, 'characters': ca, 'maximumGlyphBoxDifferencePoints': geometry,
              'pixelsChangedAt100dpi': int(np.any(diff, axis=2).sum()), 'meanAbsoluteChannelDifference': float(diff.mean())}
    if folio in DETAILS:
        for label, page in [('before', a), ('after', b)]:
            page.render(scale=300/72).to_pil().convert('RGB').save(DOC/f'{folio:03d}-{label}.jpg', quality=97)
    ta.close(); tb.close(); a.close(); b.close()
    return result


def main():
    plan = json.loads((DOC / 'IMAGE-CHANGES.json').read_text())
    a, b = PdfReader(SOURCE), PdfReader(OUTPUT)
    assert len(a.pages) == len(b.pages) == 174
    fa, fb = font_verify.fingerprint_factory(), font_verify.fingerprint_factory()
    checks = {'source': plan['source'], 'candidate': plan['output'], 'candidateBytes': OUTPUT.stat().st_size,
              'candidateSHA256': hashlib.file_digest(OUTPUT.open('rb'), 'sha256').hexdigest(), 'pageCount': 174}
    checks['exactPageBoxes'] = all(list(pa[k]) == list(pb[k]) for pa,pb in zip(a.pages,b.pages) for k in ('/MediaBox','/CropBox','/TrimBox','/BleedBox'))
    checks['allPageInstructionsExact'] = all(pa.get_contents().get_data() == pb.get_contents().get_data() for pa,pb in zip(a.pages,b.pages))
    checks['allFontResourcesExact'] = all(fa(pa['/Resources'].get('/Font', {})) == fb(pb['/Resources'].get('/Font', {})) for pa,pb in zip(a.pages,b.pages))
    checks['allNonImageStreamsExact'] = old_verify.nonimage_streams(a) == old_verify.nonimage_streams(b)
    checks['metadataExact'] = dict(a.metadata) == dict(b.metadata)
    checks['outputIntentExact'] = fa(a.trailer['/Root']['/OutputIntents']) == fb(b.trailer['/Root']['/OutputIntents'])
    for key in ('exactPageBoxes','allPageInstructionsExact','allFontResourcesExact','allNonImageStreamsExact','metadataExact','outputIntentExact'):
        assert checks[key], key
    checks['preflight'] = build.reduce.helpers.preflight(b)
    assert not checks['preflight']['issues'], checks['preflight']
    print('Geometry, text instructions, fonts, metadata, profile and all non-image streams exact', flush=True)
    images, pages = build.reduce.resources(b)
    by_key = {(tuple(sorted(pages[i])), int(obj['/Width']), int(obj['/Height'])): obj for i,obj in images.items()}
    assert len(by_key) == len(images)
    for change in plan['changes']:
        obj = by_key[(tuple(change['folios']), *change['outputDimensions'])]
        assert sha(build.reduce.helpers.image_bytes(obj)) == change['resampledPixelsSHA256']
        assert sha(obj._data) == change['outputStreamSHA256']
        assert obj['/ColorSpace'] == '/DeviceCMYK'
    for retained in plan['preservedImages']:
        obj = by_key[(tuple(retained['folios']), *retained['dimensions'])]
        assert sha(obj._data) == retained['encodedSHA256']
    checks['changedImagesVerified'] = len(plan['changes'])
    checks['unchangedImageStreamsExact'] = len(plan['preservedImages'])
    poppler = Path('/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin')
    listing = subprocess.run([str(poppler/'pdfimages'), '-list', str(OUTPUT)], check=True, capture_output=True, text=True)
    assert not listing.stderr
    (DOC/'PDFIMAGES.txt').write_text(listing.stdout)
    rows = [line.split() for line in listing.stdout.splitlines()[2:]]
    checks['placedRasterImages'] = len(rows)
    checks['effectiveDpiCounts'] = dict(Counter('x'.join(row[12:14]) for row in rows))
    assert len(rows) == 356 and all(row[12:14] == ['300','300'] for row in rows)
    fonts = subprocess.run([str(poppler/'pdffonts'), str(OUTPUT)], check=True, capture_output=True, text=True)
    assert not fonts.stderr
    (DOC/'PDFFONTS.txt').write_text(fonts.stdout)
    font_rows = fonts.stdout.splitlines()[2:]
    checks['fontResourceCount'] = len(font_rows)
    checks['unembeddedFontRows'] = [row for row in font_rows if row.split()[-5] != 'yes']
    assert len(font_rows) == 1040 and not checks['unembeddedFontRows']
    print('All 356 image placements independently measured at 300 dpi; 1040 fonts reported embedded', flush=True)
    result = []
    with mp.Pool(3, initializer=init) as pool:
        for row in pool.imap(compare, range(1,175)):
            result.append(row)
            if len(result) % 25 == 0:
                print('Rendered and checked text:', len(result), flush=True)
    checks['pages'] = result
    checks['unchangedFolios'] = sorted(set(range(1,175)) - set(plan['changedFolios']))
    assert all(row['pixelsChangedAt100dpi'] == 0 for row in result if row['folio'] in checks['unchangedFolios'])
    checks['unchangedPagesPixelIdenticalAt100dpi'] = True
    checks['allTextExact'] = all(row['textExact'] for row in result)
    checks['maximumGlyphBoxDifferencePoints'] = max(row['maximumGlyphBoxDifferencePoints'] for row in result)
    (DOC/'CHECKS.json').write_text(json.dumps(checks, indent=2)+'\n')
    print(json.dumps({k:v for k,v in checks.items() if k not in ('pages','unchangedFolios')}, indent=2), flush=True)


if __name__ == '__main__':
    main()
