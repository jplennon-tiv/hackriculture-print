# Cream cover — layered working master

Prepared 16 November 2026. This develops the cream trial from Version 1-1; the saved sage Version 1-1 is unchanged. The cast shadow beneath the bottom vegetables has been removed. This is a working master for review, not a new numbered design or a production-approved print cover.

## Open the artwork

- **Vegetable-Guru-Layered-Master.psd** — ten named, movable raster layers, readable by Photoshop-compatible editors. The wood texture uses Multiply blending. The composite preview and layer stack were independently decoded and checked.
- **Vegetable-Guru-Layered-Master.svg** — self-contained SVG with ten named groups/Inkscape layers. Paper colour and ribbon fill are native editable shapes; wood strength is independently adjustable. Raster photographs and graphic lettering are embedded. No fonts or external image links are required to open it.
- **Vegetable-Guru-Layered-Master.ora** — the same ten raster layers in OpenRaster format for compatible editors.
- **Layered-Master-Preview.png / .pdf** — the current cream proof. The PDF has a single 185 × 240 mm page, without print bleed.
- **assets/** — separate full-canvas transparent PNG components, plus the wood texture.

## Layer order

| Bottom to top | Component |
| --- | --- |
| 01 | Paper colour |
| 02 | Scrubbed wood texture — Multiply |
| 03 | Top vegetables, with restrained contact shadow |
| 04 | Bottom vegetables — no cast or contact shadow |
| 05 | Title artwork |
| 06 | Subtitle artwork |
| 07 | Author artwork |
| 08 | Yellow Organic ribbon and lettering |
| 09 | YouTube sticker |
| 10 | Traditional Measurements sticker |

The sticker shadows are retained so the stickers sit above the artwork. Lettering is preserved graphic artwork, **not live text**. In the PSD and ORA, recolour a component using the editor's usual layer tools; the SVG also exposes paper/ribbon fills directly. Separate ribbon lettering is in assets/ribbon-lettering.png.

## How the photographic detail is protected

The earlier mottling was present in the image pixels after successive generative edits; the saved PNGs were intact and a lossless PNG round-trip did not change pixels. The photographic restoration used the earliest, cleaner photographic source, rather than trying to hide the mottling by blurring it.

The restored cover is frozen as **sources/repaired-cover.png**. Layer construction copies its RGB pixels without resampling, sharpening or another generative redraw. Only small regions previously covered by the ribbon/stickers come from **sources/hidden-area-underlay.png**. They are reconstructed, not recovered camera pixels. These areas are documented in build-layers.mjs.

A background-removal image supplies **alpha only**; its generated RGB is discarded. The retained photographic RGB is applied beneath that transparency. Fully transparent pixels are zeroed to reduce file size. Sources, exact generation records and SHA-256 hashes are included. The bottom layer has no additional drop shadow. Some original fine roots, soil particles and natural skin markings remain deliberately.

Keep these original assets unchanged. Change composition, background colour, wood opacity and graphic placement in the layer files. Export each new proof directly from the master; do not send a flattened cover through another whole-image edit for a layout change. A genuinely new vegetable edit should produce a new component and a new source record.

## Rebuild and limits

Open/edit the PSD, SVG or ORA directly; no build is needed for that. For a deterministic rebuild, use Node 20.9+ with Sharp 0.35.4, then `npm run build` in this folder. build-layers.mjs reads the bundled source PNGs; layout.json holds the paper/ribbon colour and wood opacity. package-formats.mjs writes the PSD. package-delivery.py writes the PDF and ORA; it uses ReportLab. Source files and a complete checksummed manifest accompany the delivery.

The native photographic canvas remains **1100 × 1430 px**, about **151 dpi** at the book's 185 × 240 mm trim. Separating layers prevents further generative degradation; it does not create higher-resolution photographic detail. Pale photographic edge pixels are retained from the source and may need a separate edge treatment for a substantially darker background. Current cream output was inspected at full size. No back cover, book page, gardening data or saved numbered cover was changed.
