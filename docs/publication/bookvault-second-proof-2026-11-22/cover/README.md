# Second-proof cover preparation

22 November 2026. Prepared from the exact approved corrected front/rear panels and the approved clear-spine lettering. Original illustrated/photographic components and all approved masters remain untouched.

## Colour-managed proof derivative

Use [Vegetable-Guru-Second-Proof-Cover-CMYK.pdf](../../../../output/pdf/bookvault-second-proof-2026-11-22/cover/Vegetable-Guru-Second-Proof-Cover-CMYK.pdf) as the preserved ordered-cover baseline. John confirmed the second-proof order on 23 November; [order record](../ORDER-CONFIRMATION.json). It is one **388.006 × 246 mm** page with a **12.006 mm spine** and **3 mm outer bleed**. See the [full-wrap soft proof](final-cmyk-wrap.jpg) and [technical colour checks](COLOUR-CHECKS.json).

The exact **ISO Coated v2 300% (ECI), FOGRA39** profile used by the accepted first proof is embedded as the output intent. Non-type artwork is flattened at 600 dpi through colour-managed Poppler, honouring its embedded source profiles and compositing into explicit sRGB. LittleCMS applies relative colourimetric conversion to the exact historical profile. There is **no remaining live transparency or RGB painting**. This is not a claim of certified PDF/X conformance.

All **29 original front font-outline groups** remain exact vector curves. The RGB and CMYK type layers have identical non-colour geometry; 128 font-path paints, 1,577 cubic curve operations and all native rear/spine characters remain. The nine used fonts are embedded. Maximum native-glyph position/size change is below 0.000001 pt. This protects the corrected lettering from the earlier melted-outline problem.

Independent colour review identified avoidable shadow compression in two rear photographs: **row 2, column 3 (salad colander)** and **row 4, column 1 (John kneeling)**. Only their documented inward pixel rectangles use black-point compensation. Clothing folds and dark ground/pot separation are retained. All CMYK bytes outside those rectangles match the no-BPC conversion exactly; the [rectangle record](SELECTIVE-BPC-PHOTOS.json) and checks retain the evidence. The front harvest and other fourteen rear photographs retain the historical no-BPC treatment. Compare [colander](bpc-colander-comparison.jpg) and [kneeling John](bpc-kneeling-john-comparison.jpg).

The measured peak ink coverage is 300.784%, the small 8-bit quantisation excess produced by the nominal 300% ICC transform. No arbitrary channel cap or global saturation/brightness adjustment is applied. Source photographs retain their real source-detail limit; a 600 dpi flattening grid does not create detail.

## Native preparation master

- [Cover with bleed](../../../../output/pdf/bookvault-second-proof-2026-11-22/cover/Vegetable-Guru-Second-Proof-Cover.pdf): one **388.006 × 246 mm** page, 3 mm outer bleed, **12.006 mm spine**.
- [Trim-only comparison](../../../../output/pdf/bookvault-second-proof-2026-11-22/cover/Vegetable-Guru-Second-Proof-Cover-Trim.pdf).
- [Full-wrap preview](../../../../output/pdf/bookvault-second-proof-2026-11-22/cover/Vegetable-Guru-Second-Proof-Cover-Preview.png), [spine detail](spine-detail.png), [ribbon/bleed detail](front-ribbon-bleed-detail.png).
- [Source and preservation checks](CHECKS.json), [supplier geometry evidence](SUPPLIER-GEOMETRY.json), [builder](build.py).

The precise spine comes from the fresh Bookvault-generated URL `v4_PerfectBound_Cover_240_185_12.006.pdf` for the 174-page quote. The initial browser-only template was followed on 23 November by the [downloaded account template](../templates/Bookvault-Account-Cover-174p-2026-11-23.pdf) and [completed geometry comparison](../templates/TEMPLATE-RECORD.json). The template MediaBox is 388.000169 × 246.000058 mm with a rounded 12 mm spine label; the prepared wrap is under 0.01 mm wider. Its exact checked bytes were retained and passed supplier validation. No template comparison or cover upload is pending.

The front's actual font outlines and the rear's native lettering remain native PDF content. Both outer panel streams are byte-exact. All sixteen rear JPEG streams retain their exact original encoded bytes. The 12.5 mm provisional spine background is scaled only horizontally to 12.006 mm, while the title/author retain their approved font sizes, tracking and vertical centres at 90/140 mm below the top. The author stays clear of the leaf shadow.

Only the external bleed strips are rasterised at 600 dpi. The front uses an expanded viewport of the approved SVG, retaining the original physical scale, continuing the mirrored wood tiles and extending the diagonal Organic ribbon polygon beyond trim. Actual font paths continue normally; no lettering is reflected. The rear/spine wood-only edges reflect the original edge artwork outward. This adds actual colour/artwork through bleed without enlarging the in-trim layout or generating new imagery.

One nonvisual resource cleanup removes the empty `BT /F1 12 Tf 14.4 TL ET` setup and unused unembedded Helvetica resource from the rear wood-background form. There are no text-showing operators in that form. Actual rear copy is untouched. The nine drawn fonts are embedded. A 254 dpi same-viewport comparison against the unmodified approved panels and newly centred spine has **zero changed in-trim pixels**, including the background cleanup. Image strips add no duplicate hidden text.

The actual full-wrap PDF, enlarged spine and ribbon/bleed corner were visually inspected. Lettering is smooth, the author remains clear, photographs retain detail and the ribbon continues naturally into the top bleed. Metadata placeholders and working £17.50 price are retained for the separate metadata stage.

The native file retains RGB colour and transparency and is the untouched preservation baseline for the finished colour derivative. The full-wrap and enlarged lettering/spine views have been visually checked. A same-sampling 600 dpi comparison verifies the separated non-type artwork against the actual approved-layout native PDF; source front transparency grouping is retained during rendering before flattening. This is distinct from the retained 254 dpi diagnostic, where differently sampled wood grain and photograph edges naturally differ. The final figures and hashes are in [ART-PRESERVATION-600DPI.json](ART-PRESERVATION-600DPI.json) and [COLOUR-CHECKS.json](COLOUR-CHECKS.json).

**Current status:** geometry comparison, visual checks, supplier upload and account validation are complete. John confirmed placing the second-proof order on 23 November. Preserve this exact PDF and every source component; physical-proof acceptance and final retail ISBN/barcode/price remain separate.

Historical rebuild recipe, retained for deliberate future revisions. Do not run it over the ordered baseline merely to resume a session. Use the project's primary Python and separate output paths if a new revision is requested:

```sh
python docs/publication/bookvault-second-proof-2026-11-22/cover/build.py --geometry-record docs/publication/bookvault-second-proof-2026-11-22/cover/SUPPLIER-GEOMETRY.json
python docs/publication/bookvault-second-proof-2026-11-22/cover/colour.py
python docs/publication/bookvault-second-proof-2026-11-22/cover/verify.py
```

`verify.py` uses the retained actual 600 dpi native/type renders for comparison; regenerate those with the same explicit sRGB Poppler profiles if the native source or type geometry changes. The source/group, ICC and output hashes are recorded. Visual approval does not carry automatically to a later rebuild.
