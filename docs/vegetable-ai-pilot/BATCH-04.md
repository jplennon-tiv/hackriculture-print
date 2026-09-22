# Cauliflower, kale and kohlrabi review

**Approved by John, 21 September 2026.** Status-only save and proof hash:
[batch-04-signoff.json](batch-04-signoff.json). There are now 15 approved crops,
29 remaining. The review/pre-approval checkpoint below is preserved as evidence.

21 September 2026. John explicitly signed off the previous 12-crop widget set,
including its code and logic. [widget-signoff.json](widget-signoff.json) records
the approved keys, transaction and renderer hashes. This next batch uses that
unchanged renderer. **15 prepared: 12 approved, three draft; 29 unprepared.**

Review pack: `output/pdf/vegetable-batch-04-review.pdf`, six metric pages.
Both-unit individual PDFs: `tmp/pdfs/vegetable-batch-04/`.
Current shared revision, exact prior-byte transaction backups, PDF hash and
measurement save: [batch-04-restore.json](batch-04-restore.json).
No new crop is self-approved; all prior approvals and planting companions remain.

## Editorial choices

| Crop | Intro sentences | Variety rows | Pest/disease rows | Final Tips |
| --- | ---: | ---: | ---: | --- |
| Cauliflower | 3 | 6 | 10 | Full width, three |
| Kale | 3 | 6 | 8 | Full width, two |
| Kohlrabi | 4 | 5 | 8 | Full width, three |

These are measured crop-specific choices, not batch defaults. Soil, care,
harvest, planting notes and tips were reviewed together; all selected advice is
saved as complete source-linked extracts. Fonts, padding and artwork unchanged.
Cauliflower initially exceeded two pages: shortening repetition retained all ten
useful conditions. Final trouble priorities are differentiated by crop (7–10),
not a blanket maximum. Key Risks still ranks the full applicable pool separately.

Cauliflower includes club root, caterpillars, root fly, buttoning, blind plants,
slugs, aphids, flea beetle, boron deficiency and whiptail. Sunlight damage is
covered in care; bird protection also appears there. Rarer lower-priority shared
problems are not added simply to fill rows. Test before treating deficiencies;
no speculative chemical prescription. Early/main/winter routes remain in the
approved captions; optional notes add careful lifting and early indoor planting.
Plant firmness is covered in soil/caption, blind seedlings in caption/table,
mini spacing in tips. Conflicting leaf-stage thresholds remain in the master for
normalisation; the proof uses the approved young/sturdy transplant wording.
Harvest retains readiness, individual cutting, spent-plant removal and brief
whole-plant storage. Cauliflower's old chemical root dip was replaced in source.

Kale includes caterpillars, club root, whitefly, mealy aphid, pigeons, slugs, root
fly and flea beetle. Whitefly deserves a row here because the leaves are eaten.
Care keeps water, wind protection, yellow-leaf removal, autumn earthing/staking,
mesh and conditional organic spring feeding. Harvest now distinguishes repeated
outer-leaf picking from crown cutting, tender side/flower shoots and Red Russian
baby leaves. This researched distinction is also in the full master. Sowing
notes retain nursery watering and the early/late sowing trade-off. Direct rape
kale is in the companion and tips. The competing legacy 20×30-inch/deep-bed
15-inch route is omitted pending reconciliation; approved paired spacing stays.
The two Dwarf Green Curled records remain separate and visible, explicitly logged
for the upcoming normalisation rather than silently merged during proofing.

Kohlrabi includes woodiness, flea beetle, caterpillars, club root, root fly, slugs,
pigeons and mealy aphid. Cauliflower-only deficiency copies are excluded by scope.
Care coordinates shallow hoeing, moisture, organic feeding and protection.
Harvest retains ordinary versus giant types, early/late crops, weather and short
storage limitations. Module planting is the optional note; direct succession and
thinning are in captions, summer batches/July giant varieties in tips. Temperature
and module-spacing prose has separate metric/imperial wording.

Selected controls are organic. Generic cabbage-heart caterpillar symptoms copied
into kale/kohlrabi were corrected to leaf damage in the full source. Useful source
detail is preserved; obsolete prescriptions are superseded with auditable backups.
Lower-ranked unprinted legacy controls have not received a whole-catalogue audit.

## Research and normalisation

Source checks used RHS [cauliflower](https://www.rhs.org.uk/vegetables/cauliflower/grow-your-own),
[kale](https://www.rhs.org.uk/vegetables/kale/grow-your-own) and
[kohlrabi](https://www.rhs.org.uk/vegetables/kohl-rabi/grow-your-own) growing guides,
plus [cabbage whitefly](https://www.rhs.org.uk/biodiversity/cabbage-whitefly),
[mealy cabbage aphid](https://www.rhs.org.uk/biodiversity/mealy-cabbage-aphid) and
[club root](https://www.rhs.org.uk/disease/club-root). Kale repeat picking was
checked against RHS; glasshouse-whitefly biological controls are unsuitable for
cabbage whitefly. Common organic brassica controls reuse the earlier researched
master advice. No external AI API or dependency changes.

Exact duplicate, crop-scope, unit and conflicting-route paths are in
[DATA-NORMALISATION.md](../../../hackriculture-data/planning/DATA-NORMALISATION.md),
DN-011–013. These are pending data tasks, not claims of complete reconciliation.

## Checks and restore

Read-only preflight passed before changes. Six actual PDFs pass two-page A4,
both-unit, font/image readiness, source/layout checksum, icon, variety and pest
selection checks; all column-bottom gaps are zero. Six metric pages and the
kohlrabi imperial back were visually inspected; changed priority/copy areas were
rechecked after final edits. Shared integrity and the updated read-only preflight
pass. Approved renderer hashes match the sign-off. No application code changed,
so the prior passing 243 tests/build were not repeated for this bounded curation.
Poppler's existing Type 3 glyph bounding-box advisories showed no visible damage.

`batch-04.mjs` and `polish-04.mjs` are historical one-time guarded authors, not
general automation or safe reruns. Final live records supersede initial wording.
`export-03.mjs --batch-04` measures these six crop/unit combinations;
`assemble-04.py` checks actual PDFs and makes the review pack;
`finish-04.mjs` saves current reviewed evidence only for these three drafts.
Keep the existing checkout/uncommitted code; do not restore older records over
newer work. No publication or deployment.
