# Publication and back-cover copy

Drafted at John's request on 15 October 2026. [Read the proposed wording](REVIEW.html).
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
are retained. The B5 reference still contains raster placeholder lettering;
the new copy has not been overpainted into it. Final placement belongs with its
editable cover reconstruction, retaining the left blurb/right torn-page collage.

John approved the flowing technique headings before this work. The exact proof
and its evidence are preserved in the [approval reference](../whole-book-order-preview/references/technique-headings-approved-2026-10-15/APPROVAL.json).
Their highlights are marked for removal in the next book-preview pass.
The full book PDF remains that reviewed version. It does not yet contain this
new publication/back-cover wording.

`node scripts/check-book-content.mjs` validates the current shared copy.
`node scripts/review-publication-copy.mjs` refreshes this editorial viewer directly
from that copy; it neither edits shared JSON nor generates book pages. Browser
checks are recorded in [CHECKS.json](CHECKS.json). Before a subsequent full-book
build, the existing book-revision guards require refreshing the affected opening
proofs and the contents/guide-key receipts. Do not bypass the guards or overwrite
frozen references. No whole-book regeneration is needed merely to review wording.

New wording remains for John's review; the heading approval does not approve it.
