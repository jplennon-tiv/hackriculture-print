# Current implementation

## Application and data

React/Vite/TypeScript. `src/App.tsx` owns routing; `src/admin/` provides the local
editor. `adminApiPlugin.ts` supplies authenticated saves/uploads;
`pdfPlugin.ts` provides deterministic single and batch PDF exports.
`sharedRecordsPlugin.ts` refreshes the shared store's disposable projections.
Use the Vite server through `start.command` on loopback; static preview cannot
save data or export PDFs. No external AI service is used by normal rendering.

`src/types.ts`, `src/schema.ts` and admin validation must agree. Keyed collections,
unknown fields, ranks, `--MM` cyclic calendar values and paired prose survive
round trips. Use `src/lib/` helpers for slug, months, duration, units and ranking.
Ranked `text`/`short_text` and sowing `method` accept plain or metric/imperial prose.
Inline conditions may specify `applies_to`; explicit crop scope takes precedence
over a same-label shared condition. Unscoped entries retain the shared scope filter.
`troubleIdentity.ts` deduplicates display aliases without deleting master advice.

## Vegetable printing

The binding [style contract](docs/VEGETABLE-PRINT-STYLE.md) takes priority:
fit, then column-bottom alignment, then useful whitespace filling. Keep original
fonts, padding, artwork and the staggered layout. Final Tips remains full-width by
default, with existing per-crop exceptions.

Owners: `src/print/PrintVegetablePage.tsx`, `print.module.css`,
`useVegetableLayout.ts`, `vegetableLayout.ts`, `pageFill.ts`, `PlantingCard.tsx`,
`planting.module.css`, `plantingIllustrations.ts` and `heroImageCrops.json`.

All 44 planting layouts are active. Their illustrations and source-linked captions
supplement granular master advice. Measurement paths resolve live values. Changed
source prose requires caption review; image readiness precedes measurement.
Valid saved sowing extracts own the notes, with no automatic prefix top-up.

Saved layout values (`pest_limit`, introduction/variety counts, tips placement,
`tips_columns`, `align_bottoms`, `fill_bottoms`) are deliberate choices. Preserve
them unless re-curating the crop. Do not use automatic fitting to silently override
accepted counts or trim useful content. Flexible rows share only suitable spare
height after natural fitting; typography and minimum padding stay fixed.

Renderer revision is `vegetable-extracts-v9`; unchanged v8/v7/v6/v5 and eligible
string-only v4 content choices remain compatible and are remeasured. Dependency
and output signatures detect changed source or manual edits. `aiReview=1` permits
explicit draft previews. It never grants approval.

Key Risks prefer `short_text`, falling back to full `text`; the full applicable,
deduplicated condition pool is ranked independently of the page-two table limit.
Table counts vary with crop relevance and fit; condense signs/control before
omitting useful conditions and preserve the original full advice.

## Artwork

[Current asset registry](docs/assets/README.md). Keep SVG/PNG transparency and
approved resolution. No resizing or redraw during unrelated maintenance.

- Style-A coloured icons: `public/images/coloured-icons/style-a-v1/`, 36 SVG masters
  and PNG companions. Quick Facts/Core Needs use 28px; Final Tips use 32px.
  `src/lib/quickFactIcons.ts` owns selection; nutrition aliases feeding.
- Key Risks: naturalistic-v3, silhouette-v5 and onion-bolting-v1 under
  `public/images/key-risk-icons/`. `src/lib/keyRiskIcons.ts` owns crop overrides.
  32px slots, 8px heading clearance, alpha-preserving SVG colour filter. Avoid CSS
  background masks: they caused PDF box-edge artefacts at fractional zoom.
- Hero originals and lossless transparent-margin crops are mapped in
  `heroImageCrops.json`; preserve both. Planting artwork lives under
  `public/images/planting/`. Crop bubbles remain outside the current task.
- Approved static cover/how-to PDFs live in `public/front-matter/`. Builders are
  `scripts/build-front-cover.mjs` and `scripts/build-how-to.mjs`; their required
  template, reference pages and six historical icon inputs remain in
  `docs/front-matter/`. These are live build inputs, not an old review archive.

## Troubles printing

`PrintTroublePage.tsx`, `troubles.module.css`, `troubleContent.ts`,
`troublePlan.ts` and `troublePagination.ts` render approved, source-current text
and saved two-column card plans. Source changes invalidate saved adaptations;
fallbacks warn. Full master prose remains intact. Existing group colours and
approved combined heroes stay active. Each non-final page should contain four
condition widgets; preserve readable content and report an impossible fit.

Reusable authoring tools remain in `scripts/`: `review-troubles-ai.mjs`,
`export-troubles-review.mjs`, `approve-troubles-ai.mjs` and
`pack-approved-troubles.mjs`. Use explicit group keys for bounded work; inspect
arguments before use. Approval tools require John's actual approval.
`check-troubles-layout.mjs` is an optional broader diagnostic, not a routine step.

## Sizing, exports and checks

A4 export: 688 × 979 measurement viewport; 18mm top, 20mm bottom, 14mm side margins;
scale 1 and backgrounds on. Wait for `printReady` and loaded fonts/images.
Source/readiness errors stop export. Layout warnings allow export for editing.
Page budgets account for bottom padding and borders with a rounding margin;
physical PDF page counts are authoritative. A warning can be conservative.

The batch report stays in normal header flow with bounded scrolling. Do not
restore a fixed-height header or floating report. Its optional focused browser
check is `scripts/check-batch-report-layout.mjs`.

Routine POC verification is deliberately small: affected unit tests or `npm test`,
then one affected-crop smoke PDF only for print changes. `check:fit` measures HTML
without a PDF; `check:smoke` also checks actual pagination. Add the other unit when
measurement/wrapping changes, or another crop for shared layout logic. Full suites,
builds, raster reviews and catalogue exports are not mandatory after every edit.
See [SETUP](SETUP.md) for commands and [current status](docs/handover/START-HERE.md)
for known limitations. Do not run cross-project builds without a relevant change.
