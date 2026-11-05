# Globe Artichoke one-off amendment

5 November 2026. [Review both editions](REVIEW.html). John approved this derivative
of the 39-guide review, including the Quick facts arrangement. The [approval](APPROVAL.json)
freezes the exact accepted proofs. The original full reader, combined
PDFs and individual baselines are preserved.

John requested three changes. The introduction now says “distinctive,
fine-flavoured crop”. Soil item 2 reads “Work compost or well-rotted manure deeply
into soil. Mulch.” The final winter-protection tip uses the approved Style A
`mulching.svg`, depicting a pale straw layer around a plant, in place of the cloche
`protection.svg`. The tip wording and crown-protection advice remain intact.

The extra introductory line required rebalancing the existing Quick facts. No
facts or further pest rows were removed. Both editions retain two pages at
185 × 240 mm, folios 10–11, the existing type sizes and all instructional artwork.
Footer clearance is 7.1 mm and 8.81 mm. Actual PDF spreads were inspected in both
units. The prior Petal blight omission remains as recorded in the full review.

[Exact edits and original proof hashes](../../../../../src/print/book/sowing-rollout/revisions/artichoke_globe.json)
bind this derivative to the delivered baseline. [Proof evidence](checks/artichoke_globe.json)
and [PDF checks](checks/artichoke_globe.verified) cover both editions.
[Preservation and delivery checks](CHECKS.json) record the changed copy, icons,
retained content and unchanged full-review files.

Reproduce only this derivative with `node scripts/sowing-rollout/build.mjs
--revision artichoke_globe`, using Vite started through `start.command`, then run
`scripts/sowing-rollout/finish.py --revision artichoke_globe` in the bundled Python
runtime. The builder first recreates and verifies the reviewed baseline before
applying the exact edits. Only the opening facts are rebalanced after the edit.
The practical-page arrangement and omissions remain those of the reviewed proof.
An approval file in this revision directory prevents later overwriting.

John wants the full readers available throughout the crop-by-crop edit and each
amendment shown separately. Start or verify the local launcher when continuing;
do not assume a server persists between sessions. Main-book integration remains
a later step. Canonical gardening JSON is unchanged.
