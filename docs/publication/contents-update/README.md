# Updated contents: all current pages

Updated 14 October 2026 after John requested the new section order.
[Preview both editions](REVIEW.html). This is a three-page contents proposal,
with its design still for review. The
[whole-book preview](../whole-book-order-preview/REVIEW.html) now assembles this
requested order before further contents refinement.

The first two pages preserve the approved 7 October composition, family colours,
harvest illustration, guide labels and useful crop-coverage explanation. Only
calculated references and continuation notes change. The third page uses the
same fonts, readable row size, mirrored margins and existing illustration; it
lists every new topic page, the openings and the approved index. Its green
Getting started panel and peach index panel are proposed extensions of the
established contents design. There is no new or replacement artwork.

## Current placement

- Title, publication and welcome: 1–3; contents: 4–6; Why Grow Your Own: 7.
- Vegetable Varieties opener: 9; How to use: 10–11; vegetable guides: 12–107.
- Vegetable Troubles opener: 109; Troubles guides: 110–154.
- Growing Techniques opener: 155; the sixteen technique pages: 156–171.
- Four-page index: 172–175; end balancing blank: 176.

Blank versos at 8 and 108 face the first two new openers. The existing crop blanks
move to 19, 73, 91 and 95. How to use, Beds, Digging and Compost are now facing
pairs. The 14 October order follows John’s instruction; new opener composition
and copy remain proposals. Their three contents links join the Getting started
panel without reducing the established reading type.

[ASSEMBLY-PROPOSAL.json](ASSEMBLY-PROPOSAL.json) binds the calculation to measured,
hash-verified PDFs in both editions. Each approved topic has its exact source PDF and local page identity; new
section openers have separate stable identities and editable book copy. [TOPIC-FOLIOS.json](TOPIC-FOLIOS.json) supplies the same
stable identities to the index resolver. Original source PDFs remain unchanged;
the separate whole-book preview now has revised physical folios and a numeric,
clickable index. The 176-page preview total is not a supplier specification,
new cost calculation or resolved spine width.

## Editing and rebuilding

Text is in shared [contents.json](../../../../hackriculture-data/book-layout/contents.json).
The original `pages`, `families` and `troubles` remain compatible with the retained
two-page layout. `expanded` owns the new header, notes, grouped labels and stable
section destinations. Calculated numbers and page order stay in the print project.
AI/app saves use the guarded shared writer; [save receipts](SAVE-RECEIPT.json)
identify exact preceding-byte backups. The 14 October opener links and watering-title
correction use the [new save receipt](../whole-book-order-preview/SECTION-OPENERS-SAVE.json).

With the normal loopback app running, use `npm run book:contents` to rebuild only
these three pages in both editions. Then run `scripts/check-updated-contents.py`
with the bundled PDF Python runtime and inspect the actual PNGs. Do not run the
older `book:entries` command for this expanded preview: it deliberately retains
the prior four-page contents/how-to source composition.

[Checks](CHECKS.json) bind sources, copy, implementation, fit and all 81 references
per edition. [PDF checks](PDF-CHECKS.json) cover both actual three-page PDFs,
116 text regions each, fonts, Bookvault trim and bleed. Visual inspection covers
every contents page and the 4–5 facing spreads, compared with the approved source.
No topic text, source illustrations, canonical gardening data or approved proofs
were altered. Preserve the separate [index approval](../book-index/APPROVAL.json).
