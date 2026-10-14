# Whole-book order preview

Updated on 14 October 2026 with John’s requested section order, before refining the
contents. [Browse every facing spread](REVIEW.html) or
[open the complete PDF](../../../output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf).

The imperial preview contains **176 interior pages plus four cover leaves**:
selected G2 front, blank inside covers and preferred B5 back. All 44 vegetable
guides, 14 Troubles guides, seventeen approved additional pages and the approved
four-page index are included, together with three new section openers. The requested order is applied; the new designs and copy are proposals, not a new content approval
or a Bookvault upload file.

## Current placement

| Interior pages | Content |
| --- | --- |
| 1–3 | Title, publication details, welcome and author biography |
| 4–6 | Three-page contents proposal |
| 7 | Why Grow Your Own |
| 8–9 | Blank verso / Vegetable Varieties opener |
| 10–11 | How to use the book, facing |
| 12–107 | Vegetable guides and four retained crop-alignment blanks |
| 108–109 | Blank verso / Vegetable Troubles opener |
| 110–154 | Troubles guides |
| 155 | Growing Techniques opener |
| 156–159 | Organic growing, plot location, beds and paths |
| 160–163 | Cultivation: comparison, no-dig, digging and smothering |
| 164–166 | Greenhouses |
| 167 | Rotation |
| 168–169 | Compost |
| 170–171 | Watering, sowing and planting |
| 172–175 | Index |
| 176 | End balancing blank |

How to use (10–11), Beds (158–159), Digging (162–163) and Compost (168–169)
now form actual facing spreads. The four crop-alignment blanks move to 19, 73,
91 and 95; every crop still opens verso. The two blank versos before the first
two openers keep those section titles recto and preserve the established guide
margins. The third opener already falls recto. End balancing makes an even interior.

The opener designs use the existing book fonts, cream paper, green/orange titles
and existing illustrations. Their new copy is editable in
[book.json](../../../../hackriculture-data/book-layout/book.json), under
`sectionOpeners`; [save receipt](SECTION-OPENERS-SAVE.json) records exact prior-byte
backups. [Artwork and composition record](SECTION-OPENERS.json) identifies all
sources and distinguishes accepted source artwork from these new placements.
No new images were generated. Contents now include all three openers and use
the approved watering title, “Water the roots, read the soil”. Further contents
refinement remains for John’s review.

The preceding 170-page preview is retained as an
[unchanged PDF](../../../output/pdf/whole-book-order-preview/references/order-170-2026-10-12.pdf),
with its [receipt](references/order-170-2026-10-12/CHECKS.json).

## Sources and checks

[CHECKS.json](CHECKS.json), [COMPONENT-CHECKS.json](COMPONENT-CHECKS.json) and
[VISUAL-REVIEW.json](VISUAL-REVIEW.json) record exact coverage. [PAGE-MAP.json](PAGE-MAP.json)
maps every PDF leaf to its source and proposed folio. PDF page = interior folio + 2.

- Reuses all 137 guide content pages from the saved imperial screen book;
  no crop or Troubles export. Only their footer text objects are replaced.
  Every guide's body text matches its source through 228 mm from the top.
- Relocated opening/how-to/topic derivatives have the current physical gutters
  and folios. The latest shared author text is included. All seventeen topic
  pages retain the text of the frozen approved PDFs; the measured text blocks
  are checked in the assembled PDF. Fonts and illustrations are preserved.
- The latest three contents pages are reused unchanged; 81 destinations agree
  with the plan. The separate integrated index retains 273 entries and 33 see
  references, resolves 488 numeric references, and has 371 internal PDF links.
  Temporary T/C labels and their explanatory review legend are replaced by real
  folios in this derivative only. The approved index proof remains intact.
- All 180 PDF pages are rendered. Visual inspection covers the three new openers, both-unit contents,
  representative relocated/guide pages, all four index pages and key actual facing
  spreads. Earlier cover checks remain recorded; unchanged covers and approved
  sources were hash-checked. This is not a fresh visual review of every saved page.
- Fourteen focused content/contents/index tests passed. All protected source
  hashes remain unchanged. The two authorised shared-copy documents have guarded save receipts.

The contents carry their approved-source harvest illustration. H5/H6 how-to,
H3 welcome and S1 author illustrations retain the earlier proposed allocation.
Introduction/publication placeholders and the raster B5 placeholder blurb remain.
Saved guide imagery is a screen derivative; final print-resolution production,
metric integration, pricing, spine and supplier preflight remain separate work.

## Rebuilding after an authorised change

Do not regenerate merely to resume. The current proposal is
[ASSEMBLY-PROPOSAL.json](../contents-update/ASSEMBLY-PROPOSAL.json), with
[TOPIC-FOLIOS.json](../contents-update/TOPIC-FOLIOS.json). Change its owning contents
builder if the order changes, then rebuild and verify both-unit contents before
assembling the requested edition. Source copy remains in the existing guarded
shared JSON and resource-library copy files; this preview introduces no new copy store.

With the normal loopback app running and the pinned Node runtime selected:

```sh
node scripts/prepare-whole-book-preview.mjs
node scripts/build-book-index.mjs --plan=docs/publication/contents-update/ASSEMBLY-PROPOSAL.json --topic-map=docs/publication/contents-update/TOPIC-FOLIOS.json --review-dir=docs/publication/whole-book-order-preview/index --output-dir=tmp/pdfs/whole-book-order-preview --start-page=172 --integrated --book-pdf=/output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf
```

Then use the bundled Python runtime for `scripts/assemble-whole-book-preview.py`
and `scripts/review-whole-book-preview.py`, with the bundled Poppler wrapper on
PATH for rendering. The first checks and assembles; the second renders and creates
the facing-page browser. Update the visual receipt after inspecting the actual
result. Folios in these scripts are bound to this proposal: adjust them together
with the plan if John changes the order. Approved sources and earlier whole-book
PDFs must remain intact.
