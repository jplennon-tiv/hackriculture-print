# Jerusalem Artichoke — fourth variety preview

10 November 2026. **Approved by John in both editions.** [Exact approval](APPROVAL.json). [View both editions](REVIEW.html).
This is a separate derivative of the [approved 5 November spread](../artichoke_jerusalem/APPROVAL.json).
The approved version remains intact.

Gerard is added after Fuseau, Dwarf Sunray and Small Wonder. The four entries use
two rows of two at the existing type sizes. Every original description is retained.
The new paragraph reads:

> A French variety with red skin and fine flavour. The tubers are rounder than Fuseau; check availability with specialist suppliers.

The [source note](SOURCES.md) distinguishes the canonical flavour/colour advice,
supplier-confirmed French origin and shape, and current availability. Tamar
Organics lists Gerard but says it is unavailable for 2026/27. This is a dated
supply issue, not evidence that the cultivar is discontinued. The printed copy
uses a general availability qualification rather than a season-specific notice.

## Preservation and checks

- Both actual PDFs retain two pages at 185 × 240 mm, folios 12–13.
- Opening footer clearance is **21.50 mm**, reduced from 33.40 mm. Practical-page
  clearance stays **6.17 mm** in both editions. Natural trailing space remains;
  no type, illustration or artificial spacer is enlarged to fill it.
- All eight Quick facts, the calendar, needs scales, existing illustrations,
  three pest rows and complete practical page are preserved.
- Exact approved HTML was the starting point. Checks require the entire practical
  page, all page-1 HTML outside the varieties panel, the original three variety
  descriptions and every image path to remain exact.
- The existing finisher verifies all four variety entries at their actual PDF
  coordinates, page dimensions, folios and the retained link structure. This
  guide originally has no See also destinations.
- Both finished spreads were visually inspected against the approved source.
  [DOM/preservation checks](CHECKS.json), [proof evidence](checks/artichoke_jerusalem.json),
  [finished PDF checks](checks/artichoke_jerusalem.verified) and
  [additional PDF comparison](PDF-CHECKS.json) record exact coverage.

The [book-only specification](../../../../../src/print/book/sowing-rollout/revisions/artichoke_jerusalem_varieties.json)
binds the draft to its approved source and current master hash. Canonical data,
approvals, original full readers and the main book remain unchanged. No wider
catalogue export or app-code change was made. The new wording and layout were approved on 10 November; the exact sources are
frozen in the approval record.

Historical build route, now protected by approval: from the project root, with the existing
Vite session started through `start.command`, run its local `build.mjs`, then
`scripts/sowing-rollout/finish.py --revision artichoke_jerusalem_varieties` in the
bundled Python runtime. The builder refuses to overwrite an approved revision.
