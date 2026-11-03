# Sentence case for Key risks

On **3 November 2026**, John requested the same sentence case for Key risks
headings that had just been applied to the Pests & diseases tables. He then
approved all the recent changes: “Much better, thanks. All changes approved.”
The [exact approval](APPROVAL.json) binds both case corrections and the reviewed
book revision; the contents reflow retains its earlier approval.

**157 headings changed across 44 vegetable opening pages.** All 173 displayed
headings now follow the same rule, retaining proper names such as New Zealand.
`troubleLabel` now formats Key risks in both live vegetable renderers, including
fallback names from shared Troubles. The rich renderer revision is
`richer-a-v7-risk-case`. Icons still resolve from the original risk identity.

No further gardening JSON was changed: the [earlier guarded source correction](../pest-title-case/SAVE-RECEIPT.json)
is retained. Rankings, selection, descriptions and detailed Troubles titles are
unchanged. Current full-book numbering and facing pairs remain unchanged.

## Saved book pages

[PDF checks](PDF-CHECKS.json) bind each corrected page to its exact original PDF
and source page. The native derivative is
`output/pdf/key-risk-title-case/corrected-opening-pages.pdf`.
The current full-book assembler checks these bindings before using it alongside
the earlier Pests & diseases derivative. Frozen originals remain intact.

The correction retains the existing Lilita One font, size, colour, starting
position, baseline and line breaks. All other glyphs retain their exact text,
positions, size and colour; all image bytes and geometry match. Shorter labels
leave extra room within their existing heading areas. There are no covering
rectangles or hidden old headings.

Where an old embedded subset lacked a lowercase letter, `font-donor.pdf` supplies
the original local Lilita face from `public/fonts/richer-a-1.woff2`. Every original
glyph's ID, outline bytes and advance width is checked against the donor before
extending the subset. The PDF/font hashes are runtime inputs to the correction;
retain them with this evidence.

## Checks and continuation

- 44 opening pages: 173 headings, 157 changes; all other glyphs and all images
  compared with original sources. All changed headings fit beside adjacent text.
- [Runtime proof checks](RUNTIME-CHECKS.json): Broccoli and Spinach in both units,
  including wrapped titles and New Zealand. Actual compact PDFs verify every
  heading within its measured box, with loaded fonts/images and retained content.
  These raw trim tests have three pages; accepted two-page book guides remain
  assembled from their saved native sources.
- `npm test`: 43 tests passed; `npm run check:types` passed.
- All 44 corrected Key risks strips rendered for visual inspection. The current
  [book checks](../whole-book-order-preview/CHECKS.json) and visual receipt cover
  final assembly and navigation. Supplier files and publication state are unchanged.

The source-bound correction recipe is `prepare-pdf.py`, `finish-pdf-plan.mjs`,
`make-font-donor.mjs` and `apply-pdf.py`. The approval freezes the accepted
proofs and recipe. The completed receipt guards against
repeating or overwriting it. Make a new revision for later copy changes, rather
than changing the frozen receipt. Use a separate output folder if repeating
`render-review.py`, so the accepted visual evidence remains intact;
`check-runtime.mjs` and `check-pdf-runtime.py` can repeat bounded live checks.
Use the current `npm run book:preview` route for assembly; no guide catalogue
export or source transaction is needed.
