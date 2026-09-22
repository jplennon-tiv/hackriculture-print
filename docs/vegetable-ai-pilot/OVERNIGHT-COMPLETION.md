# Overnight vegetable review proofs — 22 September 2026

**Superseded proofs:** John subsequently rejected the large bottom gaps. Use the
fuller packs and evidence in [PAGE-FILL-REVIEW.md](PAGE-FILL-REVIEW.md). This report
and its proof hashes remain historical evidence of the first overnight run.

All **29 remaining crops** have draft review proofs: **58 individual PDFs**, each
two A4 pages, assembled into two bookmarked **58-page packs**. New drafts are
not signed off or published. The separate normalisation programme remains paused
for discussion with John. Kale was deliberately excluded from this run.
The existing `complete-vegetable-review-proofs` automation is now **PAUSED**;
no further overnight runs are scheduled.

- [Metric review pack](../../output/pdf/vegetables-overnight-metric-review.pdf)
- [Imperial review pack](../../output/pdf/vegetables-overnight-imperial-review.pdf)
- [Batch evidence, editorial decisions and research](OVERNIGHT-PROGRESS.md)
- [Preservation audit and final restore revision](OVERNIGHT-PRESERVATION.json)
- [Machine-readable page index](OVERNIGHT-INDEX.json)
- [Final PDF hashes and check summary](OVERNIGHT-FINAL-CHECKS.json)
- [Data-normalisation findings DN-015–018](../../../hackriculture-data/planning/DATA-NORMALISATION.md)

## Checks and preservation

Both-unit physical page counts, fonts/images, selected pest names, tip icons,
source/layout checksums and individual PDF hashes were checked for every crop.
All column-bottom gaps measured **0 px**. A small representative PDF sample was
visually inspected, including pages that previously overflowed; details are in
the batch record. This is proportionate draft validation, not exhaustive visual
sign-off of every page. No application tests/build were repeated: no production
renderer, schema, typography, image or layout logic was changed during this run.

The final read-only preflight passed with the explicit kale staleness and mushroom
contract warning listed. `audit-overnight.mjs` reconstructed all **38 transactions**
backwards in memory from exact admin backups and verified every revision back to
the midnight baseline. It confirmed **all 14 approved records plus kale unchanged**,
**all 44 planting companions unchanged**, and **shared trouble records unchanged**.
The 29 new crop records remain draft. Local uncommitted work was preserved.

Final shared revision:
`4ab6f355ed0d25cadd9c6ebfdebe0ce603e94c13c3f9a5ea37cfedab4edbe8e1`.
Exact prior-byte backup directories and guarded saves are listed in
`overnight-01-restore.json` through `overnight-10-restore.json`. Never restore
these over newer edits without checking live revisions. Do not rerun the one-time
authoring scripts: later fit/copy transactions supersede their initial proposals.

## Review exceptions and next decisions

1. **Mushroom notes contract:** no `sowing_and_planting` field exists, but the
   approved extract validator requires it for `sowing_notes`. The proof retains
   approved kit captions and reviewed care/harvest text. Both-unit evidence
   explicitly reports the automatic-notes warning. Decide a narrow contract
   treatment before approval; no fabricated source field/checksum was used.
2. **Key Risks scope/duplicates:** existing full-pool assembly can show radish-root
   advice on swede/turnip, duplicate bolting on oriental leaves/Florence fennel,
   and white-rot aliases/onion-specific bolting on garlic. The curated pest tables
   use the checked crop-specific selection. Fix the underlying identity/scope
   issue deliberately and refresh affected proofs; it was not hidden overnight.
3. **Speech-bubble rendering:** small coloured icon blocks partly overlap the
   first body line in sampled oriental leaves, garlic, globe artichoke and mushroom
   proofs. Oriental leaves also raised a Poppler Type 3 glyph warning. Compare
   the approved reference and address as a focused renderer/artwork follow-up.
4. **Existing source conflicts:** cultivar aliases/pseudo-varieties and historical
   popularity claims remain; selected squash varieties omit a pumpkin cultivar.
   Salsify/scorzonera has disputed May-only wording. Mushroom seasonal Quick Facts
   differ from its broader indoor calendar. Existing mixed-unit variety/planting
   prose remains in several crops. Exact paths and organic legacy-advice findings
   are logged in DN-015–018; catalogue-wide normalisation was not performed.
5. **Whitespace:** sparse mushroom data leaves substantial space; globe artichoke
   also ends early. All fit and aligned columns take priority over filling space.
   No varieties or trouble counts were invented to make crops look uniform.
6. **Kale:** its accepted source corrections, intentionally stale prior proof and
   planting companion are untouched. Refresh/review separately with John.

Organic controls were used throughout the new selected tables. Full advice was
retained or replaced with researched organic/diagnostic guidance where authorised;
exact previous bytes remain in backups. No named legacy pesticide prescriptions
were found in the selected crop trouble texts. That is not a claim that all
unprinted catalogue content has been normalised.

## Pack index

The same page ranges apply to both packs. Individual PDFs and detailed machine
checks are in `tmp/pdfs/overnight-NN/` and `overnight-NN-checks.json`; combined packs
are the durable review deliverables. Each crop is bookmarked by name.

| Crop | Pages | Pest/problem rows |
| --- | --- | --- |
| Swede | 1–2 | 7 |
| Turnip | 3–4 | 8 |
| Oriental Leaves | 5–6 | 8 |
| Beet, Leaf | 7–8 | 4 |
| Spinach | 9–10 | 6 |
| Pea | 11–12 | 10 |
| Leek | 13–14 | 8 |
| Onions and Shallots | 15–16 | 10 |
| Garlic | 17–18 | 6 |
| Parsnip | 19–20 | 7 |
| Salsify & Scorzonera | 21–22 | 5 |
| Celeriac | 23–24 | 9 |
| Chicory | 25–26 | 5 |
| Endive | 27–28 | 5 |
| Florence Fennel | 29–30 | 4 |
| Cucumber, Greenhouse | 31–32 | 9 |
| Cucumber, Outdoor | 33–34 | 9 |
| Courgettes and Marrows | 35–36 | 7 |
| Squashes and Pumpkins | 37–38 | 9 |
| Sweet Corn | 39–40 | 8 |
| Potato | 41–42 | 10 |
| Tomato, Greenhouse | 43–44 | 10 |
| Tomato, Outdoor | 45–46 | 9 |
| Capsicum | 47–48 | 9 |
| Aubergine | 49–50 | 7 |
| Artichoke, Globe | 51–52 | 7 |
| Artichoke, Jerusalem | 53–54 | 3 |
| Rhubarb | 55–56 | 5 |
| Mushroom | 57–58 | 3 |
