# Personal introduction — page 7 preview

15 November 2026. John supplied the personal introduction and requested placement and a preview after accepting a light editorial pass. This working page replaces the earlier assistant-written draft. Layout awaits review; the assembled book and frozen original remain unchanged.

- [One-page PDF](../../../output/pdf/introduction-revision/Introduction-preview.pdf)
- [Actual PDF raster](../../../output/pdf/introduction-revision/Introduction-preview.png)
- [Editable wording](introduction.txt)
- [Offline renderer](build.swift)
- [Fit, font, text and visual checks](CHECKS.json)

336 words after the agreed light corrections: spelling of vegetables, punctuation, removal of one repeated mainstream sentence, alphabetic ordering qualified to vegetable guides, a parallel three-section sentence and a typographic sign-off dash. John's personal account, emphasis, humour and five-paragraph structure are retained.

The source comparison is the [approved Why Grow page](../topic-pages/techniques-expansion/WHY-GROW-APPROVAL.json). This revision intentionally replaces its old encouragement copy, three-column explanations and closing panel with John's continuous first-person introduction. Its approved harvest-bowl artwork is retained beside the heading at a smaller scale. Lilita, Nunito Sans, cream paper, green text, recto 17/8 mm margins and footer position carry forward the book design language. The body is 10.5 pt with 14.5 pt leading; folio 7 is retained. Page 6 remains blank; page 8 is not consumed. No unit-dependent wording exists, so the same preview serves both editions.

The Vite launcher failed with EPERM on loopback in this session. This bounded preview was generated offline using native CoreText/CoreGraphics, reading the existing local font files directly and embedding them in the PDF. Rebuild from the project root with `swift -module-cache-path /tmp/intro-swift-module-cache docs/publication/introduction-revision/build.swift`. Render that PDF with Ghostscript and refresh the verification receipt after any change. The renderer resets visual status to pending.

Inspected the actual PDF raster against the approved original and checked the page-6/page-7 pairing. All text fits and matches PDF extraction after normalising font ligatures, both font families are embedded, and the title, artwork, paragraphs, sign-off and footer are clear. This is a trim-size review proof, not a new supplier file. Future main-book integration must use this replacement rather than the older omitted `book-layout/introduction.json`.
