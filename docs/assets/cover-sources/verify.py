#!/usr/bin/env python3
"""Read-only integrity check for the cover-source register; stdlib only."""
import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]


def main():
    manifest = json.loads((HERE / 'MANIFEST.json').read_text())
    failures = []
    for entry in manifest['files']:
        path = ROOT / entry['path']
        if not path.is_file():
            failures.append({'path': entry['path'], 'issue': 'missing'})
            continue
        digest = hashlib.sha256()
        with path.open('rb') as stream:
            for block in iter(lambda: stream.read(1024 * 1024), b''):
                digest.update(block)
        if path.stat().st_size != entry['bytes'] or digest.hexdigest() != entry['sha256']:
            failures.append({'path': entry['path'], 'issue': 'bytes or SHA-256 changed'})
    result = {
        'files_checked': len(manifest['files']),
        'missing_or_changed': failures,
        'passed': not failures,
        'scope': 'Registered local files only; no builds, external-drive checks or writes.',
    }
    print(json.dumps(result, indent=2))
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
