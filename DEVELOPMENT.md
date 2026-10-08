# Current implementation

This file describes live code and reproducible procedures. Current scope,
approvals and next actions are in [the handover](docs/handover/START-HERE.md);
commands below are capabilities, not an instruction to rerun completed work.
Use the requested format, approved source assets and a bounded change scope.

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
**Richer A v1** as the retained A4 design (28 September). Compact export reflows
this source markup through the separate book profile described below. Its reference
HTML/CSS and hashed proofs are under `docs/vegetable-style-pilot/fresh-c/`.
Live owners: `src/print/RichVegetablePage.tsx`, `vegetableModel.ts`,
`richVegetable.css`, `familyTheme.ts`, `familyThemes.json`, `heroArtwork.json` and
`local-fonts.css`. The route uses Richer A; old `PrintVegetablePage.tsx` and its
widget/layout helpers are retained legacy code, not the active page template.

The model reuses approved source-linked extracts and saved content selections.
Saved `ai_print_layout.value.intro_sentences` is an optional positive integer,
bounded at rendering by the available text. It is an editorial selection, so the
schema permits reviewed counts above twelve (Mushroom uses thirteen). The retained
legacy fitter's twelve-sentence limit applies only when no saved count exists;
`introSentenceLimit` keeps that distinction explicit. The active Richer A model
already honours the saved count, and compact exports inherit its introduction.
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

`PlantingSection.tsx` renders the active planting panel. Optional
`print_planting.routes` group steps by ID and attach source-linked route notes;
every step must occur exactly once. Captions/notes accept a string or complete
metric/imperial text pair. Route notes participate in the source fingerprint,
including measurements embedded in their captions. `plantingRoutes.css` only
styles grouped panels; ordinary guides retain their existing sequence. The
Onions and Shallots guide uses seed and set groups. `sowing_and_planting.depth_label`
optionally clarifies the Quick Facts label without changing its depth icon.
See [the onion implementation and checks](docs/onion-planting/README.md).

`vegetableModel.ts` reads arbitrary-depth variety groups, honours concise
`character.short_text` on metadata-style entries, and removes exact repeated
cultivar names from the printed shortlist without deleting source records.
Existing ranks and per-guide `variety_count` determine selection. The recursive
schema already supports this structure; Beetroot needs no special template.
See [variety maintenance and proof evidence](docs/variety-review/README.md).

Saved content values (`pest_limit`, introduction/variety counts and approved
extracts) remain deliberate choices. Legacy tips/column geometry is not reused.
Runtime revision is `richer-a-v5-variety-case`; saved content remains compatible
with `RICH_CONTENT_LAYOUT_REVISION` (`richer-a-v2-editorial-fill`). Older compatible records validate editorial selections through
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
  Approval hashes are in `docs/redesign-rollout/APPROVAL.json`. These builders
  overwrite installed A4 assets; they are not compact-book builders. Inspect the
  [source inventory](docs/assets/README.md) before adapting their compositions.

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

The retained A4 source routes define native 210 × 297 mm sheets and `@page` zero margins,
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
then an affected-format PDF when visual changes warrant it. `check:fit` measures
A4 HTML without a PDF; `check:smoke` checks A4 pagination. Compact work uses its
actual route and PDF checks below. Add the other unit when
measurement/wrapping changes, or another crop for shared layout logic. Full suites,
builds, raster reviews and catalogue exports are not mandatory after every edit.
See [SETUP](SETUP.md) for commands and [current status](docs/handover/START-HERE.md)
for known limitations. Do not run cross-project builds without a relevant change.

## Compact book exports

The default PDF size is `185x240` (185 × 240 mm). Shared choices/default/parser
are in `src/lib/paperSize.ts`; React stores subsequent choices in
`gg-paper-book-v1`, deliberately starting the book edition at the new default
instead of inheriting the old A4 default. Vegetable and Troubles preview/save,
and batch, pass both units and paper. A4/A5/A6 remain selectable.

`pdfPlugin.ts` first loads the approved source-linked A4 DOM, then invokes
`src/print/book/renderCompact.ts` in an isolated same-origin `print-shell.html`
document. `compact.css` and `kaleCopy.ts` implement the approved compact reference
without modifying A4 templates or frozen proofs. Fonts/images resolve before
measurement; text/image coverage, trim, footer clearance and physical PDF page
count are checked. Whole blocks move to continuations; unfit blocks fail with
an editorial error. Main type is not shrunk. The API uses custom width/height,
CSS page size, zero outer margins and scale 1, not an A4 reduction.

Compact batch writes `output/book-185x240/<units>/`, reuses collection order but
never A4 folios, and excludes A4 opening pages. Its manifest has
`scope:guide-proofs`, local numbering, actual page counts and `complete:false`;
`guidesComplete` reports whether all guide exports succeeded. The ordinary browser export does not add smaller opening pages. John separately
authorised working opening pages and assembly during the overnight preparation;
these remain review drafts. Follow [BOOK-PRINT-STYLE](docs/BOOK-PRINT-STYLE.md)
for design and the handover/checkpoint for completed coverage and outstanding work.
Exclude A4 page files/folios, not the approved designs as adaptation sources.

Focused logic checks: `npm run test:focused -- src/compactPdf.test.ts
src/pdfPlanting.test.ts src/pdfPlugin.test.ts`. Generate affected real book PDFs
via the API in both units; `check:smoke` still validates the A4 source route.

The authorised 6 October collection preparation uses
`scripts/prepare-compact-interior.mjs --kind=vegetable|trouble` (both units by
default; `--only=<record keys>` and `--units=metric|imperial` narrow scope).
It saves each successful PDF under `output/pdf/book-preparation/`, with a
resumable per-file signature, coverage and DOM receipt in
`docs/publication/book-preparation/INTERIOR-CHECKS.json`. Unchanged successful
files are reused only when their signature and PDF hash match. Its unattended
deadline comes from `BOOK-PREPARATION-STATE.json` and belongs to the completed
unattended run; the automation is paused. A later authorised batch must explicitly
account for that guard rather than treating the old schedule as active. Do not run simultaneous
writers against that receipt. `scripts/check-compact-pdfs.py` uses pypdf for
physical page/trim and recursive font checks; `--render` creates disposable
actual-PDF contact sheets under `tmp/pdfs/book-preparation/review/`. Visual
judgements are recorded separately with PDF hashes and explicit reviewed pages.

The working book renderer handles natural variety rows and multi-row Final Tips.
Overflowing overview blocks follow practical advice, preserving the page-two
title/reminder relationship. A terminal gap can reduce by up to 6 px, with at
least 2 px separation, to avoid an orphaned whole block; text size is unchanged.
Troubles measures each complete entry at the real column width, then chooses
ordered page/column breaks together. A memoised search minimises page count
first; the production profile next avoids unnecessary singleton columns,
minimises the largest estimated inter-entry gap required for aligned column
text, then balances spare space. This avoids
repeated 3+2 splits chosen merely to equalise page totals, and avoids a greedy
3+0 or 2+0 final page. There is no entry quota. Some odd splits still have large
gaps when source order and the minimum page count leave no better arrangement.
All entry identities, wording and images remain in order. It then aligns measured final text lines,
allowing for the float's tail. Sparse pages with a single-entry column keep
natural heights and record an explicit alignment exception; their contents are
not padded to force matching lower edges. Footer checks measure visible entries
rather than an invisible trailing margin.
Production final pages also retain natural lower edges when forced inter-entry
spacing would exceed the height of a diagnostic illustration; that exception is
explicit in the receipt. Long repeated full-group crop lists may use an
"All listed crops" label only when the complete membership is printed in a
legend on every page. Partial applicability remains literal. Legend-bearing
continuation headers grow naturally, and a collision check keeps the legend
above Recognise / Act / Prevent. These rules have now been applied and visually checked on all 14 groups in
both units in the coherent production build. Current hash-bound findings,
including retained spacing exceptions, are in `VISUAL-PRODUCTION.json`.
All these changes are confined to the book profile.

The **unapproved production draft** adds `--supplier=kdp|bookvault` to that runner,
with an explicit physical `--start=8` (default: reserve seven opening pages).
Use `--kind=all` to number all 58 guides continuously in each edition. `--only`
is for representative tests: those folios are not a complete collection map.
`production.ts` / `production.css` raise only utility text below 7 pt, check actual
text safe areas, inset the top-right sticker and tilted headings, reset practical
columns independently of A4, and add real artwork bleed. Ordinary web guide
proofs retain their trim profile and local numbering. `workingCopy.ts` contains
exact-source-checked AI draft summaries for individual crops; its keys identify
the current coverage, with results in `BOOK-PREPARATION-STATE.json`. These are
working print drafts, not canonical edits or new approvals. Explicit
duplicate consolidations also verify that the same measurement survives in
Quick facts before removing its repeated planting row. The receipt names each
consolidation; distinct growing advice and canonical source records remain.
In production, Quick Facts also trial long qualifications in the wider column
and short values in the narrower group, measuring each whole article. A move
must save at least one body line, keeps source order within each group, and
never changes text or type size. Ordinary short facts and the approved Kale
arrangement remain stable in the representative both-unit PDF checks.

Production output is separate under `output/pdf/book-preparation/<supplier>/`;
receipts are `PRODUCTION-KDP.json` / `PRODUCTION-BOOKVAULT.json`. The runner stops
at a failed guide because subsequent folios would be unknown. A reused file must
match implementation, source, hash **and physical start page**. Do not run multiple
receipt writers. `normalise-book-pdf.py` preserves vector text while correcting
Chromium rounding to exact MediaBox/TrimBox/BleedBox; it never scales the content.
The runner supplies its stdin from a temporary regular file and bounds the step
to 60 seconds, avoiding a macOS pipe-EOF stall. Scratch input is removed afterwards.
KDP pages are 188.175 × 246.35 mm with mirrored outside bleed; Bookvault pages are
191 × 246 mm with 3 mm all-round bleed. Bookvault alone loads `bookvault.css`:
17 mm inside / 8 mm outside body margins retain the approved 160 mm text width.
The 8 mm outside margin exceeds its template's 5 mm safety. Text checks enforce
17 mm at binding and 5 mm at other trim edges. Earlier 15 mm Bookvault samples
are superseded; current coverage is recorded separately from the KDP build.
The physical checker accepts `--supplier`, checks exact boxes/parity, embedded
fonts, minimum extracted type size and conservative raster-image resolution.
`--render` remains a separate optional actual-PDF review step. Full visual review,
transparency/PDF-standard preflight and assembled-book review remain distinct
from passing these checks.
The checker also inventories transparency resources and stroked paths below
0.75 pt in `submissionPreflight`; these findings are separate from geometry
success. It does not yet validate filled thin shapes or supplier PDF standards.
For physical line-width evidence, `audit-book-strokes.py --supplier=kdp`
also reads ExtGState `/LW` and the full drawing transform. PDFminer's default
`gs` handler ignores `/LW`, so raw zero widths must not be reported as true
hairlines. The audit additionally inventories straight filled rectangles at
least 8 pt long; clipping, other filled art and supplier conformance are outside
its scope. It never edits PDF artwork.
The production Troubles columns are positioned without a z-index so labels paint
above the isolated header blob, while diagnostic `mix-blend-mode:multiply` still
blends with the paper. A z-index creates an isolated blend group and white image
rectangles; preserve the tested non-isolating layering.

After a complete, continuously numbered production export, run
`node scripts/plan-compact-review.mjs`. It verifies all 116 current-signature
hashes and physical start pages, then updates `ASSEMBLY-PLAN.json`. It refuses
mixed or partial builds. The runner's `--facing=vegetable-spreads` proposal starts
every vegetable on a verso so its first two pages face, and records an explicit
blank after an odd-length crop. Troubles continue naturally. The default
`continuous` policy adds no inter-guide blanks. Both use `compact-pagination.mjs`;
`node --test scripts/compact-pagination.test.mjs` covers mixed guide lengths and
invalid inputs. The current 148-page review proposal has four blanks at physical
folios 15, 69, 87 and 91; John has not approved this book-pagination choice.

### Editable book copy

The shared [book-layout folder](../hackriculture-data/book-layout/README.md) owns
book identity, opening copy and the future cover copy. Its native Node validator
and guarded writer are `../hackriculture-data/lib/book-layout.mjs`. AI/app writes
require the loaded book revision and actor; backups use the shared transaction
convention. Gardening revisions and projections are independent.

`scripts/lib/book-content.mjs` reads the JSON, checks image paths and renders
escaped plain text using the existing composition. Contents join stable shared
keys to `ASSEMBLY-PLAN-BOOKVAULT.json`; labels are editable, folios calculated.
Family colours use `src/print/familyThemes.json`. No runtime prose is extracted
from the old HTML. Retained A4 and compact HTML/PDFs are source/approval evidence.

```sh
npm run book:check       # JSON, local images, identities and both-unit references
npm run book:openings    # working pages 1–3, both units; needs start.command
npm run book:entries     # working pages 4–7, both units; needs start.command
npm run book:build       # validate and build both components
npm run test:book-content
```

The two builders accept `--units=imperial|metric|both` (both by default; pass
through npm with `-- --units=imperial`). `scripts/lib/build-book-pages.mjs` uses
the existing Bookvault production finish and overflow checks. Output HTML and
receipts live under `docs/publication/book-layout-working/{opening,entry}/`;
PDFs under `output/pdf/book-layout-working/`. Original CSS remains in the
`vegetable-guru-opening-pages` and `vegetable-guru-entry-pages` folders.
The approved A4/compact files are hash-checked and never overwritten.
`BASE_URL` and `BOOK_PYTHON` override the local server/Python runtime if needed.

After building, run `scripts/check-book-layout-pdfs.py` with the bundled Python
runtime, then inspect its actual PDF renders. It verifies input hashes, copy,
folios, contents references, embedded fonts, page count and Bookvault boxes.
`--compare-migration` is a one-time text/pixel comparison against the preserved
7 October originals; omit it after intentional copy edits. The old
`check-guru-*-pages.py` scripts check those historical source proofs only.

The [migration receipt](docs/publication/book-layout-working/MIGRATION.json)
records the original source hashes and exact check coverage. The initial JSON
retains placeholders and original artwork; it grants no new approval. The rough
progress-preview builder now consumes these working HTML files and refuses stale
copy; it still applies its separately proposed stock allocation. Full-book
reassembly remains a separate requested operation. G2/B5 cover lettering is
baked into rasters: editing `covers.json` does not alter those existing images.

### Retained earlier assembly workflow

`node scripts/prepare-book-openings.mjs` produces two source-linked seven-page
opening drafts from `ASSEMBLY-PLAN.json`; it needs Vite. **This builder currently
reproduces the overnight drafts that John asked to revise.** Adapt it from the
approved contents/how-to sources in the asset registry before presenting a new
book-opening proposal; rerunning unchanged code does not implement that direction.
It deliberately retains
unconfirmed title/imprint/rights/ISBN placeholders. Check with
`check-compact-pdfs.py --openings --render`. Its receipt binds the opening contents
to the exact assembly-plan hash.
Planning, opening export, opening checks and assembly also accept
`--supplier=bookvault`; their receipts use a `-BOOKVAULT` suffix and never
replace KDP files. Bookvault openings use the same 17/8 mm margins; the rotated
title is inset a further 1.5 mm to satisfy binding safety. Default is KDP.
`assemble-compact-review.py` verifies every input hash, physical folio and page
box, joins the openings and guides, and adds only explicitly planned blanks.
Blank content streams must be indirect PDF objects; the saved file is reopened
and every content stream/folio parsed, not just counted in memory.
It shares duplicate PDF objects and reversibly predicts raw image rows before
Flate compression: every changed image stream passes a pixel-byte round trip,
without resampling or colour conversion. It uses the bundled Python runtime
with pypdf and NumPy. Inspect actual assembled PDF samples after optimisation.
The assembly plan and opening contents must be regenerated when guide pagination
changes; the assembler refuses stale input hashes or start-page counts. All
outputs remain local review drafts until outstanding editorial and supplier
preflight issues are resolved; no account upload is implied.

`prepare-flattened-book.py --supplier=kdp|bookvault` prepares separate derivatives
from hash-verified assembly inputs. It calls `flatten-book-pdf.py`, resumes by
source and implementation hashes, and saves a receipt after each PDF. Original
review PDFs remain unchanged. `--only=opening,kale,celery_troubles` restricts a
pilot; `--units=imperial,metric` and `--limit=N` bound a batch. Use bundled Python
with pypdf, pdfplumber, ReportLab, Pillow and NumPy, plus Poppler.
The method composites non-text graphics into opaque RGB artwork at 600 dpi,
losslessly encoded, with native vector text overlaid. It **resamples graphics**;
it is not a pixel-preserving copy of the original illustrations, PDF/X or CMYK.
Before writing, the original inherited text graphics states are checked; any
transparent or clipping text is rejected. Every output page must retain its
text, fonts, colours, glyph positions and boxes, have embedded fonts and no
transparency, and pass a 300 dpi source/output raster-difference alert check.
These numerical checks do not replace actual-PDF visual review or establish
supplier approval. Negative tests rejected transparent and clipping text while
preserving an existing destination. Fine physical icon lines remain unchanged.
`assemble-compact-review.py --supplier=kdp|bookvault --flattened` verifies those
receipts and joins the derivatives into separate `*-flattened-review.pdf` books;
it never replaces the original assemblies. These derivatives skip optional
object deduplication: decoding a 600 dpi full-page RGB image can exceed pypdf's
per-stream size guard, so retain its verified encoded stream without disabling
that guard. The original assembly's lossless optimisation remains unchanged.
`check-flattened-assembly.py --supplier=kdp|bookvault` reopens every assembled
page, checks text/boxes/fonts/transparency against the hashed flattened inputs,
and compares representative assembled rasters, including explicit blank pages.
Assembly raster checks and visual
judgements must bind to these new hashes, not inherit original-PDF sign-off.

`node scripts/prepare-book-covers.mjs` builds two front/back concept pairs using
guide hero artwork. These are the **unselected overnight A/B studies**, not the
original Cover C adaptation. Do not use this builder unchanged for the selected
cover direction. The editable original is
`docs/front-matter/cover-studies/preview-c.html`; preserve that approved A4 source.
John’s latest direction uses it for colour/illustration style only. `scripts/check-book-covers.py` checks exact panel
boxes, fonts and actual raster resolution from PDF placement matrices (rotated
art's bounding box alone understates its resolution), and renders all panels.
Record human/agent raster inspection separately in `COVER-CHECKS.json`. These
are separate panels with 3.175 mm bleed, not cover wraps: no spine is invented
before final pagination and supplier stock/template are confirmed.

The rejected Cover C proposals have a separate historical cover-only builder:
`node scripts/build-compact-cover-c.mjs`. It writes C1/C2 front/back proposals
with 3 mm Bookvault bleed under `output/pdf/cover-c-compact/`, reading the saved
imagegen working derivative and existing compact page-preview images. It does
not export interiors or alter A4. The [review and source notes](docs/publication/cover-c-compact/README.md)
describe the exact provenance, editable CSS, PDF checker and resolution limit.
Do not use it for the new title: it reproduces the rejected Veg Sorted designs
and resets their receipt. The [fresh cover sketches](docs/publication/vegetable-guru-cover-sketches/REVIEW.html)
are saved imagegen concepts; no production builder exists for them yet.

## A4 collection page numbering

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
