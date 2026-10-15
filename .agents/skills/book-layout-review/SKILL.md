---
name: book-layout-review
description: Review simple content pages and their facing spreads for The Vegetable Guru 185 × 240 mm book, including vegetable and Troubles guides, illustrated topics and simple openings. Contents and index pages are outside scope, as are covers, book-wide ordering and full-book assembly. Individual A4 guides use guide-layout-review.
---

# Layout — simple book pages

Use the book's own layout and production profiles. Review the requested pages
both individually and in their actual facing spreads. For standalone A4 sheets,
use the retained [guide-layout-review](../guide-layout-review/SKILL.md) skill.
An explicit request for a rough or single-unit preview controls the level of
work; do not turn it into final production or a both-unit catalogue run.

## Sources and scope

This skill is limited to simple content-page composition and fit: vegetable and
Troubles guides, illustrated topics, and simple opening/how-to pages. A guide may
span several pages; “simple pages” is a scope boundary, not a one-page limit.
**Contents and index pages are outside scope.** Do not apply this skill's content
grouping, heading hierarchy, illustration-retention or page-packing rules to them,
including when they are part of a broader book task. Their current agreed layout
and the book design system govern them directly; PDF checks still apply.

Covers, overall book ordering and full-book assembly also belong to the
[book-design workflow](../vegetable-guru-book-design/SKILL.md), not this skill.
Use physical folios here only to check the requested content pages and spreads.

Read [AGENTS](../../../AGENTS.md), [README](../../../README.md),
[shared-data rules](../../../SHARED-DATA.md) and the
[current handover](../../../docs/handover/START-HERE.md), skipping unchanged
material already read. The handover owns current selections, approval status
and next work; historical automation briefs do not restart completed work.

Use the [book design system](../../../docs/BOOK-DESIGN-SYSTEM.md) for shared colour,
type and geometry, and [Compact Book v1](../../../docs/BOOK-PRINT-STYLE.md) for
detailed guide composition. For book-wide art direction or a new section treatment,
apply [vegetable-guru-book-design](../vegetable-guru-book-design/SKILL.md).
Use [assisted printing](../../../docs/ASSISTED-PRINT.md) for shared review principles,
and [Compact book exports](../../../DEVELOPMENT.md#compact-book-exports) for
renderer, supplier profiles and pagination procedures. Read
[SETUP](../../../SETUP.md) only for runtime/command details as needed.

Inspect the approved source through the [asset registry](../../../docs/assets/README.md)
before adapting it. Keep approved A4 and compact originals intact, using separate
working files. Preserve inherited useful explanations and illustrations even when
the old page size cannot be reused. Record intentional replacements or omissions.
Keep style rules in their owning contracts, not duplicate evolving design specs
inside this skill. Artwork creation/restyling belongs to
[vegetable-guru-artwork](../vegetable-guru-artwork/SKILL.md) when actually requested.

## Choose the right kind of proof

| Output | Geometry and scope |
| --- | --- |
| Individual compact guide proof | 185 × 240 mm trim profile, local numbering, no opening pages; ordinary web/API export |
| Content pages for a supplier working interior | Selected supplier's bleed, trim, binding safety, mirrored margins and physical folios; export only the affected pages |
| Rough content-page preview | Reuse saved PDFs/art where possible; reduced screen images are acceptable when labelled; not a print upload |

The ordinary trim and Bookvault working profiles have different binding margins;
use the [shared geometry table](../../../docs/BOOK-DESIGN-SYSTEM.md#page-geometry-and-spacing).
Read the current contract and supplier evidence before production work; do not
treat a preview's trim box, reduced artwork, blank cover leaves or page total
as print-ready data.

## Review content and composition

Preserve readable type and useful source-linked advice. Full crop guides may use
extra continuation pages; do not shrink main type or cut important information
to force two pages. For a newly commissioned topic summary with an explicit page
limit, use the [topic composition workflow](../vegetable-guru-book-design/references/illustrated-topic-pages.md)
to curate and compose within that limit. Do not silently add pages; raise a concrete
scope/space trade-off if essential content cannot fit. Keep new book copy in
separate source-checked print drafts; canonical
gardening records stay unchanged under the current publication scope. Preserve
methods, qualifying advice, units and diagnostic/safety information. Useful pest
rows are selected before measurement; there is no fixed row quota. Record useful
omissions and justified sparse cases rather than silently changing curation.

For vegetable openings, retain the enlarged decorative hero, visible pale family
circle, top-right opaque difficulty sticker and expressive title with clear
seasons/introduction. Decorative cropping never permits cropped instructional
or diagnostic images. Keep the practical page's Growing & harvesting title,
three-part reminder banner, planting drawings and full-width Final Tips. The
approved Kale specimen is a reference, not a content quota for other crops.

For Troubles, pack complete entries in coherent reading order, with every
applicable condition exactly once. Then align the **first and last text edges**
across columns by adjusting space **between entries**. Preserve natural entry
heights and complete drawings. Do not use equal-height cards or stretch internal
advice. Sparse final pages can retain unequal bottoms when alignment would create
excessive gaps; record the actual exception. A4's naturally staggered-column
rule does not replace this book rule, and six entries is not a universal quota.

For simple opening/how-to pages, retain approved explanations and reference
artwork. Evaluate facing-page balance as well as individual fit. Use current stock
allocations and copy status from the handover; a trial image placement does not
overwrite its approved source. Keep placeholders when requested. This guidance
does not extend to contents, indexes or covers.

## Placement of the requested pages

Confirm physical starting folios before checking mirrored gutters and spreads:
even pages are left/verso, odd pages right/recto. Local proof page numbers cannot
establish placement in a full book. Use actual PDF page counts and the current
assembly plan; never reuse A4 folios or silently assume every crop has two pages.

Preserve the current facing-page/blank-page proposal unless John asks to change
it; do not treat it as approved policy. If an affected guide's page count changes,
report the pagination dependency to the book-design workflow. That does not
bring contents/index design or full-book reassembly into this skill's scope.
A small edit is not permission to rebuild all guides.

## Verify the book output

Work in `src/print/book/` and separate compact output paths. Browser generation
requires `start.command` on loopback; inspect process ownership first. Offline
assembly/checking of saved PDFs does not need a running server.

For ordinary guide proofs, use
`/api/pdf/<vegetable|trouble>/<slug>?paper=185x240&units=<unit>`.
Direct `/print/*` routes and `check:fit` / `check:smoke` are A4 checks and do not
validate book fit. Supplier work uses the production profile and physical folios
described in DEVELOPMENT, not that trim-only API result. Inspect the preparation
checkpoint before running a historical builder; it may contain consumed scope,
old placeholders or a completed deadline guard. Never overwrite frozen pilots.

Measure after fonts/images load, then inspect actual affected PDF pages and
spreads against their sources. Check trim/bleed for the chosen output, binding
safety, header collisions, text edges, footer clearance, complete text/images,
page counts and contents references. Numerical fit is not visual or supplier
approval. For reused body pages, verify source identity, order and content while
keeping visual review proportional; state its exact coverage.

Check both units for wrapping/measurement changes unless John scopes the task
to one edition. Add another crop only for a relevant shared change. Run focused
logic checks for code changes; documentation-only work needs link/consistency
checks. Do not regenerate art or an entire collection to validate a skill edit.

Present the changed proof with concise checks, retained exceptions and pending
decisions. Update the owning handover and technical checkpoint with exact coverage.
Preserve existing approvals and manual locks; never approve new copy/layouts on
John's behalf. A local preview, print-file preflight, supplier acceptance and a
physical proof are separate stages, not implied permissions to publish or order.
