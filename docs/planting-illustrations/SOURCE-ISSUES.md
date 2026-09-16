# Measurement review and provenance

Reviewed 14–15 September 2026. John explicitly authorised RHS checks and correction of conflicting measurements. This is a targeted review for planting illustrations, not certification of every gardening claim in the collection.

## Applied first correction batch

The shared master, not a print-local copy, was edited. The exact before/after values for 79 changed leaves across nine crops, with source URLs, are in [the shared audit](../../../hackriculture-data/provenance/planting-measurements-2026-09-14.json). The untouched preceding master is in [the dated backup](../../../hackriculture-data/backups/2026-09-14-rhs-planting.AsL2RD/vegetables.json).

| Crop | Issue and decision | RHS source |
| --- | --- | --- |
| Globe artichoke | A fixed 5 cm planting depth contradicted the same-level offset method. Both planting-depth fields now describe the previous growing level, without a numerical burial depth. Seed depth and rich-bed spacing were not conflated with this correction. | [Globe artichokes](https://www.rhs.org.uk/vegetables/globe-artichokes/grow-your-own) |
| Celery | Removed the malformed `91 cm 15 cm` row measurement. Separate block spacing (23 cm each way) from trench plants (30–45 cm within a single row). Trench preparation: 30 cm deep, 40–50 cm wide, refilled with soil/compost to 10 cm below surrounding ground. RHS does not supply a distance between trenches; no replacement number invented. | [Celery](https://www.rhs.org.uk/vegetables/celery/grow-your-own) |
| Lettuce | Conflicting named-variety and generic spacing replaced by type-qualified guidance: normally 30 cm hearting, 15 cm loose-leaf; exact compact-variety spacing follows the packet. Outdoor sowing depth 1 cm and seed rows 30 cm are distinguished from light indoor covering. Nested seed fields updated consistently. | [Lettuces](https://www.rhs.org.uk/vegetables/lettuce/grow-your-own) |
| Onions/shallots | Shallot sets were variously 10 and 15 cm; now 15–20 cm, with 25–30 cm rows. Onion sets are separately 10–15 cm with 20–30 cm rows. Salad onions: 2.5 cm after thinning, rows 20 cm. Corresponding conflicting notes and existing short text updated; seed-grown and module routes retained. | [Shallots](https://www.rhs.org.uk/vegetables/shallots/grow-your-own), [onions](https://www.rhs.org.uk/vegetables/onions/grow-your-own), [salad onions](https://www.rhs.org.uk/vegetables/salad-onions/grow-your-own) |
| Radish | Removed horizontal spacing from depth. Salad: sow 1 cm deep, 2.5–5 cm apart; winter/oriental: about 2 cm deep, 15–20 cm apart; rows 15 cm. Kept variety-keyed objects. RHS contains inconsistent imperial rounding in two places; use its metric sowing values and sensible approximate imperial equivalents (2 cm ≈ ¾ in.). | [Radishes](https://www.rhs.org.uk/vegetables/radishes/grow-your-own) |
| Salsify/scorzonera | Conflicting salsify depth 1/2.5 cm replaced by 1 cm, rows 30 cm, thin to 10 cm. RHS describes scorzonera as another species but does not establish its measurements here: those now explicitly defer to the packet, not an assumed salsify value. | [Salsify](https://www.rhs.org.uk/vegetables/salsify/grow-your-own) |
| Swede | Replaced competing unqualified grids/thinning distances with 38 cm rows, 20–25 cm final maincrop plants or 8–10 cm baby roots. Outdoor sowing depth 2 cm. Top-level and nested fields agree; module handling and timing prose retained. | [Swedes](https://www.rhs.org.uk/vegetables/swede/grow-your-own) |
| Turnip | Removed contradictory row/plant grids. Rows 23–30 cm; baby roots about 10 cm; full-size early roots 15 cm; maincrop 23 cm. Leaf-only crops need little thinning, with about 10 cm ideal. Existing direct-sowing depth retained. | [Turnips](https://www.rhs.org.uk/vegetables/turnips/grow-your-own) |
| Pea | A single station/clump instruction said both 15 and 20 cm. RHS gives individual-plant spacing, not an exact equivalent for this multi-seed station method. Removed the contradictory numeric assertion in the field and note/short text; retained the route with variety-specific spacing. This is a qualification, not an RHS-verified clump number. | [Peas](https://www.rhs.org.uk/vegetables/peas/grow-your-own) |

RHS current Grow Your Own guides take precedence over older RHS feature articles when they differ. No long passages were copied. Editorial wording in the website's 44 approved guides was not rewritten. Source measurements in these documents are planning checkpoints; runtime labels must resolve from the live master.

## Genuine distinctions that must survive

- Brassica seedbed rows are not final rows. Broccoli, Brussels sprouts, cabbage and kale require explicit nursery/final bindings. Kale's 46 cm default and wider conventional/deep-bed variants are not automatically contradictory: RHS gives a variety-dependent final range of 30–60 cm. Do not rewrite valid alternatives just to obtain one diagram. [RHS kale](https://www.rhs.org.uk/vegetables/kale/grow-your-own).
- Artichoke offsets, asparagus crowns and rhubarb crowns have different anatomical soil relationships. Seed depth is a separate route.
- Broad-bean spacing between double rows is not the gap within a double row. The latter is missing from the current record; leave it unnumbered unless researched and added deliberately.
- Outdoor cucumber, courgette/marrow and squash have pot/direct-sowing alternatives and different compact/trailing layouts. Label the route and variety, not a supposed universal grid.
- Onion seedlings, onion sets, shallot sets and multi-sown clumps must not share one unqualified spacing. Likewise, beetroot individual plants and multi-seed module clumps are distinct.
- True spinach and New Zealand spinach are different plants. Forcing/non-forcing chicory and baby/full-size roots have different spacing purposes.
- Mushroom has no ordinary sowing object. Use its supplied cultivation route, not seed rows or root-depth diagrams.

## Second correction batch: 15 September

The [second exact audit](../../../hackriculture-data/provenance/planting-measurements-2026-09-15.json) records the two further corrected crops. Its preceding master is in [the second backup](../../../hackriculture-data/backups/2026-09-15-rhs-planting.5Imqt5/vegetables.json).

- Courgettes/bush marrows now have at least 90 cm between planting sites in each direction; trailing marrows at least 150 cm. Indoor seed depth remains crop-qualified: 1.3 cm courgette, 1.5 cm marrow; direct outdoors 2.5 cm. This replaces the identical mixed-unit fields and competing old depths. [RHS courgettes](https://www.rhs.org.uk/vegetables/courgettes/grow-your-own), [RHS marrows](https://www.rhs.org.uk/vegetables/marrow/grow-your-own).
- Potato's ordinary ground route now uses a 15 cm trench, sprouts upwards, followed by covering. Method, legacy depth field and conflicting image notes agree. This is NOT 15 cm of cover above a tuber. The legacy `sowing_depth` field is retained for consumer compatibility, but explicitly says trench depth; the future widget must label it accordingly. No-dig/container alternatives remain separate. [RHS potatoes](https://www.rhs.org.uk/vegetables/potatoes/grow-your-own).

## Remaining qualifications and checks

Bulk-generation clarification, 15 September: [RHS garlic](https://www.rhs.org.uk/vegetables/garlic/grow-your-own) specifies 2.5 cm soil cover above the pointed clove tip, ordinary cloves 15 cm apart in 30 cm rows. The previously ambiguous depth and ordinary-row values were corrected, including duplicate metadata depth (eight fields); close-block and elephant-garlic alternatives remain separately qualified. Audit: shared `provenance/planting-measurements-garlic-2026-09-15.json`; preceding bytes: `backups/2026-09-15-rhs-garlic.Gi9Bw0/vegetables.json`. This brings the cumulative scope to 97 changed leaves in 12 crop records.

Chicory artwork anatomy was checked against [Flora of China](https://efloras.org/florataxon.aspx?flora_id=2&taxon_id=200023652): the short stout achenes have blunt tops, unlike the pointed carrot-like seeds generated in v1. A targeted v2 corrects the drawing only; no chicory data change.

1. Scorzonera-specific numbers and multi-seed pea-clump numbers remain unverified. Their illustrations may proceed only without those numerical labels; a whole-catalogue claim of fully RHS-verified measurements would be false.
2. Prepared pocket/trench dimensions must still be distinguished from seed depth, even when both have valid numbers.
3. Validate exact edited paths/metadata against the backups and the website's linked facts after rebuilding. Record current results in PROGRESS.md.

## Approved website prose requiring later editorial review

The approved salsify/scorzonera guide's `stage-3` paragraph still says around 15 cm between plants and generically about 1 cm deep. Its linked facts now explicitly give RHS salsify spacing of 10 cm and defer scorzonera measurements to the packet. The paragraph was deliberately NOT rewritten because approved website prose is outside this task's editorial authority. Flag this for John's review; do not imply website prose automatically synchronises with changed master facts. Radish's approved numeric paragraphs already agree with the corrected master. The other nine affected website guides have no numeric section paragraphs to reconcile.

The existing print method summariser can split at `in.` and omit later actions. Potato's updated method therefore puts placement, covering and watering in its first unit-neutral sentence, with the numeric trench depth in its measurement field. This preserves the correction in the current renderer without a widget-code change. The intermediate master before this wording refinement is also saved in `backups/documentation/2026-09-15-planting-briefs-complete.OjALrY/vegetables.json` in the shared data folder.
