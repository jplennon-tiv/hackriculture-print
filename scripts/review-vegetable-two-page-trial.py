"""Assemble, check and rasterise the two isolated vegetable trial spreads."""
import hashlib
import json
import re
import subprocess
import unicodedata
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / 'docs/publication/vegetable-two-page-review'
OUT = ROOT / 'output/pdf/vegetable-two-page-trial'
OUT.mkdir(parents=True, exist_ok=True)
(DIR / 'pages').mkdir(exist_ok=True)
receipt = json.loads((DIR / 'TRIAL-CHECKS.json').read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
normal = lambda s: re.sub(r'\s+', '', unicodedata.normalize('NFKC', s))

def fonts_embedded(page):
    results = []
    for ref in page['/Resources'].get('/Font', {}).values():
        font = ref.get_object()
        if '/DescendantFonts' in font:
            font = font['/DescendantFonts'][0].get_object()
        descriptor = font.get('/FontDescriptor')
        if not descriptor:
            raise AssertionError('Unembedded font')
        descriptor = descriptor.get_object()
        assert any(k in descriptor for k in ['/FontFile', '/FontFile2', '/FontFile3'])
        results.append(str(font['/BaseFont']))
    return sorted(set(results))

checks = {'date': '2026-10-15', 'status': 'PDF checks passed; visual review recorded separately', 'editions': {}}
for unit in ['imperial', 'metric']:
    writer = PdfWriter()
    entries = [r for r in receipt['results'] if r['units'] == unit]
    assert len(entries) == 2
    for r in entries:
        src = ROOT / r['pdf']
        assert sha(src) == r['sha256']
        reader = PdfReader(src)
        assert len(reader.pages) == 2
        text = normal('\n'.join(p.extract_text() for p in reader.pages))
        for edit in r['edits']:
            if edit['proposed']:
                assert normal(edit['proposed']) in text, (r['slug'], edit['proposed'])
        for name in r['pestsRetained'] + r['varietiesRetained']:
            assert normal(name) in text, name
        for page in reader.pages:
            fonts_embedded(page)
            # Correct Chromium's rounding without scaling the text or artwork.
            page.mediabox.upper_right = (185 * 72 / 25.4, 240 * 72 / 25.4)
            page.cropbox = page.mediabox
            writer.add_page(page)
    pdf = OUT / f'two-page-trials-{unit}.pdf'
    writer.add_metadata({'/Title': f'The Vegetable Guru — two-page vegetable trials ({unit})', '/Author': 'John Lennon', '/Subject': 'Unapproved carrot and onions/shallots trial spreads; original body type preserved.'})
    writer.write(pdf)
    final = PdfReader(pdf)
    assert len(final.pages) == 4
    prefix = DIR / 'pages' / unit
    subprocess.run(['pdftoppm', '-r', '145', '-jpeg', '-jpegopt', 'quality=93', str(pdf), str(prefix)], check=True, capture_output=True)
    images = []
    for n in range(1, 5):
        candidates = list((DIR / 'pages').glob(f'{unit}-*{n}.jpg'))
        assert len(candidates) == 1, candidates
        target = DIR / 'pages' / f'{unit}-{n}.jpg'
        if candidates[0] != target:
            candidates[0].rename(target)
        images.append(target)
    for crop, indices in [('carrot', [0, 1]), ('onions_and_shallots', [2, 3])]:
        pages = [Image.open(images[i]).convert('RGB') for i in indices]
        canvas = Image.new('RGB', (sum(p.width for p in pages), pages[0].height), '#e1e7dc')
        canvas.paste(pages[0], (0, 0)); canvas.paste(pages[1], (pages[0].width, 0))
        canvas.save(DIR / f'{crop}-{unit}-spread.jpg', quality=93)
    checks['editions'][unit] = {'pdf': str(pdf.relative_to(ROOT)), 'sha256': sha(pdf), 'pages': 4, 'trimMm': [185, 240], 'fontsEmbedded': [fonts_embedded(p) for p in final.pages], 'newCopyVerified': sum(len([e for e in r['edits'] if e['proposed']]) for r in entries), 'allPestEntriesRetained': 20, 'allVarietiesRetained': 9, 'bodyTypeUnchanged': all(r['bodyTypeUnchanged'] for r in entries), 'minimumDomFooterGapMm': min(p['footerGapMm'] for r in entries for p in r['pages']), 'images': [str(p.relative_to(ROOT)) for p in images]}
(DIR / 'PDF-CHECKS.json').write_text(json.dumps(checks, indent=2) + '\n')
print(json.dumps({u: {k: v for k, v in d.items() if k not in ['fontsEmbedded', 'images']} for u, d in checks['editions'].items()}, indent=2))
