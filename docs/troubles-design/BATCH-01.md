# Troubles batch 01 — 19 September 2026

Artwork update: the earlier mapping blocker below is now resolved for this batch. 48 image references corrected/added, three new assets installed and all three PDFs regenerated/visually checked at the same 2/6/8 pages. See [ART-AUDIT-01.md](ART-AUDIT-01.md) for mapping, prompts, backup and checks. Draft approval is still pending; no new prose/plan silently approved.

Authorised: beetroot, bean/pea and brassica review proofs. Completed: 58 conditions, 174 draft AI fields, three stored layouts and three A4 review PDFs. Beetroot 2 pages (8 cards), bean/pea 6 pages (21 cards), brassicas 8 pages (29 cards). Existing renderer, padding and typography unchanged. Prefer even page counts for duplex printing. Dedicated hero artwork remains deferred; existing crop art is a placeholder.

John subsequently explicitly authorised source edits replacing chemical treatments with organic methods and recommended Charles Dowding. Source treatment/prevention fields in these three groups now use physical, cultural and qualified biological methods; two descriptions containing treatment prescriptions were also corrected. All condition entries and unrelated metadata remain intact. Earlier source bytes are backed up. Draft AI summaries/layouts are NOT approved for normal export. Resume from this document and the live per-record data, not by rerunning preparation over existing AI fields. Remaining groups have NOT received this organic-source pass.

Editorial checks: old pesticide prescriptions are removed from live source advice in this batch, not merely hidden in print copy. RHS guidance checked for aphids, downy mildew, damping off, grey mould, powdery mildew, chocolate spot, beet leaf miner, pea moth, pea/bean weevil, cabbage whitefly, flea beetle, club root and nutrient deficiencies. Charles Dowding's Slug Reduction informs dusk checks and removing damp refuge immediately around vulnerable crops; retained wildlife habitat elsewhere. No endorsement of every statement on a referenced page is implied. Borax recipes and blanket trace-element sprays are replaced by soil/diagnosis checks and seeking a suitable organic-compatible correction. Mineral pH correction is not equated with pesticide spraying; compost is not claimed to cure a confirmed nutrient deficiency. Original prescriptions remain recoverable in backups, not in active advice.

Sources consulted 19 September 2026:
- https://www.rhs.org.uk/biodiversity/aphids
- https://www.rhs.org.uk/disease/downy-mildews
- https://www.rhs.org.uk/disease/damping-off
- https://www.rhs.org.uk/disease/grey-mould
- https://www.rhs.org.uk/disease/powdery-mildews
- https://www.rhs.org.uk/disease/broad-bean-chocolate-spot
- https://www.rhs.org.uk/biodiversity/beet-leaf-miner
- https://www.rhs.org.uk/biodiversity/pea-moth
- https://www.rhs.org.uk/biodiversity/pea-and-bean-weevils
- https://www.rhs.org.uk/biodiversity/cabbage-whitefly
- https://www.rhs.org.uk/biodiversity/flea-beetles-on-brassicas-and-allied-plants
- https://www.rhs.org.uk/disease/club-root
- https://www.rhs.org.uk/prevention-protection/nutrient-deficiencies
- https://www.rhs.org.uk/biodiversity/thrips
- https://www.rhs.org.uk/biodiversity/slugs-and-snails
- https://charlesdowding.co.uk/blogs/no-dig-resources/slug-reduction

Not a full horticultural fact audit. Gall weevil and swede midge retain cautious source-based identification, without unverified pesticide remedies. Several bean-group condition applies_to lists say pea despite broader source descriptions (mice, birds, grey mould, anthracnose); original metadata is preserved and should receive a separate source-data review. Do not claim these labels have been corrected.

## Outputs and review findings

All under `output/pdf/ai-once-pilot/`:
- `beetroot_troubles-review-A4.pdf`
- `bean_and_pea_troubles-review-A4.pdf`
- `brassica_troubles-review-A4.pdf`

All 16 final pages rendered and visually inspected. All cards retained, zero overflowing columns, no plan fallback, no missing-image warnings. Actual PDF counts confirmed 2/6/8. Beetroot pairs image-bearing cards with existing text-only entries on page one to fit without cuts. Brassica page one contains three entries, with more space for club root. Three-card pages have spare space rather than filler prose or oversized artwork. No first-page-only eyebrow/subtitle regression.

**Publication blocker discovered:** existing bean/pea and brassica artwork is extensively mismatched to filenames/conditions. Examples: bean downy mildew shows a mouse; brassica cabbage root fly shows pigeon damage; pigeons shows a split cabbage. The files already contained these assignments; no art was generated, replaced or reassigned this round. Both proofs now state `ILLUSTRATION MAPPING NEEDS CORRECTION` in every footer and report. Existing checkerboard backgrounds also remain. These PDFs are usable for text/layout review, NOT diagnostic-image approval or publication. Next recommended bounded task: audit/remap existing illustrations (many correct subjects appear elsewhere in the set) before commissioning missing replacements. Dedicated hero-art generation remains separately deferred.

## Restore and commands

Pre-source-change exact JSON backup: `../hackriculture-data/backups/admin/2026-09-19T21-22-31.774Z-59d13d04-bba1-4738-b64c-b6439cfaa3a6/`. Its transaction.json maps 0.json to bean/pea, 1.json to beetroot and 2.json to brassicas. A second transaction at `2026-09-19T21-22-31.948Z-7f9abbfc-c7b6-4de1-8fc7-e32bf91e92f8` holds source-corrected records before AI additions. Later layout adjustments have their own automatic transactions. Use the shared restoration procedure; never restore aggregate masters.

One-shot authoring is `scripts/prepare-troubles-batch-01.mjs` plus `docs/troubles-design/batch-01-copy.mjs`; it refuses existing AI fields and should NOT be rerun. That module is the initial editorial packet, not a second master. Final measured plans live only in the authoritative records, with refinements recorded by `scripts/refine-troubles-batch-01.mjs`.

Re-export without AI using Node 24:
```
node scripts/export-troubles-review.mjs beetroot_troubles
node scripts/export-troubles-review.mjs bean_and_pea_troubles --artwork-review
node scripts/export-troubles-review.mjs brassica_troubles --artwork-review
```

Approval remains pending. Do not run approve-troubles-ai merely because generation was authorised. Preserve the organic source corrections when adjusting draft wording. AI dependencies were captured AFTER those corrections and all 174 fields are source-current. Source-edit provenance explicitly says user-authorised AI edit; default AI-only guard was not weakened. Granular source advice was not replaced with the shorter print paragraphs.

Checks: shared data verification passed (44/14/8), 225 print tests passed, TypeScript/Vite build passed with existing chunk warning. Named historical pesticide scan of current advice passed for these three groups. PNG visual checks and PDF page counts passed as above, subject to the explicit existing artwork/content-label limitations. Poppler emitted Type 3 glyph bounding-box warnings; no visible glyph clipping was found. No website prose/video/media changed, no new remote image generation, no publishing.
