# Cover C — official output

John selected the new cover for official output on 30 September 2026. Cover C
is now installed at `public/front-matter/cover-A4.pdf`, retaining its chunky title,
blocky vegetable artwork, pale background, both count badges and two thumbnails.
The thumbnails now show the current redesigned Courgettes and Marrows / Broad
Bean guides, with their approved headers and continuous page numbers. Their
captures live in `assets/`, so output-folder cleanup cannot break the cover.

Build with `node scripts/build-front-cover.mjs`. The builder reads
[preview-c.html](preview-c.html), validates all images and one physical A4 page,
and refreshes the complete downloadable [PNG](c-with-previews.png). Main title
lettering remains raster artwork. The cover PDF has been visually checked;
approval/installation hashes are in `docs/redesign-rollout/APPROVAL.json`.

Use **Save complete cover (PNG)** in the preview to save the entire composition.
Saving `assets/contemporary-c.png` alone omits badges and guide previews.

E is retained as a reference only. Earlier studies and generation prompts remain
in this folder; they are not official batch inputs. The former hands-and-sheets
cover template is superseded. Contents and how-to are owned by the neighbouring
`entry-pages/` builder.
