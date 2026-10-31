"""Update bounded numeric references using their existing embedded PDF font.

Chromium's native runs position individual glyphs with Td. Preserve the prefix,
replace only the number range, and advance the suffix by the new measured width.
No covering rectangle, hidden old text, font substitution or paragraph reflow.
"""
from pypdf import PageObject
from pypdf.generic import ContentStream, ByteStringObject, FloatObject, NameObject, NumberObject, ArrayObject
from pypdf._cmap import get_encoding


def font_glyphs(font):
    encoding, mapping = get_encoding(font)
    assert isinstance(encoding, dict)
    names = {}
    code = 0
    for value in font['/Encoding']['/Differences']:
        if isinstance(value, int): code = value
        else:
            names[code] = value
            code += 1
    return {mapping.get(c, c): (b, names[b]) for b, c in encoding.items() if b in names and names[b] != '/g0'}


def embedded_fonts(reader):
    result = []
    seen = set()
    def visit(obj):
        resources = obj.get('/Resources', {})
        for ref in resources.get('/Font', {}).values():
            font = ref.get_object()
            if font.get('/Subtype') == '/Type3' and ref.idnum not in seen:
                seen.add(ref.idnum); result.append(font)
        for ref in resources.get('/XObject', {}).values():
            form = ref.get_object()
            if form.get('/Subtype') == '/Form': visit(form)
    for page in reader.pages: visit(page)
    return result


def complete_font(font, text, donors, pdf):
    """Copy missing digits from an exact matching embedded font subset."""
    known = font_glyphs(font)
    for char in set(text) - known.keys():
        assert char in '0123456789, –', ('Unexpected new glyph', char)
        descriptor = font['/FontDescriptor']
        for donor in donors:
            other = donor['/FontDescriptor']
            if any(descriptor.get(k) != other.get(k) for k in ['/FontFamily','/FontWeight','/FontStretch','/ItalicAngle']): continue
            if font['/FontMatrix'] != donor['/FontMatrix']: continue
            glyphs = font_glyphs(donor)
            common = known.keys() & glyphs.keys()
            if char not in glyphs or len(common) < 3: continue
            if any(font['/CharProcs'][known[c][1]].get_object().get_data() != donor['/CharProcs'][glyphs[c][1]].get_object().get_data() for c in common): continue
            code, name = glyphs[char]
            assert code not in [b for b, _ in known.values()]
            font['/CharProcs'][name] = donor['/CharProcs'][name].clone(pdf).indirect_reference
            font['/Encoding']['/Differences'].extend([NumberObject(code), name])
            widths = font['/Widths']
            while len(widths) <= code-int(font['/FirstChar']): widths.append(NumberObject(0))
            widths[code-int(font['/FirstChar'])] = donor['/Widths'][code-int(donor['/FirstChar'])]
            font[NameObject('/LastChar')] = NumberObject(max(int(font['/LastChar']),code))
            font[NameObject('/FontBBox')] = ArrayObject([FloatObject(min(float(font['/FontBBox'][i]),float(donor['/FontBBox'][i])) if i<2 else max(float(font['/FontBBox'][i]),float(donor['/FontBBox'][i]))) for i in range(4)])
            cmap = font['/ToUnicode'].get_object()
            addition=f'1 beginbfchar\n<{code:02X}> <{ord(char):04X}>\nendbfchar\n'.encode()
            cmap.set_data(cmap.get_data().replace(b'endcmap',addition+b'endcmap'))
            known = font_glyphs(font)
            assert char in known
            break
        else: raise AssertionError(('No identical embedded glyph source',char))


def replace_reference(obj, pdf, old, new, donors):
    resources = obj.get('/Resources', {})
    fonts = {k: v.get_object() for k, v in resources.get('/Font', {}).items()}
    maps = {k: get_encoding(v) for k, v in fonts.items()}
    stream = obj.get_contents() if isinstance(obj, PageObject) else ContentStream(obj, pdf)
    active = None
    size = None
    runs = []
    blocks = []
    for i, (args, op) in enumerate(stream.operations):
        if op == b'BT':
            runs = []
        elif op == b'Tf':
            active, size = args[0], float(args[1])
        elif op == b'Tj':
            encoding, mapping = maps[active]
            value = args[0]
            raw = value.original_bytes if isinstance(value, str) else bytes(value)
            coded = raw.decode(encoding) if isinstance(encoding, str) else ''.join(encoding.get(b, chr(b)) for b in raw)
            text = ''.join(mapping.get(c, c) for c in coded)
            runs.append((i, text, active, size))
        elif op == b'ET':
            text = ''.join(r[1] for r in runs)
            if old in text:
                assert text.count(old) == 1
                blocks.append((runs[:], text.index(old)))
    changed = 0
    for runs, start in reversed(blocks):
        pos = 0
        chosen = []
        for run in runs:
            if start <= pos < start + len(old):
                chosen.append(run)
            pos += len(run[1])
        assert ''.join(r[1] for r in chosen) == old, 'Reference must align to complete text runs'
        first, last = chosen[0][0], chosen[-1][0]
        font_key, font_size = chosen[0][2:]
        assert all(r[2:] == (font_key, font_size) for r in chosen)
        font = fonts[font_key]
        assert font['/Subtype'] == '/Type3', 'Expected the existing native Nunito font'
        complete_font(font,new,donors,pdf)
        reverse = {char:code for char,(code,name) in font_glyphs(font).items()}
        encoded = bytes(reverse[c] for c in new)
        widths = font['/Widths']
        first_char = int(font['/FirstChar'])
        advance = sum(float(widths[b-first_char]) for b in encoded) * font_size / 1000
        assert all(op in (b'Tj', b'Td') for _, op in stream.operations[first:last+1])
        following, op = stream.operations[last+1]
        assert op == b'Td' and float(following[1]) == 0, 'Expected same-line suffix'
        stream.operations[last+1] = ([FloatObject(advance), following[1]], op)
        stream.operations[first:last+1] = [([ByteStringObject(encoded)], b'Tj')]
        changed += 1
    if changed:
        if isinstance(obj, PageObject):
            obj.replace_contents(stream)
        else:
            obj.set_data(stream.get_data())
    for ref in resources.get('/XObject', {}).values():
        form = ref.get_object()
        if form.get('/Subtype') == '/Form':
            changed += replace_reference(form, pdf, old, new, donors)
    return changed
