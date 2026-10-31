# Current two-page contents

[Review the contents](REVIEW.html), integrated at facing pages **4–5** in the
[current full book](../whole-book-order-preview/REVIEW.html).
The approved simple headings, chronological lists, H1/H2 header art and H5/H6 lower
illustrations remain. No section numbers, family/topic subheadings or panels.
Contents and index pages remain outside the layout-review skills' scope.

The 30 October update adds the approved Netting and Supports sections and
alphabetises the vegetable list to match the complete guides. All
**83 destinations** appear once. Rows remain **10.5 pt** and all four drawings
are retained. The lower illustrations use a 34 mm band (45 × 33.75 mm images),
with a 3 mm upper gap, to accommodate the two new rows. The original sources
remain unchanged. The current interior is **172 pages** and the index begins
at **168**. Both unit proofs share these folios. Blank 8 faces the combined
Guides/how-to at 9; both contents routes point there.

Editable labels live in shared [contents.json](../../../../hackriculture-data/book-layout/contents.json).
Groups remain metadata and are preserved; the current renderer follows the
assembly’s alphabetical vegetable order in a flat list. Stable destinations
are resolved by [ASSEMBLY-PROPOSAL.json](ASSEMBLY-PROPOSAL.json) and
[TOPIC-FOLIOS.json](TOPIC-FOLIOS.json). The historical filename “proposal” now holds
the approved current placement map. The [guarded save](../whole-book-order-preview/integration-2026-10-30/BOOK-COPY-UPDATE.json)
records exact previous bytes. The earlier plain/illustrated proofs remain frozen
in `references/`; old folios in them are source provenance.

`npm run book:contents` builds these two pages in both units and the current plan.
Use bundled Python/Poppler for `scripts/check-updated-contents.py`, then inspect
its renders. [Build checks](CHECKS.json), [PDF checks](PDF-CHECKS.json) and
[visual review](VISUAL-REVIEW.json) identify coverage. `npm run book:preview`
performs the complete integration; it does not regenerate the guide catalogue.
