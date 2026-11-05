"""Build an offline crop-by-crop reader from the verified proofs."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[2]
base=root/'docs/publication/sowing-rollout'
result=json.loads((base/'PDF-CHECKS.json').read_text())
pairs=sorted((json.loads(p.read_text()) for p in (base/'checks').glob('*.json')),key=lambda p:p['imperial']['folio'])
catalog=[]
for p in pairs:
    e=p['imperial'];key=e['key']
    item={'key':key,'name':e['name'],'folio':e['folio'],'retained':len(e['pests']),'omitted':e['trial']['removed'],'units':{}}
    for unit,proof in p.items():
        baseline=json.loads((root/f'tmp/sowing-rollout/{key}-{unit}.json').read_text())
        item['units'][unit]={'before':baseline['plant'],'after':[m['text'] for m in proof['methods']],'facts':[f['text'] for f in proof['actions']],'calendar':proof['calendar'],'links':proof['links'],'originalCount':len(baseline['pests'])}
    catalog.append(item)
counts=[c for c in catalog if c['omitted']]
assert len(catalog)==39
template=(root/'scripts/sowing-rollout/review-template.html').read_text()
(base/'REVIEW.html').write_text(template.replace('CROP_CATALOG',json.dumps(catalog,ensure_ascii=False).replace('</','<\\/')).replace('TOTAL_RETAINED',str(sum(c['retained'] for c in catalog))).replace('UNCUT_TOTAL',str(39-len(counts))).replace('CUT_TOTAL',str(len(counts))))
notes=['# Sowing & planting · 39 proposed vegetable spreads','',
'[Open the review](REVIEW.html). The two PDF editions each contain 78 guide pages, in current book order. Bookmarks use crop names and PDF page labels use the book folios.','',
'The five approved sample guides are recorded in their own approval files. The current rollout covers the other 39 and is ready for John’s review. The main book remains the separate 176-page interior.','',
'Each revised method was edited from the corresponding UK crop record, its reviewed planting companion and the wording actually used in the book. The bound print drafts use paired measurements or the existing Quick facts values. Crop-specific timings occupy the facts and calendars. Readiness, handling and frost conditions stay beside the action. Seasonal descriptions are kept where a narrower date would imply false precision. Different starting materials have different labels, including seed, rooted offsets, crowns, cloves, sets, tubers and a ready-spawned kit. Direct seedling clump-growing instructions were removed from the pea and onion pages. A naturally dividing shallot, mature perennial crown or block of individually planted tubers is a different matter.','',
'All original planting illustrations, selected varieties, Key risks and published footer destinations are retained. The visual hierarchy follows the approved samples. Long facts can be rebalanced between the opening columns. On the practical page the search tries advice and pest-table widths, different block arrangements and, when necessary, removal of transparent space around the drawings while keeping their painted size. Care, harvest and table copy were tightened where needed. Bottom entries are omitted only after these passes and the final row choice is shared between units.','',
f'**{39-len(counts)} guides keep their full table.** The following omissions are print-layout choices and apply only to these working spreads. The last column gives the best measured space above the footer with the last omitted row restored, in the limiting edition, against a 3 mm target.','',
'| Crop | Folios | Entries kept | Bottom entries omitted | Clearance before final cut |','| --- | --- | ---: | --- | ---: |']
for p in pairs:
    e=p['imperial'];rows=len(e['pests']);omit=e['trial']['removed']
    if omit:
        gaps=[a['gap'] for v in p.values() for a in v['trial']['attempts'] if a['rows']==rows+1]
        notes.append(f"| {e['name']} | {e['folio']}–{e['folio']+1} | {rows} | {', '.join(omit)} | {min(gaps):.1f} mm |")
notes+=['','The review reader includes the previous planting panel, revised instructions and timing facts in both units for every crop. In the PDF, See also references point to the current whole-book file. Page numbers intentionally skip the five approved samples.','',
'**Coverage.** The checks bind each print draft to its source HTML snapshot and canonical record hash. All 78 individual proofs were checked for two 185 × 240 mm pages, footer clearance, loaded original illustrations, 9 pt planting prose, recovery of every changed planting paragraph and action fact from its printed bounds, and the current book’s reference targets. Both 78-page review PDFs were checked for page labels, bookmarks and link destinations. Both editions were visually reviewed as rendered spreads. The combined files compress the large illustration streams for review while retaining the native text, image dimensions and alpha masks. All 156 combined pages were compared with their individual proofs for rendering and selectable text. [Delivery checks](DELIVERY-CHECKS.json).','',
'[Editable crop-specific copy](../../../src/print/book/sowing-rollout/copy.txt) · [Per-crop evidence](checks/) · [PDF verification](PDF-CHECKS.json) · [Working editorial guidance](../sowing-planting-mockups/CROP-EDITING-NOTES.md).','',
'**Reproduction.** With Vite on loopback via the project launcher, run the source snapshot and review builders in `scripts/sowing-rollout/` (`sources.mjs` then `build.mjs`). The source pass uses frozen reader-edit HTML where applicable, the approved two-page onion layout, or the compact production renderer at the original book folios. Snapshots are cached under `tmp/sowing-rollout/` for this revision. Use `finish.py` to check and render the individual PDFs, then use its `--combine` option to assemble the two review books. `review.py` builds this reader and register. The Python steps use the bundled PDF-capable runtime. A subset of crop keys may be passed to the proof builder and individual finaliser. The five approved samples are outside the source selection.','']
(base/'README.md').write_text('\n'.join(notes))
