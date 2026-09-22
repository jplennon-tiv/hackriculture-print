# Overnight review rollout — 22 September 2026

Completed serial preparation of all 29 crops; new proofs remain **draft**, never
approved or published. See [completion report and index](OVERNIGHT-COMPLETION.md).
Approved records, kale's source-review exception and all planting companions are preserved.

| Batch | Crops | Status |
| --- | --- | --- |
| 01 | swede, turnip, oriental_leaves | Both-unit two-page PDFs checked; source exceptions below |
| 02 | beet_leaf, spinach, pea | Both-unit two-page PDFs checked; source exceptions below |
| 03 | leek, onion_shallot, garlic | Both-unit two-page PDFs checked; source exceptions below |
| 04 | parsnip, salsify_scorzonera, celeriac | Both-unit two-page PDFs checked; source exceptions below |
| 05 | chicory, endive, florence_fennel | Both-unit two-page PDFs checked |
| 06 | cucumber_greenhouse, cucumber_outdoor, marrow_courgette | Both-unit two-page PDFs checked |
| 07 | squash_pumpkin, sweet_corn, potato | Both-unit two-page PDFs checked |
| 08 | tomato_greenhouse, tomato_outdoor, capsicum | Both-unit two-page PDFs checked |
| 09 | aubergine, artichoke_globe, artichoke_jerusalem | Both-unit two-page PDFs checked |
| 10 | rhubarb, mushroom | Both-unit two-page PDFs checked; mushroom contract exception |

Each `overnight-NN-restore.json` records exact guarded transactions and prior-byte
admin backups. Each `overnight-NN-checks.json` records actual both-unit PDF hashes,
page counts, readiness, source/layout checksums, selected pests and varieties,
icons and column alignment. `finish-overnight.mjs` saves matching measurement
evidence into the draft records. No full test/build rerun for editorial data.

## Batch 01

[Metric review](../../output/pdf/vegetables-overnight-01-metric-review.pdf) ·
[Imperial review](../../output/pdf/vegetables-overnight-01-imperial-review.pdf)

Each pack: swede pages 1–2, turnip 3–4, oriental leaves 5–6. Each individual crop
is two pages in both units with fonts/images ready, no overflow warning and zero
column-bottom gap. Pest rows: 7, 8, 8, selected by relevance. Visually inspected
oriental leaves both metric pages and turnip imperial page one, including the
formerly overflowing variety tables. Full-width Final Tips retained.

The variety fitter actually kept Green-Top White and omitted Red Globe for turnip
at six rows (the preliminary fit rationale guessed the reverse). Oriental leaves
keeps six variety rows; pak choi remains covered in growing advice and the source.

Review exceptions: Quick Facts key-risk assembly shows a shared radish-only risk
on swede/turnip and duplicate bolting aliases on oriental leaves. The selected
pest tables have correct host coverage. These are recorded for a focused data/code
follow-up; the approved renderer was not changed overnight. Turnip retains the
two existing Purple Top Milan aliases pending normalisation. Poppler reported a
Type 3 glyph warning on oriental leaves; page images are readable, though solid
green quote blocks overlap a small part of the speech-bubble text. Retain as a
visual exception for checking against the approved reference proofs.

Research used for bounded curation: [RHS swede](https://www.rhs.org.uk/vegetables/swede/grow-your-own),
[RHS turnip](https://www.rhs.org.uk/vegetables/turnips/grow-your-own),
[RHS pak choi](https://www.rhs.org.uk/vegetables/pak-choi/grow-your-own).
Separate catalogue-wide normalisation remains paused. Exact-path findings are
in shared [DATA-NORMALISATION.md](../../../hackriculture-data/planning/DATA-NORMALISATION.md).

## Batch 02

[Metric review](../../output/pdf/vegetables-overnight-02-metric-review.pdf) ·
[Imperial review](../../output/pdf/vegetables-overnight-02-imperial-review.pdf)

Each pack: leaf beet pages 1–2, spinach 3–4, pea 5–6. All are two pages in both
units, no warnings, fonts/images ready, selected rows intact and zero column gap.
Pest counts 4/6/10. Spinach's initial near-blank spill page was found by physical
page-count checking, then removed by fitting the variety table. Pea's left planting
column was limiting: repeated module instructions removed from notes (retained in
approved captions); early protected sowing moved to Final Tips. All ten pest rows
remain. Final pea imperial page two visually inspected; complete and legible.

Existing exceptions retained: pea variety aliases print twice; spinach's approved
New Zealand planting fact still contains mixed-unit prose. These are not new
extract text and were not changed while planting companions are protected.
Research: [RHS chard](https://www.rhs.org.uk/vegetables/chard/grow-your-own),
[RHS thrips](https://www.rhs.org.uk/biodiversity/thrips),
[RHS non-chemical controls](https://www.rhs.org.uk/prevention-protection/controlling-pests-and-diseases-without-chemicals).

## Batches 03–04

Batch 03: [metric](../../output/pdf/vegetables-overnight-03-metric-review.pdf) ·
[imperial](../../output/pdf/vegetables-overnight-03-imperial-review.pdf).
Order: leek 1–2, onion/shallot 3–4, garlic 5–6. Pest counts 8/10/6.
Batch 04: [metric](../../output/pdf/vegetables-overnight-04-metric-review.pdf) ·
[imperial](../../output/pdf/vegetables-overnight-04-imperial-review.pdf).
Order: parsnip 1–2, salsify/scorzonera 3–4, celeriac 5–6. Pest counts 7/5/9.

All six crops: two pages in both units, no overflow warning, font/image readiness,
exact selected rows/icons and zero column gaps. Garlic metric both pages and
celeriac metric page two visually checked. Leek uses four variety rows after a
37 mm overflow; onion uses six after a persistent 1 mm warning. No pest reduction.
One onion export was rejected by the source-revision guard when the next batch
was saved; it was rerun successfully against stable data before evidence was saved.

Exceptions: garlic key risks duplicate white rot aliases and include onion-specific
bolting prose; purple speech-bubble icon blocks partly overlap text (same rendering
issue as oriental leaves). Garlic variety type still calls elephant garlic a giant
hardneck/leek relative, and Solent White needs identity review. Leek's trailing
`test edit` stays in source but is excluded from the print introduction. Onion
Ailsa/Alsa Craig duplicate persists; displayed examples do not represent every
onion/shallot category. Salsify/scorzonera retains disputed May-only advice in a
variety description; the curated sowing advice defers to the named variety.
Parsnip/celeriac shared risk aliases and species scope require later comparison.

Bounded checks: [RHS allium leaf miner](https://www.rhs.org.uk/biodiversity/allium-leaf-miner),
[white rot](https://www.rhs.org.uk/disease/onion-white-rot),
[leek rust](https://www.rhs.org.uk/disease/leek-rust),
[garlic](https://www.rhs.org.uk/vegetables/garlic/grow-your-own),
[RHS harvesting](https://schoolgardening.rhs.org.uk/resources/info-sheet/harvesting-vegetables-checklist.aspx),
[salsify](https://www.rhs.org.uk/vegetables/salsify/grow-your-own),
[April sowing](https://www.rhs.org.uk/advice/grow-your-own/in-month/april-jobs),
[white blister](https://www.rhs.org.uk/disease/white-blister),
[parsnips](https://www.rhs.org.uk/vegetables/parsnips/grow-your-own),
[sclerotinia](https://www.rhs.org.uk/disease/sclerotinia-disease),
[celeriac](https://www.rhs.org.uk/plants/106053/apium-graveolens-var-rapaceum/details).

## Batches 05–06

Batch 05: [metric](../../output/pdf/vegetables-overnight-05-metric-review.pdf) ·
[imperial](../../output/pdf/vegetables-overnight-05-imperial-review.pdf).
Order chicory 1–2, endive 3–4, Florence fennel 5–6; pests 5/5/4.
Batch 06: [metric](../../output/pdf/vegetables-overnight-06-metric-review.pdf) ·
[imperial](../../output/pdf/vegetables-overnight-06-imperial-review.pdf).
Order greenhouse cucumber 1–2, outdoor cucumber 3–4, marrow/courgette 5–6;
pests 9/9/7. All two pages per crop in both units, no warnings, ready fonts/images,
exact pest/icon selection and zero column gaps. Chicory metric page two and outdoor
cucumber imperial page two visually checked. Endive's seventh variety caused a
7 mm spill; six fit. Outdoor cucumber five and marrow/courgette six variety rows
resolved 14/9 mm spills. Actual outdoor selection contains ridge types; the earlier
fit rationale anticipated retaining all-female examples, but the fitter did not.
Full varieties and type-specific growing instructions remain in source/proof.

Organic controls replace chicory soil-pest prescriptions and endive slug pellets/
aphid chemicals. Chicory's general-health overview was explicitly deprioritised
after the selected-name check caught it displacing an actionable forcing problem.
Forced chicory temperature and endive closer spacing are true unit-paired extracts.

Existing source issues: Florence fennel key-risk aliases duplicate bolting/dryness;
greenhouse cucumber variety text includes imperial-only temperatures; outdoor
cucumber contains a non-printed slug-pellet note; courgette variety groups combine
distinct cultivar names. US-style vine-borer advice was not promoted as ordinary
UK guidance. Unusually bitter cucurbit fruit is explicitly discarded in proofs.
Research: [RHS chicory](https://www.rhs.org.uk/vegetables/chicory/grow-your-own),
[cucumbers](https://www.rhs.org.uk/vegetables/cucumbers/grow-your-own),
[cucurbit problems](https://www.rhs.org.uk/problems/courgette-marrow-pumpkin-and-squash).

## Batches 07–10

Batch 07: squash/pumpkin, sweet corn, potato; pest counts 9/8/10.
Batch 08: greenhouse tomato, outdoor tomato, capsicum; pest counts 10/10/9.
Batch 09: aubergine, globe artichoke, Jerusalem artichoke; pest counts 7/7/3.
Batch 10: rhubarb, mushroom; pest counts 5/3. The two unit packs for each batch
are under `output/pdf/vegetables-overnight-NN-UNITS-review.pdf`, with crops in
the order above and two pages per crop. Final combined packs are indexed in
OVERNIGHT-COMPLETION.md. All fonts/images loaded, physical page counts two,
exact selected pests/icons checked and column-bottom gaps zero.

Squash/pumpkin uses four measured variety rows; the actual selection is three
summer types and Orange Hokkaido. No pumpkin cultivar appears in that subset;
the full collection remains intact. Potato retains ten useful problems by
coordinating care/harvest rather than dropping rows. Tomatoes fit after care and
harvest were condensed. Final potato metric page two, squash imperial page one,
greenhouse tomato imperial page two, globe artichoke metric page two and mushroom
metric pages were visually inspected. Globe/mushroom repeat the small coloured
speech-icon overlap noted earlier. Mushroom has substantial spare space because
there are no cultivar entries; none were invented to fill it.

Mushroom has no `sowing_and_planting` source. A companion linked only to its real
care/calendar/planting fields failed the renderer's required-source contract,
so it was removed, not forced through with a fabricated dependency. The approved
kit captions already provide the route. Both exports explicitly retain the
`sowing_notes: automatic fallback selection` warning; this requires a narrow
contract review before approval. Preflight reports that exact exception visibly;
all source/layout/PDF hashes and other readiness checks still apply.

Organic master replacements include potato blight/regulated-pest handling,
capsicum mite/aphid prescriptions, globe-artichoke aphids, Jerusalem-artichoke
slug/soil-grub insecticides, and mushroom flies. Aubergine germination was checked
against RHS and clarified as at least 21°C or 70°F using paired text. Full old
bytes remain in admin backups; no chemical product prescriptions remain in the
29 selected crop trouble tables. Unprinted legacy content is separately logged.

Sources: [RHS potato blight](https://www.rhs.org.uk/disease/potato-blight),
[APHA Colorado beetle](https://aphascience.blog.gov.uk/2025/05/14/protecting-the-uks-potatoes-from-the-colorado-beetle/),
[potato wart factsheet](https://planthealthportal.defra.gov.uk/assets/factsheets/Plant_Pest_Factsheet_Potato_Wart_Disease_final-v2.pdf),
[tomato leaf mould](https://www.rhs.org.uk/disease/tomato-leaf-mould),
[tomato blight](https://www.rhs.org.uk/disease/tomato-blight),
[tomato leaf problems](https://www.rhs.org.uk/problems/tomatoes-leaf-problems),
[capsicum](https://www.rhs.org.uk/plants/71018/capsicum-annuum/details),
[aubergines](https://www.rhs.org.uk/vegetables/aubergines/grow-your-own),
[globe artichokes](https://www.rhs.org.uk/advice/grow-your-own/features/fascinating-facts-globe-artichokes),
[rhubarb](https://www.rhs.org.uk/fruit/rhubarb/grow-your-own),
[AHDB mushroom disease hygiene](https://archive.ahdb.org.uk/knowledge-library/controlling-fungal-diseases-in-mushrooms),
[Warwick mushroom pest research](https://warwick.ac.uk/fac/sci/lifesci/wcc/fpknowledgehub/protectedvegetables/mushrooms/pests/).
