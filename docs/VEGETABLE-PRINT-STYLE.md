# Vegetable sheets: approved style and layout rules

Read this before creating or revising vegetable print extracts/layouts. The
28 September design decision below supersedes the old visual/layout rules for
future vegetable-page work. Editorial and data-preservation rules still apply.
For production mechanics also read [ASSISTED-PRINT.md](ASSISTED-PRINT.md) and the
shared data contract.

## Approved forward design: Richer A, version 1

**Approved and locked as the design to use going forwards by John on
28 September 2026.** His decision: “Love it - this has everything I'm looking
for - please document it and lock it in as the design to use going forwards.”

The authoritative visual reference is [Richer A](vegetable-style-pilot/fresh-c/RICH-A.html),
the full-information carrot revision, in metric and imperial. Use
[the approval manifest](vegetable-style-pilot/fresh-c/DESIGN-APPROVAL.json) to
identify its exact files and SHA256 hashes. Preserve those approved references;
put deliberate new design variants at separate paths. The sparse original A,
Garden Green and Verdant are not the forward design. B is rejected; the bold
field-guide C is not selected. Cover **C** remains the companion cover direction.

### Visual language

- Lilita One for the chunky crop title and section headings; Nunito Sans for
  readable facts and advice. Follow `rich-a.css` for the actual sizes, spacing
  and proportions; do not substitute the old Inter/widget-bar treatment.
- Warm cream `#fff8e9`, forest green `#064d32`, bright orange `#ff781f`, peach
  `#ffe1b7`, light green `#d6ea9b` and ink `#173e2c`. Preserve the warm variety
  band, coloured needs scales, green calendar and orange risk headings.
- Large, blocky, saturated vegetable artwork, playful title/illustration
  overlap, orange ribbon, soft irregular backdrops and an angled difficulty
  badge. Cropping is deliberate within the decorative header; advice must
  never be covered or clipped. Transparent artwork must keep its proportions.
- Keep the approved coloured fact/tip icons, monochrome crop-specific Key
  Risks and instructional planting drawings. Do not regenerate these merely
  to impose the new hero-art style. Preserve their information and clarity.

### Group-colour refinement (28 September)

John selected **Family Tint** as the forward colour direction on 28 September:
“This looks much better - my preference is for the 'Family Tint' option.” Use
[the current colour reference](vegetable-style-pilot/group-colours/TINTED.html)
and its `palettes.json` tokens. Group-coloured ribbons remain the rule. Coordinate
ink, calendar/season fills, badges and pale fields with each family's colours.
Salads uses pale leaf-green paper `#f4f7ed`, Onion Family rose-white `#faf3f6`,
and Stalks & Shoots green-grey `#f1f6f2`. The other five families retain cream
`#fff8e9`; Root Crops keeps its accepted colour-study combination. The cream
comparison mode is not the chosen default for the three tinted families.

This decision supersedes the universal green/orange/cream colour treatment above
for group variants. Preserve the hashed Richer A reference and its geometry and
content. Calendar sow/harvest signals and Core Needs colours retain their meanings.
The live renderer now uses these palettes. Actual crop/artwork combinations and
physical A4 proofs are in the [rollout review](redesign-rollout/REVIEW.html); John approved all heroes on 29 September and accepted the 8.5 mm side insets for now after test printing.

### Heading tone (John, 28 September)

Keep the contemporary visual design, but use practical, descriptive headings.
John's channel audience is mainly 50–70; his stated preference is more restrained
wording than the playful slogans in the original visual reference. Avoid slogans,
cutesy imperatives and exaggerated claims in display copy. Use clear gardening
terms consistently across crops; preserve crop-specific meaning. This wording
instruction supersedes the example slogans in the frozen visual proofs.

[The carrot heading study](vegetable-style-pilot/plain-headings/REVIEW.html)
records the transition to practical wording. The live approved design uses
Growing & harvesting, Harvesting & storage, Recommended varieties, Sowing &
planting (Establishing the crop for Mushroom), and Growing calendar. The header
refinement below supersedes the study's generic Growing guide ribbon and strapline.
Preserve original hashed studies as references; they do not override live approved
wording. Full source advice and master hero text remain unchanged.

### Approved title/header design (30 September)

**Approved and locked by John on 30 September 2026:** “Great, this design is now
good. Please record it as the title design going forwards.” This refinement
supersedes the header treatment in the original Richer A reference; the remaining
approved composition and information contract still apply.

Use the [approved header proofs](vegetable-style-pilot/header-refinement/REVIEW.html)
and their [approval manifest](vegetable-style-pilot/header-refinement/DESIGN-APPROVAL.json).
Preserve these exact reference files; create future variants at separate paths.
The shared live template already implements this design.

- Keep the full-height hero window and Family Tint palette. Do not shorten the
  hero to make a separate full-width metadata strip.
- Keep the category above the chunky title. Omit the repeated Growing guide
  ribbon and generic strapline. Ready in stays in Quick Facts, not the header.
- Difficulty uses a 165 × 58 px oval with pale family fill, a fine ink outline
  and a 3 × 4 px dark offset shadow. Keep DIFFICULTY, the 20 px rating, five dots
  and numeric score together inside it. Float it 12 px higher on dense headers
  and 24 px higher on other headers, with a slight −3° tilt.
- Harvest Seasons has no background: 13.5 px heading and 18 px season names,
  both weight 900, with 35 px icons all on one horizontal line. Artwork overlap
  is permitted. After fonts and title fitting, place seasons high beside a title
  when there is at least 12 px horizontal clearance; otherwise place them 10 px
  below the actual title bounds. Use measured text geometry, not crop-specific
  offsets. Preserve clear title/season separation.

Verification for this approval: Radish metric/imperial and Onions and Shallots
metric physical PDFs remain two A4 pages; fonts, images and header bounds pass.
The latest focused DOM check also covers Cabbage’s four season icons. This does
not claim a fresh full-catalogue render or A5/A6 validation. Body type, source
advice and canonical data were not changed. See the reference CHECKS.json.

The how-to page can now use captures of this settled header design. Contents
remains approved and unchanged.

### Composition and information contract

- Page one: expressive crop header with category, season icons, difficulty
  label and five-point indicator; approved introduction; illustrated Quick
  Facts; calendar beside Core Needs; grouped varieties; illustrated Key Risks.
- Quick Facts retain meaningful labels, units and context: sow/harvest months,
  germination, depth, row/plant spacing, yield basis, and time-to-harvest origin
  where applicable. Core Needs show icons, labels, five-part scales and values.
- Page two: compact graphic header and three reminder messages as text
  callouts; soil/planting alongside care/harvesting; illustrated sowing sequence
  with measurements and notes; useful trouble table with signs and organic
  controls; illustrated full-width Final Tips.
- Preserve the information richness of the current approved guide, including
  approved prose, plant-stage captions, diagnostic detail and useful tables.
  Do not trade content for oversized decoration. Avoid reinstating the old
  boxed-widget layout just to recover information.
- Carrot's eight facts, three varieties, four Key Risks, three planting stages,
  ten trouble entries and three Final Tips are this reference's content, **not
  universal counts**. Adapt to each crop's approved selections and applicability.
  Do not copy carrot claims or its promotional slogan across unrelated crops.
- Original bubble artwork remains deferred on John's task list. This design
  preserves its useful messages as callouts; approval does not reopen bubble work.

### Approval versus production status

The design decision is settled. Both-unit browser proofs are approved: two
794 × 1123 px pages per unit, four images visually checked, 86 reference text
items verified per unit, fonts/images loaded, no text outside the measured
page/footer bounds. These checks do **not** establish physical PDF pagination.

The live route now uses `RichVegetablePage.tsx`, `vegetableModel.ts` and
`richVegetable.css`; local Lilita One/Nunito Sans fonts are packaged. All 44 crops
pass both-unit DOM sizing. Nine contrasting vegetables have physical A4 proofs;
carrot and onions also have imperial proofs, all two pages. New heroes are
installed and all 44 are approved by John (29 September).

**Physical geometry departure, accepted for now by John (29 September):** the new renderer uses
native A4 with 32 px (8.5 mm) horizontal text insets and page-wide Family Tint.
The old 18/20/14 mm margins did not fit the approved composition at readable type
sizes. No whole-page scaling or body-type reduction was used. Dense crops reduce
decorative header space/gaps and may place planting beside soil/care/harvest.
The header refinement below the artwork replaces the generic strapline. Source
advice is retained. See [implementation checks](redesign-rollout/PLAN.md).

Initial visual migration preserved canonical data and locks. The subsequent
approved content pass updates print companions only. Saved selections are reused;
old saved geometry is not represented as approved for the new renderer. The original
runtime revision was `richer-a-v1-family-tint-practical`; the approved content
refinement below now uses `richer-a-v2-editorial-fill`. John reports that his test prints generate reasonably well, with detail issues
to follow. A5/A6 remain unreviewed. Approval of frozen references is distinct from acceptance
of the rollout's artwork and physical geometry.

### Approved source-based content refinement (30 September)

John approved the [44-guide content review](content-refinement/REVIEW.html):
“Batch output looks good - approved.” The reviewed source-linked print companions
are installed, preserving master advice and the approved visual design. Saved
revision `richer-a-v2-editorial-fill` enables bounded spacing, column arrangement
comparison and grids using their actual reminder/tip count. Normal exports now use
these approved companions. Exact prior-byte backups and installed values are
verified; both-unit live tomato PDFs remain two pages. Read the review README for
measured exceptions and installation checks. No full batch was regenerated.

## Existing renderer and editorial rules

The sections below retain the September 21–24 production/editorial contracts.
Their content and data rules remain binding. Their old typography, staggered
widget geometry, dark bars and hero-crop rules apply only to maintenance of the
retained legacy renderer; they must not override the active Richer A renderer.

## Priority order

1. **Safe, legible page fit.** Target two A4 pages per vegetable. No clipped text,
   overlapping widgets, missing pictures or accidental third pages. Preserve
   essential advice; report conflicts rather than silently deleting it.
2. **Align the column bottoms.** On page one, the base of Core Needs should
   align with Recommended Varieties. On page two, align the last widgets in
   the two columns. The approved pilot measures zero difference in both units;
   a one-pixel measuring tolerance is reasonable, not a licence for visible gaps.
3. **Use spare space well.** Prefer useful original content, fuller introductory
   prose and additional relevant varieties over empty holes. After content
   selection, distribute remaining height through suitable rows/tips. Do not
   add filler, invent facts, or shift a large blank area elsewhere just to align.

22 September correction: review the unused height below the last content widget
on **each page**, in both units. Zero column difference and two physical pages do
not detect an underfilled sheet. Start from full useful introductory prose, then
make measured crop-specific cuts only where needed. Do not seed every new crop
with two/three sentences or two Final Tips and treat that as finished curation.

23 September clarification: keep measurement values attached to their meaning.
State between rows, between plants, or each way, retaining distinctions between
nursery rows, final plants, clumps, containers and crop types. Ready In should
identify sowing/planting/casing as its starting point and distinguish first
harvest from the harvest season. Keep seasonal context where useful; qualify
calendar-derived durations as approximate rather than inventing precision.

John prefers fuller useful text to added padding when normalisation shortens a
page. Reuse reviewed source descriptions and care advice, measure both units,
and adjust each crop individually. Preserve fonts, padding, artwork and useful
source detail. Flag more than 10 mm of unused designed-page bottom space for
editorial review; this is a review trigger, not permission to add filler or to
remove useful content. Record any justified exception explicitly.

These priorities work together: alignment must not create overflow or shrink
type. Passing a page-count check alone is not a design review.

## Legacy renderer: preserve its visual system until migration

- A4 portrait, existing two-page design and category identity. Normal PDF export
  uses 18 mm top, 20 mm bottom and 14 mm side margins, scale 1, backgrounds on;
  the browser measurement viewport is 688 x 979. Do not substitute zero margins.
- Keep the existing local font stack, sizes, weights, line heights, letter
  spacing, borders, rounded corners and padding. Use the component's current
  CSS, not guessed global values: different widgets intentionally differ.
  Do not reduce fonts/padding to force a fit. John specifically retains control
  of padding changes. Flexible row height is not a padding redesign.
- Retain dark title/widget bars, white heading text, the category-colour rule
  under the main banner, pale category page tint, tinted variety tables and
  coloured Key Risks. Resolve colours from the existing vegetable palette;
  do not invent a new palette or remove borders.
- Retain the approved hero art/lossless crop, speech-bubble header treatment,
  19 Quick Facts icon system, calendar, and 1-5 Core Needs bars. Do not regenerate
  or restyle artwork as part of a text/layout pass. Keep image proportions,
  adequate size and transparent edges; never stretch artwork to fill space.

Implementation owners: `src/print/PrintVegetablePage.tsx`, `print.module.css`,
`useVegetableLayout.ts`, `vegetableLayout.ts`, `PlantingCard.tsx`,
`planting.module.css`, `plantingIllustrations.ts`, `heroImageCrops.json`,
`src/lib/quickFactIcons.ts` and the imported vegetable palette.

## Legacy renderer: page one

- Preserve the staggered composition: introduction interlocks with hero above
  Quick Facts/Core Needs at left; calendar and varieties sit below the hero
  at right. Do not replace this with a rigid equal-height top row or a new design.
- Keep the short coloured hero lead and original introduction wording. Use
  whole sentences; prefer the full introduction when it improves fit/alignment.
  Radish's shortened introduction was rejected because it pulled the left
  widgets too high. Do not cut prose simply because a shorter version exists.
- Keep Quick Facts above Core Needs, calendar above Recommended Varieties,
  and the Key Risks strip beneath the main columns. Preserve meaningful
  variety group labels, ranking and unit-specific measurements.
- Only show conditions applicable to the current vegetable. Respect shared
  `applies_to` even when an old inline mirror has copied another crop's condition.
- Select enough varieties to use the available right-column space. A fitter
  can stop too early when the other column determines page height: measure
  both column bottoms, not only the page sentinel. Save a suitable variety
  count rather than accept an unnecessarily short table.
- Once useful content is selected, Quick Facts rows and the final varieties
  table may share spare height to align Core Needs/Varieties. Preserve minimum
  padding and natural text flow; avoid a large gap above Quick Facts or below
  Core Needs. Do not stretch every widget indiscriminately.
- The accepted crop-specific introduction/variety counts are layout decisions,
  not universal counts for every vegetable.
- Renderer v3 treats saved introduction/variety counts as explicit content
  choices (bounded by available source), not starting guesses. Do not run the
  automatic trim/top-up cycle over those choices. Measure natural content before
  enabling page-one alignment stretching; preserve overflow warnings if a saved
  choice no longer fits. Re-curate and save a measured count, never silently
  stretch two rows into space that could hold five.
- Rank Key Risks from the complete applicable, deduplicated pool, independently
  of the page-two pest-table limit. Inline entries win equal-rank ties. Do not
  remove high-priority bolting merely because it is in shared fallback data.
  Treat `Slugs` and `Slugs and Snails` as the same risk.

## Legacy renderer: page two and Final Tips

- John clarified on 21 September: four pests is not a standard content limit.
  Measure fuller useful pest tables per crop before stretching the remaining
  rows. Audit earlier four-entry plans when requested; preserve legible fit.
  The same applies to five or any other repeated count. Start with distinct,
  useful, crop-applicable problems; reconcile duplicate labels before selecting.
  A first overflow warning is a prompt to review wording and unused space,
  not an automatic final cutoff. Condense signs/controls without losing full
  master detail, then test again after the final copy changes. Confirm actual
  PDFs in both units and inspect the table visually. Record meaningful omitted
  candidates and the reason; neither equal nor different counts is a target.

- Keep Soil & Preparation and the illustrated Sowing & Planting card in the
  established left column; care, harvesting and pests normally occupy the
  right. Preserve numbered care/soil steps, harvest bullets and the pest table.
- Use the approved **existing-column** planting design, not the rejected
  full-width experiment. Keep crop-specific two/three-stage arrangements,
  planting-route distinctions, live-bound measurements and useful supplementary
  notes. Existing image-size bounds and safe fitter remain in effect.
- **Final Tips is a full-width bottom banner by default.** Relocation is a
  deliberate saved exception where it fills a column hole. This approval is
  not an instruction to move Final Tips on all vegetables.
- John clarified on 22 September: choose **2–4 useful Final Tips per vegetable**
  according to the space left at the page bottom after rendering and fitting the
  important content. Four is not a default or target. Select tips that add useful
  advice, measure the whole page, and save the crop-specific count and arrangement.
  Do not trim main content to make room for four tips or pad the selection to
  reach a count. Existing accepted proofs need no change merely for variation.
- In a column, stack tips in separate horizontal rows with their icons and
  dividers. Retain useful tips: restoring radish's third tip was explicitly
  requested. Do not remove a tip merely to make a relocated panel short.
- Do not apply the stacked/fill CSS flag to a full-width banner: its tips stay
  side-by-side. The column exception must not change the default banner.
- John’s 22 September refinement permits a saved `tips_columns: 2` full-width
  banner: four useful tips form two rows of two. This opt-in keeps ordinary
  banners and existing approved records unchanged; it is not a universal count.
- Save a meaningful icon for every curated Final Tip, chosen from the existing
  icon set. Never let a general-purpose item helper silently assign `soil` to
  all tips. Repetition is fine when meaning warrants it (e.g. two protection
  tips); arbitrary variety of icons is not a goal.
- The tips panel may grow vertically to meet the neighbouring column's base;
  distribute space across rows instead of adding an empty block beneath them.
  A final table can similarly distribute modest spare height across its rows.
- Keep the guide readable and balanced, rather than treating every square
  millimetre as something to fill. No arbitrary page-height stretching of
  unrelated cards. In particular, do not carry these rules into Troubles'
  trailing cards, which must retain content height.

## Editorial voice and facts

John's editorial clarification (22 September): state the practical organic
control directly and move on. Do not mention chemical alternatives merely to
dismiss them or add ideological commentary. Preserve useful diagnostic or
safety information; this is a rule about unnecessary reader-facing comparisons.

- Stay as close as possible to the original text's style and meaning. Practical
  UK gardening language; no patronising slogans, invented experience or new
  claims. AI curation means selective condensation/expansion from source, not
  wholesale re-authoring of approved prose.
- Preserve crop/type distinctions, alternative growing routes, timing,
  spacing/depth, quantities, establishment restrictions, conditional advice,
  uncertainty and warnings. Merge repetition before cutting useful detail.
  Do not pad text to obtain alignment. Retain full granular master advice.
- Use organic control methods only (John's standing preference, 21 September).
  John permits researched organic replacements in
  source data; use RHS/Charles Dowding or another appropriate primary source.
  Resolve conflicting measurements against RHS, record sources and prior-byte
  backups. Ask John about doubtful substantive changes. No unverified remedies.
- Resolve measurements from live master paths when supported. Unit-aware
  extracts must retain both metric and imperial values. Do not assume changing
  units converts all prose automatically; check both versions.
- Use `src/lib/sentences.ts` for sentence shortening/counting. Never cut at the
  dot inside U.S., No. 1, 1/8 in. or decimals. Preserve complete sentences;
  do not change correct source punctuation merely to accommodate a bad splitter.
- Record material omissions/merges and factual corrections in editorial review
  notes. Unchanged approved extracts should not be regenerated on each export.

## Approved reference choices (not a universal template)

| Crop | Intro sentences | Variety count | Page-two Final Tips |
| --- | --- | --- | --- |
| Asparagus | 4, full source | Existing fitter, 6 in reviewed output | Right column, 2 stacked tips |
| Radish | 4, full source | Saved 9 | Right column, 3 original care tips stacked |
| Celery | 3, selected opening | Saved 5 | Left column, 2 stacked tips |

All three use saved `align_bottoms: true`, four selected pest entries and a
two-page target. These limits select print content; they do not delete records.
The reviewed pack is `output/pdf/vegetable-ai-pilot-review.pdf` (disposable output).
Authoritative reproduction data lives in the three shared crop records.

## Store the decisions; do not require AI during export

- Write curated copy only in `ai_print_extracts.sections` unless a source change
  is specifically authorised. Keep field dependencies, output checksums,
  `updated_at`, `updated_by`, status and locks. Source leaf audit remains in
  `_field_metadata`. Never overwrite manual edits or unlock protected entries.
- Save per-crop choices in `ai_print_layout`: `tips_position`, `intro_sentences`,
  `variety_count` where needed, `align_bottoms`, `pest_limit`, `target_pages`,
  dependency/output checksums and renderer revision. Save both-unit measured
  page counts, warnings, asset readiness and column-bottom gaps.
- After useful content is selected, saved `fill_bottoms: true` may distribute a
  modest measured remainder through the existing flexible rows. It runs after
  asset readiness and natural fitting, resets before remeasurement, does not
  shrink overflow, and refuses gaps above 96 px (25.4 mm), which need editorial
  attention. It preserves fonts, padding and image dimensions. Record actual
  bottom gaps and visually inspect row balance; this opt-in is not approval.
- Normal export uses approved/current extracts and plans, with source fallback
  and warnings when stale. It calls no AI. Use `aiReview=1` only for draft proofing.
  Changed source content triggers review of affected extracts; timestamp-only
  changes are not a reason to rewrite. Layout depends on broader content.
- New work is draft until John approves or explicitly authorises advance approval
  for a bounded set. On 22 September he approved the reviewed batch and all
  remaining vegetables in this rollout in advance; this does not grant standing
  approval for future factual or design changes. Approval is a guarded status/audit-only
  save through shared `lib/records.mjs`, with expectedRevision and exact-byte
  backups. Check current source/output signatures before approving.
- Bump `VEGETABLE_PRINT_REVISION` for renderer/CSS/font behaviour changes. Saved
  renderer SHA256 hashes are evidence, not automatic runtime asset invalidation;
  replaced assets at the same path require deliberate remeasurement.
- Do not run the historical `prepare.mjs` or `revise-alignment.mjs` over approved
  work. They record bounded pilot edits, not an automatic regeneration service.

## Proportionate checks and handoff

Check actual PDFs at standard margins after fonts/images load. Confirm two
pages, column bases, readable text, original meaningful content, no clipping,
missing pictures or abbreviation fragments. Check metric and imperial fit.
Use a small visual pass for routine POC work; no full-catalogue regeneration or
unrelated regression programme. Code/schema changes warrant focused tests,
the print test suite and build; approval/documentation-only changes do not
require re-authoring or re-rendering unchanged artwork.

Save progress, exact approval state, backup/revision identifiers, checks actually
run, remaining limitations and the next action. Link this guide from agent entry
points. No deployment or website/video prose rewrite is implied by print approval.

## Coordinated vegetable editorial review (21 September)

For coordinated editorial changes, review soil, care, harvest, planting notes and Final Tips together, save complete source-linked selections, then measure the whole page. Valid sowing-note extracts own all notes; automatic prefix top-up is disabled for them. Preserve crop/variant distinctions, use organic advice, choose exact tip icons, and document coverage/omissions. Missing extracts are visibly flagged as automatic fallbacks. The accepted title-length bubble rule remains.


## Completion decisions - 22 September 2026

John accepted the layout, approved the latest eight-crop set, and authorised
completion and advance approval of all remaining vegetables. His instruction:
"Please generate all the remaining vegetables and consider them approved in
advance. Save and document in hard copy these layout rules and decisions!"

- Keep **individual two-page crop PDFs**, separately in metric and imperial.
  Eight crops may form a review set; do not merge them into a huge preview file.
  Large combined packs were associated with the recovered task's app crash;
  this is a practical precaution, not a proven crash diagnosis.
- **Final Tips varies from 2 to 4** after the important content fits. No forced
  variation between crops, fixed four-tip target, or main-content cuts to fit tips.
- Overlapping speech-bubble text is explicitly deferred by John to a later task.
  Accepted existing overlaps do not reopen this rollout or authorise redesign.
- Mushroom was recorded as a sparse-page exception on 22 September. The 23 September revision restores useful kit/casing/harvest text and now fills both pages; the calendar-only column still has intrinsic space. The historical exception was: Keep its kit-growing route,
  no invented variety rows or seed-sowing instructions, and no excessive stretch
  to consume its roughly 53 mm bottom gap. Its absent sowing source produces an
  existing fallback-selection diagnostic; do not manufacture source to hide it.
- Kale's print selections must reflect its previously accepted corrected master:
  conditional organic feeding, soil-test-led liming, separate leaf/shoot harvest
  routes, and suitable protection for early and late sowings. Review the existing
  planting captions against that source and refresh their review fingerprint;
  keep the captions and master advice unchanged where already consistent.
- Approval covers the saved print selections and layout. It does not certify
  every legacy master-data claim, resume the paused normalisation programme,
  alter website/video prose, or authorise public deployment. Current unresolved questions remain in the shared editorial open-questions file.

## Routine POC verification

John’s 24 September instruction replaces earlier mandatory broad proof checks: use one affected-crop sizing/smoke check, adding the other unit when units or wrapping change. A shared layout change may warrant another representative crop. No automatic five-crop batches, full suites or repeated raster packs after small edits. Keep the design and editorial rules above; broaden checks only when evidence warrants it. The Markdown contract is authoritative; old printed copies were removed during cleanup.
