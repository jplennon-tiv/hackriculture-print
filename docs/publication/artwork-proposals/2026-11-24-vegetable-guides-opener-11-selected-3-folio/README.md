# Selected oval opener with folio 7

24 November 2026. John selected oval option 3 and requested the page number: “3 is the best one - add a page number and it's done!” He then specified a minimum of 300 dpi.

The layout is completed as requested in `Vegetable-Guru-Selected-Opener-Page-7.pdf`: original white angled title, selected dark translucent contents oval, all 44 contents entries, and a small white 7 at the lower right. The folio uses Nunito Sans Bold at 7.35 pt, right edge 8 mm inside trim and baseline 8 mm above the trim bottom. Only the folio was added to the selected PDF; the original photograph and every other page element are preserved. The PDF has 185 x 240 mm trim and 3 mm bleed.

**The resolution requirement is not yet met.** The current photograph is 1105 x 1423 pixels, approximately 146.93 ppi at 191 x 246 mm full bleed. At least 2256 x 2906 pixels are needed to reach 300 ppi. The native vector lettering and oval remain sharp independently of photo resolution. Do not describe this PDF as a 300 dpi print master.

A built-in image-edit attempt requested a faithful 2400 x 3104 high-resolution version, but returned 1105 x 1423 again. That attempt is preserved as `assets/resolution-attempt-not-used.png`; it is **not** substituted into the selected PDF. `GENERATION.json` holds the exact prompt and result. Changing a DPI metadata tag or silently enlarging pixels would not establish new photographic detail.

John subsequently authorised the dedicated HeyGen 4x test. On 24 November the preserved original photograph was uploaded, but the upscale request returned HTTP 402: **upscaling requires a paid plan**. HeyGen reported the account as Free. No upscale job ID or enlarged output was returned. The exact upload reference, request and blocker are saved in `HEYGEN-UPSCALE.json`; reuse that asset rather than uploading again. No subscription purchase is authorised. Await John's plan decision before retrying. A successful 4x result would be 4420 x 5692 pixels (approximately 588 ppi at full bleed), with AI-enhanced detail still requiring visual inspection. The selected PDF, original photograph and ordered book files remain unchanged.

`build.py` adds the folio using native PDF text and renders the preview. `assets/selected-option-3.pdf` is the exact selected source; `assets/Folio.ttf` is the embedded font source. `MANIFEST.json` verifies unchanged source image bytes and the single added text item. The preview was inspected at page size. All work is separate from book assembly and supplier submission; the calendar remains parked.
