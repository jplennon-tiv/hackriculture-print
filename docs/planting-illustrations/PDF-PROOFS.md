# Planting PDF proofs — restore point

Historical proof stage below. John subsequently selected the existing-column version; five normal-export pilots are now installed. See [current production implementation](IMPLEMENTATION.md). The old full-width recommendation/next action is superseded.

Status: complete for review, 16 September 2026. Review only; normal application exports and shared gardening data remain unchanged. Read [content comparison and validation](PDF-CONTENT-REVIEW.md) for the completed results and limitations.

User requested the first five contextual PDF proofs (beetroot, carrot, potato, leek, chicory), and is interested in a full-width planting card with Final Tips moved into a smaller card. Compare existing-column and full-width arrangements. Preserve baseline visible content outside planting and record each planting-text change. No automatic trimming to accommodate art.

Pre-work snapshot: `../../../hackriculture-data/backups/documentation/2026-09-16-planting-pdf-start.SqBAuv/` (relative path is descriptive; actual backup is in sibling hackriculture-data).

Approach: a standalone Playwright proof builder loads the actual print route, waits for its normal fitted baseline, then applies an isolated in-memory layout. It uses selected existing PNGs without image generation or asset installation. The normal print application is not modified. PDF settings match pdfPlugin.ts. Metric and imperial samples will be checked. Deliver combined review PDFs in `output/pdf/planting-proofs/` with a content-retention audit.

Current checkpoint: builder and stylesheet implemented; 30 individual A4 proofs generated across five crops, two units and three variants. Existing-column variants use two leek scenes (hole-making combined with lowering) and side-by-side small chicory scenes. Full-width variants condense duplicated Final Tips into reminder labels, keeping the original full advice in Care; neighbouring cards are rearranged. No baseline visible planting notes or soil/care/harvesting/pest advice removed. Master maincrop potato row spacing and leek transplant-hole depth now explicitly represented.

Application verification: 134 tests passed; TypeScript/Vite build passed with existing chunk-size warning. Master SHA-256 remains unchanged. Final browser fit, image loading, actual PDF page-count, retained-text and font checks all pass. Earlier extra pages for wide leek/narrow chicory were resolved by spacing-only changes; every final individual PDF has exactly two pages. Fonts are loaded: Chromium emits Type3 subsets, so the verifier reads FontDescriptor/FontName, not just BaseFont. No font-loading change was needed. Visual review scope is recorded in PDF-CONTENT-REVIEW.md.

Latest layout checkpoint: sibling `hackriculture-data/backups/documentation/2026-09-16-planting-pdf-layout.wkJCwX/`. Earlier pass-one snapshot: `2026-09-16-planting-pdf-pass1.FA4CKA/`. Complete artwork snapshots listed in PROGRESS.md remain intact.

Reproduce only if needed: with the existing local print server available, run `node docs/planting-illustrations/build-pdf-proofs.mjs`, then bundled Python with `docs/planting-illustrations/assemble-pdf-proofs.py`. The latter verifies actual two-page PDFs, retained text, unchanged page-one text and embedded fonts, renders actual PDF pages under `output/pdf/planting-proofs/qa/`, and assembles three ten-page metric review packs. Existing master prose may contain imperial units in metric output; preserving baseline wording is not a new horticultural audit. No new image-generation calls required.

Next action: John reviews the three packs (especially full-width planting plus smaller Tips), selects a layout and any text changes. Do not install prototypes or regenerate the catalogue without that next instruction. No additional task work is required to deliver the current review set.

Completed restore point: `/Users/johnlennon/Documents/web_site/hackriculture-data/backups/documentation/2026-09-16-planting-pdf-complete.TRvLqO/`. Contains proof builders, stylesheet, current handoff/content review/progress, unchanged master bytes, and the complete proof output folder including the three review packs, individual unit variants, audits and rendered QA pages. Source artwork is unchanged and retained in the earlier complete image snapshot linked in PROGRESS.md.
