# Tomato two-page trials

John authorised these greenhouse/outdoor trials on 15 October 2026, following
approval of carrot and onions/shallots. These tomato spreads are **approved**; see [APPROVAL.json](APPROVAL.json). Their clean pages are integrated in the [full preview](../whole-book-order-preview/REVIEW.html?revision=integrated-two-page). The historical highlighted review is retained. [Open the highlighted review](REVIEW.html).

Both crops fit two pages in both units. Body font sizes and leading are unchanged.
All ten greenhouse and nine outdoor pest entries, five varieties per crop,
planting drawings and measurements remain. John permits removing bottom table
entries only if other adjustments cannot produce a fit; that fallback was not used.

Original canonical JSON is preserved. Source-checked presentation drafts live in
`src/print/book/tomato-two-page-trial/`, separate from normal exports and the approved
carrot/onion files. [Trial checks](TRIAL-CHECKS.json), [PDF checks](PDF-CHECKS.json),
[browser checks](BROWSER-CHECKS.json) and [visual review](VISUAL-REVIEW.json) bind
exact sources and outputs. The review includes original three-page imperial views.

To rebuild only this trial, with the existing loopback server available:

1. `node scripts/build-tomato-two-page-trial.mjs`
2. Run `scripts/review-tomato-two-page-trial.py` with the bundled Python/Poppler runtime.
3. `node scripts/build-tomato-two-page-review.mjs`
4. Inspect all four new PDF spreads and replace the hash-bound visual receipt.

The builder also supports `--measure` and `--source`; neither exports PDFs.
Trial folios 86–87 and 90–91 retain the preceding book references. Integration required
fresh pagination, contents/index/related references and book assembly, including
removal of the old crop-alignment blanks. Do not overwrite the approved first trial.

Current integrated folios are greenhouse tomato 82–83 and outdoor tomato 84–85. Original trial PDFs and inputs remain hash-bound and unchanged.
