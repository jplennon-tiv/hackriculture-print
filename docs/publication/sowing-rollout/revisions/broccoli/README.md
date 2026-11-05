# Broccoli one-off amendment

5 November 2026. [Review both editions](REVIEW.html). John approved this derivative on 5 November. The [approval record](APPROVAL.json) freezes both editions. Leaf Beet is approved; the full readers remain available.

The final Harvesting & storage paragraph now begins:

> For overwintering sprouting broccoli, pick the main spear first, then tender side shoots regularly.

The rest of the paragraph is unchanged: early sorts may start in January in
mild seasons, later sorts reach April–May, and later shoots become thinner and
more numerous. The canonical `harvesting` items 3–4 and existing introduction
provide this context. No new growing claim or source correction is needed.

Under the standing crop-review guidance, Soil & preparation loses the generic
“lime only if needed” phrase. The club-root row retains its specific advice to
test before liming. All other text remains exact. The existing Quick facts
grouping was checked and retained, with all nine facts and original icons.

Both editions retain two 185 × 240 mm pages, folios 28–29, the two planting
drawings, four varieties, six selected pest entries and original See also links.
The existing Flea beetle non-selection is unchanged; this task adds or removes
no pest row. Footer clearances remain 3.42 mm and 14.69 mm. Original type sizes,
including 9 pt planting text, are retained.

Both final PDF spreads were visually inspected against the baseline. The
changed harvest paragraph was recovered from its printed bounds in both units.
[Content and preservation checks](CHECKS.json), [PDF checks](checks/broccoli.verified)
and [layout evidence](checks/broccoli.json) record coverage. Canonical data, the
eight approved crop amendments, full review PDFs and main book remain unchanged.

[Editable amendment](../../../../../src/print/book/sowing-rollout/revisions/broccoli.json)
retains exact source text and baseline hashes. Reproduce this unapproved
derivative only with `node scripts/sowing-rollout/build.mjs --revision broccoli`
while Vite runs through `start.command`, then use the bundled Python runtime for
`scripts/sowing-rollout/finish.py --revision broccoli`. No shared renderer code
was changed. An approval file prevents later overwriting.
