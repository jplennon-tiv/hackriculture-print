# Simple two-page contents

[Review just the contents](REVIEW.html). John requested this correction on
14 October 2026 after rejecting the numbered, three-page contents hierarchy.
John confirmed the two-page structure with simple headings, requested a little
house-style decoration, then accepted the illustrated pages for book integration. Contents and indexes are now explicitly outside
the layout skills’ scope. The [integration decision](INTEGRATION-DECISION.json) records that bounded acceptance.

Both pages have one “Contents” title, plain section titles and page lists.
Section numbers, crop-family and technique subheadings, introductory notes,
and coloured panels are deliberately omitted. The welcome entry is removed at John’s request; all 80 current
navigation destinations remain, in manuscript order. Technique labels now
make sense without a parent heading. Rows remain 10.5 pt; all visible wording,
ordering and design follow the accepted illustrated baseline; folios and the
Why Grow reference follow the agreed opening sequence and new 166-page pagination.

The paired H1/H2 root-and-leaf illustrations now sit beside the matching headers.
H5 seedlings and H6 harvest trug fill the spare space below the second page’s
lists. All four are the existing hero-style redraws, reused verbatim from the
[stock inventory](../../assets/vegetable-guru-stock/README.md); no new artwork was
generated. A short orange rule provides a small shared accent. No extra headings,
text panels or explanatory copy have been introduced.

The [plain two-page reference](references/simple-2026-10-14/imperial-spread-4-5.png)
and both baseline PDFs under `output/pdf/contents-update/references/` are retained.
Artwork placement is maintained in `scripts/lib/book-contents.mjs` and the local
CSS. Exact source paths/hashes and placement status are recorded in [CHECKS.json](CHECKS.json).

The placement plan has blank 3, contents facing at 4–5, blank 6, and
“Introduction — why grow your own” at 7. Blank 8 now faces the approved combined
Vegetable Guides/how-to at 9; both contents destinations point to 9. Troubles and
Techniques retain right-hand starts; crop spreads still begin at 10. The four approved two-page crop layouts reduce the interior to 166 pages; all later references are refreshed. The renamed how-to PDF and the complete imperial preview have now
been rebuilt with this sequence. The current illustrated contents PDF is reused; the accepted 4–5 proofs are
preserved under `references/illustrated-4-5-2026-10-14/` in the PDF and review folders.

Editable copy is in shared [contents.json](../../../../hackriculture-data/book-layout/contents.json)
and [how-to.json](../../../../hackriculture-data/book-layout/how-to.json).
[The earlier guarded save](SIMPLIFICATION-SAVE.json) and [sequence save](SEQUENCE-SAVE.json)
record exact backups. [Introduction title save](INTRODUCTION-TITLE-SAVE.json)
records the label used by both these contents and the opening topic heading.
The earlier sequence save removes only the welcome entry; welcome and
author source documents remain intact.
Stored family/group metadata and the original two-page how-to header remain
for compatibility with earlier renderers. The current contents renderer
flattens those groups. No approved compact or A4 source has been changed.

`npm run book:contents` builds only these two pages per edition and the
[placement plan](ASSEMBLY-PROPOSAL.json) / [topic map](TOPIC-FOLIOS.json).
Run `scripts/check-updated-contents.py` with bundled Python and Poppler, then
inspect the actual page renders. [Build checks](CHECKS.json),
[PDF checks](PDF-CHECKS.json) and [visual review](VISUAL-REVIEW.json) record coverage.
The [whole-book workflow](../whole-book-order-preview/README.md) owns later
reassembly; the latest complete preview includes these contents.
