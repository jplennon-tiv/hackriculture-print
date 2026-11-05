# Leaf Beet one-off amendment

5 November 2026. [Review both editions](REVIEW.html). John approved this derivative on 5 November. The [approval record](APPROVAL.json) freezes both editions. Runner Bean is approved; full review readers remain available.

The introduction replaces “grown for leaves, not swollen roots” with John's
“grown for leaves and stems”. All other introduction wording is retained.

The previous table showed three problems; the canonical Leaf Beet record holds
five. This proof adds **Bolting** and **Downy mildew**, taking each sign and
control verbatim from `vegetables/beet_leaf/beet_leaf.json` through the shared
reader. The existing Slugs, Manganese deficiency and Leaf spot rows remain
unchanged. Inserting the two additions by rank produces Bolting (10), Slugs (8),
Downy mildew (7), then the existing pair at rank 5. All five distinct source
entries are included; no other pest is invented or borrowed to fill space.

The shared `spinach_troubles` group's downy-mildew and bolting accounts are scoped
to true spinach. Those descriptions are not used here: this crop's own current
record supplies specific Leaf Beet advice, including removing early flower
stems and replacing plants when flowering persists. The old extract's note
excluding copied true-spinach advice is historical, not a prohibition on the
current Leaf Beet entries. Shared data and approval states are unchanged.

Under the standing review guidance, the first Soil & preparation item loses
“Check pH before liming; about 6.5 suits the crop.” The manganese-deficiency
row retains its pH check and warning against over-liming, where these have a
specific diagnostic purpose. Quick facts retain all eight entries and icons,
with five short facts on the left, three longer ones on the right, at 52:48.

Both editions retain two 185 × 240 mm pages, folios 24–25, the two planting
drawings, four varieties, three opening Key risks and existing See also links.
Page 2's trailing clearance falls from 28.91 mm to **11.96 mm**; page 1 has
17.84 mm after rebalancing. The additional useful content fills more of the
practical page without artificial spacing or smaller type. No pest rows are cut.

Both final PDF spreads were visually inspected against the baseline. All six
new table cells were recovered from their printed bounds. The normal proof
checks cover fonts/images, 9 pt planting prose, two pages, folios and links.
[Verification and preservation](CHECKS.json), [PDF evidence](checks/beet_leaf.verified)
and [layout evidence](checks/beet_leaf.json). The canonical record, seven approved
crop derivatives, full review PDFs and main book remain unchanged.

[Editable source-linked amendment](../../../../../src/print/book/sowing-rollout/revisions/beet_leaf.json)
contains exact before-text, source paths, insertion anchors and original proof
hashes. The one-off builder now supports optional extra table entries and checks
their printed cells; no shared renderer or catalogue selection rule changes.
Reproduce only this unapproved derivative using
`node scripts/sowing-rollout/build.mjs --revision beet_leaf` with Vite running
through `start.command`, then the bundled Python runtime with
`scripts/sowing-rollout/finish.py --revision beet_leaf`. An approval file prevents
overwriting. Do not regenerate the full set for this amendment.
