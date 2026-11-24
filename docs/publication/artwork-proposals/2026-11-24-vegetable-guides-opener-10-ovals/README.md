# Oval variations on selected A

24 November 2026. **John selected option 3; the folio version is in proposal 11.** John selected A from the preceding continuity study as the direction to develop, appreciating its simple photographic page and casual angled title. The selection is recorded in the sibling proposal 09 `SELECTION.json` and README. This is not approval to integrate a page into the book.

This experiment tests partially transparent oval backgrounds behind the title, behind the contents, or both. Ovals extend beyond page edges, echoing the existing crop-header circle/oval and the cropped oval on the Bean and Pea troubles page. They are real editable vector ellipses; the photograph has not been regenerated, retouched or enlarged.

| Trial | Title | Contents |
| --- | --- | --- |
| 1 | Dark green oval, 34% opaque, white lettering | Selected A's rounded dark panel, 84% opaque |
| 2 | Cream oval, 82% opaque, dark green lettering | Selected A's rounded dark panel, 84% opaque |
| 3 | Selected A's white title with no backing | Dark green oval, 84% opaque |
| 4 | Selected A's white title with no backing | Cream oval, 92% opaque, dark green list |
| 5 | Dark green oval, 28% opaque, white lettering | Dark green oval, 76% opaque |
| 6 | Cream oval, 82% opaque, dark green lettering | Dark green oval, 84% opaque |

Opacity means strength of the coloured fill: 34% opaque is 66% transparent. These are starting values for visual comparison, not production colour settings. The title oval is tilted by 3 degrees, following the lettering. The larger contents oval is cropped at the right and lower page edges; text stays in straight columns.

## Preserved design

- Exact selected A title sizes, 3-degree angle and placement, including the small terminal dot. The pale-title versions intentionally change the letter/dot colours for contrast.
- Exact selected A contents: all 44 names and folios, 9.75 pt, columns at 64/124 mm, first baseline 124 mm, 4.65 mm leading. No shrinking or deletion to fit the oval.
- Original native photograph from proposal 06, with the same full-bleed placement.
- 185 x 240 mm trim, 3 mm bleed, 191 x 246 mm media.
- No new heading, part number, folio or calendar added to these opener studies. The calendar discussion stays parked. No vegetable or Troubles page is changed.

All contents text bounds fit inside the ellipse with a 3 mm inset. The actual six PDF pages were rendered and visually inspected, including detailed checks of 1, 3 and 5. Names and folios are checked in exact reading order; embedded fonts and native image dimensions are verified. The PDF reuses one image object, keeping it compact without reducing image quality.

The photograph is still 1105 x 1423 pixels, approximately 146.93 ppi at full bleed. These are layout studies, **not 300 ppi production artwork or supplier-ready PDFs**. Original printer PDFs and approved masters are preserved.

## Files and sources

- `Vegetable-Guru-Oval-Contact-Sheet.jpg`: six labelled previews, read left to right, top to bottom.
- `Vegetable-Guru-Oval-Studies.pdf`: six individual full-size proposal pages, with numbered bookmarks.
- `build.py`, `CONTENTS.json`, `assets/`: self-contained editable source.
- `MANIFEST.json`: geometry, opacity settings, source hashes and checks.
- `assets/selected-A.pdf`: exact selected opener extracted from proposal 09.
- `assets/troubles-reference-p98.pdf`: exact ordered interior page 98, used only as a shape reference.
- `assets/09-leeks-native.png`: untouched source photograph, SHA-256 `9bbface5b946c7e128a645f8ff48e8e619c31510ee45bd84a1dcc71354ee5231`.

Run `build.py` with Python containing ReportLab, pypdf and Pillow. Its Poppler runtime path is configured near the top. It writes only within this proposal folder. The regular Nunito subset is sufficient for the unchanged contents; new preview labels use the fuller bold face.

John selected 3 and requested folio 7. See `../2026-11-24-vegetable-guides-opener-11-selected-3-folio/README.md` for the completed layout and the outstanding minimum-300-dpi requirement. The original six-option PDF remains unchanged as historical comparison.
