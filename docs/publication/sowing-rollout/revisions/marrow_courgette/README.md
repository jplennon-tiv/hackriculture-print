# Courgettes and Marrows — pockets and clearer Final tips

5 November 2026. [Review both editions](REVIEW.html). **Approved by John.** The [exact approval record](APPROVAL.json) freezes both editions, copy, composition and artwork.
Folios 46–47 remain a two-page 185 × 240 mm spread. The canonical record,
original 39-crop review and current main book are unchanged.

## Copy and source

Plant spacing now begins “One plant”. A pocket is explained as a hole about
12 in. / 30 cm deep and wide, refilled with soil mixed with mature compost or
well-rotted manure, leaving a slight mound. These are the exact measurements
and technique in the canonical [Courgettes and Marrows record](../../../../../../hackriculture-data/vegetables/marrow_courgette/marrow_courgette.json),
specifically `soil_facts[2].text`, `sowing_and_planting.pocket_depth` and
`pocket_width`. No rounding or primary-data edit is made. The exact canonical
match settles this explanation; no online claims or unsupported local-source
corroboration are added.

John's later addition ends Soil & preparation item 2: “For No-Dig, just make
a low mound of compost; don't dig down.” His wording is retained, with a closing
full stop. This is an author-supplied alternative to the dug pocket; no primary
record or illustration is changed by this addition.

The definition replaces the second Soil & preparation item, immediately above
its new cutaway in Sowing & planting. The displaced mulch, drainage and room
advice remains covered by Looking after the crop, the first soil item, spacing
facts and Plant out. The first soil item's now-redundant pocket instruction is
removed. All three original planting method paragraphs stay verbatim. “Keep one
strong plant” remains in the instructions; the last picture caption becomes the
shorter “Plant out”.

The pollination sentence is shortened while retaining access for insects, the
flower centre and the small fruit identifying the female flower. Harvest and
safety wording is unchanged. John's supplied slug control is used verbatim:
“Protect transplants with greased collars made of cardboard or sectioned plastic
bottles.” This is an editorial instruction from John, not a newly researched
efficacy claim.

## Illustrations and composition

The original sowing drawing is retained beside the prepared-pocket cutaway.
At John's follow-up request, the final transplant drawing now shows the root ball
entering the top of a larger enriched pocket, with the mixed soil visible beside
and below it. The original generic transplant picture remains intact. The
three drawings are bottom-aligned using their visible artwork, not their canvas
edges (alpha above 8); their captions remain level. The pocket drawings show
enriched soil refilling the hole, with no liner or empty cavity. The
new Final tips icons show a green marrow on a board and healthy leaf/stem remains
going into a wooden compost bin. Both tips keep their original wording. The
old generic protection and harvest icons remain intact in the asset collection.
All four new assets are approved as placed in this spread. The later copy changes add
John's No-Dig sentence and remove the Bitterness row from Pests & diseases.
He excludes it because it is neither a pest nor a disease. The Harvesting &
storage instruction to discard unusually bitter fruit remains unchanged.

[Artwork and full prompt](ARTWORK.json) identifies the direct style reference,
generated original and editable SVGs. The PNG is truly transparent outside the
cutaway; coloured RGB values in fully transparent pixels do not print.

An additional pocket paragraph inside planting was too tall. Replacing the
repeated soil paragraph and tightening the pollination sentence provides the
explanation without removing useful methods or pests. The three picture frames
use 54 px height to remove empty vertical space; aspect ratios are retained.
The No-Dig addition uses a 51:49 practical-page split. Removing Bitterness at
John's request allows the original 6 px planting-paragraph gaps to remain.
Seven widths and three arrangements were measured. No fonts or images are
reduced, no additional pest is cut for fit and no other copy is shortened.

## Fit and verification

All ten Quick facts, five varieties and the six remaining pest rows are retained. The existing
Quick facts grouping is retained; non-breaking spaces keep the metric sowing
depths with “cm”. All values and other page-one wording are unchanged. There
were no routine pH/liming references to remove.

The planting prose remains 9 pt. Footer gaps are 9.65 / 5.70 mm in imperial and
6.54 / 5.70 mm in metric. Both actual PDF spreads were visually checked for
legible illustrations, wrapping, complete title, Final tips and See also.
[Checks](CHECKS.json), [PDF verification](checks/marrow_courgette.verified) and
[measurements](checks/marrow_courgette.json) record the coverage. Sixteen approved
individual amendments, the original full review PDFs and current main book
are checked unchanged. Checks confirm that the No-Dig sentence and removal of the Bitterness row
are the only text changes from the preceding proof, and remeasure the visible image bases and
caption clearance in both editions. The previous copy pass passed 26
facts/data-integrity tests; this bounded addition does not alter that logic.
The one-off reader switches
editions with working PDF/comparison links.

## Working sources

- [Exact copy and asset specification](../../../../../src/print/book/sowing-rollout/revisions/marrow_courgette.json)
- [Crop-specific composition](../../../../../src/print/book/sowing-rollout/revisions/courgette-pocket.mjs)
- [Pocket cutaway](../../../../../public/images/planting/marrow_courgette/revision-v1/prepared-pocket.png)
- [Transplant entering the pocket](../../../../../public/images/planting/marrow_courgette/revision-v1/plant-into-pocket.png)
- [Marrow on board](../../../../../public/images/planting/marrow_courgette/revision-v1/marrow-on-board.svg)
- [Compost remains](../../../../../public/images/planting/marrow_courgette/revision-v1/compost-remains.svg)

The builder invokes this composition only for `courgette-pocket-v1` on
`marrow_courgette`. Baseline/source and explicit artwork guards remain in place.
The bounded reproduction route before approval was
`node scripts/sowing-rollout/build.mjs --revision marrow_courgette` with Vite
running through `start.command`, followed by the bundled Python runtime with
`scripts/sowing-rollout/finish.py --revision marrow_courgette`. Do not regenerate
the collection or overwrite approved amendments. This approval now prevents rebuilding these files; use a separate revision for later changes.
