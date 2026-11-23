"""Compare a separate supplier-compatibility trial with the approved interior."""
from pathlib import Path
import difflib
import hashlib
import json
import multiprocessing as mp
import os
import re

import numpy as np
import pypdfium2 as pdfium
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[5]
DOC = Path(os.environ.get('VG_CHECKS_DIR', str(Path(__file__).resolve().parent)))
SOURCE = ROOT / 'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Corrected-Headers.pdf'
TRIAL = Path(os.environ.get('VG_CANDIDATE', str(ROOT / 'tmp/pdfs/bookvault-supplier-compatibility/Vegetable-Guru-Interior-PDFX3-Candidate.pdf')))
SELECTED = {19, 24, 98, 154, 163, 168}


def initialise():
    global before_doc, after_doc
    before_doc = pdfium.PdfDocument(str(SOURCE))
    after_doc = pdfium.PdfDocument(str(TRIAL))


def compare(index):
    a, b = before_doc[index], after_doc[index]
    ta, tb = a.get_textpage(), b.get_textpage()
    at, bt = ta.get_text_range(), tb.get_text_range()
    norm = lambda x: re.sub(r'\s+', '', x)
    ai, bi = a.render(scale=100 / 72).to_pil().convert('RGB'), b.render(scale=100 / 72).to_pil().convert('RGB')
    aa, bb = np.asarray(ai), np.asarray(bi)
    assert aa.shape == bb.shape
    diff = np.abs(aa.astype(np.int16) - bb.astype(np.int16))
    result = {
        'folio': index + 1,
        'pixels': ai.width * ai.height,
        'changedPixels': int(np.any(diff, axis=2).sum()),
        'pixelsOver2': int(np.any(diff > 2, axis=2).sum()),
        'meanAbsoluteChannelDifference': float(diff.mean()),
        'maximumChannelDifference': int(diff.max()),
        'textEqualIgnoringWhitespace': norm(at) == norm(bt),
        'sourceTextLength': len(norm(at)),
        'candidateTextLength': len(norm(bt)),
    }
    if norm(at) != norm(bt):
        result['textDifference'] = '\n'.join(difflib.unified_diff(at.splitlines(), bt.splitlines(), n=1))[:3000]
    if index + 1 in SELECTED:
        for label, page in [('source', a), ('candidate', b)]:
            page.render(scale=144 / 72).to_pil().convert('RGB').save(DOC / f'{index+1:03d}-{label}.jpg', quality=95)
    ta.close(); tb.close(); a.close(); b.close()
    return result


if __name__ == '__main__':
    r1, r2 = PdfReader(SOURCE), PdfReader(TRIAL)
    assert len(r1.pages) == len(r2.pages) == 174
    boxes = []
    for i, (a, b) in enumerate(zip(r1.pages, r2.pages), 1):
        boxes.append({'folio': i, 'maximumBoxDifferencePoints': max(abs(float(x)-float(y)) for k in ('/MediaBox', '/TrimBox', '/BleedBox') for x, y in zip(a[k], b[k]))})
    def intent(r):
        return hashlib.sha256(r.trailer['/Root']['/OutputIntents'][0].get_object()['/DestOutputProfile'].get_object().get_data()).hexdigest()
    with mp.Pool(4, initializer=initialise) as pool:
        pages = list(pool.imap(compare, range(174)))
    result = {
        'source': str(SOURCE), 'candidate': str(TRIAL),
        'candidateBytes': TRIAL.stat().st_size,
        'candidateSHA256': hashlib.file_digest(TRIAL.open('rb'), 'sha256').hexdigest(),
        'sourceOutputIntentSHA256': intent(r1), 'candidateOutputIntentSHA256': intent(r2),
        'pdfxMetadata': str(r2.metadata), 'pageBoxes': boxes, 'pageComparisons': pages,
        'status': 'Diagnostic candidate; inspect comparison results before any upload.',
    }
    (DOC / 'CANDIDATE-CHECKS.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({
        'bytes': result['candidateBytes'],
        'intentEqual': intent(r1) == intent(r2),
        'maximumBoxDifferencePoints': max(p['maximumBoxDifferencePoints'] for p in boxes),
        'textDifferences': [p for p in pages if not p['textEqualIgnoringWhitespace']],
        'worstPixelDifferences': sorted(pages, key=lambda p:p['meanAbsoluteChannelDifference'], reverse=True)[:8],
    }, indent=2))
