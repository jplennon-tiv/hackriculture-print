# Harvest cover lighting review

[Open the eight-page cover comparison](https://chatgpt.com/library?file_id=libfile_fde3_f-8b64ce40d6748191b2181a3ce8922ab9_968f6e806ba48191b80ffb1b7a35f663&account_id=personal)

Page 1 shows the seven arrangements together. Page 2 is the [Original harvest lighting reference](../original-harvest-light-study/README.md) accepted by John. Pages 3–8 show Summer greenhouse, Kitchen roots, Pods and salad, Autumn harvest, Brassica colours, and Corn and chard. John selected **01 · Original harvest** for the book front on 17 November 2026. The [six alternatives](../../../../assets/harvest-alternatives/README.md) are retained as reusable upper and lower vegetable artwork.

The [pose definitions](arrangements.cjs) locate raised growth and the vegetables beneath it in each photograph. Casts from features such as bean pods, leek roots and carrot fronds fall down and left. Their throw is shorter on raised vegetable surfaces and longer on the exposed wood. Each upper and lower group has two adjustable shadow layers, one for the wood and one for neighbouring produce.

Run `node docs/publication/cover-versions/version-1-1/harvest-light-review/build.cjs` from the project root on macOS, using the [previous trial SVGs and PNGs](../natural-harvest-shadow-trials/README.md) and the accepted arrangement 01 PNG. The [builder](build.cjs) writes six layered SVGs, six native-size PNGs and the comparison PDF to `output/harvest-light-review/`.

All eight PDF pages were rendered and the seven cover pages checked at 185 × 240 mm. Upper and lower details were compared with the preceding lighting for every alternative. Removing the four added layers recovers each previous SVG exactly. Pixel comparison also confirms the central lettering band matches in every alternative.
