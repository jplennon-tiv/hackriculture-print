# Selected B - small leftward move and calendar pairing

24 November 2026. Separate experiment following John's selection of 9A and overlay B.

## Requested refinement

John asked to move the contents block left by a small amount, then asked how this photographic treatment could connect with the following pages. He also reminded us that the original opener's calendar explanation needs a home.

The contents text and the panel's left edge move **4 mm left**. Its right edge still reaches the bleed edge, so the panel grows 4 mm wider there. Its top/bottom, opacity, colours, 44 entries, text sizes, line spacing and column gap are unchanged. The photograph and main title are unchanged.

- Original panel left edge: 61 mm from the bleed edge.
- Revised panel left edge: 57 mm.
- Original text columns: 68 / 128 mm.
- Revised text columns: 64 / 124 mm.
- Green remains #153e2a at 79% opacity; contents remains white Nunito Sans, 9.75 pt, with bold folios.

The numerical check compares all actual text words against saved positions from the selected B PDF: only contents words move, exactly 4 mm horizontally, with no vertical movement. The original embedded photographic image stream is byte-identical.

## Files

- Vegetable-Guru-9A-B-Left-4mm.pdf: the revised opener by itself.
- Vegetable-Guru-Calendar-and-Opener-Proposal.pdf: a proposed cream calendar page followed by the revised photographic opener.
- Vegetable-Guru-Calendar-and-Opener-Spread.png: trimmed facing-page view.
- build.py, CONTENTS.json, CALENDAR.json and MANIFEST.json: editable source, retained copy, geometry and checks.
- assets/: selected base page, original saved contents/calendar proof, extracted font subsets, native calendar diagram and selected B text positions.

## Calendar proposal

The diagram, month cells, runner-bean example, legend, wording and colour meanings are retained from the saved approved opener. The existing explanation is placed above the diagram, and its Reading the calendar heading is enlarged using the same Lilita face.

The native diagram is isolated in a derived PDF with old surrounding text removed before placement; hidden old contents and former folios are not carried into the new page's selectable text. No gardening data or legend colour has been changed. The source proof remains intact.

The pairing demonstrates a quiet cream information page opposite the full-bleed photograph. It is **not** a decision to insert a new page or alter pagination. Confirm that the existing facing page is available in the current desktop assembly before assigning a folio or integrating anything. If the existing blank facing page is available, it could accommodate this without adding pages.

An alternative, not drawn here, is to keep the key on the photographic opener: that would require a more compact three-column contents area and a lower calendar strip, covering more of the image.

## Continuity into the vegetable guides

Suggested direction for discussion:

1. Keep the full-page photographic treatment for section openings.
2. Retain the approved illustrated vegetable headers and technical diagrams on the working guide pages.
3. Use the existing Lilita One headings and Nunito Sans text consistently.
4. Keep category colours and calendar colour meanings; use the opener's deep green only for restrained navigation accents where appropriate.
5. Check the page turn into the first guide spread before making any guide-page changes.

The exact current Artichoke, Globe spread was not available in this remote workspace. The suggestions above follow the established design rules and preserved opener evidence, not a new visual approval of the first spread. No parked photographic-header trial was restarted.

## Geometry and limits

Both page PDFs use 185 x 240 mm trim, 3 mm bleed and 191 x 246 mm media. The cream calendar page uses the mirrored 8 mm outer / 17 mm inner text safety. The photographic image remains a roughly 147 ppi layout source; the previously recorded 300 ppi production-resolution step is still unresolved.

These are RGB proposals with live transparency. No CMYK conversion, production flattening, whole-book rebuild, supplier upload, order or production-source change was performed.

The desktop project is not mounted here. Preserve this folder as a new proposal when transferring it to:

docs/publication/artwork-proposals/2026-11-24-vegetable-guides-opener-08-left-shift-calendar/

## Rebuild

Run python3 build.py with reportlab, pypdf and PyMuPDF installed. All necessary assets and the reference text positions are included. The script writes only within this proposal folder.

