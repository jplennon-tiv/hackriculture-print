# Carrot redraft · 4 November 2026

John approved both editions on 4 November. The [approval record](APPROVAL.json) identifies the exact reviewed pages. The following build notes describe their preparation.

The [review](REVIEW.html) shows a two-page spread in both units. This is a carrot-only working proof against the [previous three-page sample](../conventional/REVIEW.html#carrot). The current book places carrot on folios 36–37.

John supplied the two new planting paragraphs and the shorter Extended season text. His wording is reproduced in the imperial proof, with the source-paired dimensions in the metric proof. The calendar reads **SOW**. Quick facts and the planting method use **Sow**. The snowflake comes from the existing winter season artwork. The first care instruction restores the substance of the original care bullet and gives the final spacing explicitly. The sowing panel retains the three-picture sequence. The centre and right images move down by 2.88 mm and 0.16 mm to line up the soil surfaces at their edges. The captions stay level. The [guidance for subsequent crops](../CROP-EDITING-NOTES.md) distinguishes the general editorial decisions from carrot's dates and protection needs.

The planting body falls from 109 words to 65 in imperial. Two equal columns of 77.6 mm give the spread its original reading order. Short bold lead-ins keep the two instructions separate at 9 pt. The title now has 3 mm above it and 6.1 mm below it. The folios and three footer references match the current book on pages 36–37. In both standalone PDFs the references open the corresponding pages of the main book via relative PDF links.

With the new header and normal section spacing, the full table overlapped the footer by 6.18 mm. Removing Violet root rot left 1.28 mm of overlap. Removing Green top gave 3.62 mm clearance and stopped the cut at eight entries. Both editions gave the same measurements. Both rendered spreads were inspected, and all three PDF destinations were checked against the links in the current book.

[Layout measurements](CHECKS.json) · [PDF checks](PDF-CHECKS.json) · [Current copy and layout](../../../../src/print/book/sowing-planting-mockups/carrot-revision.mjs).

For reproduction, start the local project server and run `node scripts/build-carrot-sowing-revision.mjs`, then run this folder's `finish_review.py` with the PDF-capable bundled Python. The builder uses the two saved conventional carrot HTML proofs. The final check verifies the trim and page count and reads the changed text back from its position in each PDF.
