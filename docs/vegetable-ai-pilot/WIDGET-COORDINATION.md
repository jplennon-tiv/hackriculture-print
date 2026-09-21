# Coordinated vegetable widgets

21 September 2026. Implements John's response to [WIDGET-RULE-AUDIT.md](WIDGET-RULE-AUDIT.md).
Renderer: `vegetable-extracts-v4`. Work is in the existing local checkout.

**Signed off by John, 21 September 2026:** the complete 12-crop review set,
including code and logic. [widget-signoff.json](widget-signoff.json) records the
approval and exact renderer hashes. Draft/checkpoint wording below describes
the pre-approval work. New crops are tracked separately in [BATCH-04.md](BATCH-04.md).

## Editorial contract

Use one assisted review of the whole crop, then save source-linked decisions in
the existing `ai_print_extracts` and `ai_print_layout`. No runtime AI, new service,
or communicating widget state machines. Master advice remains complete.

1. Read soil, care, harvest, all sowing notes, illustrated captions, Final Tips,
   calendar/type distinctions and relevant pest advice together.
2. Assign each distinct action to its natural widget. Merge repetition; retain
   conditions, timing, organic methods and measurement pairs. Final Tips may
   deliberately repeat a critical reminder, but must not be the first N care rows.
3. Save a **complete** `sowing_notes` selection, including `[]` when captions and
   other widgets already cover everything useful. Valid extracts bypass automatic
   optional-note prefix fitting. Evaluate later candidates even if an earlier one
   is too long. Document each candidate as retained, covered elsewhere or omitted
   with a reason. Do not change approved planting captions/artwork to implement this.
4. Link every source used, including calendar data when a tip or harvest extract
   uses its dates. Mark changed extracts draft; preserve locked/manual records.
5. Measure the whole two-page result in both units. First condense repetition or
   relocate useful advice, then remeasure. Never silently shrink another widget's
   saved selection to compensate. Align column bottoms; fill remaining space only
   with useful advice. Save final evidence against source and renderer hashes.

The browser exposes `data-editorial-report` on page two: reviewed/automatic mode,
source/printed item counts and saved editorial notes. Counts describe containers,
not semantic coverage: one extract may combine several source paragraphs. Missing
extracts produce explicit preparation warnings. Legacy fallback still fits old
unprepared crops, now preserving starred/high-ranked entries when selection is
necessary. These fallback counts are not editorial approval or rollout targets.

## Concrete decisions

| Area | Result |
| --- | --- |
| Varieties | All ranked entries remain eligible; removed the rank>=6 gate that excluded lower entries whenever four qualified. Existing measured count fitting remains. Descriptions still use short text/first sentence; group identities/duplicates await normalisation. |
| Speech bubbles | Keep the title-length rule John accepted. No unproven header redesign. |
| Soil/care/harvest | Reviewed the existing prepared selections; retained complete soil condensations. Combined related protection/feed actions, made revised feed wording explicitly organic, corrected sprout harvest readiness. Valid extracts already bypass global cutting. |
| Quick Facts | Additive paired spacing summaries for radish, potato and turnip preserve keyed measurements. Explicit short/full growing-time data for broccoli, sprouts and cabbage; fallback now represents all duration/yield variants. Exact seasonal windows replace invented continuous ranges. Eight existing fact categories remain; seed longevity is not added indiscriminately. |
| Final Tips | Independent crop choices with exact saved icons; unclassified legacy text no longer receives a random icon by row number. Final tip counts vary with content, not a target. |
| Planting | Saved sowing extracts own complete note selection; no automatic append-and-stop prefix. Legacy unprepared planting fitter remains, with preparation warnings. |
| Stacking | Existing parent layout measures the page; the shorter left column's last card can now extend its border like the right column. No font, padding, artwork size or new widget-to-widget dependencies. |

Optional planting candidates were reviewed across all 12 prepared crops:

- Asparagus, celery and radish: no companion optional-note candidates. Asparagus
  and celery approved extracts are byte-for-byte preserved.
- Broad bean: autumn route in planting; useful nurse/shelter-crop note in tips.
- French bean: early cloche route restored in planting; repeat sowing there;
  supports in care plus a timing reminder.
- Runner: early route in planting; conditional seed soaking and warm July sowing
  in tips. Neither is discarded because it follows an overflowing note.
- Beetroot: four/five module seedlings in tips; early and later timing in planting;
  progressive clump harvesting in care/harvest.
- Carrot: cold/wet sowing qualification already in planting.
- Lettuce: hearting succession and cool/shaded trays in tips; light seed cover
  retained in planting.
- Broccoli: sprouting sowing dates in planting, mesh in care.
- Sprouts: indoor/frame route in planting, conditional windy-site support in care/tips.
- Cabbage: seasonal routes in planting; late nitrogen qualification in planting/care.

Final Tips changed for radish, beetroot, broad/French/runner beans, broccoli and
sprouts. Carrot, lettuce and cabbage tips already made useful independent choices
and were retained. The seven fuller pest counts and three brassica pest counts
remain unchanged; no pest rows were sacrificed for this work.

## Sprout season research

- [RHS growing guide](https://www.rhs.org.uk/vegetables/brussels-sprouts/grow-your-own):
  main crop is winter, with early/mid/late varieties extending picking; harvest
  firm, closed buttons from the bottom upwards. Yellow leaves are removed separately.
- [Garden Organic growing guide](https://www.gardenorganic.org.uk/expert-advice/how-to-grow/growing-guides/vegetables-herbs-guides/how-to-grow-brussels-sprouts):
  end September to mid-February is its general harvest calendar.
- [Tozer variety catalogue](https://www.tozerseeds.com/wp-content/uploads/2017/04/Wholesale-Catalogue-International-2016.pdf):
  early/late varieties collectively cover maturity slots through March in Northern
  Europe. This older catalogue supports the possible extension, not a guarantee
  for a single modern cultivar.

Thus October–March is plausible across varieties, but misleading as one crop's
uniform main season. **November–February main; September/October and March
extensions** is our editorial month-level categorisation, inferred from these
sources. The master states dependence on variety, sowing and weather. Edible
shoots/tops after button cropping are separate from the main harvest window.
The formatter fix is independently necessary: narrowing winter data alone would
still have produced the erroneous Jan–Dec label.

## Restore and validation

Baseline shared revision: `c4451d693f2b147763fd431b40b6e97322b03b5eaebee790c79d519a7fa0c6a5`.
Guarded source and extract saves, followed by French-bean wording/dependency
corrections, each retain exact preceding bytes under shared `backups/admin`.
See [widget-restore.json](widget-restore.json) for final checkpoint/evidence.
`coordinate-widgets.mjs` is a one-time guarded authoring record, not a rerunnable
migration. Current canonical data supersedes its first wording proposals.

The final check record covers all 12 prepared crops in both units: 24 physical
PDFs, each two pages, loaded fonts/images, zero layout warnings and 0 px column
bottom gaps. The combined review pack contains 24 metric pages. Visual inspection
covered sprouts, French bean, radish, celery and cabbage in both units. Focused
tests passed, then the complete suite passed (243 tests); production build passed
with the existing large-chunk advisory. Poppler emitted Type 3 glyph bounding-box
warnings; inspected pages showed no visible damage.
The 32 unprepared crops still require assisted editorial preparation; this pass
does not claim to have curated them or resolved catalogue identity duplication.
