# Final copy pass

These notes describe the 18 October source proofs and their original folios.
The [19 October subsection derivative](../techniques-subsections/README.md) owns
current headings and placements. Rebuild it after changing these source proofs,
then refresh the full book; its source hashes must be reconciled explicitly.

John requested four changes to **Organic growing — The core ideas**, printed
page 146, on 18 October 2026: remove the introduction's final sentence and replace
the three advice paragraphs. The [working copy](../../../src/print/book/final-text-edits/organic.json)
contains his wording, correcting poison, likely and vulnerable and lower-casing
continuations after colons. Supplied line breaks reflow naturally. John's follow-up
shortens the middle paragraph to end “your garden will ultimately flourish.”

The nutrient-return diagram/caption, “Experiment on a small patch”, source note,
three-column structure and current flowing title remain. Body type stays 9.45 pt;
heading sizes stay 31.5/22.5 pt. John approved the revised page on 18 October;
the [approval record](ORGANIC-APPROVAL-2026-10-18.json) preserves exact copy,
layout sources and both-unit proofs. The frozen 12 October source and accepted 18 October
section remain intact; no canonical gardening or shared book-layout JSON changes.

## Build and evidence

With the existing loopback app available, run
`node scripts/build-final-topic-edits.mjs`, then follow the subsection route above.
This builds only the affected page in both units; the subsection derivative
then carries it into the current full preview without exporting guides. Keep all earlier frozen proofs.

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

## Beds and paths, page 153

John supplied an exact replacement for the “Sides are optional” paragraph. It
now ends “Choose what makes the plot easier to use for you.” The separate
[source-linked draft](../../../src/print/book/final-text-edits/plot-layout-branching.json)
preserves the frozen collection. [Both-unit checks](BEDS-PDF-CHECKS.json) confirm
that only this paragraph changes, with the original panels and type retained.
Build this page with `node scripts/build-final-topic-edits.mjs --page=plot-layout-branching`;
then refresh the full preview with `npm run book:preview`. The manifest preserves
the existing Organic growing derivative when this page is rebuilt.

The same manifest now places the [four Cultivation pages](../cultivation-headings/README.md)
at 156–159, retaining John's digging reorder and subsequent heading correction.
The [Digging copy draft](../../../src/print/book/final-text-edits/digging.json)
also supplies the revised introduction with two bold phrases and the longer
double-digging heading on 158. Its exact text, bold PDF font and both-unit fit
are covered by the Cultivation checks.
