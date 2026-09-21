# Batch 03: broccoli, Brussels sprouts and cabbage

**Superseded by the fuller-pest revision on 21 September:** see
[PESTS-REVISION.md](PESTS-REVISION.md) for the current six/seven/seven-entry
proofs, authorised organic master corrections, earlier-crop review pack and
restore point. The following is the original four-entry batch history, not
the current source/approval state. Do not rerun its authoring/finish scripts.

21 September 2026. Review pack complete; all three new companions are **draft**.
The nine earlier approvals and all master prose/artwork are preserved.

Output: `output/pdf/vegetable-batch-03-review.pdf` (six metric A4 pages).
Individual metric/imperial proofs and page renders: `tmp/pdfs/vegetable-batch-03/`.
Current total: **12 prepared / 44; nine approved, three draft, 32 unprepared**.

Final shared revision:
`6b47a3018f9abec6728ebd6f14cd05ecbf413f05634dad9e3ef5577f6c68151a`.
Latest previous-byte measurement checkpoint: shared
`backups/admin/2026-09-21T16-29-59.001Z-ba99bfc5-d3bb-4931-8d8c-b005faf0349f`.
All six transaction journals completed. These are restore identifiers, not
instructions to overwrite newer work. Use the shared journal-based restore
procedure only after stopping writers and checking the current revision.

| Crop | Intro sentences | Varieties | Final Tips |
| --- | ---: | ---: | --- |
| Broccoli | 3 | 5 | Full width, 3 tips |
| Brussels sprouts | 3 | 4 | Full width, 3 tips |
| Cabbage | 3 | 6 | Full width, 3 tips |

All plans retain four pest-table entries, two-page target, aligned bottoms and
renderer `vegetable-extracts-v3`. Exact variety names, risk names and tip icons
are recorded and asserted by `finish-03.mjs` against `batch-03-checks.json`.

Validation: all six crop/unit PDFs have two physical pages, loaded fonts/images,
no print errors or overflow warnings, and zero-pixel column-bottom differences
on both pages. All six metric pages visually inspected; the two changed backs
were re-rendered and inspected after final copy polish. PDF text/content checks
passed, including Final Tips and absence of named legacy chemical prescriptions.
Shared verify-data passed; exact master fields compared against initial backup
and unchanged. No renderer/schema changes, so no full application suite/build
or approved-crop regeneration was needed. Poppler emitted its existing Type 3
glyph bounding-box warning; the inspected pages render intact.

Read-only preflight passed before changes at revision
`00d39f22fc45e5336771a412ad432f67789efc1728bb222ba09e2fa787e1cb75`.
Initial draft checkpoint: `63fb53232ede79f33422e035fa0d273ae3cbdea355322f7e8c6b70cf1fa3afd0`.
Exact preceding bytes: shared `backups/admin/2026-09-21T16-25-41.126Z-2d4f9e13-23ab-48b1-9369-6f579035e3e5`.

Six source-linked sections per crop merge repeated soil/care advice. Original
introductions, variety ranking, measurement pairs and planting companions remain
in use. New tips have explicit semantic icons. Full-width Final Tips retained.
No source corrections, new research claims or renderer changes.

Fit was refined from the initial four-sentence/six-variety plans. Brussels
sprouts needs four varieties with its taller title/hero composition; shortening
its introduction alone did not remove the overflow, so three sentences were
restored. Broccoli's complete five source harvest paragraphs fill useful space
in the right column. A repeated sprout frame/holding-bed note was removed by
matching the original optional-note wording, preserving its existing deduper.

Known source/renderer limitations: broccoli Key Risks repeats club root under
`CLUB ROOT` and `Club Root (Finger and Toe)` (observed before edits). Existing
alias handling does not reconcile these names. Broccoli's metric variety table
still contains the source's `3 ft` height. Troika's original first sentence is
grammatically incomplete, and some variety descriptions use historical catalogue
claims. Aggregate calendar summaries do not express every type-specific season.
Older chemical controls remain in lower-ranked, unprinted cabbage entries.
These precede this batch and are recorded for later editorial review; this is
not a full source/fact audit or approval of those limitations.

Editorial omissions/merges: repeated bird/mesh protection merged; broccoli
harvest advice restored in full, including the approximate two-month duration;
sprout harvesting/leaf removal merged, with optional use of stems for chickens
omitted; cabbage storage and disease-sensitive stump advice retained. The
illustrated planting cards preserve their original steps and Chinese-cabbage
direct-sowing distinction. Full granular source advice is unchanged.

Resume with current draft records and `export-03.mjs`; do not rerun
authoring/refinement scripts over these finished drafts. `batch-03.mjs`
deliberately refuses to replace existing companions. `export-03.mjs` followed by
`assemble-03.py` reproduces the pack; `finish-03.mjs` stores measurement evidence
only. Next action: John reviews the three drafts and known limitations. A later
bounded batch could cover cauliflower, kale and kohl_rabi after live preflight.
