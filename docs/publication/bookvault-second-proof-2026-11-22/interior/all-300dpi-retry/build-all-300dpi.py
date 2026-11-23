"""Reduce every remaining 600-dpi CMYK image without rewriting text or colour."""
from collections import Counter
from pathlib import Path
import hashlib
import importlib.util
import json
import multiprocessing as mp
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DictionaryObject, NameObject, NumberObject

DOC = Path(__file__).resolve().parent
ROOT = DOC.parents[4]
SOURCE = ROOT / 'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Nunito-Bold.pdf'
OUTPUT = SOURCE.with_name('Vegetable-Guru-Interior-All-300dpi.pdf')
WORK = ROOT / 'tmp/pdfs/bookvault-all-300dpi'
EXPECTED_SHA = '9219a432b1be214452b48bbc68487c81f44affde17766ae56b28a7820a715243'
spec = importlib.util.spec_from_file_location('reduce_payload', DOC.parent / 'image-payload-retry/reduce-image-payload.py')
reduce = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reduce)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def resize(job):
    reduce.WORK = WORK
    return reduce.resize_job(job)


def main():
    assert not OUTPUT.exists(), 'Refusing to overwrite a diagnostic candidate'
    assert hashlib.file_digest(SOURCE.open('rb'), 'sha256').hexdigest() == EXPECTED_SHA
    WORK.mkdir(parents=True, exist_ok=True)
    reader = PdfReader(SOURCE)
    images, pages = reduce.resources(reader)
    # Poppler observes actual physical placement, independently of object size.
    rows = [line.split() for line in (DOC / 'SOURCE-PDFIMAGES.txt').read_text().splitlines()[2:]]
    placement_by_object = {}
    for row in rows:
        assert row[2] == 'image' and row[5] == 'cmyk' and row[7] == '8'
        placement_by_object.setdefault(int(row[10]), []).append([int(row[12]), int(row[13])])
    assert set(placement_by_object) == set(images)
    jobs, preserved = [], []
    for ident, obj in images.items():
        dims = (int(obj['/Width']), int(obj['/Height']))
        folios = sorted(pages[ident])
        ppi = placement_by_object[ident]
        if all(pair == [300, 300] for pair in ppi):
            preserved.append({'sourceObject': ident, 'folios': folios, 'dimensions': list(dims), 'encodedSHA256': sha(obj._data)})
            continue
        assert all(pair == [600, 600] for pair in ppi), (ident, ppi)
        assert dims in ((4512, 5812), (4512, 76), (76, 5812)), (ident, dims)
        assert obj['/ColorSpace'] == '/DeviceCMYK' and obj['/BitsPerComponent'] == 8
        assert obj['/Filter'] == '/FlateDecode' and obj['/DecodeParms']['/Predictor'] == 15
        assert obj['/DecodeParms']['/Colors'] == 4 and '/SMask' not in obj and '/Mask' not in obj
        jobs.append((ident, obj._data, *dims, folios))
    print(f'Resampling {len(jobs)} unique images; preserving {len(preserved)} existing 300-dpi images', flush=True)
    changes = []
    with mp.Pool(3) as pool:
        for change in pool.imap(resize, jobs):
            changes.append(change)
            if len(changes) % 15 == 0:
                print('Resampled', len(changes), flush=True)
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    cloned, cloned_pages = reduce.resources(writer)
    by_key = {(tuple(sorted(cloned_pages[i])), int(obj['/Width']), int(obj['/Height']), sha(obj._data)): obj for i, obj in cloned.items()}
    assert len(by_key) == len(cloned)
    for change in changes:
        old = images[change['sourceObject']]
        key = (tuple(change['folios']), *change['sourceDimensions'], sha(old._data))
        obj = by_key[key]
        obj._data = (WORK / f"{change['sourceObject']}.flate").read_bytes()
        obj[NameObject('/Width')] = NumberObject(change['outputDimensions'][0])
        obj[NameObject('/Height')] = NumberObject(change['outputDimensions'][1])
        params = DictionaryObject(dict(obj['/DecodeParms']))
        params[NameObject('/Columns')] = NumberObject(change['outputDimensions'][0])
        obj[NameObject('/DecodeParms')] = params
        if hasattr(obj, 'decoded_self'):
            obj.decoded_self = None
    writer.write(OUTPUT)
    report = {
        'source': str(SOURCE.relative_to(ROOT)), 'sourceSHA256': EXPECTED_SHA,
        'output': str(OUTPUT.relative_to(ROOT)), 'outputBytes': OUTPUT.stat().st_size,
        'outputSHA256': hashlib.file_digest(OUTPUT.open('rb'), 'sha256').hexdigest(),
        'sourceBytes': SOURCE.stat().st_size,
        'changedImageCount': len(changes), 'preservedImageCount': len(preserved),
        'changedDimensionCounts': dict(Counter('x'.join(map(str, c['sourceDimensions'])) for c in changes)),
        'changedFolios': sorted({p for c in changes for p in c['folios']}),
        'method': 'Only remaining 600-dpi CMYK image streams resampled by exactly two with Lanczos; lossless Flate/PNG-predictor encoding. No font, vector, page instruction or colour conversion.',
        'changes': changes, 'preservedImages': preserved,
    }
    (DOC / 'IMAGE-CHANGES.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({k:v for k,v in report.items() if k not in ('changes','preservedImages','changedFolios')}, indent=2), flush=True)


if __name__ == '__main__':
    main()
