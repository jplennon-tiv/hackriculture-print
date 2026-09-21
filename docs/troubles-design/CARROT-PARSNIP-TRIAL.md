# Carrot/parsnip assisted print trial

19 September 2026. Review draft only.

## Result

`output/pdf/carrot-parsnip-assisted-trial/carrot-parsnip-troubles-A4.pdf` contains all 15 conditions and the introduction, on four A4 pages rather than the previous five. Four cards per page, two columns, existing typography/padding, category stripes and Recognise / Act / Prevent shades. Image heights are measured to fit the available card space. All four rendered pages inspected; no visible clipping or overlapping footers. Some short cards retain spare space; existing image checkerboard backgrounds are not repaired in this POC.

## Editorial changes and limits

Long prose was condensed into print-only summaries, preserving the full master records. Carrot Fly and Parsnip Canker were shortened further to fit; Green Top and Old Seed use the previous approved pilot copy. Drafts and the exact source snapshot are saved in `../hackriculture-data/planning/troubles-print/carrot-parsnip-trial-2026-09-19.json`. No draft was promoted into live `troubles.json` or batch output.

Older chemical recommendations in the source were replaced in the trial using current RHS guidance:

- [Sclerotinia](https://www.rhs.org.uk/disease/sclerotinia-disease): remove/destroy affected plants, do not compost, no chemical treatment available to UK gardeners; persistence can exceed the source's two-season rotation interval.
- [Aphids](https://www.rhs.org.uk/biodiversity/aphids): monitoring, hand control where needed and natural predators replace named older insecticides. Removing aphids does not cure established virus infection.
- [Swift moth caterpillars](https://www.rhs.org.uk/biodiversity/swift-moth-caterpillars): removal when found, tolerance of minor damage, predators and cultivation replace old pesticide advice.

This is not a complete horticultural fact audit. The source's Parsnip Rust diagnosis and five-year rotation remain unverified and are explicitly qualified in the draft. Clayburn's culinary-value statement is attributed to the source. The old symptom lookup/book-page references are not included, consistent with the preceding renderer; all condition entries are included.

## Resume / regenerate

From the print project with its local Vite server available on port 5173:

```sh
node scripts/generate-carrot-troubles-trial.mjs
```

The builder refuses to reuse drafts if the live group differs from the saved snapshot. It checks overflow, all 16 cards and exact displayed copy, then writes the PDF and `fit-report.json` beside it. After changes, render the PDF and inspect all four pages again. The pre-refinement draft backup is `../hackriculture-data/backups/admin/carrot-parsnip-trial_2026-09-19_v1.json`.

Await John's POC review and discussion of AI-review integration. Do not roll out to other groups or change batch behaviour based solely on this trial.
