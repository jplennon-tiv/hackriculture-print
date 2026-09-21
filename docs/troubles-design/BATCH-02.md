# Tomato/cucurbit proofs — restore point, 19 September 2026

Completed: tomato 8 A4 pages / 28 conditions, cucurbit 7 A4 pages / 26 conditions. All 54 entries retained, 162 draft AI fields plus two draft introductions/layouts stored in the authoritative records. Corrected artwork mappings reused; no new images generated. PDFs: `output/pdf/ai-once-pilot/tomato_troubles-review-A4.pdf` and `cucurbit_troubles-review-A4.pdf`. User review/approval pending; do not approve drafts implicitly. Normal exports remain deterministic and require approval to use new draft copy/plans.

First cucurbit proof had eight pages, but two text-only storage entries left the last page largely empty. Moved them beside Gummosis and Eelworm, giving seven useful pages. This applies John's soft duplex preference without padding. For physical duplex printing the last reverse can remain blank. Tomato virus card needed 118mm on page 1, balanced by 85mm Leaf Roll. Final plans are in records, not the initial editorial packet. Do not rerun one-shot `prepare-troubles-batch-02.mjs` over existing drafts. `batch-02-copy.mjs` preserves the initial proposed copy/ordering; subsequent layout adjustments are recorded here and in audited master fields.

## Source changes and recovery

Authorised organic pass removes old carbendazim, permethrin, fenitrothion, mancozeb, methiocarb, poison-bait and sulphur-dusting prescriptions from these two groups. Replacements use hygiene, ventilation, physical removal/protection and qualified biological controls. Targeted adjacent corrections: potato-tuber advice removed from tomato blight; Cheshunt Compound removed from Foot Rot description; fixed-week drying and routine foliar spraying replaced by moisture assessment; bitter-fruit rubbing remedy replaced with discard advice; fixed nematode rotation interval qualified by identification; greenhouse versus outdoor cucumber pollination distinction retained. Unrelated granular descriptions and metadata preserved. Full exact source edits are explicit in the preparation script; new shorter text stays in ai_ fields.

Before source changes: shared `backups/admin/2026-09-19T22-26-10.598Z-2393d867-f734-4b78-9b5e-c51cded863ee/`.
Before AI companions: `2026-09-19T22-26-10.796Z-84686dc9-d0c9-4271-b473-1a9303588a6a/`.
Before tomato card adjustment: `2026-09-19T22-27-08.808Z-df3661d2-4e3f-4b1f-8203-e6214a9ef6b1/`.
Later cucurbit pagination adjustment also uses an exact-byte writer transaction. Read transaction journals to restore records, refresh projections, and never reintroduce combined root masters.

## Research

- RHS tomato leaf mould: https://www.rhs.org.uk/disease/tomato-leaf-mould
- RHS grey mould: https://www.rhs.org.uk/disease/grey-mould
- RHS glasshouse whitefly: https://www.rhs.org.uk/biodiversity/glasshouse-whitefly
- RHS biological control: https://www.rhs.org.uk/prevention-protection/biological-control-garden
- RHS tomato blight: https://www.rhs.org.uk/disease/tomato-blight
- RHS fruit ripening disorders: https://www.rhs.org.uk/problems/tomatoes-fruit-ripening-problems
- RHS cucumber cultivation / flower management: https://www.rhs.org.uk/vegetables/cucumbers/grow-your-own
- RHS powdery mildew: https://www.rhs.org.uk/disease/powdery-mildews
- RHS spider mites: https://www.rhs.org.uk/biodiversity/glasshouse-red-spider-mite
- Poison Control, bitter cucurbits: https://www.poison.org/articles/toxic-squash-syndrome-if-it-s-bitter-it-s-not-dinner

## Checks and limitations

Final reports: exact 28/26 card counts, zero overflowing columns, no automatic fallback. Expected warnings: draft reviews plus tomato's three known missing illustrations. All 15 final pages rendered and visually inspected; no clipped text/footer collisions. 225 print tests and TypeScript/Vite build passed (existing chunk-size warning); shared 44/14/8 integrity check passed before final layout-only adjustment. Poppler produced existing Type 3 glyph bounding-box warnings without visible clipping.

Tomato Aphids/Slugs/Cutworm lack files. Cucurbit Red Spider Mite, Vine Borer and two storage-related entries are text-only; Sun Scald now has reassigned artwork. Existing checkerboards and reused hero images unchanged. Some single-card columns have spare space; no filler inserted. Vine Borer remains explicitly marked for identification/UK relevance review, not asserted to be a confirmed local pest. Crop-applicability labels inherited from source can be broader than the prose; no blanket catalogue factual approval claimed. Further organic review remains necessary in other groups. No deployment or website/video rewrite.

Next: John reviews these two PDFs and flags issues. After explicit approval, use `scripts/approve-troubles-ai.mjs GROUP --approved-by-john`; source-signature checks must pass. Export again with `scripts/export-troubles-review.mjs GROUP` for review changes; no AI calls needed when reusing saved copy/layout.
