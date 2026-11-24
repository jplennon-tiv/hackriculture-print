# Photographic opener and guide continuity

24 November 2026. **John selected A for further development.** No book integration or supplier change.

John asked to park the calendar and explore how the selected photographic title page could belong to the same book as the opening vegetable guide pair. The emphasis is on adapting the opener, with a bounded guide redesign permitted as a comparison.

## Exact seeds

- Selected opener: 9A leek photograph, contents option B, contents shifted 4 mm left. Recovered unchanged as `assets/selected-opener.pdf` from the previous remote proposal. Its self-contained source package is restored in the sibling `2026-11-24-vegetable-guides-opener-08-left-shift-calendar` folder. The calendar remains parked; that builder was not run.
- Actual ordered guide spread: physical pages 8-9, **Artichoke, Globe**, extracted without redesign from `output/pdf/bookvault-quality-restored-2026-11-23/Vegetable-Guru-Interior-Original-Margins.pdf` into `assets/ordered-artichoke-p8-9.pdf`.
- Editable/searchable reference: PDF pages 10-11 of the 178-page reading book, retained in `assets/native-artichoke-p8-9.pdf`. This is supplementary; the comparison uses the ordered guide appearance.
- Photograph: unchanged native `09-leeks-native.png` from proposal 06, 1105 x 1423 pixels. Approximately 146.93 ppi at full bleed, **not yet 300 ppi artwork or a production-ready file**.
- Typography and colours: the existing Lilita One / Nunito Sans family and the book design system. All 44 crop names and current folios come from the prior verified contents proposal. Canonical gardening JSON was not read or modified for this design exercise.

## Ideas

| Code | Opener treatment | Guide treatment |
| --- | --- | --- |
| A | White title tilted by 3 degrees, pale terminal dot, rounded translucent dark contents panel | Exact ordered pages unchanged |
| B | Original straight white title, pale cream contents card and green type, small contents heading | Exact ordered pages unchanged |
| C | Cream heading band, green angled title and dot, small PART 1 label; photograph below | Exact ordered pages unchanged |
| D | Dark ribbons behind the opener title, pale contents card | Dark ribbons behind both crop-name headings only |

John selected A because it combines the photographic opener's simplicity with the guides' casual angled titles. The new oval experiments continue separately in `../2026-11-24-vegetable-guides-opener-10-ovals/`. B, C and D remain unselected comparisons. The earlier recommendation printed on the frozen comparison board is historical, not the current selection.

The guides' category colours are retained. The opener uses a general house palette, not the leek's Onion Family colour; the section contains every crop family. The crop calendars, instructional diagrams, variety information and all advice stay in place. Parking the separate calendar discussion does not mean removing the calendars already in the guides.

## Review files

- `Vegetable-Guru-Continuity-Studies.pdf`: four landscape comparison boards. Each shows page 7, then the actual facing guide spread on pages 8-9. The gap means **turn the page**, not a three-page spread.
- `Vegetable-Guru-Continuity-Page-Proofs.pdf`: twelve individual full-size pages, ordered A opener/guide pair, then B, C and D.
- `Vegetable-Guru-Continuity-Openers.pdf`: just the four opener proposals.
- `Vegetable-Guru-Continuity-Contact-Sheet.jpg`: two-by-two opener comparison.
- `build.py`, `CONTENTS.json`, `assets/`: self-contained editable layout source and exact reference extracts.
- `MANIFEST.json`, `CHECKS.json`: source hashes and targeted checks.

Each opener has a 191 x 246 mm media box, 185 x 240 mm trim and 3 mm bleed. The photograph and typography remain separate. Rounded contents panels still enter from the right edge and retain the 4 mm leftward shift. B/D move the list down 6 mm to make room for the contents heading. C's cream heading band intentionally replaces the photograph in the upper part of the page. D's guide title masks are local screen-layout patches, not production source edits; its surrounding illustrations and body remain exact. No approval to use any proposal is implied.

Run `build.py` with the bundled Python containing ReportLab, pypdf and Pillow. The script uses the bundled Poppler path recorded near its top; update that runtime path if using another computer. It only writes inside this proposal folder. Sparse regular Nunito is the existing contents subset; new labels use the fuller bold face. The source proof text and image resolution limitations are preserved.
