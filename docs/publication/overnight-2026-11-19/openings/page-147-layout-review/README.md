# Page 147 · Four layout proposals

22 November 2026. **John subsequently approved D2 with its restored page number.** Use the [approved single-page D2 proof with folio 147](selected-d2-folio/README.md). His [earlier D selection](DIRECTION-SELECTION.json), the [D1–D4 refinements](d-refinements/README.md) and the four options below remain comparison evidence. No full-book integration is authorised by this design selection.

[Four-page PDF, A–D in order](../../../../../output/pdf/page-147-layout-review/Vegetable-Guru-Page-147-Layout-Options.pdf) · [Labelled comparison](Vegetable-Guru-Page-147-Layout-Comparison.png).

John selected thumbnails **03, 04, 05, 06, 12, 13, 15 and 16** as a pool, with varying selections permitted. His [exact selection and brief](../page-147-thumbnail-review/SELECTION.json) retain only the **Growing Techniques** title from the old text and replace the rest with section mini-contents, including subsection groups.

| Option | Arrangement | Photographs |
| --- | --- | --- |
| A | Large partial checkerboard above three contents columns | 03, 06, 13, 04, 12, 16 |
| B | Continuous grouped list on the left, partial photo grid on the right | 03, 12, 15, 05, 13, 04, 16 |
| C | Six open photo-led groups in two columns | 12, 05, 04, 06, 13, 03 |
| D | Two contents columns above a smaller checkerboard at the foot | 03, 12, 15, 05, 13, 16 |

Each PDF page is exactly **185 × 240 mm**. Option labels appear outside the page designs on the comparison sheet. The designs contain only the retained title and the new mini-contents: the old section badge, brand line, lead, description, lower strapline and folio are deliberately omitted to follow John's request.

The same six established groups appear in every option: Organic growing, Planning a new plot, Compost, Cultivation, Plant care and Greenhouses. The 19 entries cover every current folio from 148 to 171 once. Topic names and page references were checked against the actual Techniques PDF and current page map. Continued topics share a page range. [Editable contents and source links](CONTENTS.json).

The selected photo masters are unchanged. Square layout derivatives use proportional centre crops, avoiding stretching. Local Lilita One and Nunito Sans, warm paper, green text and deep-orange headings follow the book design system. The original page 147 study was inspected as the starting reference.

[PDF/layout checks](LAYOUT-CHECKS.json) · [Exact outputs, source hashes and review record](REVIEW.json) · [Native PDF builder](build-layouts.swift) · [Comparison builder](build-comparison.cjs).

All four final PDF pages were rendered and inspected. The checks confirm the correct trim, extraction of all topic/group titles, absence of superseded copy, readable type at 9.5–10.2 pt for contents entries, and no text/photo collisions or unsafe bounds. This is a local page design study: the original divider, other opening pages, approved artwork proofs and full book are unchanged. Page 164's separate caption-omission decision still awaits its later authorised proof/integration.

To rebuild from the repository root:

```sh
swift -module-cache-path /tmp/vg-swift-cache docs/publication/overnight-2026-11-19/openings/page-147-layout-review/build-layouts.swift
node docs/publication/overnight-2026-11-19/openings/page-147-layout-review/build-comparison.cjs
```

The native PDF builder uses the project's bundled font files and does not require the app server. Final book integration and supplier work remain separate tasks.
