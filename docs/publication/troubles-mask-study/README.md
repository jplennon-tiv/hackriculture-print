# Brassica: separate wrapping masks

31 October 2026. Separate working proof, not installed in the live book.
John selected this revision's 4 mm `shape-margin`, increased from 2 mm, and
requested a [25% larger-image comparison](../troubles-image-size-study/README.md).
John has approved the larger-image treatment. This previous-size baseline stays
frozen; the [full Brassica proof](../brassica-flow-preview/README.md) now tests complete-guide flow.

[Comparison PDF](../../../output/pdf/troubles-mask-study/brassica-mask-comparison.pdf)
contains two versions of physical folio 106: current rectangular wrapping first,
separate-mask wrapping with the 4 mm gap second. [Enlarged comparison](comparison-detail.png).
The complete pages are [current](proof-1.png) and [trial](proof-2.png).

Four transparent SVG silhouettes are used only as `shape-outside` images. They
do not appear in the printed page. The visible PNGs, their size, aspect ratio and
multiply blending are retained. Each mask follows the outer extent of the drawing
in short horizontal bands and fills internal gaps so text cannot enter holes in
leaves or the plant. A 4 mm shape margin gives breathing space; alpha threshold is
0.5. Outer float margins are enlarged only where needed to avoid clipping this
gap at the text-facing, top and bottom edges. Tiny disconnected marks and small
edge flecks are ignored in the mask only.
This is layout geometry, not a regenerated or altered diagnostic illustration.

The masks account for the original images' contained fit within their
108 × 126 CSS px boxes, including the blank strips above and below a square image.
They use the content-box coordinates required for image-based shapes, rather than
the default margin-box coordinates of the earlier polygon trial.
[CSS Shapes specification](https://www.w3.org/TR/css-shapes/#shapes-from-image).
The [pink overlay review](mask-alignment-review.png) shows how the separate masks
cover the artwork. Pink is diagnostic review markup only and is absent from the PDF.

The source is the previous experiment's saved rectangular baseline for each unit
edition, preserving its four entries, order, copy, type, header refinement and
Bookvault body geometry. The previous polygon experiment is intact. Inter-entry
spacing is rebalanced after the wrap; internal advice is not stretched. The first
and last text edges align, and the same sparse lower part of this opening remains.
The wider gap gives the drawings more breathing space while retaining contour
wrapping above the pigeon and beside the leaves. All four entries still fit on
one page at the original type and illustration sizes.

Checks cover both metric and imperial at actual 185 × 240 mm trim. This particular
page has no unit-dependent measurements, so both editions render alike.
[DOM checks](CHECKS.json) confirm identical wording, loaded fonts/images, unchanged
displayed-image settings, aligned final text edges and 69.75 mm footer clearance.
[PDF checks](PDF-CHECKS.json) compare all non-whitespace glyphs with their type sizes
and the decoded image bytes: all four embedded drawings are identical between
versions. The final comparison has two physical pages and bookmarks identifying
each version. Main-book PDF, live renderer, CSS and original artwork hashes are
verified unchanged; no canonical-data writes or app-wide changes were made.

Visual review covered both complete final PDF pages, the enlarged comparison and
all four masks overlaid on their sources. No text/drawing collisions, lost text or
clipped drawings were observed. The [actual 106–107 spread context](trial-spread-106-107.jpg)
uses the unchanged saved folio 107 from the quieter-header proof; only folio 106
is proposed here. No catalogue export or overall pagination change was made.

The original [builder](../../../scripts/build-troubles-mask-study.mjs) and
[PDF checker](../../../scripts/review-troubles-mask-study.py) are retained as
historical method evidence and now refuse to overwrite the approved specimen.
Use the [full-guide workflow](../brassica-flow-preview/README.md) for continuing
work. Checks at this specimen stage were limited to its PDF, scripts and links;
it did not change the live app. Its old aligned-column spacing describes this
frozen comparison only, not the current book pagination rule.
