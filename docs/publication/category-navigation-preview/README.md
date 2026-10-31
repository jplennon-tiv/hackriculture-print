# Category names approved; how-to key rejected

30 October 2026. John approved the larger category names on both guide pages
and rejected the how-to colour key as clutter. The [scoped approval](APPROVAL.json)
covers PDF pages 2–5 only. Page 1 is retained as rejected evidence and must not be
integrated. Guide-wide application is pending. The main book is unchanged.

[Review the pages](REVIEW.html) · [Five-page PDF](../../../output/pdf/category-navigation-preview/category-navigation-preview.pdf)

The proposal contains the how-to page at folio 9, Carrot at 36–37 and Kale at
58–59. Existing family colours are read directly from
[familyThemes.json](../../../src/print/familyThemes.json). Category names are
10 pt bold Nunito Sans, uppercase, in each family's deep colour, repeated at the
top of both pages. The practical-page title moves down slightly to accommodate
the category name; its wording and size are retained.

The how-to adds all eight colour swatches and their existing category names.
Its decorative title reduces from 48 to 34.5 pt and its H4 illustration from
63 × 44 mm to 51 × 33 mm. This creates room above the peach panel without reducing
the 10.5 pt explanatory copy, native calendar/rating/needs examples or instructional
illustrations. No advice is cut or rewritten.

Sources are the current alphabetical main PDF and the clean approved reader-edit
how-to HTML, which retains the combined-opening composition and final calendar
wording. All frozen sources and the main book remain byte-for-byte unchanged.
The guide examples reuse their native saved pages; only category text and the
practical heading are replaced. No gardening or book-copy JSON changed.

[CHECKS.json](CHECKS.json) records source hashes, all ten how-to images loaded,
all eight category labels, unchanged paragraphs and widgets, unchanged guide
body glyphs/sizes/positions/colours, retained guide image counts and exact PDF
text preservation. All five pages have 185 × 240 mm trim. The how-to panel clears
its footer by 5.93 mm; the category labels start 5.08 mm below the trim edge.
[Visual review](VISUAL-REVIEW.json) records the inspected actual PDF pages.

Scope: saved imperial Carrot/Kale examples with a unit-neutral opening and label
treatment. This is not a full catalogue fit test, a metric assembly or a supplier
file. No full-book pagination, contents, index or production file was rebuilt.

To revise, with loopback Vite running through `start.command`, run
`node scripts/build-category-navigation-preview.mjs`, followed by
`scripts/review-category-navigation-preview.py` with the bundled PDF Python.
The editable proposal stylesheet and generated opening/label HTML stay here.
The two focused scripts leave approved styles and runtime guide renderers intact.
