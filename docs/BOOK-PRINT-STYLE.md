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
and symbols in the centre, and an enlarged decorative hero on the right. Its
**pale family-coloured circle must remain visible around the artwork**. Put the
**opaque oval difficulty sticker at top right, over the hero**, retaining the
label, rating, five dots and numeric score. Preserve readable text and separation
from the introduction. Cropping the decorative hero is intentional; do not
confuse that with permission to crop instructional or diagnostic drawings.

Kale's reference uses a 124 CSS px header, the crop-title type role tilted −4°, a 300 px
circular backdrop, 16° hero tilt, and a 138 × 49 px difficulty oval tilted −3°.
Keep the image's visual prominence when adapting other crops; do not reduce it
to a small thumbnail or crowd all metadata against the left edge.

Below: full introduction; compact illustrated Quick Facts with short values
grouped beside longer qualifications; calendar beside Core Needs; ranked
varieties and Key Risks. Retain the approved information richness.

## Vegetable continuation

Retain the clear **Growing & harvesting** title and three-part reminder banner.
Omit the redundant “crop / Growing Guide” line. Use two practical-advice columns,
illustrated planting instructions, the useful pest table and **full-width Final
Tips**. Use the practical-title and section-heading roles in the shared type hierarchy.

The displayed Kale summaries and measurement consolidations are part of the
approved specimen. [Source-matched copy](publication/book-pilot/page-two-copy.mjs)
and CHECKS.json record the changes; the full canonical record was not edited.
For later crops, preserve timings, unit pairs, conditional advice and safety
details when shortening prose. Repeated measurements can appear once only when
their complete meaning remains clearly available. Preserve source-linked
companions, attribution and exact-byte backups for any future shared data writes.

## Troubles

Use two open columns, fine separating rules, compact crop labels, condition
headings and Recognise / Act / Prevent advice. Natural entry heights and text
wrapping beside illustrations provide density; no padded equal-height cards.
Use the condition-heading and guide-advice roles in the shared type hierarchy;
the Troubles reference retains 11.25 pt advice leading.
Diagnostic image boxes are 108 × 126 CSS px (about 29 × 33 mm), preserving aspect
ratio and the complete drawing. Check diagnostic clarity; allow a larger drawing
or another page for entries whose detail requires it.

Pack complete entries first. Then **align the top text of the first entries and
the bottom text of the last entries across the columns**, distributing spare
height **between entries** in the shorter column. Preserve natural spacing inside
entries; do not stretch text, illustrations or card heights. Check actual text
edges rather than assuming equal container heights imply aligned text. Sparse
end pages that cannot meet both edges without excessive gaps need a layout
judgement, not filler or missing advice.

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
Troubles keeps its natural entries and aligned first/last text; a 1 px reduction
in section spacing accommodates the larger production labels. Exact-source
crop summaries are separate AI drafts for John's review, not amendments to the
approved source or frozen specimens. Measured Quick Facts grouping can move a
long qualification into the wider column when it saves a full body line,
preserving all wording. Production Troubles planning reduces avoidable
single-entry columns and forced gaps; sparse final pages can retain unequal
lower edges instead of a gap taller than a diagnostic illustration. Repeated
complete crop lists can use a full-membership legend on every page; partial
applicability remains explicit. These are working adaptations with per-file
evidence, not changes to the frozen approval or a collection-wide approval.
Read the [preparation state](publication/BOOK-PREPARATION-STATE.json) for exact
coverage; production geometry does not establish full visual or supplier approval.

Bookvault's working adaptation uses the distinct binding allocation and safety
checks recorded in the shared geometry table, retaining body width and full
type/art sizes. This lives in `bookvault.css` and applies only to that supplier's
working output. Ordinary trim and saved KDP proofs retain their existing margins.
