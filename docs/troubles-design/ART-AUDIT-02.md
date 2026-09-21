# Tomato and cucurbit assignment fixes — 19 September 2026

Completed with John's explicit authorisation. 24 tomato references reassigned, retaining virus unchanged and leaving three pre-existing missing images (aphids/slugs/cutworm) pending. All 25 available tomato pictures accounted for without duplicate assignments. Cucurbit powdery mildew now uses the former red-spider-mite file; sun scald uses the former powdery-mildew file. Red spider mite is now text-only: no suitable existing image found. Its incorrect former file remains intact and is used for mildew. Total: 27 changed image references, no generated or overwritten artwork.

Cucurbit stem rot and blotch were examined against their full source descriptions and retained: stem rot explicitly describes yellow-haloed leaf blotches as well as stem symptoms; blotch describes smaller pale leaf spots. Their appearance alone was not evidence for reassignment. Selected full-size images inspected for tomato stem/base lesions and cucurbit mildew/scald, plus all corrected tomato labels and affected cucurbit contact-sheet labels reviewed after installation.

Exact executable destination -> old filename mapping: `scripts/correct-troubles-art-batch-02.mjs`. Guarded one-shot script completed; do not rerun it. Writer backup: shared `backups/admin/2026-09-19T22-15-53.986Z-ea6d68f7-1b02-4e50-b857-81a1d74ee61e/`. Use transaction.json to restore exact prior-byte records. Only image/image_revision fields changed (asserted before save); writer adds audit metadata. Granular prose, measurement data, approval states and other groups unchanged. Neither group yet has an AI layout to invalidate. Corrected image paths are live for subsequent browser/PDF exports; existing exported PDFs were not regenerated in this bounded artwork-only task.

Visual/research basis: existing source descriptions plus RHS appearance checks, not pathogen diagnosis from paintings:

- https://www.rhs.org.uk/disease/powdery-mildews — white powdery patches.
- https://www.rhs.org.uk/biodiversity/glasshouse-red-spider-mite — fine pale mottling, distinct from mildew coating.
- https://www.rhs.org.uk/problems/tomatoes-fruit-ripening-problems — blossom-end lesion and ripening disorders.
- https://www.rhs.org.uk/disease/tomato-blight — foliage and fruit symptoms.

Corrected contact sheets: `output/troubles-art-audit/remaining/tomato_troubles-{0,12,24}.png` and `cucurbit_troubles-12.png`. Basic review complete. Validation: 225 tests passed, TypeScript/Vite build passed (existing large-chunk warning), shared 44/14/8 integrity check passed. Remaining gaps: new cucurbit mite art; previously missing images; checkerboard backgrounds. Tomato/cucurbit source organic cleanup and assisted print layout preparation remain separate pending work; image correction does not approve or fact-check all their source advice. No deployment.
