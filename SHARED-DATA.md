# Shared data

The [shared contract](../hackriculture-data/SHARED-DATA.md) is authoritative.

| Resource | Location |
| --- | --- |
| 44 crop records | `../hackriculture-data/vegetables/<key>/<key>.json` |
| 14 trouble groups | `../hackriculture-data/troubles/<key>/<key>.json` |
| Stable record ordering | `../hackriculture-data/records.json` |
| 8 navigation groups | `../hackriculture-data/vegetable_groups.json` |
| Reader / revision-guarded writer | `../hackriculture-data/lib/records.mjs` |
| Disposable browser projections | `../hackriculture-data/generated/master/` |
| Exact prior-byte transaction backups | `../hackriculture-data/backups/admin/` |
| Website's separate editorial layer | `../hackriculture-data/website/` |

Read with `readCollection`; write with `saveCollections` and `expectedRevision`.
Preserve keyed objects, unknown fields, source prose, ranks, unit pairs, month
fragments, locks and manual edits. Every changed record gets exact preceding-byte
backup and leaf-level attribution. A stale revision rejects the save. Never edit
projections or recreate root/local aggregate masters. Vite refreshes projections
at startup/build and when records change.

AI scope defaults to `ai_` fields; John's explicitly authorised source corrections
use the admin-correction workflow with honest AI attribution. New copy cannot be
self-approved. Print dependency signatures detect source/manual changes; refresh
affected companions only after reviewing their meaning, not just their checksums.

The current book-preparation task does not change canonical gardening records.
New book copy lives in separate exact-source-checked working drafts under
`src/print/book/`; the handover and preparation checkpoint identify their status.
Standing authority for researched source corrections applies when that editorial
work is in scope, not automatically during layout or publication preparation.

Current shared print companions: source-linked `ai_print_extracts`, `ai_print_layout`,
`print_planting`, and Troubles `ai_print`/`ai_layout` or legacy `print_summary`.
These supplement full master advice. Approved/current outputs are reused without
AI; stale/draft outputs fall back or require explicit review mode. Measurements
bound to master paths resolve in the chosen unit system.

Website paragraphs and video productions are independent reviewed resources;
master corrections do not rewrite or republish them automatically. Keep sibling
folders together and check affected consumers only when their contract changes.

Cleanup policy (John, 24 September): Git holds historical source, scripts and
artwork. Old local backups may be pruned after successful transactions; retain the
latest rollback and any unresolved/prepared transaction. Do not accumulate whole
project, media or PDF backups. Future writes must still make exact-byte backups.
The latest [variety save receipt](docs/variety-review/SAVE-RECEIPT.json) identifies
the 43-list refresh and its exact-byte transactions. The
[onion receipt](docs/onion-planting/SAVE-RECEIPT.json) records the earlier
single-record correction. The earlier
[content-refinement receipt](docs/content-refinement/SAVE-RECEIPT.json) records
the 30 September 44-record transaction. Historical record metadata is provenance, not an instruction to
recreate removed review files.

John's 1 October variety policy retains the complete master catalogue, including
lower-priority entries for possible extended sheets. Rank and concise print
`short_text` do not replace full source advice. Print reads nested variety groups
recursively and uses the existing per-guide `variety_count`; duplicate names may
remain under different source groups but print once. See the
[source-linked decision ledger](../hackriculture-data/planning/variety-refresh/DECISIONS.json)
for revised ranks, evidence, provisional legacy entries and unresolved identities.
