# Approved source and artwork registry

Use this inventory before adapting a book component. Inspect its approved source
and preserve accepted artwork and explanation; record deliberate departures.
Current status and next actions belong in the [handover](../handover/START-HERE.md).
Approval manifests record decisions at their date; their historical pending
items are not a current work queue. Do not overwrite hashed references.

The [book design system](../BOOK-DESIGN-SYSTEM.md) consolidates shared colour,
type, geometry and section treatments, linking back here for source provenance.
It distinguishes approved components from selected directions and working proposals.

Editable book opening/cover words now live in the shared
[book-layout JSON folder](../../../hackriculture-data/book-layout/README.md).
The [8 October migration receipt](../publication/book-layout-working/MIGRATION.json)
records verbatim extraction and matching proofs. Frozen HTML/PDFs below remain
references; edit the JSON and build separate working pages rather than overwriting
them. Cover JSON stores copy for later reconstruction of the selected raster art.

## Compact guide design

The publication format follows [Compact Book v1](../BOOK-PRINT-STYLE.md), with
[frozen Kale / Carrot-Parsnip references](../publication/book-pilot/REVIEW.html)
and [approval hashes](../publication/book-pilot/DESIGN-APPROVAL.json). These
protect the compact geometry and art direction; the following A4 sources retain
their content/artwork provenance and their separate sheet-format approvals.

## Guide illustrations and retained A4 references

Retained A4 vegetable-page design: [Richer A v1](../vegetable-style-pilot/fresh-c/RICH-A.html),
approved by John on 28 September. Its [approval manifest](../vegetable-style-pilot/fresh-c/DESIGN-APPROVAL.json)
hashes the reference proofs, CSS, HTML and local artwork dependencies. The C-style
transparent carrot is approved in that composition. Existing fact/risk/planting
artwork remains part of the design. All 44 hero files are now installed under
`public/images/heroes/richer-a/`; all 44 heroes are approved by John on 29 September.
[Approval hashes](../redesign-rollout/APPROVAL.json).
`src/print/heroArtwork.json` is the active mapping. [Gallery](../redesign-rollout/REVIEW.html)
and [AI provenance](../redesign-rollout/ARTWORK.json). Old hero artwork is preserved.

Retained A4 Troubles design: [Open Editorial v1](../troubles-style-pilot/editorial/REVIEW.html),
approved by John on 28 September. Its [manifest](../troubles-style-pilot/editorial/DESIGN-APPROVAL.json)
protects the four reference proofs, source snapshots, layout files, palette input
and diagnostic artwork dependencies. Keep these references during cleanup;
the detailed diagnostic illustrations remain part of the design.

Active coloured icons: 36 Style-A SVG/PNG pairs under
`public/images/coloured-icons/style-a-v1/`. All approved by John on 23 September.
[Hashes](COLOURED-SET-APPROVAL.json).

Active Key Risks: 35 original naturalistic drawings, 31 supplementary silhouettes
and the dedicated bolting-onion image. John approved their drawings and proofs.
[Naturalistic registry](NATURALISTIC-SET-MANIFEST.json) ·
[Silhouette registry](SILHOUETTE-SET-MANIFEST.json) ·
[Onion registry](ONION-BOLTING-MANIFEST.json).
These retained registries protect current artwork without depending on old proof
folders. Prompt/source fields are historical provenance, not runtime dependencies.

Current mappings live in `src/lib/quickFactIcons.ts` and `src/lib/keyRiskIcons.ts`.
Crop bubbles are outside this task. Rejected/unused experiments and duplicate
Troubles artwork were removed; approved live drawings, hero originals/crops and
planting assets remain. Git holds superseded versions.

## Cover C

John selected and installed Cover C for A4 on 30 September, with approved
wording updates on 1 October. John rejected compact adaptations C1/C2 on
7 October and requested fresh sketches for **The Vegetable Guru**, using this
cover for **colour and illustration style only**, alongside the approved crop
heroes and inner pages. The A4 approval remains. This is Cover C, not the
rejected vegetable-layout study also labelled C.

- [Installed PDF](../../public/front-matter/cover-A4.pdf), also at
  [output/00_cover_A4.pdf](../../output/00_cover_A4.pdf).
- [Editable composition](../front-matter/cover-studies/preview-c.html) and
  [owner/build instructions](../front-matter/cover-studies/README.md).
- [Main illustration/title](../front-matter/cover-studies/assets/contemporary-c.png)
  is a combined 1054 × 1492 px raster. Badges and page thumbnails are separate
  overlays; main lettering is not editable vector type.
- Preserve the approved A4 artwork. Its composition, interwoven lettering,
  ribbon and badges are not constraints on the new compact cover.

The [rejected C1/C2 review](../publication/cover-c-compact/REVIEW.html) and
[provenance](../publication/cover-c-compact/ARTWORK.json) retain the earlier
*Veg Sorted* designs and checks as historical evidence.

The [three fresh cover sketches](../publication/vegetable-guru-cover-sketches/REVIEW.html)
use Cover C, approved Carrot/Kale/Beetroot heroes and actual inner pages as style
references. Their [prompts and provenance](../publication/vegetable-guru-cover-sketches/ARTWORK.json)
record the new reference-guided generations. These are unapproved front-cover
concepts, not editable final artwork or Bookvault wraps. John rejected the growing
bed, found harvest promising but its layout boring, and preferred the grid.
[Grid variations G1–G3](../publication/vegetable-guru-grid-variations/REVIEW.html)
remove the guide-count footer; G3 uses actual unchanged Kale pages. Their
[provenance](../publication/vegetable-guru-grid-variations/ARTWORK.json) distinguishes
imagegen variations from the native page-preview composition. John selected
**G2 Cream centre** on 7 October; its exact source/hash is recorded there.

[Back-cover ideas B1–B3](../publication/vegetable-guru-back-cover/REVIEW.html)
were rejected by John on 7 October; B2's dark green remains the colour direction.
They use native editable HTML/CSS and clipped windows onto existing
Bookvault Carrot, Kale and Carrot/Parsnip Troubles page renders. The
[source and check receipt](../publication/vegetable-guru-back-cover/CHECKS.json)
records each crop and PDF hash. No page text or illustration was redrawn. The
back title/count subtitle, lorem ipsum, £17.50 and reserved ISBN/barcode panel
follow John's brief.

[B4–B6 torn-page collage concepts](../publication/vegetable-guru-back-collage/REVIEW.html)
follow his revised brief: slightly angled, torn fragments giving an impression
of the contents, with explanations reserved for the inside covers. These use
imagegen with the same actual page renders as references; their printed snippets
are generated interpretations, not exact page composites. The
[prompts and provenance](../publication/vegetable-guru-back-collage/ARTWORK.json)
record this distinction. Rebuild a selected composition using exact crops for
production. John now prefers **B5 Off-centre collage** (7 October); its source
hash and exact decision are recorded in the provenance file. Preserve its dark
green, left-hand blurb and angled paper collage on the right during refinement.
Final cover production remains pending.

## Title, publication and welcome

The [7 October three-page compact proposal](../publication/vegetable-guru-opening-pages/REVIEW.html)
uses selected G2 for title hierarchy, cream/green palette and the vegetable-tile
idea, the approved tomato/onion/pea/carrot/kale heroes, and the original harvest
cluster. [Source hashes and decisions](../publication/vegetable-guru-opening-pages/CHECKS.json)
record that reuse and the deliberate title-page simplification. Pages 1–3 use
lipsum orum at John's request and remain unapproved; author/publication fields
are placeholders. These are separate proofs, not installed full-book openings.

## Additional compact-book illustration stock

[Eight new illustrations and placement studies](vegetable-guru-stock/REVIEW.html)
were generated on 7 October at John's request to reduce repetition: three related
header pairs and two portrait options. After John identified style drift, all
eight were redrawn using approved crop heroes directly; he said the redraws are
better. [Reference/old/new comparisons](vegetable-guru-stock/STYLE-REDRAW.html),
[the project artwork skill](../../.agents/skills/vegetable-guru-artwork/SKILL.md),
[inventory and use notes](vegetable-guru-stock/README.md)
and [exact prompts, sources and hashes](vegetable-guru-stock/ARTWORK.json) record
the new assets. Suggested placements keep the author image slot and give each
opening header a distinct drawing. These remain candidates for John's review;
approved sources and existing PDFs are unchanged.

## Contents

Harvest corner A, approved 29 September:
[installed PDF](../../public/front-matter/contents-A4.pdf),
[output copy](../../output/01_contents_A4.pdf),
[editable layout](../front-matter/entry-pages/contents.html).
Keep the grouped harvest illustration, family-coloured headings and useful
navigation. Adapt the columns and references to measured book pagination;
A4's two-page-crop wording and folios do not describe the new edition.

The [compact adaptation approved on 7 October](../publication/vegetable-guru-entry-pages/REVIEW.html)
reflows this design over book pages 4–5, with current Bookvault references in both
units. Approval hashes are under `compactEntryPages` in the central manifest;
the full books still contain older openings pending integration.

## Illustrated how-to

Approved 30 September, with approved Medium difficulty wording on 1 October:
[installed PDF](../../public/front-matter/how-to-use-A4.pdf),
[output copy](../../output/02_how-to-use_A4.pdf),
[editable layout](../front-matter/entry-pages/how-to.html).

Retain the three illustrated explanations: calendar, difficulty and Core Needs.
Their [builder and ownership notes](../front-matter/entry-pages/README.md) locate:

- [Harvest cluster](../front-matter/entry-pages/studies/assets/harvest-cluster.png).
- [Radish calendar](../front-matter/entry-pages/calendar-assets/radish-calendar.png),
  [temperate field](../front-matter/entry-pages/calendar-assets/temperate-field.svg)
  and [warmer-climate island](../front-matter/entry-pages/calendar-assets/tropical-island.svg),
  with their distinct usual/less-usual sow/harvest keys and approved explanation.
- [Difficulty/needs source study](../front-matter/entry-pages/scales-study/REVIEW.html):
  the actual badge and water-emphasised needs captures, baby/healthy plant,
  Einstein/withered plant, dropper and wave illustrations. These are live source
  assets despite the folder name “study”; preserve them.

John had deliberately omitted other explanatory sections from the A4 how-to.
Use that accepted content as the compact starting point; additional draft
explanations are proposals, not automatically approved replacements.

The same [approved compact adaptation](../publication/vegetable-guru-entry-pages/REVIEW.html)
splits these three original explanations across pages 6–7. Its
[source receipt](../publication/vegetable-guru-entry-pages/CHECKS.json) records
the ten unchanged image assets and intentional wording/layout adaptations.

[Central approval manifest](../redesign-rollout/APPROVAL.json) binds the cover,
contents and how-to layouts/PDFs and cover assets. On 6 October all three output
PDFs matched their installed copies and approval hashes, and all 11 recorded
front-matter files matched. Preserve the originals; the A4 builders overwrite
installed A4 assets and are not compact-book builders.
