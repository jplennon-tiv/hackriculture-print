# B: lettering comparison

11 November 2026. John prefers the T05 **B — Forest frame** composition and requested lettering closer to the interior. These three typography trials follow his instruction to proceed. **No lettering variant is selected or approved.** John has now said none stands out and requested a completely different direction: generate the complete cover as one picture from T05. These trials are retained as comparisons, not the active route.

Open [B-typography-review.pdf](B-typography-review.pdf) or the [comparison image](B-typography-comparison.png). Page 1 compares the three treatments, pages 2–4 are individual **185 × 240 mm** fronts, and page 5 compares their thumbnail appearance with the approved Greenhouse Tomato spread.

John could not open either local chat link. The PDF is now also available as a [downloadable review copy](https://chatgpt.com/library?file_id=libfile_fde3_f-11caa767835c8191a58d7c2993685a9e_968f6e806ba48191b80ffb1b7a35f663&account_id=personal), saved under Printed Cheat Sheets. Use that delivery link; the artwork and local originals are unchanged. John is happy to review in Preview or Chrome. Automatic opening through the app failed; visibility of the new download has not yet been confirmed by John.

| Trial | “Vegetable” | “Guru” | Design intent |
| --- | --- | --- | --- |
| B1 — Lilita One | Lilita One, 54 pt | Lilita One, 74 pt | The closest relationship to the interior headings, with more restrained sizing than the original cream-masthead trial A. |
| B2 — Nunito Sans | Nunito Sans 900, 48 pt | Nunito Sans 900, 70 pt | A consistent, quieter title using the interior's supporting family. |
| B3 — Combined lettering | Nunito Sans 800, 48 pt | Lilita One, 74 pt | Familiar display character concentrated on “Guru”. |

All three use Nunito Sans 800 at 14 pt for “The”. Title lines retain B's baselines; sizes vary to give broadly comparable visual widths. Original font outlines are used without artificial thinning or horizontal scaling. B1 was the initial recommendation for its direct relationship to the interior. John has since chosen to explore a different approach.

## Fixed sources and editable work

The T05 photo, its crop and position, green field, cream frame, subtitle and author treatment are identical to [original B](../B-forest-frame.jpg). Wording is unchanged. The original [layout PDF](../Cover-layouts-review.pdf) and [manifest](../LAYOUTS.json) remain intact.

[build-typography.py](build-typography.py) is the separate editable source. It reads the existing [font outline helper](../font-outlines.py), local Lilita One and Nunito Sans files, native T05 PNG and the unchanged approved Greenhouse Tomato spread. [TYPOGRAPHY.json](TYPOGRAPHY.json) records their paths and hashes, crop geometry and exact type placement. Cover lettering is vector outlines, not selectable PDF text; wording and geometry are editable in the script.

The source photograph and interior provenance are recorded in the [parent review notes](../README.md). The photograph remains a decoded YouTube 4K frame, with its existing compression and source softness. These trials introduce no photo retouching or upscaling.

## Checks

All five pages were rendered with Poppler and visually inspected. The three front-panel page boxes measure exactly 185 × 240 mm within 0.01 mm. A pixel comparison confirms the rendered area below 70 mm from the top is **identical to original B in every trial**, including subtitle, frame, photograph and author. Original photo, interior, font, layout-PDF and layout-manifest hashes remain unchanged. Embedded images and output files were checked; see [CHECKS.json](CHECKS.json).

These remain front-panel review proofs without bleed or spine. No main-book regeneration, shared-copy or gardening-data edits, app tests or supplier actions were needed. The active task has moved to a complete image-generated cover concept, as recorded in the handover.
