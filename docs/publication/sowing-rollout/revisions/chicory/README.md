# Chicory — approved expanded forcing

5 November 2026. [Review both editions](REVIEW.html). Approved by John. The [exact approval record](APPROVAL.json) freezes both editions, copy and artwork.
Folios 44–45 remain a two-page 185 × 240 mm spread. No main-book integration or
canonical Chicory edit is made.

## Copy and composition

The wider left column carries Sowing & planting, followed by three numbered
forcing steps and a matching illustration strip: prepare the root, pot it with
its crown exposed, then exclude light. The exact source supplies November
lifting, the minimum crown size and leaf-trimming height (1 in. / 2.5 cm), moist
compost, cool sand storage, intact growing point and forcing temperature
(50–59°F / 10–15°C). No quantities are rounded in this research task.
Opaque-bucket/pot construction is checked against the sources in the
[research record](../../../../../../hackriculture-resources/summaries/chicory-forcing/SOURCES.md).

The two generic sow/thin pictures are intentionally replaced by three forcing
scenes in this approved revision. They remain intact in the original guide and asset
folder. The initial arrangement with both old and new drawing sequences
exceeded the footer by 22.60 mm. The revised composition gives the difficult
operation visual priority. [Artwork and prompt](ARTWORK.json) records the built-in
image generation, direct style reference, generated original and workspace asset.
The new SVG dark-cover icon is an opaque upturned bucket over a pot, replacing
the incorrect cloche. Both new assets are approved as placed in this spread.

The top-left batch-forcing tip and bottom-right variety-choice tip are removed
as requested. Their information moves into planting. The two retained tips
(slugs/rot under covers; moisture and discarding rotten roots) keep their exact
wording. Three forcing items move out of Looking after the crop, leaving routine
thinning, hoeing and watering. Soil, care and harvest prose is tightened without
losing the practical conditions. Harvesting explicitly measures the three or
four weeks from forcing, retains the root, and describes a possible smaller
second crop. Cool storage of harvested chicons is restored from the full master.
The old doubled full stop after the imperial baby-leaf spacing is corrected.

The usual checks remove generic pH 6–7 from Soil & preparation and regroup all
eight Quick facts: six shorter facts left, Sow and Plant spacing in the wider
right column (48:52). All facts and their values, all four varieties, introduction,
calendar, risks, hero, title and reminder banner are retained.

## Fit and verification

The final practical-page split is 56:44. Six column widths were measured with
all five pest entries present; no pest is cut and no main type is reduced.
The planting prose remains 9 pt. Footer gaps are 10.05 mm on page 44 and 3.75 mm
on page 45 in both editions. Title, Final tips and See also remain complete.
Both actual PDF spreads were visually compared with the original and inspected
for clarity, image anatomy/cover mechanics, captions, wrapping and clipping.

[Checks](CHECKS.json), [PDF verification](checks/chicory.verified) and
[layout measurements](checks/chicory.json) record exact coverage. The source hash,
frozen baseline PDFs, fifteen approved individual amendments, full review PDFs
and current main book are checked unchanged. Focused tests passed: 26 tests in
`src/lib/facts.test.ts` and `src/data.integrity.test.ts`; syntax and diff checks
also passed. The one-off reader switches both editions with working links.

## Working sources

- [Editable copy and exact edits](../../../../../src/print/book/sowing-rollout/revisions/chicory.json)
- [Crop-specific composition](../../../../../src/print/book/sowing-rollout/revisions/chicory-forcing.mjs)
- [New illustration](../../../../../public/images/planting/chicory/forcing-v1/forcing-sequence.png)
- [Editable cover icon](../../../../../public/images/planting/chicory/forcing-v1/opaque-cover.svg)

The builder invokes this composition only for `chicory-forcing-v1` on Chicory;
other crop revisions retain their existing paths. Its art guard accepts the
explicit replacement list while retaining baseline/source hash guards. Failed
revision fits save a diagnostic HTML in `tmp/sowing-rollout/`; these are not
review outputs. The original layout/fitting rules and frozen guides are unchanged.

The bounded reproduction route was
`node scripts/sowing-rollout/build.mjs --revision chicory` while Vite is running
through `start.command`, then the bundled Python runtime with
`scripts/sowing-rollout/finish.py --revision chicory`. The approval now prevents
overwriting these files. Use a separate revision for later changes; do not
regenerate the set.
