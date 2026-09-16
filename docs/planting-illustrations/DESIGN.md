# Sowing & Planting: illustration and layout specification

Status: proposed production design, 15 September 2026. John selected [Concept 2](references/concept-2.png) and liked the [carrot page-two mockup](references/carrot-page-2-mockup.png). These raster references establish the direction; neither is a production page or an approved source of gardening facts. See [progress](PROGRESS.md), [all crop briefs](CROP-BRIEFS.md) and [source issues](SOURCE-ISSUES.md). John subsequently authorised generation of unapproved draft batches for review; the widget remains unimplemented.

## What the widget should teach

Explain the action, the correct placement of planting material, and the space it needs. Use two illustrations by default. Use a third where it explains a distinct operation that would be difficult to understand in a caption: asparagus roots and staged filling, runner-bean supports, celeriac surface sowing, leek holes, sweet-corn blocks, and the accepted carrot sequence. Do not add a generic watering scene merely to reach three. A spacing plan is a small code-drawn diagram, not another image-generation job.

Each crop brief specifies the principal route, number of scenes, proposed headings, what to draw, source bindings, information to retain, and fallback arrangement. These are editorial proposals, not replacements for approved master prose. An illustration must never silently select a variety, season or planting route that changes the advice.

## Visual brief

- Match Concept 2: economical botanical ink drawing with soft restrained colour, chocolate outlines, leaf green, pale tan soil and occasional orange accents. Keep the existing dark card heading, cream surface, border and numbered orange step markers in code.
- One teaching action per vignette. Young plants, identifiable leaves and realistic connected roots; no mature harvest portrait, extra crop title, scenery, dense soil texture, decorative beds or large hands. Use the same hand, tools, viewpoint and line weight throughout the collection.
- Side-on soil cutaways explain depth and crown position. A small overhead plan explains rows, doubles, stations or blocks. Never use a perspective arrow to imply a precise measurement it cannot show clearly.
- Produce artwork WITHOUT letters, numbers, arrows, temperature marks, captions or badges. Generate only the illustrative components. Add all teaching text, measurements, numbering and dimension lines in the widget.
- Request transparent PNG with genuinely transparent negative space. Preserve alpha and original files. Do not bake the page's cream colour into a rectangular image; it should be possible to change layout or paper without visible image boxes.
- Wide individual scene canvas: target 1536 × 768, approximately 2:1. Keep all meaningful marks comfortably inside the canvas, near the centre, with about 5% safety padding. Native outputs may differ; inspect their actual dimensions. At roughly 55–60 mm printed width, 700 useful pixels already exceed 300 ppi; do not spend credits chasing resolution that adds no visible print benefit.
- Reserve annotation space beside the seed/soil detail. Record normalised anchor coordinates after inspecting an accepted image. A soil-depth arrow must reach the correct anatomical boundary, not simply the edge of an image rectangle.
- Avoid a one-image whole-card solution: later changes of units, notes or page height should not require regenerating artwork.

## Common generation prompt

Use this with the selected Concept 2 reference and the appropriate existing crop artwork, replacing only the bracketed portions. Re-read the live crop record before issuing a generation call.

> Create one compact botanical teaching vignette for the Sowing & Planting card of a printed gardening guide. Match the supplied approved Concept 2 reference: precise warm brown ink contours, restrained green foliage, pale tan soil, very light natural texture and generous negative space. Crop: [crop]. Planting route and stage: [route/stage from brief]. Show: [specific action, plant anatomy and finished soil relationship]. Preserve: [essential technique]. Avoid: [crop-specific mistake]. Use a wide approximately 2:1 composition on a genuinely transparent background, suitable at 55–60 mm printed width. No text, numbers, arrows, badges, decorative border, mature harvest portrait or surrounding page. Keep meaningful artwork inside a 5% safety inset and reserve clear space for later dimension labels. The illustration is schematic; exact measurements will be added separately from live data.

The crop briefs below supply the scene-specific prompt content, not 44 repetitions of the same style paragraph. Full-page image edits are useful for exploration only: the mockup generator altered neighbouring text on its first attempt. Future page proofs must come from the actual PDF renderer.

## Layout sizes and content budget

The present page-two body has a 38% left column, approximately 60–65 mm of card width at A4. Keep that width for the first implementation. Use three vertically stacked elements inside each step: short heading, vignette, concise caption. Keep the step together across page breaks.

| Proposed mode | Images | Target complete card height at A4 | Intended use |
| --- | --- | --- | --- |
| Compact two | 2 | 70–90 mm | Short direct-sown crops and tight columns; small scenes about 14–18 mm high |
| Standard two | 2 | 90–110 mm | Transplants, tubers and bulbs; scenes about 18–24 mm high plus variant/spacing text |
| Standard three | 3 | 110–130 mm | Three distinct teaching operations; scenes about 17–22 mm high |
| Text fallback | 0 | Existing content-driven size | Missing artwork, unresolved route or a page that cannot hold the pictures safely |

These are target budgets, not verified dimensions. The heading, gaps, captions, spacing diagram and retained notes are INCLUDED in the card total; do not allocate the entire budget to pictures. Fit a 2:1 image proportionally inside its reserved slot: at 18–24 mm high it occupies 36–48 mm width, leaving annotation room within the wider card. Do not stretch it to fill both dimensions. Start with 8.5 pt captions/body, matching current step text; measurement labels should not fall below the current 7.5 pt chips. About 3 mm interior padding, 1.5–2 mm between elements, and 2–3 mm between steps are starting values to test, not new global styles.

Keep the existing Soil & Preparation card above. Remove the old sowing method paragraph and measurement chips only to the extent their meaning is actually represented by the steps and labels. Supplemental notes use bullets, not a second numbered sequence. Do not move duplicate facts off the page merely because they also exist on the website.

## Preventing useful information from being lost

For each pilot render, first capture the current page's visible text and the source items represented by it. Classify each proposed change as retained verbatim, represented in a caption/measurement, retained as a note, or proposed omission. New selected source material needs the same record. This content-retention record belongs with the crop's progress entry before the new widget replaces the old card.

Essential content is always retained: planting route; seed versus transplant stage; depth/cover/crown relationship; relevant spacing and variety qualifiers; after-frost/hardening or temperature conditions where required; no-transplant/root-disturbance cautions; sequencing that changes the method. Crop briefs identify further essentials. Do not rely on a generic note count or rank alone to preserve them.

Use space in this order:

1. Use existing empty left-column height without lengthening the page.
2. Remove repeated prose only after the new caption or measurement covers the same point. Keep seed spacing, thinning spacing and final planting spacing distinct.
3. Reduce decorative white space and illustration height within the tested readable limits.
4. Combine two related drawings into one teaching scene where the crop brief allows it; retain the action in words. Prefer two useful illustrations to three cramped ones.
5. If necessary, retain the current text card for that crop pending a specific rearrangement. Record any proposed loss of unique advice for John to review; do not silently squeeze the right column or remove care/harvest/pest information.

Some existing pages already overflow. Do not impose a fictional universal two-page baseline or call existing overflow a new image regression. Conversely, an existing three-page crop is not permission for the new widget to add another page or lose more text.

## Current implementation implications (for the next stage)

Relevant owners: `src/print/PrintVegetablePage.tsx`, `src/print/print.module.css`, `src/print/useVegetableLayout.ts`, `src/print/vegetableLayout.ts`, and `src/lib/measure.ts`.

The current `sowing` block reads top-level method, notes and spacing; its depth uses `sowing_depth ?? planting_depth`. This cannot describe mixed routes correctly. Keep the existing page-one facts untouched in this work, but bind each NEW widget step explicitly to its stage and source fields. No new generic fallback should turn a seed depth into a crown-planting label. Unknown or conflicting measurements stay descriptive or trigger the documented text fallback; no guessed number.

The current `p2TrimLevel` reduces soil, care, harvest and sowing notes together. Image layout must have its own bounded fit choices before that mechanism can remove additional information. Reserve artwork geometry/aspect ratios before loading, then run page-two fit checks after images and fonts are ready and whenever widget size/route changes. The existing page-two fit effect is driven by trim state; it must be reviewed for this new dependency. Preserve StrictMode replay handling, the `printReady` signal and bounded termination. Verify the actual PDF, not DOM height alone.

Proposed code-owned configuration: a typed `src/print/plantingIllustrations.ts` mapping master crop keys to artwork IDs, route IDs, step order, source paths and approved layout modes. This is PRESENTATION metadata, not a copied gardening database. Its captions/derived text must trace to master fields. If storing new editable gardening prose or new measurement pairs becomes necessary, design that change in the shared master with matching validation and admin support; do not hide it in a local JSON mirror.

Resolve the chosen imperial or metric field at render time using existing helpers. One image set serves both. Preserve qualifiers and ranges; do not parse arbitrary prose into an automatic numerical diagram. For complicated variants, use a concise labelled text list sourced from the correct fields instead of unsupported precise arrows.

Use a compact code-drawn spacing plan only when relationships are supported: two adjacent row centre lines, plant centres within a row, clearly grouped double rows, or a block of at least four short rows. The illustration can remain schematic. The existing anatomical anchors for each scene, not the numeric value alone, define any depth annotation.

## Asset organisation and reuse

Proposed runtime files, once accepted: `public/images/planting/<master_key>/<stage>-v1.png`. Examples: `carrot/sow-thinly-v1.png`, `carrot/cover-lightly-v1.png`, `carrot/thin-later-v1.png`, `leek/water-hole-v1.png`. The directory key is the master key, never a guessed route slug: `marrow_courgette`, `squash_pumpkin`, and `onion_shallot` are notable examples.

Exact reusable scenes belong in `public/images/planting/shared/<action>-v1.png`. Reuse a seedbed/hand scene only if seed shape, quantity, placement and technique fit both crops. Reuse module or watering motifs where appropriate; do not reuse carrot seed artwork for pea or beet seed clusters, or crown artwork across rhubarb and asparagus. The same young tomato scene may serve greenhouse and outdoor starts; the final setting/support treatment must remain route-specific.

Keep concept references and accepted prompt/QA records under this `docs/planting-illustrations/` directory. Runtime manifest entries should identify image file, dimensions, alt text, source path bindings, annotation anchors, route, generation/prompt version and approval status. Archive rejected drafts outside `public/`, in a dated shared backup folder; do not add rejected images to the website bundle. Copy accepted generated originals from the tool output into the proper project location, preserving the tool originals. Never overwrite v1 when testing v2.

Do not put production assets in `output/`: it is ignored by Git and used for disposable PDFs. Do not add illustration data to the website's editorial folder. No new runtime assets or configuration have been created in this planning stage.

## Credit-conscious production sequence

1. Build the first carrot widget with the existing approved reference as a layout guide. Generate its three separate text-free scenes, inspect them, then test the real PDF. Stop regenerating whole-page mockups.
2. Test a two-image crop, potato, using the RHS-ground-planting route: 15 cm trench depth, measured to the trench floor, not an invented soil-cover distance. Keep a text spacing table for early/maincrop variants. A simple rhubarb pair is the next low-complexity extension.
3. Test contrast cases: chicory (tight column), leek (hole/watering sequence), then broad bean or sweet corn (double rows/blocks). Resolve the relevant source issues first. Each implementation change still follows the project's required representative PDF tests.
4. Generate only a small batch of ready briefs at a time. First create/check one representative per visual family, then reuse its style reference and genuinely reusable artwork. No automatic 44-crop generation call.
5. Use the built-in image-generation workflow, one call per scene. Do not switch to a paid API/CLI path without John's explicit request. Keep each output independent so only an unsuccessful scene needs regeneration.
6. At each checkpoint record attempted calls, accepted scenes, exact paths, source fingerprint, checks, remaining issues and next action. Do not infer monetary costs or remaining credits from image count. John approved the first fourteen scenes in principle and authorised the remaining catalogue in the same style; later images/refinements remain drafts for individual review. Read [PROGRESS.md](PROGRESS.md) and the batch manifests for current status.

Unapproved originals belong under `docs/planting-illustrations/drafts/<date>/<master_key>/`, with the exact prompt, source bindings, generation status and QA record in the batch manifest. Only approved scenes move into `public/images/planting/`. Drafts do not change live PDF output.

The catalogue plan has 43 ordinary planting widgets plus one mushroom exception. Scene counts and production status are enumerated in the crop briefs; they represent potential placements before reuse, not a commitment to generate everything at once.

## Validation gate for later implementation

- Focused behaviour checks: chosen source route, units, unknown/missing data, image fallback and essential text retention. Then the project's full tests and TypeScript/Vite build.
- Actual PDFs for the existing representative set in both units, plus the newly changed technique family. Check real image/font readiness, page count, cropped or overlapping labels and readable captions at physical print size. Add A5/A6 spot checks because the new small annotations will scale down even though paper sizing code is unchanged.
- Compare retained information to the current PDF and source, especially the right column after fitting. Confirm no new page or unrecorded loss. Do not use an unchanged whole-catalogue render as a substitute for these focused checks.
- Compare accepted images for visual consistency and biological/technical correctness. Keep measurements in code and inspect arrow endpoints, particularly tubers, crowns and nursery/final spacing.
