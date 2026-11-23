# Bookvault checklist audit — 23 November 2026

**PDF cleanup, 23 November:** obsolete diagnostic PDFs marked below were removed at John's request. [Removal manifest and preserved files](../../../../maintenance/pdf-cleanup-2026-11-23/README.md). Historical results, hashes, recipes and screenshots remain evidence; do not rerun completed upload tests or treat their retired outputs as current files.

John requested checking every item in the supply guide first, including its PDF/X export setting. This completed audit records the exact failed all-300-dpi upload; no print PDF was modified during the audit. John subsequently authorised a separate upload combining the 20 mm gutter and font-outline fixes. Follow the [combined diagnostic](../gutter-outline-retry/README.md) for the current file and status.

File: Vegetable-Guru-Interior-All-300dpi.pdf (retired PDF),
167,984,301 bytes, 174 pages, SHA-256
`e63823a8d71b559622758918dc8809f460d5bc7a6426b00058cc1ecabca29a6f`.
Its supplier status remains **Failed**; cover remains Approved.

## Checklist result

| Item | Actual result |
| --- | --- |
| Individual portrait pages | Pass: all 174 are portrait, zero rotation, unit scale 1. No imposed spreads. |
| Images at 300 dpi | Pass for embedded raster resolution: a fresh Poppler inventory reports all 356 placements at 300 × 300 dpi, covering 274 unique CMYK image objects. This is not a claim to restore detail absent in source pictures. |
| Embedded fonts | Locally pass: all 1,040 font resources are embedded or self-contained Type3 glyph procedures; no unembedded resources found. **Supplier discrepancy unresolved:** the earlier PDF/X-1a upload reported Font Embedding — Unknown. Subsequent failed uploads exposed no new specific cause. |
| Flattened transparency | Pass in the structural audit: no live transparency groups, non-opaque alpha, soft masks, non-normal blend modes or optional-content layers. |
| 20 mm gutter safety | **Not met.** The approved working layout allocates 17 mm inside / 8 mm outside. Actual native lettering lies inside the 20 mm zone on 169 of 170 text-bearing pages. The tightest measured character is 16.878 mm from the binding trim edge (page 157). This is a print-layout discrepancy, not an established cause of supplier rejection. |
| No printer marks | None found in structure/source-generation checks. No registration colour or mark metadata, no annotations, and the preparation code adds bleed only. Actual page-edge review of 24–25 and 98–99 shows no crop/bleed marks. This does not claim semantic classification of every line within raster artwork. |
| No passwords/security | Pass: unencrypted; no Encrypt trailer entry or permissions dictionary. |
| Correct page size and bleed | Pass: all pages share approximately 191 × 246 mm media, 185 × 240 mm trim and 3 mm bleed on every edge. Converter coordinate rounding is at most approximately 0.0011 mm. Explicit CropBox, TrimBox and BleedBox are present; no conflicting ArtBox. |
| PDF/X-1a export setting | The export lineage uses Ghostscript `-dPDFX=1`. The latest file is PDF 1.3 with `GTS_PDFXVersion=PDF/X-1:2001` and `GTS_PDFXConformance=PDF/X-1a:2001`, plus the unchanged FOGRA39 output intent. **No independent ISO conformance certification has been performed.** Export settings and identification alone do not prove complete final-file conformance. |

The guide's printed page 4 literally says `PDF/X-1a:200`, an incomplete year.
Bookvault's [current format FAQ](https://help.bookvault.app/what-format-do-my-files-need-to-be-in)
explicitly specifies **PDF/X-1a:2001** (and also accepts PDF/X-3:2002).
The [guide](https://20439106.fs1.hubspotusercontent-na1.net/hubfs/20439106/Guide%20To%20PDFs%20-%20Digital%20Version%20.pdf)
printed page 2 supplies the 20 mm gutter criterion. Both sources were reopened
for this audit. The earlier guide review had noted the 20/17 mm difference but
retained the approved layout during diagnosis; it was not a resolved exception
to this checklist.

## Measurement and evidence

[audit.py](audit.py) checks the file hash before and after reading, all page
boxes/rotations, encryption, metadata, reachable resources and fresh Poppler
image/font inventories. [CHECKLIST-CHECKS.json](CHECKLIST-CHECKS.json) contains
all 174 page measurements. [PDFINFO.txt](PDFINFO.txt),
[PDFIMAGES.txt](PDFIMAGES.txt) and [PDFFONTS.txt](PDFFONTS.txt) retain independent
tool output. Their error streams are empty.

Native text was measured using PDFium's tight non-whitespace character bounds
against the relevant **TrimBox** edge: right on even pages, left on odd pages.
There were no invalid visible-character boxes. Page 1 clears 20 mm; pages
4, 6, 96 and 174 contain no native text. The other 169 pages have at least one
character within 20 mm. This is not a count of completely obscured or unreadable
pages, nor an OCR survey of labels contained inside raster illustrations.
Decorative edge artwork and background fills were not treated as essential text.

The [annotated review](Gutter-20mm-Review.jpg) renders actual facing spreads
24–25 and 98–99 at 144 dpi with a separate orange 20 mm inspection band. The
nearest native lettering measures 17.19, 16.95, 17.63 and 16.94 mm respectively.
Visual inspection confirms that headings/body copy as well as folios enter the
band; it is not solely a decorative-background measurement. Only the review
image has an overlay. The source supplier PDF remains byte-identical.

The previous [all-page rendering and pixel/text checks](../all-300dpi-retry/CHECKS.json)
still apply to this exact hash. No new full-book export, font conversion,
upload, account action or purchase occurred during the audit.

## Current decision

The audited file did not pass the full checklist because of its 17 mm gutter. The later [combined diagnostic](../gutter-outline-retry/README.md) addresses the gutter and font representation under John’s explicit instruction. Preserve the distinction between these local checks, independent PDF/X certification and supplier acceptance; the approved generator layout remains unchanged.
