# Broad Bean one-off amendment

5 November 2026. [Review both editions](REVIEW.html). John approved this derivative,
including the clearer crop-rotation wording and lime/pH removal. The
[approval record](APPROVAL.json) freezes both editions. The original full readers
and PDFs remain available.

The first Soil & preparation item now reads:

> Choose a sunny spot with moisture-retentive, well-drained soil. Avoid ground where beans grew last year.

This resolves the ambiguous “without last year's beans” as crop rotation,
not an instruction to remove old bean plants. The canonical `soil_facts.0.text`
and `soil_facts.1.text`, read through the shared record reader, supply the
soil requirements, sunny site and previous-year exclusion. The rewrite preserves
that meaning. Under John's standing crop-review guidance, the general lime/pH
sentence is removed. No new measurements, intervals or research claims are added.

Quick facts already have six short entries beside three longer entries. This
arrangement was inspected and retained, with all nine facts and icons unchanged.
The entire opening page is unchanged from the original full review. Both units
retain two 185 × 240 mm pages, folios 18–19, original artwork, five varieties and
all eight pest entries. Footer clearance remains 5.78 mm on page 1 and 5.25 mm
on page 2 in both editions. The original See also destinations remain.

[Exact amendment and original proof hashes](../../../../../src/print/book/sowing-rollout/revisions/bean_broad.json),
[layout evidence](checks/bean_broad.json), [PDF checks](checks/bean_broad.verified)
and [preservation checks](CHECKS.json) record the result. Both final PDF spreads
were visually inspected against the original review. Canonical gardening
records, approved crop proofs and the main book are unchanged.

Reproduce only this derivative with `node scripts/sowing-rollout/build.mjs
--revision bean_broad`, with Vite started through `start.command`, then
`scripts/sowing-rollout/finish.py --revision bean_broad` in the bundled Python
runtime. An approval file in this revision directory prevents overwriting.
