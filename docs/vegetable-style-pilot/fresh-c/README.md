# Richer A v1 — approved forward design

John approved Richer A on 28 September and explicitly locked it as the design
to use going forwards. [RICH-A.html](RICH-A.html) is the approved reference,
with the full information content of the existing approved carrot guide restored.
The [style contract](../../VEGETABLE-PRINT-STYLE.md) is authoritative;
[DESIGN-APPROVAL.json](DESIGN-APPROVAL.json) identifies the approved files by SHA256.
Preserve this baseline; use new filenames for deliberate design variants.
B was rejected and the bold field-guide C was not selected. Cover C remains
the companion cover. The sparse original A and older pilots are references only.
Both units include eight illustrated facts, difficulty/seasons, needs scales,
calendar, approved varieties, four Key Risks, the planting sequence, all approved
advice, ten trouble rows and three Final Tips. Header reminder messages are
retained as text callouts; bubble artwork remains outside this task.

`rich-a.mjs` requires the normal `start.command` server to capture the current
guide's resolved facts, varieties, risks, pests and artwork in both units. It
reads the approved prose from canonical print selections and changes no source
data. `render-rich.mjs` renders four browser PNGs and checks 86 reference strings
per unit, loaded fonts/images and text bounds. Four images visually checked.
`RICH-CONTENT.json` and `RICH-CHECKS.json` record the baseline and checks. No PDF
pagination claim; standard margins and physical PDFs still need validation.
Those generators write the reference paths: do not rerun them over the locked
baseline. Adapt output paths for a new variant or production implementation.

John rejected the mixed visual language of the incremental Verdant experiment
and requested complete design freedom on 28 September. These are independent,
two-page carrot concepts, not changes to the current print implementation.

[REVIEW.html](REVIEW.html) compares A: The big harvest, B: Seed to supper and
C: The bold field guide. Each has a practical second page. Lilita One and Nunito
Sans, C's green/orange/cream palette and the existing generated carrot cutout
form one visual system. No additional image generation was needed.

`build.mjs` reads canonical carrot data through `readCollection`; it creates
static HTML rather than using the old print template or print extracts.
`CONTENT.json` records source hash, selection and omissions. Copy is a fresh
design selection, not newly approved editorial content. Metric only.

Run `node docs/vegetable-style-pilot/fresh-c/build.mjs`, then `render.mjs` in this
directory. Local HTML uses Google Fonts; rendering needs network for those fonts.
`CHECKS.json` records asset readiness and content bounds. Six page PNGs are
browser renders at A4 proportions, not PDF exports. No production, imperial or
catalogue checks, full suite, source writes or live template changes.

Next production work is shared-template migration and a proof with standard
print margins, then another crop with contrasting content. These
concepts deliberately allow edge crops; printer margins need resolving before
production rollout. Earlier approved Garden Green proofs remain available.
