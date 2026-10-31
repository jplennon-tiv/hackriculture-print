# Brassica: larger diagnostic illustrations

31 October 2026. John selected the 4 mm wrapping gap and requested an image-size
trial at approximately 25% larger, allowing judgement on what fits best.
John subsequently approved these proportions for all book Troubles pages:
[scoped approval](APPROVAL.json). The approved treatment is demonstrated on folio
106. The [complete Brassica proof](../brassica-flow-preview/README.md) now combines
these settings with natural book flow and trailing final-page space. Other guides
and main-book integration remain pending.

[Two-page comparison PDF](../../../output/pdf/troubles-image-size-study/brassica-larger-images-comparison.pdf):
previous illustration size first, 25% larger second. Both use the selected 4 mm
gap and the same transparent wrapping masks. [Detail comparison](comparison-detail.png)
and [complete larger-image page](proof-2.png).

The full 25% enlargement fits well on this sample and is the approved proportion.
Illustration boxes increase from 108 × 126 to **135 × 157.5 CSS px**, approximately
35.7 × 41.7 mm. Width and height each increase by 25%; aspect ratio, complete
drawings and source PNGs are preserved. The existing SVG masks scale with the
illustrations, while `shape-margin` stays at 4 mm. No new art is generated.

Advice remains at its existing size and leading. All four complete entries stay
in their existing columns; only the space between entries is adjusted to align
the final text edges. The larger details are easier to inspect, with useful line
lengths beside the drawings and comfortable space above the footer. No smaller
trial was needed after the 25% version passed visual review.

[DOM checks](CHECKS.json) cover imperial and metric, retaining all wording and
image sources, confirming the exact 1.25 scale and unchanged 4 mm gap. Both have
57.45 mm footer clearance and matching final text edges. [Actual PDF checks](PDF-CHECKS.json)
verify one page per variant, identical non-whitespace glyphs and type sizes, and
identical decoded bytes for all four embedded diagnostic images. The two-page
comparison keeps exact 185 × 240 mm trim. The page contains no unit-dependent
measurements, so the editions render alike.

Visual review covered the full revised PDF page, comparison detail and
[106–107 spread context](trial-spread-106-107.jpg). The right-hand folio 107 is the
unchanged saved header-refinement render, included only to assess balance. No
clipped advice, image collisions or cropped diagnostic drawings were observed.
The page retains its existing spare lower area. The prior 4 mm proof, masks,
live renderer, compact CSS and main-book PDF remain unchanged. No canonical
data or book-wide pagination changes were made.

Sources are the [4 mm mask-study HTML and evidence](../troubles-mask-study/README.md).
The original [builder](../../../scripts/build-troubles-image-size-study.mjs) and
[PDF checker](../../../scripts/review-troubles-image-size-study.py) document this
frozen specimen and now refuse to overwrite it. Continue in the separate
[full-guide workflow](../brassica-flow-preview/README.md). The inter-entry alignment
shown here is historical specimen geometry, superseded for new book flow by the
[current guide contract](../../BOOK-PRINT-STYLE.md#troubles). Approval of the image
settings stands; it does not approve subsequent full-guide compositions.
