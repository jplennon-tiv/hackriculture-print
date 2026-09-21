# Troubles redesign: resume point

## Troubles page tints - 21 September 2026

John requested the vegetable page tints on Troubles sheets, retaining white widgets.
PrintTroublePage now uses troublePalette from the existing vegetable_palettes.json:
same-category sets inherit pageBackground and their existing highlight; mixed,
missing or unknown categories use pale neutral #F8F8F7 with the existing grey stripe.
All pages, including continuations, receive the tint. Card backgrounds remain white;
Recognise/Act/Prevent colours, heroes, artwork, prose and saved layouts unchanged.
No shared records modified. Individual-image transparency conversion remains cancelled.

227 tests and TypeScript/Vite build pass (existing large-bundle warning). Beetroot,
Bean & Pea, Onion & Leek, Brassica exported in metric and imperial A4: actual page
counts 2/6/5/8 unchanged, no print warnings/missing images, computed page colours
match expected palettes and every widget background is white. Five representative
PDF pages rendered and visually checked, including Brassica's trailing page:
output/pdf/troubles-page-tints-review.pdf. Poppler's existing Type 3 glyph warning
had no visible defect. Existing user localhost server used and left running.
Normal single/batch exports now use these tints without AI; old PDFs need regeneration.

## Checkerboard backgrounds cleaned - 21 September 2026

User authorised local non-generative removal; Sol prepared/reviewed 177 replacements across 11 groups, with parent trial and risk-pair review. Other 43 condition images unchanged. Originals retained, dimensions preserved; only edge-connected pale neutral background pixels whitened. Canonical condition associations were followed (not legacy filenames). No source/AI prose, layout budgets/order, approvals or heroes changed. Updated image paths/hashes and matching layout signatures through the guarded shared writer; exact preceding JSON bytes: shared backups/admin/2026-09-21T10-56-57.703Z-c7b8d85e-f0d1-4b25-ad28-332e8bba50ab. See [cleanup manifest, scripts and checkpoint](background-cleanup/README.md).

Parent verification: 226 tests and TypeScript/Vite build passed (existing large-bundle warning). Normal A4 metric PDFs exported for brassica, bean/pea, carrot/parsnip and potato: actual page counts 8/6/4/7, unchanged; no missing images or print warnings. Representative pages covering pale cauliflower/larvae/fine foliage/roots rendered with Poppler and visually checked; four-page excerpt pack output/pdf/troubles-background-cleanup-review.pdf. Poppler emitted Type 3 glyph bounding-box warnings, with no visible issue on inspected pages. No full-catalogue re-export or physical printer test; existing PDFs retain old imagery until regenerated. Next normal/batch export automatically uses cleaned assets, without AI. Temporary IPv4 review server stopped; user's existing IPv6 server preserved.

## Trailing widgets shrink to content - 21 September 2026

John requested removal of internal blank space in stretched last-page widgets. Saved-plan renderer now fits each image against its existing budget, validates fit, then sets card height:auto only on an incomplete final page (fewer than four widgets). Earlier/full pages, image sizes, order and stored data remain unchanged; spare space stays outside the card. No reapproval or plan migration needed. Unit coverage includes one-page sets and 1/2/3/4-card cases. Browser checks: brassica 8 pages (one trailing card), spinach 2 (two), potato 7 (three), tomato 7 (four, unchanged), no warnings/overflow. Brassica actual final-page PDF rendered and visually checked: output/pdf/brassica-trailing-widget-proof.pdf. 226 tests and TS/Vite build passed. Temporary IPv4 review server stopped; user's IPv6 server preserved.

## Hero alignment corrected - 21 September 2026

John requested heroes further right, especially legacy single-crop illustrations. CSS-only correction: introImages uses justify-content:flex-end; composed heroes additionally use object-position:right center. Sizes, text columns, card budgets, approved data and artwork unchanged. Beetroot and turnip/swede/radish first-page PDFs rendered and inspected, no clipping or print warnings. 225 tests and TypeScript/Vite build passed (existing bundle warning). Proofs: output/pdf/beetroot_troubles-alignment-proof.pdf and turnip_swede_radish_troubles-alignment-proof.pdf. Next normal/batch export uses corrected alignment. Temporary IPv4 verification server stopped; existing user's IPv6 server left alone.

## In-page hero proofs approved - 21 September 2026

John reviewed and approved all ten in-page hero proofs in troubles-hero-review-A4.pdf. The already-installed approved heroes need no further changes or approval. All 14 Troubles sets and ten combined heroes complete; await next task. Documentation-only approval checkpoint, no data/art/PDF changes or tests run.

## Combined hero rollout complete and approved - 21 September 2026

All ten combined-set hero images approved by John and installed. Nine new images plus selected root-crop concept 3; existing single-crop heroes unchanged. Stored composite paths and scoped full-slot sizing active in normal exports, without AI. No prose, packing, dimensions or condition-art changes. Ten-page first-page review pack: output/pdf/troubles-hero-review-A4.pdf; all pages visually checked. Normal route counts unchanged, no overflow/warnings; 225 tests/build/shared integrity passed. [Restore details, paths and prompts](hero-rollout/README.md). No pending approvals; all fourteen Troubles sets remain approved. Historical full-set review PDFs were not all refreshed; regenerate normally for current full guides.

## Hero concepts awaiting selection - 21 September 2026

Three unified harvest illustrations for Turnip, Swede & Radish generated with built-in image tool, saved in hero-concepts/ with exact prompts and actual-header screenshot comparisons. Preview only; no canonical data, approved artwork or PDFs changed. All fourteen sets remain approved. See [concept restore point](hero-concepts/README.md). Next: user selects composition before any installation or wider rollout.

## All Troubles approved - 21 September 2026

John approved the corrected potato proof. Guarded approval saved; projections refreshed. All 14 groups / 220 widgets now approved, with current field dependencies/output signatures and layout source signatures verified across the catalogue. Normal single/batch exports can reuse saved copy and ordering without AI. Exact potato approval backup: shared backups/admin/2026-09-21T09-06-43.321Z-131d88e6-fb75-4f2f-a238-16483e892dcb. Approval metadata only: no prose/art/layout values changed, no PDFs regenerated, no full suite rerun. Rollout review queue complete; await next user task. Previously deferred polish (legacy checkerboard backgrounds, dedicated hero art) remains separate work.

## Root-crop set approved; potato Gapping corrected - 21 September 2026

John approved Turnip, Swede & Radish; guarded approval saved, projections refreshed. Thirteen of fourteen sets now approved (193/220 widgets). Potato remains draft (27). Replaced Gapping's tuber image with newly generated young potato row and one missing position; original retained. No prose, card budget or ordering changes. Revised seven-page potato proof exported, first PDF page visually checked, zero measured overflow, shared integrity passed. Details, exact backups, asset and prompt: [GAPPING-CORRECTION.md](GAPPING-CORRECTION.md). Await John's approval of corrected potato set. No full regression suite rerun for this asset-only correction.

## Final batch ready for approval - 20 September 2026

Potato (7 pages, 27 widgets) and turnip/swede/radish (3 pages, 11 widgets) are ready. All 38 illustrated; eight new assets, targeted organic source corrections and 114 draft print fields saved. Four widgets on every page except the final three-widget page of each set. Ordering/heights stored for deterministic reuse; no typography/padding changes. All ten actual PDF pages visually checked, zero measured overflow, 225 tests/build/shared integrity passed. All 14 groups / 220 widgets now prepared: twelve groups / 182 widgets approved, these final two / 38 awaiting John. [BATCH-05.md](BATCH-05.md) is the restore point. STOP: do not self-approve or continue into other tasks. Do not rerun preparation or generation on resume; next action is John's review.

## Batch 04 approved - 20 September 2026

John approved lettuce, oriental leaves and onion/leek. All three approvals saved with the shared backed-up writer; source/output signatures checked and generated projections refreshed. Twelve of fourteen groups / 182 of 220 condition widgets now approved. Only potato (27) and turnip/swede/radish (11) remain. No new prose, artwork or PDF regeneration in this approval-only turn. Next: prepare those final two groups with organic advice, every widget illustrated and four widgets on all but the final page.

## Batch 04 ready for review - 20 September 2026

John approved all three Batch 03 sets; approvals saved. Lettuce (4 pages: 4/4/4/1), oriental leaves (2: 4/4), onion/leek (5: 4/4/4/4/1) now ready for review, all 38 widgets illustrated. Eleven new assets (one corrected variant), targeted organic source corrections, 114 source-linked draft fields and measured ordering/heights saved. No font/padding changes. Actual 11 PDF pages visually checked; zero overflow or fallback, draft notices only. 225 tests, build and shared integrity passed. [BATCH-04.md](BATCH-04.md) contains exact backups, sources and prompts. Do not rerun initial preparation.

12/14 groups prepared, 182/220 conditions: nine approved and these three awaiting John. Only potato (27) and turnip/swede/radish (11) remain unprepared. Review PDFs live in output/pdf/ai-once-pilot. New draft copy/layout activates in normal exports only after approval. Keep end-only spaces and every widget illustrated.

## Batch 03 ready for review - 20 September 2026

Celery (2 pages, 4+3 cards), Florence fennel (1 page, 4 cards), spinach (2 pages, 4+2 cards) ready. All 17 widgets illustrated; 12 newly generated assets include a corrected celery leaf miner. Targeted organic source corrections and 51 source-linked DRAFT AI fields saved; stored measured layouts awaiting approval. All five PDF pages checked, no overflow/fallback, expected draft notices only. 225 tests/build/shared integrity passed. Exact source/art paths, prompts, research, backups and limitations: [BATCH-03.md](BATCH-03.md). Prior packed bean/pea and carrot/parsnip approved by John. No need to regenerate images or initial copy on resume.

Inventory correction: the earlier total 230/remaining 103 was an arithmetic error. Actual catalogue is 220 conditions. Now 9/14 groups prepared (6 approved, 3 awaiting review), 144/220 conditions. Remaining 5 groups/76 conditions: lettuce 13, oriental leaves 8, onion/leek 17, potato 27, turnip/swede/radish 11. Next: review batch 03, then continue these five. Every widget illustrated; only final pages may be incomplete.

## Strict end-only spaces applied - 20 September 2026

John approved packed tomatoes. Clarified that introduction pages must also have four widgets; ONLY the last page may be incomplete, including a single final widget. Repacked bean/pea to 4/4/4/4/4/1 and carrot/parsnip to 4/4/4/3. Stored intro heights reduced 38 to 37 mm and 48 to 45 mm; no prose, images, fonts or padding changed. Ordering/budgets saved in canonical ai_layout.pages for deterministic future exports. Other four sets untouched. All six now follow end-only spaces.

Exact preceding-byte backup: shared backups/admin/2026-09-20T21-00-12.888Z-441af617-0c05-4f01-b649-fb9aa1bfe0b4. Both revised PDFs regenerated at existing ai-once-pilot paths, all 36 cards present once, no overflow/fallback warnings. First/last pages of both visually checked. 225 tests and TypeScript/Vite build passed (existing bundle warning). Authoring helper now accepts explicit group keys and --full-first; it stops if four cannot fit with at least 26 mm introduction and validates actual intro/card overflow. Do not rerun it for normal exports. Current packing-report.json describes this scoped two-group pass; previous six-group counts are recorded below. Next: review these two, then remaining eight groups.

## Packing pass complete - 20 September 2026

All six approved groups now store measured ordering and heights in canonical ai_layout.pages, reused by normal/batch exports without AI. Source prose, approved AI prose, assets, fonts, padding and introduction dimensions unchanged. Existing layout approval states retained for John's requested rearrangement; no new prose approvals fabricated. Exact preceding-byte backup: shared backups/admin/2026-09-20T20-48-32.688Z-cb3e4177-128e-4c65-9de6-2f55a9f0b785. Six records changed; assertion confirmed no fields outside ai_layout changed before writer-managed audit stamping.

Widget counts by page: tomato 4/4/4/4/4/4/4 (8 to 7 pages); bean/pea 3/4/4/4/4/2 (6 pages); brassica 4/4/4/4/4/4/4/1 (8); carrot/parsnip 3/4/4/4 (4); cucurbit 4/4/4/4/4/4/2 (7); beetroot 4/4 (2). All 127 entries preserved exactly once. Introduction limits prevent four first-page widgets for bean/pea and carrot/parsnip without changing other constraints. Even page counts remain a soft preference, not a reason to add filler.

Review PDFs regenerated under output/pdf/ai-once-pilot; six reports have zero overflow/fallback warnings. First and last pages of each PDF rendered and visually spot-checked (12 pages); all card budgets measured. Normal routes (without aiReview) verified against saved counts with zero warnings. 225 tests, TypeScript/Vite build and shared integrity check passed; existing large-bundle warning remains. No website/video content changes or deployment. Launcher had still checked retired aggregate masters: changed its preflight to records.json/lib/records.mjs/vegetable_groups.json so the current store starts correctly.

Helper scripts/pack-approved-troubles.mjs defaults to a measured preview; --save explicitly writes backed-up plans. It is authoring tooling, NOT part of export; do not rerun it on every generation. output/pdf/ai-once-pilot/packing-report.json holds the before/after counts and measured minima. Next: review rearranged proofs, then prepare remaining eight groups using the agreed packing policy and complete illustration coverage.

## Backfill approved; packing rule agreed - 20 September 2026

John approved the ten new illustrations as correct and well done. Apply the new packing rule in ASSISTED-PRINT.md across all Troubles sets, including earlier ones: fill earlier pages, consolidate spare space at the end, reorder rather than cut approved text or reduce typography/padding. First-page introduction remains a constraint. Existing PDFs have NOT yet been repacked.

Live-record inventory: 6/14 groups prepared and approved, covering 127/230 conditions. Complete groups: bean/pea (21), beetroot (8), brassica (29), carrot/parsnip (15), cucurbit (26), tomato (28). Remaining 8 groups/103 conditions: celery (7), Florence fennel (4), lettuce (13), oriental leaves (8), onion/leek (17), potato (27), spinach (6), turnip/swede/radish (11). Next: measured packing pass on existing six (tomato first), then continue remaining groups with organic advice and an image for every widget. This checkpoint changes documentation only; record inventory checked through shared reader, no app tests or PDF regeneration needed/run.

## Approved-guide image backfill complete - 19 September 2026

John approved tomato/cucurbit; approval recorded. New standing requirement: every condition widget illustrated, including previous batches. Generated and installed ten missing illustrations across tomato (3), cucurbit (4), carrot/parsnip (2), brassica (1). All 127 condition widgets in the six approved groups now have available art. Four revised review PDFs ready, unchanged page counts (8/7/4/8), no overflow/fallback warnings; all 27 pages visually checked. Approved prose, fonts and padding unchanged; small stored budget/reordering adjustments only. New artwork awaits John's review; existing approvals retained for the requested enhancement. Restore paths, manifest, prompts, limitations and commands: [BACKFILL.md](BACKFILL.md). Next: review this art, then continue remaining eight groups with every widget illustrated. Do not rerun one-shot installation/preparation scripts.

## Batch 02 proofs ready — 19 September 2026

Tomato (8 pages/28 entries) and cucurbit (7/26) completed with corrected artwork, targeted organic source replacements and 162 source-linked draft AI fields. All entries retained, no overflow/fallback, all 15 final pages visually checked. Eight-page cucurbit trial condensed to seven rather than retaining a mostly empty final page. New drafts await John’s approval; previous approved groups untouched. Source backups, commands, research and limitations: [BATCH-02.md](BATCH-02.md). No new image generation. Missing images remain text-only; Vine Borer UK relevance flagged in proof.

## Tomato/cucurbit assignments corrected — 19 September 2026

John authorised fixes from the quick scan. Completed 24 tomato image reassignments and three cucurbit reference changes (mildew/scald corrected, mite made text-only pending suitable art). Stem rot/blotch retained after checking source symptom descriptions. No artwork bytes or prose changed. Mapping, exact backup, sources and remaining gaps: [ART-AUDIT-02.md](ART-AUDIT-02.md). Corrected contact sheets reviewed; existing PDFs not regenerated. Fixes apply to future exports. These groups still await organic-source/AI-layout preparation; earlier three approved groups unaffected.

## Remaining artwork quick scan — 19 September 2026

Completed John's quick visual scan of 20 labelled contact sheets across all 11 remaining Troubles groups. Found widespread incorrect tomato assignments and a small suspicious cucurbit cluster (mite/mildew/stem-rot imagery). Other illustrated groups show no obvious widespread shuffle at thumbnail scale, not a diagnostic certification. Findings and exact suspicious keys: [ART-QUICK-SCAN.md](ART-QUICK-SCAN.md). No master records, images or PDFs changed; no new generation. Next proposed work: tomato correction then cucurbit targeted review, subject to authorisation. Three approved batch-01 groups unchanged.

## Batch 01 approved — 19 September 2026

John explicitly approved all three corrected proofs. Recorded approval of all 174 condition AI fields and three layouts using `approve-troubles-ai.mjs`; they are now eligible for deterministic normal/batch exports. No text/art/layout values changed and review PDF files were not re-exported. Exact prior-byte approval backups in shared backups/admin: `2026-09-19T22-03-59.134Z-2d501bb7-7dc1-4d63-ac45-7e4de719f97f` (beetroot), `2026-09-19T22-03-59.433Z-bbabeb3f-cc5a-4f97-bd37-55715d20bd0e` (bean/pea), `2026-09-19T22-03-59.723Z-6bd99c40-74dd-4078-bdb5-b11f9a3b5b53` (brassica).

Cause assessment: rechecked 49/49 legacy bean/brassica asset hashes against 14 September manifest, all unchanged. Renderer associates each condition with its explicit image path, not a separate positional array. Likely historical batch naming/assignment mix-up, but no originating script evidence proves the precise cause. Structural scan of all 14 groups: 191 image references, no cross-group paths, 10 missing files (previously known); this cannot prove semantic correctness. Remaining groups still need visual subject-to-caption review. No evidence established here of shuffled text/measurements; structural checks and lossless migration do not establish original factual correctness. Follow-up proposal, not yet implemented: remaining-art contact-sheet audit and permanent subject/asset provenance checks.

## Batch 01 artwork corrected — 19 September 2026

Completed the authorised image audit/install: 48 image paths corrected/added across the three records, including new beetroot fanging/root-rot and brassica frost illustrations. Existing asset bytes preserved. Corrected proofs regenerated: beetroot 2 pages, bean/pea 6, brassicas 8; all 58 entries, no overflow/fallback. All 16 pages visually checked. 225 tests, TypeScript/Vite build and shared integrity check passed. Exact JSON backup and full mapping/prompts/research in [ART-AUDIT-01.md](ART-AUDIT-01.md). The mapping blocker described below is resolved for this batch; old warning banners removed. Draft copy/layouts still await John's review; normal exports do not auto-approve them. Existing checkerboards, crop-applicability metadata questions and deferred hero artwork remain documented limitations. Next: review corrected PDFs, then explicit approval or targeted amendments. Do not rerun one-shot preparation/correction scripts.

## Batch 01 review ready — 19 September 2026

Beetroot (2 pages/8 entries), bean and pea (6/21), brassica (8/29) generated with stored draft AI copy/layouts. All 58 entries retained; 174 source-current draft fields. John authorised organic replacements in source advice: completed for these three groups with exact preceding-byte backups. No pesticide recommendations carried into the new copy. User now prefers even page counts for duplex, but not at the cost of filler or lost advice. Details, restore paths, sources and commands: [BATCH-01.md](BATCH-01.md).

Publication blocker: existing bean/brassica image assignments are extensively mismatched. Both PDFs carry an illustration-mapping warning; text/layout review only. Correct existing mappings next before art approval/publication. Dedicated hero generation remains deferred. All 16 final pages visually checked; no overflow/fallback. 225 tests and build passed. New drafts are not approved or active in normal exports; source organic corrections are already live. Other groups await their own organic-source pass.

## Approved proof and per-record rebuild complete — 19 September 2026

John explicitly approved the compact-header proof and requested the data rebuild. All 45 carrot/parsnip AI fields plus ai_layout now have approved status with John Lennon/date attribution; normal exports use the saved four-page layout without review mode or AI calls. Normal export verified at `output/pdf/record-migration/carrot-parsnip-troubles-A4.pdf`, all four pages visually checked. Only the two known missing illustrations warn; no stale/draft/layout warnings. Dedicated hero artwork remains deferred.

Authoritative data is now `../hackriculture-data/vegetables/<key>/<key>.json` (44) and `troubles/<key>/<key>.json` (14), with records.json manifest and shared lib/records.mjs reader/writer. Root aggregate files are retired into the exact-byte backup `backups/migrations/2026-09-19T20-52-21.269Z-per-record/`. Equality check confirmed all old data unchanged apart from authorised approval and additive field-audit metadata. This supersedes the pending migration notes below.

Print admin writes changed records only, stamps leaf metadata, backs up previous bytes and rejects stale saves using a revision token. AI-only writes enforce field scope/locks/manual-edit protection and cannot self-approve. Existing approved website prose and video media are unchanged. Print frontend uses disposable generated/master projections, refreshed on startup/build/admin/watch; website/video use the shared loader. `_field_metadata` uses JSON Pointer paths; null legacy timestamps are honest unknowns. Raw file editing bypasses audit stamping: prefer admin or the shared writer.

`scripts/approve-troubles-ai.mjs GROUP --approved-by-john` validates source/output/layout signatures and persists approval through the shared writer; run only after explicit user approval. `scripts/prepare-troubles-ai.mjs PLAN --apply` now uses backed-up shared writes rather than emitting an aggregate-file patch; without --apply it is a dry run. `scripts/review-troubles-ai.mjs` is read-only and reports field/layout review needs; carrot/parsnip currently reports zero. See shared `planning/RECORD-MIGRATION-2026-09-19.md` and SHARED-DATA.md for checks and restore procedure.

## Proof corrections — 19 September 2026

Removed the subtitle "Recognise the signs. Find the next step." from all Troubles title banners and removed "About these crops" from the planned hero introduction. First-page banner remains deep with its collection eyebrow. Follow-on banners omit the eyebrow, are 18 mm rather than 36 mm deep, and use 13.8 pt titles (60% of the first page's 23 pt). Saved-plan follow-on cards share the recovered height; text size/padding remain unchanged. Both planned and fallback pagination mark follow-on pages consistently.

Regenerated `output/pdf/ai-once-pilot/carrot_and_parsnip_troubles-review-A4.pdf`: four pages, 15 widgets, zero column overflow; all four pages visually checked. 225 tests, TypeScript and Vite build passed (existing chunk warning). Renderer revision now `troubles-cards-2`; carrot/parsnip draft plan updated accordingly. Pre-change JSON: `../hackriculture-data/backups/admin/troubles_2026-09-19_before-compact-headers.json`. No source advice or approval states changed.

Future artwork requirement: create a dedicated, consistent set of Troubles hero illustrations rather than recycling vegetable-sheet artwork. John explicitly deferred this; no new images generated now. Existing heroes are placeholders pending that later artwork round.

## AI-once pilot implemented, 19 September 2026

User authorised proceeding with the AI-once/change-triggered model. First bounded implementation is carrot/parsnip; folder migration and universal source-field audit stamps are NOT yet implemented. Do not describe this as the completed cross-project migration.

New review proof: `output/pdf/ai-once-pilot/carrot_and_parsnip_troubles-review-A4.pdf`. Four A4 pages, all 15 conditions. The introduction is now separate with existing carrot/parsnip hero art, above the first-page widgets. First page has three widgets; remaining pages have four. All four PNGs visually checked, no clipping/overlapping footers. Known missing Old Seed and Parsnip Rust illustrations remain text-only; existing checkerboard backgrounds remain. No new image-generation calls.

Live shared carrot/parsnip record has additive `ai_description`, `ai_treatment`, `ai_prevention` on all 15 conditions. `ai_print.fields` stores draft status, dates/provenance, locks, exact dependency signatures and reviewed-output signatures. Group `ai_introduction` and `ai_layout` store the intro and reusable measured page plan. All additions remain DRAFT; user approval of the new proof is pending. Source snapshot comparison proved all pre-existing master content unchanged. Initial recovery: `../hackriculture-data/backups/admin/troubles_2026-09-19_before-ai-once-pilot.json`; subsequent before-ai-layout snapshots preserve intermediate additions.

`src/lib/aiPrint.ts` handles exact, key-order-independent canonical signatures and AI writer guards. `troubleContent.ts` prefers current approved AI fields; review mode permits current drafts. Stale or manually edited copy is not silently used. During migration, still-current approved legacy `print_summary` is preserved as fallback, then original prose. `troublePlan.ts` validates the saved source/design signature and complete condition coverage, measures every actual card, and falls back to lossless automatic pagination with warnings when a fit fails. Existing exports still contain no AI calls and continue on layout warnings. Draft proof route uses `?aiReview=1`; normal/batch route does not opt into drafts.

Commands (Node 24, local Vite server for export): `node scripts/export-troubles-review.mjs` regenerates this proof from stored live text/layout with no AI; `node scripts/review-troubles-ai.mjs` lists field-review needs; `node scripts/prepare-troubles-ai.mjs ../hackriculture-data/planning/troubles-print/carrot-parsnip-trial-2026-09-19.json` emits an apply_patch patch only and preserves existing AI fields/locks. Back up JSON before applying any emitted patch. Old four-card proof builder remains available and now reads stored AI copy, excluding additive AI fields from its historical source comparison.

Validation: 225 tests passed; TypeScript passed; production Vite build passed (existing large-chunk warning). Three-group DOM/content checks (carrot/parsnip, brassica, fennel), plus the synthetic long-entry continuation check passed. Review proof: four pages, 15 widgets, zero column overflow; all original source records unchanged after stripping only this turn's additions. No deployment, website prose changes or video generation.

Next: obtain review of intro/hero proof; implement per-field source audit stamping, durable approval command/UI, shared record loader and per-record folder migration with print/admin/website/video compatibility. Extend review queue to report layout/asset changes, and record asset/font/layout fingerprints beyond the current explicit renderer revision and live measurement. Current preparation guard is not a general file-system lock: direct JSON edits remain possible and are detected against saved signatures. No automatic AI invocation is installed or intended.

## Next proof and workflow discussion, 19 September 2026

John finds the four-page carrot/parsnip POC much better. For the next proof, take "About these crops" out of the condition-card grid and make it a separate introduction with a hero image, similar to vegetable sheets, with condition widgets below. This is not a request for a separate full introductory page. No artwork/layout changes made yet; remeasure pagination when proofing.

Workflow proposal under discussion (not implemented): AI preparation once, deterministic exports between relevant changes, targeted AI re-review after source changes. John proposes per-vegetable/per-trouble-group folders and JSON files, field-level updated_at/updated_by, adjacent ai_ prefixed print text, and AI-first rendering with source fallback. Before migration, settle approval/staleness rules, content hashes/dependency links, renderer/image/font/unit layout invalidation, protection of manual edits, and compatibility for print/website/video consumers. Preserve current source and approved adaptations; no migration authorised in this discussion turn.

## Completed POC: carrot/parsnip assisted trial, 19 September 2026

Review PDF: `output/pdf/carrot-parsnip-assisted-trial/carrot-parsnip-troubles-A4.pdf`. Four A4 pages, four cards per page: all 15 conditions plus the introduction. All four rendered pages visually inspected; no visible text clipping or footer collisions. Generator checks card/column overflow, card count and exact draft text. Existing font size and padding preserved. Short cards still have spare space, and existing illustration checkerboards remain; intentionally deferred for this POC.

Saved source snapshot, draft copy and explicit page plan: `../hackriculture-data/planning/troubles-print/carrot-parsnip-trial-2026-09-19.json`. Repeatable builder: `scripts/generate-carrot-troubles-trial.mjs`; requires local Vite server and rejects a changed source snapshot. See `CARROT-PARSNIP-TRIAL.md` for editorial caveats and regeneration command.

Full master data and normal/batch exports are unchanged. This is a review draft, not user-approved production copy. No wider rollout, new artwork or AI API integration. Next: John reviews this POC and discusses his proposed AI-review workflow before further implementation. Basic isolated PDF checks only; no application regression suite run for this trial.

## Workflow change: assisted generation here, 19 September 2026

John rejected sparse pagination and selected AI-assisted editing at generation time through this interface. See `../ASSISTED-PRINT.md`. Future "generate the troubles pages" requests include source-grounded print-summary editing and actual fit review, not only deterministic rendering. Full source prose stays intact; saved companions/layout decisions are reused. Browser buttons remain available, no API integration requested. Next generation exercise: complete carrot/parsnip guide, targeting about four cards per page where content permits. Existing code below is a usable rendering engine, not accepted final fit. No PDFs generated in this agreement turn.

## Current checkpoint: output renderer installed, 19 September 2026

User approved two-column short-copy pilot with vegetable-category stripe and requested deterministic output/page fitting. Implemented normal `PrintTroublePage.tsx` with isolated `troubles.module.css`, `troubleContent.ts` and measured `troublePagination.ts`. Existing single Troubles PDF download and Batch Print All already use this route, so no new button/API is required. All 14 groups now use this layout, including illustrations, three shades, group-colour stripe below page/card titles and numbered pages. Category comes from the live vegetables' category and the same vegetable palette. Mixed/unknown groups use grey: current brassica group includes root-category kohl rabi; celery includes root-category celeriac.

Four approved pilot summaries installed additively as condition `print_summary` in shared `troubles.json`. Type, Zod and admin validation aligned. Companion stores version/status, recognise/act/prevent and exact source description/treatment/prevention snapshot. Only approved/current companions are used. Changed source or draft status falls back to full prose with a warning, never blocks export. Other 216 condition records still print full original wording. Introduction is retained as an About these crops card. No AI calls occur during exports. Do not claim the editorial rollout is finished.

JSON recovery: `../hackriculture-data/backups/admin/troubles_2026-09-19_before-print-summary.json` preserves preceding bytes. Deep comparison after stripping the four additions proved all previous master data unchanged. Future additions/edits must back up JSON first. Draft `pilot-copy.mjs` is now historical provenance, not the production source.

Fitting: wait for fonts/images, measure at exact column width, pack in rank order down left then right, allocate more A4 pages as needed. An oversized card first reduces its picture to 18 mm; if still too tall it splits into labelled continuation cards without dropping words. Missing images are omitted with text and symptom label retained and warnings passed into existing batch report/UI. Footer space reserved. Normal text is not shrunk to force a fixed page count. No new full-data summaries are inferred at render time.

Validation: 216 tests passed, TypeScript/Vite build passed (existing bundle warning), shared verifier passed. `scripts/check-troubles-layout.mjs --all` checked all 14 groups in Chromium for every rendered source/summary field retained, every condition present, column fit and footer clearance; synthetic 5,400-word entry verified continuation and exact word retention over seven pages. Colour/schema/stale-summary unit tests added. Actual A4 PDFs generated for carrot/parsnip, brassica and Florence fennel under `output/pdf/troubles-production-check/`; spot-check renders, not a full catalogue PDF run. Existing baked checkerboards/diagnostic art accuracy, legacy treatment advice and paper sizes below A4 remain separate work.

Final fit refinement: also try an 18 mm picture when a card narrowly misses the remaining column space, restoring normal size if it still must move. No text or padding reductions. All-guide checks and full tests/build rerun successfully afterwards. All five final carrot/parsnip PDF pages visually reviewed. Current all-guide DOM page counts: beans/peas 8, beetroot 3, brassica 9, carrot/parsnip 5, celery 3, fennel 2, cucurbits 9, lettuce 4, oriental leaves 3, onion/leek 6, potato 8, spinach 2, tomato 8, turnip/swede/radish 4. They are intentionally not capped at two pages. Original high-resolution images can make illustration-heavy PDFs large; asset optimisation remains future work, originals untouched.

Next: review normal output, then author/review the remaining stored summaries in manageable batches with source snapshots. Keep original prose and safety qualifications. Check potentially dated chemical advice against current authoritative sources before publication. Avoid rebuilding the entire catalogue for each editorial addition. This record supersedes earlier mockup-only status below.

## Latest checkpoint: short-copy colour pilot, 19 September 2026

User chose two-column format and authorised a further pilot with shortened print text and three shades. Review: `output/pdf/troubles-pilot-v2/troubles-short-copy-pilot-A4.pdf`, one A4 page, four conditions (Carrot Fly, Green Top, Parsnip Canker, Old Seed / Poor Germination). Builder: `scripts/troubles-short-pilot.mjs`. Draft companion wording is separate in `docs/troubles-design/pilot-copy.mjs`; it is NOT approved production data. Master JSON, previous full-copy proof and batch remain untouched.

Recognise uses blue-grey, Act amber and Prevent sage, all with explicit headings. Green Top has no Act because source treatment is empty. Existing art is unchanged (baked checkerboards remain). No new image generation. Parsnip canker added to test a second longer entry. Source qualifications retained include parsnip-only trimming of minor fly damage, destroying badly rotten canker roots rather than storing, and resowing only if season permits. Editorial condensation deliberately omits secondary detail: carrot fly's alternative polythene barrier/tall-plant spacing/along-row thinning; canker's expanded causal list and specific early-June example. These remain in the master. This is source-based condensation, not a current RHS/chemical advice audit.

Verified one A4 page, fonts and images ready, approximately 16 mm footer clearance, displayed text matches saved draft, and rendered page visually checked. No production tests/build run for this isolated proof. Next: user review of shades, density and copy; then design the approved source-linked print companion schema in shared data (back up JSON before changes), with source fingerprints and no-AI normal exports. Do not treat pilot approval as permission to drop full master prose or to auto-rewrite all entries.

## Latest checkpoint: mockups ready, 19 September 2026

Review PDF: `output/pdf/troubles-mockups-v1/troubles-layout-comparison-A4.pdf`. Two A4 pages: A horizontal illustrated cards; B two-column field guide. Editable/reproducible builder: `scripts/troubles-mockups.mjs` (Node 24, Playwright, Google Fonts). Same three selected conditions on each page: Carrot Fly (long advice, both crops), Green Top (short, carrot-only) and Old Seed / Poor Germination (parsnip-only, missing illustration). This is a selected-entry comparison, not the complete guide; no introduction or other entries claimed to be included. All description/treatment/prevention text for selected entries is read directly from the shared master and retained verbatim. Empty treatment fields are omitted, not invented. Crop labels use condition applicability with group fallback. No shared data edits.

Checks: both PDF pages rendered and visually inspected; two A4 pages verified; Inter/font and image decoding passed; all displayed source fields compared exactly against master in both layouts. Footer clearances measured about 3.4 mm (A) and 25 mm (B), no overlap. No production component edits, no image-generation calls, no app test/build needed for isolated mockup. Batch output is unchanged.

Asset inspection: carrot fly, green top and parsnip canker PNGs are 1254 x 1254 RGB with no alpha. Visible checkerboards are baked into artwork. Existing art is deliberately unedited in these proofs; cleanup/accuracy review remains a separate step. Parsnip canker inspected but not used in this compact comparison.

Next: obtain layout preference; horizontal cards favour long advice and stronger image/text association, two columns pack the sample more compactly. Consider a hybrid after feedback, not before. Then pilot chosen layout with more long entries and dense/sparse groups as below. Preserve every condition and source field; do not infer from sample that all guides fit two pages. Use this builder to revise proofs; earlier investigation follows.

18 September 2026. Status: investigation and initial design brief only. User requested a low-credit start, visual consistency with vegetable sheets, and a durable save point. No renderer, shared JSON, crop PDFs or batch behaviour changed for this task. No image generation used. Existing uncommitted changes elsewhere predate this task; preserve them.

## Findings

- Print owner: `src/print/PrintTroublePage.tsx`; shared styles in `src/print/print.module.css` (condition cards around line 277). Uses `../hackriculture-data/troubles.json` directly.
- Current print is full-width red/pink text cards: name, visual_heading, description, equal-width Treatment/Prevention boxes. Sorts descending rank. No condition images, condition-specific applies_to or active_period are printed. Introduction occupies a large block. Header/footer still say hackriculture-print, with gardenguide.app footer.
- 14 guide groups, 220 condition records (not necessarily distinct problems). 189 image references: 179 resolve to local files, 10 do not. Another 31 records have no image reference. Do not generate 220 images; audit and reuse first.
- Existing batch PDFs inspected for metadata; carrot/parsnip pages 1 and 2 visually inspected. Page 1 has a large blank area after one long card; page 2 has text/card overlapping the fixed footer. Do not infer all pages were checked.
- Viewed carrot_fly.png: usable botanical illustration with affected root and larval inset; checkerboard appearance needs checking for real transparency before use. Diagnostic accuracy/style across the entire asset set remains unreviewed.
- Readiness is currently signalled immediately by the component. Future image layout should explicitly await image/font readiness and measure pagination. Batch page-count warnings currently target vegetables only; Troubles need their own expectations, not a two-page cap.
- Some source text names older chemical products/active ingredients (e.g. Cheshunt Compound, permethrin, heptenophos, pirimicarb). Flag for current RHS/source review before publication, not automatic rewriting or assumptions about current legal status. Existing user prose must be preserved unless changes are separately authorised.

## Existing output inventory

Counts from retained output PDFs, not freshly rendered in this task.

| Group key (without _troubles) | Conditions | A4 pages |
| --- | ---: | ---: |
| bean_and_pea | 21 | 6 |
| beetroot | 8 | 3 |
| brassica | 29 | 7 |
| carrot_and_parsnip | 15 | 5 |
| celery | 7 | 3 |
| florence_fennel | 4 | 2 |
| cucurbit | 26 | 7 |
| lettuce | 13 | 3 |
| oriental_leaves | 8 | 2 |
| onion_and_leek | 17 | 4 |
| potato | 27 | 6 |
| spinach | 6 | 2 |
| tomato | 28 | 7 |
| turnip_swede_radish | 11 | 4 |

Missing referenced images: carrot/parsnip Old Seed / Poor Germination and Parsnip Rust Fungus; onion/leek Allium Leaf Miner and Birds Pulling Sets; potato Colorado Beetle; tomato Aphids, Slugs and Cutworm; turnip/swede/radish Flea Beetle and Cabbage Root Fly.

## Recommended design direction (not yet approved)

**Illustrated field-reference cards.** Match vegetable-sheet Inter typography, dark heading bars, restrained green/orange accents, pale panels and borders. Replace pervasive red text with dark readable text; reserve warning accents for meaning. Brand as Vegetable Cheat Sheets / Troubles. No invented severity ratings.

Each condition: short strong title; existing symptom heading as visual entry point; botanical image where useful; description under **Recognise**; existing treatment under **Act**; existing prevention under **Prevent**. These labels repackage fields without rewriting them. Use condition-specific crop labels and active period only where source data supports them. Preserve ranks, all granular advice and unknown data fields. Avoid interpreting rank as severity or likelihood.

Prefer variable-height full-width horizontal cards: image occupies roughly one quarter, recognition/action text the rest. Stack action blocks rather than giving “None” half the width of a long prevention paragraph. Compact entries may share a row where comfortably legible; long entries remain full width. Keep a condition together when possible; explicitly labelled continuation when truly necessary. Running crop-group header, page numbering and reserved footer area on every page. Allow page count to follow content; do not force dense 29-condition groups into two pages.

Alternative worth one quick mockup: two-column illustrated cards (more compact but poorer for long paragraphs). A symptom-led visual index could be useful later, but needs reliable source-linked grouping and adds pages; defer it until the base card system works.

## Next session: bounded plan

1. Start here; no need to repeat full inventory. Read applicable project instructions and PDF skill before authoring.
2. Inspect a few more existing assets for transparency, resolution and diagnostic usefulness. Reuse them; no bulk generation yet.
3. Create two inexpensive native A4 mockups using a small carrot/parsnip selection: horizontal illustrated cards versus two-column cards. Include one long entry, one short entry, a no-image entry and different crop applicability. Keep all source prose in this pilot; do not silently summarise. Mockups stay outside batch until reviewed.
4. If design input is still useful, use one built-in imagegen concept call with the native proof as reference, not a full asset set. Never use generated text as gardening authority.
5. After choice, implement a separate Troubles stylesheet/component layout so accepted vegetable pages remain untouched. Pilot carrot/parsnip (long text), brassica (29 records), Florence fennel (4 records). Check actual A4 page boundaries, footer clearance, image/font readiness and full content retention.
6. Record checks, unresolved content review and resume status here. Shared JSON edits require local JSON backups; source/docs use Git, not whole-project backup copies. Normal export must remain deterministic and AI-free.

## Reference locations

- Existing PDFs: `output/trouble_<group>_troubles.pdf` (disposable generated output).
- Source illustrations: `public/images/troubles/<group>_troubles/`.
- Audit preview PNGs: `tmp/pdfs/troubles-audit/carrot-1.png` and `carrot-2.png` (disposable).
- Front-matter design/brand record: `docs/front-matter/PROGRESS.md`.
- Read-only investigation: no test/build run needed or claimed for this planning task.
