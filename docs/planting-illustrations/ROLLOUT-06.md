# Final POC batch - resume here

18 September 2026. All 44 crops now have installed artwork and additive stored `print_planting` companions. John approved the final PDF batch, so all 44 layouts are active in normal and batch exports. Normal export remains AI-free and the guarded fitter remains enabled. The explicit review query remains available for inspection.

## Delivered

`output/pdf/planting-rollout06/planting-rollout06-A4-metric.pdf`: 32 pages, bookmarked by crop. Individual PDFs, readiness results and page counts are beside it. Export with `node scripts/review-planting-rollout06.mjs`; assemble with the bundled Python running `scripts/pack-planting-rollout06.py`. Requires the usual local server.

Two pages: Jerusalem artichoke, globe artichoke, rhubarb, greenhouse tomato.
Three pages: asparagus, aubergine, capsicum, celeriac, celery, Florence fennel, mushroom, outdoor tomato.

All twelve use the explicit labelled review path. This bypasses layout-fit rejection only, not source/font/image readiness. No attempt was made to tune each normal export or certify print publication. Asparagus and celeriac retain three illustrations; other crops use two. Mushroom illustrates the supplied-compost route, not seed sowing; celery artwork shows the block-grown route with trench advice retained separately. Alternative propagation text remains stored and source-bound. Selected corrected fennel art and the compatible tomato pot reuse were installed unchanged.

## Checks and limitations

- All twelve exports passed font, image and caption-source readiness; all produced illustrated cards.
- Deep comparison against the start checkpoint confirms every pre-existing master value is unchanged. Only twelve companions were added, all with valid fingerprints.
- Brief visual spot-check of asparagus page 2 and mushroom pages 2-3. Mushroom's existing extremely long tip card dominates page 2, moving planting content later. Asparagus uses the available page height and other content continues onto page 3. Retained as POC output at John's request.
- No regression suites, builds, cross-project rebuilds, imperial or smaller-paper checks this batch. No CSS, padding, fitter or production-export behaviour changes.
- Granular source text remains intact. The compact printed captions are selective, not a claim that all stored source detail fits the page. Existing prose-only dimensions (notably greenhouse tomatoes) still need structured measurement bindings if they are to appear automatically in both units. No conflicting measurements were newly adjudicated or changed this batch.
- Review output is not public deployment. No server was started or stopped this batch; the existing local server was reused.

## Restore points

Under `../hackriculture-data/backups/documentation/`:

- `2026-09-18-planting-rollout06-start.PshHvF/`: pre-batch master, source, scripts and docs; includes completed rollout05 implementation.
- `2026-09-18-planting-rollout06-wired.X1TryA/`: new companions, layout mappings and installed art.
- `2026-09-18-planting-rollout06-complete.b3iDL5/`: final master, source, scripts, docs, art and rollout05/06 outputs; see its RESTORE.md.

Next: revisit pagination and visual refinements when desired. Do not repeat image generation or bulk rewrite the master, and do not change leaf-beet padding without a separate request. Retain the lighter POC checking policy unless scope changes.
