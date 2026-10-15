# Vegetable-header mockups

15 October 2026 · **Approved by John; integrated across all 44 full-book headers. Normal exporter pending.**

[Before/after comparison](REVIEW.html) · [Four approved PDF pages](../../../output/pdf/vegetable-header-review/header-mockups.pdf) · [Exact approval and frozen references](APPROVAL.json)

John refined the Harvest Seasons placement to float towards the shaded circle,
with about 20 pixels of padding and a rightward adjustment for title collisions.
The Difficulty oval matches the page background. The samples are Carrot
(cream, folio 14), Onions and Shallots (pink, 66), Oriental Leaves (pale green, 58)
and Florence Fennel (green-grey, 92).

The normal position puts the visible widget's right edge 20 CSS pixels before
the shaded circle's left edge. If this crowds the actual title text, including
its full stop, shift the widget right until there is 20 px after the title.
This replaces the first trial's title-anchored 6 mm / 3–4 mm gaps. No title
shrinking or wrapping changes are introduced. The badge
keeps its position, border, shadow, typography and rating; only its fill changes
to the page's `--paper` colour.

The PDF reuses the exact body of each page from the current clean imperial book
and replaces only its header. No body reflow, font-size changes, content edits,
table omissions or artwork edits. The focused mockup left the full book, normal compact/A4 renderers, approved
sources and canonical JSON unchanged. The [full-book preview](../whole-book-order-preview/REVIEW.html)
now applies this treatment to all 44 vegetable headers, reusing existing bodies. Saved HTML files are
isolated header specimens, not complete guide exports.

## Verification

- [CHECKS.json](CHECKS.json): all four headers measured in imperial and metric;
  title/badge geometry and wording retained, spacing checked, badge fill matched
  to page colour, source hashes preserved.
- [PDF-CHECKS.json](PDF-CHECKS.json): four actual imperial pages at 185 × 240 mm;
  header words and every body text character retained; current book unchanged.
- [VISUAL-REVIEW.json](VISUAL-REVIEW.json): all four final headers and complete
  pages inspected; no collision, clipping, seam or content displacement observed.
- [BROWSER-CHECKS.json](BROWSER-CHECKS.json): comparison tested at 1440 and 390 px;
  all 16 images load, full-page comparisons expand, no horizontal overflow or
  script errors, PDF link responds successfully.

Metric coverage is header measurement only; the review PDF is imperial.
John subsequently approved this treatment: “Perfect - approved.” This is design
approval; it does not establish production or supplier approval.

## Rebuild

Preserve the frozen references listed in the approval manifest. Future revisions
must use separate output paths. The original workflow, with loopback Vite running, is
`node scripts/build-vegetable-header-trial.mjs`, then
`python3 scripts/review-vegetable-header-trial.py` using a Python environment
with pypdf, pdfplumber and Poppler available. Only four sample headers are
rendered; there is no full-book or catalogue regeneration. The isolated trial
layout lives in `src/print/book/header-widget-trial/layout.mjs`.
