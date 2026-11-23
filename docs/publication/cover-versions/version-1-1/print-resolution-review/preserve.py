"""Freeze the approved cover and its exact component sources; never rebuild it."""
from pathlib import Path
import hashlib, json, zipfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
DEST = ROOT / 'output/cover-archives/approved-cover-2026-11-22'
ARCHIVE = DEST / 'Vegetable-Guru-Approved-Cover-Components-2026-11-22.zip'

def digest(data):
    return hashlib.sha256(data).hexdigest()

def main():
    assert not ARCHIVE.exists(), 'Frozen archive already exists: choose a new revision.'
    DEST.mkdir(parents=True, exist_ok=True)
    out = ROOT / 'output/pdf/cover-print-resolution-review'
    approved = [out / ('Vegetable-Guru-' + name + '.pdf') for name in [
        'Corrected-Cover-Wrap-Proof', 'Front-Print-Resolution-Proposal', 'Rear-Print-Resolution-Proposal']]
    approved.append(HERE / 'Vegetable-Guru-Front-Print-Resolution-Proposal.svg')
    approval = {
        'date': '2026-11-22', 'approved_by': 'John Lennon',
        'user_instruction': "That's great - approved. Please keep all the component parts safe!",
        'scope': 'Corrected complete wrap including clean native lettering, restored harvest layers, finer wood, retained rear photos and spine title/author at 90/140 mm from top.',
        'library_file_id': 'libfile_fde3_f-e62b78b925608191b87ea183c26de41a_968f6e806ba48191b80ffb1b7a35f663',
        'library_version': 1,
        'approved_files': [{'file': str(p.relative_to(ROOT)), 'sha256': digest(p.read_bytes()), 'bytes': p.stat().st_size} for p in approved],
        'limits': ['Design approval only; no full-book installation or supplier submission.', '12.5 mm spine remains provisional; final pagination, bleed and supplier template remain separate.']}
    assert approval['approved_files'][0]['sha256'] == '5b1f446d33b80c5e4f4f7f340f6b772aa6c016f74ca6d41f4587391eeecdbf2b'
    (HERE / 'APPROVAL.json').write_text(json.dumps(approval, indent=2)+'\n')
    files = [p for p in HERE.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name not in ['PRESERVATION-CHECKS.json', 'ARCHIVE-DELIVERY.json']]
    files += approved[:3]
    files += [out / 'corrected-wrap-preview.png', out / 'spine-clearance-detail.png']
    files += [ROOT / p for p in [
        'public/fonts/richer-a-1.woff2', 'public/fonts/richer-a-6.woff2',
        'output/pdf/selected-gold-cover/The-Vegetable-Guru-Selected-Cover.pdf',
        'output/pdf/rear-cream-harvest/photo-grid-04/The-Vegetable-Guru-Garden-Photo-Grid-04.pdf',
        'docs/publication/cover-versions/version-1-1/selected-gold-cover/The-Vegetable-Guru-Front.svg',
        'docs/publication/cover-versions/version-1-1/front-spacing-and-spine/spine-type.swift']]
    protected = ROOT / 'docs/publication/cover-versions/version-1-1/rear-cream-harvest/photo-grid/revision-04/protected-master'
    files += [p for p in protected.rglob('*') if p.is_file() and '__pycache__' not in p.parts]
    records = []
    with zipfile.ZipFile(ARCHIVE, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        def add(name, data, source):
            z.writestr(name, data)
            records.append({'path': name, 'bytes': len(data), 'sha256': digest(data), 'source': source})
        for p in sorted(set(files)):
            add('project/'+str(p.relative_to(ROOT)), p.read_bytes(), str(p.relative_to(ROOT)))
        arial = Path('/System/Library/Fonts/Supplemental/Arial Bold.ttf')
        add('private-font-reference/Arial-Bold.ttf', arial.read_bytes(), str(arial))
        rear_archive = ROOT / 'output/cover-archives/protected-rear-04/The-Vegetable-Guru-Protected-Rear-04.zip'
        with zipfile.ZipFile(rear_archive) as old:
            for name in ['Vegetable-Guru-Rear-04.svg', 'Vegetable-Guru-Rear-04.pdf', 'MANIFEST.json', 'README.md']:
                add('rear-editable-source/'+name, old.read(name), str(rear_archive.relative_to(ROOT))+'!'+name)
        notes = '''APPROVED COVER COMPONENTS — 22 November 2026

The exact approved wrap and front/rear panels are under project/output/pdf/cover-print-resolution-review/.
The editable SVG, all 33 source layers, restored wood, shadows, lettering recipes and checks are under project/docs/publication/cover-versions/version-1-1/print-resolution-review/.
Native font sources are retained under project/public/fonts/ and private-font-reference/. Arial is a private recovery reference, not a licence to redistribute the font.
The earlier rear SVG/PDF with native footer and exact photos are in rear-editable-source/. That source retains its earlier background; assemble.py applies the approved finer wood without changing its photos or native copy.
The protected crop manifest and sixteen JPEGs are also included at their project paths.

Never run builders against this archive or overwrite the approved files. Extract into a new working folder for a future revision.
The build order is build.py, assemble.py, wrap.py. The native-font build deliberately clears/replaces every rejected text path in its retained layout template. Never use trace.py or the rejected-trace-v1 builders.
Fonts remain original typeface curves. Future wording changes should be made in a new revision of clean_type.py / spine-type-clear.swift or the native rear source, then inspected in a new PDF.
These scripts retain their original project paths. They require Python with numpy/Pillow/pypdf/reportlab/pypdfium2, macOS Swift/CoreText, clang/FreeType and rsvg-convert. The original Arial path is /System/Library/Fonts/Supplemental/Arial Bold.ttf; use the retained private copy if restoring on a compatible licensed system.
wrap.py also compares against the prior wrap. That historical proof is separately retained at output/pdf/cover-print-resolution-review/spine-position-before/ in the live project; this archive includes its approved successor and all production components.

The earlier complete rear recovery ZIP, including PSD/ORA and pre-crop originals, is preserved separately at output/cover-archives/protected-rear-04/The-Vegetable-Guru-Protected-Rear-04.zip. Its checksum is recorded below.
Approval covers the design. It does not approve supplier files, final spine/bleed or installation in the book.
'''
        add('README.txt', notes.encode(), 'preserve.py')
        # The previous wrap is a runtime comparison input, so include it too.
        prior = out / 'spine-position-before/Vegetable-Guru-Corrected-Cover-Wrap-Proof.pdf'
        add('project/'+str(prior.relative_to(ROOT)), prior.read_bytes(), str(prior.relative_to(ROOT)))
        manifest = {'approved': approval, 'files': records, 'separately_preserved_rear_archive': {'file':str(rear_archive.relative_to(ROOT)), 'sha256':digest(rear_archive.read_bytes()), 'bytes':rear_archive.stat().st_size}}
        z.writestr('MANIFEST.json', json.dumps(manifest, indent=2)+'\n')
    with zipfile.ZipFile(ARCHIVE) as z:
        assert z.testzip() is None
        for item in records:
            assert digest(z.read(item['path'])) == item['sha256'], item['path']
    checks = {'date':'2026-11-22','archive':str(ARCHIVE.relative_to(ROOT)), 'sha256':digest(ARCHIVE.read_bytes()), 'bytes':ARCHIVE.stat().st_size, 'component_count':len(records), 'all_component_hashes_verified':True,'zip_crc_verified':True,'approved_wrap_bytes_unchanged':True,'read_only_archive':True}
    ARCHIVE.chmod(0o444)
    (HERE / 'PRESERVATION-CHECKS.json').write_text(json.dumps(checks,indent=2)+'\n')
    print(json.dumps(checks,indent=2))

if __name__ == '__main__':
    main()
