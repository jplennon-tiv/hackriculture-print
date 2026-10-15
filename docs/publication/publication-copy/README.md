# Publication and back-cover copy

Approved by John on 15 October 2026 and now integrated in the [complete book](../whole-book-order-preview/REVIEW.html?revision=integrated-two-page). [Retained wording review](REVIEW.html).
This is an editorial review, not a new cover design or a print-layout proof.

The editable owners are `../hackriculture-data/book-layout/publication.json` and
`covers.json`, accessed from the print project root. [SAVE-RECEIPT.json](SAVE-RECEIPT.json)
records the guarded two-document transaction, exact-byte backups and source basis.
Other book documents, canonical gardening records and cover artwork are unchanged.

The publication draft replaces all four prose placeholders. It includes a text
copyright notice that preserves uses permitted by law, a factual AI-assisted
illustration/design credit, a source note in place of invented acknowledgements,
and a practical UK timing note. The copyright year, imprint, ISBN, edition and
publication year still need John’s details. No publication date or rights in
third-party material have been invented. Copyright references:
[UK overview](https://www.gov.uk/copyright) and
[exceptions](https://www.gov.uk/guidance/exceptions-to-copyright).

The 78-word back-cover draft introduces all three parts of the book. The approved
count wording, £17.50 working price, reserved barcode panel and preferred B5 art
are retained. The original B5 reference remains intact. A [recorded image edit](integration/ARTWORK.json)
clears its placeholder paragraph in a separate derivative; approved native text is
placed over that background. [Integration checks](integration/CHECKS.json) record
its source hashes and measured copy area. The title/count, collage, price and
barcode reservation remain. Final exact page crops, remaining editable lettering
and production wrap remain separate work.

The publication page now includes all approved prose, preserving missing metadata.
The current full viewer and PDF include this wording and all four approved two-page
vegetable layouts, with the approved heading highlights removed.

`node scripts/check-book-content.mjs` validates the current shared copy.
`node scripts/review-publication-copy.mjs` refreshes this editorial viewer directly
from that copy; it neither edits shared JSON nor generates book pages. Browser
checks are recorded in [CHECKS.json](CHECKS.json). Before a subsequent full-book
build, the existing book-revision guards require refreshing the affected opening
proofs and the contents/guide-key receipts. Do not bypass the guards or overwrite
frozen references. No whole-book regeneration is needed merely to review wording.

The wording is approved; the combined rendered placement is available in the current full preview. This does not imply final production approval.
