# Local PDF cleanup — 23 November 2026

Completed at John's request after he reviewed the selected second-proof file. **38 obsolete PDFs removed, totalling 8,618,495,658 bytes (8.62 GB).** No Bookvault account action, order or payment was performed. John said he will place the proof order himself; his order confirmation has not yet been recorded.

This is a completed cleanup, not a reusable deletion plan. The [manifest](MANIFEST.json) is consumed. The [deletion journal](DELETION-JOURNAL.json) records each removed file and its SHA-256; [verification](COMPLETION.json) records preservation checks. Historical conversion, upload and diagnostic receipts retain their original paths and hashes as evidence, even where the disposable PDF has been retired.

## Removed files

| Group | PDFs | Bytes removed |
| --- | ---: | ---: |
| Failed supplier/font/resolution diagnostics, including the Bold review | 8 | 2,162,044,330 |
| Completed original-gutter isolation controls | 2 | 416,339,141 |
| Temporary font/PDF-X experiments | 11 | 2,248,363,550 |
| Rebuildable colour-conversion PDF intermediates and tests | 12 | 2,636,802,263 |
| Raw converter outputs superseded by checked final files | 5 | 1,154,946,374 |
| **Total** | **38** | **8,618,495,658** |

The project contained 1,323 PDFs totalling 36.90 GB before cleanup. **1,285 PDFs totalling 28.28 GB remain.** Many are approved individual guide proofs, source components and assembly checkpoints; age or location in `output/` or `tmp/` does not make them disposable. These totals cover PDF file sizes within this repository, not total project storage or filesystem snapshot usage.

## Preserved files

| File or collection | Why retained |
| --- | --- |
| [Vegetable-Guru-Interior-Original-Margins.pdf](../../../output/pdf/bookvault-quality-restored-2026-11-23/Vegetable-Guru-Interior-Original-Margins.pdf) | Current supplier-approved interior: 174 pages, original 17/8 mm margins, approved SemiBold appearance in vector outlines, restored fine artwork. |
| [Vegetable-Guru-Restored-Quality-Checks.pdf](../../../output/pdf/bookvault-quality-restored-2026-11-23/Vegetable-Guru-Restored-Quality-Checks.pdf) | Convenient review of twelve exact pages from the selected file. |
| [Vegetable-Guru-Second-Proof-Cover-CMYK.pdf](../../../output/pdf/bookvault-second-proof-2026-11-22/cover/Vegetable-Guru-Second-Proof-Cover-CMYK.pdf) | Unchanged supplier-approved cover. All editable cover masters, component artwork, font curves, recipes and recovery packages remain. |
| [Vegetable-Guru-Interior-Nunito-Fractions.pdf](../../../output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Nunito-Fractions.pdf) | Exact native-lettering input for the current printer build and verification. |
| [Vegetable-Guru-Interior-Corrected-Headers.pdf](../../../output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Corrected-Headers.pdf) | Approved full-resolution header-corrected source. Header overlays and component checks remain. |
| [Vegetable-Guru-Interior-Gutter20-Outlined.pdf](../../../output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Gutter20-Outlined.pdf) | One previous supplier-accepted fallback, with its review and acceptance evidence. |
| [Whole-book assembly records](../../publication/whole-book-order-preview/README.md) | Reading/native books, frozen plans, input PDFs and approved installation checkpoints. All `tmp/pdfs/whole-book-order-preview/` inputs remain. |
| [First physical-proof files](../../publication/bookvault-print-ready/README.md) | Exact first-proof interior and cover, retained for comparison. |
| Approved component proofs and original artwork | No approved source PDFs or original camera material removed. The older imperial Bookvault artwork PDF remains an assembly input. |
| Colour source and final baselines | Native preparation and final colour-managed PDFs, RGB artwork inputs, masks, ICC profiles, scripts and check receipts remain. |

The current interior remains SHA-256 `3a71d0011d7d12f29a13ce35f94f0068b5e3cc798d24a68a5a4d6cf07903fb59`; the current cover remains `a37c9d4216c14643bd7bb46c9fd066bf12fe400a6301365e01b997a8e0821a8e`.

## Checks and documentation

- Cross-checked candidates against 114 approval records and the current build inputs. No approval-reference collisions were found.
- Rechecked every candidate's size, modification time and SHA-256 immediately before deletion; none was open according to `lsof`.
- Removed only the 38 explicitly listed PDF files. No directory deletion, Git operation, source-code/data edit, sibling-project cleanup or non-PDF asset removal occurred.
- Confirmed all 1,285 other PDFs still exist with unchanged sizes and modification times. SHA-256 checks also confirmed all 26 explicitly protected files, including frozen JSON inputs, are unchanged.
- Read the current printer PDFs successfully: 174 interior pages and one complete cover wrap.
- Retired 15 Markdown links to removed PDFs; [link changes](LINK-RETIREMENT.json) and [document edits](DOCUMENT-EDITS.json) are recorded. Current handovers identify John's order handoff and the selected production file.

No book regeneration, artwork rendering or application tests were needed for this file cleanup. Existing visual and supplier checks remain applicable because the retained PDFs are unchanged.

## Reproduction boundary

The selected printer build still has its exact source PDF, converter definition, profile, scripts and final checks. Its deleted `raw-outlined.pdf` is a generated intermediate, not a source. Preserve the current final file rather than rerunning its historical build in place.

Old font/PDF-X experiments and intermediate colour steps may require rebuilding preceding disposable files before they can be repeated. Their recipes, inputs and receipts remain; rebuild into a separate working directory only if a new investigation calls for it. Missing historical intermediate PDFs do not justify repeating completed supplier tests or regenerating approved pages.
