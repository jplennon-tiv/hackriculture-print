# Whole-book order preview

Prepared on 12 October 2026 for John to settle page order before refining the
contents. [Browse every facing spread](REVIEW.html) or
[open the complete PDF](../../../output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf).

The imperial preview contains **170 interior pages plus four cover leaves**:
selected G2 front, blank inside covers and preferred B5 back. All 44 vegetable
guides, 14 Troubles guides, seventeen approved additional pages and the approved
four-page index are included. This is a proposed order, not a new content approval
or a Bookvault upload file.

## Order to review

| Interior pages | Content |
| --- | --- |
| 1–3 | Title, publication details, welcome and current author biography |
| 4–6 | Current three-page contents proposal |
| 7–8 | How to use the book |
| 9 | Why Grow Your Own |
| 10–105 | Vegetable guides and four proposed blanks |
| 106–150 | Troubles guides |
| 151–154 | Organic growing, plot location, beds and paths |
| 155–158 | Cultivation: comparison, no-dig, digging and smothering |
| 159–161 | Greenhouses |
| 162 | Rotation |
| 163–164 | Compost |
| 165–166 | Watering, sowing and planting |
| 167–170 | Index |

Even folios face the following odd folio. The present plan puts How to use 7–8,
Beds 153–154, Digging 157–158 and Compost 163–164 across page turns. Two proposals
are flagged in the browser, but **neither is applied**:

- Move Why Grow to 7, making How to use a facing spread at 8–9 without adding pages.
- Add one page before Growing Techniques, potentially a section opener. This
  would make the three technique pairs face; it would also move the index to
  168–171 and require reconsidering the final balancing page and total count.

The four blank rectos at 17, 71, 89 and 93 preserve verso starts for every crop.
Their retention remains a proposal. Agree order and blank policy before updating
the assembly plan, contents and index again.

The contents need further work. In particular their watering label still says
“Water the roots, not the calendar”, while the approved page reads “Water the
roots, read the soil”. The preview preserves both pending that focused edit.

## Sources and checks

[CHECKS.json](CHECKS.json), [COMPONENT-CHECKS.json](COMPONENT-CHECKS.json) and
[VISUAL-REVIEW.json](VISUAL-REVIEW.json) record exact coverage. [PAGE-MAP.json](PAGE-MAP.json)
maps every PDF leaf to its source and proposed folio. PDF page = interior folio + 2.

- Reuses all 137 guide content pages from the saved imperial screen book;
  no crop or Troubles export. Only their footer text objects are replaced.
  Every guide's body text matches its source through 228 mm from the top.
- Relocated opening/how-to/topic derivatives have the current physical gutters
  and folios. The latest shared author text is included. All seventeen topic
  pages retain the text of the frozen approved PDFs; 365 measured text blocks
  are checked in the assembled PDF. Fonts and illustrations are preserved.
- The latest three contents pages are reused unchanged; 78 destinations agree
  with the plan. The separate integrated index retains 273 entries and 33 see
  references, resolves 488 numeric references, and has 371 internal PDF links.
  Temporary T/C labels and their explanatory review legend are replaced by real
  folios in this derivative only. The approved index proof remains intact.
- All 174 PDF pages are rendered. Visual inspection covers every new or relocated
  interior page, both covers, representative guide pages and key actual facing
  spreads. This is not a fresh visual review of every saved guide page.
- Thirteen focused content/contents/index tests passed. All protected source
  hashes and shared book-copy hashes remain unchanged.

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
node scripts/build-book-index.mjs --plan=docs/publication/contents-update/ASSEMBLY-PROPOSAL.json --topic-map=docs/publication/contents-update/TOPIC-FOLIOS.json --review-dir=docs/publication/whole-book-order-preview/index --output-dir=tmp/pdfs/whole-book-order-preview --start-page=167 --integrated --book-pdf=/output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf
```

Then use the bundled Python runtime for `scripts/assemble-whole-book-preview.py`
and `scripts/review-whole-book-preview.py`, with the bundled Poppler wrapper on
PATH for rendering. The first checks and assembles; the second renders and creates
the facing-page browser. Update the visual receipt after inspecting the actual
result. Folios in these scripts are bound to this proposal: adjust them together
with the plan if John changes the order. Approved sources and earlier whole-book
PDFs must remain intact.
