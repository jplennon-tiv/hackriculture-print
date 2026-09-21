# Earlier seven crops: individual pest-table curation

21 September 2026. John requested a fresh draft of the seven five-entry sheets
and a standing method based on useful distinct coverage, editorial fitting and
actual PDF review. The method is now recorded in both AGENTS files and the
print style contract. Neither repeated nor differing counts is a target.

## Editorial decisions

| Crop | Draft entries | Selection and limits |
| --- | ---: | --- |
| Radish | 6 | Five distinct existing problems plus slugs/snails. Do not repeat winter bolting or woody/checked-growth aliases from the shared pool; other generic group problems are mainly described for turnips/swede. |
| Beetroot | 8 | All eight distinct existing conditions, including manganese deficiency, autumn root rots and leaf spot. |
| Carrot | 10 | Adds aphids, black rot, motley dwarf, green tops and violet root rot. Aphid damage and the virus have different signs/actions. Omit occasional swift-moth damage and minor exhibition-only clayburn; parsnip-only old-seed advice stays excluded. |
| Lettuce | 9 | One downy-mildew entry; separate leaf/root aphids, bolting, grey mould, cutworm, tipburn and failure of hearting varieties to heart. Rarer ringspot, nematodes, protected-crop root maggot and mosaic remain in the full master. |
| Broad bean | 8 | All currently applicable source entries: original five plus seed fly, root/foot rot and Fusarium wilt. |
| French bean | 7 | Original five plus root/foot rot and Fusarium wilt. Existing shared applicability exclusions remain respected. |
| Runner bean | 8 | Six distinct original entries plus black bean aphid and seed fly. Nine including root/foot rot still exceeded the budget after editing; weevil is also retained in source for the longer guide. |

The bean group has known legacy applicability conflicts: some descriptions
mention beans while their explicit shared scope says pea. These reviewed shared
records were not silently changed or bypassed during this bounded revision.
The full master remains the longer reference; counts are not a claim that every
possible problem is covered.

Long signs/controls were condensed without changing fonts, padding or artwork.
Three crops needed limited extract edits: one radish care sentence; lettuce
harvest wording and a repeated bolting care step merged into harvest/table
advice; runner care wording and its first harvest paragraph. Runner's metric/
imperial pod lengths remain intact. Changed sections are drafts, with the prior
approved versions preserved in exact-byte backups; other approved sections and
all planting companions remain unchanged.

Organic corrections replace newly exposed carrot aphid/virus prescriptions,
bean root-rot drench advice and beetroot legacy chemical/feeding wording. Full
useful source/control detail is retained in master `text`; table fields contain
concise instructions. The broad-bean tip-pinching instruction is not transferred
to runner beans. No source/schema/renderer redesign or unrelated crop changes.

## Sources

Most additions condense existing shared master descriptions, treatments and
preventions. New/corrected organic advice checked against:

- [RHS growing radishes](https://www.rhs.org.uk/vegetables/radishes/grow-your-own)
  and [RHS radishes with children](https://www.rhs.org.uk/education-learning/children-young-people/family-activities/grow-it/crunchy-radishes): slug/snail relevance.
- [RHS slugs and snails](https://www.rhs.org.uk/biodiversity/slugs-and-snails):
  protecting vulnerable plants and hand removal.
- [RHS aphids](https://www.rhs.org.uk/biodiversity/aphids): inspection, removal
  of damaging colonies and natural predators; no guarantee against viruses.
- [AHDB willow–carrot aphid](https://horticulture.ahdb.org.uk/knowledge-library/life-cycle-and-identification-of-crop-damage-caused-by-the-willow-carrot-aphid):
  the aphid's role in transmitting the viruses causing carrot motley dwarf.

## Checkpoint and verification

Read-only preflight passed before edits at
`6371a3651f79e65caf705b78fdf97dc3b9c2d52406b35e7eb4b9d317e3f99df4`.
Source and draft transactions are recorded in `earlier-redraft-restore.json`.
Initial draft revision:
`b73b33f40a9ce55c848b0aaeae6fb6b3a09a66029f9416e91c75382f6e6b30c8`.
Candidate attempts, including failures after editing, are in
`earlier-redraft-candidates.json`. They are evidence, not a first-pass optimiser.
Final revision:
`c4451d693f2b147763fd431b40b6e97322b03b5eaebee790c79d519a7fa0c6a5`.
Exact original source/approved-extract backup:
`backups/admin/2026-09-21T17-26-33.073Z-c248cd3e-c2e1-450b-bb07-b7c4365c9119`.
Latest preceding-byte measurement backup:
`backups/admin/2026-09-21T17-32-31.502Z-1ac527cf-a274-4bd9-82de-6c4775da79d1`.

All 14 final crop/unit PDFs fit two physical A4 pages with loaded fonts/images,
no print errors/overflow warnings and zero-pixel column-bottom differences.
Exact pest names/counts, organic table controls, varieties, Key Risks (case-
normalised labels), tip icons and source/renderer signatures passed. Adding an
inline runner aphid summary initially lowered its risk priority; the final
save retains the original rank 10 and original Key Risks selection.
All unaffected approved sections and non-trouble master fields, including
planting companions and measurement pairs, match the pre-edit backup. Only
the five documented extract sections became new drafts. Seven changed records
passed schema validation and shared verify-data passed. Renderer/schema/artwork
unchanged; full application tests/build were not repeated for this editorial pass.

Output: `output/pdf/vegetable-earlier-pests-review.pdf`, 14 metric pages.
Both-unit individual proofs and page renders remain under
`tmp/pdfs/vegetable-earlier-pests/`. Final visual checks cover the seven changed
backs and the restored runner risk strip. Counts are 6/8/10/9/8/7/8 in pack order.
All seven revised layouts remain drafts. Broccoli/Brussels sprouts/cabbage,
asparagus/celery and unrelated records were not edited during this redraft.

John's urgent upcoming data cleanup has its own indexed finding list:
[DATA-NORMALISATION.md](../../../hackriculture-data/planning/DATA-NORMALISATION.md).
It records exact file/field paths, alias groups, rank differences, crop-scope
conflicts and resolved versus outstanding items. No catalogue-wide merge done.

Do not rerun `save-earlier-redraft.mjs` or the pure proposal scripts over edited
records. `export-03.mjs --earlier` exports the current seven; then
`assemble-earlier-pests.py` builds the 14-page metric review pack.
`finish-earlier-redraft.mjs` owns current final content/evidence assertions;
older finish scripts assert superseded five-entry selections.
