# Cucumber, Greenhouse — identifying the flowers

5 November 2026. [Review both editions](REVIEW.html). **Approved by John.** The [exact approval record](APPROVAL.json) freezes both editions and their supporting files.
Folios 48–49 remain a two-page 185 × 240 mm spread. No canonical edit or
main-book integration is made.

## Copy and sources

Looking after the crop item 3 begins: “Female flowers have a tiny cucumber
behind the petals; males have just a thin stalk.” The existing flower-management
and feeding text follows unchanged, retaining the important seed-packet check:
remove males where unpollinated fruit is required, including occasional males
on all-female plants; retain them when the variety needs pollination.

The exact master supplies that management advice but not the identifying
features. John's local sources contain no matching explanation. RHS supplies
the female swelling/male absence, and Moles Seeds supplies the male thin stalk.
The [dated claim/source record](../../../../../../hackriculture-resources/summaries/cucumber-flower-identification/SOURCES.md)
records the narrow scope and specific references. A short sentence provides the
requested distinction; no new illustration is needed for this proposal.

John explicitly removes Slugs and snails from the table to make room for the
explanation. The other seven selected rows keep their wording and order. The
original review's omission of Withering of young fruit remains; no extra row
is removed for this amendment. Original planting, soil, harvest, reminder and
Final tips wording, all four selected varieties and all existing artwork remain.

## Usual checks and fit

All eight Quick facts retain their values and icons. Harvest, Germination,
Sowing depth and Yield per plant share the short-fact grid, with Ready in across
its width. Sow indoors, Plant under glass and Plant spacing move together into
the wider column. The outer split is 48:52. There are no routine pH/liming
references to remove.

The practical-page columns change slightly from 38:62 to 37:63, giving the
expanded care text enough width. The unchanged arrangement keeps planting
on the left and soil/care/harvest on the right. Trials from 34:66 to 42:58 showed
that 37:63 is the smallest change achieving a full line saving; at 38:62 the
footer gap was 2.85 mm. Body type remains unchanged, including 9 pt planting.
Both editions have footer gaps of 14.12 / 6.78 mm.

Both actual PDF spreads are checked against the original for Quick facts
readability, complete new sentence, preserved images, table, title and See also.
[Checks](CHECKS.json), [PDF verification](checks/cucumber_greenhouse.verified)
and [layout measurements](checks/cucumber_greenhouse.json) record the coverage.
The reader switches units with working PDF and before-comparison links.
Seventeen approved individual amendments, the original combined review PDFs
and current main book remain unchanged. Source hashes and all unaffected copy
are verified; the canonical record is unchanged.

## Reproduction

[The exact amendment](../../../../../src/print/book/sowing-rollout/revisions/cucumber_greenhouse.json)
contains the one sentence, guarded Slugs and snails row removal, fact grouping
and narrow column change. The shared one-off builder now recognises an explicit
`remove: true` edit only after its normal unique-element and exact-source check;
existing amendments do not use it and are not regenerated.

With Vite running through `start.command`, run
`node scripts/sowing-rollout/build.mjs --revision cucumber_greenhouse`, then
the bundled Python runtime with
`scripts/sowing-rollout/finish.py --revision cucumber_greenhouse`.
Do not regenerate the collection or overwrite approved amendments. This approval now prevents rebuilding these files; use a separate revision for later changes.
