#!/usr/bin/env python3
"""Resolve the book's curated IDs to verified offline files."""
import argparse
import hashlib
import json
from pathlib import Path

MEDIA = Path("docs/assets/garden-media-library")


def find_project(requested):
    if requested:
        candidates = [Path(requested).resolve()]
    else:
        candidates = [Path.cwd(), *Path.cwd().parents, *Path(__file__).resolve().parents]
    for root in candidates:
        if (root / MEDIA / "local-references/sources.json").is_file():
            return root
    raise ValueError("Run inside hackriculture-print or pass --project /path/to/hackriculture-print.")


def resources(root):
    assets = Path(__file__).resolve().parents[1] / "assets"
    yield {
        "id": "LOOKDOWN",
        "title": "John looking down",
        "file": "john-lowered-profile-reference.png",
        "sha256": "1fe8f060bb0caafb1ccdae6085882e0ffe44456b898bf9fa5953869f3e1d1e1e",
        "note": "Attach for a lowered face. Three April camera stills and one approved illustrative profile.",
    }, assets, "John", "likeness"
    likeness = assets / "likeness"
    for row in json.loads((likeness / "sources.json").read_text()):
        yield row, likeness, "John", "likeness"
    locations = root / MEDIA / "local-references"
    for index in ("sources.json", "motion-references.json"):
        for row in json.loads((locations / index).read_text()):
            yield row, locations, row["setting"], row.get("role", "motion")
    actor = json.loads((root / MEDIA / "wardrobe/references.json").read_text())
    for role in ("wardrobe", "likeness"):
        for row in actor[role]:
            yield row, root, "John", role


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", help="Print project root")
    parser.add_argument("--list", action="store_true", help="List known IDs and their roles")
    parser.add_argument("ids", nargs="*", help="Ordered IDs, for example A02 A08 L573 J02")
    args = parser.parse_args()
    if bool(args.ids) == args.list:
        parser.error("Supply IDs or --list.")
    try:
        db = {r["id"]: (r, folder, site, role) for r, folder, site, role in resources(find_project(args.project))}
        if args.list:
            for key, (row, _, site, role) in db.items():
                print(f"{key:5} {site:12} {role:12} {row.get('title', '')}")
            return
        found = []
        for key in args.ids:
            row, folder, site, role = db[key.upper()]
            path = folder / row["file"]
            with path.open("rb") as stream:
                h = hashlib.sha256()
                for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                    h.update(chunk)
            if h.hexdigest() != row["sha256"]:
                raise ValueError(f"Checksum differs for {key}: {path}. Check its source register.")
            found.append(dict(id=row["id"], site=site, role=role, path=str(path), description=row.get("clothes", row.get("note", row.get("role", "")))))
        print(json.dumps(found, indent=2, ensure_ascii=False))
    except (FileNotFoundError, ValueError, KeyError) as error:
        parser.exit(1, f"Reference lookup failed: {error}\n")


if __name__ == "__main__":
    main()
