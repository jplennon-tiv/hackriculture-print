# Brassica: importance, featured problems and page fit

31 October 2026. **Accepted Brassica specimen; rollout authorised by John.** Importance is now the
primary order, highest rank first. John explicitly withdrew alphabetical ordering
for ties. [APPROVAL.json](APPROVAL.json) binds the recommended six-page composition
and records John's instruction to roll it out. It does not approve unrendered guides,
new star selections or supplier output. Only Brassica has been rebuilt so far.

[Recommended six-page proof](../../../output/pdf/brassica-priority-study/brassica-fit-imperial.pdf) ·
[Strict-importance comparison](../../../output/pdf/brassica-priority-study/brassica-strict-imperial.pdf) ·
[Comparison overview](comparison-overview.jpg)

Recommended spreads: [106–107](fit-spread-106-107.jpg),
[108–109](fit-spread-108-109.jpg), [110–111](fit-spread-110-111.jpg).
Metric proofs are also retained: [fit version](../../../output/pdf/brassica-priority-study/brassica-fit-metric.pdf)
and [strict version](../../../output/pdf/brassica-priority-study/brassica-strict-metric.pdf).
Both editions render identically. All proofs use exact 185 × 240 mm trim and the
existing Bookvault 17/8 mm mirrored body margins; these are review PDFs without bleed.

## Instructions and the source correction

John requested descending importance, selected Cabbage Caterpillars and Slugs and
Snails as starred problems, requested highlighted panels, and allowed
individual entries to move forwards or backwards by **at most one page** for fit.
Featured entries must not be directly beside one another; sharing a page is allowed.
His follow-up removed alphabetical tie-breaking. Do not reintroduce it. His ribbon
panel refinement replaces the curved top border and “Most common” heading with a
top-right “Common Pest” ribbon, keeping the background highlight.

John then accepted the result for rollout and asked about disease wording and
further stars before rebuilding. The
[new research shortlist](../../../../hackriculture-resources/summaries/troubles-star-review/summary.txt)
proposes Common Pest / Common Disease / Common Problem and records exact identities
separately. This retained specimen deliberately keeps its two accepted pest ribbons.

The current canonical `rank` values remain unchanged. All 29 Brassica problems
have ranks. The old renderer had followed a saved September layout instead; it
only used ranks as a fallback when that plan was unavailable. The new opt-in
profile overrides that old reading order with importance-based construction.

The two requested `star: true` values are now saved in the canonical Brassica
record, using the guarded writer with honest user-authorised AI attribution.
[STAR-SAVE-RECEIPT.json](STAR-SAVE-RECEIPT.json) records the exact two leaf changes,
record hashes, revision guard and verified prior-byte backup. All other source
fields, rankings, advice, reviewed companions and manual locks are preserved.
This explicit two-field instruction is a narrow exception to the usual book-work
boundary against canonical changes; it does not authorise other source edits.

Stars are a separate editorial selection, not an automatic rank threshold. Clubroot
remains rank 10 without gaining a star; Slugs and Snails keeps rank 9 with its new
star. No other Brassica conditions or other groups were starred automatically.
The existing A4 renderer displays the two star glyphs beside its headings. Its
six-page count is unchanged in both editions. The source change invalidated the
A4 pagination signature, so [dependency checks](DATA-DEPENDENCIES.json) reconstruct
the exact previous signature by removing only those two additions, verify the
focused counts and refresh only local signature metadata. Folios, other guide
counts and A4 contents PDFs are unchanged. [Normal-route checks](NORMAL-ROUTE-CHECKS.json)
confirm both routes are ready without stale-source or companion warnings.

## The two layouts

**Strict importance control:** ranks descend throughout. Equal ranks retain the
previous source reading order as a neutral control, without an alphabetical sort.
The same featured panels are present in both versions, so their effect is not
confused with the fit comparison.

**Recommended fit version:** the search first explores moves within tied ranks,
then tests limited moves across neighbouring rank bands. For this Brassica sample,
it finds a better result using only a tied-rank adjustment: Downy Mildew precedes
Diamond-back Moth within rank 6. Every displayed rank still descends; **there are
zero priority reversals**. This has three page-placement effects:

| Problem | Rank | Strict folio | Fit folio |
| --- | --- | --- | --- |
| Downy Mildew | 6 | 109 | 108 |
| Frost | 6 | 110 | 109 |
| Swede Midge | 3 | 111 | 110 |

The latter two moves follow from the recovered space; they do not require further
changes to the reading sequence. Every other problem remains on its strict-order
page. Both versions have six pages and all 29 entries exactly once. The fit version
puts six entries on folio 108 instead of five and leaves two on the final page
instead of three. The final pair is placed one per column with natural heights,
leaving spare space below both. No text or drawings are stretched to align bottoms.
[PAGE-MAP.json](PAGE-MAP.json) records every identity, rank, star and old/new location.

Cabbage Caterpillars is featured on 106; Slugs and Snails on 107. Several ordinary
entries separate them in reading order. They are neither consecutive nor directly
opposite within a page, and visual spread review confirms they are not neighbouring
panels across the gutter. Their independent rank values do not change.

## Panel treatment and retained art

The feature retains the existing Brassica `wash` (#eff2e4) background and gently
rounded corners, with no border. A small **Common Pest** ribbon sits at the top
right, using `deep` (#386337), cream lettering and the book's Lilita One type.
The ribbon occupies its own row, with a slight 2° tilt, and uses 13 CSS px type.
This follows the existing book ribbon styling. The panel wraps the complete entry
at its natural height: crop label, symptom, advice and original diagnostic remain.
The canonical star selects the panel; no extra star glyph appears in the title
or ribbon. Panel padding is 10 px top, 11 px sides/bottom. Advice type is unchanged.

All 29 displayed drawings remain byte-identical. The approved 135 × 157.5 px boxes,
4 mm gap and existing [source-bound masks](../brassica-flow-preview/MASKS.json) are
reused. No masks or artwork were regenerated. The earlier
[full-guide flow proof](../brassica-flow-preview/README.md) remains a required
comparison and mask source; it is not disposable. Its text/order is historical,
not the current ordering instruction.

Normal inter-entry gaps remain 8 px, with natural entry heights and the recovered
14 px lower header space. Earlier pages fill before the final one. The last page
uses a balanced division into columns rather than leaving the right column empty;
this is a whole-entry placement choice, not padding. It is part of this experiment.

## Fit weighting, limits and reproducibility

[trouble-priority-fit.mjs](../../../scripts/lib/trouble-priority-fit.mjs) works from
actual measured heights after fonts, masks and the feature panels load. It packs
whole entries, minimises page count, fills earlier pages/left columns and balances
the final page's natural heights. Candidate sequences are explored through bounded
single-entry insertions, first within tied ranks and then across neighbouring ranks.
This deterministic local search is an experiment, not a claim of globally optimal
packing.

Hard constraints in this trial:

- Exact entry coverage; no splitting, omitted copy, resized type or artwork.
- Each entry stays within one physical page of its **strict-importance control**.
- Rank-10 entries are not deferred beyond their strict-order page.
- An inversion, if considered, may cross only one rank point; the selected result
  needs none. Larger priority jumps are rejected.
- No consecutive starred entries. Same-page starred panels cannot overlap vertically
  in opposite columns. Actual facing-spread review also checks adjacency across gutters.

The secondary score is early-weighted unused column height on non-final pages,
plus penalties for rank inversions (100 each), deferred entries (5 × rank²), page
moves (10 each) and total position drift (1 each). A page costs 10,000,000, making
page count dominant for this sample. Exact scores and accepted search steps are
in [CHECKS.json](CHECKS.json). These numerical weights are trial implementation
choices, not an approved universal recipe. The strict-reference page locations
remain fixed throughout the search: repeated moves cannot drift beyond the
one-page boundary. No alphabetical comparison is used anywhere in this profile.

This specimen is now frozen by `APPROVAL.json`. Do not run its builders as the
continuing workflow or remove the approval guard. Reuse their implementation in
a new rollout work area, preserving the accepted files and mask sources.

The [builder](../../../scripts/build-brassica-priority-study.mjs) reads the current
record without saving it, checks the exact star selection and mask hashes, renders
both variants/units and verifies model predictions against the actual renderer.
It does **not** repeat the star transaction. The
[PDF checker](../../../scripts/review-brassica-priority-study.py) writes the review
PDFs, compares complete body glyph/type inventories after accounting for the two
new labels, verifies decoded embedded images/fonts, and renders all pages/spreads.
Both refuse to overwrite this approved study. Saved `imperial-strict.html`,
`imperial-fit.html` and their metric counterparts retain the complete compositions;
local resource URLs need the server, while the PDFs are self-contained.

This frozen experiment used explicit `priority` and `order` options. The later
[complete rollout](../troubles-rollout/README.md) now owns the normal compact default,
24 selected stars, current construction and checks. Keep this accepted specimen
and its technical evidence intact; do not rerun it to extend the set.

## Verification and next work

[PDF-CHECKS.json](PDF-CHECKS.json) covers four six-page PDFs: strict/fit in both units.
All 29 problems, original advice glyphs/type sizes and decoded diagnostic images
are retained. Only the two feature labels are added. Every font is embedded;
minimum content-to-footer clearance is 5 mm in the recommended proof. Both-unit
page renders are pixel-identical. The initial agent visual review covered all six
recommended pages, their three actual facing spreads, the two complete feature
pages and the strict/fit overview. After the ribbon refinement, the affected
106–107 spread was inspected again and all four PDFs rechecked. Page and column
membership are unchanged. The strict control's remaining pages were checked
numerically and at overview scale during the initial review; it is not presented
as a separately approved composition.
[REVIEW.json](REVIEW.json) records checks, exact coverage and output/source hashes.

The main book, earlier flow proof, approved image specimen and original artwork
remain unchanged. The book has not been reassembled or uploaded. Folios 106–111
remain the review context; refresh condition-level index destinations when the
new ordering is integrated. The layout rollout is complete in [separate working outputs](../troubles-rollout/README.md),
using the approved 24 highlights. Main-book integration remains pending; do not
repeat the completed Brassica approval or its consumed star transaction.
