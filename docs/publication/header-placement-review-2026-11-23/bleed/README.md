# Header bleed correction components

23 November 2026. Components for the authorised header bleed correction. The assembled master and original production interior remain preserved; the parent production workflow owns integration and release checks.

[Two-page corrected sample](../../../../output/pdf/header-placement-review-2026-11-23/bleed/Vegetable-Guru-Practical-Headers-Bleed-Sample.pdf) · [Broad Bean before/after](comparison-folio-17.png) · [French Bean before/after](comparison-folio-19.png) · [exact checks](CHECKS.json).

## Diagnosis

The practical-page hero is not duplicated within the trimmed page. On folios **17 (Broad Bean)** and **19 (French Bean)** the original small illustration begins approximately 0.7–0.8 mm inside the top edge. Its true edge is plain background. The preparation's symmetric 3 mm bleed nevertheless reflected plant pixels from farther inside the page into the area above trim, making a second partial illustration visible when the entire PDF sheet is displayed.

The same condition occurs on all **44 practical guide pages, odd folios 9–95**, confirmed by inspecting their actual native bleed image strips: the boundary row is uniform but inward plant pixels were mirrored into the bleed. [Affected page list](AFFECTED-TOP-BLEEDS.json). Background colours vary by family and must be retained individually in any future rollout.

## Focused correction

The sample appends a matching opaque CMYK background rectangle **only above the TrimBox**, covering the reflected fragment. It spans the 191 mm media width and the 3 mm top bleed. Its PDF bounds are approximately `[0, 688.818898, 541.417323, 8.503937]` points (x, y, width, height), equivalent to media y = 243–246 mm. These two pages use CMYK `[0,7,29,0]`; no other colour conversion occurs.

All original image streams, native content and font resources are preserved. Original page scale, trim/bleed boxes and the exact embedded FOGRA39 output intent remain. The existing 0.2 mm perimeter repair inside trim is not changed.

Both actual before/after PDFs were rendered with explicit colour profiles at 254 dpi. **Zero pixels changed inside the trim area, and zero pixels changed below the 3 mm top bleed.** Enlarged comparisons were inspected: the reflected fragment is gone and the complete original hero remains. The red guide in each comparison marks trim and is not present in the sample PDF.

The reported screenshots also show reflected fragments on the main vegetable and Troubles pages: repeated leaves at the top/right and a notch where a circle was reflected. The original lower crop and decorative circle placement are preserved exactly; **no header redesign or repositioning is pending**. Our earlier interpretation of those original layout features as separate requested fixes was incorrect.

## Current outward continuation for main headers

The completed [v3 overlay set](native-outward-rollout-v3/MANIFEST.json) supplies all 44 opening-guide and 47 Troubles headers. The [v3 sample](../../../../output/pdf/header-placement-review-2026-11-23/bleed/Vegetable-Guru-Native-Outward-Bleed-sample-v3.pdf) shows Beetroot and Bean and Pea Troubles. Earlier samples and v1/v2 overlays are diagnostic checkpoints only.

`native-outward-bleed.py` extends the original outer/top/right clipping and full-page painted backgrounds in separate native derivations, retaining artwork transforms and header bottom/left limits. The genuine continuation is rendered at 600 dpi into explicit sRGB and the unchanged FOGRA39 relative-colourimetric conversion. Narrow 3.2 mm top/right CMYK strips replace the 3 mm bleed **and only the prior synthetic 0.2 mm trim-edge band**. Extending original background fills prevents a historical white canvas seam from reappearing. No source artwork or lettering is repositioned.

The [parent correction record](../README.md) owns the final 174-page integration and all 135 repaired-page checks. The original production PDF and master remain intact; no header redesign is pending.
