# Growing Techniques — layout experiments

24 November 2026. John selected **colour option 3, Pale sage**, then requested:

> No 3 is the one. Can we experiment a bit with the layout. There is a slight clash between the title and my image. We could try moving the title a bit. Also I'd like to experiment with different oval shapes.

**Follow-up:** [title 5 with oval 6](../2026-11-24-growing-techniques-title5-oval6-11/README.md) is now prepared under a stated contextual interpretation of John’s combination request; await his review. All six retain original drawing 7, the kneeling/planting photograph, its exact crop, pale sage `#DFE9D3` at 82% opacity, dark contents ink `#173E2C`, all 19 entries, six group headings and folio 145. The title position, font sizes and tilt vary; the contents retain the existing sizes and positions. The pale green title dot remains. Shapes are true ellipses cropped at the page edges.

| Option | Name | Change |
| --- | --- | --- |
| 1 | Lifted / broad oval | Title shifted up and left into a balanced block; existing broad oval retained. |
| 2 | Higher / flatter oval | Higher, tighter, level title; flatter lower arc reveals more of the bed. |
| 3 | Level / rounder oval | Level title comfortably on the left; rounder, centred cropped oval. |
| 4 | Lower / right offset | Title lowered into the left foliage; oval offset right, rising towards the right edge. |
| 5 | Raised / left offset | Raised title with gentle tilt; oval offset left, descending towards the right edge. |
| 6 | Inset / tilted oval | Compact level title inset on the left; true ellipse tilted clockwise by 14 degrees. |

The title from one option may be combined with the oval from another. Exact geometry is in `MANIFEST.json`; `build.py` is the reproducible native PDF source. The PDF has seven pages: one contact sheet followed by six full-size views, with bookmarks. `Growing-Techniques-Layout-Options-1-6.png` is the contact-sheet preview; individual renders are in `renders/`. The delivered PDF identity is recorded in `DELIVERY.json`.

Checks passed: complete extracted contents and folios; all fonts embedded; all body-text bounds and folio inside each oval with a 3 mm inset; labels and page ranges separated; decoded photograph pixels identical to the retained planting page. Visual review confirmed title clearance from John's portrait, clean oval arcs and legible contents.

This remains a separate trial, not production approval. No whole-book integration, ordered PDF changes, paid upscaling or printer upload. The photograph remains approximately 146 ppi. If adopted, produce/upscale and inspect it, then verify at least 300 ppi at final placement before any printer upload; changing DPI metadata alone is insufficient.
