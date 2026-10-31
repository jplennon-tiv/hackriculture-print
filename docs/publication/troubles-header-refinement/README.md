# Quieter Troubles headers

30 October 2026. John requested removal of the repeated “Recognise → Act → Prevent”
page headers, keeping the idea and explaining it on the section opener.

[Section PDF, folios 99–144](../../../output/pdf/troubles-header-refinement/troubles-revised.pdf)
· [Opener](folio-99.png) · [Bean and Pea spread](bean-and-pea-spread.jpg)
· [Brassica spread](brassica-spread.jpg)

The arrowed page-level line is removed from all 45 guide pages. The small labels
within each problem's advice remain; this interpretation was stated to John
before editing. Advice, illustrations, titles, folios and body positions are
preserved. Existing sparse-page spacing remains as in the saved book.

The opener retains its title, strapline and three illustrations. Its proposed
explanation is: “Recognise the signs, act to limit the damage, then use the
prevention advice to help stop the problem returning.” The new copy remains for
review and is separate from shared book-layout JSON. The complete main book is
unchanged; this section proof is ready for the next integration after review.

Sources are the current alphabetical main PDF and saved
[section opener HTML](../whole-book-order-preview/section-openers.html), using its
existing styles/artwork. [CHECKS.json](CHECKS.json) binds the sources and output.
The repeated text is removed from native PDF text objects, not covered by boxes;
every other glyph's text, position, size and colour is compared exactly, and
every diagnostic image placement is retained. The 46-page PDF keeps 185 × 240 mm
trim and folios 99–144. Opener text fit has 4.94 mm footer clearance.

The live compact renderer removes `.navigation` from its cloned source template;
A4 source and frozen original PDFs remain untouched. [Live API checks](LIVE-EXPORTS.json)
cover Carrot/Parsnip imperial and metric (three pages each), Brassica imperial
(six pages), and an A4 imperial control (three pages). No compact page has the
arrowed line; each A4 page retains it. Inline advice labels remain in all exports.
`npm test` passed 43 tests; the compact PDF suite passed five tests.

[Visual review](VISUAL-REVIEW.json) records inspected actual page renders and
facing spreads. Source preservation checks cover all 45 guide pages; visual
inspection is representative, not a fresh review of every diagnostic entry.

With `start.command` running, build the opener with
`node scripts/build-troubles-header-preview.mjs`, then run
`scripts/review-troubles-header-preview.py` using bundled PDF Python to remove
the saved-page lines, assemble and verify the section. This does not rebuild or
replace the main book. The earlier larger category labels and latest coloured
contents are approved separately and also await integration.
