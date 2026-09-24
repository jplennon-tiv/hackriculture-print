# Style A: agreed coloured icon scope

**Decision recorded:** John chose A for its mix of colours. The coloured style is
accepted; monochrome icon changes are deferred. Icon sizes stay unchanged.
John authorised generation of this scope and has now approved [all 36 drawings](COLOURED-SET.html).
[Representative page proofs](COLOURED-PROOFS.html) are approved and the artwork is
installed. The two reviewed netting/inspection assignments are active; additional
per-tip refinements below remain proposals. Gardening text is unchanged.

The final Plant support is a climbing plant spiralling around one upright cane.
John's specific briefs supersede the original drawing briefs below for depth,
row spacing, weeding and support; all four corrections are accepted.

## Recommended size

**36 working designs: 20 core meanings plus 16 useful additions.** Two further
designs can be held in reserve. Eight A designs already exist, so the proposed
36-design set requires 28 more drawings, not 36 replacements.

The current library has 19 Quick Facts / Final Tips keys. Core Needs adds sunlight;
its water and nutrition meanings should reuse water and feeding respectively.
Keep the existing `feeding` and `nutrition` keys as aliases to one drawing when
implementing, rather than making two near-identical assets.

Read-only audit: all 44 vegetables, 110 approved Final Tips, 12 icon labels used.
Harvest accounts for 28 tips, sowing 17, protection 16 and storage 12: 73/110 tips
use those four labels. Repetition is useful when meanings match; it becomes a
problem when a label represents a different action. [Audit evidence](COLOURED-SCOPE-AUDIT.json).

## Twenty core meanings

| Meaning / key | Drawing brief |
| --- | --- |
| Sowing / `sow` | Retain A seed packet and falling seeds |
| Soil / `soil` | Soil profile with roots; distinguish soil from compost and mulch |
| Watering / `water` | Retain A watering can; reuse in Core Needs |
| Feeding / `feeding`, `nutrition` | Retain A leaf-marked sack; one shared drawing |
| Harvest / `harvest` | Retain A harvest basket for general picking and harvest dates |
| Depth / `depth` | Seed in a soil cross-section with a vertical depth marker |
| Germination / `germination` | Seed opening into root and first leaves |
| Soil pH / `ph` | Soil sample and a small, clearly labelled pH test cue |
| Plant spacing / `plant_spacing` | Retain A two plants and horizontal distance arrow |
| Ready in / `ready_in` | Calendar and clock; elapsed growing time |
| Row spacing / `row_spacing` | Retain A parallel planted rows and cross-row arrow |
| Seed life / `seed_life` | Seed packet and clock; distinguish from harvest storage |
| Yield / `yield` | Produce on scales; quantity rather than harvest action |
| Planting / `planting` | Rooted young plant being set into soil; not sowing seed |
| Storage / `storage` | Produce in a ventilated crate; ordinary crop storage |
| Mulching / `mulching` | Surface layer around an established stem |
| Weeding / `weeding` | Hand tool removing a competing seedling beside the crop |
| Support / `support` | Stem tied to a stake/trellis; structural support |
| General protection / `protection` | Retain a broad cover cue as a fallback; prefer a specific meaning below |
| Sunlight / `sun` | Retain A sun; share with Core Needs |

## Sixteen additions supported by current tips

The assignments below are proposals based on the meaning of existing text, not
new horticultural instructions. Multiple-action tips need editorial judgement.

| Addition | Drawing brief | Existing use that justifies it |
| --- | --- | --- |
| Inspect / `inspection` | Retain A magnifying glass and leaf | Cucumber/tomato leaf undersides; checks for pests or decay. Can also cue inspection of stored crops without a separate species icon |
| Gloves / `gloves` | Pair of gardening gloves | Celery sap; handling hot chillies. Currently both use protection |
| Succession / `succession` | Two or three small sowings with a short calendar progression | Endive, lettuce, kohl rabi, oriental leaves, pea, spinach. Currently mostly sow |
| Thin seedlings / `thinning` | Close seedlings with one carefully removed | Spinach thinnings and salsify/scorzonera advice. Currently plant spacing |
| Thin fruit / `fruit_thinning` | Small fruits, one removed, room for the remainder | Aubergine fruit-load advice. Currently harvest; a seedling-thinning drawing would give the wrong action |
| Prune / stop / `pruning` | Secateurs and a shoot tip | Outdoor tomato stopping advice. Currently sow |
| Divide / take offsets / `division` | Parent clump with a separated rooted piece | Globe artichoke offsets and replacement; rhubarb divisions. Currently planting |
| Mesh / netting / `netting` | Supported mesh clear of foliage | Broccoli netting tip. Currently protection; distinguish pest exclusion from frost covering |
| Cold protection / `cold_protection` | Fleece or straw shelter with a small snowflake cue | Jerusalem artichoke severe-frost protection; celeriac establishment. Coloured action icon, separate from the deferred monochrome frost risk |
| Shade / `shade` | Shade screen over a seed tray, sun outside | Lettuce summer seed trays. Currently protection |
| Earth up / `earthing_up` | Soil ridges around a stem with hidden tubers | Potato mulch/ridge checks. Currently protection; not the same drawing as a flat mulch layer |
| Exclude light / `exclude_light` | Opaque cover over pale growth | Endive blanching and chicory dark covers. Distinct from frost/mesh protection; do not use for every forcing/resting instruction |
| Safety / `safety` | Clear caution symbol with a restrained gardening cue | Rhubarb leaves and unidentified mushrooms. Currently harvest. An attention cue, not a replacement for the written warning |
| Raise fruit / `fruit_rest` | Fruit resting on a board/tile above the soil | Outdoor cucumber and marrow/courgette. Currently protection; distinguish from stem supports |
| Pollination / `pollination` | Pollen transfer between flowers, without a bee-only metaphor | Sweet corn variety-isolation tip. Currently plant spacing. Must accommodate wind pollination and never imply greenhouse cucumbers universally need pollinating |
| Drainage / `drainage` | Root zone with excess water passing out below | Globe artichoke stagnant damp; chicory waterlogging. Distinguish from watering and do not obscure the primary action when a tip covers several things |

## Two reserve designs

- **Ventilation:** open greenhouse vent with air movement. Strongly supported by
  approved cucumber care, but no dedicated current Final Tip needs it. Useful for
  future reuse; do not add an icon to a new section or rewrite a tip to use it.
- **Composting:** plant material entering a compost bin. The sweet-corn Final Tip
  about chopping spent stems is an immediate candidate, but this can wait if we
  keep the first drawing batch smaller. Distinct from applying feed or mulch.

Potting on, hardening off, seed soaking, crown recovery, cutting leaves, lifting
roots, and additional tying/trellis variants remain possible later additions.
Avoid drawing an icon for every crop, cultivar or sentence. General harvest,
storage, support and planting remain appropriate where their meaning is accurate.

## How to apply the set later

1. Preserve the eight accepted A coloured drawings as the visual references:
   warm green/earth/blue/amber palette, rounded dark outlines, transparent SVG
   masters and transparent PNG exports. Palette roles can vary by subject; do not
   collapse the family back into D's two-colour treatment.
2. Draw the missing core meanings and the agreed additions in small review boards
   at existing slot sizes. Keep title-banner art and monochrome assets out of this
   work. No new PDF catalogue or larger-size experiment at this stage.
3. Prepare explicit per-tip icon assignments for review. The current approved
   Final Tips use exact saved keys, so adding images alone will not improve their
   mappings. Avoid broad keyword substitution, particularly for safety, pruning,
   pollination and multi-action advice. The first matching word is not the meaning.
4. After those mappings are agreed, use the revision-guarded writer and exact
   prior-byte backups for any shared `icon` edits; preserve text, ranks, locks,
   unknown fields and attribution. Keep approved copy intact and re-present the
   affected proofs. Asset creation itself does not require shared-data edits.
5. Keep repeated icons when they communicate the same action. Changes should make
   advice easier to recognise, not merely make the page more varied.

## Checks for this scoping pass

Read the icon helper, print mappings and all 110 approved Final Tips. Checked
selected approved care extracts for the reserve/conditional ideas. Saved a
read-only audit snapshot and verified its 44-crop / 110-tip totals. No icons, app
code, shared records or PDFs changed; document link/content checks only.
