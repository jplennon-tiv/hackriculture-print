# POC cleanup — 24 September 2026

John authorised removal of superseded local files and a lighter verification policy.
Removed **6,688 files, about 11.1 GiB** across print and data.

Removed: old output/proof batches, temporary rasters, disposable dist, completed
pilot/normalisation/rollout scripts, accumulated handovers and review boards,
rejected design/art experiments, unreferenced duplicate Troubles drawings,
superseded drafts, transfer evidence and older local backups. No replacement
archive was created. Git repositories/history and dependencies were untouched.

Retained: canonical records, website resources, reader/writer libraries, current
approved artwork and front-matter build inputs, source provenance, the small
reference still linked by the video kit, unresolved editorial questions, latest
page-fit final PDFs/board and the latest exact-byte data rollback. Historical
paths inside audit/provenance fields were not rewritten. The original approval
registries now live under [assets](assets/README.md), without duplicate proof art.

All **155 protected live record/resource/library files** were hash-checked unchanged,
including all 58 canonical crop/trouble records, manifest and navigation groups.
The current transaction backup from [the page-fit receipt](page-fit/SAVE-RECEIPT.json)
remains. Future writes still create exact preceding-byte backups; completed older
snapshots may be pruned. Prepared/unresolved transactions must be preserved.

## Quick checks

- `npm test`: 32 data/layout checks; passed in **335 ms** Vitest time.
- Affected asset/planting tests: 136 checks passed in **244 ms**.
- `npm run check:smoke -- carrot`: login, fonts/images, print readiness and actual
  two-page metric A4 PDF; passed in **3.25 seconds**.
- Shared integrity: 44 vegetables, 14 Troubles groups, eight navigation groups.
- Current document/proof links and preserved front-matter inputs checked.

`check:fit` is the HTML-only alternative; add `--units=both` when relevant.
Use one affected crop by default. Broader `test:all`, type checks and builds are
available when warranted, without requiring repeated suites/builds/catalogue
exports for small POC changes. No full build or catalogue render ran for cleanup.
Routine smoke results overwrite `output/smoke/` instead of dated session folders.

The latest corrected proofs remain at [page-fit/REVIEW.html](page-fit/REVIEW.html).
Known mushroom source and conservative onion fit warnings are recorded in the
single [current status](handover/START-HERE.md). Crop bubbles remain on John's list.
