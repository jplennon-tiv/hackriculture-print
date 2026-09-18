# Planting rollout 03 - resume point

Complete for review, 17 September 2026. **22 of 44 guides now illustrated;
22 remain.** Five original pilots are user-approved; subsequent rollouts await
review. This batch activates garlic, onion_shallot, lettuce, endive and
oriental_leaves. Leaf beet is prepared but deliberately inactive (see below).

## Output and layout

Review `output/pdf/planting-rollout03/planting-rollout03-A4-metric.pdf`:
ten pages, in the crop order above, with bookmarks. Individual imperial PDFs,
before PDFs, browser states, verification.json and rendered QA pages are beside it.
These are normal export/API output, not injected mockups. Single and batch
exports remain AI-free; no new image generation was needed.

| Crop | Final layout, both units | Details retained |
| --- | --- | --- |
| Garlic | Vertical pair, 19 mm | Clove orientation and soil above tip, ordinary/elephant spacing, rows/blocks, light/heavy soil qualification, both original notes |
| Onions and shallots | Paired, 14 mm, compact captions | Sets vs seed depth, salad/bulb/shallot/clump spacing, seed route, both detailed original transplant/thinning notes |
| Lettuce | Paired, 14 mm, compact captions | Outdoor/tray seed cover, hearting/loose-leaf spacing, cool shaded trays, succession, transplant route; two additional notes |
| Endive | Paired, 14 mm, compact captions | Curly/broad-leaf seasons and spacing, staged thinning, all four original notes including deep-bed leaf alternative |
| Oriental leaves | Paired, 14 mm | Module/direct routes, original planting level, crown clearance, baby/larger-leaf/Chinese cabbage spacing, late-summer sowing; two additional notes |

Full step wording remains stored alongside optional compact wording. No source
prose was replaced. Endive's fitter metadata reports two optional candidates,
but these overlap the four baseline notes: it does NOT gain two extra bullets.

Twelve installed PNGs byte-match their selected originals. Endive sowing reuses
the compatible chicory v2 scene, and leaf beet reuses beetroot's v2 seed-cluster
scene. Preferred garlic-cover and endive-thinning revisions are used. Ten new
scenes are displayed; two are staged. Total installed assets: 48 (including the
previous unused leek hole scene). Source canvases are unchanged.

PDF skill visual review supported paired scenes and stored compact captions on
the denser cards. No fitter, CSS, typography, page-one or Final Tips changes
were made in this batch.

## Leaf beet: prepared, not activated

`pendingPlantingLayouts.beet_leaf` stores the two-scene layout; its companion
and artwork are ready. It is excluded from active resolution and new production
exports. Both saved original PDFs already have three pages: a near-blank third
page contains the bottom border tail. The unchanged right column exceeds the
safe layout budget. Do not relax the guard, shrink type or silently remove
neighbouring advice to enable the widget. Its legacy page-one/page-two browser
text remains identical in both units. Address this existing page-layout problem
separately, then move the staged mapping into the active map and retest.

## Data preservation

Final deep comparison against the start checkpoint passed: removing only these
six new `print_planting` companions yields the identical original master.
All granular gardening records and all 17 previous companions are untouched.
There are 23 companions, of which 22 currently drive active illustrated layouts.
Measurements resolve live; stage/type qualifications were retained. No new
unqualified measurement conflict requiring RHS correction was found in this
batch. Earlier RHS corrections remain intact. No website prose was regenerated.

## Checks actually completed

- 184 print tests / 14 files; TypeScript/Vite build; shared source verifier pass.
  Existing build chunk-size warning remains.
- Ten real A4 PDFs: two pages each, correct paper size, Inter present, all new
  images loaded and shown (no text fallback). Page-one text, baseline planting
  notes and soil/care/harvest/pest advice retained; new widget text present in
  extracted PDFs. No source-correction exception needed for rollout03.
- Visual review: five metric fronts and ten backs across both units, plus leaf
  beet's baseline third page. New widgets have no observed clipping or overlap.
- Pre-existing header-callout icon defects remain on garlic and oriental leaves
  (solid coloured squares). Confirmed in both saved before PDFs. They are outside
  this widget change; this is not a claim that the entire legacy design is flawless.
- Transfer smoke passed: chicory, carrot, broad bean and lettuce in both units,
  trouble PDF and admin login. Final lettuce layout was subsequently covered by
  the ten-export check above. Leaf beet remains unchanged after deactivation.
- Website build (49 routes/44 approved guides) and TypeScript pass. Full tests:
  14 pass, one known pre-existing scrollbar-width CSS assertion failure.
- Video TypeScript, 13 parent tests, 17 kit tests and source verification pass.
- No full-catalogue batch export or new A5/A6 visual approval. Existing smaller
  paper scaling, mixed-unit legacy prose and unrelated old advice remain separate
  work. No dependency changes, commit or deployment.

## Save points and safe resume

Pre-change checkpoint:
`../hackriculture-data/backups/documentation/2026-09-17-planting-rollout03-start.KlMseN/`.

Intermediate checkpoint (not final layout or completed QA):
`../hackriculture-data/backups/documentation/2026-09-17-planting-rollout03-wired.IpgwON/`.

Complete checkpoint:
`../hackriculture-data/backups/documentation/2026-09-17-planting-rollout03-complete.x5Ejrd/`.
Read its RESTORE.md before copying; the master belongs at the shared sibling
root, never print/src. Master SHA-256:
`1214a39e421adcb9182d81861dee3a235272aea7ea4b4713d167bf93235fa08b`.

Recheck using Node 24: `node scripts/check-planting-pilots.mjs --rollout03`, then
bundled Python `scripts/verify-planting-pdfs.py --rollout03`. Never repeat
`--baseline`: saved before PDFs are evidence, not disposable generated output.

Next suggested group: bean_broad, bean_french, bean_runner, pea, sweet_corn.
Use a new rollout04 mode/output folder and before snapshots. Preserve dwarf vs
climbing/support routes and the three-scene runner/sweetcorn sequences where
possible. Reuse selected art; generation is complete. All 22 remaining crops
keep the original renderer, including the explicitly staged leaf beet.
