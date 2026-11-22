---
name: vegetable-guru-garden-photography
description: Generate and revise photorealistic book illustrations of real gardening techniques in John Lennon's Cornish home garden or Hackriculture allotment. Use for on-site photographs, John demonstrating a job in different clothes, new viewpoints, and sequences fitted to the fixed pages of The Vegetable Guru.
---

# Vegetable Guru Garden Photography

For a real backdrop, open the [illustrated atlas](assets/Garden-and-Allotment-Viewpoints.pdf) or [browse the full-size photographs and two drone clips](assets/viewpoints/index.html). The atlas travels with this skill and contains all 118 views. The [camera-position guide](references/choosing-a-viewpoint.md) pairs views of the same place and identifies gaps. The [stills register](assets/viewpoints/sources.json) and [search record](assets/viewpoints/viewpoint-atlas/README.md) give the original sources and timecodes. The skill's `assets/viewpoints` folder opens the project's local master collection. Keep that collection in project backups for full-resolution originals and motion.

## Read the picture brief from the page

1. Open the assembled page, its artwork and the accompanying paragraphs. Establish what the reader must be able to see in each picture, which stages are already pictured, and which are text only. Read any linked technique that changes the starting condition. On page 160, page 162 establishes that turf has already been lifted.
2. Record the printed image area, aspect ratio and alignment to the relevant text. Work within the agreed page and fixed copy. Choose a particular instant for each image: what the hands hold, where the blade or tines enter, where the body puts its weight, and where material came from and will go.
3. Identify the site, viewing direction, period, and any reconstruction John requested. Use an overhead or oblique view to establish the plan, then a ground-level view for what the camera would actually see. Use a detail photograph for a specific wall, joint or tool. Resolve site, face and outfit IDs with `python3 scripts/resolve_refs.py` from this skill folder. Inspect the pictures before generating. For use elsewhere, pass `--project` with the checkout path. Use `--list` to discover the available IDs.

For example, `python3 scripts/resolve_refs.py A02 A08 L573 J02` returns the plot plan, a photographed mesh-covered bed, John's likeness and his warm-weather outfit. Use each for that purpose. If working away from the Mac without these files, ask for the specific missing references before generating a recognisable site or likeness.

## Match John's face to the working pose

Choose the head angle from the [six original camera views](assets/likeness/john-camera-angles.jpg). Open the individual crop at its native size and supply the one that matches the pose. Left and right refer to the direction on the page. `FACE-FRONT` shows his face at rest; `FACE-LEFT` shows the bareheaded, level side view. `FACE-TURN` shows a three-quarter turn towards the right. For a lowered head, `FACE-DOWN-LEFT` and `FACE-DOWN-RIGHT` show both directions in a cap; `FACE-DOWN-BARE` gives a close view from above without the cap. The [crop register](assets/likeness/sources.json) records the original clip, time and pixel bounds. Each ID works with the usual reference lookup.

For every generation that draws John's face looking down, attach the [lowered-profile reference sheet](assets/john-lowered-profile-reference.png) as an actual image input. This applies to single pictures, whole sets and edits to the planting, tools or background whenever the generator redraws his face. Reattach the sheet on each pass. Supply the earlier illustration separately for composition and the wardrobe reference for the current outfit. The sheet works offline and can be opened directly or located with `python3 scripts/resolve_refs.py LOOKDOWN`.

Use the still at 0:13 for the left-facing lowered profile and the still at 1:55 or 2:20 for a three-quarter view. For a right-facing profile, the separate camera crop `FACE-DOWN-RIGHT` at 2:46 shows the actual reverse. The fourth tile on the original sheet records the profile John approved in the first no-dig illustration. The [page 159 likeness comparison](../../publication/no-dig-photo-trial/revision-09/Vegetable-Guru-No-Dig-Profile-Test.pdf) shows how the camera evidence translated into the three selected pictures.

With his head lowered, the lower lip is visibly ahead of the chin. The short grey beard follows the slope back towards the throat, and little of the underside of the jaw shows above the collar. With his head level, use the outline in the upright photograph. Head tilt, expression and camera height change how much chin and neck show. A square projection under the lip or a round tuft that extends the beard forward are the recurring errors. A bareheaded, strictly side-on view facing right at eye level is still a gap in this set.

Before placing the result on the page, compare **each redrawn face** at full resolution with the closest camera still. Look at the lower lip, the foremost point of the chin and where the beard meets the neck. If the chin projects towards the lip, or a rounded or square beard extends the jaw, correct the affected image using the real stills again. Record the sheet among the inputs actually sent and the camera angle used for the comparison.

## Bamboo canes, wire and string

For bean rows, wigwams, pea nets, broad-bean strings and wind bracing, open the [cane construction and perspective guide](references/cane-structures.md) and its [photographic examples](assets/cane-reference.jpg) before drawing. Use the finished bean row John approved as the benchmark for the appearance of bamboo. Choose the dimensions, footprint and fixings for the particular job.

## Make the photograph

- Put the action close enough to read at its printed size. Show just enough of a fixed landmark to establish the place. Allow John's head or torso to fall partly outside the frame when the teaching detail is at ground level. Use natural daylight, credible scale, ordinary used tools and working clothes.
- Use John when a demonstrator helps the reader. L573 and T05 give wider frontal views. Use the matching face crop for the likeness and the lowered-profile sheet when his gaze drops to the work.
- Match clothing to a dated wardrobe frame and the time elapsed. Keep the outfit and daylight consistent during one work session. For a return visit, use the outfit and conditions agreed for that date. Keep permanent landmarks and the bed footprint aligned. Record the outfit used for each frame.
- Send the references to a reference-capable image generator. Identify the role of each input explicitly: page art for action or order, real photographs for setting, another for likeness and another for clothing. Use a generated predecessor only to preserve a reviewed composition. Verify the physical action against the text and real evidence if the drawing contains a mistake.
- For a new angle, trace the camera position against two visible landmarks and check occlusion. Review the result against a separate real view. H09 and A03 are reserved comparison angles in the current collection. If the generator invents hidden structure, choose a supported angle or request the specific missing view.
- Generate matched photographs together in one pass on a shared canvas. For before-and-after views, fix the camera position, lens and framing. Put John at the same working distance and register the bed corners against two permanent landmarks. Split the result into separate photographs at the seams. Use equal crops for matched views and compare the size of his head, shoes and a familiar object in each. If the scale or bed moves, remake the pair together. Give a teaching detail its own closer view when needed.
- For photographs taken months apart to show successive crops, allow a small natural viewpoint shift. Keep the bed and permanent landmarks recognisable at a similar scale.
- Show grass and weeds in the condition the technique produces. For mown lawn, use dense short blades, small natural variations and the occasional low weed. Show lifted turf as a thin, rooted piece of lawn with earth adhering to it. After smothering, show flattened, earth-stained fibres and partly decomposed weed runners. Connect material caught in a rake to the ground it came from. Consult a real photograph when the texture is uncertain.
- For crops growing in soil beds, inspect photographs of real plants at the same stage and season. Give each plant its own size, lean and leaf outline, with irregular overlaps and gaps across the row. Include only the imperfections supported by the reference, such as picked-leaf scars, an ageing lower leaf or an occasional insect hole. Check at book size for repeated silhouettes or evenly fanned leaves. [Book illustration guidance](../../BOOK-DESIGN-SYSTEM.md#illustration-and-reuse)
- For a local correction, preserve the rest of the approved composition. Check the result against the other frames before fitting it to the page.

## Prove the sequence

Place the separate frames in a working copy of the page, each registered to the matching paragraph with a visible gutter. Measure the actual target page. The three roughly 43 mm frames and 12.2 mm gutters are specific to page 160. For other compositions, use their own geometry and labels. Inspect the rendered page at reading size and its facing spread. Look for ambiguity about the action, implausible tools or anatomy, drift between stages, and changes outside the intended art area. Check extracted text, trim, picture bounds and surrounding rendered content against the base page.

Save the prompt, source IDs and paths, camera/date assumptions, wardrobe ID, generated masters, individual frames and proof record in a new project revision. Distinguish John's decisions from items awaiting review. Use the latest handover for the current proof and keep the production page intact during trials.


<!-- vegetable-guru-allotment-handover-2026-11-19 -->
## Views of John’s allotment

John prefers adapting an existing camera view whenever it shows the job clearly. Use the actual still as the starting image, keep its framing, and change the gardening action within it. For a bed demonstration, look for a view that shows the bed centre and the paths on either side. Compare the result beside the still and trace the soil and grass edges before fitting it to the page. If a fresh angle is needed, use Working Map 03 and its March flyover frames to check it. Dashed lines mark hidden ground. [Allotment landmarks and camera references](references/johns-allotment-viewpoints.md)

