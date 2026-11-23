"""Give distinct embedded TrueType subsets distinct PDF/PostScript names.

Only the SFNT name table and its required checksums change. All glyph, hinting,
metrics and character-mapping table bytes are asserted unchanged.
"""
from pathlib import Path
import argparse
import hashlib
import json
import struct

from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, NumberObject, DecodedStreamObject


def tables(data):
    result = {}
    for i in range(struct.unpack_from('>H', data, 4)[0]):
        tag, checksum, off, size = struct.unpack_from('>4sIII', data, 12 + 16*i)
        result[tag] = data[off:off+size]
    return result


def checksum(data):
    data += b'\0' * (-len(data) % 4)
    return sum(struct.unpack('>' + 'I'*(len(data)//4), data)) & 0xffffffff


def rename_sfnt(data, name):
    original = tables(data)
    changed = dict(original)
    table = original[b'name']
    fmt, count, offset = struct.unpack_from('>HHH', table)
    assert fmt == 0, 'Unexpected name-table format; do not guess'
    records, strings = bytearray(), bytearray()
    for i in range(count):
        platform, encoding, language, name_id, size, pos = struct.unpack_from('>HHHHHH', table, 6+12*i)
        raw = table[offset+pos:offset+pos+size]
        if name_id == 6:
            raw = name.encode('utf-16be' if platform in (0, 3) else 'ascii')
        records += struct.pack('>HHHHHH', platform, encoding, language, name_id, len(raw), len(strings))
        strings += raw
    changed[b'name'] = struct.pack('>HHH', 0, count, 6+12*count) + records + strings
    head = bytearray(changed[b'head'])
    head[8:12] = b'\0'*4
    changed[b'head'] = bytes(head)
    out = bytearray(data[:12])
    body = bytearray()
    offsets = {}
    for tag, value in changed.items():
        offsets[tag] = 12 + 16*len(changed) + len(body)
        out += struct.pack('>4sIII', tag, checksum(value), offsets[tag], len(value))
        body += value + b'\0'*(-len(value) % 4)
    out += body
    struct.pack_into('>I', out, offsets[b'head']+8, (0xb1b0afba-checksum(bytes(out))) & 0xffffffff)
    assert checksum(bytes(out)) == 0xb1b0afba
    final = tables(bytes(out))
    assert all(final[tag] == val for tag,val in original.items() if tag not in (b'name', b'head'))
    assert final[b'head'][:8] == original[b'head'][:8] and final[b'head'][12:] == original[b'head'][12:]
    return bytes(out)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--report', type=Path, required=True)
    args=parser.parse_args()
    r=PdfReader(args.source)
    w=PdfWriter(clone_from=r)
    changed_streams={}
    records=[]
    used_prefixes={}
    objects=list(w._objects)
    objects.extend(child.get_object() for obj in w._objects if isinstance(obj,dict)
                   and obj.get('/Subtype')=='/Type0' for child in obj['/DescendantFonts'])
    visited=set()
    for obj in objects:
        if not isinstance(obj,dict) or obj.get('/Type')!='/Font' or obj.get('/Subtype')=='/Type0':
            continue
        if id(obj) in visited:
            continue
        visited.add(id(obj))
        fd=obj.get('/FontDescriptor')
        fd=fd.get_object() if fd else None
        stream=fd.get('/FontFile2') if fd else None
        if not stream:
            continue
        data=stream.get_object().get_data()
        digest=hashlib.sha256(data).hexdigest()
        code=int(digest[:12],16)
        prefix=''
        for _ in range(6):
            prefix=chr(65+code%26)+prefix
            code//=26
        assert prefix not in used_prefixes or used_prefixes[prefix] == digest
        used_prefixes[prefix]=digest
        old=str(obj['/BaseFont'])
        name=prefix+'+'+old.lstrip('/').split('+')[-1]
        if digest not in changed_streams:
            final=rename_sfnt(data,name)
            newstream=DecodedStreamObject()
            newstream.set_data(final)
            newstream[NameObject('/Length1')]=NumberObject(len(final))
            changed_streams[digest]=w._add_object(newstream.flate_encode())
        fd[NameObject('/FontFile2')]=changed_streams[digest]
        fd[NameObject('/FontName')]=NameObject('/'+name)
        obj[NameObject('/BaseFont')]=NameObject('/'+name)
        records.append({'old':old,'new':name,'originalFontSHA256':digest})
    for obj in w._objects:
        if isinstance(obj,dict) and obj.get('/Subtype')=='/Type0':
            obj[NameObject('/BaseFont')]=obj['/DescendantFonts'][0].get_object()['/BaseFont']
    # Ghostscript drops multi-codepoint ToUnicode values for Type3 ligatures.
    # Equivalent Unicode ligature scalars survive; no glyph drawing is changed.
    ligatures={b'00660066':b'FB00', b'00660069':b'FB01', b'0066006C':b'FB02',
               b'006600660069':b'FB03', b'00660066006C':b'FB04'}
    unicode_changes=[]
    seen_streams=set()
    for obj in w._objects:
        if not isinstance(obj,dict) or obj.get('/Type')!='/Font' or '/ToUnicode' not in obj:
            continue
        ref=obj.raw_get('/ToUnicode')
        if ref.idnum in seen_streams:
            continue
        seen_streams.add(ref.idnum)
        data=ref.get_object().get_data()
        changed=data
        count=0
        for old,new in ligatures.items():
            for pattern in {b'<'+old+b'>', b'<'+old.lower()+b'>'}:
                count+=changed.count(pattern)
                changed=changed.replace(pattern,b'<'+new+b'>')
        if count:
            stream=DecodedStreamObject()
            stream.set_data(changed)
            w._objects[ref.idnum-1]=stream.flate_encode()
            unicode_changes.append({'stream':ref.idnum,'entries':count})
    args.output.parent.mkdir(parents=True,exist_ok=True)
    w.write(args.output)
    args.report.write_text(json.dumps({'source':str(args.source),'output':str(args.output),
        'fontDictionaries':len(records),'distinctTrueTypeStreams':len(changed_streams),
        'glyphMetricsHintingAndCmapTablesExact':True,'fonts':records,
        'unicodeLigatureNormalisation':unicode_changes},indent=2)+'\n')
    print(json.dumps({'fontDictionaries':len(records),'distinctTrueTypeStreams':len(changed_streams),'bytes':args.output.stat().st_size}))


if __name__ == '__main__':
    main()
