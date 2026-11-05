# Jerusalem Artichoke one-off amendment

5 November 2026. [Review both editions](REVIEW.html). John approved this derivative,
including the Quick facts arrangement. The [approval](APPROVAL.json) freezes the
exact accepted proofs. The original full review reader and PDFs remain available.

The **Plant tubers** paragraph now starts “Plant in Feb–Mar, or later if the soil
is too wet to work.” These dates and the qualification come from the existing
Quick fact. John explicitly requested this crop-specific repetition to make
better use of the practical panel. All planting measurements and handling remain.

The **In severe frost** tip uses the approved Style A `mulching.svg`, depicting a
loose straw layer around a plant, instead of the cloche `protection.svg`. The
tip's existing straw-covering wording remains. Under John's new crop-review rule,
the general “very acid” qualification is removed from Soil & preparation;
winter waterlogging and clay improvement advice remain. There is no other pH or
liming instruction on this spread.

Quick facts now group six short entries beside two wider, longer entries, using
a 54:46 split. All eight facts, icons and text sizes remain. Both editions keep
two pages at 185 × 240 mm, folios 12–13, all three pest entries and both original
planting drawings. Footer clearances are 33.4 mm and 6.17 mm. Both final PDF
spreads were visually inspected against the original review.

[Exact edits and original proof hashes](../../../../../src/print/book/sowing-rollout/revisions/artichoke_jerusalem.json)
bind this derivative to the delivered baseline. [Proof evidence](checks/artichoke_jerusalem.json),
[PDF checks](checks/artichoke_jerusalem.verified) and [preservation checks](CHECKS.json)
record both editions. Canonical gardening JSON and the main book are unchanged.

Reproduce only this derivative with `node scripts/sowing-rollout/build.mjs
--revision artichoke_jerusalem`, with Vite started through `start.command`, then
`scripts/sowing-rollout/finish.py --revision artichoke_jerusalem` in the bundled
Python runtime. The original review is recreated and checked before the exact
edits and requested fact grouping are applied. An approval file in this revision
directory prevents later overwriting.
