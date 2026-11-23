# Second-proof colour preparation and review

22 November 2026. **Production-colour preparation is complete.** The actual 174-page interior and complete cover wrap have been converted and checked using the exact accepted first-proof FOGRA39 / ISO Coated v2 300% profile. Five bounded photo corrections preserve useful shadow texture; three opener backgrounds now match the shared cream. No further colour change is indicated by the completed checks. Physical proof acceptance, metadata and supplier approval remain separate.

[Open the seven-page production-colour viewing PDF](../../../../output/pdf/bookvault-second-proof-2026-11-22/colour/Vegetable-Guru-Production-Colour-Checks.pdf). It shows actual converted cover/pages, before-and-after photograph comparisons and the corrected openers. It is a compact viewing document, not a supplier file or physical print simulation.

## Prepared files

| Production file | SHA-256 |
|---|---|
| [174-page interior](../../../../output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Colour-Managed.pdf) | `341ce74932cd81f6a8cc838b742ec7095e471d0ee7d9fcb7b247dd1b417e6b47` |
| [Complete cover wrap](../../../../output/pdf/bookvault-second-proof-2026-11-22/cover/Vegetable-Guru-Second-Proof-Cover-CMYK.pdf) | `a37c9d4216c14643bd7bb46c9fd066bf12fe400a6301365e01b997a8e0821a8e` |

The standard UK 185 × 240 mm, 150 gsm coated, perfect-bound, matt-laminated, standard inkjet proof choice is unchanged. [Production-colour findings](PRODUCTION-COLOUR.md) record official supplier guidance, exact profile, source handling and the evidence below.

## Completed checks and changes

- All **174 actual converted pages** were visually checked on eleven complete-page [contact sheets](production/contacts/), in addition to the earlier all-page source review. The interior worker rendered all 174 at 144 dpi and verified all 340,299 native glyphs plus embedded font/CMap/Type3 data. Colour review independently rendered every page at 72 dpi, selected pages at 150 dpi and the exact final cover at 150 dpi. The three corrected openers were refreshed after the final bounded patch; all other pages were verified unchanged.
- **Five photographs only** received relative-colourimetric conversion with black-point compensation: P154 main compost panorama, P155 left compost photo, P168 lower greenhouse, rear-cover salad-colander tile and rear-cover kneeling-John tile. Actual comparison renders show useful separation in dark wood, soil, pots and clothing. Independent pixel checks confirm exact treatment inside the bounds and unchanged CMYK pixels outside them.
- **P7, P97 and P145 background cream** had acquired a different conversion from their Generic RGB tag. Root authorised restoring the intended shared cream. Exact flat background pixels were changed from CMYK bytes `0,7,24,0` to `0,7,29,0`; every actual photo placement plus a two-pixel guard was excluded. The calendar panel, native lettering and all unselected pixels are identical. Blank folios **4, 6, 96 and 174** are uniformly `0,7,29,0` across the full media area.
- Embedded destination profile bytes match the accepted first proof. Artwork is opaque CMYK, active transparency is resolved and native/vector lettering is preserved. The cover retains genuine font-outline paths; no lettering was traced or regenerated. These files are not claimed to have certified PDF/X conformance.
- Natural lighting and seasonal differences are retained. P149 winter kale, P169's less sunny greenhouse, the 1991 introduction photo and the graphic guide/troubles illustrations intentionally differ. Pale mesh on P162 remains legible without a photo correction. No blanket brightness, saturation or palette change was made.

Independent receipts: [interior](FINAL-INTERIOR-COLOUR-CHECKS.json), [cover](FINAL-COVER-COLOUR-CHECKS.json), [three cream masks](FINAL-CREAM-INDEPENDENT-CHECKS.json), [render coverage](PRODUCTION-RENDER-CHECKS.json), [actual visual coverage](PRODUCTION-VISUAL-REVIEW.json). Exact photo bounds are in [the interior plan](SELECTIVE-PHOTO-BPC.json) and [cover plan](../cover/SELECTIVE-BPC-PHOTOS.json); exact background masks are in [the cream plan](CREAM-BACKGROUND-CORRECTION.json).

## Physical proof and preservation

The physical second proof should confirm deep texture in the five treated photos, pale netting/fleece on P162, even cream on blank and opener pages, and the warm cover under matt laminate. The software checks establish controlled preparation and visible screen results; they do not measure the press, paper or laminate, and no physical copy was examined here.

**After John accepts the physical proof, keep these production PDFs, ICC profile, rendering intents and conversion recipe fixed for the print run.** Any later regeneration or colour change must be deliberate and checked.

## Earlier source review and reproduction

The [25-page native-source review](../../../../output/pdf/bookvault-second-proof-2026-11-22/colour/Vegetable-Guru-Print-Colour-Review.pdf) remains evidence of the source-artwork pass, not the final production view. It covers all 174 folios from the 178-page native master (folio F = PDF page F + 2), excludes its four cover leaves, and compares representative Carrot, Kale and cream pages against the first proof. [Original visual receipt](VISUAL-REVIEW.json) retains that exact coverage. The original master, approved artwork, first-proof files and geometry baselines are intact.

`render-production-review.py`, `refresh-final-review.py`, the independent `verify-final-*.py` scripts and `assemble-production-review.py` reproduce the final evidence. The seven-page viewing PDF was opened and its summary, final-photo comparisons and cream-openers page were rendered and visually checked. Documentation/image evidence needs no application tests.
