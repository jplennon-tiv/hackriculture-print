# All raster artwork at 300 dpi — 23 November 2026

**PDF cleanup, 23 November:** obsolete diagnostic PDFs marked below were removed at John's request. [Removal manifest and preserved files](../../../../maintenance/pdf-cleanup-2026-11-23/README.md). Historical results, hashes, recipes and screenshots remain evidence; do not rerun completed upload tests or treat their retired outputs as current files.

John requested: “One more thing to try - all graphics down to 300dpi?” This is a separate resolution-only derivative of the latest Nunito Bold candidate. The full-resolution originals, approved reading master and previous diagnostic PDFs remain intact.

**Supplier status: Failed, logged 23 November 18:25.** John reported the failure; saved File Processing Logs independently confirmed it at **18:37:58** for this exact filename. No detailed rejection cause or final subcheck results were exposed; the live upload form has reset. [Failed screenshot](Bookvault-All-300dpi-failed.jpg) · [result record](UPLOAD-RESULT.json). This was the eighth replacement interior failure. No transfer of this file remains; the later [combined diagnostic](../gutter-outline-retry/README.md) owns current upload status. The cover remains Approved and unchanged. No order, payment, new title or proof-responsibility acceptance.

## Exact file and change

Vegetable-Guru-Interior-All-300dpi.pdf (retired PDF): **174 pages; 167,984,301 bytes** (160.20 MiB). SHA-256 `e63823a8d71b559622758918dc8809f460d5bc7a6426b00058cc1ecabca29a6f`.

Input: [Nunito Bold test](../semibold-retry/README.md), 206,404,140 bytes, SHA-256 `9219a432b1be214452b48bbc68487c81f44affde17766ae56b28a7820a715243`. Saved history confirmed its terminal failure at 18:19; no detailed cause was exposed. Removing both newly added named font variants was insufficient to resolve rejection; it does not identify a cause or clear all fonts.

The earlier image-payload test deliberately retained 47 full-page graphics and all bleed repairs at 600 dpi. This test halves every remaining 600-dpi image: **150 unique resources**, comprising 47 full-page backgrounds/artwork layers and 103 bleed strips reused in 182 positions. Their 229 placements become 300 dpi; the 124 existing 300-dpi resources (127 placements) stay byte-identical. All **356 raster placements** now independently measure 300 × 300 dpi with Poppler. Text and vector graphics remain resolution independent.

Resampling operates directly on the existing CMYK channels using Lanczos and lossless Flate/PNG-predictor encoding. No new JPEG loss or colour conversion is introduced. The existing PDF/X-1a identification, exact FOGRA39 output profile, font cleanups, content instructions, vector lettering and page geometry remain. [Build script](build-all-300dpi.py) · [image receipt](IMAGE-CHANGES.json).

## Checks

[Verification script](verify-all-300dpi.py), [checks](CHECKS.json), [independent checks](INDEPENDENT-CHECKS.json) and [visual review](VISUAL-REVIEW.json):

- Every page's text, glyph positions, instructions, fonts, Media/Crop/Trim/Bleed boxes, metadata and output intent are exact against the input. All non-image streams are identical.
- All 150 changed image streams decode to the intended resampled bytes; all 124 untouched image streams are byte-exact. [Actual image placements](PDFIMAGES.txt).
- All 174 pages rendered and text positions compared. The 36 pages with no changed images render pixel-identically at 100 dpi.
- Poppler reports all 1,040 font resources embedded; Ghostscript parsed the complete file with exit 0 and an empty error log. These are local checks, not certified ISO PDF/X validation or supplier acceptance.
- Source/candidate details inspected at 300 dpi on 7, 24, 25, 61, 67, 98, 146 and 167, plus complete pages 7, 25, 146 and 167. Calendar, planting drawings, fine diagrams and repaired header edges remain clear with expected slight softening at enlarged scale. No new clipping, displacement, seams or apparent colour shift found in that coverage.

[Planting detail comparison](artwork-comparison-025.jpg) · [greenhouse diagram comparison](artwork-comparison-167.jpg) · [calendar comparison](comparison-007.jpg) · [guide header comparison](comparison-024.jpg) · [Troubles header comparison](comparison-098.jpg).

The approved cover already passed and is not part of this test. No source, generator, layout, canonical gardening data or page order is changed. Supplier rejection persists. Virtual-proof/manufacturing-page checks remain blocked until an interior is accepted. Do not repeat this unchanged upload.

## Follow-up diagnostic

The [completed checklist audit](../checklist-audit/README.md) found the unmet 20 mm gutter criterion and retained the unresolved local/supplier font discrepancy. John subsequently authorised uploading the next version with **both gutter and font fixes**. The [combined diagnostic](../gutter-outline-retry/README.md) and its upload record now own current status; this all-300-dpi file remains a preserved failed baseline.

The separate derivative uses genuine glyph instructions as vector outlines, with zero font resources, while preserving original image pixels, colour profile and page boxes. Its uniform 99% scale and mirrored outward shift meet the measured text safety margins. Editable sources and the gutter-only intermediate remain intact. A successful combined upload would not identify a particular typeface or prove that font embedding alone was the cause.
