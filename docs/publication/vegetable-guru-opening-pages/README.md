# Title, publication and welcome pages

Three-page compact proposal for John's review, 7 October 2026. Open the
[review gallery](REVIEW.html). John requested lipsum orum for the text blocks;
the prose, author credit, imprint, ISBN and edition fields are placeholders.
The design and eventual replacement copy are not yet approved.

These separate Bookvault proofs occupy physical pages **1–3**. Together with
the approved contents/how-to at 4–7, they preserve the current seven-page opening
allowance. They have not been inserted into the full-book PDFs.

- **Title:** the exact selected title/subtitle, native Lilita/Nunito typography,
  cream centre and five vegetable tiles echo selected G2. The actual approved
  hero files provide the crops; the title page deliberately uses a single strip
  in place of G2's two large illustration bands. There is no guide-count footer.
  The page counts as 1 without a visible folio. Hackriculture is a proposed brand
  credit; author and imprint are placeholders.
- **Publication:** labelled areas for copyright, author, imprint, ISBN, edition,
  illustration/design and acknowledgements. Lipsum text makes no legal or
  publication claims. This is space allocation, not draft legal wording.
- **Welcome:** an introductory lead, two body paragraphs, a pull quote and short
  author block, all lipsum. The unchanged harvest cluster and a pea tile connect
  this page to the approved artwork and entry-page design.

The [build receipt](CHECKS.json) records exact G2, harvest and hero source hashes,
placeholder strings and fit checks. The approved compact HTML, CSS and PDFs on
pages 4–7 are checked before and after export. No guide re-export, cover changes,
A4 updates or canonical data changes are involved.

## Bounded build and checks

With Vite on loopback, run `node scripts/build-guru-opening-pages.mjs` from the
repository root. This writes only this proposal's HTML, receipt and two PDFs
under `output/pdf/vegetable-guru-opening-pages/`. Styles are in
[opening-pages.css](opening-pages.css). It uses the existing Bookvault production
and PDF normalisation helpers.

Run `scripts/check-guru-opening-pages.py` with the bundled Python runtime
(pypdf/pdfplumber) and Poppler. [PDF-CHECKS.json](PDF-CHECKS.json) verifies all six
pages: exact 185 × 240 mm trim, 3 mm bleed, native font/glyph embedding, minimum
native text size, title/subtitle and placeholder content, unit parity and approved
file preservation. Its 135 dpi PNGs render the actual PDF TrimBox. All pages and
the facing spread were visually inspected against G2 and the approved entry pages.
Rebuilds require fresh PDF checks and visual review; recorded checks must match
the current PDF hashes. Final copy and supplier preflight remain before production.
