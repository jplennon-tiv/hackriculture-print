# T05 front-cover layout trials

11 November 2026. **John prefers B — Forest frame**, with further work on the lettering: “B is the best, yes, but the font needs a little work to match the interior style.” This was the initial preference, not approval of its Georgia title or a finished cover. After reviewing the lettering trials, John requested a completely different approach: compose the whole cover with image generation, using T05 as a seed. The three original trials remain unchanged.

Open [Cover-layouts-review.pdf](Cover-layouts-review.pdf). Page 1 compares the three directions; pages 2–4 are individual **185 × 240 mm** front panels; page 5 places them alongside the latest approved Greenhouse Tomato working spread. The [comparison image](Cover-layouts-comparison.jpg) provides a quick overview.

| Trial | Direction | Purpose |
| --- | --- | --- |
| A — Cream masthead | Existing Lilita One title above a broad photograph | Keeps the closest connection to the interior lettering, with a simpler composition than the production cover. |
| B — Forest frame | Georgia title and inset photograph on forest green | John's preferred composition for further development. Title lettering needs a closer relationship to the interior. |
| C — Photograph first | Larger portrait above a left-aligned Georgia title | Gives John and the harvest greater prominence; the title is less dominant at thumbnail size. |

All three use the existing title, subtitle and author name: **The Vegetable Guru**, **Your at-a-glance growing companion**, **John Lennon**. No new claims, blurb or publication details are introduced. Nunito Sans remains the supporting typeface. Georgia is an explicit, cover-only proposal; it does not change the interior design rules.

At John's request, the separate [B typography comparison](typography-study/README.md) now tests B1 Lilita One, B2 Nunito Sans and B3 combined lettering. Its five-page PDF shows actual-size fronts and thumbnail comparisons alongside the interior. T05, the green frame, subtitle, author and wording remain identical to B. No lettering variant is selected or approved. The original PDF and its manifests retain the status and recommendation at the time they were created.

## Sources and treatment

- Photograph: [native T05 PNG](../cover-photo-search/tomato-harvest-study/frames/T05_05m16s042_4K.png), 3840 × 2160, captured at approximately 5:16.042 from John's tomato-harvest video. [Acquisition and source limits](../cover-photo-search/tomato-harvest-study/README.md). This remains a decoded YouTube frame; the original camera video has not been acquired.
- Interior comparison: [approved Greenhouse Tomato imperial spread](../sowing-rollout/revisions/tomato_greenhouse/spreads/tomato_greenhouse-imperial.jpg), pages 92–93, with its [10 November approval](../sowing-rollout/revisions/tomato_greenhouse/APPROVAL.json). Reused unchanged for comparison; no guide was regenerated.
- Design references: [book design system](../../BOOK-DESIGN-SYSTEM.md), [original G2](../vegetable-guru-grid-variations/assets/G2-centre-title.png), [original B5](../vegetable-guru-back-collage/B5.png) and [production/concept comparison](../bookvault-print-ready/cover-comparison.jpg). All remain intact.

The photo is clipped and scaled within each PDF layout, retaining John's face, hands and complete colander. There is no retouching, colour adjustment, generative alteration or upscaling. The original PNG is untouched; the PDF embeds one full-resolution, high-quality JPEG derivative. Effective photo density is approximately **334 ppi in A, 363 ppi in B and 313 ppi in C**. Pixel density does not establish optical sharpness or print approval.

The cover letters are resolution-independent vector outlines from the actual local fonts. They are not selectable PDF text. Wording, font sizes and positioning remain editable in [build-layouts.py](build-layouts.py); [font-outlines.py](font-outlines.py) reads the original local font outlines through FreeType. [LAYOUTS.json](LAYOUTS.json) records exact input hashes, crop rectangles, type choices and positions. The builder uses the existing Python runtime with Pillow, ReportLab and its bundled FreeType library; it requires no browser or font download.

## Verification and scope

All five PDF pages were rendered with Poppler and visually inspected for missing images, letterforms, spacing, clipping and comparison-page fit. The PDF's three individual cover pages were measured at the specified trim size. Embedded image resources, source hashes and local delivery links were checked; see [CHECKS.json](CHECKS.json).

These are front-panel layout proofs, with no bleed, spine or back cover. They are not supplier files. The approved originals, main book, shared copy and gardening data remain unchanged. Review files and editable sources are stored together in this project on the Mac's internal drive. No app tests or whole-book export were needed.
