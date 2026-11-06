# Cucumber, Outdoor — corrected Final tips icon

5 November 2026. [Review both editions](REVIEW.html). **Approved by John.** The [exact approval record](APPROVAL.json) freezes both editions and their supporting files.
Folios 50–51 remain a two-page 185 × 240 mm spread. No canonical edit or
main-book integration is made.

The first Final tip now reuses the exact approved
[fruit-on-board icon](../../../../../public/images/planting/marrow_courgette/revision-v1/marrow-on-board.svg)
from Courgettes and Marrows, as John requested. It replaces the incorrect
protection/cloche icon. The [Courgettes approval](../marrow_courgette/APPROVAL.json)
binds the reused asset; no drawing or other image is changed.

All wording is preserved in both editions, including both tips. The ten Quick
facts fit in their original arrangement. A trial moving Row spacing to the wide
column made the imperial opening more crowded (1.98 mm footer gap), so that
trial was discarded. No routine pH/liming references occur. All four varieties,
eight selected pest rows, original planting drawings and See also remain.
The original review's Poor fruit set omission is retained; no additional entry
is cut.

The final footer gaps are 3.36 / 6.32 mm in both editions. Both actual PDF spreads
were visually checked against the original, including the corrected icon at
book size, Quick facts, title and footer. The [checks](CHECKS.json),
[PDF verification](checks/cucumber_outdoor.verified) and
[measurements](checks/cucumber_outdoor.json) record exact text preservation,
asset/source hashes and reader links. Eighteen approved individual amendments,
the original full review and the main book remain unchanged. No app-wide tests
are needed for this bounded icon substitution.

The [amendment specification](../../../../../src/print/book/sowing-rollout/revisions/cucumber_outdoor.json)
contains the single guarded image-path change and approved asset hash. With Vite
running through `start.command`, the reproduction route is
`node scripts/sowing-rollout/build.mjs --revision cucumber_outdoor`, followed by
the bundled Python runtime with
`scripts/sowing-rollout/finish.py --revision cucumber_outdoor`.
Do not regenerate the collection or overwrite approved amendments. This approval now prevents rebuilding these files; use a separate revision for later changes.
