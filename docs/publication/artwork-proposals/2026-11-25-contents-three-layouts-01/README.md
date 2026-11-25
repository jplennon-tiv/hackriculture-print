# Contents — three layout studies

25 November 2026. **Option 3 and images A (chard) / B (aubergine) are selected.** John requested top-left / bottom-right placement. The [current diagonal-corner proof](../2026-11-25-contents-chard-aubergine-diagonal-04/README.md) is ready for review. This earlier study is retained as selection evidence; the example leeks/cabbage and large washed-oval treatment remain unselected.

`Vegetable-Guru-Contents-Three-Layouts.pdf` contains three facing spreads, one per PDF page, numbered 1–3. Each book page remains 185 × 240 mm; the outer grey surround, option labels and 6 mm centre gap are review furniture, not book content. `Contents-Three-Options-Contact-Sheet.jpg` compares the three spreads vertically. Individual spread previews are `Option-1-Spread.jpg` through `Option-3-Spread.jpg`.

1. **Curved photographic headers:** two shallow bands use existing camera frames 13 and 16 from the interior-title scouting. The headings sit on cream below the curves.
2. **Three section photographs:** leeks and damaged red cabbage occupy the upper areas; the selected old-jeans planting scene fills the space beneath the shorter Troubles list. These are the exact clean backgrounds chosen for the three section dividers, independently cropped with fully opaque vector masks.
3. **Outer-corner ovals:** smaller opposing leek/cabbage crops echo the introduction treatment. The left Contents heading moves into the clear space to its right.

The original 84 entries, page destinations, two-column lists, 10.5 pt Nunito Sans reading type, 25.5 pt Lilita One Contents headings, dotted rules and bold page numbers are preserved. Current printed folios are 2–3. Every label and destination was checked against the installed reading PDF, not inferred from the older source folios. The content positions are identical across the three proposals. No list rows flow around photographs.

## Editable components

- `Native-Contents.pdf`: transparent two-page native-text contents and folios, without pictures or Contents headings.
- `option-N/Photographs.pdf`: independent photographs and vector clips for each proposal.
- `option-N/Headings.pdf`: separate native Contents headings.
- The three-spread review PDF has five named optional-content layers: Paper, Photographs, Contents and folios, Contents headings, Review labels. Fonts are embedded; book text is not rasterised.
- `CONTENTS.json`: source snapshot with the documented two-page folio reduction, verified against the current book. This is a proposal input, not a new canonical data source.
- `build-native-contents.swift`: preserves the original CoreText layout and font weights. Run from the project root with `swift -module-cache-path /tmp/vg-contents-swift-cache ...`.
- `build-layouts.py`: lays out all three proposals and checks every entry against the installed book. Uses the primary Python runtime with Pillow, ReportLab and pypdf.
- `REVIEW.json`: source identities/hashes, clipping shapes, placements, embedded fonts and entry checks.

All original images remain intact. Camera-frame JPEGs under `review-assets/` are high-quality review derivatives; the source 4K PNGs are retained at the locations in REVIEW.json. The section backgrounds are reused without regeneration. The lower-resolution generated sources still require the standing detail/resolution checks and any necessary upscaling before an adopted printer export. No paid generation, upscaling, book integration or supplier upload was performed. The accepted introduction and title page are unchanged.
