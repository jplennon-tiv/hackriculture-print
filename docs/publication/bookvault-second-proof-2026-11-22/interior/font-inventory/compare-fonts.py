"""Read-only comparison of the accepted interior and current supplier PDFs."""
from collections import defaultdict
from pathlib import Path
import hashlib
import json
import re
import struct

from pypdf import PdfReader

DOC = Path(__file__).resolve().parent
ROOT = DOC.parents[4]
FILES = {
    "accepted_october": "output/pdf/bookvault-print-ready/the-vegetable-guru-interior.pdf",
    "corrected_source": "output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Corrected-Headers.pdf",
    "rejected_pdfx1a": "output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX1a.pdf",
}


def deref(obj):
    return obj.get_object() if hasattr(obj, "get_object") else obj


def descriptor(font):
    if font.get("/Subtype") == "/Type0":
        font = deref(font["/DescendantFonts"][0])
    return deref(font.get("/FontDescriptor", {}))


def font_name(font):
    raw = str(font.get("/BaseFont") or descriptor(font).get("/FontName") or "[unnamed]")
    return re.sub(r"^/?[A-Z]{6}\+", "", raw).lstrip("/")


def font_programs(font):
    result = []
    for key in ("/FontFile", "/FontFile2", "/FontFile3"):
        ref = descriptor(font).get(key)
        if ref is None:
            continue
        data = deref(ref).get_data()
        item = {"key": key, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
        if key == "/FontFile2":
            tables = {}
            for i in range(struct.unpack_from(">H", data, 4)[0]):
                tag, _, offset, length = struct.unpack_from(">4sIII", data, 12 + 16 * i)
                tables[tag] = data[offset:offset + length]
            if b"OS/2" in tables and len(tables[b"OS/2"]) >= 6:
                item["weightClass"] = struct.unpack_from(">H", tables[b"OS/2"], 4)[0]
        result.append(item)
    return result


def inventory(path):
    reader = PdfReader(path)
    fonts = {}
    pages = defaultdict(set)

    def visit(resources, folio, seen):
        resources = deref(resources)
        for ref in deref(resources.get("/Font", {})).values():
            fonts[ref.idnum] = deref(ref)
            pages[ref.idnum].add(folio)
        for ref in deref(resources.get("/XObject", {})).values():
            if ref.idnum in seen:
                continue
            seen.add(ref.idnum)
            obj = deref(ref)
            if obj.get("/Subtype") == "/Form":
                visit(obj.get("/Resources", {}), folio, seen)

    for folio, page in enumerate(reader.pages, 1):
        visit(page.get("/Resources", {}), folio, set())

    records = []
    groups = defaultdict(lambda: {"objects": [], "folios": set(), "subtypes": set()})
    for object_id, font in sorted(fonts.items()):
        name = font_name(font)
        subtype = str(font.get("/Subtype"))
        cmap = deref(font["/ToUnicode"]).get_data() if "/ToUnicode" in font else b""
        record = {
            "object": object_id, "name": name, "subtype": subtype,
            "folios": sorted(pages[object_id]),
            "descriptorName": str(descriptor(font).get("/FontName", "")),
            "descriptorWeight": descriptor(font).get("/FontWeight"),
            "embeddedPrograms": font_programs(font),
            "type3GlyphProcedures": len(font.get("/CharProcs", {})),
            "mapsFiveEighths": bool(re.search(rb"<215[dD]>", cmap)),
        }
        records.append(record)
        groups[name]["objects"].append(object_id)
        groups[name]["folios"].update(pages[object_id])
        groups[name]["subtypes"].add(subtype)
    grouped = {
        name: {"objects": row["objects"], "folios": sorted(row["folios"]),
               "subtypes": sorted(row["subtypes"])}
        for name, row in sorted(groups.items())
    }
    return reader, {
        "file": str(path.relative_to(ROOT)), "bytes": path.stat().st_size,
        "sha256": hashlib.file_digest(path.open("rb"), "sha256").hexdigest(),
        "pages": len(reader.pages), "fontResources": len(records),
        "groupedNames": grouped, "resources": records,
    }


def main():
    report = {"date": "2026-11-23", "scope": "Read-only font inventory; no PDF edits or uploads.", "files": {}}
    readers = {}
    for label, relative in FILES.items():
        readers[label], report["files"][label] = inventory(ROOT / relative)
        print(label, "inventoried", flush=True)
    old = set(report["files"]["accepted_october"]["groupedNames"])
    new = set(report["files"]["corrected_source"]["groupedNames"])
    additions = sorted(new - old)
    report["addedNamesBeforeConversion"] = additions
    report["removedNamesBeforeConversion"] = sorted(old - new)
    report["retainedNames"] = sorted(old & new)
    report["addedFontTextUses"] = []
    reader = readers["corrected_source"]
    pages = sorted({p for n in additions for p in report["files"]["corrected_source"]["groupedNames"][n]["folios"]})
    for folio in pages:
        def visitor(text, cm, tm, fd, size):
            if fd is None or not text.strip():
                return
            name = font_name(fd)
            if name in additions:
                report["addedFontTextUses"].append({"folio": folio, "font": name, "text": text})
        reader.pages[folio - 1].extract_text(visitor_text=visitor)
    report["fiveEighthsInRejectedFile"] = [
        r for r in report["files"]["rejected_pdfx1a"]["resources"] if r["mapsFiveEighths"]
    ]
    report["interpretation"] = (
        "Two added font variants: Nunito Sans SemiBold and Lucida Grande Regular. "
        "SemiBold has embedded TrueType programs and a named PDF resource. "
        "Lucida Grande Regular renders only the five-eighths fraction at folios 61 and 67; "
        "it survives conversion as unnamed Type3 objects 2315 and 2558. "
        "This is a focused isolation candidate, not proof of the supplier's rejected Unknown font. "
        "Many retained Nunito Sans resources are also converted to unnamed Type3; "
        "addition of a font is not the only possible cause of changed supplier behaviour."
    )
    (DOC / "COMPARISON.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"added": additions, "removed": report["removedNamesBeforeConversion"],
                      "fraction_objects": [r["object"] for r in report["fiveEighthsInRejectedFile"]]}, indent=2))


if __name__ == "__main__":
    main()
