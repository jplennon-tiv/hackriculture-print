# PDF/X-1a compatibility test — 23 November 2026

**PDF cleanup, 23 November:** obsolete diagnostic PDFs marked below were removed at John's request. [Removal manifest and preserved files](../../../../maintenance/pdf-cleanup-2026-11-23/README.md). Historical results, hashes, recipes and screenshots remain evidence; do not rerun completed upload tests or treat their retired outputs as current files.

John authorised this next independent test: “Ok, proceed with the next test.” It follows the failed 197 MB [image-payload test](../image-payload-retry/README.md), which showed that reducing file size alone did not resolve rejection. Approved artwork, the reading master, cover and every previous diagnostic PDF are preserved.

## Exact candidate and supplier status

Vegetable-Guru-Interior-PDFX1a.pdf (retired PDF): **206,405,096 bytes** (196.84 MiB), SHA-256 `c4e3299056c15f0c048fe1eb3e3b3cf2aabe1b792e904ffbdc32ebe20e6b9534`, 174 pages.

**Supplier status: Failed.** The exact file was uploaded once to the TextFile control of existing title 3822688. After transfer, Downloading File and Processing, Bookvault displayed **Font Embedding — 1 key font was unembedded ('Unknown')**. Size, Page Count and File Health all passed. A separate fresh File Processing Logs view confirms terminal Failed for this filename, logged **23 November 16:00**. [Validation screenshot](Bookvault-PDFX1a-font-error.jpg). No active upload remains; do not repeat this unchanged file. The cover remains saved Approved. No new title, support message, proof-responsibility acceptance, order or payment. [Account record](../../ACCOUNT-UPLOAD-2026-11-23.json).

## Export and bounded repairs

[convert-pdfx1a.py](convert-pdfx1a.py) runs Ghostscript 10.08.0 with `-dPDFX=1`, CMYK output, the exact existing FOGRA39 profile and strict compatibility policy 2. Image downsampling is disabled and image compression is lossless Flate. This is a genuine export through the X-1 mode, not relabelling the X-3 file. [Exact executed command](CONVERSION-COMMAND.json) and [conversion log](CONVERSION-LOG.txt).

The raw export omitted explicit TrimBox/BleedBox entries and emitted a full-page ArtBox instead. It also omitted the separate PDF/X-1a:2001 conformance key. These faults were caught before upload. [restore-boxes-and-identification.py](restore-boxes-and-identification.py) preserves the raw converter file, copies the exact MediaBox/CropBox/TrimBox/BleedBox values from the checked X-3 input, removes ArtBox (so TrimBox and ArtBox do not coexist), and sets the specific 2001 identification pair: `GTS_PDFXVersion=PDF/X-1:2001`, `GTS_PDFXConformance=PDF/X-1a:2001`. Page content instructions are unchanged by these repairs. [Repair report](GEOMETRY-IDENTIFICATION-REPAIR.json). The raw export is retained as `raw-Ghostscript-PDFX1a.pdf`; it must not be uploaded.

These are local export defects, not an established explanation of previous supplier failures. The previous X-3 candidates already retained explicit trim/bleed boxes. Ghostscript’s export guidance is in its [official documentation](https://ghostscript.readthedocs.io/en/latest/VectorDevices.html#creating-a-pdf-x-document); the 2001 two-key identification is described by the [Printer Working Group](https://www.pwg.org/archives/sm/2003/000557.html) and [PDF Association](https://pdfa.org/twenty-years-of-pdf-x-part-ii/).

## Verification

[verify-pdfx1a.py](verify-pdfx1a.py), [CHECKS.json](CHECKS.json), [FONT-STRUCTURE.json](FONT-STRUCTURE.json) and [visual review](VISUAL-REVIEW.json) record:

- All 174 pages rendered at 150 dpi. Extracted text is exact on every page; maximum glyph bounding-box difference is 0.0542 pt (0.0191 mm).
- Media, trim and bleed boxes match the checked source exactly; the repair report additionally verifies CropBox.
- All 274 unique image resources retain exact decoded CMYK pixels, dimensions and resolution. No further downsampling or colour conversion. All 47 fine-art pages and corrected bleed fragments retain their existing high resolution.
- Exact FOGRA39 profile retained, SHA-256 `c6b4b62f0726243742eced8b9669476a6be89e581f50a7600ed8b6fcbb9cdab8`.
- Local structural checks find embedded/self-contained fonts, no encryption, no inspected live transparency or interactive features. All 21,502 Type3 glyph procedures put their width operator first. No conflicting embedded font programs share an exact PDF BaseFont name; TrueType table ranges are within their streams.
- Independent Poppler inspection reports 1,043 font resources, all embedded, with no parser errors. [Font listing](POPPLER-FONTS.txt). Ghostscript parses the final complete file successfully, with an empty [error log](GHOSTSCRIPT-CHECK.txt).
- Sixteen representative pages viewed at contact-sheet scale; 300 dpi side-by-side details checked at 24, 154, 163 and 173. No missing, displaced or clipped content identified. Native lettering remains sharp, corrected headers retain their placement, and index weight distinctions remain.

A second converter pass changes font representation/rounding and antialiasing slightly. Complete rendered pages are not claimed pixel-identical. Local checks are not an independent certified ISO PDF/X validation, supplier acceptance or physical-proof approval. No app code or canonical gardening data changed; app tests are not applicable.

## Font diagnosis and next proposed test

This is the first attempt in this sequence to expose a specific failing check. The [unnamed-font investigation](UNNAMED-FONT-INVESTIGATION.json), produced by [inspect-unnamed-fonts.py](inspect-unnamed-fonts.py), compares the accepted October PDF, the optimised PDF/X-3 and this PDF/X-1a:

| File | Font resources | Unnamed resources | Unnamed type |
| --- | ---: | ---: | --- |
| Accepted October interior | 1,883 | 1,598 | Type3 |
| Optimised PDF/X-3 | 1,042 | 922 | Type3 |
| PDF/X-1a | 1,043 | 923 | Type3 |

All unnamed resources are self-contained Type3 fonts, whose glyph drawing procedures are present. Poppler reports every resource in the new PDF embedded. Bookvault's “Unknown” may group unnamed fonts; it does not identify a unique object or a named typeface. Type3 handling is therefore a focused hypothesis, not a proven cause, especially because the accepted October file also contains unnamed Type3 fonts. Do not invent a missing font file, add bogus font data or claim an ISO certification from these checks.

John subsequently requested identifying added fonts before a broader outline test, then replacing the font used only for two fractions. The [new font inventory and completed cleanup](../font-inventory/README.md) finds Nunito Sans SemiBold (title/contents) and Lucida Grande Regular (⅝ on pages 61/67) as the added variants. A separate checked candidate now uses existing Nunito Sans for **5/8** and removes the two fallback font resources. It transferred once and refreshed saved history now confirms Failed at 23 November 16:40; the subsequent [authorised SemiBold-to-Bold test](../semibold-retry/README.md) was built, checked and uploaded once; it also Failed. Blanket outlining has not been performed. This remains a focused supplier test, not proof that Lucida Regular is the rejected font. John subsequently explicitly requested the [all-300-dpi raster test](../all-300dpi-retry/README.md). Do not repeat unchanged uploads. The final virtual proof and manufacturing end pages remain blocked pending an accepted interior.

[Browser diagnostics](BROWSER-DIAGNOSTICS.json) recorded a page-animation `loadAnimation` error during processing; no connection to the PDF rejection is established. The saved validation result above is the actionable supplier evidence.
