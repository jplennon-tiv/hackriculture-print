"""Replace two Lucida Grande fractions with existing Nunito Sans glyphs.

Only an explicitly identified font switch, glyph run and following run position
change on each page. No fonts/images are imported or redrawn.
"""
from decimal import Decimal
from pathlib import Path
import hashlib
import json

from pypdf import PdfReader, PdfWriter
from pypdf._cmap import get_encoding
from pypdf.generic import NameObject, DecodedStreamObject, IndirectObject

DOC = Path(__file__).resolve().parent
ROOT = DOC.parents[4]
SOURCE = ROOT / "output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX1a.pdf"
OUTPUT = SOURCE.with_name("Vegetable-Guru-Interior-Nunito-Fractions.pdf")
EXPECTED = "c4e3299056c15f0c048fe1eb3e3b3cf2aabe1b792e904ffbdc32ebe20e6b9534"
PAGES = {
    61: {"remove": "/R1323", "reuse": "/R1298", "dx": "91.1043", "return": "-194.644"},
    67: {"remove": "/R1440", "reuse": "/R1415", "dx": "77.3137", "return": "-134.189"},
}


def sha(path):
    return hashlib.file_digest(path.open("rb"), "sha256").hexdigest()


def remove_unreachable(writer):
    # Follow references without decoding or re-encoding any image/font stream.
    # The generic deduplicator unnecessarily decompresses every large image.
    reachable, visited = set(), set()
    def walk(obj):
        if isinstance(obj, IndirectObject):
            if obj.idnum in reachable:
                return
            reachable.add(obj.idnum)
            obj = obj.get_object()
        if id(obj) in visited:
            return
        visited.add(id(obj))
        if isinstance(obj, dict):
            for value in obj.values():
                walk(value)
        elif isinstance(obj, list):
            for value in obj:
                walk(value)
    for obj in (writer.root_object, writer._info, writer._ID):
        if obj is not None:
            ref = getattr(obj, "indirect_reference", None)
            walk(ref if ref is not None else obj)
    removed = []
    for i, obj in enumerate(writer._objects):
        if obj is not None and i + 1 not in reachable:
            removed.append({"object": i + 1,
                            "subtype": str(obj.get("/Subtype", "")) if isinstance(obj, dict) else ""})
            writer._objects[i] = None
    return removed


def main():
    assert sha(SOURCE) == EXPECTED, "Source changed; re-establish exact edit locations"
    reader = PdfReader(SOURCE)
    writer = PdfWriter(clone_from=reader)
    changes = []
    for folio, spec in PAGES.items():
        page = writer.pages[folio - 1]
        fonts = page["/Resources"]["/Font"]
        old_font = fonts[spec["remove"]].get_object()
        regular = fonts[spec["reuse"]].get_object()
        assert old_font["/Subtype"] == "/Type3"
        assert b"<215d>" in old_font["/ToUnicode"].get_object().get_data().lower()
        encoding, mapping = get_encoding(regular)
        inverse = {mapping.get(char, char): code for code, char in encoding.items()}
        code_to_glyph = {}
        code = 0
        for value in regular["/Encoding"]["/Differences"]:
            if isinstance(value, int):
                code = value
            else:
                code_to_glyph[code] = value
                code += 1
        codes = bytes(inverse[char] for char in "5/8")
        for code in codes:
            assert code_to_glyph[code] in regular["/CharProcs"], "Glyph not present in existing font"
        assert list(regular["/FontMatrix"]) == [0.001, 0, 0, -0.001, 0, 0]
        widths = [Decimal(str(regular["/Widths"][code - int(regular["/FirstChar"])])) for code in codes]
        advance = sum(widths) * Decimal("0.001") * 9
        delta = advance - Decimal("7.21133")
        data = page.get_contents().get_data()
        old = (f'{spec["remove"]} 0.9 Tf\n{spec["dx"]} 0 Td\n(n)Tj\n'
               f'{spec["reuse"]} 9 Tf\n7.21133 0 Td\n').encode()
        # Shift only the text matrix for the suffix, leaving the line matrix
        # untouched. This preserves later lines exactly, including rounding.
        adjustment = -delta * 1000 / 9
        new = (f'{spec["reuse"]} 9 Tf\n{spec["dx"]} 0 Td\n<{codes.hex()}>Tj\n'
               f'{spec["reuse"]} 9 Tf\n7.21133 0 Td\n[{adjustment}]TJ\n').encode()
        assert data.count(old) == 1
        edited = data.replace(old, new)
        old_return = f'{spec["return"]} -11.25 Td\n'.encode()
        assert edited.count(old_return) == 1
        stream = DecodedStreamObject()
        stream.set_data(edited)
        page[NameObject("/Contents")] = writer._add_object(stream.flate_encode())
        del fonts[NameObject(spec["remove"])]
        changes.append({
            "folio": folio, "oldText": "⅝", "newText": "5/8", "font": "Nunito Sans Regular",
            "reusedResource": spec["reuse"], "removedResource": spec["remove"],
            "bodySizePoints": 9, "newAdvancePoints": float(advance),
            "followingTextShiftPoints": float(delta), "nextLinePositionRestored": True,
            "sourceContentSHA256": hashlib.sha256(data).hexdigest(),
            "updatedContentSHA256": hashlib.sha256(edited).hexdigest(),
        })
    removed = remove_unreachable(writer)
    assert sum(item["subtype"] == "/Type3" for item in removed) == 2
    writer.write(OUTPUT)
    report = {
        "date": "2026-11-23",
        "authorisation": "It strikes me that if a font is used to just render two fractions it should be replaced any how...",
        "source": str(SOURCE.relative_to(ROOT)), "sourceSHA256": EXPECTED,
        "output": str(OUTPUT.relative_to(ROOT)), "bytes": OUTPUT.stat().st_size,
        "sha256": sha(OUTPUT), "changes": changes,
        "fontsImported": 0, "imagesChanged": 0, "supplierUpload": False,
        "unreachableObjectsRemoved": removed,
        "scope": "Separate revised production file; original reading master, frozen sources and failed tests preserved.",
    }
    (DOC / "FRACTION-REPLACEMENT.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
