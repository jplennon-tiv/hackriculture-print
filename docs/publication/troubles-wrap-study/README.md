# Troubles image wrapping experiment

30 October 2026. Separate proposal in response to John's question about flowing
text around the content of diagnostic illustrations. No live layout change,
artwork edit, canonical-data change or main-book integration.

This polygon comparison is retained as historical, unapproved evidence. It was
followed by the [separate-mask specimen](../troubles-mask-study/README.md), approved
larger-image settings and the [complete Brassica flow proof](../brassica-flow-preview/README.md),
which now owns continuing work.

[Two-page comparison](../../../output/pdf/troubles-wrap-study/troubles-image-wrap-comparison.pdf):
page 1 current rectangular wrapping, page 2 contour wrapping. Both show the
Brassica opening at physical folio 106. [Detail comparison](comparison-detail.png).

The source is the current compact renderer and unchanged approved diagnostic
artwork, using Bookvault body geometry and production type at the 185 × 240 mm
trim size. The same four entries remain in their original columns. The prior
header refinement is retained. This is a single-page experiment, not a new
pagination or facing-spread proposal.

CSS `shape-outside` can wrap around a polygon or an image's transparency.
It is now supported across the main browsers, not only Chrome.
[MDN property reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/shape-outside)
and [image-shape explanation](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Shapes/From_images).
The four illustrations used on this sample page have opaque backgrounds, so
setting their own image URL as the shape would still yield a rectangle. The
page's existing `mix-blend-mode:multiply` makes white image backgrounds blend
into the tinted paper; that visible effect is not transparency in the PNG.
This trial reads the existing
pixels to propose a conservative left-edge polygon, with a 2 mm gap. Nothing is
cut out or painted over, and internal holes remain excluded from text. Pale
backgrounds can conservatively enlarge the outline. These are reviewed sample
outlines, not a validated automatic conversion for the full collection.

John queried this distinction after the trial. Pixel inspection confirms that
Woody Kohl Rabi is RGB (no alpha channel); White Blister, Pigeons and Leaf Spot
are RGBA with alpha 255 at every pixel. The three earlier, uncleaned originals
retained in Git at `f7b46f8` are RGB too; their file histories start at the
14 September first commit and show no modification before their later removal.
This verifies these particular assets, not every original illustration or any
earlier source outside the retained repository. No artwork was changed during
this investigation. Multiply blending was already documented in the retained
[A4 Troubles contract](../../TROUBLES-PRINT-STYLE.md).

The effect is modest at the existing illustration size, and most useful beside
the tapering leaf and below the pigeon illustration. The outlines use some
spare space while maintaining a readable gap. It would need checking per image
if adopted. Broad automatic rollout is not approved.

Both metric and imperial samples were rendered and checked. This page contains
no unit-dependent measurements, so they render alike. [DOM checks](CHECKS.json)
verify identical wording, loaded fonts/images, four retained entries and aligned
final text edges. [Actual PDF checks](PDF-CHECKS.json) verify one page per variant,
unchanged non-whitespace glyphs and type sizes, all four images, and exact output
trim. Both complete PDF pages and the comparison detail were visually inspected:
no text/drawing collisions or clipping observed. The existing sparse lower page
is retained. No app tests were needed: the live renderer is unchanged.

The scoped source builder is [build-troubles-wrap-study.mjs](../../../scripts/build-troubles-wrap-study.mjs).
It requires `start.command` and saves the before/after HTML, sample PDFs and checks
separately. The final comparison joins its two imperial PDFs, with exact trim and
bookmarks; the PNG detail is rendered from that final PDF. Source artwork hashes
are recorded, and the main-book PDF hash was verified unchanged.
