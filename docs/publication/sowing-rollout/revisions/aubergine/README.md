# Aubergine one-off amendment

5 November 2026. [Review both editions](REVIEW.html). John approved this derivative,
including the Quick facts arrangement and acidity removal. The [approval record](APPROVAL.json)
freezes both editions. The original full readers and PDFs remain available.

Under **Plant out**, John's exact replacement is “Wait until the soil is warm
before planting.” The remaining handling, hardening-off and protection advice
is unchanged. Under his standing crop-review guidance, the general “Slightly acid
to neutral soil suits the crop” sentence is removed from Soil & preparation.
The pot/growing-bag quantities and cold, sodden-root warning remain.

Quick facts group six shorter entries in the left grid and give Sow indoors and
Plant out the wider right-hand column, with a 54:46 overall split. All eight
facts and icons remain at their existing type sizes. No other copy changes.

Both units retain two 185 × 240 mm pages, folios 16–17, all original artwork,
four varieties and six selected pest entries. The original rollout's Flea beetle
omission remains; no further entry is cut. Both final PDF spreads were inspected
against the original review. Footer clearance is 14.71 mm on page 1 in both
editions; page 2 has 4.08 mm imperial and 3.28 mm metric. The See also link remains
and points to its original destination in the current main book.

[Exact amendments and original proof hashes](../../../../../src/print/book/sowing-rollout/revisions/aubergine.json),
[layout evidence](checks/aubergine.json), [PDF checks](checks/aubergine.verified)
and [preservation checks](CHECKS.json) record the result. Canonical gardening
records, approved crop proofs and the main book are unchanged.

Reproduce only this derivative with `node scripts/sowing-rollout/build.mjs
--revision aubergine`, with Vite started through `start.command`, then
`scripts/sowing-rollout/finish.py --revision aubergine` in the bundled Python
runtime. An approval file in this revision directory prevents overwriting.
