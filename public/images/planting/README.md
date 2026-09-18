# Installed planting artwork

These are unchanged copies of selected approved-in-principle images from
`docs/planting-illustrations/drafts/2026-09-15/<crop>/` (paths relative to project
root). Only the leading numeric stage prefix was removed from each filename.
All 60 runtime PNGs are unchanged selected originals: 12 pilot assets and 12
each from rollouts 01, 02, 03 and 04, byte-compared in their respective batches.
Seven assets are staged for leaf beet, runner beans and peas, not active.
Originals, revisions, generation prompts and source references remain in the
planting documentation/BATCH manifests; do not overwrite them.

The installed crops are beetroot (2), carrot (3), potato (2), leek (3) and
chicory (2). The column layout currently displays two leek scenes and combines
hole-making into the lowering caption; its unused make-hole image is retained.
Rollout 01 adds parsnip, radish, turnip, swede, spinach and salsify_scorzonera,
two scenes each. Chicory, turnip, spinach and salsify use paired scenes.
Rollout 02 adds broccoli, brussels_sprouts, cabbage, cauliflower, kale and
kohl_rabi, two scenes each; broccoli nursery and kohlrabi sowing use preferred
v2 revisions. Four dense brassica cards use paired scenes.
Rollout 03 adds garlic, onion_shallot, lettuce, endive and oriental_leaves,
two scenes each; all except garlic use paired scenes. Two further leaf-beet
scenes are installed but inactive pending its existing overflow fix. Endive
sowing reuses chicory v2; leaf-beet sowing reuses beetroot seed-clusters v2.
Rollout 04 adds broad/French beans (two scenes each) and sweetcorn (three assets,
two displayed: intact-root planting plus block v4). The original sowing scene
remains available. Runner beans (three scenes) and peas (two) are staged only.
All images keep their full transparent canvas. See ROLLOUT-04.md for the latest
checks; five pilots are user-approved, the next twenty guides await review.

`src/print/plantingIllustrations.ts` owns scene selection and size limits.
Editable captions belong to `print_planting` in the shared master, not PNGs.
Measurement labels read live master fields in the chosen units. See
`docs/planting-illustrations/IMPLEMENTATION.md` before extending the pilot set.
