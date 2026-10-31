# Growing Techniques subsections

John requested the heading groups and removal of the two internal blank pages
on **19 October 2026**. This retained derivative contains 18 content pages with source folios
**146–163**. The 30 October main-book integration inserts approved Netting and
Supports at **160–163**, placing Watering at **164** and Greenhouses at **165–167**.
The current book has **172 interior pages** plus four cover leaves; the index is
**168–171**. The derivative stays unchanged: final assembly remaps its last four
pages and replaces their footers. See the [main-book workflow](../whole-book-order-preview/README.md).

[Heading definitions](../../../src/print/book/techniques-subsections.json) contain
the exact requested replacements. Both rotation pages retain the same heading,
now “Organic growing / Rotation & planning”. The repeated Nutrient cycles request
is one change. Compost and Plant care change the small running titles only.

[SOURCES.json](SOURCES.json) binds the previous both-unit native proofs, including
all earlier author copy edits and the complete double-digging sequence. Frozen
approvals and original artwork remain intact. Only the specified header text is
replaced. Bodies move horizontally when needed to give the correct inner margin;
their glyphs, sizes, vertical positions and image counts are verified exactly.
The cream paper is restored at any edge exposed by that horizontal movement.

Removing old blank folios 150 and 162 makes some two-page topics cross a page
turn. No new blanks are inserted. The entire two-page rotation still faces at
148–149; the greenhouse continuation pages now face at 166–167. All five double-
digging steps remain together, now on **157**, followed by single digging on **158**.

With `start.command` serving the project on loopback:

```sh
node scripts/build-techniques-subsections.mjs
```

Then run the bundled Python with `scripts/review-techniques-subsections.py` and
inspect the actual spreads. `npm run book:preview` refreshes contents/index,
footers, the native full PDF and its viewer without exporting any guides.

For subsequent body-copy work, first build the affected source proof through its
own draft route. Update only its exact source PDF binding in SOURCES.json after
checking it, retaining the distinction between the source folio and current folio;
then rebuild this derivative. Do not use its own output as a source. A changed
source hash fails until reconciled. Older proof builders retain dated folios and
headers; the current full-book route consumes this derivative.

[MANIFEST.json](MANIFEST.json) records all 36 actual pages, source hashes, body
comparisons, heading fit and footer clearances. [PDF-CHECKS.json](PDF-CHECKS.json)
records the renders and paper-edge checks; [visual review](VISUAL-REVIEW.json)
records inspected spreads. These are author-requested changes for review, not
new design or supplier approval. Canonical gardening JSON is unchanged. Numeric navigation is regenerated
from the current placements; the [guarded single-digging index correction](INDEX-REFERENCE-SAVE.json)
updates its stable destination to the moved instruction page, with exact previous bytes saved.
