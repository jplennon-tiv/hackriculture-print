# Pilot production widget — resume here

Current update, 18 September: all 44 crops have companions, installed art and illustrated POC PDFs. 29 normal-active / 15 review-only layouts; see [final batch](ROLLOUT-06.md) for outputs, checks and restore points. Review mode explicitly bypasses fit rejection for labelled drafts only, preserving source and asset readiness and normal endpoint safeguards. Stored granular text and padding are unchanged. The original pilot record below is historical.

16 September 2026. **Five-crop production pilot complete.** User chose the existing-column design: beetroot, carrot, potato, leek and chicory. Normal single/batch export remains AI-free. The other 39 crops keep their existing renderer; their generated artwork is preserved for a later rollout.

Pre-change snapshot: `/Users/johnlennon/Documents/web_site/hackriculture-data/backups/documentation/2026-09-16-planting-production-start.kz56WQ/` (src, plugin files, docs and unchanged master).

## Installed behaviour and ownership

- Shared `vegetables.json` now has additive `print_planting` companions for the five pilots: separate steps, supplementary route text, source references, optional note references and a review fingerprint. All pre-existing master values are unchanged (deep comparison against the pre-change snapshot passed). Detailed prose is not replaced by the shorter printed captions.
- `src/lib/planting.ts` owns source lookup/review fingerprints; types, Zod and admin validation preserve the companion and unknown fields. Admin's **Illustrated Planting: Print Wording** JSON section edits captions. After changing referenced method/advice, review captions (including compact variants), then use the explicit review-confirmation button. No automatic rewriting occurs.
- `src/print/plantingIllustrations.ts` owns stage/image selection, image-size bounds and exact live measurement paths. Potato early/maincrop spacing and leek seed/transplant depths stay distinct. Measurements update from the master in the selected units without caption regeneration; missing required measurements block export.
- `PlantingCard.tsx`, `planting.module.css`, `plantingFit.ts` and `useVegetableLayout.ts` implement the selected column layout. The old text-only layout first establishes its normal baseline; its neighbouring content/trim level is then frozen. The illustrated card fits independently: bounded artwork reduction, optional text-only fallback, reviewed extra notes if space permits, then bounded image growth. It never shrinks type or cuts neighbouring advice to fit pictures. Unresolvable overflow blocks export clearly.
- Changed referenced source advice pauses export until reviewed. Missing artwork uses the same captions, measurements and notes without images. Single and batch exports share the guarded renderer; a batch reports a failed crop and continues.
- Runtime artwork is under `public/images/planting/<crop>/`. All 12 PNGs are byte-identical copies of selected originals under `docs/planting-illustrations/drafts/2026-09-15/<crop>/`, with numeric stage prefixes removed. Eleven scenes display: leek's hole-making is combined into the lowering caption, while the third original and full stored step remain available. Chicory uses two side-by-side scenes; carrot uses three vertically.

## Review output and completed checks

Open `output/pdf/planting-production/planting-pilots-A4-metric.pdf`: ten pages, crop bookmarks, in beetroot/carrot/potato/leek/chicory order. These are normal production exports, not injected proof layouts. Individual imperial and smaller-paper PDFs are alongside it.

- Print: **159 tests / 14 files passed**, TypeScript/Vite build passed (existing chunk-size warning). Focused tests cover additive data/schema/admin round trips, change detection, stage-specific/unit-specific bindings, bounded fitting, single-export error reporting and shared batch rendering/continuation.
- 30 real single-endpoint PDFs checked: five pilots x two units x A4/A5/A6. Each has two pages and correct paper dimensions; page-one text unchanged; old visible planting notes and soil/care/harvest/pest advice retained. New captions, live measurements and added notes are present in the actual PDFs. See `production.json` and `verification.json` beside the PDFs.
- PDF skill visual review completed: all five A4 metric fronts, all ten A4 backs (both units), plus carrot/chicory A5 and A6 backs. A4 has no observed clipping/overlap, broken artwork or missing glyphs. Smaller-paper layout limitation is recorded below, not treated as an A4 approval.
- Browser fault injection passed: missing carrot artwork retains text and reaches ready; changed source method flags review and blocks export. Neither test mutates the master.
- `scripts/check-transfer.mjs` passed on 16 September: chicory/carrot/broad bean/lettuce, both units, two-page A4 exports; loaded images, trouble PDF, login, no browser errors. Outputs: `/var/folders/87/dktgk05x62bcp6pv24n9q4cm0000gp/T/garden-transfer-check-tRKe3b/`.
- Shared verifier passed (44 crops, 14 trouble groups, eight groups). Website build/TypeScript passed; website tests 14 pass, one known pre-existing scrollbar CSS assertion failure. Video TypeScript/13 parent tests, 17 kit tests and source verification passed during implementation. No website prose, video production media, deployment or commit was changed by this work.
- No live full-catalogue batch was generated. Batch integration is covered by isolated tests of the real shared renderer/middleware with mocked Chromium; real pilot PDFs exercise that renderer separately.

Metric fitting results: beetroot two extra notes / 19 mm art; carrot one extra note / 19 mm; potato 22 mm; leek 17 mm; chicory paired 14 mm. These are measured outcomes, not hard-coded cached page heights.

## Known boundaries

- A4 is the reviewed delivery format. A5/A6 pass page-count/content tests but visual review reveals excessive whitespace and undersized text. Existing `@page { size: A4 }` and renderer scale settings predate this widget and have not been changed; small-paper formatting needs a separate fix. Do not claim the smaller sizes are visually approved merely because they contain two pages.
- Original prose still sometimes uses imperial quantities in metric output. The new measurement labels use the chosen units; retained legacy prose is not silently converted. Existing unrelated data anomalies (for example a parsnip seed-life sentence in carrot pest advice) are not a new horticultural audit.
- The normal legacy fitter still selects ranked text for the baseline sheet. Preserving source granularity does not mean every source note is printed. This widget retains that baseline's visible notes and neighbouring content, then adds only reviewed optional notes when they fit.
- Fonts still depend on Google Fonts. Offline font packaging and existing crop/trouble issues remain separate work.

## Reproduce / resume safely

Use Node 24.20.0 and the local server started with `start.command`. Run `npm test`, `npm run build`, `node scripts/check-planting-pilots.mjs`, bundled Python with `scripts/verify-planting-pdfs.py`, and `node scripts/check-planting-fallbacks.mjs`. The pilot checker overwrites only its generated output; **do not rerun it with `--baseline`**, which would replace the pre-implementation evidence.

Credit-interruption checkpoint completed and verified: `../hackriculture-data/backups/documentation/2026-09-16-planting-production-credit-save.HEuN0I/` relative to project root. It preserves code, scripts, installed artwork, master and PDF evidence before final handoff documentation. Original master SHA-256 was `0e8f591e50e8d6794ef8902ac52b391d378006b2ae5703f9cec31fe15dba1df4`; current additive master SHA-256 is `30f7e5ae6a5f69e4df5d209e8596f379c2d840eb0b21e9761e37e48f1926dc5a`.

Final complete checkpoint: `../hackriculture-data/backups/documentation/2026-09-16-planting-production-complete.FB52WY/`. Contains current source, plugins, scripts, runtime planting assets, all planting documentation/original artwork, the master, generated pilot PDFs/QA/audits and working project docs. See its RESTORE.md before copying anything. No commit or deployment was performed.

Next optional stage: review these five normal exports, then author source-bound companions and presentation mappings for remaining crops in small batches. Preserve type-specific routes and test each in both units. Do not regenerate the completed artwork catalogue or broaden into paper-sizing/data cleanup without instruction.
