# Vegetable sheets: approved style and layout rules

Approved by John on 21 September 2026 and reaffirmed at rollout completion on
22 September 2026, including the refinements recorded below. Read this before creating or revising vegetable print extracts/layouts.
It supersedes conflicting earlier pilot experiments, not explicit later user
instructions. The approved canonical records and current renderer are the
reference; do not re-create the design from memory. For production mechanics,
also read [ASSISTED-PRINT.md](ASSISTED-PRINT.md) and the shared data contract.

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

These priorities work together: alignment must not create overflow or shrink
type. Passing a page-count check alone is not a design review.

## Preserve the visual system

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

## Page one

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

## Page two and Final Tips

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

Follow [WIDGET-COORDINATION.md](vegetable-ai-pilot/WIDGET-COORDINATION.md): review soil, care, harvest, planting notes and Final Tips together, save complete source-linked selections, then measure the whole page. Valid sowing-note extracts own all notes; automatic prefix top-up is disabled for them. Preserve crop/variant distinctions, use organic advice, choose exact tip icons, and document coverage/omissions. Missing extracts are visibly flagged as automatic fallbacks. The accepted title-length bubble rule remains.


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
- Mushroom is a recorded sparse-page exception. Keep its kit-growing route,
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
  alter website/video prose, or authorise public deployment. Existing catalogue
  findings remain recorded in the shared data-normalisation log.
- A printable copy of this complete contract is saved as
  `output/pdf/vegetable-layout-rules-approved-2026-09-22.pdf`.
  The Markdown file is the maintainable source; regenerate the hard copy after
  any later approved rule change. AI records these decisions; John approves them.
