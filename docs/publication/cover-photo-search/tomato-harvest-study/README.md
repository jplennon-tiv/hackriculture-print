# Tomato harvest: frame selection

11 November 2026. **John's preferred photograph for the next cover trials is T05**, following review of the PDF: “T05 is the best selection, I think.” Use the retained [native T05 frame](frames/T05_05m16s042_4K.png) at 5:16.042. This records his image preference; crop, layout, lettering, copy and final cover approval remain open. Garlic remains an earlier comparison reference.

Start with the [seven-page PDF review](Tomato-harvest-review.pdf), which John confirms he can view. It embeds the three-way portrait comparison and all six complete-frame/crop pairs. All seven pages were rendered and visually checked. The [comparison gallery](REVIEW.html), [three portrait crops](Portrait-framing.jpg) and [all six complete frames](All-six-frames.jpg) are also retained. The gallery links to every native PNG. [FRAMES.json](FRAMES.json) records filenames, player times, dimensions, SHA256 hashes and exact crop rectangles. The capture manifest and comparison files preserve the assessment before John's preference above; no images or review files were regenerated to record it.

John reported missing images in the HTML, then no visible page after its images were embedded. The embedded HTML remains valid on disk, but its app display is unresolved; use the PDF for review. All work in this folder is on the Mac's internal data volume, not a removable drive (verified with `df`). Native 4K PNG links in the HTML still refer to the accompanying `frames/` folder. Its 13 embedded images were decoded and compared byte-for-byte with their review sources; none of the captured PNGs or review JPEGs was changed. Browser rendering could not be checked because local HTTP serving and file-URL navigation were restricted. Opening Preview through computer control also timed out; the PDF was instead verified by Poppler rendering and image inspection.

## Recommendation

| Candidate | Player time | Assessment |
| --- | --- | --- |
| **T05** | **5:16.042** | **Preferred by John for cover trials.** Direct eye contact, a gentle smile and the colander held towards the reader. Strong red fruit against surrounding foliage. |
| T02 | 5:06.208 | Warm, more relaxed pose; bowl held closer to the body and less dominant. |
| T04 | 5:21.208 | Quieter portrait, fruit slightly off-centre. |
| T03 | 5:16.208 | Nearby broader-smile alternative to T05. |
| T01 | 5:01.208 | Turned slightly towards the viewer; less composed expression. |
| T06 | 4:41.042 | Action comparison: picking among plants. Better supporting image than leading portrait. |

The plants and greenhouse aisle give the portrait a clear setting and frame. The image communicates a grower sharing an actual harvest, which is more specifically about gardening than the quiet garlic still life. It also puts the author at the centre of the cover: that remains a direction for John to judge, not an established requirement.

There is little calm space above the head. The separate [T05 layout trials](../../t05-cover-layouts/README.md) now test a cream masthead, a forest-green frame and a photograph-first arrangement, keeping the current words stable. None is approved. A full-height 185 × 240 mm crop is approximately 229 ppi before bleed; a 185 × 160 mm photographic panel would be approximately 343 ppi. These are pixel-density calculations, not claims of optical sharpness or supplier approval. The frame-selection files in this folder remain unchanged.

## Acquisition and limits

- Source: [Garden Tomato Surplus? Make Passata!](https://www.youtube.com/watch?v=sIUbl3cKZsQ). YouTube Studio identifies the upload as **`Garde Tomato Surplus - Oven Roasted Passata.mp4`** and shows completed 4K processing.
- Targeted review concentrated on the greenhouse harvesting and front-facing colander sequence at roughly 4:41–5:26, with finer frame steps around 5:16. This was not an exhaustive replay of the complete 19:32 video.
- Six PNGs were saved using Chrome's native **Save Video Frame As** action, after explicitly selecting **2160p 4K**. Each saved image was checked as **3840 × 2160 px**. They contain the video frame without browser chrome or player controls.
- The Studio video-download route was blocked by the browser. No security settings were changed or block bypassed. Native frame capture succeeded, so this did not prevent the requested still extraction. The original video was not downloaded or located locally.
- These are decoded **YouTube 4K stream** frames. They retain compression and any source focus/motion softness; they are not original camera photographs. Player times are navigation references, not independently measured source-video presentation timestamps.
- PNGs are unchanged after capture. The separate JPEG previews are reduced, with clearly labelled portrait crops. No retouching, colour change, sharpening, generative content or upscaling.

Both contact sheets were visually inspected; source/preview dimensions, hashes, distinct source pixels and local gallery links were checked. These checks establish review-file integrity, not design or print approval. No app tests, main-book regeneration or canonical-data changes were needed. Existing cover designs, copy and approvals remain intact.

[build-review.py](build-review.py) reproduces the review images, gallery and manifest from the six retained PNGs without touching the originals. [CHECKS.json](CHECKS.json) records verification.

[build-pdf-review.py](build-pdf-review.py) reproduces the portable PDF using the existing review JPEGs. It does not alter images, manifests or the book.
