# Cover photography: archive search

11 November 2026. **Research and unapproved source candidates**, following John's request to search the two video drives, relevant YouTube footage and the newly connected NODE NAME photo folders. This extends the [cover-direction study](../cover-direction-study/README.md); it does not select a photographic cover or replace G2/B5, the production proof, copy or interior pages.

**Latest follow-up:** after favouring garlic on wood in the first shortlist but seeking a clearer subject frame, John now prefers **T05 at about 5:16** from the [tomato harvest study](tomato-harvest-study/README.md) for the next cover trials. That study retains six native 4K stills and portrait comparisons; John confirms the PDF review is visible. The image preference is recorded; crop, layout, lettering, copy and final cover approval remain open.

The earlier [six-page visual assessment](Cover-photo-review.pdf), [image gallery](REVIEW.html) and [six-image overview](Photo-shortlist.jpg) preserve the broad first pass; their online-acquisition status predates the tomato follow-up. [SHORTLIST.json](SHORTLIST.json) records its 12 candidates with exact original paths, dimensions, proposed use, limitations, preview hashes and video timestamps. Three selected local video frames are retained at native 3840 × 2160 resolution in `stills/`; other candidate JPEGs are reduced review copies. Original media remain untouched. No retouching, synthetic content or upscaling was applied.

## Findings

- **L029, peas:** strongest foreground-harvest photograph for an initial front-cover trial. Growing plants behind the picked crop tell a useful story; the closest pods are soft and foliage is busy.
- **L037, elephant garlic:** quieter still-life alternative. More restrained, but the nearest bulb is soft and the subject can suggest a cookery book.
- **L575 at 00:08.000, picking salad:** strongest local action detail. Bright paving and deep shadows favour a framed image panel over a full-height cover crop.
- **L573 at 02:05.000, showing salad:** practical author/back-cover lead. A nearby frame at 02:05.245 caught closed eyes; the retained candidate uses the exact earlier frame.
- **N07251, carrot and beetroot:** the new drive's clearest two-crop harvest composition, but only 1600 × 1200 px. Use a smaller panel, not an assumed full-cover enlargement.
- **N06727, chilli tray:** the new drive's strong colour/pattern alternative; one crop and the tray give it a culinary emphasis.
- **Tomato harvesting:** the first online lead was John picking at approximately 4:44. The [targeted follow-up](tomato-harvest-study/README.md) now favours the front-facing colander at **5:16**, with six 3840 × 2160 PNGs captured from the YouTube 4K stream. Original camera footage has not been acquired. The kitchen harvest at 5:51 remains secondary.

There is no unquestionable finished-cover winner. First compare a cream title area with one harvest photograph, a quiet still life and an active harvesting scene. Keep the current title/subtitle stable during that comparison. A planned new photograph remains a sensible option if the archive candidates do not meet the desired standard. The supporting candidates in the gallery are not proposed wholesale replacements for existing author imagery.

## Coverage and limits

| Source | Actual coverage |
| --- | --- |
| `/Volumes/Videos/Movies/DJI Videos` and `/Volumes/five_backup/Videos backup 11 May 2026/Movies` | 917 media files inventoried, grouped into 600 sources. A topic-based selection of 137 images and 186 video clips was inspected. The clips total 15.17 hours; **776 evenly spaced sample frames**, not every minute, were viewed on 39 sheets. All ten image sheets and 39 video sheets were inspected. No probe, sample or image errors in this batch. |
| `/Volumes/NODE NAME/Photos from iMac` | 1,637 image files inventoried. Included in the spaced sample below. The sample was predominantly unrelated travel material. |
| `/Volumes/NODE NAME/Photos from Laptop` | 5,795 image files inventoried. Garden sequences identified and expanded. |
| NODE NAME combined | 607 initial samples (every twelfth filename group plus final group) and 414 targeted positions around garden/harvest sequences. **985 distinct positions**, one unreadable file (`N07383`), so 984 image positions visually inspected. This is not an exhaustive review of all 7,432 files. Numbered filename suffixes are **not evidence of duplication**: some same-stem pairs show completely different subjects. |
| YouTube | Selected moments in 11 videos visually reviewed. [ONLINE-REVIEW.json](ONLINE-REVIEW.json) records URLs, times, observations and remaining priorities. No matching named shoot was identified in the two original local trees for this targeted set; unlabelled clips may overlap. This is not a verified list of every upload missing locally. |

Local videos were grouped using size and first/last 64 KiB hashes, a **probable-duplicate heuristic**, not full-file duplicate proof. Images in the first two drives used full SHA256. Nothing was deleted or consolidated. NODE NAME used filename grouping only to space the initial visual sample; all files remain individually inventoried. EXIF dates are camera/file metadata, not independently verified dates.

The sampling method can miss isolated photographs and short scenes. The next online priorities include earlier potatoes, outdoor tomatoes, bean supports and the older self-sufficiency/value-added videos, recorded by ID in ONLINE-REVIEW.json. These are future leads, not claimed completed reviews. Existing September/drying-beans caches and their earlier review remain in the preceding cover study; no retired exports were recreated.

## Print implications

A 185 × 240 mm front panel at 300 ppi needs about **2185 × 2835 px before bleed**. A 3840 × 2160 landscape frame cropped to fill that portrait is approximately **229 ppi**; 1920 × 1080 yields approximately **114 ppi**. Native pixel counts alone do not guarantee sharpness, useful composition or clean title space. Smaller photographic panels may be preferable. Supplier template, final page count and wrap dimensions remain future production decisions.

## Evidence and reproducibility

- [LOCAL-INVENTORY.json](LOCAL-INVENTORY.json), [PHOTO-SCOUT.json](PHOTO-SCOUT.json), [VIDEO-PROBE.json](VIDEO-PROBE.json), [VIDEO-SCOUT.json](VIDEO-SCOUT.json): initial inventory, dimensions, sampling times and retained contact-sheet paths. Individual temporary video thumbnails named under `/tmp` are working intermediates; the contact sheets and shortlisted stills are the retained evidence.
- [NODE-INVENTORY.json](NODE-INVENTORY.json): individual new-drive paths and exact sampled IDs/ranges. Mixed personal/travel contact sheets were used temporarily and are not included in the cover gallery. The unreadable image was not repaired or modified.
- [SHORTLIST.json](SHORTLIST.json) and [ONLINE-REVIEW.json](ONLINE-REVIEW.json): resume from these rather than repeating the search.
- [build-review.py](build-review.py): reproduces the report/gallery from candidate copies and attached original sources. It does not scan drives or build the book.
- [CHECKS.json](CHECKS.json): PDF, image, metadata and link checks. All six PDF pages were rendered and visually inspected. This is report verification, not cover-design approval or supplier preflight. No app tests or main-book exports were needed.
