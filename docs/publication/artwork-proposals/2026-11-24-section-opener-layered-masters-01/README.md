# Vegetable Guru — layered section-opener masters

24 November 2026. These are the three selected photographic opener trials:
Vegetable Guides (7), Vegetable Troubles (97), and Growing Techniques (145).
The Techniques layout uses title placement 5, oval shape 6 and pale sage colour 3.
John welcomed this combination. These base masters preserve the original selected
backgrounds. The subsequent [old-jeans and knee correction](../2026-11-24-growing-techniques-jeans-12/README.md)
is included separately in the source bundle and awaits review. No upscaling or
production integration is included.

## Five independent layers per page

| Layer | Saved form |
| --- | --- |
| Background | Original separate PNG, plus an image object in the layered PDF |
| Oval | Vector path with its original fill and opacity |
| Title | Native Lilita One font text and the small vector terminal dot |
| Contents | Native Nunito Sans font text, including entry page numbers |
| Folio | Native font text for 7, 97 or 145 |

Each section folder contains `Layered-Master.pdf`, with five named optional-content
layers; `Background.png`, with original pixels; `Overlay-Native-Type.pdf`, with
all foreground elements and no background image; four independent transparent
PDFs in `layers/`; the precise embedded font programs in `fonts-embedded/`;
and the original layout record, builder snapshot and plain text.

The preview PNG is a flattened viewing aid only. It is never the editable master
or an input for photographic correction. A PDF viewer that supports layers can
toggle them; other viewers may simply display the complete page. Native PDF text
is retained, not converted to outlines or embedded in the photograph.

`Fonts-Source/` retains the reusable Latin-character Lilita One and Nunito Sans font sources used in the
current Techniques workflow for future text changes. The PDF masters also retain
their exact original embedded font subsets; these contain the glyphs used by the
page. The local filenames `Nunito*.ttf` are project aliases for Nunito Sans.
Do not substitute a different face while updating an image.

## Correcting or upscaling a background

Work from the section's clean `Background.png`, never a page preview or flattened
PDF render. Keep its composition, orientation and aspect ratio. Save the new image
as a new file, preserving the original. To place it without changing any title,
overlay, contents or font program:

```sh
python3 replace_background.py techniques-145/Layered-Master.pdf new-background.png revised-page.pdf
```

The script requires Pillow and pypdf. It writes a new PDF and a JSON verification
record, refuses to overwrite earlier files, and rejects aspect-ratio differences
over 0.1% so an unexpected crop cannot silently distort the picture. A deliberate
new composition/crop requires separate review. The background's original placement
matrix is preserved exactly. The script verifies that the content stream, native
text, font programs and five PDF layers remain unchanged.

When preparing adopted artwork for print, add `--minimum-ppi 300` to enforce the
minimum effective resolution at its actual placement. Increasing a DPI metadata
tag alone adds no detail. An upscale must also be inspected for detail and AI
artefacts; colour/print preflight remains a separate later stage. Paid upscaling
is deferred, as agreed. Current images remain around 145–147 ppi.

## Preservation and verification

The layered versions are created directly from the selected PDFs' original image,
font and vector objects. All title, contents and page-number text is verified
identical, with the photo's decoded pixels and native font embedding preserved.
The complete layered pages and background-plus-overlay recompositions are checked
pixel-for-pixel against the selected pages at 1600-pixel renders. `MANIFEST.json`
and each section's `LAYERS.json` record exact sources, sizes, placement and checks.

`prepare_layers.py` is the project preparation script and uses the retained sibling
trial folders; the `Original-Builder.py` files are source snapshots, also dependent
on their original project folders. `replace_background.py` is self-contained apart
from its Python dependencies and works with this package alone. The separate layer
PDFs support native PDF editing even without the original project.

Original trials, ordered Bookvault files and production masters are preserved.
These layered files are working trial masters, not printer-ready exports.
