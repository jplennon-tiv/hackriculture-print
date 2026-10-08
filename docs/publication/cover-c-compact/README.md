# Veg Sorted — compact Cover C proposals

7 October 2026. **John rejected both C1 and C2. These are historical proposals.**
See the [fresh Vegetable Guru sketches](../vegetable-guru-cover-sketches/REVIEW.html).
Open [the review page](REVIEW.html) for actual-PDF front/back renders, direct
comparison, thumbnail views and the approved A4 source. These are separate
185 × 240 mm front/back panels, with 3 mm bleed following the retained Bookvault
cover template. They are not supplier-ready wraps.

## Directions and copy

- **C1:** closest to original Cover C: green title, orange subtitle ribbon,
  count badges, cream back.
- **C2:** orange title ribbon, cream subtitle label, no front badges, green back.
  Both use the same back copy and preview for comparison; panels can be mixed.

Both use the superseded *Veg Sorted* title/subtitle and the still-current 44/14 cover line. The working £17.50
price is shown on the back. No author name, imprint, ISBN, credentials or
endorsements have been invented. The back headline and descriptive copy are new
AI-written working proposals, grounded in the existing
[metadata description](../book-preparation/DRAFT-METADATA.json),
[compact style contract](../../BOOK-PRINT-STYLE.md) and prepared guide spread.
They do not modify canonical gardening records or the interior copy.

## Source continuity and intentional changes

[Original Cover C](../../front-matter/cover-studies/preview-c.html) and its
[1054 × 1492 raster](../../front-matter/cover-studies/assets/contemporary-c.png)
remain intact, alongside the installed A4 PDF. Preserve their existing approval.

The retained composition is a bold, angled green title among the recognisable
carrot, cut purple onion, tomato and peas, on cream/apricot with an orange ribbon.
[ARTWORK.json](ARTWORK.json) records the built-in imagegen edit prompt and saved
working derivative. This removes the old raster lettering/banner and fills the
hidden areas, allowing new vector type. It is **not pixel-identical** artwork:
the reconstructed carrot curves more, and the book proportions are wider.
The lower decorative roots/pod meet the footer crop. This derivative was rejected
with the proposals; do not prepare it as selected final art.

The original guide-preview idea moves to the back. The old A4 Courgette / Broad
Bean thumbnails are replaced by both pages of the already-prepared
[imperial Bookvault Broad Bean proof](../../../output/pdf/book-preparation/bookvault/imperial/vegetable_bean_broad.pdf),
rendered by `pdftoppm` at 1200 pixels high. The underlying PDF was not regenerated.
This unit choice is illustrative, not a decision on the launch edition. The old
footer is replaced with the confirmed cover line; C1 retains both count badges,
while C2 expresses the counts in the footer and on the back. The barcode box is a
43 × 25 mm design reservation, not a supplied/validated barcode specification.

## Checks and production limits

[CHECKS.json](CHECKS.json) records exact output and source hashes, trim/bleed,
fonts, text/safety checks, image resolution and visual-review scope. Both complete
PDFs were raster-reviewed against original Cover C. Technical checks do not
approve the designs or new back copy. No app/interior tests or collection exports
are needed for these isolated files.

The working plate is **1100 × 1429 px, about 146 ppi** at its cover placement.
It is adequate for concept review but must be reconstructed at higher resolution
for production; resampling alone would not create missing detail. Title and copy
remain vector text. Final colour preparation and physical print review remain.
The Bookvault template labels an 8 mm spine but its filename encodes 8.436 mm;
no spine is assumed. Settle stock/pagination and obtain the final template before
building a wrap. No uploads, account actions or proof orders were made.

## Historical builder — not the current design direction

Use `zsh start.command` on loopback, following [SETUP](../../../SETUP.md).
`node scripts/build-compact-cover-c.mjs` writes the two editable HTML proposals,
their PDFs under `output/pdf/cover-c-compact/`, the PDF renders and a fresh
measurement receipt. Styles live in [covers.css](covers.css). It reads the saved
artwork and thumbnails; it makes no imagegen call and no guide export.

Run the bundled Python against `scripts/check-compact-cover-c.py` for physical PDF
checks. Reinspect all four renders after a design change; rebuilding resets the
visual review to pending. Do not use the A4 cover builder or the old overnight
`prepare-book-covers.mjs` for this adaptation.
