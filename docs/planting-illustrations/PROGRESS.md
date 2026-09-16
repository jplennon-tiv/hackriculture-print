# Planting illustrations: resume here

Updated 16 September 2026. **Image creation complete; ready for user review. No widget implementation or production installation.**

**Current stage: five-crop PDF layout proofs completed for review.** See [PDF proof restore point](PDF-PROOFS.md) and [content comparison/checks](PDF-CONTENT-REVIEW.md). Three A4 metric review packs compare existing, illustrated-column and full-width planting layouts. All five crops checked in both units, 30 actual two-page PDFs. These are isolated review transformations; normal application exports and master data remain unchanged. Await layout selection before production implementation.

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

## Next stage — not yet implemented

Review/approve the catalogue, then implement bounded source-bound pilot widgets. Keep exact measurements, captions, arrows and row/block plans in code using the live master. Compare before/after retained information and test actual PDFs in both units before broader rollout. Do not silently cut useful soil, care, harvest or pest advice to make room. Keep type-specific and conditional routes separate.

Minor layout cautions are in REVIEW.md: support tips and a fennel frond approach canvas edges; preserve full canvas/padding. Some transplant pictures depict lowering in progress, not final depth. Small seeds are schematic, not identification plates. Mushroom is supplied compost cultivation, not vegetable seed sowing.

No application code, public images, approved website prose, commits or deployments were changed by this image-generation phase. Preserve unrelated user changes.

## Source baseline and prior validation

Live master: ../hackriculture-data/vegetables.json.
SHA-256: 0e8f591e50e8d6794ef8902ac52b391d378006b2ae5703f9cec31fe15dba1df4.

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
