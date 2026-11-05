# Sowing & planting: conventional planting trial

3 November 2026. **Second sample experiment; not approved or installed.**

All five samples have since been revised. John approved [carrot](../carrot-revision/APPROVAL.json) and [leek](../leek-revision/APPROVAL.json). John then [approved beetroot, potato and outdoor tomato](../remaining-three/APPROVAL.json). The [remaining 39 guides](../../sowing-rollout/REVIEW.html) are now in review.

Open the [illustrated review](REVIEW.html), with all five crops, the previous
drafts for comparison and both units. The [imperial PDF](../../../../output/pdf/sowing-planting-mockups/conventional/five-crop-conventional-imperial.pdf)
and [metric PDF](../../../../output/pdf/sowing-planting-mockups/conventional/five-crop-conventional-metric.pdf)
each contain 14 pages. The main book and master records are unchanged.

## Current brief and result

John rejected the visual cost of the first three-page arrangements. The target
is a two-page facing guide; three pages should be a last resort for individual
crops. This pass applies his first two measures: remove clump-growing advice
from the crop samples and remove duplicated calendar dates from Sowing &
planting. A separate clump-growing Techniques page is planned, not drafted here.

| Crop | Planting body words, previous → now | Result of best two-page trial |
| --- | ---: | --- |
| Carrot | 125 → 109 | Needs approximately 7.4 mm more space |
| Beetroot | 154 → 56 | Fits two pages |
| Leek | 182 → 103 | Needs approximately 9.0 mm more space |
| Outdoor tomato | 189 → 171 | Needs approximately 23.4 mm more space |
| Potato | 178 → 156 | Needs approximately 25.6 mm more space |

Word counts exclude headings. The space figures include the 3 mm footer-gap
target and are the same in both units for the measured practical-page trials.
They describe those arrangements, not proof that every two-page design is
impossible. Beetroot is a complete facing pair. The other four retain readable
third pages solely as overflow studies. Their substantial unused space remains
unresolved, not an accepted solution. Local page numbers are review labels;
no book folios or neighbouring spreads have changed.

Tested arrangements include the original two columns; planting beside all
other advice; full-width soil advice above the columns; and, for carrot/leek,
moving the last alternative to the opposite column. Column proportions from
40:60 to 60:40 and separate versus bold run-in method headings were measured.
Items remain separate paragraphs. Body text remains **9 pt**. No further copy
cuts, table pruning, smaller body type or new artwork were introduced. John's
next space-saving ideas remain the next step.

## Copy and timing changes

- **Carrot:** standard and extended dates leave the planting prose. Early/late
  variety and protection instructions remain. Quick facts preserves the
  qualified March, August and autumn/winter timings in an Extended season row.
- **Beetroot:** direct sowing and thinning to single plants remain. The clump
  alternative, related opening/harvest wording and duplicate tips are removed.
  The calendar no longer offers the February module path. Storage/late sowing
  distinctions sit in Quick facts. “Seed clusters” remains: it describes the
  corky seed structure, not growing several plants together.
- **Leek:** nursery sowing, lifting/transplanting and an earlier single-module
  option remain. The clump method and diagram are removed. Nursery sowing and
  transplant dates sit in Quick facts/calendar; the early indoor option has a
  short calendar note. Pencil-thick readiness, deep-hole instructions, suitable
  conditions, hardening off and the exact temperature pair remain in the prose.
- **Outdoor tomato:** sowing, pricking out/potting on, hardening off and planting
  out remain distinct. Dates sit in Quick facts/calendar, including protected
  late-May versus open early-June planting. Two weeks of hardening, root/flower
  readiness and frost/weather qualifications remain beside their actions.
- **Potato:** chitting and the first-/second-early/maincrop dates sit together in
  Quick facts. Preparing tubers, ground planting, mulch and container methods
  remain, with frost protection and suitable-site qualifications. The trench
  depth still explicitly differs from the soil cover above the tuber.

The duplicate care instructions already identified in the first draft remain
consolidated: carrot thinning; beetroot thinning/clump details; and leek
hole-filling. Other care, harvesting (apart from the explicit beetroot change),
soil, varieties, Key risks, problem rows and reminders are retained. Unapproved
pH wording changes have not been introduced.

## Sources and artwork

The isolated [current copy](../../../../src/print/book/sowing-planting-mockups/conventional/copy.json)
derives from the preserved [research draft](../../../../../hackriculture-resources/summaries/sowing-planting-five-crop-audit/drafts.json),
[source ledger](../../../../../hackriculture-resources/summaries/sowing-planting-five-crop-audit/SOURCES.md)
and [exact master excerpts](../../../../../hackriculture-resources/summaries/sowing-planting-five-crop-audit/SOURCE-EXCERPTS.json).
Original research and the [first trial](../README.md) remain historical evidence.
Metric proofs use the exact canonical dimension pairs. The ambiguous late-sown
leek note remains unresolved; the original muted late-sowing calendar months
are carried forward, not newly endorsed as a recommendation.

All existing planting drawings remain in a compact image strip with their
instructional captions. Neither provisional clump diagram appears in the new
crop proofs. Those diagrams and the medium-sized-crop preference are retained
with the earlier research for the future Techniques page; its spacing proposals
still need review. No new illustrations were commissioned.

## Checks and reproduction

[CHECKS.json](CHECKS.json) records the ten rendered crop/unit trials, alternative
arrangements, typography, loaded images, retained-source comparisons, current
copy and protected input hashes. [PDF-CHECKS.json](PDF-CHECKS.json) records ten
actual PDFs, 28 pages total, 185 × 240 mm trim and exact recovery of all 32 method
paragraphs from their PDF bounds. No clump advice remains; all original planting
images are present. Final readable proofs clear the footer by at least 2.9 mm
(0.1 mm measurement tolerance around 3 mm). Failed two-page arrangements are
recorded separately and must not be confused with these final proof gaps.

Both complete contact sheets were visually inspected, plus the beetroot
practical page, tomato metric planting page and dense potato opening at reading
size. No missing image or clipped text was found in those checks. The extra-page
whitespace is a known design failure still to resolve, not a visual approval.

Build only these five samples with `scripts/build-sowing-conventional-trial.mjs`,
using Vite on loopback through `start.command`; then run this folder's
`finish_review.py` with the bundled PDF-capable Python. Inputs are the first
trial's immutable two-page source HTMLs. Current copy/layout/CSS are isolated in
`src/print/book/sowing-planting-mockups/conventional/`. No normal exporter imports
them. The finalizer verifies PDF text, renders pages, assembles both review PDFs
and rebuilds the offline viewer.

The book remains **176 interior / 180 PDF pages**, SHA-256
`8c75e0eb9114005edd7516bf2d86855cf90110e4d2fff0ee48a146571afbeea6`.
Protected master records, source HTML and book hashes match. No app test suite,
shared-data save, whole-book rebuild, contents/index update or supplier export
was needed for this isolated experiment. These checks are not John's approval.
