# Complete Troubles rollout

31 October 2026. **John approved the complete proofs and main-book integration on 31 October; see [APPROVAL.json](APPROVAL.json).**

[Imperial section PDF](../../../output/pdf/troubles-rollout/vegetable-troubles-imperial.pdf) · [Metric section PDF](../../../output/pdf/troubles-rollout/vegetable-troubles-metric.pdf) · [Facing-spread viewer](REVIEW.html)

Each PDF contains the existing revised opener at **99** and **47 guide pages, 100–146**: 14 groups, all 220 conditions and exactly 24 highlights. Onion/Leek and Turnip/Swede/Radish each gain one page over the current main book. No advice, diagnostic drawing or type size is cut or reduced. These exact pages are integrated in the [current main book](../whole-book-order-preview/README.md). Ordered production files remain unchanged.

## Decisions and sources

- [Exact selection approval](SELECTION-APPROVAL.json): the original 25 minus potato slugs, with no other additions. Potato slugs stay as an ordinary complete entry. There are 11 Common Pest, six Common Disease and seven Common Problem ribbons.
- [Guarded save receipt](STAR-SAVE-RECEIPT.json): 22 added star flags across 13 records, retaining the two Brassica flags; exact prior-byte backups and field attribution. Advice, ranks and unknown fields are preserved. This transaction is complete; do not run it again.
- The frozen [Brassica composition](../brassica-priority-study/APPROVAL.json) and [flow/mask baseline](../brassica-flow-preview/REFERENCE-LOCK.json) remain the sources. All 29 Brassica masks are reused byte for byte; 191 additional masks cover the remaining groups.
- Visible source PNGs remain untouched. Invisible SVG masks control shape-outside at **135 × 157.5 CSS px**, with **4 mm** clearance. The runtime [mask manifest](../../../src/print/book/troubleMasks.json) binds original image/mask hashes and URLs. Keep its linked SVGs available.
- [Feature classifications](../../../src/print/book/troubleFeatures.json) use explicit group/condition keys. New or unclassified canonical stars fail compact export until reviewed; there is no keyword guess or automatic Pest default.

## Ordering, flow and page fit

Importance is the primary order. Equal ranks begin in their existing source-layout order, without an alphabetical tie-break. The strict ranked control fixes the reference page for each entry. The fit search can move an entry forward or back by **at most one page**; that bound does not drift during successive search passes. No source rank changes.

Natural 8 px entry gaps and full artwork/advice heights replace the old distribution of empty space through a guide. The final page may be sparse; spare room trails below its content. Complete entries can leave uneven lower edges on earlier pages. Features must be separated in reading order, across columns and across actual facing gutters. Column breaks are considered alongside sequence changes.

The search normally permits rank reversals of at most one point. A two-point search is used for Carrot/Parsnip to avoid a fourth page, for Lettuce and Oriental Leaves to fill earlier columns left less than half full by feature separation, and for Tomato to separate its three rank-10 panels. All remain within the one-page limit and all stars are on the first two pages of their group. These rank-point limits and numerical penalties are implementation choices, not extra instructions from John. The fit reports record the reason, strict pages, selected pages, every move and weighted pair inversion count.

The final result has zero feature-adjacency conflicts. All six Brassica pages in both units are pixel-identical to the accepted specimen. Large gaps are not filled by stretching paragraphs; [CHECKS.json](CHECKS.json) supplies measured capacities, entry heights, natural gaps and selected breaks. [WHITESPACE.json](WHITESPACE.json) records every nonfinal column with more than 30 mm unused depth in both units: its next whole entry cannot fit.

## Page map and individual guides

| Guide | New folios | Pages before → now | Imperial | Metric |
| --- | --- | --- | --- | --- |
| Bean and Pea Troubles | 100–103 | 4 → 4 | [PDF](../../../output/pdf/troubles-rollout/bean_and_pea_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/bean_and_pea_troubles-metric.pdf) |
| Beetroot Troubles | 104–105 | 2 → 2 | [PDF](../../../output/pdf/troubles-rollout/beetroot_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/beetroot_troubles-metric.pdf) |
| Brassica Troubles | 106–111 | 6 → 6 | [PDF](../../../output/pdf/troubles-rollout/brassica_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/brassica_troubles-metric.pdf) |
| Carrot and Parsnip Troubles | 112–114 | 3 → 3 | [PDF](../../../output/pdf/troubles-rollout/carrot_and_parsnip_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/carrot_and_parsnip_troubles-metric.pdf) |
| Celery Troubles | 115–116 | 2 → 2 | [PDF](../../../output/pdf/troubles-rollout/celery_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/celery_troubles-metric.pdf) |
| Cucurbit Troubles | 117–121 | 5 → 5 | [PDF](../../../output/pdf/troubles-rollout/cucurbit_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/cucurbit_troubles-metric.pdf) |
| Florence Fennel Troubles | 122–122 | 1 → 1 | [PDF](../../../output/pdf/troubles-rollout/florence_fennel_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/florence_fennel_troubles-metric.pdf) |
| Lettuce Troubles | 123–125 | 3 → 3 | [PDF](../../../output/pdf/troubles-rollout/lettuce_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/lettuce_troubles-metric.pdf) |
| Onion & Leek Troubles | 126–129 | 3 → 4 | [PDF](../../../output/pdf/troubles-rollout/onion_and_leek_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/onion_and_leek_troubles-metric.pdf) |
| Oriental Leaves Troubles | 130–131 | 2 → 2 | [PDF](../../../output/pdf/troubles-rollout/oriental_leaves_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/oriental_leaves_troubles-metric.pdf) |
| Potato Troubles | 132–136 | 5 → 5 | [PDF](../../../output/pdf/troubles-rollout/potato_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/potato_troubles-metric.pdf) |
| Spinach Troubles | 137–138 | 2 → 2 | [PDF](../../../output/pdf/troubles-rollout/spinach_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/spinach_troubles-metric.pdf) |
| Tomato Troubles | 139–143 | 5 → 5 | [PDF](../../../output/pdf/troubles-rollout/tomato_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/tomato_troubles-metric.pdf) |
| Turnip, Swede & Radish Troubles | 144–146 | 2 → 3 | [PDF](../../../output/pdf/troubles-rollout/turnip_swede_radish_troubles-imperial.pdf) | [PDF](../../../output/pdf/troubles-rollout/turnip_swede_radish_troubles-metric.pdf) |

[PAGE-MAP.json](PAGE-MAP.json) records every condition destination in both editions. The approved section is now integrated at 99–146 with refreshed contents, index, crop references and bookmarks. Techniques begins at **147**, still a right-hand page; the main interior has 174 pages. Approved category names and coloured contents are integrated too. The main-book integration receipt owns the resulting folios and output.

## Verification

- [Browser measurements and fit reports](CHECKS.json): both units, 220 conditions once each, exact advice text and image URLs, 24 correct labels, loaded masks/fonts/images, natural gaps, page movement bounds, footer and trim checks.
- [Actual PDF checks](PDF-CHECKS.json): 28 guide PDFs plus two combined PDFs, complete body glyph/type-size inventories and original decoded embedded images compared with captured legacy compact bodies; fonts embedded and 185 × 240 mm trim. Both units have separate source comparisons.
- [A4 dependency record](DATA-DEPENDENCIES.json): all 28 actual A4 counts unchanged. Reconstructing the preceding signature by removing exactly the 22 new flags proves the metadata refresh contains no unrelated source change. A4 layout, advice and navigation numbers are retained.
- [Normal route checks](NORMAL-ROUTE-CHECKS.json): all 28 A4 routes ready without warnings; six normal compact API PDFs cover Brassica, Tomato, Carrot/Parsnip in both units, Lettuce and Oriental Leaves, with classified ribbons verified. Ordinary trim exports use their own geometry and local numbering, so their counts need not match the book-profile section (Carrot/Parsnip is four pages in ordinary trim, three here).
- [Visual review](REVIEW.json): exact inspected renders/spreads, retained whitespace and source comparison. Technical checks are separate from John’s review and supplier approval.
- Routine tests: 43; compact PDF tests: five; priority/rollout fit tests: eight; TypeScript check passed. The initial pagination-signature failure was resolved by the source-bound A4 metadata refresh, then the routine suite passed.

## Reproduction and resume

The [approval](APPROVAL.json) freezes all 28 guide PDFs, both section PDFs and the verified condition map. The preparation, build and PDF-review runners now refuse to overwrite this approved set. Use `npm run book:preview` for authorised integration rebuilds: it reuses these exact PDFs through `scripts/lib/approved-troubles.mjs` and does not regenerate them.

Later Troubles edits need a new revision destination, source capture and proof review. Keep `BASELINES.json`, the before/after HTML, selection/save receipts, checks, page map, runtime masks and frozen sources. Do not repeat the completed star save. The normal compact exporter still uses the accepted automatic flow; explicit `false` exists solely for legacy comparison. All 220 source-bound masks remain runtime inputs.
