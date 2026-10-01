# Vegetable design references

**Richer A v1 is approved and locked as the forward design (28 September).**
Use [the approved proofs](fresh-c/RICH-A.html), [approval manifest](fresh-c/DESIGN-APPROVAL.json)
and [style contract](../VEGETABLE-PRINT-STYLE.md). It restores the full approved
carrot-guide content and visual information in both units. Shared-template
migration and physical PDF validation remain. Preserve these reference files.

The earlier Garden Green, Verdant and sparse A/B/C studies below are references
only. They must not override or be rolled out in place of Richer A.

## Earlier Garden Green pilot

John approved the two-page pilot. The next decorative experiment is
[VERDANT.html](VERDANT.html): a peach organic backdrop, 10% larger hero and a
small foliage overlap across the orange header rule (not selected). `render.mjs --verdant`
reproduces the comparison without changing the live renderer. Both-unit browser
checks preserve advice, widget geometry and page dimensions; fonts/images load.
This experiment has no new PDF export; page two stays as approved.

[TWO-PAGE-PILOT.html](TWO-PAGE-PILOT.html) shows actual PDF renders in both units.
PDFs: `output/pdf/garden-green-pilot/carrot-{metric,imperial}.pdf` from the project
root. Each is two A4 pages using 18/20 mm top/bottom and 14 mm side margins.
Lilita One is embedded. Page two carries the green heading bars and orange pest
section. Small pest-table names retain the existing body font for readability.
Planting art and header bubbles are unchanged.

`render.mjs --pdf` uses the selected theme and its `garden-green-two-page.css`
extension. Browser-only overrides keep the live templates and master data intact.
Start the server with `start.command` before rendering. No production rollout yet.
The font comes from Google Fonts; network is required for regeneration.

Checks actually run: both-unit unchanged advice text, loaded fonts/images,
unchanged widget bounding boxes on both pages; two physical A4 pages each;
PDF font/text inspection and visual review of all four exported pages. Results
in PDF-CHECKS.json; PNGs in pdf-preview/. No full suite or catalogue render.

## Artwork and references

Hero generated with built-in imagegen from cover C; exact prompts in PROMPTS.json.
The generator's alpha attempts left a halo, so assets/carrot-c-style.png has a
cream background, presented with CSS brightness(1.05) and multiply blending.
The decorative experiment uses the new `assets/carrot-cutout.png` instead:
built-in imagegen background extraction, original alpha preserved, no blending.
It is visually clean on peach and green in the browser preview; PDF rendering of
this new cutout remains to be checked if the experiment is selected.

[STYLE-STUDIES.html](STYLE-STUDIES.html): three earlier first-page studies.
[REVIEW.html](REVIEW.html): initial current/C-style comparison.
Use `render.mjs --studies` for studies, or no option for the first comparison.
The overnight hero batch is not scheduled; scope and timing still need settling.
