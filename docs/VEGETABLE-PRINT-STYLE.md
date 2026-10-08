# Vegetable sheets: approved style and layout rules

**Format scope:** this contract governs retained A4 sheets. The approved
185 × 240 mm publication layout follows [Compact Book v1](BOOK-PRINT-STYLE.md).

Read this when revising retained A4 vegetable pages. Richer A supersedes the
retired widget layout. Current publication scope and next work belong in the
[handover](handover/START-HERE.md); compact geometry follows the book contract.
For production mechanics also read [ASSISTED-PRINT.md](ASSISTED-PRINT.md) and the
shared data contract.

## Approved A4 design: Richer A, version 1

**Approved and retained for A4 by John on
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
- Difficulty labels, revised by John on 1 October: 1 Easy, 2 Fairly Easy,
  3 Medium, 4 Tricky, 5 Difficult. The wording replaces the labels in frozen
  reference proofs; crop scores and badge styling are unchanged.
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

The approved A4 how-to uses captures of this header design. The
[asset registry](assets/README.md) identifies the exact entry-page sources
and their role in compact adaptation.

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
The approved header refinement replaces the generic strapline. Source
advice is retained. See [implementation checks](redesign-rollout/PLAN.md).

Initial visual migration preserved canonical data and locks. The subsequent
approved content pass updates print companions only. Saved selections are reused;
old saved geometry is not represented as approved for the new renderer. The original
runtime revision was `richer-a-v1-family-tint-practical`; current runtime ownership
and compatibility are documented in [DEVELOPMENT](../DEVELOPMENT.md#vegetable-printing).
Saved content uses `richer-a-v2-editorial-fill`. A5/A6 remain unreviewed.
Approval of frozen references is distinct from each later proof/export check.

### Approved source-based content refinement (30 September)

John approved the [44-guide content review](content-refinement/REVIEW.html):
“Batch output looks good - approved.” The reviewed source-linked print companions
are installed, preserving master advice and the approved visual design. Saved
revision `richer-a-v2-editorial-fill` enables bounded spacing, column arrangement
comparison and grids using their actual reminder/tip count. Normal exports now use
these approved companions. Exact prior-byte backups and installed values are
verified; both-unit live tomato PDFs remain two pages. Read the review README for
measured exceptions and installation checks. No full batch was regenerated.

## Fit and editorial rules

Fit first, align the A4 columns second, then use spare space for useful source
detail. Preserve readable type and approved artwork. Check unused space below
the final content on each page, not just the difference between columns. More
than 10 mm prompts review, not filler or automatic stretching. Preserve justified
sparse cases and accepted per-crop selections until their revision is in scope.

Keep page one's current header/facts/calendar/needs/varieties/risks composition
and page two's practical columns, reminders and full-width Final Tips. Do not
restore the retired staggered widget layout, dark heading bars, speech bubbles,
fixed card heights or 18/20/14 mm legacy margins. Existing legacy React files are
not the current design authority. Their old experiments/commands are in Git history.

Select distinct crop-applicable pest rows before measuring; no fixed count or
first-overflow cutoff. Merge duplicate names, retain organic control and useful
signs, and condense prose before omitting important conditions. Keep full master
advice and record reasons for useful omissions. Key Risks use the complete
applicable deduplicated pool, independently of the practical table's limit.

Final Tips remain full width by default. For authorised A4 recuration, choose
2–4 useful tips according to space after the important content fits; four is not
a target. Preserve deliberate saved exceptions and meaningful icons. No arbitrary
variation, cuts to main advice or enlargement of empty panels merely for alignment.
The active renderer's saved content/geometry compatibility is in DEVELOPMENT.

Practical UK wording should stay close to source meaning: preserve crop variants,
seed/set and other methods, dates, establishment restrictions, measurements,
biological limits, uncertainty and diagnostic/safety information. Distinguish
row/plant/clump/nursery/final spacing. Ready In identifies the starting event and
first harvest rather than implying the whole harvest season is one duration.
Use coherent metric/imperial pairs and check both editions. Follow the root
[editorial and organic-research rules](../AGENTS.md#gardening-content-and-shared-data).

Use `src/lib/sentences.ts` for sentence selections; never cut at abbreviation or
decimal punctuation. Valid sowing-note extracts own their notes without automatic
prefix top-up. Review soil, care, harvest, planting notes and tips together when
changing their selections; preserve manual locks and complete source meaning.
Mushroom retains its kit/casing/harvest route; absent seed-sowing advice is valid,
not missing material to invent. The source-less sowing warning was fixed in the
model; invalid/stale companions still warn. Keep Kale's conditional feeding,
soil-test-led liming, leaf/shoot harvesting and seasonal protection distinctions.

## Saved copy, approvals and checks

Reuse approved/current source-linked extracts, with visible stale-copy warnings.
Normal export calls no AI. Use `aiReview=1` for drafts; do not change approval
status to obtain a clean report. Shared writes, when in scope, use the guarded
writer, exact previous-byte backups and attribution. Book preparation instead
uses separate working drafts and does not amend canonical records.

Saved `ai_print_layout` fields select crop-specific counts and arrangement; they
are not universal targets. Keep source/output dependencies, renderer compatibility
and both-unit measurements truthful. Bump the relevant renderer revision for
behaviour changes and recheck replaced assets even when their paths are unchanged.
Earlier September advance approvals were bounded to completed work; they grant
no new approval and do not authorise rerunning the historical installers.

Use [ASSISTED-PRINT](ASSISTED-PRINT.md) and the repository layout skill. Inspect
actual affected A4 PDFs, compare with the approved design, and check readability,
content, crop applicability, images, units and footer clearance. Use both units
for wrapping/measurement changes and an additional crop only for relevant shared
geometry. The root POC policy governs testing; no mandatory full build, catalogue
or broad regression suite follows a small edit. Current coverage and remaining
work belong in the handover and linked receipts, not an appended session log.

## Variety catalogue policy (1 October)

John approved the UK popularity/usefulness review and Blue Lake in the French
bean shortlist. Retain all variety records, including lower-priority selections
for possible extended sheets. Rank and per-guide `variety_count` determine the
printed shortlist. Preserve full descriptions and unit pairs alongside concise
`short_text`; nested groups remain eligible and seasonal duplicate cultivar names
print once. Display legacy ALL CAPS names with initial capitals, preserving F1
and existing mixed-case spellings, without changing canonical keyed identities.
See [implementation and approved evidence](variety-review/README.md) and the
[shared catalogue policy](../SHARED-DATA.md).

## Seed and set routes (1 October)

Onions and Shallots use two named routes, two illustrations per method, local
captions and shared notes in the planting panel. Set planting says March–April.
The optional data-driven grouping preserves other guides' ordinary sequence.
See [implementation and approved A4 proofs](onion-planting/README.md).
