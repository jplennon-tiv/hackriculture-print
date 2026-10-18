# Final copy pass

John requested four changes to **Organic growing — The core ideas**, printed
page 146, on 18 October 2026: remove the introduction's final sentence and replace
the three advice paragraphs. The [working copy](../../../src/print/book/final-text-edits/organic.json)
contains his wording, correcting poison, likely and vulnerable and lower-casing
continuations after colons. Supplied line breaks reflow naturally. John's follow-up
shortens the middle paragraph to end “your garden will ultimately flourish.”

The nutrient-return diagram/caption, “Experiment on a small patch”, source note,
three-column structure and current flowing title remain. Body type stays 9.45 pt;
heading sizes stay 31.5/22.5 pt. This is an author-requested revision for review,
not a new design approval. The frozen 12 October source and accepted 18 October
section remain intact; no canonical gardening or shared book-layout JSON changes.

## Build and evidence

With the existing loopback app available, run
`node scripts/build-final-topic-edits.mjs`, then `npm run book:preview`.
The first builds only the affected page in both units; the second reuses it in
the current full preview without exporting guides. Keep all earlier frozen proofs.

- [Source/proof manifest and DOM checks](MANIFEST.json): exact source matches,
  retained diagram/closing, fonts, text edges and footer clearance.
- [Actual PDF checks](PDF-CHECKS.json): one page in each unit, all four replacement
  paragraphs checked in their PDF columns, 16.65 mm to the source note and
  3.56 mm source-to-footer clearance. Both rendered pages are pixel-identical.
- [Imperial page](../../../output/pdf/final-text-edits/organic-imperial.pdf) and
  [metric page](../../../output/pdf/final-text-edits/organic-metric.pdf).
- [Current facing spread](../whole-book-order-preview/REVIEW.html#spread=74) and
  [whole-book checks](../whole-book-order-preview/CHECKS.json).

Visual coverage: actual single-page renders in both units, compared with the
earlier page; final imperial spread 146–147. The expanded centre column remains
clear of the closing box and source note. Full metric assembly and supplier
preflight remain outside this edit.
