# Garden photo grid, third proof

[View the rear cover and the front/back pairing](https://chatgpt.com/library?file_id=libfile_fde3_f-8e0b395347c08191b5584e3157a5386a_968f6e806ba48191b80ffb1b7a35f663&account_id=personal).

This revision carries forward the [second proof](../revision-02/README.md). The [tile list](tiles.json) records all sixteen crops in printed order. Five photographs have changed.

| Tile | Artwork in this proof |
| --- | --- |
| 5 | Healthy potato foliage retouched into the background of John's harvest photograph. The hands and potatoes come from the original. |
| 6 | A generated study of one red radish growing in the soil replaces the harvested pile. |
| 7 | Extra lettuce leaves inside the colander, with John's photographed hands and the original rim. |
| 9 | The same winter squash with a closer crop and a 6% brightness lift. |
| 14 | A generated study of a brighter green butterhead lettuce, with a pale heart. |

The [retouch brief](retouch-prompt.txt), [component preparation](finish-assets.cjs) and [individual images](assets/) record the artwork. The modified rear footer sets John's name, three page-count bullets and his YouTube invitation beside the working £17.50 price and 52 × 30 mm ISBN/barcode space. The [wording](footer.json) is paired with the [assembled book's page map](../../../../../whole-book-order-preview/PAGE-MAP.json) when building the proof.

| Section | Counted folios | Content pages |
| --- | --- | ---: |
| Vegetable growing guides | 10–97 | 88 |
| Vegetable problems and pests | 100–146 | 47 |
| Gardening tips and advice | 148–171 | 24 |

The three section openers are excluded. From the project root, run `node docs/publication/cover-versions/version-1-1/rear-cream-harvest/build.cjs --photo-grid-03` with the project Node version on macOS. Page one shows the rear at trim. Page two pairs it with the selected front. Visual review and PDF text extraction confirmed the wording and space for the barcode. PDF image comparison confirmed the rear woodgrain, the eleven other photographs and the selected front match the second proof.
