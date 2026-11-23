"""Isolate SemiBold replacement on three pages of the exact fraction-cleanup PDF.

HarfBuzz/FreeType instantiate the repository's original variable WOFF2 at 700.
Only the relevant font switches and text-show instructions are changed. Existing
text matrices, colours, image streams, page geometry and all other text remain.
"""
from io import BytesIO
from pathlib import Path
import hashlib
import json
import re
import runpy
import struct
import subprocess

from pypdf import PdfReader, PdfWriter
from pypdf._cmap import get_encoding
from pypdf.generic import ContentStream, DecodedStreamObject, NameObject, NumberObject
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont, TTFontFile, TTFontMaker
from reportlab.pdfgen import canvas

DOC = Path(__file__).resolve().parent
ROOT = DOC.parents[4]
SOURCE = ROOT / 'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Nunito-Fractions.pdf'
OUTPUT = SOURCE.with_name('Vegetable-Guru-Interior-Nunito-Bold.pdf')
EXPECTED = 'a7af3c88d43d7671a7e4904269f30af350b9be9194ea2dd74c4ccc09b1435b12'
FONT_SOURCE = ROOT / 'public/fonts/richer-a-6.woff2'
FONT = DOC / 'NunitoSans12pt-Bold.ttf'
HB = '/opt/homebrew/opt/harfbuzz/bin/hb-subset'


def sha(path):
    return hashlib.file_digest(path.open('rb'), 'sha256').hexdigest()


def instantiate():
    raw = DOC / 'NunitoSans700-instance.ttf'
    subprocess.run([HB, '--face-loader=ft', f'--font-file={FONT_SOURCE}',
                    '--unicodes=*', '--variations=wght=700', f'--output-file={raw}'], check=True)
    f = TTFontFile(str(raw))
    assert 'fvar' not in f.table
    # HarfBuzz instantiates outlines/metrics, but retains variable-source names.
    # Give the actual static instance accurate names and weight/style flags.
    name = f.get_table('name')
    version, count, start = struct.unpack_from('>HHH', name)
    assert version == 0
    replacements = {1: 'Nunito Sans 12pt', 2: 'Bold', 3: '3.101;NONE;NunitoSans12pt-Bold',
                    4: 'Nunito Sans 12pt Bold', 6: 'NunitoSans12pt-Bold',
                    16: 'Nunito Sans 12pt', 17: 'Bold', 18: 'Nunito Sans 12pt Bold'}
    records, storage = [], bytearray()
    for i in range(count):
        platform, encoding, language, ident, length, offset = struct.unpack_from('>6H', name, 6 + i * 12)
        data = name[start + offset:start + offset + length]
        if ident in replacements:
            data = replacements[ident].encode('utf-16-be' if platform in (0, 3) else 'mac-roman')
        records.append(struct.pack('>6H', platform, encoding, language, ident, len(data), len(storage)))
        storage.extend(data)
    maker = TTFontMaker()
    for tag in f.table:
        data = f.get_table(tag)
        if tag == 'name':
            data = struct.pack('>HHH', 0, count, 6 + count * 12) + b''.join(records) + storage
        elif tag == 'OS/2':
            data = bytearray(data)
            assert struct.unpack_from('>H', data, 4)[0] == 700
            flags = struct.unpack_from('>H', data, 62)[0]
            struct.pack_into('>H', data, 62, (flags & ~64) | 32)
            data = bytes(data)
        elif tag == 'head':
            data = bytearray(data)
            struct.pack_into('>H', data, 44, struct.unpack_from('>H', data, 44)[0] | 1)
            data = bytes(data)
        maker.add(tag, data)
    FONT.write_bytes(maker.makeStream())
    return TTFontFile(str(FONT), validate=1)


def strings(line, reader):
    s = DecodedStreamObject(); s.set_data(line)
    operations = ContentStream(s, reader).operations
    assert len(operations) == 1 or (len(operations) == 2 and operations[0][1] == b'T*')
    operands, op = operations[-1]
    return list(operands[0]) if op == b'TJ' else list(operands)


def raw_bytes(obj):
    return obj.original_bytes if hasattr(obj, 'original_bytes') else bytes(obj)


def decode(obj):
    data = raw_bytes(obj)
    assert all(c < 128 or c == 223 for c in data), data
    # The source font's byte 223 is the fl ligature, with /ActualText "fl".
    return ''.join('fl' if c == 223 else chr(c) for c in data)


def main():
    assert sha(SOURCE) == EXPECTED
    reader = PdfReader(SOURCE)
    font_file = instantiate()
    runs, source_fonts = [], {}
    for folio in (1, 2, 3):
        page = reader.pages[folio - 1]
        key = '/R20' if folio == 1 else '/R32'
        font = page['/Resources']['/Font'][key]
        assert '_Sem' in str(font['/BaseFont'])
        source_fonts[folio] = font
        active = None
        for line in page.get_contents().get_data().splitlines(keepends=True):
            match = re.fullmatch(rb'(/\w+) ([\d.]+) Tf\s*', line)
            if match:
                active = match[1].decode()
            elif active == key and line.rstrip().endswith((b'Tj', b'TJ')):
                parts = strings(line, reader)
                text = ''.join(decode(p) for p in parts if isinstance(p, (str, bytes)))
                runs.append({'folio': folio, 'line': line, 'parts': parts, 'text': text})
    assert len(runs) == 84
    assert [r['text'] for r in runs if r['folio'] == 1] == ['Traditional measurements edition']
    chars = set(''.join(r['text'] for r in runs))
    assert all(font_file.charToGlyph.get(ord(c), 0) > 0 for c in chars)
    pdfmetrics.registerFont(TTFont('VGBold', str(FONT)))
    donor_path = DOC / 'Bold-font-donor.pdf'
    c = canvas.Canvas(str(donor_path), pageCompression=1, invariant=1)
    c.setFont('VGBold', 10)
    c.drawString(20, 800, ''.join(sorted(chars)))
    c.save()
    donor = PdfReader(donor_path)
    candidates = [v.get_object() for v in donor.pages[0]['/Resources']['/Font'].values()
                  if 'NunitoSans12pt-Bold' in str(v.get_object().get('/BaseFont', ''))]
    assert len(candidates) == 1
    new_font = candidates[0]
    encoding, mapping = get_encoding(new_font)
    inverse = {mapping.get(ch, ch): code for code, ch in encoding.items()}
    assert chars <= inverse.keys()
    writer = PdfWriter(clone_from=reader)
    new_ref = new_font.clone(writer).indirect_reference
    assert new_ref is not None
    new_ref.get_object()['/FontDescriptor'][NameObject('/FontWeight')] = NumberObject(700)
    changes = []
    for folio in (1, 2, 3):
        page = writer.pages[folio - 1]
        old_key = '/R20' if folio == 1 else '/R32'
        font = source_fonts[folio]
        active = None
        size = None
        cumulative_ligature_shift = 0
        data = page.get_contents().get_data()
        output = []
        changed = []
        for line in data.splitlines(keepends=True):
            match = re.fullmatch(rb'(/\w+) ([\d.]+) Tf\s*', line)
            if match:
                active, size = match[1].decode(), float(match[2])
                if active == old_key:
                    line = line.replace(match[1], b'/VGBold', 1)
            elif active == old_key and line.rstrip().endswith((b'Tj', b'TJ')):
                parts = strings(line, reader)
                text = ''.join(decode(p) for p in parts if isinstance(p, (str, bytes)))
                before = sum(float(font['/Widths'][code - int(font['/FirstChar'])])
                             for p in parts if isinstance(p, (str, bytes)) for code in raw_bytes(p))
                after = sum(font_file.charWidths[ord(ch)] for ch in text)
                adjustment = sum(float(p) for p in parts if not isinstance(p, (str, bytes)))
                delta = (after - before) * size / 1000
                offset = -delta / 2 if folio == 1 else 0
                if folio == 2 and text in ('fl', 'ower'):
                    offset = cumulative_ligature_shift
                if folio == 2 and text in ('Cauli', 'fl'):
                    cumulative_ligature_shift += delta
                emitted = []
                if offset:
                    emitted.append(f'{-offset * 1000 / size:.9f}'.encode())
                for p in parts:
                    if isinstance(p, (str, bytes)):
                        encoded = bytes(inverse[ch] for ch in decode(p))
                        emitted.append(b'<' + encoded.hex().encode() + b'>')
                    else:
                        emitted.append(str(p).encode())
                prefix = b'T*' if line.startswith(b'T*') else b''
                line = prefix + b'[' + b' '.join(emitted) + b']TJ\n'
                changed.append({'text': text, 'sizePoints': size,
                                'oldAdvancePoints': (before - adjustment) * size / 1000,
                                'newAdvancePoints': (after - adjustment) * size / 1000,
                                'textOnlyShiftPoints': offset})
            output.append(line)
        edited = b''.join(output)
        stream = DecodedStreamObject(); stream.set_data(edited)
        page[NameObject('/Contents')] = writer._add_object(stream.flate_encode())
        fonts = page['/Resources']['/Font']
        del fonts[NameObject(old_key)]
        fonts[NameObject('/VGBold')] = new_ref
        changes.append({'folio': folio, 'removedResource': old_key, 'addedResource': '/VGBold',
                        'runs': changed, 'sourceContentSHA256': hashlib.sha256(data).hexdigest(),
                        'outputContentSHA256': hashlib.sha256(edited).hexdigest()})
    helper = runpy.run_path(str(DOC.parent / 'font-inventory/replace-fractions.py'))
    removed = helper['remove_unreachable'](writer)
    writer.write(OUTPUT)
    report = {'date': '2026-11-23', 'authorisation': "Ok, let's do that.",
              'scope': 'SemiBold to genuine Bold on title edition line and ordinary contents labels only; retain fraction fix.',
              'source': str(SOURCE.relative_to(ROOT)), 'sourceSHA256': EXPECTED,
              'output': str(OUTPUT.relative_to(ROOT)), 'bytes': OUTPUT.stat().st_size, 'sha256': sha(OUTPUT),
              'fontSource': str(FONT_SOURCE.relative_to(ROOT)), 'fontSourceSHA256': sha(FONT_SOURCE),
              'staticFont': str(FONT.relative_to(ROOT)), 'staticFontSHA256': sha(FONT),
              'instantiation': 'HarfBuzz with FreeType WOFF2 loader, wght=700; correct static naming/style metadata; no synthetic bold.',
              'fontWeight': 700, 'neededCharacters': ''.join(sorted(chars)), 'allGlyphsPresent': True,
              'changes': changes, 'unreachableObjectsRemoved': removed, 'supplierUpload': False}
    (DOC / 'REPLACEMENT.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k not in ('changes', 'unreachableObjectsRemoved')}, indent=2))


if __name__ == '__main__':
    main()
