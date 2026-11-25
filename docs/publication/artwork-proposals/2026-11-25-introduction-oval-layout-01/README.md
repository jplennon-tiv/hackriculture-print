# Introduction — two-photo oval trial

25 November 2026. **Accepted by John without changes**, printed folio 5 at 185 × 240 mm. The exact accepted PDF, preview and layer hashes are frozen in `APPROVAL.json`; the artwork files remain byte for byte unchanged.

The tomato-harvest camera still sweeps in from the top right; the approved restored 1991 first-garden photograph sweeps in from the bottom left. Both are fully opaque and clipped by independent, smooth, asymmetric vector ovals. The third photograph (the seated pause on the plot) is deliberately omitted as requested. The cream paper and green native typography carry forward the introduction’s existing style.

All five approved prose paragraphs and the sign-off are preserved verbatim from `docs/publication/introduction-revision/introduction.txt`. Nunito Sans remains 10.5 pt with 14.5 pt leading; line widths follow the photograph curves with clearance. The title uses Lilita One. The running book-name footer is omitted because its usual position is now occupied by the lower photograph; printed folio 5 is retained at lower right.

Captions sit on the cream page beside the photographs, outside the photographic crops:

- “Still from the author’s YouTube channel 2026”
- “The author’s first food garden, 1991.”

**Author’s** is the singular possessive in both captions. **Authors’** would refer to several authors.

## Files and editing

- `Vegetable-Guru-Introduction-Oval-Trial.pdf`: one-page, seven-layer master and review PDF.
- `Vegetable-Guru-Introduction-Oval-Trial.png`: screen preview.
- `Overlay-Native-Type.pdf`: transparent heading, prose/sign-off, captions and folio, with no photographs.
- `layers/`: independent Paper, Tomato portrait, 1991 garden, Heading, Introduction and sign-off, Photo captions, and Folio PDFs.
- `Layout.json`: image origins/hashes, unchanged full-pixel image dimensions, photo placement, vector clipping paths, font sizes and per-line text positions.
- `Introduction-Text.txt`: exact approved text used in this trial.
- `build.py`: reproducible local layout builder. Dependencies: Pillow, ReportLab, pypdf; use the project’s primary Python runtime. Font and original-image paths are in the builder and Layout.json.
- `CHECKS.json`: full-text, caption, native-font, layer, image-count and trim checks.

The photos are embedded independently of the native text and may be replaced at the same placement without upscaling or rasterising the lettering. The camera still is about 560 ppi and the restored historical photograph about 336 ppi at their placed sizes; these figures measure pixels, not the authenticity or detail of the earlier restoration. No new retouching, image generation or paid enlargement has been performed.

The page is a trim-size experiment, not a printer upload. Preserve the original source photographs and the ordered Bookvault files. If adopted, inspect photographic detail and prepare the supplier bleed/colour export; the standing pre-print rule requires adopted low-resolution artwork to be upscaled and verified at minimum 300 ppi before upload.
