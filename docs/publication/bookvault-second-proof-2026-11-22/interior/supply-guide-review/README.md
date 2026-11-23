# File-supply guide investigation — 23 November 2026

John instructed us to continue diagnosing locally rather than wait for developer/support logs. This replaced the previous support-diagnostic prerequisite. The original investigation reviewed Bookvault’s 23-page guide, relevant current help articles and the actual accepted/failed PDF structures. Its proposed image-payload test has now been completed in the [smaller-file retry](../image-payload-retry/README.md).

## Completed image-payload test

John approved a separate, smaller PDF/X-3 candidate. It reduces selected full-colour artwork from 600 to 300 dpi while preserving native text, the exact CMYK profile, approved layout, pagination and corrected bleed. The fine-art pages remain at 600 dpi. All local checks and focused visual comparisons passed. The exact 197,344,337-byte file was uploaded once and also **Failed**, logged 23 November 15:42. Original sources remain intact; see [method and result](../image-payload-retry/README.md).

**Current conclusion:** reducing the compressed file below 200 MB did not resolve rejection, so a simple 500 MB threshold is insufficient. The subsequent authorised [genuine PDF/X-1a test](../pdfx1a-retry/README.md) also failed, logged 23 November 16:00, but exposed **Font Embedding — 1 key font was unembedded ('Unknown')**. Size, Page Count and File Health passed. Local checks report all fonts embedded/self-contained; unnamed Type3 handling is now a focused hypothesis, not a proven cause. John then requested font identification and removing the two-fraction fallback. Follow the [font comparison and completed cleanup](../font-inventory/README.md) for the current candidate: its single upload is now confirmed Failed at 23 November 16:40. The subsequent [authorised Bold test](../semibold-retry/README.md) replaces SemiBold on three opening pages and has been uploaded once; it also Failed. John subsequently requested the [all-300-dpi test](../all-300dpi-retry/README.md), including the 47 fine-art pages and bleed strips retained at 600 dpi in the first image test. Blanket outlining is deferred.

| Exact file | Decimal MB | MiB | Supplier result |
| --- | ---: | ---: | --- |
| First accepted interior | 463.95 | 442.45 | Approved |
| Corrected second interior | 805.53 | 768.21 | Failed |
| Lossless compatibility retry | 662.85 | 632.14 | Failed |
| Repaired PDF/X-3 retry | 545.97 | 520.67 | Failed |
| Optimised PDF/X-3 retry | 197.34 | 188.20 | Failed |
| PDF/X-1a retry | 206.41 | 196.84 | Failed — Font Embedding (Unknown) |

At the time of the guide review, the 545.97 MB PDF/X-3 file contained 541,792,049 encoded image bytes (99.24% of the file), making image reduction the strongest size test. All three then-failed interiors exceeded 500 MB and the accepted file was smaller. The subsequent 197.34 MB failure disproves that simple threshold as a sufficient explanation.

## What the sources establish

The [PDF guide](https://20439106.fs1.hubspotusercontent-na1.net/hubfs/20439106/Guide%20To%20PDFs%20-%20Digital%20Version%20.pdf), printed pages 2/4/8–10, specifies single portrait pages, embedded fonts, flattened transparency, no passwords or crop marks, 3 mm bleed, FOGRA-based CMYK and 300 dpi colour photographs. It distinguishes 600–1200 dpi one-bit line art. Our 600 dpi composites are full-colour images, with native text separate.

The guide's page 4 names PDF/A or PDF/X-1a, whereas the [current format FAQ](https://help.bookvault.app/what-format-do-my-files-need-to-be-in) explicitly accepts both PDF/X-1a:2001 and PDF/X-3:2002. Therefore PDF/X-3 is not itself contrary to their current guidance. The completed PDF/X-1a test is recorded above; changing the standard alone did not resolve rejection.

The [current image FAQ](https://help.bookvault.app/what-dpi-should-my-images-be) recommends 300 dpi at final printed size and warns against unnecessary file growth in image-heavy books. The [upload FAQ](https://help.bookvault.app/how-do-i-upload-change-files) still requires one complete interior file, not separately uploaded sections.

The guide contains older/inconsistent material, including 2023 future wording. Its universal 12-page padding advice is qualified by the [current barcode FAQ](https://help.bookvault.app/blank-page-and-barcode): larger books use a four-page cycle. This concerns extra production blanks, not a requirement to redesign our approved 174-page interior. Its 20 mm gutter recommendation differs from our approved 17 mm working layout. The later [full checklist audit](../checklist-audit/README.md), requested by John before any outline test, measures native lettering inside the 20 mm zone on 169 of 170 text-bearing pages. This is an unresolved checklist discrepancy, not evidence that it caused the upload failure; no layout change is approved.

The [current validation-time FAQ](https://help.bookvault.app/how-long-does-it-takes-to-validate-a-file) says Pending means the file has not successfully saved, not proof that validation is still running. The latest attempt nevertheless has a verified terminal Failed result, so there is nothing to keep polling.

## Actual file comparison

[inspect-structure.py](inspect-structure.py) and [STRUCTURE-COMPARISON.json](STRUCTURE-COMPARISON.json) compare the accepted first interior, corrected second interior and PDF/X-3 retry:

- All use PDF 1.3, unencrypted, unrotated portrait pages. Original/accepted media is 191 × 246 mm with 185 × 240 mm trim and 3 mm offsets. PDF/X has only about 0.001 mm coordinate rounding, already quantified in its checks. Both prior failures have exact unrounded dimensions, so this rounding cannot explain all three failures.
- No optional-content layers, soft masks or inspected interactive features were found. Existing PDF/X checks separately establish embedded/self-contained fonts, opaque artwork and the exact FOGRA39 output intent.
- The accepted file contains 1,598 Type 3 font resources, versus 922 in the PDF/X retry. Their mere presence cannot explain a blanket incompatibility; this does not prove every specific font program is faultless.
- The largest image in both is 4,512 × 5,812 pixels, 8-bit CMYK: about 104.9 MB decoded. Total unique decoded image estimates are 17.62 GB in the accepted file and 18.10 GB in PDF/X, not simultaneous-memory measurements.
- The accepted file has 168 image resources, versus 274 in the PDF/X retry. The extra corrected bleed fragments may increase complexity, although the current image count alone is not a confirmed defect.

No independent certified PDF/X validator has been run. Prior local conversion, rendering and focused visual checks remain valid evidence, not supplier approval. The [account record](../../ACCOUNT-UPLOAD-2026-11-23.json) retains all exact upload identities and failures.
