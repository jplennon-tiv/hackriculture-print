# Updated contents: all current pages

Prepared for John's review on 12 October 2026 after he approved the index.
[Preview both editions](REVIEW.html). This is a three-page contents proposal,
not approval of the new placement order. The subsequent
[whole-book preview](../whole-book-order-preview/REVIEW.html) now assembles this
proposal for an order review before further contents refinement.

The first two pages preserve the approved 7 October composition, family colours,
harvest illustration, guide labels and useful crop-coverage explanation. Only
calculated references and continuation notes change. The third page uses the
same fonts, readable row size, mirrored margins and existing illustration; it
lists every new topic page, the openings and the approved index. Its green
Getting started panel and peach index panel are proposed extensions of the
established contents design. There is no new or replacement artwork.

## Proposed placement

- Title, publication and welcome: 1–3 (design/copy status unchanged).
- Contents: 4–6; illustrated How to use: 7–8; Why Grow Your Own: 9.
- All existing guides and four proposed interstitial blanks: 10–150.
- Growing Techniques: 151–166. Organic leads; plot layouts follow, then the
  four cultivation pages, Greenhouses, Rotation, Compost, Watering and Sowing.
- Approved four-page index: 167–170.

The extra contents page and Why Grow opening add two front pages, preserving
all vegetable verso starts and their facing first two pages. The other twelve
expansion pages and four cultivation pages make sixteen pages at the back.
This preserves the expansion's relative order while inserting cultivation after
plot layout. Why Grow's opening placement and this cultivation insertion remain
proposals. The blank-page policy is carried forward, not newly approved.

[ASSEMBLY-PROPOSAL.json](ASSEMBLY-PROPOSAL.json) binds the calculation to measured,
hash-verified PDFs in both editions. Each added page has its exact approved PDF
and local page identity. [TOPIC-FOLIOS.json](TOPIC-FOLIOS.json) supplies the same
stable identities to the index resolver. Original source PDFs remain unchanged;
the separate whole-book preview now has revised physical folios and a numeric,
clickable index. The 170-page planning total is not a supplier specification,
new cost calculation or resolved spine width.

## Editing and rebuilding

Text is in shared [contents.json](../../../../hackriculture-data/book-layout/contents.json).
The original `pages`, `families` and `troubles` remain compatible with the retained
two-page layout. `expanded` owns the new header, notes, grouped labels and stable
section destinations. Calculated numbers and page order stay in the print project.
AI/app saves use the guarded shared writer; [save receipts](SAVE-RECEIPT.json)
identify exact preceding-byte backups.

With the normal loopback app running, use `npm run book:contents` to rebuild only
these three pages in both editions. Then run `scripts/check-updated-contents.py`
with the bundled PDF Python runtime and inspect the actual PNGs. Do not run the
older `book:entries` command for this expanded preview: it deliberately retains
the prior four-page contents/how-to source composition.

[Checks](CHECKS.json) bind sources, copy, implementation, fit and all 78 references
per edition. [PDF checks](PDF-CHECKS.json) cover both actual three-page PDFs,
113 text regions each, fonts, Bookvault trim and bleed. Visual inspection covers
every contents page and the 4–5 facing spreads, compared with the approved source.
No topic text, source illustrations, canonical gardening data or approved proofs
were altered. Preserve the separate [index approval](../book-index/APPROVAL.json).
