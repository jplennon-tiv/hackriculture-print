# Current complete book preview

Updated **2 November 2026**. [Browse the book](REVIEW.html) or [open the PDF](../../../output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf).
The imperial book contains **174 interior pages plus four cover leaves: 178 PDF pages**.
The approved pH page and three-panel guide intro are integrated, with refreshed
contents, index, folios, bookmarks and internal links. This is the current source
for promotional slides; the ordered Bookvault production files are unchanged.

## Current placement

| Interior pages | Content |
| --- | --- |
| 1–2 | Title and publication details |
| 3 | Blank |
| 4–5 | Coloured contents with pale category key |
| 6–7 | Blank / Introduction — why grow your own |
| 8–9 | Blank / approved three-panel Vegetable Guides and how-to |
| 10–97 | All 44 vegetables, alphabetical, two facing pages each |
| 98–99 | Blank / Vegetable Troubles opener |
| 100–146 | Fourteen Troubles guides, 220 conditions and 24 highlights |
| 147 | Growing Techniques opener |
| 148–149 | Organic growing / Nutrient cycles |
| 150–151 | Crop rotation & planning |
| 152 | Organic growing / Testing and adjusting pH |
| 153 | Planning your plot: Choosing the right spot |
| 154–155 | Beds and paths / continued |
| 156–157 | Compost |
| 158–159 | Cultivation: Dig or No-Dig? / No-Dig |
| 160–161 | Cultivation: Digging / Digging continued |
| 162–163 | Sowing and planting / Watering |
| 164–165 | Netting |
| 166–167 | Supports |
| 168–170 | Greenhouses |
| 171–174 | Index |

PDF page = interior folio + 2. Openers remain right-hand pages 9, 99 and 147.
The pH page completes Organic growing. Watering now faces Sowing, preserving
Netting and Supports as facing spreads without adding an internal blank. Beds,
Compost and each Cultivation pair also face. The index starts recto at 171; its
last page absorbs the former end blank, so the total remains 174 interior pages.
Bodies on changed page sides are shifted 9 mm to preserve mirrored 17/8 mm margins;
text, art and type sizes are retained.

## Integrated sources and scope

- [Testing and adjusting pH approval](../topic-pages/soil-acidity/APPROVAL.json): exact one-page PDF, both illustrations, accepted copy and type, now 152.
- [Guide intro approval](../guides-intro-detail/APPROVAL.json): exact three-panel page at 9; calendar text and headings synchronised through the [guarded save](integration-2026-11-02/BOOK-COPY-UPDATE.json).
- [Complete Troubles approval](../troubles-rollout/APPROVAL.json): 220 conditions, 24 separated classified ribbons, larger masked drawings, 4 mm clearance, importance order and natural trailing space. Potato slugs remain unstarred.
- [Category names](../category-navigation-preview/APPROVAL.json) remain 10 pt on all 88 vegetable pages; original bodies and art are retained.
- [Coloured contents/key](../contents-colour-study/key-preview/APPROVAL.json) remain at 4–5. The new pH row uses a [separate current derivative](../contents-update/current.css), reducing page-5 row padding from 2 px to 1.4 px while retaining 10.5 pt type, art and the pale key. All **84 destinations** appear once.
- [Netting](../topic-pages/plant-protection-supports/netting/APPROVAL.json) and [Supports](../topic-pages/plant-protection-supports/supports/APPROVAL.json) retain their exact approved bodies.
- Earlier approved reader edits, expanded rotation, nutrients, Organic growing/Beds copy, Cultivation headings and digging order remain included. Selected G2 front and preferred B5 back remain.

The separate [sixteen vegetable wording proposals](../soil-acidity-crop-edits/DIFF.html)
are **not approved or integrated**. The page-7 Introduction rewrite and collected
corrections remain open. Metadata placeholders remain. No gardening-record change,
guide catalogue export, supplier upload or publication action was performed.

## Navigation and verification

The index has **303 entries and 35 see references**, still four pages at **9.45 pt**.
Six new pH/lime terms point to 152; Clubroot and Common scab also link to its cautions.
Condition locators verify exact headings in the accepted Troubles PDFs. Both unit
maps agree. Crop links follow explicit mentions in destination pages.

[Checks](CHECKS.json), [page map](PAGE-MAP.json), [navigation checks](NAVIGATION-PDF-CHECKS.json),
[sequence](SEQUENCE-CHECKS.json) and [visual review](VISUAL-REVIEW.json) describe this PDF.
The [integration receipt](integration-2026-11-02/INTEGRATION-CHECKS.json) verifies
reused glyphs, type, text colours and image counts against exact sources, allowing
only calculated mirrored-margin shifts, approved header/footer overlays and three
bounded numeric-reference replacements. All links and embedded fonts are checked.
All 58 canonical gardening records and frozen source proofs remain unchanged.

The accepted physical proof was the earlier 168-page production edition. This
screen PDF is suitable for book review and video-page material; it is not a supplier
upload and does not establish final spine geometry or publication readiness.

## Rebuilding after an authorised change

Start Vite through `start.command` on loopback, then run `npm run book:preview`.
The route builds both contents editions, resolves the index, creates category and
footer overlays, reuses approved native bodies, verifies navigation and refreshes
the facing-page viewer. It never exports the guide catalogue. Inspect affected
pages and update the visual receipt after a rebuild.

The pH and guide-intro focused builders refuse to overwrite their approved inputs.
For later changes, use separate review paths. Existing frozen/A4/production sources
and dated receipts remain evidence, not instructions to rerun old proposals.

For the next task, use the [promotional slides handover](../../handover/PROMOTIONAL-SLIDES.md)
and its source manifest. No slides or new chat have been created in this integration.
