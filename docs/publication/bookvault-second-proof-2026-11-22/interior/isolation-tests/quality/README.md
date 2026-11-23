# Troubleshooting quality review

23 November 2026. John [endorsed the retention/restoration recommendations](../QUALITY-DECISION.json) and subsequently selected Option 1: original 17 mm inside / 8 mm outside. The follow-on [restored-quality file](../../quality-restored-option1/README.md) is built, locally checked and supplier Approved at 20:22:54 UTC. This report preserves the diagnostic comparison evidence. Supplier isolation results belong to the [isolation record](../README.md).

[Eleven-page comparison PDF](../../../../../../output/pdf/bookvault-isolation-2026-11-23/Vegetable-Guru-Quality-Comparison.pdf). It compares the approved corrected-header CMYK interior with the later all-300-dpi diagnostic. Enlarged crops make small changes visible; they do not predict a physical print exactly. Book folios are used throughout.

## Findings and recommendations

| Change | Evidence | Recommendation |
| --- | --- | --- |
| Approved header repair, matched cream, five photographic shadow corrections and FOGRA39 output profile | Retained in diagnostics; exact output-profile bytes match. Header samples 24/98 retain positions, lettering, title square and angled Troubles badge. | Keep these approved corrections. |
| Two unusual fraction glyphs replaced with ordinary 5/8 | User requested cleanup; meaning and line fit retained. Example page 67. | Keep; carry it into any later production rebuild. |
| Nunito Sans SemiBold replaced with Bold | Page 1 edition line and 81 contents labels on 2–3 became heavier. This substitution alone failed supplier validation. | Restore the approved SemiBold in the proposed final derivative. This diagnostic does not establish that SemiBold is a defective typeface. |
| All remaining raster art reduced to 300 dpi | No missing subject, diagram labels or displaced artwork found. Fine roots/hands, calendar edges, mesh and linework soften on enlargement. No new JPEG compression was introduced; CMYK image resampling used lossless storage. | Preserve the full-resolution master. Prefer the earlier photo-300/fine-art-600 balance, retaining 600 dpi on the 47 fine-art pages, subject to a final supplier test. |
| 99% scale and mirrored 3.4 mm outward shift | Inner text clearance reaches 20.109 mm; minimum outside clearance falls to 5.182 mm. Original is approximately 17 mm inside/8 mm outside. Four blank pages remain unchanged. | Decide binding margins separately from validation. Do not retain the uniform shrink/shift merely as an upload fix. Any alternative layout remains a proposal. |
| Font outlining | Genuine vector glyph curves; no traced/rasterised lettering. All 274 source image resources retain exact dimensions and decoded pixels through either outline conversion. | If required by supplier, use only in the print derivative; keep editable/searchable masters. |

The preserved `Vegetable-Guru-Interior-Nunito-Fractions.pdf` is the source of the selected follow-on derivative: it precedes the Bold and all-300-dpi experiments while retaining the requested fraction cleanup. Its production build and checks are owned by the linked restoration record. No canonical data, approved artworks, generator layout or cover were changed.

## Actual coverage and limits

- All 174 source and diagnostic pages rendered at 120 dpi; all nine comparison contact sheets were visually reviewed. No missing page, main content block or artwork found at that scale.
- Normalised extracted text matches directly on 130 pages. The remaining 44 guide-opening pages reconcile after accounting for duplicated/overprinted title extraction and the reading order of the Core needs scale. Body text matches on all 44. See [text reconciliation](TEXT-RECONCILIATION.json) and [numerical checks](CHECKS.json). This is not fresh editorial proofreading.
- Ten equal-scale details inspected at 300 dpi: pages 2, 7, 24, 25, 67, 98, 146, 154, 162 and 167. The comparison PDF contains those examples. Surrounding content may be intentionally cropped; header titles and badges remain complete in the final comparison crops.
- An apparent banner clipping on the small page-131 contact view was investigated at 180 dpi against the source. Both show the full identical banner; no actual clipping was found.
- Original-gutter outlined and font-preserving controls separately passed local page count, exact page-box/profile, image-pixel, rendering and parser checks; detailed coverage is recorded in their own check files. Local checks are not certified ISO PDF/X validation.
- Source versus diagnostic box rounding differs by at most 0.002835 pt (0.001 mm). The original-gutter controls retain their source boxes exactly. Output colour-profile equality does not guarantee physical-print colour equivalence.

Scripts and individual crops are retained alongside the checks. [Visual review record](VISUAL-REVIEW.json).
