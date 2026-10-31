# Current complete book preview

Updated 31 October 2026. [Browse the full book](REVIEW.html) or [open the PDF](../../../output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf).
The imperial book contains **174 interior pages plus four cover leaves: 178 PDF pages**.
John approved the revised Troubles set and requested its integration with the approved category names and coloured contents. All three changes are now included, with refreshed contents, index, folios, bookmarks and internal links. This is the current screen proof; the ordered Bookvault files remain unchanged.

## Current placement

| Interior pages | Content |
| --- | --- |
| 1–2 | Title and publication details |
| 3 | Blank |
| 4–5 | Approved coloured contents, facing; pale category key beside H6 harvest |
| 6–7 | Blank / Introduction — why grow your own |
| 8–9 | Blank / existing combined Vegetable Guides and how-to |
| 10–97 | All 44 vegetables, alphabetical by title, two facing pages each |
| 98–99 | Blank / revised Vegetable Troubles opener |
| 100–146 | Fourteen approved Troubles guides, 220 conditions and 24 highlights |
| 147 | Growing Techniques opener |
| 148–149 | Organic growing / Nutrient cycles |
| 150–151 | Crop rotation & planning |
| 152 | Planning your plot: Choosing the right spot |
| 153–154 | Planning your plot: Beds and paths / continued |
| 155–156 | Compost |
| 157–158 | Cultivation: Dig or No-Dig? / No-Dig |
| 159–160 | Cultivation: Digging / Digging continued |
| 161 | Plant care: Sowing and planting |
| 162–163 | Netting |
| 164–165 | Supports |
| 166 | Watering |
| 167–169 | Greenhouses |
| 170–173 | Index |
| 174 | End balancing blank |

PDF page = interior folio + 2. Section openers remain right-hand pages at 9, 99 and 147. Growing Techniques runs continuously; no new internal blank is needed. The two additional Troubles pages shift all later content by two pages, preserving its page sides and facing arrangements.

## Integrated approvals

- [Complete Troubles approval](../troubles-rollout/APPROVAL.json): exact both-unit PDFs and condition map. Source pages are reused directly. All 220 conditions and original drawings remain, with 25% larger image boxes, 4 mm shape clearance, natural 8 px gaps and trailing final-page space. Importance leads; fit moves are bounded to one page, with no alphabetical tie-break. Exactly 24 separated panels carry Common Pest / Common Disease / Common Problem ribbons; potato slugs remain ordinary.
- [Category-name approval](../category-navigation-preview/APPROVAL.json): 10 pt bold family-coloured names on both pages of all 44 guides. Practical titles move to the accepted 9 mm top position and retain their existing sizes, including smaller long-title sizes. Native bodies and artwork are unchanged. The rejected how-to colour key is not included.
- [Coloured contents and key approval](../contents-colour-study/key-preview/APPROVAL.json): 10.5 pt category-coloured vegetable and Troubles entries, and an 8 pt eight-category key in the pale roots.wash panel beside H6. H5 seedlings is intentionally omitted; both header illustrations remain. All 83 destinations appear once.
- [Netting](../topic-pages/plant-protection-supports/netting/APPROVAL.json) and [Supports](../topic-pages/plant-protection-supports/supports/APPROVAL.json), now 162–165, retain their approved bodies.
- The earlier [reader edits](../reader-edit-pass/APPROVAL-2026-10-16.json), [rotation spread](../topic-pages/crop-rotation-planning/APPROVAL-2026-10-18.json), [nutrient page](../topic-pages/nutrient-cycles/APPROVAL-2026-10-18.json), [final Organic growing and Beds copy](../final-text-edits/README.md), and [Cultivation headings/digging order](../techniques-subsections/README.md) remain included.
- Selected G2 front, preferred B5 back, approved publication/back-cover copy and all existing opening pages remain. Missing copyright year, imprint, ISBN and edition/year remain placeholders.

## Navigation and verification

The four-page index retains **297 entries, 35 see references and 9.45 pt type**. Its stable condition locators now use the approved Troubles condition-page map and confirm the exact heading in the actual PDF. Both editions resolve independently to the same folios. Crop “See also” links are recalculated from explicit mentions on destination pages. The nutrient-to-rotation reference now reads 150–151; Kale and Lettuce/Oriental Leaves references retain their alphabetical crop destinations.

[CHECKS.json](CHECKS.json), [PAGE-MAP.json](PAGE-MAP.json), [NAVIGATION-PDF-CHECKS.json](NAVIGATION-PDF-CHECKS.json), [SEQUENCE-CHECKS.json](SEQUENCE-CHECKS.json) and [VISUAL-REVIEW.json](VISUAL-REVIEW.json) describe the current book. The [integration receipt](integration-2026-10-31/INTEGRATION-CHECKS.json) compares every reused body with its exact source, including glyph coordinates, type sizes, text colours and image counts. Intentional exceptions are the approved category/title header bands and three bounded numeric-reference replacements. Fonts and every internal link are checked in the actual assembled PDF.

[Category overlay measurements](integration-2026-10-31/CATEGORY-LABELS.json) cover all 88 pages. The complete Troubles sources, category examples and contents composition remain frozen. No guide catalogue export, gardening-record change or shared book-copy mutation was needed: existing stable IDs resolve against the updated plan. Earlier transaction receipts remain historical evidence and must not be rerun.

Full assembly is imperial; both-unit contents and condition/index references are checked. John's physical-quality acceptance applies to the ordered 168-page proof. This 174-page screen revision does not replace supplier files or establish final cover/spine geometry.

## Rebuilding after an authorised change

Start Vite through `start.command` on loopback, then run:

```sh
npm run book:preview
```

The route builds both contents editions and the placement map, validates book copy, builds the current index and category/footer overlays, assembles saved native bodies, verifies links, then renders the full facing-page viewer. It never exports the guide catalogue. Inspect affected pages after a rebuild and refresh the visual receipt.

`npm run book:contents` and `npm run book:index` build individual navigation components. `scripts/lib/approved-troubles.mjs` verifies the accepted 31 October PDFs and condition map; the old rollout builders now refuse to overwrite that approved set. Later revisions require separate reviewed inputs. Frozen category/contents study builders are not integration commands.

For retained Techniques body changes, follow the [subsection source workflow](../techniques-subsections/README.md). Its source folios are historical; current placement comes from the contents plan. `integrate-approved-book.py` performs native assembly, `check-book-navigation.py` independently reopens destinations, and `review-whole-book-preview.py` refreshes the viewer. The retired original whole-book builders remain redirects. Production preparation and account actions remain separate.
