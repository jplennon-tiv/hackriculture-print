# Vegetable Guides — full-page title studies for 21 and 9

24 November 2026. **Separate proposals, not approved production pages.**

John ranked candidate **21 (red cabbage) first**, followed by **9 (leeks)**, and asked to expand both to full page with bleed, then compare white title arrangements with nothing else on the page.

## Review files

- [Six-page PDF with bleed](Vegetable-Guru-21-and-9-Title-Studies.pdf)
- [Comparison of the six trimmed page views](Vegetable-Guru-21-and-9-Title-Comparison.png)
- [Editable HTML layout sketch](REVIEW.html)
- [Measured artwork, PDF checks and hashes](ARTWORK.json)
- [Exact image-generation briefs and references](GENERATION.json)

| PDF page | Proposal | Arrangement |
| --- | --- | --- |
| 1 | 21A | Red cabbage; upper-left stacked title, 72 / 84 pt |
| 2 | 21B | Red cabbage; top-centred single line, 50 pt |
| 3 | 21C | Red cabbage; lower-right stacked title, 64 / 76 pt |
| 4 | 9A | Leeks; upper-left stacked title, 72 / 84 pt |
| 5 | 9B | Leeks; top-centred single line, 50 pt |
| 6 | 9C | Leeks; lower-right stacked title, 64 / 76 pt |

Every page contains only the photograph and **Vegetable Guides**, in plain white Lilita One. No contents, part number, folio, caption, coloured strip, gradient, title shadow or outline. Comparison-sheet labels are outside the pages and are not in the page PDF.

## Geometry and resolution

- Trim: **185 × 240 mm**.
- Bleed: **3 mm on all four sides**.
- PDF MediaBox and BleedBox: **191 × 246 mm**.
- PDF TrimBox: **185 × 240 mm**, inset 3 mm.
- The artwork covers the complete bleed rectangle. No crop marks, empty border or white edge.
- Title lettering is embedded native TrueType, with all necessary glyphs. It remains vector text at any print size.
- Recto text safety retains at least 17 mm from the binding trim edge; other text also remains comfortably inside trim.

**Resolution remains an open production issue.** A native 2400 × 3088-pixel redraw was requested, but the image service returned **1105 × 1423 pixels for both pictures**, about **146.93 ppi** at full-bleed placement. This is substantially more detail than the contact-sheet extracts but does **not** meet a true 300 ppi production target. Merely changing metadata or resampling does not resolve that limitation. These PDF pages intentionally retain the actual source pixels without pretending otherwise.

At 300 ppi, the full-bleed minimum is **2256 × 2906 pixels**. Bookvault's official guidance recommends 300 dpi at final printed size and 3 mm bleed:
- https://help.bookvault.app/what-dpi-should-my-images-be
- https://help.bookvault.app/what-is-bleed-and-why-do-i-need-it

The selected book stock remains 150 gsm coated. This is an RGB composition/layout proof, not final colour-managed supplier artwork. After artwork and layout approval, production preparation must use sufficiently detailed native masters and the project's approved ISO Coated v2 300% / FOGRA39 profile and established colour workflow. No PDF/X certification, Bookvault validation or supplier release is claimed here.

## Preserved sources and reproduction

The original generated files remain in ../generated_images relative to the project root. Exact paths and prompts are retained in GENERATION.json. Byte-identical local copies are in assets/21-red-cabbage-native.png and assets/09-leeks-native.png.

The selected contact-sheet crops remain untouched in the preceding 05-shortlist folder. A44 provided real allotment/netting context for 21; A43 provided real leek-bed context for 9. The images are generated photographic proposals, not new camera photographs.

build.mjs copies the native artwork and bundled web font, writes the HTML layout sketch and records the source measurements. build-pdf.py is the authoritative exact PDF layout source: it embeds original artwork pixels and native Lilita text, writes the page boxes and checks every page. The editable HTML sketch uses equivalent CSS arrangements, but its browser line metrics are not the authoritative PDF placement. build-comparison.mjs lays out the actual trimmed PDF renders.

The PDF font is a verified Lilita One TrueType subset extracted read-only from the existing docs/publication/key-risk-title-case/font-donor.pdf, resource /F4. All title characters are present. The full bundled WOFF2 and original OFL are retained beside it.

Rebuild only these proposals, using the existing runtime:
1. Run build.mjs with the bundled Node runtime.
2. Run build-pdf.py with the bundled Python runtime.
3. Render renders/trim-preview.pdf with pdftoppm -r 110 -cropbox -png to renders/page.
4. Run build-comparison.mjs.

## Review and boundaries

All six actual PDF pages were rendered and visually reviewed. Text is legible, clear of trim, and does not obscure the main cabbage head or leek stem. 21A gives the most prominent heading while retaining the central cabbage; 9C leaves the leek's tall upper leaf structure open. These are observations for comparison, not selections or approvals.

The six-page checks verify exact geometry, title-only text, embedded Lilita, and native image dimensions. No source was retouched or artificially sharpened.

**The ordered 174-page interior, ordered cover, editable book masters and approved sources are unchanged.** No full-book rebuild, integration, upload, order, cleanup or restart of parked work was performed. The second proof remains ordered; the new order number and delivery date are still unspecified.

