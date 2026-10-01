# Official batch front matter

Installed for John's A4 print run, 30 September 2026:

1. `cover-A4.pdf` → `output/00_cover_A4.pdf`: selected cover C, both count badges,
   and current Courgettes and Marrows / Broad Bean thumbnails.
2. `contents-A4.pdf` → `output/01_contents_A4.pdf`: signed off 29 September.
3. `how-to-use-A4.pdf` → `output/02_how-to-use_A4.pdf`: illustrated one-page design,
   signed off 30 September.

These three opening pages are unnumbered. Vegetables follow at 1–88 and Troubles
at 89–132. `output/collection-order.json` records the exact assembly order and
completion of each fresh batch. Use that list, not every PDF left in output.
The opening pages stay A4 regardless of the paper selector; use A4 for this run.

Cover builder: `node scripts/build-front-cover.mjs`. It uses the editable C
composition and local assets in `docs/front-matter/cover-studies/`. Its main title
remains part of the existing raster artwork. All images load; the installed
single-page PDF was visually checked.

Contents/how-to builder: `node docs/front-matter/entry-pages/build.mjs`.
Use `--how-to-only` to preserve approved contents during how-to revisions.
Approval hashes: `docs/redesign-rollout/APPROVAL.json`. Preserve approved output
until an authorised change; rebuilding PDFs can change their file hashes.

The live guide templates already contain the approved headers and continuous
pagination. For source/length changes, run `node scripts/measure-book-pagination.mjs`
with start.command running, then rebuild and check contents. Batch rejects stale
references. Legacy cover/how-to templates no longer control official output.
