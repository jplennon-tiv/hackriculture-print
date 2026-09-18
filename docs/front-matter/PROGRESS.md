# Vegetable Cheat Sheets - front matter

**Approved and installed for Batch Print All, 18 September 2026.** Fan v3 artwork is now `public/images/front-matter/hands-sheet-fan.png`; canonical PDF `public/front-matter/cover-A4.pdf` has the review label removed. Each batch includes it first as `output/00_cover_A4.pdf`, always A4, with progress/error counting. How-to pages remain outside the batch. Builder: `scripts/build-front-cover.mjs`; durable layout snapshot `docs/front-matter/templates/approved-cover.html`. Earlier drafts remain untouched. Backup: shared `backups/documentation/2026-09-18-cover-batch.IjjsCJ/`. Focused batch checks cover both successful inclusion and missing-cover continuation; no live full-catalogue render requested or performed.

Current cover: **fan v3**. Replaced fading wrists with crisp irregular torn-paper cutout edges; fourth sheet from left/top is now a tomato front, not a mixed front/back. Other cover layout and typography unchanged. Built-in image edit; asset and exact prompt at `docs/front-matter/assets/hands-sheet-fan-v3*`. PDF: `output/pdf/front-cover-fan-v3/vegetable-cheat-sheets-cover-fan-v3.pdf`; generator `scripts/front-cover-fan-v3.mjs`. A4 rendered and visually reviewed. Prior versions retained. Restore point: shared `backups/documentation/2026-09-18-cover-fan-v3.I6Ir8N/`. Await user review.

Latest cover revision: **fan v2**, 18 September 2026. Leftmost carrot sheet now sits above every sheet to its right, with rightmost underneath. Uniform narrow white borders target approximately 3 mm at represented A4 scale. Transparent background and softly fading wrists remove the rectangular image boundary. Cover typography/layout and how-to remain unchanged. Rendered and visually checked on the dark cover background. Output: `output/pdf/front-cover-fan-v2/vegetable-cheat-sheets-cover-fan-v2.pdf`; generator `scripts/front-cover-fan-v2.mjs`; source asset and exact prompt under `docs/front-matter/assets/hands-sheet-fan-v2*`. Built-in image generation used. These are illustrative miniature sheets, not exact final sheet reproductions. Previous versions retained. Restore point: shared `backups/documentation/2026-09-18-cover-fan-v2.LGH550/` (prior progress plus v2 asset, prompt, generator and output).

18 September 2026. John selected Concept 2 (bold field-folder design). Cover revision 1 replaces the six crop tiles with two hands holding fanned growing sheets. How-to page unchanged. Working title approved: **Vegetable Cheat Sheets**. Subtitle: **Your grow-at-a-glance guide**. No Hackriculture branding.

Latest review: `output/pdf/front-cover-fan-v1/vegetable-cheat-sheets-cover-fan-v1.pdf`. Generator: `scripts/front-cover-fan.mjs` (uses original concept HTML). Project asset and exact built-in image-generation prompt: `docs/front-matter/assets/hands-sheet-fan-v1.png` and adjacent prompt Markdown. Small sheet text is generated illustrative content; do not use it as authoritative advice. Title/subtitle remain native text. A4 PDF rendered and visually checked. Restore snapshot: shared `backups/documentation/2026-09-18-cover-fan.nOfs2J/`, containing previous progress and new revision files. Await cover feedback before further refinement.

## Review pack

`output/pdf/front-matter-concepts/vegetable-cheat-sheets-front-matter-concepts.pdf` contains six A4 portrait pages, each pair a cover plus a how-to page:

1. Botanical: warm ivory, Playfair Display title, existing botanical collage; annotated real carrot front/back thumbnails.
2. Field folder: charcoal-green, bold Inter typography, crop grid; six visual instruction panels.
3. Seed to harvest: white, green and warm ochre, illustrated carrot sequence; three-stage how-to journey.

Existing crop art, planting scenes and icons reused without alteration or image-generation cost. The mini carrot sheets are existing approved-pilot renders, not newly regenerated crop content. Calendar blocks and Core Needs values are explanatory examples, not instructions for the crop pictured beside them.

These are standalone mockups, not production front matter or changes to the growing-sheet renderer. Dark backgrounds/edge strips in concepts 2-3 will need printer bleed/trim decisions later. Content has a 24 mm left inset for binding; confirm actual folder/punch arrangement before final artwork. Waterproof describes the intended printed product, not a property of a PDF. Final paper/printing specification remains to be chosen. Concept labels in footers are for review and should be removed from finished artwork.

## Reproduction and checks

Run `node scripts/front-matter-mockups.mjs` using installed Node 24. It exports a self-contained-image HTML and PDF, with readiness.json. Google Fonts access is needed for Inter and Playfair Display. Source is separate from application code; no app tests/builds needed or run.

Verified six A4 pages, all images decoded and both fonts loaded. Rendered and visually reviewed all six pages; corrected final-page footer crowding and made the cover's seed-to-harvest sequence consistently carrot. PNG previews are alongside the PDF.

Restore points under shared `backups/documentation/`:
- `2026-09-18-front-matter-start.V5y66B/`: existing project instructions and architecture reference. New mockup files did not previously exist.
- `2026-09-18-front-matter-complete.kAB2hK/`: generator, this progress file and complete output directory. Restore these selectively to their original paths; no shared gardening data was changed.

Next: choose a direction or combination before detailed artwork. Suggested combination: cover 1 with how-to 2. Further how-to pages can be added if practical folder organisation or more icon explanations are wanted. Do not regenerate the 44 crop guides for this work.
