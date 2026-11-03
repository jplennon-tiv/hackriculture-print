# Current complete book preview

Updated **3 November 2026**. [Browse the book](REVIEW.html) or [open the PDF](../../../output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf).
The imperial book contains **176 interior pages plus four cover leaves: 180 PDF pages**.
The approved contents reflow and requested sentence-case Pests & diseases labels
and Key risks headings are integrated. John has [approved all these recent changes](../key-risk-title-case/APPROVAL.json). The turf page follows Digging at 162, with refreshed contents, index,
folios, bookmarks and internal links. The approved pH page and guide intro remain
integrated. The promotional project is complete; ordered Bookvault files are unchanged.

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
| 162 | Cultivation: Lifting and using turf |
| 163 | Sowing and planting |
| 164–165 | Netting |
| 166–167 | Supports |
| 168 | Watering |
| 169–171 | Greenhouses |
| 172–175 | Index |
| 176 | End balancing blank |

PDF page = interior folio + 2. Openers remain right-hand pages 9, 99 and 147.
The pH page completes Organic growing. The turf page follows Digging, facing
Sowing at 163. Watering follows Supports at 168, preserving the accepted Netting
164–165 and Supports 166–167 facing spreads without an internal blank. Beds,
Compost and each original Cultivation pair also face. Greenhouses opens on recto
169, followed by its practical facing spread 170–171. The index occupies two
spreads, 172–175, with blank 176 balancing the end.
Bodies on changed page sides are shifted 9 mm to preserve mirrored 17/8 mm margins;
text, art and type sizes are retained.

## Integrated sources and scope

- [Lifting and using turf approval](../topic-pages/lifting-and-using-turf/APPROVAL.json): exact copy, two raster illustrations and labelled vector soil section, now 162. The [guarded book-copy save](integration-2026-11-03/BOOK-COPY-UPDATE.json) adds the contents destination and four index entries, plus three references in existing entries.

- [Testing and adjusting pH approval](../topic-pages/soil-acidity/APPROVAL.json): exact one-page PDF, both illustrations, accepted copy and type, now 152.
- [Guide intro approval](../guides-intro-detail/APPROVAL.json): exact three-panel page at 9; calendar text and headings synchronised through the [guarded save](integration-2026-11-02/BOOK-COPY-UPDATE.json).
- [Complete Troubles approval](../troubles-rollout/APPROVAL.json): 220 conditions, 24 separated classified ribbons, larger masked drawings, 4 mm clearance, importance order and natural trailing space. Potato slugs remain unstarred.
- [Category names](../category-navigation-preview/APPROVAL.json) remain 10 pt on all 88 vegetable pages; original bodies and art are retained.
- [Coloured contents/key](../contents-colour-study/key-preview/APPROVAL.json) remain at 4–5. The [approved 3 November reflow](../contents-key-reflow/APPROVAL.json) places H6 below the left column and the pale key full width in four columns of two. Original 2 px row padding is restored; 10.5 pt type, art and all **85 destinations** remain.
- [Problem-label correction](../pest-title-case/README.md): sentence case for 277 printed labels on 44 practical pages; original embedded font and all other text/art preserved. The guarded canonical correction covers 350 keys across 44 vegetables; advice and identities are unchanged.
- [Key risks heading correction](../key-risk-title-case/README.md): 157 headings across all 44 opening pages use the same sentence case, preserving original type, line breaks, icons, descriptions and positions. No further source JSON changed.
- [Netting](../topic-pages/plant-protection-supports/netting/APPROVAL.json) and [Supports](../topic-pages/plant-protection-supports/supports/APPROVAL.json) retain their exact approved bodies.
- Earlier approved reader edits, expanded rotation, nutrients, Organic growing/Beds copy, Cultivation headings and digging order remain included. Selected G2 front and preferred B5 back remain.

The separate [sixteen vegetable wording proposals](../soil-acidity-crop-edits/DIFF.html)
are **not approved or integrated**. The page-7 Introduction rewrite and collected
corrections remain open. Metadata placeholders remain. The requested case-only
source correction is recorded above; no guide catalogue export, supplier upload
or publication action was performed.

## Navigation and verification

The index has **307 entries and 36 see references**, still four pages at **9.45 pt** and 1.28 line spacing. The current derivative
removes the former 0.3 CSS px extra paragraph gap to accommodate the new entries;
no terms or reading type are reduced.
Six new pH/lime terms point to 152; Clubroot and Common scab also link to its cautions.
Turf, Loam and Lawn entries point to 162, with Grass referring to Lawn; existing
Double digging, potting mix and new-plot weeds entries gain the same destination.
Condition locators verify exact headings in the accepted Troubles PDFs. Both unit
maps agree. Crop links follow explicit mentions in destination pages.

[Checks](CHECKS.json), [page map](PAGE-MAP.json), [navigation checks](NAVIGATION-PDF-CHECKS.json),
[sequence](SEQUENCE-CHECKS.json) and [visual review](VISUAL-REVIEW.json) describe this PDF.
The [integration receipt](integration-2026-11-03/INTEGRATION-CHECKS.json) verifies
reused glyphs, type, text colours and image counts against exact sources, allowing
only calculated mirrored-margin shifts, approved header/footer overlays and three
bounded numeric-reference replacements. All links and embedded fonts are checked.
All 58 canonical records remain unchanged during assembly, after the requested
case-only source correction. Frozen source proofs remain intact.

The accepted physical proof was the earlier 168-page production edition. This
screen PDF is suitable for book review and video-page material; it is not a supplier
upload and does not establish final spine geometry or publication readiness.

## Rebuilding after an authorised change

Start Vite through `start.command` on loopback, then run `npm run book:preview`.
The route builds both contents editions, resolves the index, creates category and
footer overlays, reuses approved native bodies, verifies navigation and refreshes
the facing-page viewer. It never exports the guide catalogue. Inspect affected
pages and update the visual receipt after a rebuild.

The turf, pH and guide-intro focused builders refuse to overwrite their approved inputs.
For later changes, use separate review paths. Existing frozen/A4/production sources
and dated receipts remain evidence, not instructions to rerun old proposals.

The [promotional slides handover](../../handover/PROMOTIONAL-SLIDES.md) records the
completed separate project; its frozen source pack is historical and is not rebuilt
by book integration.
