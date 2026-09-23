# Overnight vegetable normalisation — authorised 22 September 2026

John: “Looks good SO FAR ... continue overnight and finish all the vegetables if
you can. I will review in full tomorrow.” This supersedes earlier instructions
to stop after a small batch or wait for a diff review. It does not approve new
outputs in advance. Continue the work in this task and the existing checkout.

Read the live queue in `../../../hackriculture-data/planning/NORMALISATION-OVERNIGHT-PROGRESS.json`.
It starts with 33 remaining records, including a consistency check of the earlier
kale pilot; 11 crops already completed in batches 01/02 remain part of the final
44-crop review index. Do not rewrite completed crops without a new finding.

## Work to complete

Inspect each remaining crop's complete reader source, all variety groups,
structured measurements, summaries, cyclic calendars, inline problems and print
companions. Check semantic plausibility, imported source headings masquerading
as crop/variety types, duplicated identities, contradictory copies, false host
advice, blank meaningful fields, and imperial/metric inconsistencies. Do not
count an automated regex pass alone as a completed crop review.

Use RHS growing guidance first, then primary horticultural research and seed
producers to resolve factual conflicts, names and legacy claims. Correct the
most likely spelling; distinguish proven aliases from editorial inference and
retain genuinely different selections. Remove unsupported claims rather than
invent replacements. Keep useful granular advice and unknown fields. No
wholesale modern-variety replacement or ungrounded rankings. Practical spacing
may round to familiar values within roughly 10–15%; simplify conflicting routes
to mainstream advice while retaining meaningful crop/harvest distinctions.
Do not percentage-round temperature, pH, treatment doses or biological limits.

Organic controls only. State the practical organic method and move on: never
mention chemical alternatives merely to dismiss them. Research remedies for
the crop/problem; preserve useful diagnostic and safety qualifications.

Work through small batches (normally 4–6, adjusted for complexity), continuing
multiple batches in a run when feasible. Save exact prior bytes using the
revision-guarded `hackriculture-data/lib/records.mjs` admin correction workflow
and honest AI attribution. Preserve user edits, manual locks, ranks, keyed
objects, unit pairs and cyclic `--MM` values. No source mirrors, commits or pushes
needed. Shared JSON backups only, no project/media copies.

Review affected captions and condensed extracts against the corrected master
before refreshing dependencies. Preserve fonts, padding, art, saved selection
counts, useful full source advice and approved design. Final Tips remain 2–4 as
space allows. Known speech-bubble overlap is deferred. Mushroom's kit-growing,
sparse-page/missing-sowing-source exception must not be hidden with invented data.
All newly changed layouts remain draft for John's review. Unchanged, audited
records may retain their approval and checked proofs; record a no-change audit.

For changed crops, render separate two-page A4 PDFs in both units using the
existing renderer and start.command loopback server. Reuse validated exporters
from docs/vegetable-ai-pilot and helper
`hackriculture-data/planning/normalisation-02-tools.mjs`, adapting expected
revisions/keys/output paths explicitly. The helper assumes print_planting and
extracts exist: handle genuine missing fields deliberately, particularly mushroom.
Save current layout/source/PDF hashes and both-unit measurements. Fix new overflow
by concise source-linked print wording, not font/padding reduction or arbitrary
pest-row deletion. Inspect four/five representative crops per substantive batch
in both units; basic readiness/source/page checks on all changed crops. Use the
PDF skill, including its authoring marker once before first PDF write per run.
Never create/open a giant combined preview PDF.

Validate JSON/schema and semantic consistency per batch; run focused/full tests
and build when required by code changes, and a final suite/build for the completed
catalogue. Avoid repeatedly running whole suites for prose-only substeps. Record
actual tests, failures and limitations. Website/video are excluded: do not edit,
rebuild, research their bindings or deploy them. Separate shared Trouble records
remain unchanged; record issues needing their later reconciliation. Resolve
crop-inline problems within this scope rather than just carrying errors forward.

## Durable progress and morning delivery

After every save/checkpoint update the live JSON queue with completed keys,
pending keys, evidence/decision paths, exact backup receipts and any exceptions.
Do not mark a crop complete before its required checks pass. Record why a source
claim was retained, changed or removed. An unresolved fact may be clearly qualified
or withdrawn with provenance; continue independent crops instead of blocking the
whole queue. Never bypass locked/manual content.

Maintain a short `NORMALISATION-OVERNIGHT-REVIEW.html` and companion Markdown in
shared planning: per-crop decision summaries, optional expandable diffs/evidence,
and links to individual metric/imperial PDFs (reuse checksum-current earlier
proofs). Update `START-HERE.md`, `NEW-SESSION-PROMPT.md` and preflight's expected
revision/draft set to match actual live state. Earlier approval checkpoints are
history; this overnight instruction is current. Keep existing uncommitted work.

On completion, verify all 44 records are accounted for and the index links work,
save an honest completion/exception report, then pause the heartbeat using
`automation_update`. Stop only the verification server and temporary sleep
inhibitor started for this job. No automatic approval of new drafts.
If work is incomplete at 08:00 Europe/London on 23 September, save progress and
report the exact remainder for John's morning review; pause further unattended
runs at that boundary. This is not permission to claim completion prematurely.

Automation: recorded in the live progress JSON once created. Its prompt and
status should be read through the app tool before updates. No subagents.
