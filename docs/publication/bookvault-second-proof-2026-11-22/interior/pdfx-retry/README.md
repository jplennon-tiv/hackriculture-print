# Repaired PDF/X-3 conversion — 23 November 2026

**PDF cleanup, 23 November:** obsolete diagnostic PDFs marked below were removed at John's request. [Removal manifest and preserved files](../../../../maintenance/pdf-cleanup-2026-11-23/README.md). Historical results, hashes, recipes and screenshots remain evidence; do not rerun completed upload tests or treat their retired outputs as current files.

John explicitly requested a renewed PDF/X conversion after reviewing the Bookvault FAQ. This supersedes the earlier instruction to obtain supplier diagnostics before another conversion. The previous failed inputs and the rejected exploratory PDF/X trial remain preserved.

## Current file and status

Vegetable-Guru-Interior-PDFX3.pdf (retired PDF) is the repaired 174-page PDF/X-3:2002 export, **545,965,373 bytes**, SHA-256 `3fab6007b25ee8f88a568f1e346813e8c03bba0f181f013c9e2f84d667cd09f9`. It uses the approved corrected interior via the [lossless compatibility intermediate](../supplier-compatibility/README.md). No approved source file was overwritten.

**Supplier result: Failed.** The exact file transferred once to existing title 3822688 as a TextFile replacement (upload logged **23 November 15:13**). It reached Downloading File, then Processing, then displayed a generic “Error” alert. A freshly loaded processing log confirms terminal **Failed**, with no detailed cause or final subcheck results. [Result screenshot](Bookvault-PDFX3-result.jpg). The cover remains saved Approved and was not uploaded again. Local conversion success did not resolve supplier rejection. The [account record](../../ACCOUNT-UPLOAD-2026-11-23.json) owns the exact attempt history. No active transfer remains; do not poll this terminal attempt or resubmit the unchanged file. John subsequently requested continued local diagnosis; the [supply-guide investigation](../supply-guide-review/README.md) led to the completed [197 MB image-payload retry](../image-payload-retry/README.md), which also failed (23 November 15:42). That successor record owns the latest diagnosis. No order, payment, support message or proof-responsibility acceptance was submitted.

## Diagnosed conversion fault and repair

The earlier Ghostscript trial dropped CID 199/201 on folios 150/154. An isolated folio 154 converted correctly; a four-page combined test reproduced the missing-glyph warnings. Different embedded TrueType subsets reused the same PDF font names and embedded PostScript name. Renaming only PDF dictionaries did not fix the test. Giving each font subset a unique name in both the PDF font dictionaries and the TrueType name table removed both warnings and restored the characters.

[normalise-font-names.py](normalise-font-names.py) updates 124 font dictionaries and 119 distinct embedded TrueType programs. Only the internal PostScript name and mandatory SFNT checksums change; the script asserts identical glyph, metric, hinting and other table bytes. It also normalises multi-character ToUnicode ligature mappings to their equivalent Unicode ligature scalars before conversion, preserving fi/fl extraction through Ghostscript. These mapping changes do not change glyph shapes. [Normalisation report](FONT-NORMALISATION.json).

[convert-pdfx.py](convert-pdfx.py) uses Ghostscript 10.08.0, `-dPDFX=3`, the existing FOGRA39 definition/profile, no image downsampling and lossless Flate image encoding. The [exact command](CONVERSION-COMMAND.json) and [complete log](CONVERSION-LOG.txt) are retained. The full conversion exited successfully, with no missing-glyph, substitution, warning or error messages. This diagnoses and repairs our local conversion fault; it does not establish the reason for Bookvault's previous rejection.

## Verification and limits

[verify-pdfx.py](verify-pdfx.py), [CHECKS.json](CHECKS.json) and [IMAGE-BYTES.json](IMAGE-BYTES.json) record:

- All 174 pages rendered and compared with the approved corrected interior at 120 dpi. Page count/order retained; maximum box-coordinate rounding is 0.002835 pt (0.001 mm).
- All 274 unique image resources retain exact dimensions, CMYK colour space and decoded pixel bytes. No downsampling, lossy recompression or image colour change.
- Exact FOGRA39 output-profile bytes retained, SHA-256 `c6b4b62f0726243742eced8b9669476a6be89e581f50a7600ed8b6fcbb9cdab8`.
- PDF 1.3 with PDF/X-3:2002 metadata; fonts embedded (or self-contained Type3); no live transparency, soft masks, unexpected blend modes or checked interactive features found.
- Normalised extracted text matches on 130 pages. The 44 first guide pages have changed extraction ordering/duplicate outlined-heading representation and word spacing, including source `Co ... re needs` becoming `Core needs`. A separate [44-page body character comparison](GUIDE-BODY-TEXT-CHECKS.json), excluding the faux-outlined titles and ignoring whitespace/order, matches every body character after Unicode normalisation. This is not a claim of identical extraction order. The rendered guide headings and representative body layouts were inspected.
- All 174 pages inspected at contact-sheet scale; detailed final renders inspected at folios 19, 24, 98, 163, 168 and 173. Side-by-side header comparison inspected at 8, 150 and 154, including the previously missing apostrophe. No missing or displaced content was identified in that coverage. [Visual review record](VISUAL-REVIEW.json).

The converted PDF is not pixel-identical to its source: converter geometry/antialiasing and font representation differ. The exact decoded artwork and profile comparison is a stronger check for unintended image/colour changes. This is a Ghostscript PDF/X export plus local technical/visual checks, **not an independent certified PDF/X validation or physical-proof approval**. No book design, canonical gardening data or application code was changed; app tests were not applicable.
