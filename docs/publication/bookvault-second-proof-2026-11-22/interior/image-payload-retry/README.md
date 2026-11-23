# Smaller image-payload retry — 23 November 2026

**PDF cleanup, 23 November:** obsolete diagnostic PDFs marked below were removed at John's request. [Removal manifest and preserved files](../../../../maintenance/pdf-cleanup-2026-11-23/README.md). Historical results, hashes, recipes and screenshots remain evidence; do not rerun completed upload tests or treat their retired outputs as current files.

John approved the proposed image-payload test: “Good plan - please proceed.” This is a separate derivative of the repaired PDF/X-3 source. The approved book, full-resolution artwork, corrected production source and all earlier diagnostic PDFs remain intact.

## Exact candidate

Vegetable-Guru-Interior-PDFX3-Optimised.pdf (retired PDF): **197,344,337 bytes** (188.20 MiB), 174 pages. SHA-256 `8e3f9a24cbcdbfe3b17009a940662a45c370307d7db07fe9483b43bf42e07d7c`. This is 63.85% smaller than the 545,965,373-byte [PDF/X-3 source](../pdfx-retry/README.md).

**Supplier status: Failed.** The exact candidate was uploaded once to existing title 3822688 as a TextFile replacement, logged **23 November 15:42**. Transfer completed, followed by Downloading File and Processing. Freshly loaded File Processing Logs confirm terminal **Failed** for `Vegetable-Guru-Interior-PDFX3-Optimised.pdf`. No detailed cause or final subcheck results were exposed. No generic alert was observed in this attempt; the original page continued showing stale Processing text until reloaded. [Result screenshot](Bookvault-Optimised-result.jpg). No active transfer remains. The cover remains saved Approved and was not reuploaded. No new title, support message, proof-responsibility acceptance, order or payment. The [account record](../../ACCOUNT-UPLOAD-2026-11-23.json) preserves the exact attempt history.

## Controlled change

[reduce-image-payload.py](reduce-image-payload.py) changes only 124 full-page CMYK image streams, from 4,512 × 5,812 to 2,256 × 2,906 pixels (approximately 600 to 300 dpi). The CMYK channels are resized directly using Lanczos, without a further colour-profile conversion. The results are encoded losslessly with PNG prediction and Flate. The four-channel PNG wrapper is used solely for compression, never for colour interpretation or resampling; the PDF resources remain 8-bit DeviceCMYK.

All 150 other image streams remain byte-exact, including the corrected high-resolution bleed fragments. Full-page artwork stays at 600 dpi on **47 pages**: the calendar panel at 7, all 44 practical guide pages (9, 11, …, 95), and the diagrams at 146 and 167. The changed full-page resources occur on 127 pages because one cream blank is shared by four folios.

All native lettering, page content instructions, font programs, other decoded streams, metadata, page boxes and exact FOGRA39 output-profile bytes remain unchanged. The PDF/X-3 format is retained to keep this a focused image-payload test. [Build record](IMAGE-PAYLOAD-CHANGES.json) and [log](BUILD-LOG.txt).

## Verification

[verify-payload.py](verify-payload.py) and [CHECKS.json](CHECKS.json) passed:

- 174 pages rendered at 150 dpi; extracted text is exact on every page and every glyph bounding box has zero change.
- All page instructions, non-image streams, metadata and page boxes match exactly.
- All 124 changed streams decode to the expected resampled CMYK bytes; all 150 preserved image streams are exact.
- All 47 preserved 600 dpi pages are pixel-identical at 150 dpi. Four additional blank pages also render identically.
- Font embedding/self-contained Type3 resources, opaque artwork and the inspected PDF/X-3 structure have no reported local issues.
- Ghostscript 10.08.0 parsed the complete file with nullpage, exit 0, producing an empty [error log](GHOSTSCRIPT-CHECK.txt).

[Visual review](VISUAL-REVIEW.json): source/candidate detail comparisons viewed at 300 dpi on folios 24, 98, 154, 162 and 168, plus complete candidate pages 1 and 98. Native lettering stays crisp, coloured botanical outlines remain clean and photographic detail retains useful definition with the expected slight softening. No apparent colour shift, seam, displacement or clipping regression was identified in that coverage. This is focused visual coverage plus whole-file automated checks, not a new full-book design review.

No independent certified ISO PDF/X validator has been run. Local checks are not supplier acceptance or physical-proof approval. The [supply-guide investigation](../supply-guide-review/README.md) explains the image-size/processing hypothesis; no published 500 MB cap has been established.

## Implication and next diagnostic

The reduction from 545.97 MB to 197.34 MB did not resolve supplier rejection. A simple 500 MB compressed-file threshold cannot explain this failure. John subsequently explicitly requested a separate [all-300-dpi test](../all-300dpi-retry/README.md), including the fine-art pages and bleed strips retained at 600 dpi here. The subsequent authorised [genuine PDF/X-1a test](../pdfx1a-retry/README.md) preserved these image pixels/profile and also failed, but exposed a specific **Font Embedding (Unknown)** error. Size, Page Count and File Health passed. Follow that newer record for the font investigation and proposed next test; this smaller-file test and its original sources remain preserved.
