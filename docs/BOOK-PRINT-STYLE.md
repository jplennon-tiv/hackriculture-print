# Compact gardening book — approved design v1

John approved this design on **5 October 2026**: “Great - fix this design,
we'll use it. Please check and update the layout skill if needed.”

This is the forward design for the **185 × 240 mm, conventionally bound POD
book**, covering vegetables and Troubles. The [approved reference](publication/book-pilot/REVIEW.html)
and [SHA256 approval manifest](publication/book-pilot/DESIGN-APPROVAL.json) identify
the exact metric and imperial proofs, page images, HTML, CSS, copy and assets.
Preserve those reference files; develop future crops and implementation at
separate working/output paths. Design approval is complete. Current collection coverage and production work
are recorded in the [handover](handover/START-HERE.md) and its technical checkpoint;
the frozen approval does not establish approval of the assembled collection.

The installed A4 exports retain their [vegetable](VEGETABLE-PRINT-STYLE.md) and
[Troubles](TROUBLES-PRINT-STYLE.md) contracts. Their header proportions, diagnostic
image sizes and treatment of uneven column endings do not override this book
design. Conversely, do not change live A4 exports as a side effect of book work.

The [book design system](BOOK-DESIGN-SYSTEM.md) owns shared colour, typography,
page geometry and relationships between covers, openings and guides. This
contract owns the detailed vegetable/Troubles composition and fit behaviour.

## Cover and opening-page inheritance

Use the [section treatments and sources](BOOK-DESIGN-SYSTEM.md#section-treatments-and-sources)
for the selected covers and opening-page inheritance. The
[asset registry](assets/README.md) retains exact sources and approvals, including
the approved compact contents/how-to. Preserve those files and the A4 originals;
Cover C is a book colour/style reference, not its required composition. The
handover distinguishes current proposals and preview placements from approvals.

## Page and typography

- Use the [shared geometry](BOOK-DESIGN-SYSTEM.md#page-geometry-and-spacing) and
  [approved type hierarchy](BOOK-DESIGN-SYSTEM.md#approved-guide-and-entry-page-hierarchy),
  selecting the ordinary guide or supplier profile explicitly. Keep the approved
  Family Tint roles, coloured fact/tip icons, calendar and 1–5 needs scales.
- Preserve the approved main-body size; do not shrink it to force a page count.
- Kale demonstrates two pages. Other crops may use **three or four pages** to
  retain useful information. Counts of varieties, facts or conditions are not quotas.

Exact specimen proportions are in the frozen
[pilot.css](publication/book-pilot/pilot.css). Measure longer titles, different
season combinations and structurally different crops when adapting the design;
the Kale offsets are reference geometry, not universal crop-specific branches.

## Vegetable opening page

Keep the expressive header: large tilted crop title, category above it, seasons
and symbols towards the shaded circle, and an enlarged decorative hero on the right. Its
**pale family-coloured circle must remain visible around the artwork**. Put the
**opaque oval difficulty sticker at top right, over the hero**, retaining the
label, rating, five dots and numeric score. The sticker fill matches the page's
paper colour. Preserve readable text and separation
from the introduction. Cropping the decorative hero is intentional; do not
confuse that with permission to crop instructional or diagnostic drawings.

John approved the [larger category-name treatment](publication/category-navigation-preview/APPROVAL.json)
on 30 October: 10 pt bold Nunito Sans 900, uppercase, in the existing family deep
colour on both pages. First-page names replace the previous small category label;
the practical-page heading moves slightly down while retaining its wording and
size. The approved Carrot and Kale examples preserve their entire guide bodies.
All 88 guide labels are integrated in the current main book. Existing practical-title sizes, including smaller long-title sizes, are retained. Keep the frozen examples as references. The how-to colour-key proposal was explicitly rejected.

John approved the [revised header treatment](publication/vegetable-header-review/APPROVAL.json)
on 15 October 2026. Normally the visible seasons widget ends 20 CSS px before
the circle's left edge. If the actual title text (including its full stop)
would crowd it, move the widget right to leave 20 px after the title. Retain
left-aligned widget text, existing type sizes and badge geometry. The four
approved examples cover different title lengths and family colours. This
supersedes the original centred seasons and family-tint sticker fill; frozen
originals remain intact. All 44 headers are integrated into the complete preview;
normal individual-guide exporter integration is pending.

Kale's reference uses a 124 CSS px header, the crop-title type role tilted −4°, a 300 px
circular backdrop, 16° hero tilt, and a 138 × 49 px difficulty oval tilted −3°.
Keep the image's visual prominence when adapting other crops; do not reduce it
to a small thumbnail or crowd all metadata against the left edge.

Below: full introduction; compact illustrated Quick Facts with short values
grouped beside longer qualifications; calendar beside Core Needs; ranked
varieties and Key Risks. Retain the approved information richness.

John approved the [Globe Artichoke Quick facts refinement](publication/sowing-rollout/revisions/artichoke_globe/APPROVAL.json)
on 5 November and requests the same attention as each vegetable is reviewed.
Rebalance short facts and longer qualifications, adjusting column widths and
placement for comfortable wrapping while retaining the facts, icons and type size.
This is a crop-by-crop refinement, not a fixed layout to impose across the set.

## Vegetable continuation

The frozen reference uses **Growing & harvesting** and the three-part reminder
banner. John’s 15 October navigation correction replaces the practical-page title
in the current whole-book review with **Growing guide · <crop>**, as one Lilita
heading block. Fit the whole heading for longer names; preserve body type and
the reminder banner. “See also” references must name the crop on every destination
page; omit the line where none qualify. John approved this treatment on 15 October;
the original guide proofs and ordinary exporter are unchanged. Omit the redundant
“crop / Growing Guide” line. Keep two practical-advice columns, illustrated
planting instructions, the useful pest table and **full-width Final Tips**.
Use the practical-title and section-heading roles in the shared type hierarchy.
Allow clear space between the category, practical title and reminder banner.
For a crowded vegetable spread, prune unnecessary text and adjust the advice
and table column widths first, with the title and “See also” footer in place.
Only if the full ranked Pests & diseases table still fails to fit may the bottom
entry be removed. Remeasure after each removal and stop once both editions fit.
Keep the rest in order and record the omissions for that crop.

The displayed Kale summaries and measurement consolidations are part of the
approved specimen. [Source-matched copy](publication/book-pilot/page-two-copy.mjs)
and CHECKS.json record the changes; the full canonical record was not edited.
For later crops, preserve timings, unit pairs, conditional advice and safety
details when shortening prose. Repeated measurements can appear once only when
their complete meaning remains clearly available. Preserve source-linked
companions, attribution and exact-byte backups for any future shared data writes.

Pests & diseases table labels and Key risks headings use sentence case, retaining proper names and
scientific genera (for example, Colorado beetle and Grey mould (Botrytis)). This
applies to source vegetable labels and shared-Troubles fallback labels alike;
use `troubleLabel` at display boundaries. It changes neither condition IDs nor
advice. [Source and table correction](publication/pest-title-case/README.md) and
[Key risks correction](publication/key-risk-title-case/README.md), requested on 3 November.

## Troubles

Use two open columns, fine separating rules, compact crop labels, condition
headings and Recognise / Act / Prevent advice. Natural entry heights and text
wrapping beside illustrations provide density; no padded equal-height cards.
Use the condition-heading and guide-advice roles in the shared type hierarchy;
the Troubles reference retains 11.25 pt advice leading.
John's 30 October refinement removes the repeated “Recognise → Act → Prevent”
line from each book page header, explaining the sequence on the section opener.
The small inline advice labels remain. The initial header-only proof retained body positions; the later natural-flow
proof reclaims the unused lower header space. A4 and frozen references stay unchanged. See the
[focused section proof and checks](publication/troubles-header-refinement/README.md).
John's approved 31 October treatment uses separate wrapping masks, a 4 mm
`shape-margin` and diagnostic boxes of **135 × 157.5 CSS px** (about 36 × 42 mm),
25% larger in each dimension than the retained 108 × 126 px references. Preserve
aspect ratio, complete drawings and original image files. The
[scoped approval](publication/troubles-image-size-study/APPROVAL.json) binds the
Brassica specimen. The [complete rollout](publication/troubles-rollout/README.md)
applies this treatment to all 14 guides. A4 retains its original image geometry
and wrapping; the approved source stars add its ordinary heading glyphs.

Order by **importance rank, highest first**, without alphabetical tie-breaking.
Use measured fit adjustments within **one page** of a strict-importance control;
keep that control fixed while exploring moves. Retain existing order within ties
unless fit or feature separation warrants a move. Record every page move and rank
reversal. The accepted Brassica result has no rank reversals. Every condition stays
whole and appears once. Column breaks may change to separate featured panels.

Exactly **24 identities** are [approved](publication/troubles-rollout/SELECTION-APPROVAL.json),
including the two Brassica stars; potato slugs are excluded from highlighting,
not from the book. Stars are an editorial choice, not a rank threshold. Use pale
panels with no outline and a small top-right ribbon: **Common Pest** for pests,
**Common Disease** for infections, **Common Problem** for growing/physiological
problems. Classification is explicit in `src/print/book/troubleFeatures.json`;
never infer it from heading keywords or silently default an unclassified new star
to Pest. Keep separate tuber/fruit blight diagnoses complete and ordinary.
Featured entries must not be consecutive, directly opposite in neighbouring
columns, or overlapping beside the facing gutter. Sharing a page is allowed.

The trailing-space policy replaces guide-wide spreading. Keep natural 8 px gaps,
7 px ordinary entry top padding and 14 px below the opening header, reclaiming the
obsolete navigation reserve. Fill earlier pages with complete entries; the final
page divides its entries naturally between columns with space below. Do not stretch
advice, drawings or gaps to align bottom edges. Unequal lower edges are expected.

Whole entries and feature separation can leave earlier-page space. Verify and
record why the following entry cannot occupy it. The fit search normally allows
reversal of adjacent rank values; if separation fails, adds an extra page or leaves
an earlier column less than half full, it may test a two-point gap, retaining the
same one-page movement bound. Carrot/Parsnip uses this to avoid an extra page;
Lettuce and Oriental Leaves use it to fill earlier columns; Tomato uses it to
separate three rank-10 stars. This search detail is
not an alteration to canonical ranks or a relaxation of John's page limit.
Additional pages are preferable to clipping, shrinking or discarding advice.
The new treatment is the default for ordinary compact exports as well as the
book-profile proof. Frozen specimens and A4 originals remain intact.

The approved Carrot/Parsnip page contains the first six of fifteen conditions;
all six preserve their complete source wording and drawings. Six per page is a
demonstrated result, not a universal target. A complete guide must include every
applicable condition exactly once, in a coherent reading order.

## Verification and implementation boundary

Both approved PDFs have three physical pages: two Kale pages and one Troubles
sample. Previous checks establish loaded/embedded fonts, complete images and
selection coverage, no measured overflow, and footer gaps of 3.46 / 9.80 / 5.63 mm.
Troubles first/last text edges match in both units. The actual MediaBoxes are
184.83 × 239.86 mm from Chromium rounding. These frozen specimen boxes are not
supplier geometry; the separate working production profiles below supply exact
trim and bleed. Current file/preflight status is in the handover.

For new book work, measure the book format itself, export the affected pages,
and visually inspect actual PDFs. Check both units when wrapping/units change;
add another crop only when the shared change warrants it. A4 `check:fit` or
`check:smoke` is not evidence of compact-book fit. Measure content-to-footer
clearance against the shared geometry rule and relevant supplier profile.

The reference builder and raster checker are frozen against overwriting this
approval. They document the experiment; they are not a live book-export service.
The web generator now offers **185 × 240 mm by default**, retaining A4/A5/A6.
Its maintained implementation is `src/print/book/`: isolated DOM reflow and CSS,
plus exact-source-matched approved Kale summaries. `pdfPlugin.ts` invokes it for
`paper=185x240`; direct `/print/*` source routes stay A4. The new preference key
`gg-paper-book-v1` starts this edition at the book default and persists subsequent
choices. Troubles preview/save now follow both selected size and units.

Single-guide endpoints are `/api/pdf/vegetable/<slug>?paper=185x240&units=imperial`
and `/api/pdf/trouble/<key>?paper=185x240&units=metric`. Compact batch produces
**guide proofs only**, in `output/book-185x240/<units>/`. It excludes the A4
opening pages, reports measured PDF page counts, uses local proof numbers and
marks the collection manifest `complete:false` until final book assembly exists.
Compact opening-page drafts and complete book assemblies are separately
authorised work. They use the approved A4 designs as sources for adaptation;
the ordinary guide-only batch does not include them. See the handover for the
current revision and approval status.

The adapter moves whole overflowing overview blocks after the practical advice,
keeping the page-two title/reminder relationship, and adds continuation pages
for further blocks. It preserves full selected content and
fails with an actionable error if a whole block cannot fit; no silent clipping
or shrinking body type. Long titles are fitted in the left title area. This is a
working export profile. Its initial representative generator checks are recorded
in [BOOK-GENERATOR-CHECKS.json](publication/BOOK-GENERATOR-CHECKS.json); these are
dated evidence, not the limit of subsequent collection preparation. The
[current handover](handover/START-HERE.md) identifies the prepared full collection,
source/derivative review coverage and outstanding decisions. Follow its next
steps rather than repeating the pilot. The old A4 map is never a compact-book
page-count or contents authority.

### Working production adaptation — 6 October, not a new approval

The separate supplier profile in `production.ts` / `production.css` keeps the
body sizes and artwork, raises sub-7-pt utility labels, moves informative header
text inside print/binding safety, and adds real bleed. It uses physical folios
and mirrored page margins; the normal web proof profile remains trim-sized.
The badge stays top right over the enlarged hero and visible circle. A tilted
title is positioned from its measured text bounds so long names stay safe too.
Troubles uses a 1 px reduction in section spacing to accommodate larger
production labels. Its current flow policy is owned by [Troubles](#troubles) above;
the earlier first/last-edge balancing is retained only by the explicit legacy
comparison path and frozen references. The complete Troubles rollout is now the
normal compact export. Exact-source
crop summaries are separate AI drafts for John's review, not amendments to the
approved source or frozen specimens. Measured Quick Facts grouping can move a
long qualification into the wider column when it saves a full body line,
preserving all wording. Repeated
complete crop lists can use a full-membership legend on every page; partial
applicability remains explicit. These are working adaptations with per-file
evidence, not changes to the frozen approval or a collection-wide approval.
Read the [preparation state](publication/BOOK-PREPARATION-STATE.json) for exact
coverage; production geometry does not establish full visual or supplier approval.

Bookvault's working adaptation uses the distinct binding allocation and safety
checks recorded in the shared geometry table, retaining body width and full
type/art sizes. This lives in `bookvault.css` and applies only to that supplier's
working output. Ordinary trim and saved KDP proofs retain their existing margins.
