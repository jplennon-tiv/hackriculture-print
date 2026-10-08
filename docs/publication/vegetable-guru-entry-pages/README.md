# Compact contents and illustrated how-to

Approved by John on 7 October 2026. Open [the review gallery](REVIEW.html).
The [central approval manifest](../../redesign-rollout/APPROVAL.json), under
`compactEntryPages`, records his statement and exact HTML/CSS/PDF hashes for both
units. These approved pages have not yet been inserted into the 148-page books;
final production preflight remains separate.

The two Bookvault PDFs occupy physical folios **4–7**, matching the current
seven-page opening allowance. Contents use the exact
[Bookvault assembly plan](../book-preparation/ASSEMBLY-PLAN-BOOKVAULT.json), with
all 44 vegetable and 14 Troubles identities checked once per edition. Imperial
and metric currently have identical references. The title, publication details
and introduction on pages 1–3 are outside this first pass.

## Sources and deliberate adaptations

- The [approved Harvest corner contents](../../front-matter/entry-pages/contents.html)
  supplies the original harvest artwork, family order and colours, crop labels
  and warm orange Troubles treatment. Three columns become two facing pages.
- The [approved illustrated how-to](../../front-matter/entry-pages/how-to.html)
  supplies all three explanation paragraphs, calendar, climate keys, difficulty
  badge, baby/Einstein characters, needs capture, dropper and wave. Their ten
  source images are reused unchanged. The calendar occupies page 6; difficulty
  and needs occupy page 7. The needs example is enlarged to 80 mm for legibility.
- A4 folios and its unnumbered-opening/page-range note are replaced by book
  references. The two-page-only crop claim becomes “two or more pages”. The
  crop-applicability note remains. The approved continuation headings and footer
  wording use “this book” in place of “these sheets”.
- No extra explanatory sections are reintroduced. There is no new gardening,
  author or publication copy. All six source/installed A4 layout/PDF hashes
  still match the approval manifest. Existing full books and guides are unchanged.

## Bounded rebuild and evidence

Preserve the approved files; rebuild only for a requested revision. With the
project's Vite server on loopback, run
`node scripts/build-guru-entry-pages.mjs` from the repository root. It reads the
approved sources and assembly plan, writes only this proposal's HTML/receipt and
the PDFs in `output/pdf/vegetable-guru-entry-pages/`, and uses the existing
Bookvault production/normalisation helpers. It does not run the original A4
builder, regenerate guides or assemble books. Styling lives in [entry-pages.css](entry-pages.css).

[CHECKS.json](CHECKS.json) binds source hashes, exact paragraphs, 58 references,
DOM fit and production checks to both PDFs. [PDF-CHECKS.json](PDF-CHECKS.json)
is produced by `scripts/check-guru-entry-pages.py` with the bundled Python
runtime (pypdf/pdfplumber) and Poppler. It records all eight actual PDF pages:
185 × 240 mm trim, 3 mm bleed, folios 4–7,
embedded fonts/glyphs and extracted-text parity. The PNG previews are 135 dpi
renders of each PDF's TrimBox; all eight were visually inspected against the
approved A4 sources. Rebuilds reset visual status and require fresh PDF checks
and preview renders; saved checks must match the current PDF hashes.

The inherited raster specimens remain review-quality assets. The enlarged
calendar is approximately 206 dpi; native-text size checks do not measure text
inside screenshots. The faded Sun/Nutrition rows intentionally preserve the
approved Water emphasis. Final image/colour preflight remains before production.
