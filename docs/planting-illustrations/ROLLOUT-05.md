# Rollout05 - complete, lighter review workflow

17 September 2026. Start checkpoint:
../hackriculture-data/backups/documentation/2026-09-17-planting-rollout05-start.RoOIHg/.

Four new companions: marrow_courgette, squash_pumpkin, cucumber_outdoor,
cucumber_greenhouse. Eight unchanged selected/reused assets installed.
Three previously staged crops included in review output: leaf beet, runner beans,
peas. No padding or granular source prose changed; leaf-beet text is untouched.

Explicit `plantingReview=1` print-page mode includes staged layouts and retains
minimum-size art without treating overflow as a production fit success. It still
checks source validity and waits for assets. Card heading says REVIEW. Normal PDF
endpoints do not forward this parameter and retain their production safeguards.
scripts/review-planting-rollout05.mjs exports all seven in metric, marking draft
PDF headers and recording any normal-layout failure in results.json. No full
regression suite/cross-project builds planned; focused code checks and spot review.

Completed: seven PDFs and combined `output/pdf/planting-rollout05/planting-rollout05-A4-metric.pdf` (17 pages). Leaf beet, runner beans and peas are labelled three-page review drafts. Four new cucurbit guides are two-page normal illustrated outputs. Readiness checks passed; spot-reviewed four backs. Focused planting tests (59), TypeScript and shared verifier passed; no full regression suite or cross-project builds. Original master values were preserved. Current state is included in the populated rollout06 start and complete checkpoints; do not rely on the interrupted rollout05-complete directory.
