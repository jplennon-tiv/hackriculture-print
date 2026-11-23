# Header bleed correction — 23 November 2026

John reported repeated leaves and notched header circles in the production PDF, then confirmed the repair should cover **all 88 vegetable-guide pages and all 47 Troubles pages**. John has [accepted the corrected proofs](APPROVAL.json). This corrected 174-page file remains the approved native-lettering source; the selected restored-quality derivative is now supplier Approved. Final metadata is deferred for this preview. This is a print-edge repair: the approved enlarged illustration style, original lower crops, circle/banner positions and body layout remain.

## Current files

| File | Use |
| --- | --- |
| [Vegetable-Guru-Interior-Corrected-Headers.pdf](../../../output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Corrected-Headers.pdf) | Preserved production-colour source: 174 pages, 185 × 240 mm trim, 3 mm bleed. The supplier uses the restored-quality derivative linked below. |
| [Vegetable-Guru-Corrected-Header-Checks.pdf](../../../output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Corrected-Header-Checks.pdf) | Three exact pages from the corrected file: French Bean practical page 19, Beetroot 24, Bean and Pea Troubles 98, matching the reported examples. No diagnostic lines are printed. |

**Supplier outcome:** the [selected original-margin restored-quality derivative](../bookvault-second-proof-2026-11-22/interior/quality-restored-option1/README.md) is saved Approved, observed 23 November at 20:22:54 UTC; the unchanged cover is Approved too. It preserves this header repair, restores SemiBold and fine artwork, and uses genuine vector outlines in the printer copy. Completed isolation tests implicate font representation rather than gutter width; no individual font is proven defective. John reviewed the selected file and will place the proof order himself. No upload is pending. The [local PDF cleanup](../../maintenance/pdf-cleanup-2026-11-23/README.md) removed obsolete diagnostics while preserving this source and its approved checks. [Account record](../bookvault-second-proof-2026-11-22/ACCOUNT-UPLOAD-2026-11-23.json).

The [production-colour cover](../../../output/pdf/bookvault-second-proof-2026-11-22/cover/Vegetable-Guru-Second-Proof-Cover-CMYK.pdf) is unchanged. The approved reading master, original artwork and previous production PDF are preserved. This header repair did not change canonical gardening data or the account. The subsequent [account/upload handoff](../bookvault-second-proof-2026-11-22/ACCOUNT-UPLOAD-2026-11-23.json) records the authorised 174-page account update and current upload state.

## Cause and repair

The earlier preparation reflected pixels from inside the page into the added bleed. This created extra fragments above small illustrations and reversed the outlines of larger artwork/circles at the top and right. It also reflected a 0.2 mm strip inside trim to hide inherited page-background rounding slivers.

- On the 44 practical pages, odd folios 9–95, the true top boundary is plain paper. An exact match to each page's existing CMYK background removes the reflected leaves only in the 3 mm top bleed. Their right header bleed was separately checked and is already plain background.
- On the 44 opening guide pages, even folios 8–94, and all 47 Troubles pages, 98–144, the retained native paths and original artwork provide genuine outward continuation. Only the page/form bounds, top/right clip limits and full-page background fills are extended in the derivation. All image transforms and the approved header's bottom/left clipping stay fixed.
- Narrow 600 dpi CMYK strips replace the top/right bleed and the previous synthetic 0.2 mm edge band. Extending the original background fills also removes the inherited white seam. Every original production image stream, native lettering and embedded colour profile remains intact beneath this bounded repair.

The same explicit sRGB → ISO Coated v2 300% / FOGRA39, relative-colourimetric recipe is used for the added strips. All five photographic shadow corrections, matched section-opener creams, fonts, folios and previous interior fixes remain. The initial question about changing header composition was based on a mistaken interpretation of the captures; no redesign choice is pending.

## Verification

[Installation checks](production/INSTALL-CHECKS.json) confirm all 174 original page-content streams and CMYK image streams are preserved, with page geometry and the output intent unchanged. All 39 pages outside this correction retain their exact original page contents.

[Actual PDF render checks](production/RENDER-CHECKS.json) cover every one of the 135 corrected pages at 254 dpi and identical pixel origins. There are **zero changed pixels beyond the 0.3 mm verification guard around the repaired top/right edge**, and all 44 practical pages have zero changes anywhere inside trim. The 91 repaired right backgrounds match the adjacent page colour exactly, including the first bleed column. All 174 embedded font programs and character maps are identical. Changes within trim on the other pages are confined to the earlier synthetic 0.2 mm edge band.

All 88 guide headers and all 47 Troubles headers are inspected from final-PDF contact sheets; [visual review](production/VISUAL-REVIEW.json) records the coverage. These are technical and visual checks, not physical-print or supplier approval.

Preserved corrected source: **805,528,443 bytes**; SHA-256 `dc7d056fbb9bc7f8380d516b27624a049ec2ed85547508e668b9202631e5483c`.

Three-page check: **9,561,945 bytes**; SHA-256 `9b898fef88573ef0dad5ffb131a22d8b7d4b861208904e344a71fa55089478e2`.

## Reproduction and next step

Use the preserved original production PDF identified by [the installation receipt](production/INSTALL-CHECKS.json), the exact [v3 outward overlays and derivation manifest](bleed/native-outward-rollout-v3/MANIFEST.json), and [the practical-page colour map](bleed/PRACTICAL-CMYK-BACKGROUNDS.json). `production/install-bleed-repairs.py` installs those overlays; `production/verify-bleed-repairs.py` checks actual PDFs and creates the three-page review. The [source derivation script](bleed/native-outward-bleed.py) reconstructs outward strips without moving original artwork. Do not rerun the historical mirrored-bleed preparation alone and treat it as the current final interior.

The initial/v1/v2 checks and samples are diagnostic checkpoints. Use **v3** for the outward overlays and the corrected full file above for further preparation. The metadata deferral and current account/template, upload, barcode/end-page and supplier-proof status are in [the second-proof record](../bookvault-second-proof-2026-11-22/README.md).
