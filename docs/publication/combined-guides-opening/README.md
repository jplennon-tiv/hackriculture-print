# Combined Vegetable Guides opening

15 October 2026 · **Approved by John; integrated into the full-book preview.**

[Approval and frozen references](APPROVAL.json) preserve the exact page approved
after removal of the Water background stripe.

[Review the page and facing spreads](REVIEW.html) · [Four-page context PDF](../../../output/pdf/combined-guides-opening/guides-opening-preview.pdf)

John requested the Vegetable Guides title and its how-to on one page, with the
how-to in the lower two thirds, permitting removal of all opener content except
the title. He then clarified the side: **right-hand page, matching Troubles**.
The approved sequence is blank 8, combined opener 9, first vegetable 10–11.
This preserves the first guide's facing spread and the current overall pagination.

The main green/orange title and a smaller H4 summer illustration remain above a
pale-peach panel (`#ffe1b7`, the established house supporting colour). This
stronger background replaces the first proposal's faint green at John's request.
“How to use the guides” is centred in deep orange at 30 CSS px,
larger than the 22 px subheadings. John requested removal of the short sentence
immediately below it; it remains preserved in the shared source JSON.
The panel occupies about 163 mm of the 240 mm page. Its calendar key
sits beside the calendar, and difficulty/core-needs explanations sit beside
their diagrams. All three source paragraphs, the climate qualification and the
usual/less-usual distinctions are retained. Explanatory body text remains
14 CSS px / 10.5 pt.

John spotted cream screenshot corners and unreadable faded labels after the peach
change. The three flattened examples are now replaced by native text/shapes from
their original guide components: Radish calendar and Core Needs, Broccoli Medium
3/5 difficulty. Calendar width remains 100 mm; the live needs example is 72 mm.
Dates, colours and ratings are preserved. All needs rows are fully opaque and
share the panel's peach background. Labels, scale dots, outlines and dividers are more
legible. Core Needs labels are 9 pt; calendar/badge fine labels are at least
7.5 pt native text. Six original instructional SVG illustrations remain, joined
by the three original coloured guide icons. The three source screenshots remain
intact as references; no raster asset was edited.

Intentional omissions: opener section number/eyebrow, strapline, introduction,
closing guide-count sentence, the separate H5 seedling decoration and “Use the
calendar and scales to compare crops and plan their care.” Original
copy and all original assets remain intact. The title-plus-how-to composition
is new; no new gardening prose or illustrations were introduced.

## Evidence and scope

- [CHECKS.json](CHECKS.json): exact source and implementation hashes, all images
  loaded, paragraph preservation, native example values, text bounds, unchanged body size and 4.51 mm
  clearance above the footer.
- [PDF-CHECKS.json](PDF-CHECKS.json): four 185 × 240 mm pages, three complete
  paragraphs checked in their PDF rectangles, all native example labels/ratings,
  embedded fonts, unchanged first
  vegetable text and unchanged full-book source.
- [VISUAL-REVIEW.json](VISUAL-REVIEW.json): actual PDF visual coverage.
- [BROWSER-CHECKS.json](BROWSER-CHECKS.json): page/spread controls and image loading.

Source copy is read through `readBookContent` from shared book-layout JSON;
the current [one-page key](../guide-key/README.md) and existing section opener
provide the artwork and content. Canonical/shared JSON, the approved header
references and existing key/opener sources were unchanged by this focused proof.
The approved page is now included in the [full preview](../whole-book-order-preview/REVIEW.html).
This is a unit-neutral opener shown with the saved imperial Artichoke, Jerusalem spread.
It is a focused review proof, not a supplier file or a full-book integration.

The full-book integration uses blank 8 / this combined page 9, with both Guides
destinations at 9 and every crop folio retained. All 44 approved header treatments
are included in the same pass. These four pages remain the focused approval proof.

## Rebuild

With loopback Vite running, use `node scripts/build-combined-guides-opening.mjs`,
then `python3 scripts/review-combined-guides-opening.py` with bundled Python,
pypdf, pdfplumber and Poppler. Only the new page is rendered; the first vegetable
spread and the blank are reused from the current book. No catalogue export.
