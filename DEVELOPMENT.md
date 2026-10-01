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

The binding [style contract](docs/VEGETABLE-PRINT-STYLE.md) now specifies
**Richer A v1** as the approved forward design (28 September). Its reference
HTML/CSS and hashed proofs are under `docs/vegetable-style-pilot/fresh-c/`.
Live owners: `src/print/RichVegetablePage.tsx`, `vegetableModel.ts`,
`richVegetable.css`, `familyTheme.ts`, `familyThemes.json`, `heroArtwork.json` and
`local-fonts.css`. The route uses Richer A; old `PrintVegetablePage.tsx` and its
widget/layout helpers are retained legacy code, not the active page template.

The model reuses approved source-linked extracts and saved content selections.
The measured renderer first reduces decorative space, then tries a second column
arrangement, preserving body type and selected advice. It reports unresolved fit
as `printError`, which stops export. Display titles shrink only within their
reserved header area. The [30 September title/header contract](docs/VEGETABLE-PRINT-STYLE.md#approved-titleheader-design-30-september)
is approved and implemented; keep its hashed proofs under
`docs/vegetable-style-pilot/header-refinement/` intact. Full-width tips and all
approved planting artwork remain.

All 44 planting layouts are active. Their illustrations and source-linked captions
supplement granular master advice. Measurement paths resolve live values. Changed
source prose requires caption review; image readiness precedes measurement.
Valid saved sowing extracts own the notes, with no automatic prefix top-up.

Saved content values (`pest_limit`, introduction/variety counts and approved
extracts) remain deliberate choices. Legacy tips/column geometry is not reused.
Runtime revision is `richer-a-v2-editorial-fill`; all 44 approved companions now
use that revision. Older compatible records validate editorial selections through
existing helpers, not legacy geometry.
Dependency/output signatures still detect source/manual changes. `aiReview=1`
permits draft previews but never grants approval. Initial template migration did
not write shared records; the approved content refinement later updated print
companions through the guarded writer. Calendar signals are fixed across family palettes: usual sow
#d6ea9b, less usual sow #6b9069, usual harvest #ff781f, less usual harvest #ae7950.

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
- Approved static cover, contents and how-to PDFs live in `public/front-matter/`.
  `scripts/build-front-cover.mjs` builds selected cover C from
  `docs/front-matter/cover-studies/preview-c.html` and its local artwork/thumbnail
  assets. `docs/front-matter/entry-pages/build.mjs` owns contents and how-to;
  use `--how-to-only` for how-to revisions to preserve signed-off contents.
  The old `build-how-to.mjs` and old cover template do not own current output.
  Approval hashes are in `docs/redesign-rollout/APPROVAL.json`.

## Troubles printing

Active owners: `EditorialTroublePage.tsx`, `editorialTroubleLayout.ts` and
`editorialTrouble.css`; they reuse `troubleContent.ts` and `troublePlan.ts` for
source-current approved copy and reading order. Renderer revision is
`open-editorial-v1-family-tint`. Old card heights never govern pagination.
Whole entries fill two open columns at natural heights; a too-tall entry fails
explicitly rather than being cut. All condition identities are checked once.
`familyTheme.ts` maps every guide explicitly, including mixed families. Full
source introductions replace stale adaptations, with warnings. Diagnostic art
uses contain sizing; visual measurement captions follow selected units.

Troubles authoring tools remain in `scripts/`; inspect their assumptions and
arguments before reuse. Approval tools require John's actual approval. In
particular, `export-troubles-review.mjs` and `check-troubles-layout.mjs` still
query retired card-layout selectors (`data-source-card`, `data-column`): they
are not validators for the active Open Editorial renderer. Use the current
`/print/trouble/<key>` route, readiness/error/warning attributes and active
component selectors for bounded checks; do not infer correctness from those old
reports. Migrating those helpers is optional future tooling work, not completed.

## Sizing, exports and checks

The new routes define native 210 × 297 mm sheets and `@page` zero margins,
with 32 px (8.5 mm) horizontal text insets. CSS overrides the export plugin's
legacy margin defaults. John accepted these side insets for now on 29 September
after test printing. The measurement viewport
may be narrower than the fixed-width sheet without changing its layout.
Local fonts and images resolve before `printReady`; `printError` stops export.
Actual PDF page counts remain authoritative. A5/A6 remain unreviewed; further print-detail feedback is pending.

Representative PDFs and fit reports are in `output/redesign/`; the review index
is `docs/redesign-rollout/REVIEW.html` (rebuild index only with its neighbouring
`build-review.mjs` from the project root). Approved entry pages and their bounded
builder are in `docs/front-matter/entry-pages/`; the current A builder installs the contents/how-to batch assets.

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

## Collection page numbering

`src/print/bookPagination.json` is the shared measured edition map. Vegetables
are grouped by navigation family then alphabetical, two pages each (1–88).
Troubles is alphabetical with actual measured lengths (89–132 currently).
Cover, contents and how-to remain unnumbered. Both print routes use the same map,
including single downloads; batch uses its order and emits `collection-order.json`.
That file is the assembly order, rather than alphabetical output filenames.
Failed exports leave `complete:false`; do not assemble an incomplete collection.

Refresh after source/order/Troubles-layout changes with start.command running:
`node scripts/measure-book-pagination.mjs`, then
`node docs/front-matter/entry-pages/build.mjs`. No catalogue PDF render is needed.
The first command measures both unit editions. The second validates the source
receipt and equal unit numbering, creates the two A4 entry PDFs, and installs
them with `public/front-matter/pagination.json`. The export guards check source
changes, actual page counts and batch contents receipt; they never silently
renumber later pages against an outdated contents sheet. Measurement mode uses
`pagination=measure` for internal DOM counting only.

## Approved vegetable content refinement

`docs/content-refinement/REVIEW.html` contains the 44 proofs approved by John on
30 September. Reviewed print companions are installed; master advice is preserved. `richPageFill.ts` provides bounded spacing
and compares the two existing column arrangements only for saved layouts carrying
`RICH_CONTENT_LAYOUT_REVISION` (`richer-a-v2-editorial-fill`). Draft status still
requires `aiReview=1`; normal exports cannot adopt an unapproved layout. Reminder
and Final Tips grids use their actual item count in that revision.

The source-linked proposal lives in the data project's planning directory. The
review's installer checks the source revision and verified proposal before using
`saveCollections`, preserving exact previous bytes. See the review README for
checks and accepted whitespace exceptions. SAVE-RECEIPT.json records the completed
guarded write and exact-byte backup verification. INSTALLATION-CHECKS.json records
the live both-unit tomato PDF smoke and ten focused tests. The proposal is a consumed
review snapshot; do not rerun preparation over the installed expanded companions.
Pagination and approved front matter are unaffected.

Sowing-note review warnings apply when a sowing source or companion exists. If
both are absent and the rendered notes are empty, the editorial report records
`not_applicable` (Mushroom’s approved kit route). Invalid/stale companions still
warn; this reporting fix changes neither content nor canonical data.
