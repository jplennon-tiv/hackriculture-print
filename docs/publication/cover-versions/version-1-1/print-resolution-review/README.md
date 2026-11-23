# Approved cover print-resolution treatment · 22 November 2026

John authorised steps 1–5: recover the larger retained artwork, reconstruct front lettering as vectors, improve the cream wood, export a layered PDF, and provide a separate comparison. **John approved the corrected complete wrap, including the revised spine lettering positions, on 22 November 2026.** [Exact approval record](APPROVAL.json) · [Component preservation](PRESERVATION.md). John rejected the first traced lettering because its curves looked melted and its edges had notches. That version is retained under `rejected-trace-v1/` and must not be reused. The selected gold cover, assembled book and supplier files are unchanged.

[Open the delivered comparison PDF](https://chatgpt.com/library?file_id=libfile_fde3_f-993903570d308191a13ab0f1dde00107_968f6e806ba48191b80ffb1b7a35f663&account_id=personal).

[Eight-page comparison PDF](../../../../../output/pdf/cover-print-resolution-review/Vegetable-Guru-Cover-Print-Resolution-Comparison.pdf) · [Front proposal PDF](../../../../../output/pdf/cover-print-resolution-review/Vegetable-Guru-Front-Print-Resolution-Proposal.pdf) · [Rear proposal PDF](../../../../../output/pdf/cover-print-resolution-review/Vegetable-Guru-Rear-Print-Resolution-Proposal.pdf) · [Editable front SVG](Vegetable-Guru-Front-Print-Resolution-Proposal.svg)

The first two comparison pages show current/proposed panels at actual **185 × 240 mm** on A3 landscape. Print those pages at **100%**, without Fit. Pages 3–6 enlarge lettering, vegetables, badges and the Organic ribbon; pages 7–8 are clean proposed panels at trim.

## Changes and limits

| Component | Current export | Proposal |
| --- | --- | --- |
| Main front lettering, subtitle, author, ribbon wording | Raster, approximately 151 dpi | Actual Lilita One font curves for the main lettering; Arial Bold for the ribbon. Accepted horizontal letter boxes retained; title line clearance adjusted for the native g descender |
| Front badges | Raster, approximately 151 dpi | Actual Arial Bold font curves, geometric symbols and elliptical faces/rims; no traced lettering |
| Upper vegetables | Flattened into the 1100-pixel front | Original 1944 × 786 transparent source at approximately 293 dpi |
| Lower vegetables | Flattened into the 1100-pixel front | Original 1692 × 888 transparent source at approximately 240 dpi |
| Shared cream wood | Approximately 151 dpi | New fine-grain reference restoration, placed as four mirrored tiles at approximately 302 dpi |
| Sixteen rear photos | Approximately 350–468 dpi | Exact original JPEG streams, positions and crops preserved |
| Rear copy | Native PDF text | Exact original content stream and font resources preserved |

**The lower front photograph remains 240 dpi.** This recovers the approved source's real detail; it does not invent detail or claim that simple enlargement raises its native resolution. The old soft shadow masks retain their sampling and remain separate from the lettering and photographic detail. The wood's grain is intentionally finer. John approved the native font letterforms replacing the original generated raster lettering. The Organic ribbon and badges retain their distinct sans-serif treatment. In the title, Vegetable moves up 14 source-coordinate pixels (about 2.4 mm); Guru moves down 8 pixels and its height reduces from 168 to 160 pixels, keeping its lower edge and the subtitle in place. This leaves a clear gap beneath g. Badge reconstruction simplifies their shading.

## Provenance and reproduction

- Approved source: [selected gold cover](../selected-gold-cover/README.md), with the exact accepted title spacing, original gold ribbon `#F2CC35` and Original harvest arrangement.
- [SOURCE-LAYERS.json](SOURCE-LAYERS.json) records the 33 embedded source images extracted without alteration from that SVG. The larger upper and lower photo sources are layers 05 and 10.
- [VECTOR-CONVERSION.json](VECTOR-CONVERSION.json) records the actual fonts and geometry. [clean_type.py](clean_type.py) loads unmodified font curves using [font_outlines.c](font_outlines.c) and FreeType; [build.py](build.py) invokes that corrected route. Main type uses bundled Lilita One; ribbon/badge type uses macOS Arial Bold. Font outlines are copied without pixel tracing or curve smoothing. The original rejected tracer is historical evidence only.
- [Wood generation record](WOOD-GENERATION.json): `generated_images/exec-da46070f-f591-4dda-8b1a-11d774c0e028.png` at project root, copied without alteration to `assets/wood-restored.png`. The actual generated size is **1101 × 1429**, not the larger size requested in the prompt. Each placement covers **92.5 × 120 mm**, giving approximately 302 dpi. Mirrored placement keeps the adjoining texture edges continuous. This is a new texture treatment, not recovered photographic detail.
- [assemble.py](assemble.py) substitutes only the rear background XObject, verifies all sixteen protected JPEG streams, and assembles the comparison from native PDFs. [CHECKS.json](CHECKS.json) records output hashes, dimensions, source limits and unchanged-photo checks.
- Rendering uses local `rsvg-convert`; assembly uses the bundled Python runtime with ReportLab, pypdf and pypdfium2. No browser export or full-book regeneration is involved.

Rebuild in this order: `build.py`, then `assemble.py`, using the project Python runtime. Generated review files live only under `output/pdf/cover-print-resolution-review/`. The scripts never overwrite the selected gold master or assembled book.

## Approval and remaining scope

John approved the corrected native-font lettering, badge reconstruction, finer wood and repositioned spine in the complete wrap. Preserve this exact proof and its components. Installation into the book, final spine/bleed geometry and supplier preparation remain separate tasks.

## Combined cover wrap

[Open the delivered wrap proof](https://chatgpt.com/library?file_id=libfile_fde3_f-e62b78b925608191b87ea183c26de41a_968f6e806ba48191b80ffb1b7a35f663&account_id=personal).

John welcomed the corrected lettering and requested both covers together with the spine, then asked for the spine lettering to be moved clear of the shadow over his name. The revised [single-page wrap proof](../../../../../output/pdf/cover-print-resolution-review/Vegetable-Guru-Corrected-Cover-Wrap-Proof.pdf) measures **382.5 × 240 mm**: 185 mm rear, provisional 12.5 mm spine, 185 mm front. It uses the current corrected front and rear PDF panels directly. The spine's cream grain/shadows and native Lilita One/Nunito Sans fonts, sizes and tracking are retained. The title centre moves from 100 to **90 mm** below the top, and the author centre from 158 to **140 mm**. This leaves 6.6 mm between the lettering blocks and puts the complete author line above the lower leaf shadow.

[wrap.py](wrap.py) performs the assembly without rebuilding either cover panel. [spine-type-clear.swift](spine-type-clear.swift) makes the two positioning changes; the earlier spine script remains intact. The assembly preserves original spine image pixels, native panel content/resources and the front's transparency group. [WRAP-CHECKS.json](WRAP-CHECKS.json) records source hashes, actual glyph bounds and comparisons rendered on the same pixel grid. Compared with the previous delivered wrap, all changed pixels are confined to the old/new spine lettering area; both cover panels are unchanged. The completed PDF was visually inspected at full-wrap and enlarged-spine scales. The previous proof and its records remain in `output/pdf/cover-print-resolution-review/spine-position-before/`.

This approved design remains a **trim-only proof**. The 12.5 mm spine is provisional, bleed has not been added, and no selected master, book assembly or supplier file has been replaced.
