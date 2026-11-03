# Consistent Pests & diseases labels

John requested this correction on **3 November 2026**, after approving the
contents reflow. The fault was in vegetable `troubles` display-label keys:
ALL CAPS, Title Case and sentence case were mixed. These now use sentence case,
retaining proper names and scientific genera where applicable. John approved
this correction with the subsequent Key risks changes on 3 November:
[exact approval and reviewed book](../key-risk-title-case/APPROVAL.json).

The [guarded save receipt](SAVE-RECEIPT.json) records **350 changed labels across
44 vegetables**. [Exact changes](SOURCE-CHANGES.json) list every old/new label,
unchanged advice checksum and original record hash. The full 405-label collection
retains all entries, ranks, order, nulls, redirects, links and unknown fields.
Canonical records live only in `hackriculture-data/vegetables/`; this folder
contains evidence, not another master.

Exact previous bytes are in the shared data project's
`backups/admin/2026-11-03T16-47-20.600Z-65a7e152-f568-4318-af07-e12013fb675b`.
The transaction completed and the backup hashes were checked against all 44
originals. **Do not rerun `save-source.mjs`.** Rollback, if requested, must use the
shared writer with a fresh revision and another backup; do not copy old bytes over
live records and thereby lose subsequent edits.

Only `ai_print_layout.dependencies.troubles`, its update time and attribution
changed alongside the labels; existing approval, lock, output and selection stayed
intact. Both-unit selected rows/advice were compared before saving. No extract
had a dependency on these keys. Identity matching already ignores case; no live
literal paths to renamed keys were found in the print, website or video consumers.
The 220 detailed Troubles names are consistently Title Case and remain unchanged.
This receipt covers Pests & diseases tables. John subsequently requested the
[same correction for Key risks](../key-risk-title-case/README.md), now integrated
on the opening pages as a separate source-bound derivative.
No website or video output was published.

## Book and renderer

`troubleLabel` applies the same display rule in both vegetable renderers,
including fallback labels supplied by shared Troubles. The subsequent Key risks correction extends the same helper to opening summaries;
the name/category-based book-pagination signature
is unaffected. No gardening advice was rewritten.

The main book reuses approved native page bodies. [PDF checks](PDF-CHECKS.json)
bind **277 changed printed labels on all 44 practical pages** to their exact
original sources. All 316 printed table labels are consistent. The corrected
native derivative is `output/pdf/pest-title-case/corrected-guide-pages.pdf`.
It retains line breaks, baseline, size, colour and the original embedded font;
missing lowercase glyphs come only from an identical embedded font subset.
Every other glyph retains its exact text, position, size and colour. All image
bytes and geometry match. There are no covering rectangles or hidden old labels.
In the combined two-column tables the adjacent symptom text stays in place,
so a shorter label can leave a slightly larger space before its dash.

The full-book assembler checks this receipt and its original sources before
using the derivative. Existing source PDFs remain intact. Page numbering, index
and all 44 facing guide pairs are unchanged; the approved contents reflow is also
integrated through the current `book:preview` route. The ordered Bookvault proof
files remain unchanged.

## Verification and continuation

- Source schema, key collisions, exact advice/order/nulls and identity checks;
  both-unit selected-row equivalence; exact transaction backup verified.
- `npm test`: 43 tests passed. Contents/navigation: 11 focused tests passed.
  `npm run check:types` passed.
- [Runtime checks](RUNTIME-CHECKS.json): actual Broccoli and Outdoor Tomato compact
  PDFs in both units, including fallback and inline labels. Fonts/images load,
  content is retained and every printed label is checked. These raw trim tests
  yield three pages; they are not replacements for the accepted two-page book.
- All 44 saved-page tables rendered and inspected in four contact sheets,
  plus Outdoor Tomato at page scale. No clipping or collisions introduced.
- [Main-book evidence](../whole-book-order-preview/CHECKS.json) covers the final
  assembly, navigation and unchanged page count. See its current visual receipt.

`prepare-pdf.py`, `finish-pdf-plan.mjs` and `apply-pdf.py` are the consumed
correction recipe; the completed PDF receipt is a guard against overwriting it.
For later copy changes make a new source-bound revision, rather than editing this
receipt or rerunning the source transaction. `check-runtime.mjs` and
`check-pdf-runtime.py` can repeat the bounded runtime verification while Vite is
running. No whole-catalogue guide export is required.
