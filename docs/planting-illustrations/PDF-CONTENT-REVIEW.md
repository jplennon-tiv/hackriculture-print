# Five-crop PDF content review

16 September 2026. Review prototypes only; no production widget installation or shared-data edits.

## What to open

Three A4 metric review packs are in `../../output/pdf/planting-proofs/`:

- `01-existing-layout.pdf`: the existing exports, captured before the proof transformation.
- `02-illustrated-column.pdf`: the new artwork in the existing left-column position; full-width Final Tips retained.
- `03-full-width-planting.pdf`: horizontal planting sequence at the bottom of page two; a smaller Final Tips card in the left column, with other cards rebalanced.

Each pack has ten pages and crop bookmarks. Crop order: beetroot (pages 1-2), carrot (3-4), potato (5-6), leek (7-8), chicory (9-10). Page one stays unchanged. Individual imperial proofs remain beside the review packs for unit checking.

## Content retained and changes proposed

Both illustrated layouts retain every planting note visible in the baseline PDF. Planting methods are represented in captions and supplementary route text, not dropped. Structured measurements resolve from the current shared master through the existing measurement helper. Soil, care, harvesting and pest advice visible in the baseline is retained verbatim, even when moved.

| Crop | Illustrated sequence | Content treatment |
| --- | --- | --- |
| Beetroot | Sow clusters / thin seedlings | Method represented in captions; moisture advice retained. Module alternative stays explicit, and individual spacing is not applied to clump planting. Both visible notes retained verbatim. |
| Carrot | Sow / cover / thin | Direct sowing and fine soil or compost cover represented in captions; all three measurements and both visible seed-mixing/pelleted-seed notes retained. |
| Potato | Sprouts upwards / cover gently | Placement, careful covering, watering and individual-hole alternative retained. Trench depth remains explicitly distinct from soil cover. Separate early/maincrop plant spacing retained; master maincrop row spacing added because the old generic resolver displayed only first-early rows. No-dig and chitting sentences previously lost to baseline method trimming restored from the master. |
| Leek | Column: lower / water; wide: make hole / lower / water | Two-image fallback combines hole-making and lowering in words, never omits watering rather than dry backfilling. Nursery start, pencil thickness, both visible notes and all spacing qualifiers retained. Master transplant-hole depth added separately from seed depth. |
| Chicory | Sow / thin for the type | Narrow version pairs small scenes horizontally. Full-width version gives them more room. Salad/forcing seasons, lifting after frost, forcing versus non-forcing spacing, deeper-bed/wider-row alternatives and all four visible notes retained. |

### Final Tips

In the column proofs, all original Final Tips wording and icons remain.

In the wide proofs, repeated tips become short reminder labels. The builder checks that **every original full tip is still present verbatim in Looking After the Crop** before allowing this condensation. This reduces duplication, not unique gardening advice. The small reminder card currently omits the old large tip icons. No body font was reduced to make the pages fit; modest spacing reductions and card reflow supply the remaining room.

For the first four crops, Soil, Care, Harvesting and small Tips stack on the left, Pests on the right. Chicory's longer harvesting section remains on the right below the header, with Pests beneath it. This is a crop-specific review arrangement, not a new universal layout rule.

### Important distinction: baseline versus complete master

These proofs preserve the **current printed content**, not every entry in the master. The existing fitter already omitted planting notes before pictures were added:

| Crop | Baseline notes shown / source notes | Previously omitted notes, not newly cut for artwork |
| --- | --- | --- |
| Beetroot | 2 / 5 | Detailed clump-thinning/gradual harvest advice; early protected crops; later sowings. Some clump guidance already appears in care/harvesting and the new route qualification. |
| Carrot | 2 / 4 | Cold/wet sowing conditions; dry-drill watering instructions. These remain source content for a future editorial decision. |
| Potato | 0 / 0 | No `notes` array. Other structured routes and planting dates were not all printed before; the proof does not turn them into a complete cultivation manual. |
| Leek | 2 / 6 | Early/exhibition and clump-start detail; optional root/leaf trimming; planting-depth caution; fresh-seed advice. |
| Chicory | 4 / 4 | None from its planting notes array. |

The machine-readable `content-audit.json` beside the PDFs records baseline and proposed text, source note visibility, selected image paths, measurements, retained other sections and source fingerprint. There are no proposed omissions of unique advice visible in the baseline; some wording is consolidated and duplicated Tips shortened as described above.

## Checks completed

- 30 individual actual A4 PDFs: five crops x metric/imperial x baseline/column/wide. Every PDF has exactly two pages; each final pack has ten pages.
- Page-one extracted text is identical between all three variants for each crop/unit pair. Prototype CSS and DOM changes are restricted to page two.
- All baseline planting notes and original soil/care/harvesting/pest text verified in the actual PDFs. Unit-specific structured values are read at generation time.
- Fonts loaded; Inter identified in embedded PDF font descriptors, including Chromium's Type3 subsets. All images decoded with zero broken images; no page errors.
- Actual PDF pages rendered with Poppler. All ten metric illustrated page twos and all five metric front pages visually inspected, plus tight imperial wide leek/chicory examples. No clipping, overlapping labels or broken artwork observed. Other imperial proofs pass automated text, page-count and image checks; not each separately visually reviewed.
- Print application: 134 tests passed and TypeScript/Vite build passed. Existing large-chunk warning remains. No application code changed.
- Master unchanged: SHA-256 `0e8f591e50e8d6794ef8902ac52b391d378006b2ae5703f9cec31fe15dba1df4`.

## Limits and next decision

These are A4 layout proofs, not a 44-crop rollout. No A5/A6 legibility claim. The smallest column scenes are 14 mm high; wide scenes are 17 mm high. Final type remains 8.5 pt for captions/support and 7.5 pt for measurement labels, matching existing size conventions. Printed-size approval is still needed, especially for narrow chicory.

No precise anatomical arrows or new row-plan diagrams have been added; measurements use explicit stage labels. This avoids putting an unverified dimension on schematic artwork. The next production step should use the chosen layout, source-bound captions, calibrated annotations where useful, image fallback and bounded fitting that cannot silently trim neighbouring advice.

Existing mixed-unit prose is preserved, e.g. the pelleted-carrot note and chicory alternate arrangements in metric mode. Existing unrelated source oddities (carrot's parsnip germination wording; onion wording in leek trouble descriptions) are also unchanged. These are not new layout defects and have not been silently rewritten. Production editorial review should address them separately if requested.

Recommendation: full-width layout. It gives the clearest left-to-right sequence and keeps all three leek operations. The narrow layout remains viable but needs crop-specific compromises. Await John's review before installing either in the normal renderer.
