# Cabbage one-off amendment

5 November 2026. [Review both editions](REVIEW.html). John approved both editions; the [approval record](APPROVAL.json) binds the exact
reviewed files. The full readers remain available.

John requested the usual two checks only. The existing six-short/three-long
Quick facts arrangement fits in both editions; all nine facts, their wording,
icons and placement are retained. The third reminder now says “Add organic
matter.” Soil & preparation now says “Use fertile, firm soil. Tread firm and
rake lightly.” The following cabbage-root-fly advice is unchanged. These edits
remove generic liming references. The club-root row retains its specific
advice to test before liming. All other text is unchanged.

Both editions retain two 185 × 240 mm pages, folios 32–33, two planting drawings,
six varieties, seven selected pest entries and the existing See also links.
Footer clearances are 3.65 mm and 9.91 mm. Original text sizes and the
existing artwork treatment are preserved. No pest entry is cut.

Both final PDF spreads were visually inspected against the baseline. Exact
text comparisons confirm only the two routine-liming removals;
[checks](CHECKS.json), [PDF verification](checks/cabbage.verified) and
[layout evidence](checks/cabbage.json) record coverage. Canonical data,
the ten approved crop amendments, full review PDFs and main book are unchanged.

[Editable amendment](../../../../../src/print/book/sowing-rollout/revisions/cabbage.json)
retains exact before-text and baseline hashes. The approved files are frozen. The bounded reproduction route was `node scripts/sowing-rollout/build.mjs --revision cabbage`
while Vite runs through `start.command`, then the bundled Python runtime with
`scripts/sowing-rollout/finish.py --revision cabbage`. No shared renderer
code changed. The approval file now prevents overwriting; use a separate revision for later changes.
