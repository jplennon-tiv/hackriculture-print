# Working book opening proofs

These files are generated from the editable
[shared book-layout JSON](../../../../hackriculture-data/book-layout/README.md).
Edit that source, then use `npm run book:check` and the relevant builder from the
print project. Do not edit generated HTML or proof receipts as the copy master.

- `opening/`: title, publication and welcome/author pages 1–3.
- `entry/`: contents and illustrated how-to pages 4–7.
- PDFs: `output/pdf/book-layout-working/` in the print project.
- [Migration evidence](MIGRATION.json): source hashes, unchanged gardening revision,
  initial save receipt and exact verification coverage.
- [PDF checks](PDF-CHECKS.json): both editions, all 14 pages and all 58 contents
  references per edition. The initial 90 dpi renders match the saved sources
  pixel for pixel; all extracted copy matches too.

The original [opening proposal](../vegetable-guru-opening-pages/REVIEW.html) and
[approved contents/how-to](../vegetable-guru-entry-pages/REVIEW.html) remain intact.
Working proofs do not grant new copy/design approval or change the full-book
preview. Stock-header trials remain in the separate progress-preview workflow.
See [development instructions](../../../DEVELOPMENT.md#editable-book-copy) for
commands, actual PDF checking and the distinction from full-book assembly.
