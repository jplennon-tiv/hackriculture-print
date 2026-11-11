# Vegetable variety additions — review set

10 November 2026. **Approved by John in both editions.** [Exact approval](APPROVAL.json). [Open the whole set](REVIEW.html). The approved Jerusalem Artichoke addition is included unchanged at the start, making thirteen spreads / 26 pages per edition. Its [approval](../sowing-rollout/revisions/artichoke_jerusalem_varieties/APPROVAL.json) is separate.

John requested the remaining shortlist as a batch. Fourteen new entries are appended across twelve guides; original descriptions remain verbatim. Carrot, Endive and Florence Fennel use the approved four-across panels. Five-entry panels use three above and two below; six-entry panels use two rows of three. The marginal candidates and optional Spinach suggestion remain untouched.

| Guide | Folios | Added | Arrangement | P1 footer gap, imperial / metric mm |
| --- | --- | --- | --- | --- |
| Aubergine | 16–17 | Black Beauty, Rosa Bianca | two-by-three | 7.22 / 7.22 |
| Beet, Leaf | 24–25 | Lucullus, White Silver 2 | two-by-three | 6.62 / 6.62 |
| Beetroot | 26–27 | Red Ace F1 | two-by-three | 6.07 / 6.07 |
| Capsicum | 34–35 | Gypsy F1 | two-by-three | 7.48 / 7.48 |
| Carrot | 36–37 | Amsterdam Forcing | four-across | 6.24 / 6.24 |
| Cucumber, Greenhouse | 48–49 | Pepinex F1 | balanced-five | 10.38 / 10.38 |
| Endive | 52–53 | Bubikopf | four-across | 4.44 / 4.44 |
| Florence Fennel | 54–55 | Finale | four-across | 8.06 / 8.06 |
| Garlic | 56–57 | Spanish Roja | balanced-five | 6.57 / 6.57 |
| Lettuce | 64–65 | Webb’s Wonderful | two-by-three | 10.56 / 10.56 |
| Oriental Leaves | 70–71 | Shungiku | two-by-three | 6.92 / 6.92 |
| Turnip | 96–97 | Snowball | balanced-five | 6.25 / 6.25 |

## Evidence and preservation

- [Book-only specification](../../../src/print/book/variety-additions.json) binds the exact master objects and approved sources. No canonical writes, changed ranks, new main-book assembly or global renderer/style changes.
- [Research and selection notes](SOURCES.md): two genuine named chards; Shungiku selected as a distinct crop already covered in the guide; Spanish Roja availability qualified because a current UK planting-stock supplier was not established.
- [DOM/preservation checks](CHECKS.json) verify all 24 revised HTML proofs: original page-one content outside varieties, original variety HTML, entire practical page and every image path remain exact. Fonts and images loaded; no opening overflows.
- [PDF checks](PDF-CHECKS.json) verify each added entry at its actual PDF coordinates, two pages, 185 × 240 mm, retained book folios and all existing external book destinations. The practical page is copied from its approved PDF: page content bytes, extracted text and rendered pixels match in every edition. Link file paths are adjusted for the new folder.
- Both combined review PDFs have 26 pages, thirteen bookmarks and original book-folio labels. [Assembly checks](ASSEMBLY-CHECKS.json) confirm all content streams match the individual proofs. Source artwork is not recompressed. [Reader checks](DELIVERY-CHECKS.json) cover both units and both versions, 52 successful image loads, local links and the exact visual-review coverage. All baseline files are checked by hash before/after the focused build.
- Actual PDF opening contact sheets and affected spreads were inspected in both units against approved sources. John approved the complete set on 10 November. No app tests were needed: this is source-linked HTML/PDF derivation with unchanged application code.

## Reproduce deliberately

From the project root, with Vite available via the normal start route: run this directory's `prepare.mjs` only to intentionally refresh source bindings, then `build.mjs`, then `finish.py` in the bundled Python runtime, then `write-review.mjs`. Build and finish accept crop keys to regenerate only changed proofs. The finish step preserves source P2 PDF objects and assembles this review subset only. The scripts refuse to overwrite an approved batch. Retain this source/check evidence with any later approval; do not overwrite baseline approvals or fold it into the main book without a separate assembly request.
