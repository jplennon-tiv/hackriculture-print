# Existing monochrome icon review

[Visual board](MONOCHROME-REVIEW.html) shows every relevant original, enlarged and at its current 32px risk / 34px bubble size. [Read-only audit](MONOCHROME-AUDIT.json).

| Family | Relevant drawings | Current implementation |
| --- | ---: | --- |
| Page-one Key Risks | 34 | PNGs, 200–1254px; 250 configured label mappings |
| Page-two crop bubbles | 44 | 1024px PNGs used as masks in category colours |
| Total | 78 | No SVG masters found in these production folders |

The risk directory contains one additional `head.png`, not used by its risk dictionary; this is outside the proposed redraw. No exact-byte duplicate images were found. Mapping counts are dictionary entries, not top-four card usage frequencies. Title banners and the approved coloured set are outside this work.

## Recommended direction

Use a coherent single-colour family: bold recognisable outlines/silhouettes, a few broad transparent cutouts, consistent visual weight and intentional orientation. Match the rounded drawing language of coloured style A. Preserve current colours and slots. Create transparent SVG masters and transparent PNG exports; no white backing or solid white internal marks. Judge at actual size first. Resolution is already ample: the problem is meaning and drawing, not pixel count.

Risk priorities:

- Replace overloaded meanings before drawing replacements. Poor germination covers 23 labels including bitterness and soft tubers; forked root covers 14 including small roots and green top. Mouse is assigned to badgers. A better drawing alone cannot repair those assignments.
- Separate silhouettes and symptom locations: leaf markings, collapsed seedlings, damaged roots, stems and fruit should read differently. Use a recognisable snowflake for frost and a clear seed/root sequence for failed germination. Hollow root needs a recognisable cut root with a cavity rather than a plain ring.
- Simplify fine details in mildew, grey mould, root rot and insects. Preserve distinctions that matter; don't invent a species-specific image for every named condition.
- Consider additions for small roots, bitterness, poor growth, leaf-miner damage, wilting, failed fruit set and badger damage. Final count follows an explicit mapping review; do not set a quota.
- Resolve aliases and blank mappings alongside the icon work. The existing Club Root/Clubroot identity conflict must be deduplicated before selecting the top four risks, not merely given a second icon. Six current inline labels also lack dictionary entries (see audit); not all necessarily reach the top-four cards.

Crop-bubble priorities:

- Give each crop a clear outer shape and one or two identity features. Cauliflower should show a curd inside wrapper leaves; cabbage a leafy head. Salsify/scorzonera needs a distinctive long slender root rather than the current carrot-like form. Lettuce and endive currently look near-identical despite different file bytes.
- Recompose long/thin crops (asparagus, beans, leeks, cucumbers) so they occupy a comparable visual area. Larger files do not compensate for tiny artwork inside the existing slot. Use deliberate diagonals, groups or open-pod views where helpful.
- Keep all 44 crop assignments. Related crops can share a master only where their image genuinely communicates the same identity; retain useful distinctions such as slender greenhouse versus short outdoor cucumber.
- Fix two path mismatches when implementing: runtime requests `garlic.png` and `oriental_leaves.png`, but files are `garlic2.png` and `oriental_leaves2.png`. The review board deliberately shows the existing art under the correct crop names while flagging the mismatch.

Suggested next pilot: six risks (aphid, frost, mildew, clubroot, poor germination, a new small-root symbol) and six crops (broccoli, cauliflower, lettuce, leek, cucumber, salsify/scorzonera). Agree the small-size drawing language before expanding.

Review only: production artwork, mappings and shared records are unchanged. Existing source references, dimensions and hashes were audited; all 78 board cards visually inspected. Two affected crop routes checked for the mask filename mismatch. No PDF catalogue, application changes or new gardening advice.
