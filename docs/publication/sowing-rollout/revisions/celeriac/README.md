# Celeriac one-off amendment

5 November 2026. [Review both editions](REVIEW.html). John approved both editions; the [approval record](APPROVAL.json) binds the exact
reviewed files. The full readers remain available.

John requested aligned bases for the three Sowing & planting illustrations.
The established Asparagus bottom-alignment method is reused: measure the
visible artwork, excluding transparent margins, then shift each image vertically
to a shared base. Surface sow moves down 0.56 mm, Grow on stays in place, and
Keep the crown clear moves down 3.39 mm. Their visible bases now share the
71.52 mm page coordinate in both editions. Original artwork bytes, painted
sizes and caption positions are preserved; no illustration is redrawn or cropped.
The exact measurements and alpha threshold are in the layout evidence below.

The standing Quick facts check moves the longer Planting depth fact to the
wider right-hand column, with Ready in and Plant out. The shorter Plant spacing
fact joins the six-fact grid on the left. All nine facts retain their wording,
measurements and icons. There are no routine pH or liming references in the
spread, so all gardening copy is unchanged.

Both editions retain two 185 × 240 mm pages, folios 40–41, three planting drawings,
four varieties, all nine selected pest entries and the existing See also links.
Footer clearances are 11.22 mm and 5.29 mm in both units. The improved fact
wrapping gains about 4 mm on the imperial opening and 8 mm on the metric one.
Original text sizes are retained and no pest entry is cut.

Both final PDF spreads were visually inspected against the baseline. Exact
text comparisons confirm unchanged wording, with only Quick facts reordered;
[checks](CHECKS.json), [PDF verification](checks/celeriac.verified) and
[layout evidence](checks/celeriac.json) record coverage. Original image hashes
are bound to the amendment and checked. Canonical data, the thirteen approved
crop amendments, full review PDFs and main book are unchanged.

[Editable amendment](../../../../../src/print/book/sowing-rollout/revisions/celeriac.json)
retains exact baseline/artwork hashes, fact grouping and bottom alignment.
The approved files are frozen. The bounded reproduction route was
`node scripts/sowing-rollout/build.mjs --revision celeriac` while Vite runs
through `start.command`, then the bundled Python runtime with
`scripts/sowing-rollout/finish.py --revision celeriac`. No shared renderer code
changed. The approval file now prevents overwriting; use a separate revision for later changes.
