# Three-vegetable pilot - review notes

CURRENT: John approved the revised proofs on 21 September. The extracts and
layouts are now approved/current in canonical records. Historical draft status
and pending-approval instructions below are superseded; see PROGRESS.md.
Authoritative style rules: ../VEGETABLE-PRINT-STYLE.md.

Revised after John's screenshot feedback: full original radish introduction and
three original care tips restored, nine varieties retained. Asparagus also uses
its full original introduction; celery retains its three-sentence opening and
five varieties. Saved v2 layout aligns column bases, shares spare space among
rows and stacks relocated tips. Default unspecialised Final Tips stays full-width.
The abbreviation issue described below is now FIXED in sentence parsing, without
rewriting master punctuation. Later revision supersedes the initial notes below.

21 September 2026. Asparagus, radish and celery: six-page metric review pack,
two pages each. Both unit systems checked at normal A4 export margins. All new
extracts/layouts are DRAFT; no user approval inferred. Existing artwork, fonts,
padding and approved planting companions unchanged.

## Editorial decisions

- Asparagus: repeated soil/weeding advice consolidated; crown timing retained
  in a bubble; seed-grown route retained in planting. Care retains watering,
  shallow cultivation, mulch, fern support/berries and end-of-season clearing.
  Harvest retains establishment restrictions, spear size, picking frequency,
  seasonal duration and stopping weak beds early. Burning old fern is not
  repeated in the extract: remove diseased growth instead. Detailed original
  care/harvest prose remains stored. Imperial-derived mulch/spear dimensions
  have rounded metric equivalents in the extract, not altered master values.
- Radish: uses more complete care/harvest wording than the existing short text,
  retaining summer/winter distinctions, succession, conditional harvest times,
  frost qualifications and storage. Sand is the selected storage example;
  the source's peat alternative is not repeated. Wider winter/oriental spacing
  remains in the existing live-bound planting panel.
- Celery: keeps trench, self-blanching and leaf-celery distinctions; watering,
  earthing-up sequence, slug checks, frost/storage and conditional second
  picking remain. Trench dimensions bind directly to the unit-aware master
  measurement. Repeated final tips tightened, not source advice removed.
- Final Tips is saved in the right column for asparagus/radish and the left
  for celery. Left-column tips stack vertically, keeping original padding and
  type sizes. Four ranked pest entries are selected by the existing ranking;
  the complete pest records remain available in source/Troubles sheets.

## Explicitly authorised source corrections

Eight source leaves changed, no other source prose rewritten. Script
`correct-sources.mjs` contains the exact bounded replacements and an undo
comparison. Prior bytes: shared `backups/admin/2026-09-21T13-39-36.432Z-84af11b5-9d3b-4b0c-989b-14289c1a6ad5/`.

- Celery trench prose now agrees with its structured measurement: 30 cm deep,
  40-50 cm wide, refilled with soil/organic matter to 10 cm below ground.
  [RHS celery](https://www.rhs.org.uk/vegetables/celery/grow-your-own).
- Lime-for-slugs replaced with hand-picking/predator-friendly advice; this
  does not prohibit lime for a genuine soil-pH need.
  [RHS slugs/snails](https://www.rhs.org.uk/biodiversity/slugs-and-snails).
- Asparagus derris/permethrin and pellet recommendations replaced with regular
  checks, hand-picking and natural predators; small beetle populations can be
  tolerated. [RHS asparagus beetle](https://www.rhs.org.uk/biodiversity/asparagus-beetle).

## Contract and limits

`ai_print_extracts.sections` stores six independently reviewed sections beside
the granular source. `ai_print_layout` stores fit choices and both-unit measured
evidence. Both have updated_at/updated_by, source and output checksums, status
and locks. The shared writer also stamps changed leaves in _field_metadata.
Checksums determine relevance even when a raw edit bypasses timestamps; mere
timestamp changes do not waste an AI review. Dependency arrays are conservative
(a whole care array, for example), not yet individual sentence mappings.

Normal exports use approved/current extracts only, with sectional source fallback
and warnings. aiReview=1 explicitly previews drafts. Layout invalidates on source,
extract-value or renderer revision changes. Normal generation calls no AI.
The existing image/intro/variety fitters still run deterministically; this pilot
does not replace every layout mechanism. prepare.mjs is a bounded draft-authoring
script, NOT a production scheduler: do not rerun after user edits/approval.

Renderer-file SHA256 evidence is stored with measurements. For this pilot,
runtime invalidation uses VEGETABLE_PRINT_REVISION; bump it when changing CSS,
fonts or renderer behaviour. Automatic font/asset-content hashing and an admin
review queue are future work, not claimed as completed. A changed image at the
same filename needs explicit remeasurement.

Known pre-existing page-one copy limitation: the legacy sentence trimmer can
stop at abbreviations (asparagus variety notes ending at "U."/"No."; celery fly
key-risk text at "in."). This pilot does not curate variety/pest summaries yet.
Flag for the next pass; source text remains intact. No clipping/overlap seen in
the six rendered metric pages. This is a pilot proof, not publication sign-off.

## Resume / approval

Latest measurement save: 41a96940fce1f3aa9b9234e3c5f68f7644a9f497a8ade52c32da0b52455eaa24.
Preceding bytes are in shared backups/admin/2026-09-21T13-58-03.447Z-2728f782-baaa-4901-be68-2afabcbb7b9e.
Measurement evidence uses a results array, not metric/imperial object keys, so
it cannot be mistaken for a gardening MeasurementPair by existing validators.
After John approves, verify dependencies/output checksums, save approval-only
changes via the shared writer with an explicit user-authorised admin actor and
expectedRevision, refresh projections, and check ordinary export uses the plan.
Do not rerun prepare.mjs to approve. Until then keep drafts out of normal export.
