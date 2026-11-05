# Brussels Sprouts one-off amendment

5 November 2026. [Review both editions](REVIEW.html). John approved both editions; the [approval record](APPROVAL.json) binds the exact
reviewed files. The full readers remain available.

John requested the usual two checks only. The existing six-short/three-long
Quick facts arrangement fits clearly in both editions; all nine facts, their
wording, icons and placement are retained. Soil & preparation loses the general
“Lime acid soil if needed.” instruction. The club-root row retains its specific
advice to test before liming. All other text is unchanged.

Both editions retain two 185 × 240 mm pages, folios 30–31, two planting drawings,
four varieties, six selected pest entries and the existing See also links.
Footer clearances remain 7.16 mm and 10.66 mm. Original text sizes and the
existing artwork treatment are preserved. The previous bottom-table omission
of Blown sprouts remains unchanged; its explanation in the introduction and
care section is retained. No new content or table selection is introduced.

Both final PDF spreads were visually inspected against the baseline. Exact
text comparisons confirm only the requested routine-liming removal;
[checks](CHECKS.json), [PDF verification](checks/brussels_sprouts.verified) and
[layout evidence](checks/brussels_sprouts.json) record coverage. Canonical data,
the nine approved crop amendments, full review PDFs and main book are unchanged.

[Editable amendment](../../../../../src/print/book/sowing-rollout/revisions/brussels_sprouts.json)
retains exact before-text and baseline hashes. The approved files are frozen. The bounded reproduction route was `node scripts/sowing-rollout/build.mjs --revision brussels_sprouts`
while Vite runs through `start.command`, then the bundled Python runtime with
`scripts/sowing-rollout/finish.py --revision brussels_sprouts`. No shared renderer
code changed. The approval file now prevents overwriting; use a separate revision for later changes.
