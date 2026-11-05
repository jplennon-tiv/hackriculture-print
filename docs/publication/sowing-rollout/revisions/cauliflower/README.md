# Cauliflower one-off amendment

5 November 2026. [Review both editions](REVIEW.html). John approved both editions; the [approval record](APPROVAL.json) binds the exact
reviewed files. The full readers remain available.

John requested the usual two checks only. Quick facts use the same five/four
arrangement in both editions, with a 42:58 column split. Harvest, Germination,
Sowing depth and Yield per plant occupy the short cells; Ready in spans that
left-hand column beneath them. Sow, Row spacing, Plant spacing and Transplant
use the wider right-hand column. All nine facts retain their exact wording,
measurements and icons. The existing doubled full stops after the final imperial
spacing abbreviations remain a separate punctuation detail; no source or
measurement correction is made in this check.

The second Soil & preparation item changes “Avoid poor or acid soil; test before
liming.” to “Avoid poor soil.” Its feeding, raking and firming advice is retained.
The specific club-root advice to test before liming, boron-deficiency warning
against excess lime, and whiptail advice about confirmed acidity and deficiency
remain intact. These are diagnostic controls rather than routine liming.

Both editions retain two 185 × 240 mm pages, folios 38–39, two planting drawings,
five varieties, all ten selected pest entries and the existing See also links.
Footer clearances are 7.15 mm and 3.6 mm; the opening gains 4 mm through improved
fact wrapping. Original text sizes and the artwork treatment are preserved.
No pest entry is cut. A 50:50 fact trial failed the clearance check; measured
column trials supported the final wider right-hand column. No shared fitting
code was changed.

Both final PDF spreads were visually inspected against the baseline. Exact
text comparisons confirm unchanged fact values and only the generic soil
acidity/liming removal; [checks](CHECKS.json),
[PDF verification](checks/cauliflower.verified) and
[layout evidence](checks/cauliflower.json) record coverage. Canonical data,
the twelve approved crop amendments, full review PDFs and main book are unchanged.

[Editable amendment](../../../../../src/print/book/sowing-rollout/revisions/cauliflower.json)
retains exact baseline hashes, the fact grouping and before/after text.
The approved files are frozen. The bounded reproduction route was
`node scripts/sowing-rollout/build.mjs --revision cauliflower` while Vite runs
through `start.command`, then the bundled Python runtime with
`scripts/sowing-rollout/finish.py --revision cauliflower`. The approval file now prevents overwriting; use a separate revision for later changes.
