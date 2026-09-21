# Fuller pest tables and organic master advice

**Later update:** the seven earlier five-entry proofs have been individually
redrafted; [EARLIER-REDRAFT.md](EARLIER-REDRAFT.md) supersedes their counts,
extract-review states and restore point below. The three brassica proofs are
unchanged. This page preserves the first fuller-table revision's history.

21 September 2026. John's request: replace the blanket four-pest limit with
fuller measured tables, update the master advice, re-present the proofs, and
check earlier sheets. Organic control methods only is now recorded in both
AGENTS files and the approved print style contract. No approval is inferred.

Completed proof restore point: revision
`6371a3651f79e65caf705b78fdf97dc3b9c2d52406b35e7eb4b9d317e3f99df4`.
Latest prior-byte measurement backup:
`backups/admin/2026-09-21T17-03-14.854Z-b50244a6-1061-406b-9f5c-0fa106b0bff2`.
The first source-correction prior bytes are in shared
`backups/admin/2026-09-21T16-52-11.803Z-afd9b169-bdf3-40e0-90a2-ff67f2236039`.
Earlier seven approved layouts are preserved before revision in
`backups/admin/2026-09-21T16-56-18.493Z-796bd31d-42db-436f-9db9-f1ccfeae3ed6`.
Later source and layout transactions retain exact preceding bytes as usual.

## Scope and decisions

- Broccoli: reconcile inline club-root/caterpillar names with shared names,
  eliminating duplicate risks; add root fly, slugs/snails and flea beetle advice.
- Sprouts: add club root, cabbage caterpillars, root fly and mealy aphid records;
  correct the claimed direct link between loose planting and blown sprouts in
  the introduction, soil facts, bubble source and trouble entry.
- Cabbage: replace chemical mealy-aphid/whitefly advice and update selected
  controls; reconcile the remaining chemical prescriptions for downy mildew,
  wire stem, diamond-back moth, swede midge and gall weevil with already-approved
  organic brassica controls. Add the existing biological caveats for cutworm
  and chafer grubs. Nutrient-deficiency advice remains separate from pesticides.
- Full organic control details are retained in the trouble's full `text` when
  its table `control` is shortened. Unknown fields and descriptions remain;
  factual corrections are explicit and preceding bytes are backed up.
- Broccoli harvest paragraphs condensed without dropping central/side-shoot
  distinctions, two-month duration, season, frost/drought or late-shoot advice.
  Minor sprout/cabbage copy tightening shares space with additional pest rows.
- Earlier read-only candidate audit tested five and then larger tables until
  overflow. Seven crops can take five entries after small table-field edits:
  radish, beetroot, carrot, lettuce, broad/French/runner beans. Asparagus/celery
  exceeded the measured budget at five and retain their approved four-row plans.
- Seven earlier **layouts** are revised drafts; their previously approved
  extracts remain approved. Asparagus/celery are unchanged. The three newer
  brassicas remain draft. No unrelated crop, shared Troubles approval, artwork,
  fonts, padding, renderer, website prose or deployment changed.

## Sources checked

Fresh RHS research supports the new master corrections:

- [Club root](https://www.rhs.org.uk/disease/club-root): long persistence,
  contaminated soil/tools, drainage and limitations of liming.
- [Sprout problems](https://www.rhs.org.uk/problems/brussels-sprouts-problems):
  weak growth/cultivar choice, loose-planting distinction, ringspot and root fly.
- [Growing sprouts](https://www.rhs.org.uk/vegetables/brussels-sprouts/grow-your-own):
  short-term storage of cut stems in a cool frost-free place.
- [Cabbage root fly](https://www.rhs.org.uk/biodiversity/cabbage-root-fly):
  collars, insect-proof mesh and rotation to avoid emergence beneath covers.
- [Cabbage caterpillars](https://www.rhs.org.uk/biodiversity/cabbage-caterpillars):
  inspection, hand removal and mesh held clear of foliage.
- [Slugs/snails](https://www.rhs.org.uk/biodiversity/slugs-and-snails):
  damp-evening hand-picking and predator habitat.
- [Flea beetles](https://www.rhs.org.uk/biodiversity/flea-beetles-on-brassicas-and-allied-plants),
  [mealy cabbage aphid](https://www.rhs.org.uk/biodiversity/mealy-cabbage-aphid),
  [cabbage whitefly](https://www.rhs.org.uk/biodiversity/cabbage-whitefly):
  protecting vulnerable young plants and tolerating minor populations.

Lower-ranked cabbage replacements reuse the 19 September approved organic
brassica master treatments/preventions; source provenance is in
[Troubles batch 01](../troubles-design/BATCH-01.md). Shared Troubles source and
approved companion records are unchanged; their known older wording is not
silently re-approved by this vegetable revision. This is not a catalogue-wide
organic audit. Legacy variety wording/units and aggregate calendars remain.

## Results and checks

The six-page metric `output/pdf/vegetable-batch-03-review.pdf` now shows six
entries for broccoli, seven for Brussels sprouts and seven for cabbage.
The 14-page metric `output/pdf/vegetable-earlier-pests-review.pdf` shows five
each for radish, beetroot, carrot, lettuce, broad bean, French bean and runner
bean. Asparagus/celery retain four after the measured candidate audit.

All 20 crop/unit PDFs have two physical A4 pages, loaded fonts/images and no
print errors or overflow warnings. Column gaps are zero except sprouts at
0.36 px, within the 1 px tolerance. Actual pest names/counts, varieties, risks,
tip icons, source checksums and renderer hashes were checked. Earlier approved
extracts and planting companions were compared with their pre-edit backup and
are unchanged. All ten edited records passed schema checks; shared verify-data
passed (44 vegetables, 14 Troubles, 8 groups). Final visual checks covered all
three brassica backs, broccoli's corrected risk strip, and radish/carrot/French
bean backs. Carrot's physical export caught a third page missed by DOM fitting;
shortening the Small Roots symptom label fixed it without deleting full advice.
Existing Poppler Type 3 glyph warnings persist; reviewed pages render intact.
No renderer/schema changes: full application tests/build were not repeated.
Final read-only handover preflight passed for all twelve prepared records at
the revision above; updated documentation links resolve.

Current state: 12 prepared, **two approved layouts and ten review drafts**;
32 unprepared. The seven earlier revised layouts are drafts with approved
extracts retained; original approved plans are preserved in the backup above.

## Resume

Use current records; do not rerun one-time authoring/correction scripts. `export-03.mjs`
exports the brassicas; add `--earlier` for the seven revised earlier crops.
`assemble-03.py` and `assemble-earlier-pests.py` build their metric review packs.
`finish-pest-revisions.mjs` saved the final measurements and assertions;
the earlier `finish-03.mjs` assertions describe superseded source and selections.
Await John's review of these revised versions; do not approve automatically.
