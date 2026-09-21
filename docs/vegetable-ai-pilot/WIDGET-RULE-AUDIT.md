# Vegetable widget rule audit

Follow-up: John authorised the bounded fixes documented in [WIDGET-COORDINATION.md](WIDGET-COORDINATION.md). The findings below describe the pre-fix audit, not current status.

21 September 2026. Requested by John after the pest-table redraft. Audit only:
no renderer, schema, canonical records, approval states or PDFs changed.
Baseline shared revision:
`c4451d693f2b147763fd431b40b6e97322b03b5eaebee790c79d519a7fa0c6a5`.

Scope: every widget in the two-sided vegetable sheet, its fitting code,
measurement/calendar/fact/icon helpers, saved-extract contract and nearby tests.
Separate Troubles sheets and website widgets were not audited here.

## Highest-priority findings

### WR-01 — Quick Facts can silently generalise the first crop variant

`src/lib/measure.ts:280–295` recursively returns the first usable value from a
keyed object. The Quick Facts builder (`PrintVegetablePage.tsx:724–754`) loses
the key/type label. Live examples: potato rows show **60 cm**, choosing first
earlies and omitting maincrop **75 cm**; radish plant spacing shows only the
small salad-radish spacing, omitting winter/Japanese types. Five keyed spacing
fields are affected, although two have equal values across their variants.

`src/lib/facts.ts:104–119` similarly chooses the first variety duration if there
is no ready-in summary/default. Broccoli therefore gets **12 weeks** from
calabrese while the sprouting entry says **44 weeks**; sprouts get **28 weeks**
while the later type says **36 weeks**. The title header repeats the same value.
The first yield basis/variety also wins (`facts.ts:47–61`).

Action: use explicit, labelled crop/type summaries or saved choices, with a
visible diagnostic when multiple values cannot be represented. Reuse the
illustrated planting card's stricter explicit measurement bindings. Do not
flatten type distinctions during the planned data normalisation.

### WR-02 — Calendar text invents continuity across gaps/year end

The private `formatMonthRange` in `PrintVegetablePage.tsx:406–411` expands the
months, sorts them, and labels the earliest/latest as one continuous season.
Sprouts' `--10/--03` becomes **Jan–Dec** instead of Oct–Mar; celery's
`--09/--01` also becomes Jan–Dec. The coloured grid uses the actual month set,
so the two widgets can contradict one another. Nineteen crop/calendar fields
have gaps within the printed min/max span. Single-month potato sowing becomes
the redundant **Apr–Apr**.

The shared `src/lib/months.ts` formatter already handles an explicit wrapped
range, but still collapses separate seasonal windows. Reusing it alone would
not fix cabbage's March–May plus August–September becoming March–September.

Action: format actual contiguous windows, preserving wraparound and gaps.

### WR-03 — Soil, care and harvest share a global cutting rule

`PrintVegetablePage.tsx:887–903` caps uncurated soil/care/harvest/sowing-note
arrays at **6/8/6/4**, before measured overflow. One shared `p2TrimLevel` then
shrinks those limits to **2/3/2/2**, also shortening the legacy sowing method
from five sentences to two (`:728–731`). Overflow anywhere can cut advice in
another widget; the first stage fits a text-only page before planting artwork.

`smartTrim` (`:398–403`) does not sort by rank. When fewer than three items
pass its rank/star filter, it falls back to the first N original items. A direct
execution of the current function with six rank-5 items followed by one starred
rank-10 item drops that final important item. When many qualify, source order
still decides which high-ranked items are dropped. There is no omission report.

Ten source sections already exceed the initial limits without any overflow.
On the live unprepared onion/shallot page, 11 soil, 13 care and 14 harvest source
items become **2/4/2**. This demonstrates selection behaviour, not an assessment
that every source sentence is correct or deserves printing.

Current valid curated extracts bypass these particular list caps. Unprepared
crops and invalid/missing extracts remain exposed. Action: curate and measure
each widget, retain ranked essentials, record omissions and warn rather than
silently discard content to make an unrelated widget fit.

## Other confirmed content rules

### WR-04 — Varieties are filtered before fitting, then descriptions shortened

`PrintVegetablePage.tsx:645–649`: if four varieties rank at least 6, every
lower-ranked variety is removed from the eligible pool, regardless of space.
This applies to **23 crops** in the current source. Example: globe artichoke
has four eligible varieties; Purple Globe and Camus de Bretagne cannot be
added by asking the fitter for six. A saved count cannot bypass this gate.

The unsaved fitter starts at four, trims toward three/two and stops after an
overflow reversal (`useVegetableLayout.ts:34,101–159`; `vegetableLayout.ts:35–50`).
It does not try a shorter description or another variety after one fails.
Reviewed saved counts already bypass that automatic count adjustment.

Every rendered variety note uses `short_text` or just its first sentence
(`PrintVegetablePage.tsx:1515–1518`), even with spare room. Group overviews are
skipped and a metadata heuristic recognises only certain shapes/names
(`:492–589`). Potato's **“Variety Choice Notes”** is consequently printed as a
variety, consuming a slot; duplicate Scarlet Globe entries remain on radish.

Action: distinguish varieties from group notes, normalise identities, preserve
useful group coverage, and choose both entries and note lengths editorially.

### WR-05 — Speech bubbles depend on name length, including curated notes

`PrintVegetablePage.tsx:1624–1634`: names up to 10 characters receive three
bubbles, 11–17 receive two, longer names receive one. It slices in source order
without measurement or an omission warning. **17 crops** have more saved/source
key notes than this permits. Broad/French/runner beans and Brussels sprouts
have three curated notes but display two; Jerusalem artichoke displays one
of three. This restriction still acts on the reviewed path.

Action: save a measured header choice per crop and reconcile repeated messages
with the body; do not let a punctuation/name change decide which advice exists.

### WR-06 — Quick Facts have a fixed field menu, not a content-fit selection

`PrintVegetablePage.tsx:740–766` only builds Sow, Harvest, Germination, Depth,
Row spacing, Plant spacing, Yield and Ready in. Available rows are all rendered;
there is no hidden subsequent row slice. But seed longevity is present in
**35 crop records** and is never offered here, despite a seed-life icon mapping.
This is a product/editorial choice to review, not evidence that every sheet
should gain every possible fact.

Calendar rows are also restricted (`:687–713`): indoor sowing is only a fallback
when popular outdoor months are empty; the cloche row is explicitly omitted.
Crop-type calendar notes and other protected/transplanting routes are not shown.
Action: decide which facts/routes matter per crop and label summaries accurately.

### WR-07 — Final Tips and icons still have mechanical fallback behaviour

`PrintVegetablePage.tsx:918–925`: without a current final-tip extract, take the
first 3–5 starred care/soil items, or the first 3–4 care items. No independent
ranking/deduplication is done there. More important late items can lose out;
the same advice can repeat from the main care card. Current prepared crops
have explicit final-tip extracts and bypass this fallback.

`src/lib/quickFactIcons.ts:83–101`: keyword rules may replace an explicit broad
icon such as `soil` or `harvest`; unmatched untagged text cycles through five
icons by its position. Existing tests deliberately expect that behaviour.
Action: distinguish an approved exact icon from a broad hint; flag unclassified
tips rather than assigning an unrelated icon by row number.

### WR-08 — Optional planting notes stop at the first overflowing prefix

`src/print/plantingFit.ts:27–30` adds notes in order, retracts the first one that
overflows and switches to image fitting. It never tries a shorter later note.
This is measured, but still the same first-failure stopping pattern. Its tests
explicitly lock in that transition. A separate `plantingReview=1` mode forces
zero optional additions (`:18`); this is not the `aiReview=1` extract preview.

The planting card otherwise keeps every selected caption, supplementary item
and explicit measurement; its fitter does not cut neighbouring widgets after
activation. Action: retain the approved binding/artwork system and save an
editorially chosen note set, with omitted-note evidence.

## Remaining widgets and intentional constraints

| Widget/rule | Assessment |
| --- | --- |
| Introduction | Unsaved fit starts at two sentences, caps at 12 and stops after a failed addition. Saved sentence counts are honoured. First-N remains a selection heuristic; do not treat it as summarisation. |
| Key Risks | Four entries plus first-sentence descriptions are a separate summary-strip rule (`:676,879,1579`). Keep separate from the fuller pest table; review duplicate identities/variant prose before changing the count. |
| Core Needs | Three defined needs, 1–5 scale and five segments are approved design semantics. Numeric clamping/missing-value display are not arbitrary content truncation. |
| Header seasons/difficulty | Four seasons and five difficulty levels are defined categories, not cutoffs. Season labels are abbreviated, not dropped. Header duration inherits WR-01. |
| Names | Front font size changes at 13/18 characters; back title allows ellipsis (`print.module.css:1018–1027`). These are crude presentation heuristics worth checking for long names, but no current clipping regression was established. |
| Hero/planting artwork | Explicit crop/image bounds, aspect ratios and saved stage arrangements are reviewed design constraints. No reason found to reset them globally. |
| Final Tips position/alignment | Full width default and saved column exceptions are intentional. Flex growth distributes space after selection; it does not restore discarded content. |
| Saved-layout validation | Schema permits pests 3–10, intro 1–12, varieties 2–50 and exactly two target pages (`src/schema.ts:205`). These are explicit validation bounds, not silent omissions; changing a legitimate bound needs a deliberate contract change. |

## Evidence and next action

Read-only preflight passed. Used the current private selector/formatter functions
extracted from their TypeScript AST for bounded source-data checks; inspected
nearby layout, extract, icon and planting tests. Five live metric browser probes
(sprouts, radish, potato, onion/shallot, broad bean) confirmed examples above.
No PDFs were regenerated and no full application suite/build was run for this
review. Canonical revision was checked unchanged after the probes.

Recommended order: correct misleading variant/month summaries; make discarded
content visible; replace global list/rank/name gates with saved per-widget
editorial choices; then improve optional-note/icon fallbacks. Changes will need
focused tests and representative both-unit PDF review, preserving the approved
visual system. Coordinate source identities/scope work with
[DATA-NORMALISATION.md](../../../hackriculture-data/planning/DATA-NORMALISATION.md).
