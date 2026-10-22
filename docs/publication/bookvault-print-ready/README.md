# Bookvault production review — 19 October 2026

[Open the review](REVIEW.html). The exact files below were uploaded to Bookvault
title **3822688**, SKU **9669932000017**, and both passed its automated checks.
The cover and sampled interior spreads were inspected in its visual proof. John
confirmed the artwork responsibility declaration, then supplier proof approval was
submitted. **John has ordered and reported payment for one copy at £12.58**.
[Order BV3012332](https://portal.bookvault.app/order?ID=3012332) is verified in the
portal with status **Created**, standard UK production and Royal Mail 1st Class.
[Supplier checks, coverage and order evidence](SUPPLIER-CHECKS.json).
Final publication artwork remains subject to review; the reading proof and all
approved originals remain intact.

| File | Specification |
| --- | --- |
| [Interior](../../../output/pdf/bookvault-print-ready/the-vegetable-guru-interior.pdf) | 168 pages; 185 × 240 mm trim; 191 × 246 mm media; 3 mm all-round bleed; approximately 442 MiB |
| [Cover](../../../output/pdf/bookvault-print-ready/the-vegetable-guru-cover.pdf) | One 388 × 246 mm wrap; 185 mm back + 12 mm spine + 185 mm front; 3 mm outer bleed; approximately 31 MiB |

The selected specification is 150 gsm coated, full colour, perfect-bound paperback;
matt lamination remains provisional. Geometry follows the saved title's
[fresh templates](../bookvault-setup-2026-10-19/README.md). A change of page count,
paper or binding requires a new spine/template check.

## Interior preservation

The source is the current 172-page reading PDF, SHA-256
`93c5be45e8a790cb3a4f91aeac8b7910035cfa37a142dbf41b8444644f88f5bf`.
Only its four cover leaves were removed. All 326,982 native glyphs, fonts, sizes
and positions match, apart from the exact 3 mm translation needed for bleed.
All 168 pages passed the 17 mm binding / 5 mm other-edge text-safety check.
The imperial edition alone was prepared; no metric layouts were reflowed.

At John's request, the five intentional blanks (3, 6, 8, 98 and 168) now use
the same printed cream as the surrounding pages, extending through bleed.
Only those empty pages changed; the other 163 pages' content and artwork
fingerprints are identical. [Focused colour update](BLANK-COLOUR-UPDATE.json).

110 reduced screen-art streams were matched by name and independently checked
against their original-image thumbnails, then replaced by the corresponding
600 dpi artwork streams from the retained older supplier PDF. No old copy or
pagination was imported. Large boundary clipping/background rectangles extend
into bleed; interior crop boundaries and native text are unchanged.
[Restoration evidence](INTERIOR-PREPARATION.json).

The restored input has 396 image placements, none below 200 ppi. One is below
300 ppi: the existing Growing Techniques opening illustration at 270.56 ppi.
All others are at least 315 ppi. [Source-resolution audit](SOURCE-RESOLUTION.json).
Final 600 dpi compositing does not create detail absent from those originals.

## Cover adaptation to review

[Compare the selected concepts and production cover](cover-comparison.jpg).
G2's cream-centre vegetable grid and B5's green ground, left blurb, angled page
collage, working £17.50 price and barcode reserve are retained as the direction.
The adaptation is **proposed**, not a newly approved cover design:

- Native Lilita One lettering replaces concept-image lettering; its shapes differ.
- Approved original vegetable heroes replace the 151 ppi concept tiles. Crops and
  drawings differ, particularly the onion. Hero source detail is approximately
  255–347 ppi at the proposed placements, before final compositing.
- Real Carrot (14), Kale (40), and Carrot and Parsnip Troubles (112) crops replace
  generated page fragments. These use 400 dpi renders of the restored current pages.
- John Lennon now appears below the front subtitle and alongside the title on
  the green 12 mm spine, as requested. The cream centre is slightly taller to
  accommodate the byline; the lower vegetable row is correspondingly shorter.
  Native blurb/price/barcode text use the
  guarded shared book-copy reader. Concept textures become flat print colours;
  torn edges are vector clipping masks.

[Cover sources, copy revision and placements](COVER-PREPARATION.json).
The approved blurb and saved copy are unchanged. Copyright/publication metadata
and the ISBN/barcode panel remain placeholders by John's earlier instruction.
They must be settled deliberately before the final edition. This cover does not
contain a working barcode. Bookvault’s automatic barcode insertion was switched off
before the cover upload; John deferred the ISBN until after the first proof.

## Colour, fonts and checks

Non-text artwork is composited at 600 dpi with lossless compression. Original
native text is retained above it. RGB colours were converted using LittleCMS,
relative colorimetric intent, to **ISO Coated v2 300% (ECI), FOGRA39**, with the
profile embedded as the output intent. Final page images are CMYK, fonts are
embedded, and active transparency is removed. Type 3 glyph programmes were also
checked: no RGB or non-device colour operators remain. This is not a claim of
certified PDF/X conformance. Bookvault’s automated file checks subsequently passed.

The profile is from the [official ECI offset-profile archive](https://eci.org/lib/exe/eci_offset_2009.zip).
[Bookvault's coated-paper colour guidance](https://help.bookvault.app/printed-book-colour-differences)
supports FOGRA39; the physical proof is still needed to judge colour, small detail,
stock weight, show-through and opening comfort.

The 150 gsm coated stock is white: cream is printed colour, not the paper itself.
The pale page tint is approximately C0 M2.75 Y11.37 K0 in these files. A large flat
tint can reveal unevenness or variation between pages/runs; plain white would
avoid that background-printing variable. John has confirmed keeping cream for the
first proof; check facing-page consistency, banding and text contrast.
[Bookvault recommends a standard printed copy first](https://help.bookvault.app/what-is-a-premium-title),
with toner considered if solid/dark backgrounds or demanding artwork need it.
The existing specification already counts all 168 pages as full colour.

[Preflight](PREFLIGHT.json) covers every page's geometry, glyphs, safety, fonts,
colour spaces and transparency. [Raster comparison](RASTER-COMPARISON.json)
compares actual before/after PDF renders at 120 dpi with a one-pixel dark-ink
alignment tolerance. It is a layout alert, not a colour-accuracy test. The largest
new dark-ink fraction is 0.354%, predominantly the brown Mushroom table colour
crossing the threshold; no lost/added text or layout regression was found in the
visual review. [Visual coverage](VISUAL-REVIEW.json) records its actual scope.
The review viewer uses images rendered from these exact final PDFs, cropped to
trim for reading. The cover wrap image includes bleed.

## Reproduction and next action

The focused scripts are `prepare-bookvault-interior.py` (hash-bound current source,
art restoration, bleed), `build-bookvault-cover.mjs` (native cover composition),
`finish-bookvault-pdf.py` (separate art/text colour conversion),
`check-bookvault-production.py`, `review-bookvault-production.py`, and
`update-bookvault-blank-pages.py` (five-page colour patch with unchanged-page audit).
Intermediate RGB PDFs and exact cover crop assets are retained for this unresolved
review; [build inputs and asset recipe](BUILD-INPUTS.json) record the manual cover
crop and exact-box normalisation steps. The server is only needed by the cover
browser export and review viewer, not the offline PDF checks.

Both uploaded files and the supplier proof are approved for the first proof following
John’s explicit confirmation of the artwork responsibility declaration. John then
completed checkout and reported payment. The portal verifies [order BV3012332](https://portal.bookvault.app/order?ID=3012332),
reference 69932-#00001, created 19 October at 15:09, status **Created**. It contains
one copy: standard UK production £6.31 and Royal Mail 1st Class £6.27, **£12.58 total**,
to John’s confirmed Truro address, postcode TR1 1BQ. [Order confirmation](supplier-proof-order-confirmed.png).
The portal detail does not display a separate payment status; payment completion
is reported by John.

Checkout estimated dispatch 28 October and delivery 29–30 October; the order page
does not repeat those dates. Await the physical copy, then review cream consistency,
colour/detail, paper weight and binding comfort before final publication decisions.
No public shop listing or distribution has been enabled. The original reading
preview remains available for continued edits; preserve these exact ordered PDFs.
