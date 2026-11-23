"""Add verified outward header bleed to the preserved production-colour PDF.

Original page streams, CMYK image bytes, native type and output intent survive.
Separate forms replace the bleed plus the earlier synthetic 0.2mm top/right
edge repair; practical-page fills remain wholly outside TrimBox.
"""
from pathlib import Path
import argparse, gc, hashlib, json
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, DictionaryObject, DecodedStreamObject, RectangleObject

ROOT = Path(__file__).resolve().parents[4]
DOC = Path(__file__).resolve().parent
SOURCE = ROOT / 'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Colour-Managed.pdf'
EXPECTED = '341ce74932cd81f6a8cc838b742ec7095e471d0ee7d9fcb7b247dd1b417e6b47'
TARGET = ROOT / 'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Corrected-Headers.pdf'
sha = lambda p: hashlib.file_digest(p.open('rb'), 'sha256').hexdigest()

def image_streams(page):
    return {str(k): hashlib.sha256(v.get_object()._data).hexdigest()
            for k, v in page['/Resources'].get('/XObject', {}).items()
            if v.get_object().get('/Subtype') == '/Image'}

def append(page, writer, commands):
    raw = page.get_contents().get_data()
    content = DecodedStreamObject()
    content.set_data(raw + b'\n' + commands)
    page[NameObject('/Contents')] = writer._add_object(content)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('overlay_pdf')
    ap.add_argument('folio_map', help='JSON list of folios, one per overlay page')
    args = ap.parse_args()
    overlay_path = Path(args.overlay_pdf).resolve()
    folios = json.loads(Path(args.folio_map).read_text())
    assert folios == list(range(8, 95, 2)) + list(range(98, 145))
    assert sha(SOURCE) == EXPECTED
    reader = PdfReader(SOURCE)
    overlays = PdfReader(overlay_path)
    assert len(overlays.pages) == len(folios)
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    records = []
    backgrounds = json.loads((DOC.parent / 'bleed/PRACTICAL-CMYK-BACKGROUNDS.json').read_text())
    assert [v['folio'] for v in backgrounds] == list(range(9, 96, 2))
    for item in backgrounds:
        p = writer.pages[item['folio'] - 1]
        colour = ' '.join(f'{v / 255:.12f}' for v in item['fillCMYK8bit'])
        w, h, y = map(float, (p.mediabox.width, p.mediabox.height, p.trimbox.top))
        append(p, writer, f'q {colour} k 0 {y:.12f} {w:.12f} {h-y:.12f} re f Q\n'.encode())
        records.append({'folio': item['folio'], 'method': 'Exact existing background fill in top 3mm bleed', 'cmyk8': item['fillCMYK8bit']})
    for folio, overlay in zip(folios, overlays.pages):
        p = writer.pages[folio - 1]
        assert abs(float(overlay.mediabox.width) - float(p.mediabox.width)) < 1e-5
        assert abs(float(overlay.mediabox.height) - float(p.mediabox.height)) < 1e-5
        form = DecodedStreamObject()
        form.set_data(overlay.get_contents().get_data())
        form.update({NameObject('/Type'): NameObject('/XObject'), NameObject('/Subtype'): NameObject('/Form'),
                     NameObject('/BBox'): RectangleObject(p.mediabox),
                     NameObject('/Resources'): overlay['/Resources'].clone(writer)})
        resources = DictionaryObject(dict(p['/Resources']))
        xobjects = DictionaryObject(dict(resources.get('/XObject', {})))
        name = NameObject('/VG_HEADER_BLEED_REPAIR')
        assert name not in xobjects
        xobjects[name] = writer._add_object(form)
        resources[NameObject('/XObject')] = xobjects
        p[NameObject('/Resources')] = resources
        # The original preparation also mirrored 0.2mm inside top/right trim
        # to hide a rounding hairline. Replace that synthetic sliver with true
        # artwork too; keep the rest of the trimmed page hard-clipped out.
        w, h = float(p.mediabox.width), float(p.mediabox.height)
        x, y, right, top = map(float, p.trimbox)
        repair = .2 * 72 / 25.4
        commands = f'q 0 0 {w:.12f} {h:.12f} re {x:.12f} {y:.12f} {right-x-repair:.12f} {top-y-repair:.12f} re W* n {name} Do Q\n'
        append(p, writer, commands.encode())
        records.append({'folio': folio, 'method': 'Genuine original outward artwork, CMYK strips, including only the prior synthetic 0.2mm top/right trim-edge repair', 'syntheticEdgeRepairMM': .2})
    writer.write(TARGET)
    del writer
    gc.collect()
    check = PdfReader(TARGET)
    affected = {r['folio'] for r in records}
    page_checks = []
    for f, (a, b) in enumerate(zip(reader.pages, check.pages), 1):
        old, new = a.get_contents().get_data(), b.get_contents().get_data()
        assert new.startswith(old) if f in affected else new == old, f
        assert image_streams(a) == image_streams(b), f
        for key in ('/MediaBox', '/CropBox', '/TrimBox', '/BleedBox'):
            assert a[key] == b[key], (f, key)
        assert set(a['/Resources'].get('/Font', {})) == set(b['/Resources'].get('/Font', {})), f
        page_checks.append({'folio': f, 'nativeContentsPreserved': True, 'originalCMYKImageStreamsIdentical': True, 'geometryUnchanged': True, 'bleedRepairAdded': f in affected})
    before_intent = reader.trailer['/Root']['/OutputIntents'][0].get_object()['/DestOutputProfile'].get_object().get_data()
    after_intent = check.trailer['/Root']['/OutputIntents'][0].get_object()['/DestOutputProfile'].get_object().get_data()
    assert before_intent == after_intent
    assert sha(SOURCE) == EXPECTED
    receipt = {'date': '2026-11-23', 'source': str(SOURCE.relative_to(ROOT)), 'sourceSHA256': EXPECTED,
               'output': str(TARGET.relative_to(ROOT)), 'sha256': sha(TARGET), 'bytes': TARGET.stat().st_size,
               'pageCount': len(check.pages), 'affectedPages': sorted(affected),
               'overlayPDF': str(overlay_path.relative_to(ROOT)), 'overlaySHA256': sha(overlay_path),
               'originalSourceUnchanged': True, 'outputIntentBytesIdentical': True,
               'repairs': sorted(records, key=lambda r: r['folio']), 'pageChecks': page_checks,
               'status': 'Built; actual PDF render verification required before release'}
    (DOC / 'INSTALL-CHECKS.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(TARGET, flush=True)
    print(receipt['sha256'], receipt['bytes'], flush=True)

if __name__ == '__main__':
    main()
