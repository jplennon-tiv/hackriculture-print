# Planting rollout 01 - resume point

Complete for review, 16 September 2026. User approved the five pilots and authorised
rollout in small batches. This batch: parsnip, radish, turnip, swede, spinach,
and salsify_scorzonera. A4 only; existing A5/A6 limitations are separate work.

Pre-change backup:
`../hackriculture-data/backups/documentation/2026-09-16-planting-rollout01-start.0xc8BY/`
(relative to print project). Contains source, scripts, master and affected docs.
Preserve existing uncommitted documentation edits from the previous handoff.

Plan: capture real before PDFs; add source-bound captions without changing
original facts/prose; bind explicit variant measurements; install existing
selected PNGs unchanged; test both units, retained content and page fit; inspect
actual PDF renders; make one metric review pack and a complete checkpoint.

Baseline capture: `node scripts/check-planting-pilots.mjs --rollout01 --baseline`.
After implementation: same command without `--baseline`. Never overwrite old
baseline evidence. Outputs belong to `output/pdf/planting-rollout01/`.

## Delivered

Normal single/batch exports now support 11 illustrated guides: five approved
pilots plus these six. Other 33 retain their original renderer. No AI calls are
needed during export; no new images were generated. Review the 12-page metric
pack `output/pdf/planting-rollout01/planting-rollout01-A4-metric.pdf` (project-root
relative). Individual imperial exports, before PDFs and audits are alongside it.

| Guide | Layout | Distinctions preserved |
| --- | --- | --- |
| Parsnip | Vertical pair, 15 mm | Fresh seed, station alternative, no transplanting, ordinary/large roots |
| Radish | Vertical pair, 22 mm | Salad/winter/oriental measurements, both row bindings, succession, broadcasting |
| Turnip | Paired, 14 mm | Baby/early/maincrop/tops, all row bindings, seasonal notes |
| Swede | Vertical, 22 mm metric / 18 mm imperial | Direct sowing, small-module option, baby/maincrop; one extra full note fits imperial |
| Spinach | Paired, 14 mm | True-spinach staged thinning/baby leaves; separate complete New Zealand route read live |
| Salsify/scorzonera | Paired, 14 mm | Salsify labelled; scorzonera packet-specific; full/compact captions stored; four baseline notes plus weed advice fit |

PDF skill visual checks drove the compact salsify captions and larger vertical
radish layout. Neither needs manual export-time tweaking. All 12 installed PNGs
byte-match selected originals; no canvas changes or resizing of source assets.

## Source correction exception

Existing master data and five pilot companions are unchanged EXCEPT eight
audited leaves, as authorised by John's standing RHS-check instruction:

- Spinach: six measurement leaves now give RHS depth 2.5 cm, rows 20 cm, initial
  thinning 7.5 cm then harvest alternate plants (15 cm remaining); baby-leaf crops
  usually need no thinning. Existing care already described staged thinning.
- Salsify: full/short care now specifies 10 cm / 4 in. and distinguishes the
  scorzonera packet, replacing conflicting generic 10-15 cm / 4-6 in. guidance.

Exact before/after values and sources:
`../hackriculture-data/provenance/planting-rollout01-rhs-2026-09-16.json` (relative
to project root). RHS pages: https://www.rhs.org.uk/vegetables/spinach/grow-your-own
and https://www.rhs.org.uk/vegetables/salsify/grow-your-own . Source backup:
`../hackriculture-data/backups/documentation/2026-09-16-planting-rollout01-rhs.HoJdoS/`.
Approved website prose was not rewritten; its previously flagged salsify spacing
conflict still needs separate editorial review. New Zealand spinach's existing
dual-unit prose remains intact, not newly certified by this targeted RHS check.

## Checks actually completed

- 167 print tests / 14 files, TypeScript/Vite build, shared verifier: passed.
  Existing chunk warning remains. Tests include all 11 mappings, new variant
  bindings, nested swede source changes and separate-species guidance.
- 12 real A4 API PDFs: two pages each, Inter present, images loaded and all scenes
  visible. Original page-one text and baseline planting notes/soil/care/harvest/
  pest advice retained except the exact audited corrections. The verifier
  substitutes only recorded old/new strings, not unrestricted exceptions. All
  final widget captions, measurements and notes appear in PDF text.
- Visual review: six metric fronts and 12 backs (both units), including final
  salsify revision. No clipping, overlaps, missing glyphs or broken art observed.
- Transfer smoke check passed chicory/carrot/broad bean/lettuce in both units,
  trouble PDF and admin login. Output:
  `/var/folders/87/dktgk05x62bcp6pv24n9q4cm0000gp/T/garden-transfer-check-HLT4Iy/`.
- Website build (49 routes/44 approved guides) and TypeScript passed. Full tests
  retain known pre-existing scrollbar CSS failure (14 pass/1 fail); 11 guide/
  projection/rendered-page checks passed again after measurement corrections.
- Video TypeScript/13 parent tests, 17 kit tests and source verification passed;
  source verification repeated after measurement corrections. No media changes.
- No full-catalogue batch or new A5/A6 audit. Smaller-paper scaling and unrelated
  mixed-unit/data issues remain outside this batch. No commit or deployment.

## Restore and resume

Complete checkpoint:
`../hackriculture-data/backups/documentation/2026-09-16-planting-rollout01-complete.lj5CQY/`.
Read its RESTORE.md before copying anything. Current master SHA-256:
`c2e97fc1bbbab22502dac84a84daa01d397be6580d14cbc342c596cf5f67aaec`.

Recheck: `node scripts/check-planting-pilots.mjs --rollout01`, then bundled Python
with `scripts/verify-planting-pdfs.py --rollout01`. Never use `--baseline` again.
Subsequent batches need their own output directory and before snapshots.
Suggested next group: broccoli, Brussels sprouts, cabbage, cauliflower, kale and
kohlrabi, carefully separating nursery/final spacing. Inspect preferred revisions
before copying existing artwork. User approval is recorded for the five original
pilots, not automatically for this new pack.
