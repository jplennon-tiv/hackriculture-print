# Richer A — refined group colours

28 September 2026. **Family Tint is John’s selected colour direction.**
[Current colour reference](TINTED.html). His decision: “This looks much better -
my preference is for the 'Family Tint' option.”
John selected group-coloured ribbons and rejected universal orange ribbons.
Root Crops retains its previous study palette. The other seven palettes now
coordinate their lettering, calendar, season badge and difficulty outline/dots,
as well as ribbons, accents and light fields. Onion Family uses warm plum and
aubergine with softer pale tints, replacing the previous combination of lilac and forest green. Use the current Family Tint tokens as the forward implementation reference;
actual crop proofs and physical print colours still need review.

Family Tint is the default; the cream switch remains only for comparison. Salads uses pale leaf-green paper
`#f4f7ed`, onions rose-white `#faf3f6`, and stalks green-grey `#f1f6f2`.
Other groups retain cream. Coordinated palette colours stay fixed during the
comparison; the paper colour also follows title knockouts and reversed text.
Typography, geometry and all advice stay fixed. Calendar sow/harvest
signals and Core Needs bar colours retain their meanings; difficulty values and
all artwork remain unchanged. Carrot remains the comparison page to isolate
colour. Actual crop/artwork combinations will need review during rollout.

`palettes.json` defines accent, deep, soft, wash, ink, dark and paper tokens. Deep supports
small coloured text and ribbon/table headings; dark supplies structural fills;
ink supplies body/headline text. Bright accent is used only for large title accents
and decoration. Group names remain explicit when applied to actual crops.

`build.mjs` reads the approved metric reference and builds this isolated preview
with `theme.css` and `review-template.html`. Run `node` on `build.mjs`, then
`check.mjs` for the small browser check. Both inherit the reference's online
Google Fonts dependency. No approved files, installed palettes or data are written.

[Checks](CHECKS.json): all sixteen group/background combinations preserve approved metric text and
geometry; all 35 reference hashes match. Fonts/images loaded, group and background switching
work, group ribbons are enforced, no browser errors or mobile horizontal
overflow. New small-text combinations exceed 4.5:1; large title accents exceed
3:1 except the retained Root Crops orange. Tinted onion two-page, salad and stalk renders
were visually reviewed. No PDF export or catalogue tests for this colour-only study.
