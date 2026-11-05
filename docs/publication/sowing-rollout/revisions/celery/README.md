# Celery one-off amendment

5 November 2026. [Review both editions](REVIEW.html). Approved by John; the [exact approval record](APPROVAL.json) freezes both editions.
The full readers remain available; the main book is unchanged.

John requested trench-row spacing of **3 ft**, replacing 3 ft 3 in., and then
explicitly retained **1 metre** in metric. Measurements should be convenient to
remember and measure independently in each unit, rather than exact conversions.
Block spacing remains 10 in. / 25 cm.

The authorised primary-data correction changed three imperial strings only:
`soil_facts.3.text.imperial`, `soil_facts.3.short_text.imperial` and
`sowing_and_planting.row_spacing.imperial`. The guarded save retained exact prior
bytes and added automatic field attribution. Metric advice, unrelated fields,
historical normalisation decisions and print-companion approvals are preserved.
The [save receipt](SAVE-RECEIPT.json) records hashes, backup and dependency checks.
The old canonical layout and affected extracts correctly report stale source;
this separately bound print proof does not renew their historical approval.
The source save is complete and must not be replayed.

The two incorrect cloche symbols in Final tips are replaced by the approved
[coloured gardening-gloves icon](../../../../../public/images/coloured-icons/style-a-v1/gloves.svg)
and the existing [naturalistic slug](../../../../../public/images/key-risk-icons/naturalistic-v3/slug.png).
Their bytes are unchanged and their hashes are bound to the amendment. The full
gloves/long-sleeves safety instruction and slug-tip wording remain unchanged.

The usual checks group five Quick facts on the left and four longer facts on
the right, using 42:58 column widths; Sow indoors spans the left column. All nine
facts remain, with only the requested imperial row measurement changed. The
generic “do not lime routinely” aside is removed from working print copy only.

Both editions retain two 185 × 240 mm pages, folios 42–43, four varieties,
all four selected pest entries, two planting drawings and See also links.
Footer clearances are 6.03 mm and 4.30 mm; no pest entry or text size is cut.
Both finished PDF spreads were visually inspected. [Checks](CHECKS.json),
[PDF verification](checks/celery.verified) and [layout evidence](checks/celery.json)
record coverage. Fourteen earlier approved amendments, original full-review
PDFs and the main book are preserved.

The [editable amendment](../../../../../src/print/book/sowing-rollout/revisions/celery.json)
binds the frozen baseline, consumed source-save receipt and exact icon hashes.
The one-off builder now accepts an optional `unit` on exact edits, allowing the
imperial measurement to change without altering metric. Both editions exercise
that route; no shared renderer or layout rule changed. Reproduction uses
`node scripts/sowing-rollout/build.mjs --revision celery` with Vite started by
`start.command`, followed by the bundled Python runtime with
`scripts/sowing-rollout/finish.py --revision celery`. Do not rebuild the catalogue.

The approval prevents overwriting these proofs. Use a separate revision for later changes.
