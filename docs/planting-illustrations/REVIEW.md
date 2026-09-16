# Planting artwork: approval review

16 September 2026. Complete draft catalogue: 90 selected images, 94 placements, 44 crop records. Image creation only: no changes have been installed in the live PDFs.

John approved the first 14 scenes in principle and authorised the remaining catalogue in this style. Later images and refinements remain drafts for review, not individually approved. The built-in image model was used; no separately billed API fallback was used.

## Review sheets

These sheets use cream backgrounds and 24 mm-high image slots (maximum 48 mm wide). They test artwork readability, not final captions, content retention or PDF page fit. Preferred revisions replace v1 on regenerated sheets.

| Batch | Crops | Review |
| --- | --- | --- |
| 1 | Carrot, potato, rhubarb | [Enlarged](drafts/2026-09-15/batch-01-review.png) · [Small slots](drafts/2026-09-15/batch-01-small-size.png) |
| 2 | Beetroot, lettuce, leek | [Enlarged](drafts/2026-09-15/batch-02-review.png) · [Small slots](drafts/2026-09-15/batch-02-small-size.png) |
| 3 | Broad/French beans, pea, parsnip, radish, chicory | [Enlarged](drafts/2026-09-15/batch-03-review.png) · [Small slots](drafts/2026-09-15/batch-03-small-size.png) |
| 4 | Onion/shallot, garlic, Jerusalem artichoke, courgette/marrow, squash/pumpkin, cucumbers | [Enlarged](drafts/2026-09-15/batch-04-review.png) · [Small slots](drafts/2026-09-15/batch-04-small-size.png) |
| 5 | Globe artichoke, aubergine, broccoli, Brussels sprouts, cabbage, cauliflower, kale | [Enlarged](drafts/2026-09-15/batch-05-review.png) · [Small slots](drafts/2026-09-15/batch-05-small-size.png) |

Batch 6 adds leaf beet, endive, Florence fennel, kohlrabi, Oriental leaves, salsify/scorzonera, spinach, swede and turnip. [Enlarged review](drafts/2026-09-15/batch-06-review.png) · [Small slots](drafts/2026-09-15/batch-06-small-size.png). Sixteen new scenes plus two compatible reuses. Corrected endive/kohlrabi actions and fennel needle foliage are selected; earlier attempts preserved. All selected images pass alpha/dimension checks and were reviewed at full and small-slot sizes.

Batch 7: asparagus, runner bean, celeriac and sweetcorn. [Enlarged](drafts/2026-09-15/batch-07-review.png) · [Small slots](drafts/2026-09-15/batch-07-small-size.png).

Batch 8: celery, capsicum, greenhouse/outdoor tomato and conditional mushroom cultivation. [Enlarged](drafts/2026-09-15/batch-08-review.png) · [Small slots](drafts/2026-09-15/batch-08-small-size.png).

All batches complete. [Browse the local gallery](gallery.html) · [Resume point](PROGRESS.md).

## Checks and selection notes

- All selected images have genuine alpha transparency and 1774 × 887 dimensions. Scenes inspected at full size; small-slot checks performed, including batch 2 on this resume.
- Preferred refinements: beetroot fused seed clusters, chicory short blunt achenes, garlic soil cover above the pointed tip, broccoli nursery-only view. Original v1 images are preserved.
- Exact prompts, source bindings, alt text and original tool paths are recorded in BATCH manifests and revision manifests. Read preferredFile when selecting.
- Seeds are schematic, sometimes enlarged for visibility, not identification plates. Dimensions, captions, arrows and row/block diagrams must use live source data separately.
- Potato's depth refers to trench floor, not the obsolete concept-board cover label. Rhubarb buds remain exposed. Leeks are watered into open holes without dry-soil backfilling.
- Transplanting-in-progress scenes are not final depth diagrams; captions must explain the final soil level. Keep crop crown/leaf bases clear where required.
- Pea support tips approach the canvas edge. The greenhouse cucumber support is clipped at the top; consider presentation polish if the final card exposes this.
- Globe-artichoke planting scene includes a spare offset; optional simplification may improve its smallest layout.
- [Refinement history](PENDING-REFINEMENTS.json) records the now-resolved action/anatomy corrections. Sweetcorn v4 shows five rows of four, meeting the at-least-four-row block brief; earlier three-row variants are not selected. Fennel planting v4 has a frond close to the top; keep the full canvas and padding. Do not treat a generated image as accepted merely because the tool succeeded.

## Before installation

Review style consistency, young crop anatomy, planting technique and two/three-stage clarity. Then implement a bounded pilot with an explicit before/after content-retention comparison and actual two-unit PDF fitting checks. Small image sheets do not establish that the proposed widget fits.

Accepted assets can later move into public/images/planting/<master_key>/. All current art remains in docs/planting-illustrations/drafts/; no widget, public asset, approved prose or deployment changes belong to this generation pass.

[Crop briefs](CROP-BRIEFS.md) · [Layout specification](DESIGN.md) · [RHS corrections](SOURCE-ISSUES.md)
