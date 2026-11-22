# Page 99 · Vegetable Troubles layout variations

22 November 2026. Four standalone proposals using John's selected pictures **01, 05, 06, 09, 10, 13, 15 and 16** and the [approved page-147 format](../page-147-layout-review/selected-d2-folio/APPROVAL.json). [Exact thumbnail selection](../page-99-thumbnail-review/SELECTION.json). **John approved option D**: “D is a nice variation - let's use it.” The [approval record](APPROVAL.json) binds PDF page 4 and its exact render. A–C remain comparison evidence; full-book integration is separate.

[Four-page PDF, A–D in order](../../../../../output/pdf/page-99-layout-review/Vegetable-Guru-Page-99-Layout-Options.pdf) · [Open full-size pages](https://chatgpt.com/library?file_id=libfile_fde3_f-73c2d95a63948191942fc2d3c54d2126_968f6e806ba48191b80ffb1b7a35f663&account_id=personal) · [Labelled comparison](Vegetable-Guru-Page-99-Layout-Comparison.png).

| Option | Arrangement |
| --- | --- |
| A | Two contents columns and a scattered lower checkerboard; closest to page 147. |
| B | One continuous list with pictures staggered down the right. |
| C | Two contents columns between upper and lower picture groups. |
| D | Two columns starting at different heights, with pictures in the open corners. |

Every page uses the same title, **all fourteen existing crop groups**, their complete destinations covering **100–146**, and folio **99**. The repeated word “Troubles” is omitted from each list heading beneath the section title; other group wording is unchanged. The established crop groups use the approved 16 pt orange Lilita heading role, with 10 pt green Nunito Sans page references. No new subsection grouping or gardening copy is introduced. All eight selected pictures appear once on each page at **29 mm square**, with proportional crops and unchanged source files. The upper pair and 45 pt two-line title remain fixed across the four alternatives. Folio 99 uses the approved 7.35 pt, weight-900 footer role.

The earlier divider's section badge, brand line, strapline, description, guide-count sentence and left footer label are intentionally omitted at John's request. The previous divider study and approved page 147 remain intact. These are local design proofs; no shared book-layout record, full-book PDF or supplier file was changed.

[Contents and exact source destinations](CONTENTS.json) · [Positions and dimensions](VARIANTS.json) · [Measured PDF checks](LAYOUT-CHECKS.json) · [Source/output hashes](REVIEW.json) · [Delivery record](DELIVERY.json).

All four final PDF pages were rendered and visually inspected, including the final labelled comparison. Checks confirm 185 × 240 mm trim, extraction of every group name and page range, the title and folio on every page, eight selected pictures per page, no text/photo overlap or unsafe bounds, and unchanged source-photo and page-map hashes. The native PDF generator reuses bundled Lilita One and Nunito Sans. This is a mini-contents layout without unit-dependent advice, so a second unit edition would be identical.

Rebuild only these proofs from the repository root:

```sh
swift -module-cache-path /tmp/vg-swift-cache docs/publication/overnight-2026-11-19/openings/page-99-layout-review/build-layouts.swift
node docs/publication/overnight-2026-11-19/openings/page-99-layout-review/build-comparison.cjs
```
