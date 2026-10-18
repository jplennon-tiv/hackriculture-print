"""Assemble only the authorised reader-edit proofs; never replace the full book."""
import hashlib
import json
import logging
from pathlib import Path

import pdfplumber
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / 'docs/publication/reader-edit-pass'
OUT = ROOT / 'output/pdf/reader-edit-pass'
W, H = 185 * 72 / 25.4, 240 * 72 / 25.4
logging.getLogger('pdfminer').setLevel(logging.ERROR)

def read(path):
    return json.loads(path.read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def relative(path):
    import os
    return os.path.relpath(path, DIR)

guide_checks = read(DIR / 'guides/CHECKS.json')
navigation = read(DIR / 'navigation/PROOF-MANIFEST.json')
techniques = read(DIR / 'techniques/PDF-CHECKS.json')
for item in guide_checks['results']:
    assert sha(ROOT / item['pdf']) == item['sha256']
    assert sha(ROOT / item['highlighted']) == item['highlightedSha256']
for items in navigation['units'].values():
    for item in items.values():
        for mode in ('clean', 'highlight'):
            assert sha(ROOT / item[mode]['pdf']) == item[mode]['sha256']
for item in techniques:
    assert sha(Path(item['pdf'])) == item['sha256']
records = {}
sources = {u: {} for u in ('imperial', 'metric')}

def page(folio, title, changed, unit, clean, highlight, pdf, pdf_page):
    for image in (clean, highlight):
        assert image.is_file(), image
    item = records.setdefault(folio, {
        'folio': folio, 'title': title, 'changed': changed,
        'beforeImage': f'../whole-book-order-preview/pages/page-{folio + 2:03d}.jpg',
        'units': {},
    })
    assert item['changed'] == changed
    item['units'][unit] = {'cleanImage': relative(clean), 'highlightImage': relative(highlight)}
    sources[unit][folio] = (pdf, pdf_page)

titles = {
    'carrot': 'Carrot', 'celeriac': 'Celeriac', 'cabbage': 'Cabbage',
    'lettuce': 'Lettuce', 'leek': 'Leek', 'marrow_courgette': 'Courgettes and marrows',
    'tomato_greenhouse': 'Greenhouse tomatoes', 'asparagus': 'Asparagus',
    'onion_and_leek_troubles': 'Onion and leek troubles',
}
notes = {
    'carrot': ['The root-forking warning now distinguishes fresh or unfinished additions from suitably used mature compost. A small protected late-sowing example restores useful source advice.'],
    'celeriac': ['“Planting depth” identifies the instruction correctly. The existing back page is included for context.'],
    'cabbage': ['The selected Greyhound variety is labelled “Summer Cabbages”, with its current variety description retained. Both original source entries remain intact.'],
    'lettuce': ['The slug warning now gives recognition signs. The growing notes add a qualified late-sowing option for winter or early-spring harvests. The existing columns use a 52:48 split to keep the same text size and page count.'],
    'leek': ['The transplanting instruction now combines the usual May–July window with the pencil-thick readiness cue.'],
    'marrow_courgette': ['The final tip gives useful end-of-crop clearance advice in place of repeated guidance.'],
    'tomato_greenhouse': ['Restored source details cover the first true-leaf pair, roots filling the pot, cold nights, germination warmth and stopping cordons under unheated cover. The approved two-page format is retained.'],
    'asparagus': ['“Seed depth” replaces the generic “Depth” label. Row spacing and crown-planting instructions are retained.'],
    'onion_and_leek_troubles': ['The Leek Moth treatment now qualifies cut-back recovery: enough growing season must remain. The other pages are included as unchanged context.'],
}
groups = [{
    'id': 'guide-key', 'title': 'How to use the guides', 'folios': [9],
    'notes': ['The calendar key distinguishes usual timings from options that may depend on varieties, protection or milder conditions. Sowing dates are distinguished from planting out.'],
}]
for unit in sources:
    for key, item in navigation['units'][unit].items():
        for i, folio in enumerate(item['folios']):
            page(folio, 'How to use the guides' if key == 'guide-key' else 'Index', True, unit,
                 DIR / f'navigation/pages/{unit}/clean/{key}-{i + 1}.png',
                 DIR / f'navigation/pages/{unit}/highlight/{key}-{i + 1}.png',
                 ROOT / item['highlight']['pdf'], i)
    for item in guide_checks['results']:
        if item['unit'] != unit:
            continue
        key = item['key']
        for i, folio in enumerate(item['folios']):
            page(folio, titles[key], bool(item['pages'][i]['changed']), unit,
                 DIR / f'guides/images/{unit}-clean/folio-{folio}.png',
                 DIR / f'guides/images/{unit}-highlighted/folio-{folio}.png',
                 ROOT / item['highlighted'], i)
        if unit == 'imperial':
            folios = item['folios']
            groups.append({'id': key, 'title': titles[key], 'folios': folios,
                           'spreads': [folios[:2], folios[2:]] if len(folios) > 2 else [folios],
                           'notes': notes[key]})
    item = next(t for t in techniques if t['units'] == unit and t['mode'] == 'highlighted')
    for i, folio in enumerate(item['folios']):
        title = 'Compost' if folio < 156 else 'Crop rotation' if folio == 156 else 'Sowing and planting' if folio == 157 else 'Greenhouses'
        page(folio, title, folio not in (154, 160), unit,
             DIR / f'techniques/images/{unit}-clean/folio-{folio}.png',
             DIR / f'techniques/images/{unit}-highlighted/folio-{folio}.png', Path(item['pdf']), i)

groups += [
    {'id': 'compost', 'title': 'Compost', 'folios': [154, 155],
     'notes': ['The lead now names suitable garden and kitchen waste and removes the broad pet-litter example. The existing practical composting guidance and illustrations remain.']},
    {'id': 'rotation-sowing', 'title': 'Rotation, succession and sowing', 'folios': [156, 157],
     'notes': ['The worked broad beans → kale example replaces the old three-year strip. Year-to-year rotation guidance, the disease warning and permanent-crop advice remain.',
               'The family table covers more of the book’s crops. Brief explanations of drill, module and station make the sowing page easier to use.']},
    {'id': 'greenhouses', 'title': 'Greenhouses through the seasons', 'folios': [160, 161],
     'notes': ['Protected sowing is distinguished from readiness for planting outdoors. Raise suitable autumn replacements before clearing summer crops, within their sowing windows.']},
    {'id': 'index', 'title': 'Index', 'folios': [162, 163, 164, 165], 'spreads': [[162, 163], [164, 165]],
     'notes': ['Added routes for chillies, follow-on crops, succession cropping, winter harvesting and storage. The original entries and destinations are retained; the index still occupies four pages.']},
]

OUT.mkdir(parents=True, exist_ok=True)
assembly = []
for unit, source_pages in sources.items():
    writer = PdfWriter()
    readers = {}
    page_map = []
    for folio in sorted(source_pages):
        # A focused proof starts with recto p9; keep all original verso/recto relationships.
        if (len(writer.pages) + 1) % 2 != folio % 2:
            writer.add_blank_page(width=W, height=H)
            page_map.append({'pdfPage': len(writer.pages), 'folio': None, 'kind': 'review-only parity blank'})
        path, source_page = source_pages[folio]
        if path not in readers:
            readers[path] = PdfReader(path)
        p = readers[path].pages[source_page]
        assert abs(float(p.mediabox.width) - W) < 1 and abs(float(p.mediabox.height) - H) < 1, path
        p = writer.add_page(p)
        # Match full-book box normalisation without rescaling type or artwork.
        for box in ('mediabox', 'cropbox', 'trimbox'):
            setattr(p, box, RectangleObject([0, 0, W, H]))
        writer.add_outline_item(f"Page {folio} — {records[folio]['title']}", len(writer.pages) - 1)
        page_map.append({'pdfPage': len(writer.pages), 'folio': folio, 'source': str(path.relative_to(ROOT)),
                         'sourcePage': source_page + 1, 'sourceSha256': sha(path)})
    writer.add_metadata({'/Title': f'The Vegetable Guru — reader-edit proofs ({unit})',
                         '/Subject': 'Focused review with temporary highlights; printed folios retained; not the complete book'})
    path = OUT / f'reader-edits-{unit}-highlighted.pdf'
    writer.write(path)
    check = PdfReader(path)
    assert len(check.pages) == len(page_map) == 31
    for p, item in zip(check.pages, page_map):
        assert abs(float(p.mediabox.width) - W) < .01
        assert abs(float(p.mediabox.height) - H) < .01
        if item['folio'] is not None:
            assert item['folio'] % 2 == item['pdfPage'] % 2
    # Chromium's letter-spacing yields spurious spaces through pypdf extraction.
    # Read actual footer glyph positions using the book's existing pdfplumber route.
    with pdfplumber.open(path) as rendered:
        for p, item in zip(rendered.pages, page_map):
            if item['folio'] is not None:
                footer = p.crop((0, p.height - 40, p.width, p.height)).extract_text(x_tolerance=1, y_tolerance=2) or ''
                assert footer.rstrip().endswith(str(item['folio'])), (item['folio'], footer)
    assembly.append({'unit': unit, 'pdf': str(path.relative_to(ROOT)), 'sha256': sha(path),
                     'pageCount': len(check.pages), 'trimMm': [185, 240], 'pageMap': page_map})

manifest = {
    'groups': groups, 'pages': [records[f] for f in sorted(records)],
    'pdfs': {a['unit']: '/' + a['pdf'] for a in assembly},
    'checks': [
        'All seven editing tasks, the worked succession example and D1–D3 are included. The holiday reminder is excluded.',
        'The eight affected vegetable guides remain two pages each in both units. Their existing body size, drawings and table rows are retained.',
        'All 58 canonical vegetable and Troubles records are preserved. The guide-key and index presentation records have exact-byte backups.',
        'The review uses actual PDF images. The two downloadable packs retain printed folios and facing-page parity; their one extra blank is for this focused review only.',
        'The current complete book and frozen approved sources remain unchanged. These edited proofs await review.',
    ],
    'limitations': 'This is a selection of affected pages, not a complete book. Before images use the current imperial edition.',
}
(DIR / 'REVIEW-MANIFEST.json').write_text(json.dumps(manifest, indent=2) + '\n')
(DIR / 'evidence/ASSEMBLY.json').write_text(json.dumps(assembly, indent=2) + '\n')
print(json.dumps({'pages': len(records), 'groups': len(groups), 'pdfs': [{k: a[k] for k in ('unit', 'pdf', 'pageCount')} for a in assembly]}))
