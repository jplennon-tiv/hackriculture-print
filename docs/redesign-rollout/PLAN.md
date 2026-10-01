# Approved-design rollout

Authorised by John, 28 September 2026: build and carry out the sequence discussed.
Preserve canonical data, manual edits, locks and both frozen design manifests.
No subagents, dependency upgrades, large combined PDFs or public deployment.

## Working model

Use AI-supervised preparation and review with deterministic exports. Templates
resolve approved data, artwork and saved choices reproducibly. AI prepares
artwork, inspects proofs and resolves exceptional layouts; no AI service is
called during an ordinary export. Fresh generation on every export would increase
latency/cost, introduce variation and make unchanged advice harder to guarantee.
Template constraints remain explicit and testable. Store meaningful crop-specific
exceptions, not opaque instructions that require AI to reinterpret every time.

## Sequence and completion checks

1. Implement shared Richer A vegetables and Open Editorial Troubles, Family Tint,
   practical headings and local fonts. Preserve current reviewed content choices;
   measure actual content rather than silently truncating to fit. Make all 14
   Troubles palette assignments explicit, including mixed families.
2. Validate physical A4 output before scaling artwork work. Start with carrot in
   both units and complete representative Troubles guides. Check readable type,
   margins, image loading, embedded fonts, complete content, pagination and visual
   results. Then test a long name, dense crop and mushroom's growing-kit route.
3. Generate a small contrasting hero batch against the approved carrot style.
   Inspect consistency, transparency, identification and title-safe composition.
   Preserve all approved diagnostic, fact, risk and planting art.
4. Continue remaining vegetable heroes in bounded batches, keeping descriptive
   files and a resume manifest. Review each generation before installation.
5. Validate the resulting guides using bounded sizing checks and individual
   proofs. Resolve exceptions without reducing readable type or losing advice.
   Collect a concise review gallery, preserve new artwork as unreviewed by John
   until his review, and document precise limitations and next steps.

## Current state — 30 September 2026

The five rollout steps are implemented and checked. John approved all 44 heroes and accepted the 8.5 mm side insets for now on
29 September, after test printing. Cover and entry pages are now approved/selected
and installed; the 30 September vegetable content refinement is approved too.
[Approval record and hero hashes](APPROVAL.json). [Review gallery](REVIEW.html) links all 44 heroes, individual
representative PDFs and the current entry pages.

- Both live print routes use the approved forward designs, Family Tint and local
  Lilita One/Nunito Sans fonts. Export remains deterministic, with no AI API.
- 44 vegetables pass both-unit DOM sizing (88 combinations). Nine contrasting
  crops have A4 PDFs; carrot and onions also have imperial proofs. All eleven
  vegetable PDFs have two pages. Representative metric pages were visually
  inspected; no catalogue PDF pack was generated.
- All 14 Troubles guides preserve all 220 condition identities exactly once in
  measured pagination (1–6 pages). Complete Carrot/Parsnip and Onion/Leek PDFs
  each have three A4 pages; opening, continuation and final pages were inspected.
- All 44 hero assets have transparency: approved carrot plus 43 new images.
  New images have AI provenance and recorded John approval.
  Existing diagnostic, Key Risk, fact and planting illustrations are unchanged.
- The fixed sow/harvest calendar colours now retain their meaning across family
  themes. The legend distinguishes usual from less usual months. Source-current
  Troubles introductions are guarded; stale ones use source wording and warn.
- Final focused checks: 16 tests passed in 578 ms; app TypeScript check passed;
  carrot both-unit smoke, fonts/images/login and two actual pages per unit,
  passed in 3.42 seconds. Font embedding was inspected in the PDFs. Reference
  manifests and 109 local review links pass: [final check record](CHECKS.json).
- Cover C, contents and illustrated how-to are installed as three unnumbered A4
  pages. Vegetables are numbered 1–88; Troubles 89–132. See the central approval
  manifest and `docs/front-matter/entry-pages/INSTALLATION-CHECKS.json`.
- Initial rollout preserved canonical records. The later approved content pass
  updated 44 print companions with guarded exact-byte backups; master advice,
  locks and non-print fields are preserved. See `docs/content-refinement/`.
- Final usage reading: **83% remaining**. The user's 35% stopping threshold was
  never reached. No continuing job or scheduled automation is required.

Evidence: `output/redesign/sizing-both.json`, `troubles-sizing.json`,
`physical-proofs.json`, `artwork-check.json`; entry checks are under
`docs/front-matter/entry-pages/CHECKS.json`. Preserve approved reference evidence; generated output is not a replacement archive.

Known limits: A5/A6 output remains unreviewed. John has test-printed A4 and
completed a 61-document imperial batch without export errors. Its sole Mushroom
warning was subsequently fixed as a reporting bug; content is unchanged. The old
batch report remains historical evidence until another export. Accepted whitespace
exceptions are recorded in the content-refinement report. See the current handover
for the latest checks rather than treating initial rollout results as new checks.

### Geometry decision and exceptions

The old 18/20/14 mm export margins caused overflow with the approved type sizes.
This implementation deliberately uses A4 paper at native size with 32 px
(8.5 mm) horizontal text insets, matching the approved composition, and a
page-wide Family Tint background. This is a departure from the previous margin
contract; John has now explicitly accepted these side insets for now. No whole-page scaling or body-type reduction.
Dense guides reduce decorative header space and gaps. Very dense fronts omit
only the generic “Planning, planting and care.” strapline. A measured two-column option
places the planting section beside soil/care/harvest when this improves fit.
All selected source advice, facts, varieties and trouble rows remain present.
A5/A6 quality is still unreviewed.

Troubles colours explicitly follow navigation families. Turnip/swede/radish
uses Root Crops (the practical guide grouping), not automatic botanical
classification; Oriental Leaves uses Salads & Leaves. Old approved Trouble plans
supply reading order only; their fixed card heights are not reused. New renderer
revisions are exposed on the output, without claiming shared saved geometry has
been approved for them.
The frozen references remain approved and untouched. Live migration is technically
validated as described above; all heroes are approved and side insets accepted
for now. Current entry pages and content refinement are approved and installed.

Update this document and the current handover in place; do not create session logs.
