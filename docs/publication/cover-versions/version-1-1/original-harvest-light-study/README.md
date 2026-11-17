# Original harvest cover with cast shadows

[Open the full cover and detail comparison](https://chatgpt.com/library?file_id=libfile_fde3_f-f1f0d3da20808191a32d262e3fc38e3e_968f6e806ba48191b80ffb1b7a35f663&account_id=personal)

John accepted the [tomato truss shadow study](../tomato-truss-light-study/README.md) as the lighting reference on 17 November 2026. This separate proof extends that treatment to the onions, peas, carrots and kale in arrangement 01. John accepted the lighting and subsequently selected this arrangement for the front cover. Use the [saved layered artwork](Original-Harvest-Cast-Shadows.svg) for future front-cover revisions.

The [pose definitions](pose.cjs) identify the raised foliage, the grounded tips and the neighbouring surfaces for this particular arrangement. The [builder](build.cjs) projects the actual photograph's silhouettes down and left, samples the light on exposed wood in the [original cream cover](../layered-master/sources/cream-trial-before-restoration.png), and preserves the accepted tomato layers. Each harvest group has separately adjustable layers for the wood and for local shade on adjacent vegetables.

From the project root run `node docs/publication/cover-versions/version-1-1/original-harvest-light-study/build.cjs` on macOS. The input is `output/tomato-truss-light-study/Tomato-Truss-Study.svg`. The new layered SVG, native PNG and two-page review PDF are in `output/original-harvest-light-study/`. The full cover comes first. The detail sheet compares the source, the tomato-only proof and the complete treatment.

Both PDF pages were rendered and inspected. The builder checks that removing the new layers recovers each prior SVG group exactly. Native pixel comparison found no changes in the tested tomato areas or the central lettering band. The [seven-cover comparison](../harvest-light-review/README.md) now includes all six alternatives with this lighting.
