# Netting and supports — section review

**Current, 30 October:** Both two-page sections are approved and integrated in
[the main book](../../whole-book-order-preview/REVIEW.html#spread=81): Netting at
160–161 and Supports at 162–163. Their [Netting](netting/APPROVAL.json) and
[Supports](supports/APPROVAL.json) approvals preserve exact accepted sources.
The [section viewer](REVIEW.html) shows both approved spreads. The integration
updates contents, folios, index and crop links, while the ordered 168-page
production files remain preserved as the accepted physical-proof baseline.

The remainder records the initial 28 October draft and its retained sources.
Both original pages are superseded by the separate revisions above.

The [original two-page PDF](../../../../output/pdf/topic-pages/plant-protection-supports-draft.pdf)
retains the initial spread, including Supports on its second page.
The [editable copy](../../../../../hackriculture-resources/summaries/plant-protection-supports/copy.json),
[outline](../../../../../hackriculture-resources/summaries/plant-protection-supports/outline.txt)
and [research record](../../../../../hackriculture-resources/summaries/plant-protection-supports/research-notes.md)
live in the resource library. Copy follows canonical advice, John's relevant
demonstrations, and focused online gap checks using Gardening Research and Write
Like John. No canonical gardening records or approved pages changed.

The original proposal placed Netting and Supports at **160–161**, before Watering.
The approved expansion now uses Netting 160–161 and Supports 162–163 in the
172-page current screen interior. The ordered 168-page production interior and
cover remain unchanged.

## Composition and sources

The current [Watering/Greenhouses spread](../../techniques-subsections/imperial-spread-160-161.jpg)
and the [frozen Watering source](../techniques-expansion/references/watering-approved-2026-10-12/)
provide the immediate design reference. Retained: 185 × 240 mm trim, cream paper,
green/orange flowing title, Lilita display type, Nunito body, mirrored 17 mm inner
and 8 mm outer margins, established footer and short source note. Body is 12.6 CSS
px (9.45 pt) and lead 13.5 px; neither was reduced to make the pages fit.

Netting uses a main closed-cover drawing, paired bottle/height inset, three
covering comparisons, and fitting/checking advice. Supports places each method
beside its own drawing. Five separate PNGs, exact prompts, approved style inputs
and source origins are retained in [ARTWORK.json](ARTWORK.json). Images were
created with built-in image generation and copied unchanged; CSS contains them
without cropping. New art is proposed, not registered as approved stock.

The smooth bottle and height details share one inset. No separate open-cover
diagram was added; text explains access and closing it again. Broad-bean strings,
hoops and wigwams remain text alternatives. The discarded October 9 support trial
was not reused. More complex constructions remain outside this two-page brief.

## Checks actually completed

- Actual PDF: two pages, exact 185 × 240 mm trim, complete extractable body copy,
  embedded Lilita and embedded Nunito glyph programs. Chromium's fractional
  trim rounding was normalised during finishing.
- All five artwork files and both fonts loaded. No page errors or horizontal
  unsafe blocks. Content ends at 218.81 and 217.69 mm; source gaps 3.31 and
  4.43 mm; source-to-footer clearance 3.56 mm. [Measured record](CHECKS.json).
- Both page renders were read at enlarged size; the final facing spread was
  inspected for balance, reading order, captions, clear gutter, footer clearance,
  edge transparency and instructional structures. Compared with the approved
  Watering derivative: same heading/body hierarchy and colours; this new spread
  is more densely illustrated. No visible overlaps or clipped copy remain.
- Netting shows bottle bases beneath continuous mesh and weighted edges. Bean
  ridge/opposed braces, pea side/end bracing, and cage anchoring remain visible.
  Source video frames confirm the main construction principles. The paired inset
  is a schematic height comparison rather than a second whole enclosure.
- The copy contains no measurements or unit-dependent wrapping; one unit-neutral
  proof covers these two pages. No full-book export, adjacent-page regeneration,
  application test suite, supplier preflight, CMYK conversion or physical print
  check was performed for this isolated review draft.

First render crowded the footer. The revision reduced artwork-box heights and
surplus section gaps and shortened one comparison heading; body advice and body
type were retained. The final PDF and renders supersede that intermediate proof.

## Rebuild this draft

Start the local print app through `start.command` on loopback, following SETUP.
Run `build.mjs` with Node from the project, then `finish-proof.py` with the bundled
PDF Python (Pillow and pypdf). Poppler's `pdftoppm` must be available. The first
step reads the resource-library copy and checks browser geometry; the second
normalises trim, checks PDF content/fonts, and regenerates the page/spread PNGs.
The review viewer itself is static and does not need the app server.
