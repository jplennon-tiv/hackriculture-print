# Pea one-off amendment

7 November 2026. [Review both editions](REVIEW.html). Unselected eight-variety alternative. John approved the
[six-variety fuller introduction](../pea_intro/APPROVAL.json) on 7 November.

John requested a round-seeded variety and removal of the deep-bed instruction
from Seed spacing. **Meteor** is added as the sixth variety, labelled **Round**
in the existing small-label style. The original five selections, their order,
descriptions and type labels remain.

Meteor is already ranked 6 in `varieties.Round varieties.Meteor`. Its compact
habit and suitability for cold/exposed sites come from the master. The new
description reads “A compact round-seeded pea for colder or exposed sites.
Useful for early crops.” [Kings Seeds](https://www.kingsseeds.com/30313-pea-meteor)
supports its compact habit, exposed-site suitability and early cropping;
[Moles Seeds](https://www.wholesale.molesseeds.co.uk/conventional-vegetables/d-p/pea/first-early/pea-meteor-vpe025)
explicitly identifies it as round-seeded and first early. No height is added:
suppliers quote a different height from the master, which remains unchanged.

John then asked whether more varieties would fit. The revised proposal has
**eight varieties in two rows of four**, adding **Douce Provence** (Round) and
**Norli** (Mangetout). Both are rank-6 entries already in the master, chosen
for a distinct useful quality: Douce Provence's sweetness and robust growth,
and Norli's compact habit and tender whole pods. Their descriptions are
condensed from their existing full text. The other six descriptions remain
exact, as do all font sizes and spacing. The narrower columns are 35.24 mm wide.

[Kings' catalogue](https://www.kingsseedsdirect.com/images/uploaded/Catalogue%20Request/Pdf/commercial-seed-catalogue-2025.pdf)
lists Douce Provence with sweet peas and hardy growth; its product listing was
indexed but direct retrieval returned 403. [Chiltern lists Norli](https://www.chilternseeds.co.uk/item_1371Y_pea_mange_tout_norli_seeds)
as compact mangetout with sweet flat pods to pick young. Canonical names,
classifications and descriptions govern the printed copy; no master changes
are made.

Both-unit DOM trials found that a third three-column row (nine varieties)
would overflow by 8.78 mm at the existing sizes. Eight in four columns leaves
7.12 mm above the footer. The final PDFs were inspected to check the narrower
columns remain readable. This remains a proposal for John's review. John then
requested a [separate six-variety alternative with a fuller introduction](../pea_intro/REVIEW.html).
Both versions are preserved for comparison; John approved the six-variety alternative.

Seed spacing now reads **1–2 in. apart in drills.** / **2.5–5 cm apart in drills.**
Only the deep-bed alternative is removed. Row spacing's separate qualifier
“closer for dwarfs/beds” is retained, as John scoped this correction to Seed
spacing. The standing Quick facts check gives Ready in the full left-column
width beneath the four shorter facts; Sow and both spacing entries occupy the
right. Columns are equal in width. All eight facts and icons remain, and no
other values or qualifications change. There are no pH or liming references in
the working spread, so page 2's wording is unchanged.

The revision builder accepts an optional `groupLabel` for an added variety.
It reuses the template's small label and styling, or creates a label if absent.
Without this field the previous no-label behaviour remains. This lets Meteor
carry the same classification treatment as the existing five entries.
An optional `varietyColumns` field now selects three or four columns for an
individual revision; Pea alone requests four. Without this field the existing
three-column behaviour remains. No other crop is re-exported or restyled.

Both actual PDFs remain two pages, 185 × 240 mm, numbered 74–75. Footer
clearances are 7.12 mm and 17.95 mm in both editions. All ten pest entries,
original artwork, 9 pt planting text and See also links remain. No pests are
trimmed. Both rendered spreads were inspected against their sources. Reader
links, images and unit selection work over the preview server and locally.
The routine suite passed: seven files, 43 tests. Canonical data, approved
Parsnip files, full readers and the main book remain unchanged.

Sources and evidence:

- [Book-only amendment](../../../../../src/print/book/sowing-rollout/revisions/pea.json)
- [Original review evidence](../../checks/pea.json)
- [Revised layout evidence](checks/pea.json)
- [Actual PDF verification](checks/pea.verified)
- [Content, source and reader checks](CHECKS.json)

Reproduce only this unapproved amendment with the project launcher running:
`node scripts/sowing-rollout/build.mjs --revision pea`, then use the bundled
PDF-capable Python runtime for `scripts/sowing-rollout/finish.py --revision pea`.
Do not refresh source snapshots or replace the full review books.
