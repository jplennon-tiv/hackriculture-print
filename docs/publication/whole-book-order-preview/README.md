# Current complete book preview

Updated 18 October 2026. [Browse the full book](REVIEW.html?revision=organic-copy-2026-10-18#spread=74)
or [open the PDF](../../../output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf).
The imperial preview contains **170 interior pages plus four cover leaves: 174 PDF pages**.
All approved reader edits and the approved Growing Techniques order are integrated;
review highlights are removed. This is the current screen proof, not a supplier upload.

John's final copy replacements for **Organic growing — The core ideas**, page 146,
are included for review. The introduction is shortened and all three advice
paragraphs replaced; diagram, closing box, type sizes and pagination remain.
[Focused copy and both-unit checks](../final-text-edits/README.md). Earlier approved
source pages remain intact.

## Current placement

| Interior pages | Content |
| --- | --- |
| 1–2 | Title and publication details |
| 3 | Blank |
| 4–5 | Illustrated contents, facing |
| 6–7 | Blank / Introduction — why grow your own |
| 8–9 | Blank / combined Vegetable Guides and how-to |
| 10–97 | All 44 vegetables, two facing pages each |
| 98–99 | Blank / Vegetable Troubles opener |
| 100–144 | Fourteen Troubles guides |
| 145 | Growing Techniques opener |
| 146–147 | Organic growing / Nutrient cycles |
| 148–149 | Crop rotation & planning |
| 150–151 | Approved blank / Planning your plot |
| 152–153 | Beds and paths |
| 154–155 | Making compost |
| 156–157 | Dig or No-Dig: choosing / no dig |
| 158–159 | Digging parts 1 and 2 |
| 160–161 | Sowing and planting / Watering |
| 162–163 | Approved blank / Greenhouses introduction |
| 164–165 | Greenhouse growing options and seasons |
| 166–169 | Index |
| 170 | End balancing blank |

PDF page = interior folio + 2. Section openers remain recto at 9, 99 and 145.
The contents face at 4–5. Blanks 150 and 162 were explicitly approved with the
[section sequence](../techniques-sequence/APPROVAL-2026-10-18.json).

## Included approvals

- All [reader edits approved 16 October](../reader-edit-pass/APPROVAL-2026-10-16.json):
  the calendar key, eight vegetable guides, Onion & Leek Troubles, compost,
  sowing and greenhouse explanations, and five index routes. Their original
  one-page rotation is superseded by the approved expanded spread.
- The [two-page rotation](../topic-pages/crop-rotation-planning/APPROVAL-2026-10-18.json)
  and [one-page nutrients](../topic-pages/nutrient-cycles/APPROVAL-2026-10-18.json),
  placed in the [approved section order](../techniques-sequence/APPROVAL-2026-10-18.json).
- All earlier approved headers, two-page carrot/onion/tomato layouts,
  combined opener, navigation labels, flowing technique headings,
  publication page and back-cover wording. G2 front and B5 back remain.
  Missing copyright year, imprint, ISBN, edition and publication year remain placeholders.

Contents retain their simple two-page structure, illustrations and 10.5 pt rows,
with **81 destinations**. The gap above the lower illustrations is reduced from
8 to 3 mm to accommodate the new entry. The four-page index retains 9.45 pt type
and now has **286 entries and 35 see references**: all previous entries plus eight
useful nutrient-page terms. Both units resolve to the same folios.

The 74 crop-specific links still lead only to pages explicitly naming that crop.
Repeated section names are printed once within each footer to keep the extra
references readable. Contents, index, crop links and the three explicit topic
cross-references are clickable inside the PDF.

## Sources, checks and limits

[CHECKS.json](CHECKS.json), [PAGE-MAP.json](PAGE-MAP.json),
[NAVIGATION-PDF-CHECKS.json](NAVIGATION-PDF-CHECKS.json),
[SEQUENCE-CHECKS.json](SEQUENCE-CHECKS.json) and
[VISUAL-REVIEW.json](VISUAL-REVIEW.json) describe the current output and coverage.
The [integration receipt](integration-2026-10-18/INTEGRATION-CHECKS.json) checks every
reused page body against its exact source, including glyph coordinates, type sizes
and image counts, plus embedded fonts and actual link destinations. The previous
166-page interior is preserved in [baseline.pdf](integration-2026-10-18/baseline.pdf).

No guide export or canonical gardening JSON change was made. The
[book-copy transaction](integration-2026-10-18/BOOK-COPY-UPDATE.json) records the
contents/index updates and exact-byte backup. Approved source PDFs, manuscripts,
A4 originals and previous approvals remain intact. Old dates and folios in frozen
proofs identify those historical sources; they are not current instructions.

Full assembly remains imperial. Metric contents/index references are checked;
metric full-book integration, print-resolution output, stock, supplier preflight,
final cover wrap and physical proof remain future production work. Current page
count does not validate the old cost or spine calculations.

## Rebuilding after an authorised change

Start the app through `start.command` on loopback, using the pinned Node runtime.
Then run:

```sh
npm run book:preview
```

This validates book copy, builds both contents proofs and the current four-page
index, refreshes reference footers, assembles approved bodies and renders the
complete facing-page viewer. It never exports the vegetable catalogue.
Inspect changed pages and update the visual receipt after a rebuild.

For changes to the final Organic growing draft, first run
`node scripts/build-final-topic-edits.mjs`, then `npm run book:preview`.
The final-copy manifest binds the working copy and both-unit PDFs to their exact
sources. Stale or changed inputs fail rather than silently restoring older text.

The component commands are `npm run book:contents` and `npm run book:index`.
`integrate-approved-book.py` performs native PDF assembly and verification;
`check-book-navigation.py` independently reopens its links;
`review-whole-book-preview.py` builds page images and the viewer.
Use the bundled Python/Poppler runtimes documented in SETUP.

The old `prepare-whole-book-preview.mjs` and `assemble-whole-book-preview.py`
execution paths are retired and stop with a redirect. `book:build`,
`book:entries` and `book:guide-key` retain earlier standalone compositions;
they do not rebuild the current combined opener or full book. Future content
changes need new approved component inputs, not edits to frozen references.
