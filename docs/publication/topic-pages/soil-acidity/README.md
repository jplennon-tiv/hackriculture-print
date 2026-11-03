# Organic growing / Testing and adjusting pH — approved

2 November 2026. **Approved by John and integrated at page 152.**
The [approval](APPROVAL.json) preserves the exact accepted PDF, copy, layout and artwork.

[View the page](REVIEW.html) · [PDF](../../../../output/pdf/soil-acidity/soil-acidity-draft.pdf) · [Vegetable wording comparison](../../soil-acidity-crop-edits/DIFF.html).

John found the first two-page draft coherent but too much to absorb. His latest
brief replaces it with one page at the end of **Organic growing**, using a simple
introduction and two main panels: testing and lime. The current draft has **218
body words**, two retained illustrations and no separate pH scale, numbered
procedure, extra closing panels or extended personal account. The chemical
notation is correctly styled **pH** in his requested title.

## Position and scope

Organic growing comprises the core page (148), Nutrient cycles (149), Rotation &
planning (150–151), then this approved page at **152**. Watering moves beside
Sowing and planting at 162–163, keeping Netting 164–165 and Supports 166–167 as
facing spreads without inserting a blank. The index is now 171–174; the old end
blank is absorbed, so the interior remains 174 pages.

The [current full-book evidence](../../whole-book-order-preview/README.md) records
integration and mirrored margins. The approved three-panel page 9 is also included.
The sixteen vegetable wording proposals remain separate and unapproved. Canonical
gardening records and ordered supplier PDFs are unchanged.

## Sources and composition

- [Editable copy](../../../../src/print/book/soil-acidity/copy.json) contains the
  introduction and two panels. Laboratory confirmation remains omitted.
- [Evidence and editorial decisions](RESEARCH.md) retain the researched basis.
  Condensation keeps the pH explanation, representative sampling, kit directions,
  repeat-reading caution, three-month testing interval, conditional liming,
  product-specific rate, handling/timing and potato/clubroot cautions. Dolomitic
  lime, soil-texture comparisons, the extended no-dig explanation and the ten-year
  personal account are intentionally omitted for this brief.
- [Build](build.mjs), [layout](draft.css) and [PDF finishing](finish-proof.py)
  now produce only this one-page layout. The previous two-page arrangement is
  superseded, not an alternative to rebuild or integrate.
- The approved [Supports composition](../plant-protection-supports/supports/README.md)
  supplies the established Techniques geometry, cream paper, green/orange Lilita
  hierarchy, Nunito body and mirrored 17/8 mm gutters. The two-panel arrangement
  is approved. The long main title and qualifier occupy two deliberate lines.
- [Artwork provenance](ARTWORK.json) records the unchanged test-kit and lime
  illustrations, their direct approved style references, complete prompts and
  hashes. No new generation or image alteration was needed. The native pH scale
  from the first draft is intentionally omitted; pH is explained in the introduction.

## Verification and reproduction

The exact accepted files are frozen by [APPROVAL.json](APPROVAL.json). Both focused
builders refuse to overwrite them. Use a separate revision path for later changes;
`npm run book:preview` reuses this approved PDF without rebuilding it.

[Checks](CHECKS.json) record source/artwork hashes, image loading, embedded fonts,
complete extracted copy, safe block bounds and exact **185 × 240 mm** trim.
Body type is **10.125 pt**, slightly larger than the previous 9.45 pt, with a
10.5 pt introduction. Content clears the source note by 9.74 mm; source-to-footer
clearance is 3.56 mm. The actual [page render](page-152.png) was inspected at reading
size and as a thumbnail; [visual review](VISUAL-REVIEW.json) records coverage.
Unit-neutral copy needs only this one proof. John’s approval is recorded separately; these screen checks do not establish supplier readiness.
