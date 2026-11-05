# Three revised crop guides

4 November 2026. [Review the facing spreads](REVIEW.html). John approved the [carrot](../carrot-revision/APPROVAL.json) and [leek](../leek-revision/APPROVAL.json) spreads and requested the same editorial approach for the other three samples. John subsequently approved the final three in both units, including the Beetroot storage correction. [Approval record](APPROVAL.json). They use the [source-linked conventional draft](../conventional/README.md) and the [crop editing notes](../CROP-EDITING-NOTES.md).

| Crop and folios | Imperial planting words, previous → now | Pest entries retained | Practical-page footer clearance in both units |
| --- | ---: | ---: | ---: |
| Beetroot, 26–27 | 56 → 31 | 8 of 8 | 12.95 mm |
| Potato, 76–77 | 156 → 96 | 10 of 10 | 3.09 mm |
| Outdoor tomato, 94–95 | 171 → 89 | 9 of 9 | 3.24 mm |

**Beetroot.** Sow and SOW replace the direct-sowing labels. Later sowings uses the succession pictogram and the final approved wording “Sow late May–Jul for storage.” The conventional sowing method keeps seed-cluster numbers, depths, spacing and optional soaking. The height for thinning and the reason a seed cluster may need thinning move to the first care instruction. The two drawings share a soil line. Adjacent care and harvest copy is shorter. Storage advice is split between harvest and the existing tip.

**Potato.** The chitting fact gives preparation timing with a sprout icon. Plant tubers gives the distinct planting windows for first earlies, second earlies and maincrops, illustrated with the book’s potato artwork. The depth fact explicitly names the trench. The four short planting steps cover chitting, trenches or holes, surface mulch and containers. Ongoing protection, earthing up, watering and blight handling sit in care. The two planting pictures share a soil line. Trimming and adjusting widths retained all ten entries, including both reporting instructions.

**Outdoor tomato.** Sow indoors and Plant out describe two different stages. The planting-out fact uses the planting pictogram. Protected late May is muted in the calendar and open-ground early June is bright. Potting on stays distinct from planting outdoors. Buying plants moves to the introduction, spacing to Quick facts and crop support and ventilation to care. Basket spacing retains its variety qualification. The four practical paragraphs preserve leaf handling, root readiness, the hardening period, frost risk and planting depth. The introduction, soil, care, harvest and three pest descriptions or actions have been tightened. The approved two-column pest table format is retained.

The three proofs retain the 9 pt planting body, current book folios, title treatment, complete planting illustrations, varieties, Key risks and working See also references. Both editions were measured after fonts and illustrations loaded, then read back and inspected as rendered PDF spreads. Word counts exclude headings. The results reflect these three samples.

The [editable crop copy](../../../../src/print/book/sowing-planting-mockups/final-three.mjs) is separate from the gardening records. Each crop has its own measurement report and checked PDF sources ([beetroot](../beetroot-revision/CHECKS.json), [potato](../potato-revision/CHECKS.json), [outdoor tomato](../tomato_outdoor-revision/CHECKS.json)). The [combined PDF checks](PDF-CHECKS.json) identify the final two files and destinations. The review PDFs carry the printed book folios as PDF labels and link out to the current main-book PDF.

To reproduce, run the project server, then run `node scripts/build-sowing-crop-revision.mjs <crop>` for beetroot, potato and tomato_outdoor. Run `finish` from `scripts/lib/finish_sowing_crop.py` on each resulting crop revision directory, then run this folder's `finish_review.py` with the bundled PDF-capable Python. Approved carrot and leek proof paths are guarded against rebuilding.
