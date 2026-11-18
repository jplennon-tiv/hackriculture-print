# Front title, ribbon and spine study

[View the four-page wrap proof](https://chatgpt.com/library?file_id=libfile_fde3_f-2ba4603312788191a181012cf100e27a_968f6e806ba48191b80ffb1b7a35f663&account_id=personal).

18 November 2026. John settled the [fourth garden-grid rear](../rear-cream-harvest/photo-grid/revision-04/README.md) for this stage. This study pairs that panel with the [selected Original harvest front](../original-harvest-light-study/README.md). John subsequently liked the kerning and spine. The [follow-up ribbon comparison](../ribbon-colour-study/README.md) keeps that layout and uses the lightness of the original gold.

Pages 1–3 show the full trim-size wrap with the same title and spine. The ribbon fills are sunshine yellow (#FFE22B), beetroot (#702546) and forest green (#104C38). Page 4 compares each ribbon to the previous gold, then shows the previous and revised title at equal scale.

The selected front's title was one raster image. Its contours physically join at three places in “Vegetable”. The [lettering recipe](lettering.py) identifies the ink core of each glyph, separates the joins and uses the existing antialiasing. Each letter has its own position in the new SVG. The minimum horizontal ink gaps between adjacent letters in “Vegetable” are 7–8 native pixels. “The” and “Guru” are also re-spaced. A 5 px downward adjustment gives the capital G clearance below the descender above it. The ribbon keeps its original shape and lettering mask.

The proof panels measure 185 × 240 mm with a provisional 12.5 mm spine. This is a rounded design estimate from the previous 12 mm / 168-page physical proof scaled to the current 176 pages. Confirm the width and outer bleed from the supplier template for the final interior and stock. The spine reads from head to foot in Lilita One and Nunito Sans. Its cream wood uses the board at the fold. Shadows from the upper harvest and lower carrot fronds project down and left from the actual cutout silhouettes, blending with the existing casts at the fold.

On macOS use the project Node version on PATH and Python with Pillow, NumPy, ReportLab and pypdf. Run the [build script](build.py) from any directory. The optional `--spine-mm` argument sets the design width. It reads the existing rear 04 PDF. The [output folder](../../../../../output/pdf/front-spacing-and-spine/) holds the proof, self-contained sunshine-yellow front master and the separate letter-by-letter title SVG. The other ribbon variants regenerate from the three palette values in the builder.

Verification covered all four rendered pages. The source comparison limits front changes to the title, ribbon and fold-shadow regions and tests shadow coverage at both the upper and lower fold. The three wrap pages retain all seventeen rear image streams and the rear text. Rendering the first wrap at the rear panel's original page bounds reproduced the selected rear pixel for pixel at 127 dpi.
