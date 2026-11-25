# Interior title — fresh actor redraw

25 November 2026. John accepted the corrected wheelbarrow form but found his face and body odd, and requested a fresh reconstruction using original artwork and the established likeness rules. This version uses original D for composition, the real wheelbarrow camera frame for proportions and action, J01 for clothing/build, FACE-FRONT for facial identity, and LOOKDOWN for the lower-face profile. This is a fresh photo reconstruction, awaiting John's review. The figure and barrow are somewhat nearer/larger than original D; the lettering remains clear.

The selected title/oval design is unchanged: Pale sage option 4, Cropped sweep shape 6 and white lettering enlarged by 10%. `Layered-Master.pdf` retains seven independent PDF layers: background, contrast shading, oval, title, subtitle, author and edition/copyright. All lettering remains native embedded font text. `Background.png` is the new clean photograph; `Overlay-Native-Type.pdf` is the unchanged combined transparent foreground, and `layers/` contains separate component PDFs. The exact font subsets and full font sources are included. `Preview.png` is a flattened viewing aid only.

The original pre-repair background and selected layout are preserved in `Sources/`. Actual generation references are included in `References/`, and `MANIFEST.json` records their roles. The user has not yet selected this fresh likeness.

To replace only the photograph, with Python plus Pillow and pypdf:

```sh
python3 replace_background.py Layered-Master.pdf new-background.png new-page.pdf
```

The script preserves type, fonts, layers and image placement, refuses to overwrite earlier output, and checks aspect ratio. Add `--minimum-ppi 300` when preparing adopted artwork for printer upload. The current background is 1101 × 1428 pixels, about 151 ppi. It still requires upscaling and detail inspection before print. No paid upscale or production changes were performed.

Checks: content stream, text, embedded font programs and seven layer names match the previously selected layout. The revised actor and wheelbarrow were visually compared with camera references and the composed page inspected. Previous layer decomposition/recomposition checks remain applicable to the unchanged overlays.
