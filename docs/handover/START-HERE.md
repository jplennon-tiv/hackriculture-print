# Vegetable PDF rollout: handover

Prepared 21 September 2026. This is the concise entry point for a new session,
not a replacement for live records or later instructions from John.

**Current checkpoint, 21 September:** John signed off all 12 coordinated-widget
crops, code and logic under `vegetable-extracts-v4`. Approval and renderer hashes:
[widget-signoff.json](../vegetable-ai-pilot/widget-signoff.json).
The next set, **cauliflower, kale and kohlrabi**, is ready for review. Read
[BATCH-04.md](../vegetable-ai-pilot/BATCH-04.md) and
[batch-04-restore.json](../vegetable-ai-pilot/batch-04-restore.json) for the current
revision, proof, research, exact restore points and checks.

There are **12 approved layouts, three review drafts and 29 unprepared crops**.
Approved records and all planting companions are preserved. The six new both-unit
A4 exports each have two pages, no layout/readiness warnings and 0 px column gaps.
Metric pages and a representative imperial page were visually checked. Production
renderer hashes are unchanged; the earlier 243 passing tests/build remain the
code sign-off baseline and were not repeated for this routine content batch.

The fuller pest selections remain: broccoli 6; sprouts/cabbage 7; radish 6,
beetroot 8, carrot 10, lettuce 9, broad bean 8, French bean 7, runner bean 8.
Asparagus/celery remain at four. New cauliflower has ten, kale/kohlrabi eight each.
Use `output/pdf/vegetable-batch-04-review.pdf` for the new drafts. Earlier packs
and the snapshot below remain historical provenance. Do not rerun one-time
authoring scripts or restore old revisions over newer edits.

John's urgent upcoming data-normalisation findings are indexed in
[DATA-NORMALISATION.md](../../../hackriculture-data/planning/DATA-NORMALISATION.md),
now including additive summary consistency and crop-type calendar coverage.
The [original widget audit](../vegetable-ai-pilot/WIDGET-RULE-AUDIT.md) is
historical; the coordination document distinguishes fixes from retained rules.

## Objective and current scope

Continue the AI-assisted vegetable print-extract/layout rollout. There are 44
vegetables: **15 prepared, 29 still to prepare**. All 44 already have
approved planting illustrations. Do not confuse this rollout with image creation.

The product is Vegetable Cheat Sheets: waterproof, two-sided A4 growing sheets
in a folder, with cover/how-to pages and separate Troubles sets. The present task
is vegetable sheets only. Do not redesign the cover, Troubles, artwork or website.

AI works once to curate source-linked print copy and save layout choices.
Subsequent ordinary exports use code and approved/current records, with no AI
API call. Changed data invalidates affected extracts and prompts review.

## Start safely

1. Work in `/Users/johnlennon/Documents/web_site/hackriculture-print`, not the
   sibling `hackriculture` website checkout from which older sessions started.
   Use the existing local checkout, not a fresh worktree: important implementation
   changes are uncommitted and the shared data folders must remain its siblings.
2. Read print `AGENTS.md`, `README.md`, `SHARED-DATA.md`,
   [VEGETABLE-PRINT-STYLE.md](../VEGETABLE-PRINT-STYLE.md) and
   [ASSISTED-PRINT.md](../ASSISTED-PRINT.md). Read relevant DEVELOPMENT sections
   when changing code. Before shared writes, read its AGENTS/README/SHARED-DATA
   and the newest section of `planning/PROJECT-NOTES.md`.
3. Run the read-only [preflight.mjs](preflight.mjs) below. Investigate changed
   signatures or locks; never restore this snapshot over newer user work.
4. Cauliflower, kale and kohlrabi await John's review. When asked for a further
   bounded batch, **swede, turnip, oriental_leaves** are an available suggestion;
   check live records first. Do not automatically start another batch.
5. Keep regular checkpoints and deliver review PDFs. John approves new drafts;
   existing approval does not automatically extend to revisions or new crops.

```sh
cd /Users/johnlennon/Documents/web_site/hackriculture-print
/Users/johnlennon/.nvm/versions/node/v24.20.0/bin/node docs/handover/preflight.mjs
```

Add `--server` to make a bounded read-only HTTP check of localhost:5173. It does
not start or stop a server. Use `start.command` if needed; John enters passwords
privately. Do not terminate an existing user-owned dev server.

## Authoritative files and safety

The four projects remain siblings beneath `/Users/johnlennon/Documents/web_site`:

- `hackriculture-print`: React/Vite renderer, admin, artwork and output PDFs.
- `hackriculture-data`: canonical gardening records and shared planning.
- `hackriculture`: website, with separately approved editorial content.
- `hackriculture-video`: existing video assets/tools; out of scope.

Canonical data: `hackriculture-data/vegetables/<key>/<key>.json`,
`troubles/<key>/<key>.json`, `vegetable_groups.json`; `records.json` indexes them.
Read/write through shared `lib/records.mjs`. `generated/master/` is disposable;
never edit it or recreate local/root JSON mirrors. After deliberate shared writes,
refresh projections through the existing reader/writer/build workflow.

Use `saveCollections` with `expectedRevision` and an explicit actor. It stamps
leaf audit metadata and saves exact prior bytes under `backups/admin/`.
Routine AI changes belong only in `ai_` fields. Preserve locks, manual edits,
unknown fields, source granularity, unit pairs and month values. No self-approval.
John permits researched organic replacements in source; use the authorised
admin-correction workflow with honest attribution, never disguise ordinary AI
writes as admin to bypass protections. Ask about doubtful substantive changes.

The checkout contains substantial uncommitted work. Preserve it; do not reset,
clean, switch branches, commit, deploy or regenerate unrelated consumers.
Use apply_patch for edits. No whole-repository/media backups; JSON backups only.

## Historical approved snapshot, before the fuller-pest revision

Previously approved: asparagus, radish, celery, beetroot, carrot, lettuce,
bean_broad, bean_french, bean_runner. John approved the corrected three packs
on 21 September. The current revision changes seven layouts to review drafts;
asparagus/celery and all nine approved extracts retain their approvals.

Shared revision at handover:
`00d39f22fc45e5336771a412ad432f67789efc1728bb222ba09e2fa787e1cb75`.
Approval transaction's previous-byte backup:
`backups/admin/2026-09-21T15-54-42.947Z-1946147f-0ce8-4b04-af21-c97aac3678e4`.
These are provenance identifiers, not instructions to roll back later edits.

| Crop | Saved intro sentences | Saved variety limit | Final Tips |
| --- | ---: | ---: | --- |
| Asparagus | 4 | automatic; reviewed 6 | right column |
| Radish | 4 | 9 | right column |
| Celery | 3 | 5 | left column |
| Beetroot | 4 | 6; 5 available in pool | full width |
| Carrot | 4 | 3 | left column |
| Lettuce | 2 | 5 | full width |
| Broad bean | 4 | 5 | full width |
| French bean | 4 | 6 | full width |
| Runner bean | 2 | 5 | full width |

These original plans used target_pages 2, pest_limit 4, align_bottoms true.
Four is not a standard cap: choose useful coverage by measured crop-specific
fit. Current revised values are in PESTS-REVISION.md and the live records.

Approved metric review packs, six pages each, under `output/pdf/`:
`vegetable-ai-pilot-review.pdf`, `vegetable-batch-01-review.pdf`,
`vegetable-batch-02-review.pdf`. Individual both-unit PDFs and rendered previews
are in corresponding `tmp/pdfs/vegetable-*` directories. Output is disposable;
canonical reproduction data lives in shared records, not these PDFs.

## Non-negotiable layout/editorial rules

Priority: **legible two-page fit → column-bottom alignment → useful space filling**.
Read the full style contract, especially:

- Keep staggered hero/intro, Quick Facts/Core Needs left, calendar/varieties right.
  Align Core Needs and varieties at their bases. Prefer useful original text and
  more varieties to giant empty table rows. Preserve fonts, padding and artwork.
- Page two keeps illustrated Sowing & Planting in the existing left column.
  Final Tips is normally a full-width horizontal banner. A saved column exception
  can stack and distribute tips vertically; retain useful tips, not filler.
- Stay close to the source voice and meaning. Never silently discard granular
  master advice. Preserve crop variants, conditional advice, live measurements
  and meaningful warnings. John requires organic solutions only and authorises
  researched organic control replacements in the master. Research conflicts via
  RHS, with Charles Dowding another useful primary source. No unverified remedies.
- No image creation is needed for this phase. Do not alter padding to force fit.
- Keep checks economical, but inspect actual content, not just page counts.

## Architecture and recent pitfalls

`src/lib/vegetablePrint.ts` owns extract/layout types, checksums, dependencies,
resolvers and guards. Historical renderer revision at that snapshot: **vegetable-extracts-v3**; current evidence uses v4.
`ai_print_extracts.sections` holds introduction/key_notes/soil_facts/
looking_after_the_crop/harvesting/sowing_notes/final_tips where curated.
Each entry has value, dependencies, output_checksum, updated_at, updated_by,
status, locked and editorial_note. Layout has corresponding review metadata,
renderer_revision, saved choices and measurement evidence. Text may have metric
and imperial variants or supported measurement-path bindings.

`src/print/PrintVegetablePage.tsx` applies extracts, selects risks and renders.
`useVegetableLayout.ts` + `vegetableLayout.ts` perform fitting. `print.module.css`
owns visual layout; `PlantingCard.tsx`/`plantingIllustrations.ts` retain the already
approved planting companions. `src/lib/sentences.ts` protects abbreviations and
decimals when shortening. Schema/types/admin validation must stay aligned.

Recent errors and fixes that must not recur:

1. Item helper defaulted every Final Tip to `soil`. Save meaningful explicit icon
   keys (`water`, `harvest`, `support`, `storage`, etc.). Existing
   `src/lib/quickFactIcons.ts` resolves assets. Repetition is fine when appropriate.
2. Key Risks were ranked after page-two table truncation: lettuce rank-10 bolting
   lost to rank-3 tipburn. Rank the full applicable/deduplicated pool independently.
   Inline wins ties. Slugs/Slugs and Snails are deduplicated. Page-two table keeps
   its independent inline-first selection. Current lettuce risks: Slugs, Root
   Aphid, Bolting, Downy Mildew.
3. Automatic fitting overrode saved counts, then stretched two runner varieties
   into space for five. v3 honours explicit saved intro/variety choices and applies
   page-one stretching after fitting. Invalid saved plans still warn; remeasure
   and deliberately save better choices. Do not reduce fonts/padding.
4. Shared condition applies_to must be respected, including matching legacy
   inline copies (e.g. parsnip-only old-seed advice previously shown on carrot).

Known limitations, not new tasks: legacy inline trouble advice is not fully
reconciled with shared group advice; some unprinted lower-ranked controls remain
non-organic. Missing applies_to can allow overly broad fallback selection.
External Troubles group contents are not in vegetable layout dependency hashes;
shared trouble edits require deliberate affected-crop remeasurement. File hashes
are measurement evidence, not automatic runtime font/image invalidation. Review
changed assets deliberately. Avoid claiming a complete data audit.

## Work and validation loop

1. Read live sources for the selected crops and current planting companions.
2. Author guarded, source-linked **draft** extracts and layout plans, preserving
   source and user edits. Pick explicit icons and source-backed text, not blanket
   truncation. Save checksums/timestamps and explanatory editorial notes.
3. Render `/print/vegetable/<key>?units=metric&aiReview=1` (then imperial) through
   local Vite after fonts/images and `document.body.dataset.printReady` are ready.
   Read printWarnings/printError and image readiness.
4. A4 PDF: scale 1, backgrounds on, margins top 18/bottom 20/left 14/right 14 mm;
   measurement viewport 688×979. Verify actual page count and column gaps (≤1px).
   Assert actual variety names/counts, risk selection and tip icons. Inspect a
   small representative visual set and all materially changed/problematic areas.
5. Save measured output against the current renderer and source. Produce review
   pack(s), update progress, and leave new crops draft until John approves.

Scripts in `docs/vegetable-ai-pilot/` are examples, not safe general automation.
**Do not rerun prepare.mjs, revise-alignment.mjs, batch-01.mjs, batch-02.mjs or
correct-selections.mjs over the approved nine.** Old authors contain obsolete
defaults. Adapt a new bounded script for new keys. `export.mjs`/`assemble.py`
currently hardcode the existing batches and have crop-specific assertions;
extend explicitly. `finish.mjs --refresh-approved` only refreshes measurements;
`approve.mjs --rollout` is already fulfilled, not a step to repeat.

Known runtime: Node 24 at
`/Users/johnlennon/.nvm/versions/node/v24.20.0/bin/node`.
For npm commands put that bin directory first on PATH. Load the PDF skill and
discover bundled dependencies when doing PDF work. Prior Python runtime was
`/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`.

Last correction checks: 236 print tests passed; TypeScript/Vite build passed
(existing large-chunk warning); shared verify-data passed; all 18 crop/unit
exports had 2 pages, no overflow/missing-image warnings and aligned bottoms.
Poppler reports Type 3 glyph bounding-box warnings on bean PDFs, but reviewed
pages render intact. Do not turn routine crop additions into a typography audit.

For code changes run focused tests, `npm test` and `npm run build`; for ordinary
curation use bounded export/content checks. Shared integrity:
`node ../hackriculture-data/scripts/verify-data.mjs`. No need to re-export all
approved crops or build unrelated website/video projects on each batch.

## Remaining 29 keys

artichoke_jerusalem, artichoke_globe, aubergine, beet_leaf,
capsicum, celeriac, chicory,
cucumber_greenhouse, cucumber_outdoor, endive, florence_fennel, garlic,
leek, marrow_courgette, squash_pumpkin, mushroom, onion_shallot,
oriental_leaves, parsnip, pea, potato, rhubarb, salsify_scorzonera, spinach,
swede, sweet_corn, tomato_greenhouse, tomato_outdoor, turnip.

Check live records before starting: another session/user may have progressed.
Detailed history: [ROLLOUT.md](../vegetable-ai-pilot/ROLLOUT.md), with newest
approval paragraphs authoritative over older draft notes. This brief is the
clean handover; do not reload the whole historical conversation unnecessarily.
