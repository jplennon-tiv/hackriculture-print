# Planting rollout 02 - resume point

Complete for review, 16 September 2026. User authorised resumed rollout with save
points. This batch: broccoli, brussels_sprouts, cabbage, cauliflower, kale,
kohl_rabi. **17 of 44 guides now illustrated; 27 remain.** The five original
pilots are user-approved; this batch is complete for review, not automatically
approved by the user.

## Output and layout

Review `output/pdf/planting-rollout02/planting-rollout02-A4-metric.pdf`:
12 pages in the crop order above, with bookmarks. Individual imperial PDFs,
before PDFs, browser states, verification.json and rendered QA pages sit beside it.
These are normal export-button/API output, not injected mockups. Normal single
and batch exports require no AI; no images were generated in this batch.

| Crop | Final layout, both units | Details retained |
| --- | --- | --- |
| Broccoli | Vertical pair, 22 mm | Modules/seedbed, nursery vs final rows, sprouting/calabrese, transplant depth, both baseline seasonal notes |
| Brussels sprouts | Paired, 14 mm | Early cover, spring raising, final planting season, deep/firm planting, compact/tall spacing; two extra notes fit |
| Cabbage | Paired, 14 mm | Nursery vs final spacing, compact/large/winter/red/spring greens, nursery-depth planting, Chinese direct route; two extra seasonal notes fit |
| Cauliflower | Paired, 14 mm | Early/main/overwinter sowing, central bud check, normal/compact/mini spacing; three extra seasonal notes fit |
| Kale | Paired, 14 mm | Nursery/final spacing, deep planting, live transplant height, rape-kale direct route, both original baseline notes |
| Kohl rabi | Vertical pair, 22 mm | Direct sowing, staged thinning, module alternative, summer/late spacing, successions, water against woodiness; two extra notes fit |

All twelve installed PNGs byte-match the selected originals. Broccoli nursery
and kohlrabi sowing correctly use preferred v2 revisions. No source canvas,
typography, page-one design or full-width Final Tips layout was changed.
PDF skill visual review supported compact paired scenes for the four dense cards.

## Data preservation and RHS check

Deep comparison against the pre-work master passed: every pre-existing value
and all previous eleven companions are identical. Six `print_planting`
companions are additive and preserve all granular source prose. Two additional
kale measurement pairs, `final_row_spacing` and `transplant_height`, expose
standard rows and transplant size independently of nursery rows.

Source: https://www.rhs.org.uk/vegetables/kale/grow-your-own .
Exact additions: sibling shared `provenance/planting-rollout02-rhs-2026-09-16.json`.
The existing default/conventional/deep-bed measurements are qualified
alternatives, not an unqualified conflict. Nine provisional kale edits in the
intermediate wired checkpoint were withdrawn before delivery. Do not restore
that intermediate master as the final state. Existing website kale prose has no
numeric paragraph needing reconciliation and was not rewritten.

The captions do not promote the old cauliflower chemical-treatment note.
Mixed-unit legacy prose, older pesticide advice and unrelated calendar/variety
issues remain separate editorial work, not certified by this targeted rollout.

## Fit-guard correction

Brussels sprouts and cabbage exposed a false positive: their unchanged right
columns already exceeded the widget's fixed 958 px threshold. Their saved
before PDFs are two clean pages. The fitter now measures the settled original
page before activating illustrations and uses max(958, min(965, baseline)).
Thus a dense baseline may keep its existing height up to the existing page
target, but the widget cannot enlarge it past that bound. It still cannot trim
neighbours, shrink type or accept unresolved overflow. Tests cover this cap,
nursery/final bindings, preferred revisions and conditional routes.

## Checks actually completed

- 176 print tests / 14 files, TypeScript/Vite build and shared verifier passed.
  Existing chunk-size warning remains.
- Twelve real A4 PDFs: two pages each, correct size, Inter present, all images
  loaded and shown (no text fallback). All page-one text, previously visible
  planting notes and soil/care/harvest/pest advice retained. All new widget text
  appears in PDF extraction. No exception for pre-existing text changes was needed.
- Visual review: six metric fronts and twelve backs in both units, including
  final kale after preserving original source values. No clipping, overlaps,
  missing glyphs or broken art observed.
- Regression: all 22 previous illustrated browser outputs (eleven crops, both
  units) retained identical page-one/page-two text and final layout metadata.
- Website build (49 routes/44 approved guides) and TypeScript passed. Full suite
  still has the known scrollbar-width CSS failure (14 pass, one fail).
  Relevant guide/projection/rendered-page tests rerun after final data save.
- Video TypeScript, 13 parent tests and 17 kit tests passed; source verification
  repeated against the final master.
- No full-catalogue live batch and no new A5/A6 review. Existing smaller-paper
  scaling issue is unchanged. No commit, dependency changes or deployment.

## Save points and resume

Pre-change checkpoint (source/scripts/docs/plugins/master):
`../hackriculture-data/backups/documentation/2026-09-16-planting-rollout02-start.EuYkzw/`.

Intermediate wired checkpoint (not final data or finished QA):
`../hackriculture-data/backups/documentation/2026-09-16-planting-rollout02-wired.yBEbj9/`.

Complete final checkpoint:
`../hackriculture-data/backups/documentation/2026-09-16-planting-rollout02-complete.p2OXLk/`.
Read RESTORE.md before copying; the master belongs at the shared sibling root.
Master SHA-256:
`f5f7b446f46673649be74337fa28bd5c792eafc46fce72af905c7ff1d326f862`.

Recheck with Node 24:
`node scripts/check-planting-pilots.mjs --rollout02`, then bundled Python
`scripts/verify-planting-pdfs.py --rollout02`. Never use --baseline again:
the saved original baseline is evidence, not disposable generated output.

Next suggested six: garlic, onion_shallot, lettuce, endive, beet_leaf,
oriental_leaves. Keep onion seed/sets/shallots, garlic ordinary/elephant/clove-tip
cover and leaf-crop types distinct. Add a separate rollout03 mode/output folder
and before snapshots. Reuse existing selected art; no generation is needed.
All 27 remaining crops keep the original renderer until their checked rollout.
