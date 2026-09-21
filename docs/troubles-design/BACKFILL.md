# Approved-guide artwork backfill — 19 September 2026

John approved tomato/cucurbit proofs; approval recorded via guarded commands. New policy: every condition widget should have an illustration, including earlier guides. First scope is all six approved Troubles guides. Inventory: ten gaps (three tomato, four cucurbit, two carrot/parsnip, one brassica). Bean/pea and beetroot already complete. Prompt manifest: backfill-prompts.json, built-in image generation only. Images will be versioned under public/images/troubles/<group>/, never overwrite originals. No source prose edits required.

Completed: all ten images generated with the built-in image tool, visually inspected, copied to versioned public paths and installed through the backed-up shared writer. Exact original/output paths are in backfill-results.json; exact prompts in backfill-prompts.json. All 127 condition widgets across the six approved groups now reference available images. Future Troubles batches should also have an image for every condition widget.

Approved source and AI prose are unchanged. Existing approval states retained for the user-authorised enhancement; new artwork is presented for review, not represented as separately approved by John. Plan signatures refreshed for image-only changes. No renderer, font or padding changes. Tomato remains 8 pages/28 cards, cucurbit 7/26, brassica 8/29, carrot/parsnip 4/15. All four reports show zero overflow and zero warnings. All 27 rendered pages received a basic visual check, not a fresh editorial audit.

Small fit adjustments: carrot/parsnip first-page left cards changed from 93.5/93.5 mm to 102/85 mm. Brassica first-page left now Woody Kohl Rabi (100 mm) and White Blister (97 mm); Cabbage Root Fly moved to page 4 in the former White Blister slot. No additional pages or text cuts. Preserve these values in the authoritative record; do not rerun old preparation packets.

Scripts install-troubles-backfill.mjs and fit-troubles-backfill.mjs are guarded one-shot operations; do not rerun. Deterministic exports use scripts/export-troubles-review.mjs GROUP. Outputs remain under output/pdf/ai-once-pilot/*-review-A4.pdf. Later button exports use the saved images/layouts with no AI call.

Exact preceding-byte backups in ../hackriculture-data/backups/admin:
- Tomato approval: 2026-09-19T22-40-40.169Z-a5947d25-6294-4008-904f-cc0ecdc3c2da
- Cucurbit approval: 2026-09-19T22-40-40.530Z-0f678da1-1352-4650-8bbc-eb23c30caa6f
- Ten image references/hashes and layout signatures: 2026-09-19T22-55-10.044Z-013b72da-d9d0-42df-b330-e056c29fdf41
- Brassica/carrot fit adjustments: 2026-09-19T22-57-06.811Z-4080e218-3fe8-4cd3-a039-a2d9c143d203

Missing UK pest identification for Vine Borer and uncertain Parsnip Rust remain caveats; artwork depicts reported symptoms rather than claiming confirmed species. Legacy baked checkerboards and deferred hero images remain unchanged. Other eight, not-yet-prepared groups still need their own rollout and artwork coverage. No external publication, git commit or push.
