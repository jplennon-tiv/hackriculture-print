# The Vegetable Guru — approved index

A four-page alphabetical index for the 185 × 240 mm book, prepared 12 October
2026. John approved it the same day. [Review the pages](REVIEW.html) and
[exact approval/frozen sources](APPROVAL.json). A separate
[whole-book order preview](../whole-book-order-preview/REVIEW.html#spread=87)
now includes a numeric version at proposed folios 172–175, with clickable internal
references. Final pagination remains pending; approved sources remain unchanged.

## Editable source and references

Edit [index.json](../../../../hackriculture-data/book-layout/index.json).
It contains the terms, stable entry IDs, source references and “see” destinations;
it never stores calculated folios. AI/app changes use the existing
`saveBookLayout({index}, {expectedRevision, actor})` writer. John may edit the file
directly. Unknown fields are preserved and prior bytes are backed up on guarded saves.

- `term` is the displayed text; `sortAs` optionally overrides sorting.
- `refs[].source` identifies a vegetable, Troubles group, technique page or
  cultivation component. Crop references include the useful full guide and the
  relevant Troubles group. They do not index every passing crop mention.
- `refs[].condition` identifies a precise Troubles entry. The resolver locates its
  explanation heading within the saved, hash-checked proof and verifies it in the
  actual PDF. A missing or ambiguous heading stops the build.
- `see` points directly to another substantive entry ID. Broken destinations,
  duplicate terms, alias chains and invalid crop/group identities are rejected.

The 273 entries cover all 44 crop guides, all 220 individual Troubles conditions
(merged where appropriate), practical technique topics and 33 familiar-name
cross-references. Variety catalogues and passing mentions are intentionally not
indexed. The motivational Why Grow Your Own page, publication placeholders and
superseded support/construction pilots are not substantive index targets.
No new gardening claims or online research were introduced.

## Pagination and rebuilding

From the print project, with the existing loopback app running:

```sh
npm run book:check
npm run book:index
```

Then run `scripts/check-book-index.py` with the bundled PDF Python runtime and
inspect the actual rendered pages. The builder generates only the index, reads
saved guide/topic proofs and never re-exports the guides or assembles the book.
[Resolved references](RESOLVED.json) record every locator and PDF hash.
[Checks](CHECKS.json) record fit and actual PDF validation. The [reindex simulation](REINDEX-CHECK.json) moved all guide starts by ten pages and supplied a final topic map in isolated fixtures: all 976 individual references across both editions updated correctly.

The **preserved standalone proof** uses the earlier Bookvault plan for guide
numbers. Its **T** labels identify local pages of the thirteen-page techniques
proof, and **C** labels identify pages 1–4 of the cultivation proof. That historical
review key remains part of the approved source; it is absent from the current
whole-book derivative, where every reference resolves to an ordinary folio.

For the integrated version, pass the current assembly plan with `--plan=path`.
Pass `--topic-map=path` for a JSON object with `imperial` and `metric` objects, each
mapping the existing source identities to their first physical folios, e.g.
`"technique:organic": 156`. Those values must come from the actual new assembly,
not a copied example. The [whole-book workflow](../whole-book-order-preview/README.md)
records the exact current command and separate output paths. It was run for the
14 October preview. The resolver replaces T/C labels automatically;
index terms and condition locators remain unchanged. Both editions are resolved
independently; this proof is shared because their references currently match.
If they diverge, the build stops before export so separate editions can be made.

## Design and verification

Two columns, normal 9.45 pt reading text, Nunito Sans/Lilita One, cream paper,
forest-green entries, orange references and ruled letter headings. Short letter
groups stay intact; longer sections carry a continued heading. Mirrored 17/8 mm
margins follow the book design system. The review pairs show consecutive pages;
the current integrated index faces across 172–173 and 174–175.

The standalone preview contains live links to source PDFs; the whole-book
derivative has 371 internal links to its own pages.
The approved copy and proof are frozen separately in the approval record.
The [updated contents proposal](../contents-update/README.md) supplies a new
working assembly plan and topic-folio map. These resolve the separate integrated
version in the whole-book preview; they have not renumbered this approved proof.
Any later index edits or reflow should be compared with the frozen approval.
