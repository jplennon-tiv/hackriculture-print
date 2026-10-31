# Brassica Troubles: complete-guide flow proof

31 October 2026. **For John's review: six pages, folios 106–111, 29 complete
problems.** The 25% larger diagnostic boxes, separate wrapping masks and 4 mm gap
are already approved. This proof tests their complete-guide composition together
with the requested natural flow and trailing final-page space. It is not a new
approval, a main-book replacement or a supplier upload.

[Imperial proof](../../../output/pdf/brassica-flow-preview/brassica-troubles-imperial.pdf) ·
[Metric proof](../../../output/pdf/brassica-flow-preview/brassica-troubles-metric.pdf) ·
[Before/after overview](before-after-contact.jpg)

Actual facing spreads: [106–107](imperial-spread-106-107.jpg),
[108–109](imperial-spread-108-109.jpg), [110–111](imperial-spread-110-111.jpg).
The PDF pages are exact 185 × 240 mm trim with Bookvault's existing 17/8 mm mirrored
body margins, rather than bleed files. The folios establish facing-page context;
final index references must be refreshed when these bodies are integrated.

## Authority and sources

John approved the [larger-image specimen](../troubles-image-size-study/APPROVAL.json),
then asked for spare space at the end of a guide rather than spread through it.
He authorised one coordinated pass on the complete Brassica guide, with full
handover documentation and removal of superseded instructions. Other Troubles
guides are outside this proof. Review this complete composition before extending
its implementation to them; do not ask again about the approved image settings.

The [current book contract](../../BOOK-PRINT-STYLE.md#troubles) owns the forward
rules. The [asset registry](../../assets/README.md) identifies the retained A4
Open Editorial sources. This proof takes the same source-linked markup through
`EditorialTroublePage.tsx` and the compact production renderer. It preserves all
29 entries in their existing order, crop applicability, symptom lines, Recognise /
Act / Prevent advice, diagnostic artwork and type sizes. There are **no omissions,
rewrites, redraws, canonical-data edits or shared-data saves**.

The old six-page layout is captured in [imperial-before.html](imperial-before.html)
and [metric-before.html](metric-before.html). These are live-renderer baselines,
with the already-removed arrowed page headings. The imperial body's glyphs and
type sizes also match Brassica in the current main-book PDF exactly. The new
[imperial-after.html](imperial-after.html) and [metric-after.html](metric-after.html)
retain their complete layout for inspection; local image/mask/font URLs need the
local server. The delivered PDFs have embedded artwork and fonts and need no server.

## What changed

- Every diagnostic uses the approved **135 × 157.5 CSS px** box, up from 108 × 126.
  Both dimensions scale by 1.25; the original aspect ratio and whole drawing remain.
- All 29 drawings now have separate transparent SVG wrapping masks. Text follows
  these silhouettes with **4 mm `shape-margin`** and a 0.5 alpha threshold.
- Page breaks are measured after fonts, drawings and masks load. The planner first
  minimises page count, then puts the largest feasible ordered group on the earliest
  page, then fills the left column first. It does not redistribute entries backwards
  to equalise page fullness. Each entry remains indivisible.
- The normal **8 px inter-entry gap** and **7 px entry top padding** remain. Columns
  use natural heights. Their top text edges align; bottom edges may differ. No
  `space-between` stretching, fixed column height or internal advice padding is added.
- The removed arrowed navigation left 30 px below the header content. This proof
  reduces that to **14 px**, preserving the title, legend, introduction, badge,
  decoration and type. That recovered space keeps the guide at six pages.
- The final page finishes naturally after its three entries, with about **69.44 mm**
  from the lowest complete entry to the footer. This is intentional trailing space.

The first four pages contain 5, 5, 6 and 6 entries. Folio 110 has four; 111 has three.
Folio 110 retains **61.50 mm** above its footer because no ordered five-entry split
fits its two columns. Adding the next entry to the left column would exceed the
content limit by about 6.6 mm; the other possible split also overflows. This is
unavoidable whole-entry space, not distributed padding. No advice or image was
shrunk to remove it. The numerical check tries every ordered split including the
next entry on every non-final page, and confirms none fits.

## Mask provenance and reuse

[MASKS.json](MASKS.json) binds every condition key to its original image URL,
original-image SHA256, SVG URL/hash, base dimensions and geometric bounds.
The four masks from the approved opening specimen are reused **byte for byte**;
the other 25 use the same algorithm. The [overlay sheet](mask-alignment-review.png)
shows each mask over its actual source for review. Pink is a review overlay only.

The visible PNGs are unchanged. Their backgrounds are made unobtrusive by the
existing `mix-blend-mode:multiply`; the first four investigated assets were opaque,
not transparent. The SVG is an invisible layout resource, not replacement art,
an alpha conversion or a file printed on the page.

The reusable [mask builder](../../../scripts/lib/troubles-mask.mjs) reads source
pixels without writing them. It marks pixels with alpha greater than zero and
minimum RGB below 247. Four-connected components smaller than 16 source pixels,
and edge-touching components smaller than 256 pixels, are excluded from the mask
only. It encloses the outer marks in approximately 2 CSS px horizontal bands at
108 × 126, joining the left and right envelopes and filling internal holes. This
keeps text out of gaps between stems or detached insect details. Discarded-pixel
counts are recorded; original artwork retains every pixel.

The SVG scales with the enlarged image. The 4 mm gap stays a physical constant.
Float margins on the text-facing, top and bottom sides expand only when needed
so the browser does not clip that gap at the float's margin box. Right alignment
is preserved. This is layout geometry, not a new illustration style.

`prepareTroubleFlow` checks every original-image and SVG hash before export,
requires exactly one matching mask for every illustrated entry, decodes every SVG
before measurement and rejects stale/missing/mismatched assets. Future artwork
changes therefore require explicit mask review. Do not assume another guide's
background or detached details behave identically: inspect its overlays and PDFs.

## Implementation and reproduction

The opt-in profile is [troubleFlow.ts](../../../src/print/book/troubleFlow.ts), called
by [renderCompact.ts](../../../src/print/book/renderCompact.ts) through the optional
final argument `prepareCompactBook(..., production, {masks})`. The ordinary API,
A4, other guides and main-book assembly do **not** opt in. The old default planner
is retained for compatibility until rollout, not as a design instruction.

Start Vite through `start.command` on loopback, following [SETUP](../../../SETUP.md).
Then run these sequentially from the project root:

```sh
node scripts/build-brassica-flow-preview.mjs
/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/review-brassica-flow-preview.py
```

The [bounded builder](../../../scripts/build-brassica-flow-preview.mjs) captures both
baselines, makes/verifies masks, renders both new editions, writes HTML/measurements
and checks protected files. The [PDF checker](../../../scripts/review-brassica-flow-preview.py)
compares actual body glyphs/type sizes and decoded embedded images, verifies fonts,
proves the packing constraints, writes trim-only PDFs and renders every page/spread.
It also compares the imperial baseline body with the existing main book. No full-book
builder or historical collection-preparation runner is needed. Both scripts refuse
to overwrite this proof once an `APPROVAL.json` is present. Temporary component PDFs
are in `tmp/pdfs/brassica-flow-preview/`; final outputs are linked above.

## Verification and status

[DOM checks](CHECKS.json), [PDF checks](PDF-CHECKS.json), [page map](PAGE-MAP.json)
and [visual/code review](REVIEW.json) record exact coverage and hashes.
Both editions have six pages and all 29 entries once, with identical wording,
order, applicability, original image files, embedded diagnostic bytes and body
type sizes. Every font is embedded, including glyphs represented as Type3 fonts.
The smallest measured content-to-footer gap is **4.21 mm**. Both-unit rendered
pages are pixel-identical: this guide's retained advice contains no unit-dependent
length conversion. All six imperial pages and their three actual spreads were
visually inspected, as were all 29 mask overlays and the old/new guide comparison.
No clipped advice, cropped diagnostics or text/drawing collisions were observed.

Code checks: routine suite **43 tests**, focused compact export suite **5 tests**,
and TypeScript checking pass. Actual guide PDFs validate the new opt-in path;
ordinary-export selection tests cover the unchanged default/A4 branch. No other
crop, whole catalogue, full build or supplier upload was run.

The main-book PDF, approved larger-image specimen, original diagnostics and A4
styles are unchanged. Brassica remains six pages, so this guide alone does not
change subsequent start folios. Individual condition locations have moved;
refresh their index destinations at integration. The current main book still
has 172 interior pages plus four cover leaves. Other pending navigation/header
changes retain their own approval status in the [handover](../../handover/START-HERE.md).

## Superseded guidance removed

The book layout skill, standing instructions, guide contract, shared design system
and DEVELOPMENT now point to natural flow instead of requiring first/last text-edge
alignment or equal guide-wide fullness. The legacy production description is labelled
as compatibility behaviour. Current README/handover no longer say sequencing is
undecided or implementation has not started. The image approval's mutable status
pointer now links here; its approved files and hashes remain intact.

The earlier mask/size study READMEs no longer instruct a future session to rebuild
approved specimens or await a decision already made. Their original builder/checker
scripts now refuse overwrites while that approval exists. Historical proofs,
A4 rules, source artwork, signed approval facts and their supporting evidence are
retained. The assisted-print document's stale “RHS-first” wording was also replaced
by the existing research-hierarchy link; this layout task performed no new research.
