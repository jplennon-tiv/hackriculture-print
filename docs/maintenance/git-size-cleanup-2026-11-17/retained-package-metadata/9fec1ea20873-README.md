# Photo-derived book illustrations — collection 01

Created 16 November 2026 at John's request. Eight new, separate illustrations for inner book pages, derived from his photographs and video stills. **New artwork candidates for review; no page replacements or production approval.**

[Browse the six-page catalogue](Photo-Derived-Illustrations-01.pdf) · [Download the artwork and sources](Photo-Derived-Illustrations-01.zip)

| File in `assets/` | Subject | Proposed role |
| --- | --- | --- |
| 01-pepper-harvest.png | Uneven pepper and chilli harvest | Compact header or end-of-section group |
| 02-peas-on-plant.png | Three closed pods on branching stems | Tall margin or title-page detail |
| 03-onions.png | Three onions with bent tops | Upright harvest group |
| 04-cabbage.png | Green cabbage with folded outer leaves | Corner or section-opening image |
| 05-potatoes.png | Six unequal freshly dug potatoes | Low header/footer harvest group |
| 06-carrots-and-beetroot.png | One horizontal carrot with a beetroot | Wide two-vegetable group |
| 07-garlic-pair.png | Opened and intact elephant-garlic bulbs | Compact corner detail |
| 08-chilli-plant.png | Fruiting chilli plant in its pot | Vertical growing-techniques illustration |

## Use and quality

All eight masters are transparent RGBA PNGs, copied verbatim from the generation outputs. No JPEG conversion, raster cleanup, sharpening or upscaling was applied. Landscape assets are 1536 × 1024 px; portrait assets are 1024 × 1536 px; cabbage and garlic are 1254 × 1254 px. At 300 dpi these full canvases allow approximately 130 × 87 mm, 87 × 130 mm and 106 × 106 mm respectively. Preserve the aspect ratio; allow surrounding space when placing tight silhouettes. Page positions above are suggestions.

The catalogue embeds the original RGB artwork pixels losslessly, retains alpha masks and enables PDF image interpolation. Only the source-photo previews are reduced for the catalogue; retained originals are unchanged. The drawings were compared against approved hero references at large and small scale and inspected on cream and forest green. The first potato attempt was rejected for eye-like marks and regenerated directly from the original photo; only the corrected version is in the usable set.

This is photo-derived illustration, not literal tracing: backgrounds and surplus crops are removed, shapes simplified, and hidden or cropped edges sometimes completed. Each intentional change is recorded in [ARTWORK.json](ARTWORK.json). No variety identification is inferred. Some files have negligible alpha=1 pixels at the canvas border; solid silhouettes are fully contained, and visible backgrounds were checked.

## Source and recreation records

Four sources came from the newly imported Mac Photos collection (peppers, onions, potatoes and chilli plant); two came from mounted photo archives (carrot/beetroot and garlic); two are retained native video stills (peas and cabbage). All are John's own collection. No online pictures were required for this first set. The search was sampled, not exhaustive: Photos contact sheets 1–7 were reviewed, alongside garden archive thumbnails and earlier source-search selections. Unrelated Photos material and the temporary database copy were not retained with the collection.

- `sources/`: byte-exact selected original photographs and native video frames. The kitchen-cabbage photograph is an unused alternative, excluded from the portable download.
- [SOURCES.json](SOURCES.json): original locations, Photos identifiers where relevant, capture dates/video timestamps and SHA-256 checksums.
- `style-references/`: byte-exact copies of the approved hero art used directly for drawing style; these remain style references, not new deliverables.
- [ARTWORK.json](ARTWORK.json): source-to-illustration map, complete prompt, reference roles, dimensions, checksums, review and approval status.
- `recipes/`: all generation prompts and recorded outputs, including the replaced potato prompt.
- `review/`: first-pair comparison and eight-image cream/dark-green review.
- [CHECKS.json](CHECKS.json): file integrity, alpha, source checks and exact PDF-embedded RGB checks.
- [build_catalogue.py](build_catalogue.py): offline PDF builder. Run from this repository with the primary Python runtime; no web server or full-book export is used.

The master PNGs are the exact reusable artwork. Prompts and references support future derivatives but do not promise pixel-identical regeneration. Keep these masters intact and make future edits as separate revisions.

Existing October stock, approved hero originals, covers and book pages remain intact. Placement should be selected by John and checked in the actual target page when requested.
