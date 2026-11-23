# Bookvault isolation tests and quality review

**Completed and superseded:** the [restored-quality original-margin file](../quality-restored-option1/README.md) is now supplier Approved and reviewed by John, who will order himself. The [local cleanup](../../../../maintenance/pdf-cleanup-2026-11-23/README.md) retired the two original-gutter diagnostic PDFs and raw converter outputs. The original Gutter20-Outlined accepted fallback, source masters, comparison report, test results and recipes remain; the account-state section below is the historical isolation-test result, not a request to restore that control again.

23 November 2026. John requested controlled tests to identify the rejection and a review of quality regressions, then confirmed the plan. **The tests isolate font representation as the operative difference. The wider gutter is neither necessary nor sufficient for acceptance.** The individual failing font or supplier validation defect remains unidentified.

## Controlled results

All files contain the same 174-page book. Cover, title specification and account are unchanged. Each test was uploaded once and observed to a terminal result before the next one.

| Interior control | Saved result | Evidence |
| --- | --- | --- |
| 20 mm gutter + genuine vector font outlines | Approved, initially confirmed 19:22 | [Initial accepted control](../gutter-outline-retry/SUPPLIER-ACCEPTANCE.json) |
| Same 20 mm gutter, live fonts | Failed, confirmed 19:32:45 | [First result](GUTTER20-NATIVE-RESULT.json) |
| Original margins + same outline conversion | Approved, confirmed 19:43:50 | [Second result](ORIGINAL-OUTLINE-RESULT.json) |
| Original margins + same Ghostscript rewrite retaining live fonts | Failed, confirmed 19:54:02 | [Matched final control](ORIGINAL-GS-NATIVE-RESULT.json) |

The last two use the same all-300-dpi input, original geometry and converter parameters, differing in `NoOutputFonts` (true versus false). Rewriting the PDF while retaining live fonts did not resolve the rejection. Converting glyphs to vector outlines did. This supports a font-representation/validator incompatibility; it does not prove that a named font family is defective, nor identify the supplier's exact internal check. A successful old PDF also contains Type 3 fonts, so their mere presence is not a sufficient explanation.

Both outline controls preserve the exact decoded pixels and dimensions of all 274 image resources, the source page boxes and the output profile. Every page rendered locally; detailed checks are retained for the [original-margin outline control](original-gutter-checks/CHECKS.json) and [font-preserving control](original-gs-native-checks/CHECKS.json). Outlined lettering remains vector artwork, not raster-traced text. Editable/searchable masters remain intact.

## Account state and next decision

The exact initial accepted `Vegetable-Guru-Interior-Gutter20-Outlined.pdf` is restored and **Approved**, confirmed **20:02:29 UTC** (upload logged 19:56). [Restoration receipt](RESTORATION-RESULT.json). No transfer remains active. This restoration does not choose the final design or order a proof.

The [quality review](quality/README.md) and [11-page comparison PDF](../../../../../output/pdf/bookvault-isolation-2026-11-23/Vegetable-Guru-Quality-Comparison.pdf) are complete. Keep approved header/colour corrections and the requested fraction cleanup. Recommend restoring the approved SemiBold and higher-resolution fine art in a subsequent checked derivative. Decide margins as a binding/design choice, not as a validation workaround. John has now [endorsed these restoration recommendations](QUALITY-DECISION.json). John subsequently selected Option 1: original 17/8 mm margins. The [restored-quality derivative](../quality-restored-option1/README.md) now owns active production work.

The [gutter options](GUTTER-OPTIONS.md) are retained as decision evidence; Option 1 is selected. Prepare and validate the selected quality-restored derivative, then complete the supplier virtual-proof/end-page checks. No new title, support message, proof-responsibility acceptance, order or payment was made. The unchanged cover retains its earlier supplier approval. [Account record](../../ACCOUNT-UPLOAD-2026-11-23.json).

## The 168-page email

The email sent at **14:31 today** reports expected 174 / supplied 168. The old October interior has 168 pages; all present-day diagnostic candidates have 174. Bookvault logged revalidation of the old stored file at 12:02 after the specification change. That is a plausible match, but the email has no filename or upload-event identifier, so the connection is unconfirmed. The phrase “too large” is inconsistent with the numbers and should not be treated as the diagnosis. This email does not explain the later matched font-control results. [Focused email and page-count evidence](PAGE-COUNT-EMAIL.json).

[Authorisation and test plan](PLAN.json) · [Quality coverage and limits](quality/VISUAL-REVIEW.json). All source artwork, original PDFs, full-resolution production master and accepted controls are preserved.
