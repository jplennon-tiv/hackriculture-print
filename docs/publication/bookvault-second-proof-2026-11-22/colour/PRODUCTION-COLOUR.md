# Production colour preparation — second proof

**23 November file update:** the [corrected header-bleed interior](../../header-placement-review-2026-11-23/README.md) supersedes the interior file identified in this colour report. Its original CMYK image streams, photographic corrections, native lettering and output profile are preserved; new edge strips use the same colour recipe. The cover is unchanged. Use the [main preparation record](../README.md) for the current exact upload pair.

22 November 2026. John clarified that this may be the final physical proof before the print run. **Colour-managed production PDFs must therefore be prepared and reviewed now.** The earlier source-screen review was useful for artwork selection and exposure, but it was not final print approval. This report supersedes its earlier deferral of production colour to stage 5.

Status: **Complete for production-colour preparation.** Both exact final CMYK derivatives have passed profile, bounded-pixel and actual-render checks. Five photo-only shadow corrections and three background-only cream corrections are applied and independently verified. No further colour change is indicated; physical proof, metadata and supplier release remain separate.

## Confirmed supplier guidance

Current official sources checked on 22 November 2026:

| Official source | Relevant instruction and consequence |
|---|---|
| [Bookvault — printed colour differences](https://help.bookvault.app/printed-book-colour-differences) | Recommends a CMYK workflow and **FOGRA39 for UK coated stock**; FOGRA29 is for uncoated UK stock and GRACoL-2006 for US production. The chosen UK 150 gsm coated proof therefore has a specific supported target. |
| [Bookvault — Guide to Supplying Print-Ready PDF Files](https://help.bookvault.app/hubfs/Guide%20To%20PDFs%20-%20Digital%20Version%20.pdf?hsLang=en), printed pp2 and 8 | Asks for flattened transparency and embedded fonts; recommends CMYK conversion with a FOGRA profile. Accepting RGB does not mean that press-side conversion is the best available preparation. |
| [Bookvault — file validation](https://help.bookvault.app/what-does-the-bookvault-file-validation-check-for) | Recommends PDF/X-1a:2001 or PDF/X-3:2002 where possible. Automated validation does not inspect transparency problems or correct bleed extension. Passing upload checks alone will not complete this review. |
| [International Color Consortium — FOGRA39](https://www.color.org/fogra39/) | Identifies FOGRA39 as a characterisation dataset for coated printing, and specifically identifies ECI's `ISOcoated_v2_300_eci.icc` as a profile made from it. Different profiles can use different black generation, so matching the exact existing profile matters. |
| [ECI — offset colour standards](https://eci.org/doku.php_id=en_colorstandards_offset.html) | Describes the 300% ISO Coated v2 variant and profile-specific printing conditions. This is supporting profile evidence, not a claim that Bookvault's digital press is offset lithography. |

The supplier's current web guidance is used for current recommendations. Its older downloadable PDF contains older information in other areas; for example, its embedded-font validation description differs from the current validation page. No outdated font-validation claim is adopted here.

## Exact target and continuity with the accepted first proof

- Profile file: [`ISOcoated_v2_300_eci.icc`](../../bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc).
- SHA-256: `c6b4b62f0726243742eced8b9669476a6be89e581f50a7600ed8b6fcbb9cdab8`.
- Size: 1,829,093 bytes. ICC v2.4, CMYK, Lab connection space; internal description **ISO Coated v2 300% (ECI)**.
- Original source recorded in the first-proof build: [official ECI offset-profile archive](https://eci.org/lib/exe/eci_offset_2009.zip).
- The profile bytes are **identical to the embedded FOGRA39 OutputIntent in the accepted first-proof production interior**, verified directly rather than inferred from its filename.
- The historical script [`finish-bookvault-pdf.py`](../../../../scripts/finish-bookvault-pdf.py) used LittleCMS relative-colourimetric intent, no black-point-compensation flag, opaque 600 dpi non-text artwork, native glyph overlays and lossless CMYK image encoding. It made no certified PDF/X claim.

Reusing this exact destination provides both a current supplier basis and continuity with John's accepted print. It does not guarantee a colourimetric match between runs or substitute for inspecting the physical proof. The matte cover finish and actual press/paper behaviour are not measured by this software simulation.

## Source colour handling and preservation

[Input audit](COLOUR-INPUT-ANALYSIS.json) and [active source profiles](ACTIVE-SOURCE-PROFILES.json) distinguish resource inventory from profiles actually used by painted content.

| Current interior placement | Active source information |
|---|---|
| P1, 2, 3, 5 | ICC sRGB paint and source imagery. |
| P7, 97, 145 | Generic RGB Profile paint, plus sRGB imagery. Its values were honoured during conversion. A separately authorised exact background mask restores the intended shared cream; imagery and other source colours remain honoured. |
| Most guide/troubles imagery | Embedded Google/Skia RGB profile. |
| P149 | One image carries a profile named `Display`; honour it rather than assuming its samples are sRGB. |
| Other DeviceRGB source content | The browser/CSS working convention is sRGB; an explicit sRGB default is used for otherwise untagged RGB. |

The native interior resource inventory contains 327 soft-masked image objects; the approved corrected cover contains 14. Those counts include resources and are not a count of distinct visible pictures. The native files contain no output intent. Merely attaching a destination profile without colour conversion and transparency handling would not be sufficient.

For the interior, the pipeline rendered the separated non-text artwork through Poppler with explicit sRGB display/default handling while honouring embedded source profiles, then converted it once to the exact CMYK target. Native glyphs, embedded font data, geometry and visible text are retained; native colours are converted from their actual active source colour spaces. The final check includes all-page actual renders, because font bytes and coordinates alone are not a complete visible-output test. The single established interior conversion pipeline is retained; no mixed Ghostscript route is used.

The cover preserves the corrected genuine font-outline paths as vectors as well as native rear/spine text. Its underlying imagery is flattened at 600 dpi, retaining geometry and using the same ICC target. No lettering was traced or regenerated. The independent conversion scripts/receipts own the final implementation details.

## Selective photographic shadow treatment

The [intent study](INTENT-COMPARISON.json) compares explicit-sRGB renderings converted through the historical relative intent with the same conversion plus LittleCMS black-point compensation. The CMYK samples are then converted back to sRGB for display. This is a **profile-controlled screen simulation without paper-white simulation**, not a measurement or prediction of the final physical print.

The source neutral ramp illustrates the reason for checking: historical relative conversion compresses source RGB levels 0–30 to approximately displayed levels 32–35 after the profile round-trip. Black-point compensation retains a more gradual shadow separation. This does not justify changing every page's palette: the same flag also changes the established dark-green ink conversion.

At enlarged photographic detail, avoidable loss is visible:

| Folio / placement | Observed in historical-intent simulation | Selected preparation |
|---|---|---|
| P154 main compost-bin panorama | Fine grain/grit across the black underside of the central lid largely merges into a flat dark area. | Photo-only relative intent + black-point compensation. |
| P155 left compost photograph | Dark plank seams and compost/lid separation are compressed. | Same photo-only treatment. |
| P168 lower raised-brick-bed greenhouse | Separation among dark pots, shaded soil and foliage under the bench is reduced. | Same photo-only treatment. |
| P162 pale mesh and fleece | Fine pale mesh and underlying leaves remain differentiated. | Retain historical conversion; no selective change. |
| Rear cover, row 2 / column 3, salad colander | The clothing/background beneath the bowl becomes a nearly featureless dark patch. | Photo-only BPC recovers clothing folds. |
| Rear cover, row 4 / column 1, John kneeling | Dark ground, bed edge and pot separation is reduced. | Photo-only BPC preserves that separation. |

Before/after detail comparisons: [P154](intent-review/dark-compost-lid-comparison.png), [P155](intent-review/compost-lid-comparison.png), [P168](intent-review/raised-bed-shadows-comparison.png), [P162 control](intent-review/pale-mesh-comparison.png). These show source RGB, historical relative conversion and relative + BPC, in that order.

[Exact treatment bounds and settings](SELECTIVE-PHOTO-BPC.json) are bound to the native prepared interior SHA-256 `e1d870ce328a0fdc76f447c69f7512f7c34d805caaccd3f4c196b625ec90b3c1`. Bounds are derived from PDF image transforms and visible clipping, including the clipped panorama on P154. Use the same retained sRGB artwork raster as the baseline, then convert the chosen pixel rectangles with intent 1 and `BLACKPOINTCOMPENSATION` (8192). **Do not convert a CMYK raster back to RGB and then reconvert it.** Pixels outside these rectangles and all native/vector text must remain identical to the historical-intent derivative.

Cover comparisons: [colander](../cover/bpc-colander-comparison.jpg) and [kneeling John](../cover/bpc-kneeling-john-comparison.jpg). [Exact cover bounds](../cover/SELECTIVE-BPC-PHOTOS.json) derive from the native image placements. Root also visually reviewed and agreed the two cover comparisons and actual interior samples. Front harvest texture remains useful without additional treatment.

[Independent checks of actual interior shadow samples](ACTUAL-SHADOW-SAMPLE-CHECKS.json) confirm that each patch exactly matches a separately built BPC transform from the retained source RGB art, and every CMYK byte outside the prescribed regions matches the historical-intent baseline. This is colour/pixel evidence. Native text visibility and geometry are independently checked on the exact full production file; the samples alone do not constitute whole-book release approval.

The sampled historical conversion reaches 300.392% total ink at isolated 8-bit pixels, consistent with a one-byte sum above nominal 300% after quantisation. The exact target remains the accepted 300% profile; this is reported rather than claiming mathematically exact ≤300% for every 8-bit sample.

## Shared cream correction

The initial RGB source review found matching intended `#fff8e9` backgrounds, but respecting the Generic RGB paint profile on P7, P97 and P145 produced CMYK bytes `0,7,24,0`, against `0,7,29,0` elsewhere. The shared cream design and John's earlier request for consistent internal blanks establish the intended match; root explicitly authorised the bounded correction during this preparation.

[Exact masks](CREAM-BACKGROUND-CORRECTION.json) select only flat old-colour samples, excluding every native photo placement plus a two-pixel guard. P7's calendar panel is excluded by its different colour. The selected counts are 18,902,060 (P7), 22,414,944 (P97) and 22,454,824 (P145). [Independent final checks](FINAL-CREAM-INDEPENDENT-CHECKS.json) prove that every selected pixel now matches the common cream, every unselected CMYK sample is identical, all photo exclusions are clear, and native page-content bytes are identical. The interior builder also verifies all 171 other image streams and all 174 page content/geometry records unchanged. This is separate from the five photo treatments.

## Completed final verification

| Final file | SHA-256 |
|---|---|
| [Interior](../../../../output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Colour-Managed.pdf) | `341ce74932cd81f6a8cc838b742ec7095e471d0ee7d9fcb7b247dd1b417e6b47` |
| [Cover](../../../../output/pdf/bookvault-second-proof-2026-11-22/cover/Vegetable-Guru-Second-Proof-Cover-CMYK.pdf) | `a37c9d4216c14643bd7bb46c9fd066bf12fe400a6301365e01b997a8e0821a8e` |

[Independent interior checks](FINAL-INTERIOR-COLOUR-CHECKS.json) verify 174 opaque CMYK page artworks, byte-identical accepted ICC, final photo pixels identical to the independently verified BPC samples, uniform full-media cream on blanks 4/6/96/174 and matching inset cream on neutral pages and all three openers. The interior worker verifies all 340,299 native glyphs and complete embedded font/CMap/Type3 procedure data. Both source and final complete rendering; the 1,819 Type3 q-before-d1 warnings are the same pre-existing warnings, not a new failure.

[Independent cover checks](FINAL-COVER-COLOUR-CHECKS.json) verify the final hash/profile and both independently rebuilt BPC transforms. Every one of the 51,479,594 pixels outside the two photo regions retains all four CMYK bytes exactly; the common outside hash is `651cedd6ade4bd93e19ec380d5fcbac2467542c9b9ae7eb768ebf7b4358df80a`. The builder preserves 29 genuine font-outline groups (128 path paints), nine embedded native fonts and 13 native text runs. Its 600 dpi non-type recomposition comparison matches 49,375,557 of 49,375,559 pixels exactly; two isolated renderer samples differ by at most 12/255, with mean absolute difference 0.0000003173. No visible design change was found. Maximum 8-bit total ink is 300.784%, an explicitly recorded quantisation result of the accepted nominal 300% profile; no arbitrary extra cap was imposed.

[Actual final visual coverage](PRODUCTION-VISUAL-REVIEW.json) covers all 174 converted pages on eleven contacts and enlarged checks of final photo corrections, netting, openers and full cover. The three opener renders were refreshed after their final patch; unchanged-page evidence ties the other views to the exact final file. The [seven-page viewing PDF](../../../../output/pdf/bookvault-second-proof-2026-11-22/colour/Vegetable-Guru-Production-Colour-Checks.pdf) contains actual converted results and comparisons, distinct from the earlier native-source contacts. No active RGB or live transparency remains in the production artwork; native/vector lettering is retained. No certified PDF/X claim is made.

The controlled preparation resolves the demonstrated conversion losses. No further colour edit is indicated by these checks. There is no new artwork, crop, hand position, layout or gardening-content change. Physical print acceptance and final metadata/supplier checks remain separate.

**After John accepts the physical proof, keep the accepted production PDFs, profile, rendering intents and recipe fixed for the print run.** Later colour regeneration or parameter changes require a deliberate new decision and checks. The proof should test these actual production files, not a preliminary RGB preview that will be converted differently afterwards.
