# Combined 20 mm gutter and outlined-font diagnostic

**PDF cleanup, 23 November:** obsolete diagnostic PDFs marked below were removed at John's request. [Removal manifest and preserved files](../../../../maintenance/pdf-cleanup-2026-11-23/README.md). Historical results, hashes, recipes and screenshots remain evidence; do not rerun completed upload tests or treat their retired outputs as current files.

23 November 2026. John explicitly requested uploading the next version with both gutter and font fixes, retaining the ability to work backwards if it succeeds. This is a separate supplier diagnostic; the approved editable book and full-resolution sources are intact. The cover stays Approved and unchanged. No order or payment is part of this test.

**Supplier result: Approved.** John reported approval and Bookvault File Processing Logs independently showed Approved for this exact filename, logged 19:10. The existing cover is also Approved. [Acceptance receipt](SUPPLIER-ACCEPTANCE.json) · [upload result](UPLOAD-RESULT.json). This exact file is the preserved accepted control. John then explicitly authorised [further isolation tests and a quality review](../isolation-tests/README.md). Cause is not yet isolated; the gutter change, font outlining and related PDF rewrite were combined.

## Files and changes

| File | Role | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| [Gutter20-Outlined.pdf](../../../../../output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Gutter20-Outlined.pdf) | Accepted supplier control, 174 pages | 247,629,902 | `f12de8331d706379ae652e3995d9c185b0cb328600ee0526f604f6a1daeaf930` |
| Gutter20-Native.pdf (retired PDF) | Preserved gutter-only intermediate; not uploaded | 168,935,887 | `2b9f5974699d120c7b2120151e60c15c838267d9cfe0dd13dde7eaa97ba6fb1e` |
| [Six-page checks PDF](../../../../../output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Gutter20-Outlined-Checks.pdf) | Exact final folios 1, 24, 25, 98, 99 and 170 | — | — |

The source is the [failed all-300-dpi file](../all-300dpi-retry/README.md), with both earlier font substitutions retained. [The checklist audit](../checklist-audit/README.md) measured the original 17 mm gutter. A simple outward shift would compromise the outer safety margin on 46 pages, so the test uniformly scales page content to **99%**, anchors it at the top trim edge and shifts it **3.4 mm outwards**, mirrored for verso and recto. No text reflow, folio change or distortion. Minimum measured native-lettering clearance is **20.109 mm inner / 5.182 mm outer**. Four blank pages (4, 6, 96, 174) remain unchanged. Matching existing CMYK page-paper colour fills the exposed media edges. Decorative artwork may still extend into the gutter or bleed by design; the clearance measure concerns lettering.

This is a supplier-specific derivative, not a change to the approved generator layout or a new design approval. [Gutter build](build-gutter.py) and [per-page receipt](GUTTER-CHANGES.json) preserve each matrix and paper sample. All original font/image streams survive this intermediate.

Ghostscript then emits the original glyph instructions as **vector outlines**, not raster tracings. The final PDF has **zero font resources** and no selectable/searchable text. Genuine outline conversion avoids the earlier cover tracing defect; selected 300-dpi comparisons show clean curves. Conversion also rebuilds PDF structure, so this supplier success does not identify a single failing typeface or prove that fonts alone caused rejection. [Command](OUTLINE-COMMAND.json) · [conversion script](outline.py) · [result](OUTLINE-RESULT.json).

## Verification completed

- All **174 pages** render in PDFium; Ghostscript nullpage validation exits 0 without diagnostics.
- All 274 unique CMYK images retain **exact pixels and dimensions** through outlining. No additional resampling or colour conversion. Effective placements are 303 dpi after the 1% reduction (352 placements), with four blank-page images at 300 dpi.
- Original page boxes are exact: **185 × 240 mm trim**, **191 × 246 mm media**, **3 mm bleed**, all portrait.
- Exact FOGRA39 profile retained; PDF 1.3 and PDF/X-1a:2001 identification. No encryption, live transparency or interactive elements found. This is local checking, not independent ISO certification.
- All nine contact sheets covering 174 pages inspected; selected before/after page-layout and 300-dpi lettering comparisons inspected. No missing content, newly malformed letters or gross clipping seen. Bold index references remain distinguishable. Antialiasing changes from removing live-font hinting are expected; rendered pages are not claimed pixel-identical.

[Technical checks](CHECKS.json) · [visual review and coverage](VISUAL-REVIEW.json) · [high-resolution comparisons](HIGH-RES-COMPARISON.json) · [verifier](verify.py). Technical review is not John’s final physical-proof or supplier approval.
