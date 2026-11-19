# John’s allotment · Working Map 03

19 November 2026. Prepared for John’s review. [Plan beside the original frames](Johns-Allotment-Working-Map-03.pdf) · [editable Blender model](Johns-Allotment-Working-Map-03.blend) · [previous eight-page atlas and model](../allotment-handover-2026-11-19/atlas/working-map-02/) · [approved book pictures](../allotment-handover-2026-11-19/notes/Approved-Pages.md).

## What the camera shows

The grass runs across the back of the pale-green shed and turns along its side. The visible rear wall and exposed ground locate this turn. The roof masks part of the side towards the paving. Branches interrupt the opposite shed-end corner. Leaves, the barrel and two containers obscure shorter stretches. The plan marks those stretches with rust-coloured dashes. The solid teal trace follows the visible **inner** grass edge. The outer extent of grass and the neighbouring structures are drawn for orientation. This is a photographic location study.

Seven short paved strips cross the beds from the shed towards the open end. Paths 5 and 6 separate the three predominantly dark covers. Path 7 separates the final cover from the open bed. The path ends leave a strip of soil on the barrel side. The grass crosses the far end beyond the two containers. The neighbour owns the brown shed and the metal hoops. The barrel beside the dark covers is distinct from the water butt at the shed door.

## Camera evidence

The 23 March 2026 original is `DJI_20260323173752_0018_D.MP4`. Both the Videos and five_backup copies decoded at 01:52 and produced identical JPEGs. The Videos original supplied the working frames. The pass was sampled at one-second intervals from 01:52 to the final whole second at 05:25. Outbound movement pauses at about 02:11–02:13. The drone returns past the beds and reaches the paving around 02:27–02:30. The later footage gives a lower, wider view.

| Original time | References | What to check |
| --- | --- | --- |
| 01:52, 01:56, 01:59 | A12–A14 | Grass behind the shed, corner, approach to paving |
| 02:02, 02:04 | A15–A16 | Mixed cover and planted band. A16 is the full frame corresponding to the B01 crop. |
| 02:07, 02:11, 02:13 | A17–A19 | Strips between covers, final strip, open end bed, turnaround |
| 02:19, 02:27, 02:30 | A20, A21, A04 | Return over the beds, paving junction and scale |
| 03:00, 05:25 | A06, A22 | Wider angle and closing view |
| Clip 0017 at 02:15 | A02 | The view in the opposite direction, identified by John |

[Clean 01:52 still](../../garden-media-library/local-references/allotment-flyover-2026-03-23/0018-01m52s.jpg) · [all eleven new stills](../../garden-media-library/local-references/allotment-flyover-2026-03-23/) · [camera source register](../../garden-media-library/local-references/sources.json) · [nine inherited references matched to the local catalogue](source-crosswalk.json) · [outward and return sequence](flight-sequence-1.jpg) · [later footage to clip end](flight-sequence-2.jpg).

## Ground trace and scale

The [ground mosaic](ground-mosaic.jpg) uses 22 reduced camera frames, one per second from 01:52 to 02:13. Twelve visible slab-grid intersections in A04 at 02:30 anchor the paving. John measured one slab at 45 × 45 cm. The original Map 02 datum is retained. The mosaic has 50 pixels per Blender scene unit, equal to 0.46 m. The diagrams use the same grid at half size. SIFT feature matches and a robust ground-plane transform link adjacent frames to the paving, using 01:59 to join A04. The [transforms](image-to-ground.json) map source pixels in each 1200 × 675 frame to full mosaic pixels. Match counts concern the frame alignment, not the precision of any bed dimension.

The [shared trace](layout.py) records each boundary segment and its visibility, the path footprints and the March covers. Registration assumes a flat surface. The shed roof, trees and barrels lean or repeat in the mosaic. Inspect the individual frames for raised objects. Positioning becomes less certain further from the slabs. The model’s roof and shed heights, cameras, plant rows and neighbour landmarks are illustrative.

## Open or rebuild

Open the Blender file and use camera view. In scene 01, frames 1–6 select the overview, plan, two lengthwise views, the paving and a working-height view towards the shed. In scene 02, frames 1–20 select the nine inherited photos and eleven additional stills. Use rendered shading or render a frame to see the photographs. Collection 06 holds the ground mosaic. Collection 07 holds the observed edges and dashed joins. All imagery used in the Blender file is packed.

Run these commands from this directory. The PDF uses the original atlas fonts, Pillow and ReportLab. The model uses Blender. The archived reduced frames and A04 anchor in `registration-inputs/` allow the ground registration to be reproduced separately with OpenCV and NumPy. Rebuilding the proof and model uses the original camera references at the relative locations above.

```sh
python3 build_review.py
blender --background --python-exit-code 1 --python build_model.py
VG_MODEL_REVIEW=/tmp/vegetable-guru-map-03-cameras blender --background Johns-Allotment-Working-Map-03.blend --python-exit-code 1 --python check_model.py
python3 register_ground.py /tmp/vegetable-guru-map-03-ground
```

The saved model was reopened in Blender 5.3. All six model views and twenty photographic views were rendered and inspected. All sixteen paving slabs measured 0.45 m on each horizontal axis. The two output files from the ground-registration check matched the archived mosaic and transforms byte for byte. All six pages of the review PDF were rendered and inspected.
