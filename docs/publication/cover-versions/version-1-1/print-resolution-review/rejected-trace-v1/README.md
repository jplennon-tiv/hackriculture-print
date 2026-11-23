# Cover print-resolution proposal · 22 November 2026

John authorised steps 1–5: recover the larger retained artwork, reconstruct front lettering as vectors, improve the cream wood, export a layered PDF, and provide a separate comparison. **This is a proposal for review, not an approved replacement.** The selected gold cover, assembled book and supplier files are unchanged.

[Open the delivered comparison PDF](https://chatgpt.com/library?file_id=libfile_fde3_f-993903570d308191a13ab0f1dde00107_968f6e806ba48191b80ffb1b7a35f663&account_id=personal).

[Seven-page comparison PDF](../../../../../output/pdf/cover-print-resolution-review/Vegetable-Guru-Cover-Print-Resolution-Comparison.pdf) · [Front proposal PDF](../../../../../output/pdf/cover-print-resolution-review/Vegetable-Guru-Front-Print-Resolution-Proposal.pdf) · [Rear proposal PDF](../../../../../output/pdf/cover-print-resolution-review/Vegetable-Guru-Rear-Print-Resolution-Proposal.pdf) · [Editable front SVG](Vegetable-Guru-Front-Print-Resolution-Proposal.svg)

The first two comparison pages show current/proposed panels at actual **185 × 240 mm** on A3 landscape. Print those pages at **100%**, without Fit. The next three pages enlarge lettering, vegetables and badges; the final two are clean proposed panels at trim.

## Changes and limits

| Component | Current export | Proposal |
| --- | --- | --- |
| Main front lettering, subtitle, author, ribbon wording | Raster, approximately 151 dpi | Smooth vector outlines traced from the exact retained shapes; original positions and spacing retained; no font substitution |
| Front badges | Raster, approximately 151 dpi | Vector lettering and symbols, reconstructed elliptical faces/rims; simpler gradients and cleaned stray pixels at the YouTube cutout edge |
| Upper vegetables | Flattened into the 1100-pixel front | Original 1944 × 786 transparent source at approximately 293 dpi |
| Lower vegetables | Flattened into the 1100-pixel front | Original 1692 × 888 transparent source at approximately 240 dpi |
| Shared cream wood | Approximately 151 dpi | New fine-grain reference restoration, placed as four mirrored tiles at approximately 302 dpi |
| Sixteen rear photos | Approximately 350–468 dpi | Exact original JPEG streams, positions and crops preserved |
| Rear copy | Native PDF text | Exact original content stream and font resources preserved |

**The lower front photograph remains 240 dpi.** This recovers the approved source's real detail; it does not invent detail or claim that simple enlargement raises its native resolution. The old soft shadow masks retain their sampling and remain separate from the lettering and photographic detail. The wood's grain is intentionally finer. Badge reconstruction slightly simplifies their shading; those changes need John's visual review alongside the sharper edges.

## Provenance and reproduction

- Approved source: [selected gold cover](../selected-gold-cover/README.md), with the exact accepted title spacing, original gold ribbon `#F2CC35` and Original harvest arrangement.
- [SOURCE-LAYERS.json](SOURCE-LAYERS.json) records the 33 embedded source images extracted without alteration from that SVG. The larger upper and lower photo sources are layers 05 and 10.
- [VECTOR-CONVERSION.json](VECTOR-CONVERSION.json) records the tracing method and source binding. [trace.py](trace.py) follows sub-pixel contours and smooths them into cubic paths. [build.py](build.py) retains the layer order, original source positions and separate shadow layers.
- [Wood generation record](WOOD-GENERATION.json): `generated_images/exec-da46070f-f591-4dda-8b1a-11d774c0e028.png` at project root, copied without alteration to `assets/wood-restored.png`. The actual generated size is **1101 × 1429**, not the larger size requested in the prompt. Each placement covers **92.5 × 120 mm**, giving approximately 302 dpi. Mirrored placement keeps the adjoining texture edges continuous. This is a new texture treatment, not recovered photographic detail.
- [assemble.py](assemble.py) substitutes only the rear background XObject, verifies all sixteen protected JPEG streams, and assembles the comparison from native PDFs. [CHECKS.json](CHECKS.json) records output hashes, dimensions, source limits and unchanged-photo checks.
- Rendering uses local `rsvg-convert`; assembly uses the bundled Python runtime with ReportLab, pypdf and pypdfium2. No browser export or full-book regeneration is involved.

Rebuild in this order: `build.py`, then `assemble.py`, using the project Python runtime. Generated review files live only under `output/pdf/cover-print-resolution-review/`. The scripts never overwrite the selected gold master or assembled book.

## Next decision

John to review the sharper lettering, badge reconstruction and finer wood in the comparison. Approval would authorise this specific cover treatment; installation into the book, final spine/bleed geometry and supplier preparation remain separate tasks.
