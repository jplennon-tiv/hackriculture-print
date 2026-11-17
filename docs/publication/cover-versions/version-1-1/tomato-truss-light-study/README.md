# Tomato truss shadow study

[Open the two-page review proof](https://chatgpt.com/library?file_id=libfile_fde3_f-158fdad69a0881919091af1ea5e0b972_968f6e806ba48191b80ffb1b7a35f663&account_id=personal)

John accepted this tomato truss treatment as the lighting reference for arrangement 01 on 17 November 2026. The [previous trial](../natural-harvest-shadow-trials/README.md) treated each harvest group as one silhouette. John identified the missing shadows from the raised branches and leaves in the [original cream cover](../layered-master/sources/cream-trial-before-restoration.png).

The builder isolates the green foliage in the registered cutout. Its board shadow uses the pose of the branches and a soft cast beneath each tomato. Corresponding points on the fruit outlines register visible patches of shadowed wood from the original. The original vegetable matte, ribbon and lettering are excluded from this tonal sample. A second layer shades only the tomato skins where branches intercept the light. Both layers are adjustable and travel with the upper arrangement.

Run `node docs/publication/cover-versions/version-1-1/tomato-truss-light-study/build.cjs` on macOS with the previous trial SVG and PNG available. The proof, editable SVG and render are written to `output/tomato-truss-light-study/`. Page 1 compares the original, previous and revised details. Page 2 shows the whole cover. The builder checks that removing the two new layers recovers the previous SVG exactly. A native pixel comparison found 44,534 changed pixels inside the tomato detail and zero elsewhere. Both PDF pages were rendered and visually checked.
