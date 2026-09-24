**24 September follow-up:** a dedicated bolting-onion silhouette now replaces
only the onions-and-shallots Bolting image. [Comparison and both-unit proofs](ONION-BOLTING.html).
John approved this correction; the previously approved set remains signed off. All 58 core records unchanged; 273 tests/build passed; four crops in
both units checked. [Checks](ONION-BOLTING-CHECKS.json).

**Current, 24 September: silhouette drawings and page proofs approved.**
John approved all 31 silhouette drawings and the ten page proofs. They are
installed with crop-specific assignments. All 44 crops/173 cards checked;
duplicate identities removed and crop-specific meanings mapped. All 58 core
records are unchanged during this redraw; earlier guarded parsnip corrections
and backups remain. Ten individual PDFs (five crops, both units), all 20 pages
inspected; 273 tests/build passed. Existing unrelated fit warnings are recorded.
[Review the drawings and proofs](SILHOUETTE-SET.html) ·
[Current status](KEY-RISK-CORRECTIONS-STATUS.md).

The dated entries below describe earlier checkpoints, not current outstanding work.

**24 September: all vegetable Key Risks assignments audited (read-only).**
[Crop-by-crop visual audit](./KEY-RISK-ASSIGNMENTS-AUDIT.html) ·
[Structured findings](./KEY-RISK-ASSIGNMENTS-AUDIT.json) ·
[Checks](./KEY-RISK-ASSIGNMENTS-AUDIT-CHECKS.json).
All 44 live production sheets: 173 cards, 87 distinct label/icon combinations.
Editorial assessment: 129 keep, 8 refine, 33 replace, 3 missing; icon concerns
on 30 crops (25 have replacement/missing issues). Six crops repeat identities:
beetroot, broccoli, Brussels sprouts, cabbage, cauliflower and parsnip.
Fix selection aliases first, then audit newly exposed cards before finalising
new-art scope. Six existing-art/alias candidates and specific new-art concepts
are recorded. No assignments, production code, source data or artwork changed.
RHS-first checks inform biological distinctions; proposed visual subjects remain
editorial judgements for review. Generic correct-subject cues remain acceptable.
The HTML scan recorded fit warnings for broad bean, French bean and courgettes,
plus the documented mushroom sowing fallback; no PDFs or fit diagnosis here.
Parsnip's Carrot Fly card still says “on carrots”: separate wording follow-up.
Review page filters, image loading, local links, mobile width, all 35 approved
hashes and unchanged shared revision checked. No application tests needed.

**24 September follow-up: PDF icon-edge artefacts corrected; rhubarb meanings reviewed.**
Apple CoreGraphics reproduced faint rectangles at 150% zoom around the previous
CSS-masked backgrounds. Direct images with an SVG colour filter remove those
edges at all five checked scales (100%, 125%, 150%, 200%, 300%). Original PNGs,
32px size, spacing and adjustable ink remain. Renderer v7 preserves existing
saved content choices. Four crops/both units remain two pages; all 16 pages
inspected, text unchanged, character positions within 0.1pt; 268 tests and build passed.
Rhubarb's generic root-rot drawing is duplicated for crown rot/honey fungus;
the deficiency leaf poorly represents stringy stems. Proposed specific subjects
are recorded, but not generated/installed. Slug is retained. Shared data and all
artwork hashes unchanged. [Updated examples](./NATURALISTIC-INSTALLED.html) ·
[Checks and proposals](./NATURALISTIC-BORDER-FIX-CHECKS.json).

# Vegetable icon pilot, 23 September 2026

**Current: all 36 coloured drawings and all four representative proofs approved; style A installed.**
Quick Facts, printed Core Needs and Final Tips now resolve to the approved SVG
library at their original sizes. The admin picker includes all 36 meanings;
`nutrition` reuses `feeding`. [Asset guide](../../public/images/coloured-icons/style-a-v1/README.md).

John approved the [page proofs](COLOURED-PROOFS.html) and requested installation and
archiving. The two reviewed Final Tip refinements are saved: broccoli netting and
greenhouse-cucumber inspection. Other assignments, prose, ranks, locks and unknown
fields are retained. [Installation receipt](INSTALL-RECEIPT.json) includes proof
hashes, the guarded data transaction and exact prior-byte backup location. All
42 unaffected vegetable records remain byte-identical.

[Archive](../archive/coloured-icons-pre-style-a/README.md): 56 superseded files,
including legacy and trial coloured art, three printed Core Needs PNGs and the old
raster exporter. Every file retains its original bytes and has a SHA256 manifest.
Historical static front-matter scripts now read the archive; their approved PDFs
are unchanged. Pilot/study artwork and approved proof files remain available.

[Installation checks](INSTALL-CHECKS.json): four representative crops (broccoli,
greenhouse cucumber, carrot, rhubarb), both units, eight two-page production PDFs.
All 16 rendered pages inspected; text, geometry, readiness and monochrome references
match the pre-install production baseline. No new clipping or missing assets.
All 44 crop reviews remain current; all 110 Final Tip paths resolve. All 72 approved
SVG/PNG hashes and 56 archived-file hashes verified. 57 focused tests and 266 full
tests passed; build passed with the existing chunk warning.

Known limitation: ordinary broccoli exports still have the pre-existing duplicate
Club Root/Clubroot risk, displacing Pigeons. Its formerly missing icon alias is now resolved. Unlike the approved
visual proofs, installation QA used normal production output without a temporary
card substitution. This is recorded separately and is not an icon-install regression.

**Key Risks: all 35 naturalistic drawings approved and installed, 24 September.**
John approved the full set and requested installation after viewing the mockup.
[Installed page examples](NATURALISTIC-INSTALLED.html) ·
[Approval hashes and validation](NATURALISTIC-INSTALL-CHECKS.json) ·
[All 35 drawings](NATURALISTIC-SET.html).

Production uses `public/images/key-risk-icons/naturalistic-v3/` through explicit
label mappings in `src/lib/keyRiskIcons.ts`. PNG bytes are unchanged; 32px alpha
masks give consistent, adjustable ink. The template has proper 32px slots and
8px top padding; drawing dimensions are unchanged. Small Roots uses its dedicated
artwork, and the Clubroot spelling now shares the Club Root drawing. Broader
mapping/duplicate-content issues remain separate.

Renderer v6 retains v5 and eligible v4 saved content choices and remeasures them.
No shared records or approval metadata were rewritten. Four crops in both units:
eight two-page PDFs, all 16 pages inspected; unchanged text, no missing assets or
warnings. Ten focused tests, 268 full tests and build passed. Approved risk,
original monochrome and coloured artwork hashes all verified.

[Generation manifest](NATURALISTIC-SET-MANIFEST.json) and
[original review checks](NATURALISTIC-SET-CHECKS.json) remain historical receipts.
The PNGs are raster assets, not vector masters. One core concept per image; frost
is the crystal alone. Fine detail softens at 32px; written labels remain necessary.
Original artwork, previous approval receipts and coloured/title artwork are retained.
The six superseded naturalistic first attempts are
[archived](../archive/key-risk-naturalistic-first-pass/README.md).
The earlier mockup exporter records the v5 browser-only experiment; use ordinary
production routes for current output. **Crop bubbles remain deferred.**

Rebuild SVGs/PNGs and the gallery with `node docs/icon-pilot/build-coloured-set.mjs`
using Node 24. The builder guards approved hashes and does not re-render approved
drawings. Recreate and verify the ZIP after any artwork changes; it is a
delivery bundle, not a source of truth. Earlier A/D experiments below are historical.

**Original pilot:**
Open [the review gallery](REVIEW.html) for all 15 drawings at enlarged and page-slot
sizes, background/recolouring examples and the four separate sample PDFs.

**Latest: John prefers A and D and requested a page mock-up using D for both
families.** [Open the D broccoli mock-up](DUOTONE-MOCKUP.html): one two-page metric
sheet, with all 17 required icon designs in D, across 20 placements. Includes Depth
and all four risks; there are no leftover old icons in the requested icon slots.
Title-banner icons, crop/planting illustrations, text and geometry are retained.
Existing sizes remain unchanged. All SVG/PNG assets are transparent and isolated
under `public/images/icon-pilot/duotone-mockup/`. The full catalogue remains pending.
The approved-proof pigeons restoration described below also applies here.

[D asset manifest](DUOTONE-MANIFEST.json) · [D checks](DUOTONE-CHECKS.json).
Both actual PDF pages were rendered and visually inspected. Text matches the
approved broccoli proof; all 20 substitutions preserve measured element geometry.
Fonts/images are ready, no print warnings, clear PNG edges. Tests: 247 passed;
build passed with the existing chunk-size warning. Reproduce with
`node docs/icon-pilot/build-duotone-mockup.mjs`, then (with loopback Vite running)
`node docs/icon-pilot/export-duotone-mockup.mjs`. Follow the PDF skill's marker before
the first PDF authoring command for a new operation.

**Style exploration:** John likes the first study and requested other directions
before expanding. [Compare four styles](STYLE-STUDIES.html): the existing pilot,
botanical pen-and-ink, garden woodcut and quiet duotone. Each uses sowing, watering,
aphid and broccoli. The 12 alternatives are original transparent SVG/PNG studies
in `public/images/icon-pilot/styles/`; no production mappings or PDF proofs changed.
John explicitly deferred the size experiment: keep the current 28/32/34px slots.
The large board samples show drawing detail only. My preference is botanical ink
for growing advice, with woodcut as a candidate for risks/bubbles; this is a design
judgement for review, not an accepted change. The botanical detail is lighter at
small size; the woodcut and duotone shapes are bolder.

All four rows were visually inspected, including the current-size samples. The
12 PNG exports have transparent pixels and clear edges. Background and transparency
controls work; inline crop SVGs avoid local-file CSS-mask loading restrictions.
[Checks](STYLE-STUDIES-CHECKS.json). Rebuild only this board with
`node docs/icon-pilot/build-style-studies.mjs`.

## Brief inventory

| Use | Existing artwork | Pilot direction |
| --- | --- | --- |
| Title banners / crop heroes | Approved artwork | Preserve unchanged |
| Quick Facts | 19 transparent 384px PNGs | One warm illustrated family |
| Core Needs | 3 transparent 1254px PNGs | Same family; retain existing scale bars |
| Final Tips | Reuses Quick Facts with contextual mapping | Explicit meaning, including inspection |
| Key Risks | 34 PNG drawings, 250 label mappings; mixed resolutions | Coherent single-colour silhouettes |
| P2 crop bubbles | 44 transparent 1024px PNGs | Clear crop silhouettes; existing category colours |

The audit covered the owning mappings, asset formats and four approved example
sheets: carrot, broccoli, greenhouse cucumber and greenhouse tomato. It is not a
complete semantic review of every crop/risk pairing.

The main mapping problems are substantive: `poor_germination.png` serves 23 labels,
including bitterness and soft tubers; `forked_root.png` serves 14 labels, including
small roots, green top and woody kohl rabi. `protection` also represents inspecting
leaves. Redrawing those files alone would retain misleading meanings. The wider
rollout should assign explicit meanings first, preserving genuine crop distinctions.

## This study

Eight coloured drawings: sowing, rows, plants, water, nutrition, sunlight, harvest
and inspection. Seven monochrome drawings: aphid, frost, forked root, small root,
mildew, broccoli and cucumber. [Manifest and palette](MANIFEST.json).

The artwork is original AI-assisted SVG path construction, not a raster-image
generation or a traced existing illustration. Masters use a 96-unit square, a
restrained shared palette and consistent rounded outlines. PNG exports are 384px
with alpha. Every background and every monochrome cutout is transparent. There are
no white backplates. SVG palette tokens are editable; monochrome crop icons use
CSS masks in the samples. PNG exports retain fixed colours.

Broccoli and greenhouse cucumber each have metric and imperial two-page A4
samples in [output/pdf/icon-pilot-v1](../../output/pdf/icon-pilot-v1/). These replace
selected icons only. Aphid and the two root symbols are board-only samples, not
inserted into crop advice that does not call for them. Source data, production
mappings, approved assets and original PDFs are unchanged.

## Existing export conflict found

Broccoli's inline `Club Root (Finger and Toe)` and the newly normalised shared
`Clubroot (Finger and Toe)` are treated as different identities by the current
print renderer. Both reach P1 Key Risks, displacing **PIGEONS**. The renamed label
also misses the old exact icon mapping. This predates the icon substitutions.

For these two pilot PDFs only, the review exporter restores the approved PIGEONS
card in the browser from the unchanged vegetable record. The PDFs' extracted text
then matches the existing approved proofs exactly. This is recorded in each
`approvedProofAdjustment` in [CHECKS.json](CHECKS.json). No production fix or shared
data edit is hidden in this visual study. Reconcile semantic trouble aliases and
test duplicate selection as a separate, focused renderer change before rollout;
do not solve this by rewriting the approved advice.

## Checks and next step

- Four PDFs: two A4 pages each, fonts loaded, no missing images or print warnings.
- Icon replacement preserves every measured page-element rectangle and all text;
  broccoli baseline includes the explicitly recorded approved-proof restoration.
- All 15 PNGs contain transparent pixels and have no painted pixels touching edges.
- Hashes verify existing icon assets and four approved PDFs unchanged. Shared data
  revision remains `28df4d70397b07a9600a258d8de5f0b59e678d3c89f7390373186d2941a81fe0`.
- [PDF checks](PDF-CHECKS.json) compare extracted text with the approved proofs.
- All eight rendered PDF pages were visually inspected: no new clipping, overflow,
  missing symbols or background boxes. Existing bubble layout remains unchanged.
- `npm test`: 247 passed. `npm run build`: passed; existing large-chunk warning.

John's review comes before expansion: assess family style, small-size legibility
and silhouette detail. Then complete the existing 19 Quick Facts meanings, Core
Needs and Final Tips, adding justified distinctions such as thinning, ventilation,
pollination, mesh protection and inspection. Audit risk identities before drawing
the full set; preserve category colours and title artwork. Validate the eventual
rollout on five representative crops in both units, without a combined PDF pack.

## Reproduce

Run `node docs/icon-pilot/build-pilot.mjs` to rebuild the isolated SVG/PNG assets and
gallery. With the loopback Vite server started using `start.command`, run
`node docs/icon-pilot/export-pilot.mjs` with Node 24. The exporter refuses a changed
shared revision and performs only transient browser substitutions. It never saves
records, changes locks or invokes the shared writer. Follow the PDF skill's marker
and render/inspect workflow when creating a new set of proofs.
