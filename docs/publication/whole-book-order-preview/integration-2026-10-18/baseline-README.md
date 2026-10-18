# Whole-book preview

Updated 15 October 2026 with the approved vegetable headers and combined
Vegetable Guides/how-to page, retaining all earlier approved changes.
[Browse the complete book](REVIEW.html?revision=headers-opening#spread=5) or
[open the PDF](../../../output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf).

The imperial preview has **166 interior pages plus four cover leaves: 170 PDF
pages**. All 44 vegetable guides now occupy facing two-page spreads. The approved
publication and back-cover wording is included, retaining missing metadata as
placeholders. Contents, index and crop-specific links have refreshed page numbers.
The selected G2 front, preferred B5 composition, simple illustrated contents,
combined Guides/how-to page, section labels and approved flowing technique headings remain.
All review highlights and their viewer controls are removed.

## Current placement

| Interior pages | Content |
| --- | --- |
| 1–2 | Title, publication details |
| 3 | Blank placing the contents on facing pages |
| 4–5 | Illustrated contents, facing |
| 6–7 | Blank / Introduction — why grow your own |
| 8–9 | Blank / combined Vegetable Guides and how-to |
| 10–97 | All 44 vegetable guides, two pages each |
| 98–99 | Blank / Vegetable Troubles opener |
| 100–144 | Troubles guides |
| 145 | Growing Techniques opener |
| 146–149 | Organic growing, plot location, Beds and paths |
| 150–153 | Dig or No-Dig cultivation pages |
| 154–155 | Compost spread |
| 156–158 | Rotation; sowing and planting; watering |
| 159–161 | Greenhouses |
| 162–165 | Index |
| 166 | End balancing blank |

Vegetable Guides and its how-to share recto page 9, facing blank 8.
Introduction 7, Troubles 99 and Techniques 145 are also recto.
Crops open verso. Interior blanks are 3, 6, 8, 98 and 166; cover leaves are counted
separately. PDF page = interior folio + 2. The welcome page remains omitted.

## Approved material integrated

The [approved header treatment](../vegetable-header-review/APPROVAL.json) is
applied to all 44 vegetable openings. Harvest Seasons normally ends 20 CSS px
before the shaded circle, moving right when the title needs clearance; Difficulty
ovals match their page paper. Only the header regions are newly rendered. Every
guide body, continuation page, table and body text size is preserved.

The [approved combined opener](../combined-guides-opening/APPROVAL.json) is reused
from its frozen PDF at page 9, facing blank page 8. It includes the stronger peach
panel, centred orange heading, native readable examples and the final removal of
the Water stripe. Both Guides contents destinations and bookmarks now lead to 9;
all crop and subsequent folios remain unchanged. The preceding full book is
preserved as the [integration baseline](integration-headers-opening-2026-10-15/BASELINE.json).

The [carrot/onion approval](../vegetable-two-page-review/APPROVAL.json) and
[tomato approval](../tomato-two-page-review/APPROVAL.json) bind the exact both-unit
PDFs and sources. Their approved pages are split without reflow and reused through
[APPROVED-GUIDES.json](integration-2026-10-15/APPROVED-GUIDES.json). New folios are
carrot 14–15, onions/shallots 66–67, greenhouse tomato 82–83 and outdoor tomato
84–85. Body font size and leading are unchanged. All pest and variety rows,
planting drawings and measurements remain; the permitted table-removal fallback
was not needed. The eight new pages replace twelve old guide pages and four
alignment blanks. Historical highlighted trial reviews remain intact.

The [navigation approval](references/navigation-approved-2026-10-15/APPROVAL.json)
and [technique-heading approval](references/technique-headings-approved-2026-10-15/APPROVAL.json)
remain the source decisions. The combined Growing guide/crop heading is retained
on each second page; the four replacement headings are reused directly. Every
“See also” destination still explicitly names the crop in a compatible context.
There are 55 links on 36 second pages, with eight crops having no qualifying link.
The edition statement appears once on publication page 2. All 160 eligible
footers carry the common section label and folio.

The sixteen technique pages retain green 31.5 pt topic names and orange 22.5 pt
qualifiers, with a common running title within each set. Thirteen headings fit
one line; plot location and both Beds and paths pages need two. Approved topic
body text and illustrations are preserved.

The [approved publication/back-cover prose](../publication-copy/README.md) is
placed in the publication page and B5 cover. Copyright year, imprint, ISBN,
edition and publication year remain placeholders. B5's original image is intact;
a [recorded image edit](../publication-copy/integration/ARTWORK.json) clears the
placeholder paragraph in a separate derivative, with native editable text on top.
Its title, guide count, collage, £17.50 and barcode reservation are retained.
Production-grade exact page crops and editable remaining cover lettering are
still separate work.

## Evidence and limits

[CHECKS.json](CHECKS.json), [COMPONENT-CHECKS.json](COMPONENT-CHECKS.json),
[NAVIGATION-PDF-CHECKS.json](NAVIGATION-PDF-CHECKS.json),
[VISUAL-REVIEW.json](VISUAL-REVIEW.json) and [PAGE-MAP.json](PAGE-MAP.json)
identify the exact outputs and coverage. The latest [integration checks](integration-headers-opening-2026-10-15/INTEGRATION-CHECKS.json)
verify 188 source/reference hashes and embedded fonts in all 44 headers.
The preceding [two-page integration checks](integration-2026-10-15/INTEGRATION-CHECKS.json)
remain as historical evidence.

The assembly checks all 133 reused guide body pages against their actual source
PDFs, including the eight approved replacement pages; only original footer and
recorded heading replacements are excluded. All seventeen additional topic bodies,
component text blocks, 80 contents destinations, 484 numeric index references and
371 internal index links are checked. The index has 273 entries and 33 see references.
Contents PDFs and all 44 header measurements are checked in both units. The approved
combined opener is unit-neutral. The full book remains
imperial only. The current visual receipt lists the actual pages inspected;
rendering every page is not a claim of fresh visual review of every unchanged guide.

Canonical gardening JSON and shared book-copy JSON remain unchanged during this
integration. Original approved A4/compact sources and the preceding 174-page
[heading proof](../../../output/pdf/whole-book-order-preview/references/technique-headings-approved-2026-10-15.pdf)
are preserved. No full-catalogue export was made. Ordinary individual-guide exports
still need reconciliation with the approved presentation drafts before future
collection regeneration. This screen derivative is not a supplier upload;
production resolution, metric integration, stock, preflight and cover wrap remain
separate work. Design approvals do not imply final full-book or supplier approval.

## Rebuilding after an authorised change

Use the loopback app via `start.command` and the pinned Node runtime. Approved
trial inputs are hash-bound; do not edit or regenerate them casually.

```sh
python scripts/prepare-approved-two-page-guides.py
npm run book:check
npm run book:contents
node scripts/build-approved-book-headers.mjs
node scripts/build-book-back-cover.mjs
node scripts/prepare-whole-book-preview.mjs
node scripts/build-book-index.mjs --plan=docs/publication/contents-update/ASSEMBLY-PROPOSAL.json --topic-map=docs/publication/contents-update/TOPIC-FOLIOS.json --review-dir=docs/publication/whole-book-order-preview/index --output-dir=tmp/pdfs/whole-book-order-preview --start-page=162 --integrated --book-pdf=/output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf
```

The combined opener is reused from its frozen approved PDF; do not rebuild it
as the earlier standalone guide key. The header builder preserves the current
guide bodies and applies only the approved header rule. Keep its saved inputs
and the integration baseline available.

Use bundled Python/Poppler for `check-updated-contents.py`,
`assemble-whole-book-preview.py`,
`check-book-navigation.py` and `review-whole-book-preview.py`, in that dependency
order. Inspect changed pages and viewer controls before updating visual evidence.
Run the focused contents/index/navigation tests when changing their logic.
The contents plan owns folios; stable source identities drive index and links.
Do not patch generated PDFs as source copy or regenerate all guides for assembly.
