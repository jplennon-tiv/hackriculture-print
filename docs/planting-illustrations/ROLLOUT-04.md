# Rollout 04 - previews user-approved, 17 September 2026

John approved the broad-bean, French-bean and sweetcorn previews. He also
requested basic checks and publication of all review results, leaving layout
polish for later. The current policy at the top of PROGRESS.md supersedes the
historical withholding/QA gates below. He reports a successful two-page leaf-beet
export in the browser; preserve his edits and do not change padding.

**25/44 illustrated widgets active; 19 remain.** This batch activates broad
beans, French beans and sweetcorn. Runner beans and peas are prepared but inactive
because their original PDFs already overflow. Together with leaf beet there are
three staged crops and sixteen not yet implemented. Five original pilots are
user-approved; subsequent batches are complete for review, not automatically approved.

Leaf beet remains untouched: John will edit its text and explicitly requested
NO padding changes. No padding, typography, fitter or other shared layout code
was changed for this batch either.

## Review output and information retention

`output/pdf/planting-rollout04/planting-rollout04-A4-metric.pdf` is a six-page
bookmarked pack from normal export output. Individual metric/imperial PDFs,
ten original baseline PDFs, browser snapshots, verification.json and QA renders
are saved beside it. Exports remain AI-free; no images were generated.

| Crop | Both-unit layout | Preserved/clarified information |
| --- | --- | --- |
| Broad bean | Two vertical scenes, 15 mm | Double-row geometry, within-pair vs between-pair spacing, spare seeds, protected start for cold soil/mice, tall-variety support, both baseline notes |
| French bean | Two vertical scenes, 17 mm | Warm-soil/frost conditions, paired sowing and thinning, under-glass start, dwarf row/block vs climbing support spacing, both baseline notes |
| Sweetcorn | Two paired scenes, 14 mm | Combined raising/planting caption with intact roots, four-or-more-row block, seeds/depth/row spacing, modern/baby/older cultivar spacing, both full baseline notes |

Sweetcorn retains all three full authored steps and original sowing artwork.
The column displays the intact-root planting scene plus preferred block v4.
Its compact first caption explicitly includes sowing, thinning, hardening off,
rootball preservation, warm planting conditions and watering. Block planting is
shown rather than omitted. PDF skill review favoured this compact pair over three
vertical pictures, which did not fit. No baseline advice was removed to fit art.

Twelve installed PNGs byte-match selected originals; six are displayed by the
three new active guides, five belong to staged runner/pea layouts, and one corn
sowing scene is retained unused. Total runtime assets: 60; active displayed
scenes: 51 (seven staged plus two unused active-crop assets account for the rest).

## Data and RHS review

Five new `print_planting` companions plus four additive measurement pairs only.
Deep comparison against the start checkpoint confirms EVERY previous master
value is identical, including leaf beet and all existing companions. Total
companions: 28; 25 active, three staged. Approved website prose is untouched.

RHS distinctions, not wholesale replacement of qualified alternative systems:

- [Broad beans](https://www.rhs.org.uk/vegetables/broad-beans/grow-your-own):
  expose 23 cm / 9 in. inside each double row separately from the existing
  rounded 61 cm / 24 in. between pairs.
- [French beans](https://www.rhs.org.uk/vegetables/french-beans/grow-your-own):
  add 15 cm / 6 in. dwarf-block and climbing-cane spacing. Retain the existing
  10 cm close-row plant spacing; the [RHS crop planner](https://www.rhs.org.uk/education-learning/school-gardening/resources/food-growing/vegetable-crop-planner)
  lists 10 cm plants / 45 cm rows, so distinguish growing systems rather than
  delete the alternative. Existing rounded row spacing is unchanged.
- Pea drill width exposes the existing method's approximately 4 in. as a live
  pair (about 10 cm), rather than hiding it in a caption. Pea remains inactive.

Exact paths, values and reasons:
`../hackriculture-data/provenance/planting-rollout04-measurements-2026-09-17.json`.
No source-correction exception was needed in PDF content comparisons.
Mixed-unit legacy prose and old advice remain separate editorial work; this is
not a whole-record gardening audit.

## Deferred crops: no hidden workaround

Runner beans and peas produced three-page before PDFs in BOTH units; third-page
extraction has no text. Metric page-three renders were inspected: runner has a
border tail, pea is effectively blank. Their unchanged right columns exceed the
965 px hard cap (content ends: runner 975.66 px; pea 977.42 px).

Both mappings live in `pendingPlantingLayouts`, with valid reviewed companions
and all selected assets. Neither is active. After deactivation, page-one/page-two
browser text exactly matched the original baseline in both units, with legacy
readiness and no new errors. Do not relax safety guards, alter padding, trim
neighbours or enable these mappings merely to increase the completion count.
They need a separate user-led text/layout decision, as with leaf beet.

## Checks completed

- Print: 191 tests / 14 files; TypeScript/Vite build; shared verifier pass.
  Existing chunk-size/npm configuration warnings remain.
- Six real new A4 PDFs: two pages each, correct paper size, Inter present, all
  illustrations loaded and shown. All page-one text, previously visible planting
  notes and soil/care/harvest/pest content retained. New widget text is present
  in PDF extraction. Three metric fronts and six backs visually inspected.
- Transfer smoke: chicory, carrot, broad bean and lettuce in both units produce
  two pages; images ready, trouble PDF and login page pass. Chicory/carrot backs
  in both units also rendered and visually inspected. Outputs:
  `/var/folders/87/dktgk05x62bcp6pv24n9q4cm0000gp/T/garden-transfer-check-FBYSSn`.
- Website build (49 routes, 44 approved guides) and TypeScript pass; tests remain
  14 pass, one known pre-existing scrollbar-width CSS assertion failure.
- Video TypeScript, 13 parent tests, 17 kit tests and source verification pass.
- No full-catalogue batch or new A5/A6 review. No deployment, dependency changes
  or commit. No global styling changes or leaf-beet edits.

## Restore points and continuation

Start: `../hackriculture-data/backups/documentation/2026-09-17-planting-rollout04-start.hWnj31/`.
Wired (not finished QA): `../hackriculture-data/backups/documentation/2026-09-17-planting-rollout04-wired.ZS1VRG/`.
Complete: `../hackriculture-data/backups/documentation/2026-09-17-planting-rollout04-complete.64sGo7/`.
Read RESTORE.md first; master belongs at the shared sibling root, not print/src.
Master SHA-256: `4dfe80b1f75134241d07e37b4b463dd718d95c6b6737e5a5c2fdf706c495182c`.

Recheck: Node 24 `scripts/check-planting-pilots.mjs --rollout04`, then bundled
Python `scripts/verify-planting-pdfs.py --rollout04`. NEVER repeat --baseline.
Next suggested group: marrow_courgette, squash_pumpkin, cucumber_outdoor,
cucumber_greenhouse. Use a fresh rollout05 folder and before snapshots. Preserve
protected/outdoor routes, rootball handling and bush/trailing spacing. Reuse
completed artwork and check before PDFs before activating any more dense guides.
