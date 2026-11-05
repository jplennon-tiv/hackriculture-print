# Capsicum one-off amendment

5 November 2026. [Review both editions](REVIEW.html). John approved both editions; the [approval record](APPROVAL.json) binds the exact
reviewed files. The full readers remain available.

John requested the usual two checks only. The longer Sow indoors fact moves
from a narrow cell to the wider right-hand column. Ready in joins the six-fact
left-hand grid; Sow indoors, Plant spacing and Plant out occupy the right.
All nine facts retain their exact wording and icons. Both units use equal
widths for the two main fact columns. There are no routine pH or liming
references in the current spread, so no gardening advice is removed.

Both editions retain two 185 × 240 mm pages, folios 34–35, two planting drawings,
five varieties and all nine selected pest entries. Footer clearances are
14.97 mm and 6.11 mm; the opening gains 7.88 mm through improved fact wrapping.
Page 2 is unchanged. Original text sizes and the existing artwork treatment
are preserved. No pest entry is cut; the source has no See also links.

Both final PDF spreads were visually inspected against the baseline. Exact
text comparisons confirm all words are preserved, with only fact order changed;
[checks](CHECKS.json), [PDF verification](checks/capsicum.verified) and
[layout evidence](checks/capsicum.json) record coverage. Canonical data,
the eleven approved crop amendments, full review PDFs and main book are unchanged.

[Editable amendment](../../../../../src/print/book/sowing-rollout/revisions/capsicum.json)
retains exact baseline hashes and the fact grouping. The approved files are frozen. The bounded reproduction route was `node scripts/sowing-rollout/build.mjs --revision capsicum`
while Vite runs through `start.command`, then the bundled Python runtime with
`scripts/sowing-rollout/finish.py --revision capsicum`. No shared renderer
code changed. The approval file now prevents overwriting; use a separate revision for later changes.
