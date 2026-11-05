# Runner Bean one-off amendment

5 November 2026. [Review both editions](REVIEW.html). John approved this derivative on 5 November. The [approval record](APPROVAL.json) freezes both editions. French Bean is approved; the full readers remain available.

At John’s request, Quick facts now reads **Yield (10 ft single row): Between
15–30 lb.** The metric proof reads **Yield (3 m single row): Between 7–14 kg.**
This follow-up changes only the displayed wording; the canonical evidence and
qualifications are retained. At the guide's
9 in spacing, about 13 plants multiplied by the researched 0.5–1 kg per plant
gives a rounded seasonal planning estimate. A double row would give roughly
twice as much. The printed label explicitly identifies a single row.

[Research and calculation](../../../../../../hackriculture-resources/summaries/runner-bean-yield/research-notes.md)
record the empty canonical fields, historical removal of an unsupported fixed
double-row yield, local-source gap, Which? trial, Sarah Raven comparison and
rounding. This is a derived estimate for fresh pods from climbing types,
not a direct row trial, guarantee, dwarf-bean or dried-bean yield.

John expressly authorised a researched source update. The
[guarded save receipt](SAVE-RECEIPT.json) records the exact previous-byte backup
and before/after hashes. Only `yield.by_variety.climbing.per_10_ft_row`, its new
`metadata.yield_research` provenance and automatic leaf attribution changed.
General/dwarf yields remain empty; the historical decision and all other source
advice remain intact. The existing saved layout, approval state and old yield
dependency are preserved: it now correctly reports stale. Its approval is not
silently extended to the extra fact. No schema or shared rendering rule changed.

The print builder accepts this exact documented source update while keeping the
old snapshot and baseline text checks. It adds the existing yield icon and
regroups all ten Quick facts into six short entries and four longer ones, with
a 53:47 width split. The metric proof rounds the helper's 6.8–13.6 kg conversion
to whole kilograms. The general lime/pH sentence is omitted only in this print
draft under John's standing guidance.

Both editions retain two 185 × 240 mm pages, folios 22–23, all three planting
drawings, five varieties, eight pest entries, original type and the See also link.
Footer clearance is 3.69 mm on page 1 and 7.94 mm on page 2. No pest cuts were
needed. Both final PDF spreads were visually inspected against the baseline.
[Checks](CHECKS.json), [PDF verification](checks/bean_runner.verified) and
[layout evidence](checks/bean_runner.json) record the coverage. Focused facts and
data-integrity tests passed: 26 tests. The six approved crop derivatives, full
review PDFs and main book are unchanged.

[Editable amendment](../../../../../src/print/book/sowing-rollout/revisions/bean_runner.json)
binds this proof to both source hashes and the receipt. Reproduce only this
derivative using `node scripts/sowing-rollout/build.mjs --revision bean_runner`,
then the bundled Python runtime with `scripts/sowing-rollout/finish.py --revision
bean_runner`; Vite must run through `start.command` for the first step. Do not
repeat the consumed canonical save or refresh the old snapshot to hide its
source revision. A later approval file prevents overwriting this derivative.
