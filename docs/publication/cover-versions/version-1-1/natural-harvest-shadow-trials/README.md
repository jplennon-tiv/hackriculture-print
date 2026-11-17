# Garden harvest trials with cast shadows

[Open the shadow review PDF](https://chatgpt.com/library?file_id=libfile_fde3_f-bb6345cb68608191941874a378a8c6a1_968f6e806ba48191b80ffb1b7a35f663&account_id=personal)

These seven front-cover proposals use the [garden-grown arrangements](../natural-harvest-trials/ARTWORK.json). The tonal reference is the [original cream artwork](../layered-master/sources/cream-trial-before-restoration.png). Inspect the pooled shade beneath the truss and the narrow sliver beneath a carrot taper.

In each SVG, the upper and lower harvest groups contain a “Cast shadow on wood” sublayer immediately behind the cutout. Its opacity controls the whole cast for that group. Moving the group keeps the shadow with it. Replacing the photograph requires a fresh shadow from the new silhouette. Shading between vegetables stays in the photograph.

Run `node docs/publication/cover-versions/version-1-1/natural-harvest-shadow-trials/build.cjs` from the project root on macOS with the seven previous trial SVGs in `output/natural-harvest-trials/`. The [previous builder](../natural-harvest-trials/build.cjs) can supply those inputs. The new builder verifies that removing the shadow treatments leaves identical SVG content for each pair of proofs. It writes separate editable SVGs, native-size PNGs, an overview and a nine-page review PDF to `output/natural-harvest-shadow-trials/`. The PDF opens with original, previous and revised details, then shows the overview and seven individual covers at trim size.
