# Planting illustrations: resume here

Updated 18 September 2026. **44 of 44 crops now have stored companions, installed artwork and illustrated PDFs.** John approved the final PDF batch; all 44 planting layouts are now active in normal and batch exports. The guarded fitter remains enabled, and the explicit review query is retained for inspection. Original granular source text and leaf-beet padding remain unchanged. See [final batch / resume point](ROLLOUT-06.md).

Latest pack: `output/pdf/planting-rollout06/planting-rollout06-A4-metric.pdf` (12 crops, 32 pages). Previous pack: `output/pdf/planting-rollout05/planting-rollout05-A4-metric.pdf` (7 crops, 17 pages). All outputs retained, including pagination warnings. Original granular master text and leaf-beet padding remain unchanged.

## Current rollout policy - supersedes earlier exhaustive QA gates

John approved rollout04 previews and explicitly requested a faster process:
basic readiness/source checks and a small PDF spot-check; produce all crop review
results and record layout issues for later pre-publication work. Do not repeat
full test suites, cross-project builds or exhaustive both-unit visual comparisons
for routine crop additions. Keep source text granular, preserve user edits and
padding, and make restore points. No public website deployment is authorised.

Historical overflow remains documented as a pagination limitation, but it is no
longer a reason to withhold an approved illustration. The normal guarded fitter
still decides whether a specific export can fit; no production safeguard was
silently disabled.

## Previous rollout state and source protection

**Leaf beet decision:** John is editing the text manually and explicitly requested **no padding changes**. Preserve his edits. [Overflow findings](LEAF-BEET-OVERFLOW.md) remain historical; the earlier padding proposal is not approved. Check the current export under the lighter review policy above, without treating the saved three-page PDF as proof of a current failure.

**Current resume point: [Rollout 04](ROLLOUT-04.md).** Adds broad beans, French beans and sweetcorn; runner beans and peas are staged after their original PDFs proved to have three pages. Six new A4 exports and the four-crop both-unit regression pass; 191 tests/build pass. All previous master values preserved; five companions and four measurement pairs added. Latest checkpoint: `../hackriculture-data/backups/documentation/2026-09-17-planting-rollout04-complete.64sGo7/` relative to project root. Review pack: `output/pdf/planting-rollout04/planting-rollout04-A4-metric.pdf`. Next suggested group: courgettes, squash/pumpkins and the two cucumber guides. [Rollout 03](ROLLOUT-03.md), [Rollout 02](ROLLOUT-02.md), [Rollout 01](ROLLOUT-01.md) and the pilot-stage record below are historical; do not revert their source corrections.

**Resume with [production implementation and checks](IMPLEMENTATION.md).** John selected the illustrated existing-column layout. Beetroot, carrot, potato, leek and chicory now use it in normal single/batch export, without AI. Detailed source text is preserved; additive print companions and code-owned layout/measurement bindings control output. Other 39 crops retain their existing renderer. The new ten-page A4 metric pack is `output/pdf/planting-production/planting-pilots-A4-metric.pdf` relative to project root.

Final production checkpoint: `../hackriculture-data/backups/documentation/2026-09-16-planting-production-complete.FB52WY/`. All 159 print tests/build pass; 30 pilot exports passed page-count/content checks. A4 visual QA passed. A5/A6 have an existing scaling/whitespace problem, documented in IMPLEMENTATION.md, and are not visually approved. Earlier [proofs](PDF-PROOFS.md) and [content comparison](PDF-CONTENT-REVIEW.md) are historical, not the current implementation state.

Latest proof/output snapshot: `../hackriculture-data/backups/documentation/2026-09-16-planting-pdf-complete.TRvLqO/` (relative to project root). No regeneration needed to review the finished PDFs.

## Completed deliverables

- All 44 crop records have their planned draft sequences: 90 unique selected images serving 94 placements through four explicit compatible reuses.
- All eight BATCH manifests are fully generated (7, 7, 12, 13, 14, 16, 12, 9 new scenes respectively).
- 37 ordinary crops use two scenes, six use three; mushroom has two conditional cultivation scenes. Mushroom remains optional if supplier-stage context or page space makes text-only preferable.
- [Gallery](gallery.html) groups the preferred images by crop and includes a 24 mm slot toggle. [Review notes/sheets](REVIEW.md), [44 crop briefs](CROP-BRIEFS.md), [layout specification](DESIGN.md).
- Exact prompts, original tool paths, alt text and live-source bindings are in BATCH and revision JSON files. Read preferredFile, not merely file. Images are under drafts/2026-09-15/ (the batch folder was retained for the final 16 September additions).
- First 14 images approved in principle by John; subsequent scenes/refinements are authorised drafts awaiting individual review. Generation does not imply user approval.
- Built-in imagegen only; no separately billed API fallback.

Preferred corrections include beetroot seed clusters, chicory achenes, garlic tip cover, broccoli nursery-only scene, endive thinning, kohlrabi sowing and fennel needle foliage. Fennel uses nursery v3 and planting v4. Sweetcorn block uses v4: FIVE short rows of FOUR plants, visually counted (20); it satisfies the brief of at least four short rows. The model retained three horizontal rows in v1–v3, so these are not selected. All originals retained.

## Checks actually completed

- check-plan.mjs: all 44 crop briefs and source bindings resolve; all 90 first-draft scene files present.
- verify-artwork.mjs --complete: 44 records, 94 placements, 90 selected unique files, zero pending jobs, no incomplete sequences; original/selected PNG alpha and 2:1 aspect checks pass.
- All selected images 1774 × 887, genuinely transparent; full-size visual review and 24 mm-high / maximum 48 mm-wide sheet reviews completed.
- Review sheets regenerated using preferred revisions; gallery includes compatible reused scenes. Browser QA: 94 images loaded, 44 crop sections, zero broken images or horizontal overflow; 24mm-slot toggle works.
- These are artwork checks, NOT production PDF page-fit/content-retention proof. No application tests rerun for the final documentation/art-only additions.

## Next optional stage

Review the five production exports, then extend the same source-bound pattern to remaining crops in small batches. Measurements resolve from the live master, captions live in additive print companions, and presentation metadata stays in code. Compare retained information and test actual PDFs in both units before broader rollout. Do not silently cut useful soil, care, harvest or pest advice to make room. Keep type-specific and conditional routes separate.

Minor layout cautions are in REVIEW.md: support tips and a fennel frond approach canvas edges; preserve full canvas/padding. Some transplant pictures depict lowering in progress, not final depth. Small seeds are schematic, not identification plates. Mushroom is supplied compost cultivation, not vegetable seed sowing.

No application code, public images, approved website prose, commits or deployments were changed by this image-generation phase. Preserve unrelated user changes.

## Image-generation source baseline and prior validation

Live master: ../hackriculture-data/vegetables.json.
Pre-implementation SHA-256: 0e8f591e50e8d6794ef8902ac52b391d378006b2ae5703f9cec31fe15dba1df4. Production added only five print companions; current hash and preservation checks are in IMPLEMENTATION.md. Do not restore the earlier master over those additions.

Earlier RHS corrections/qualifications total 97 leaves in 12 crop records, including the eight-field garlic audit at ../hackriculture-data/provenance/planting-measurements-garlic-2026-09-15.json. No source changes in the final image-generation resumes. Older batch fingerprints predate those recorded corrections; do not restore their old data. Approved website salsify/scorzonera prose has a separately flagged generic-spacing conflict; not rewritten (SOURCE-ISSUES.md).

Earlier source-change checks: shared verifier; print 134 tests and build; website build/TypeScript, 14 tests passing with one known pre-existing scrollbar CSS assertion failure; video 13+17 tests/TypeScript/source verification. Earlier A4 PDF checks covered eight crops in both units. These checks do not validate an unimplemented illustration widget.

## Restore points and safe resume

Pre-finish full snapshot:
../hackriculture-data/backups/documentation/2026-09-16-planting-finish-start.icI2KE/

Earlier full batch checkpoint:
../hackriculture-data/backups/documentation/2026-09-15-planting-batch07.rC5cKq/

Final completion snapshot:
../hackriculture-data/backups/documentation/2026-09-16-planting-images-complete.x44gfU/

Snapshots contain the entire planning/art folder and master bytes; never delete older backups.

On resuming, read this file and REVIEW.md, then current manifests and live source. Do not regenerate completed jobs or overwrite prior versions. Back up before edits. No generation calls remain necessary for catalogue coverage.
