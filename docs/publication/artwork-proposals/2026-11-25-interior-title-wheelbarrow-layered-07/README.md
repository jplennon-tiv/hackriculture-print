# The Vegetable Guru — layered interior title page

25 November 2026. Selected layout: background D, Pale sage colour option 4, Cropped sweep shape 6 and 10% larger white lettering. John confirmed this combination. The background contains the second wheelbarrow-frame repair, made from the original selected artwork and a close camera reference. The first repair was rejected. This second repair is awaiting John's review; the trial has not been promoted to production.

## Independent layers

1. Background photograph
2. Text contrast shading
3. Pale sage oval
4. Main title (native Lilita One)
5. Subtitle (native Nunito Sans Bold)
6. Author (native Nunito Sans Bold)
7. Edition and copyright (native Nunito Sans)

`Layered-Title-Page/Layered-Master.pdf` has seven switchable PDF layers. Viewers without layer controls show the complete page. `Background.png` is the clean corrected image. `Overlay-Native-Type.pdf` contains all foreground elements and no background photograph. `layers/` holds seven separate page-sized transparent PDFs. The contrast shading uses a native PDF soft mask; preserve it with its layer. `Preview.png` is only a flattened viewing aid.

All lettering remains real PDF text, never painted into the photograph or converted into outlines. `fonts-embedded/` preserves the exact font subsets; `Fonts-Source/` supplies the full font files for future wording changes. Nunito filenames are project aliases for Nunito Sans. `Selected-Layout.json` records the chosen copy, sizes and coordinates. `Page-Text.txt` contains the complete wording; the existing year and ISBN placeholders are retained.

## Replace or upscale only the background

Requires Python with Pillow and pypdf:

```sh
python3 replace_background.py Layered-Master.pdf new-background.png new-title-page.pdf
```

The script refuses to overwrite existing output and checks aspect ratio, native text, embedded fonts, all layer names and the original placement matrix. The original uncorrected photo is retained in `Sources/Original-Background.png`; the selected layout before the photo repair is also preserved there. To return to that photo, use it as the replacement input. Keep corrected revisions separate.

The current background is 1101 × 1428 pixels, approximately 151 ppi at placement. Before printer upload of adopted artwork, upscale the photograph, inspect its detail, and use `--minimum-ppi 300` to verify resolution; changing DPI metadata alone is insufficient. No paid upscale or production integration occurred.

## Verification

The complete copy and embedded font programs match the selected page. Separating title and subtitle into their own layers causes no pixel change. The saved background and combined native overlay recompose to a pixel-identical page at the 1300-pixel review render. All seven layers are independent and the overlay contains no photograph. The generative photo repair is not claimed to be pixel-identical outside the wheelbarrow; compare the retained original when judging it. `MANIFEST.json` and `Image-Placement.json` record source identities, checks and resolution.
