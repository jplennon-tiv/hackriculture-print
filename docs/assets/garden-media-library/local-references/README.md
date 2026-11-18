# Local location references

18 November 2026. [Open the offline reference board](index.html) or [view the five-page location contact sheet](https://chatgpt.com/library?file_id=libfile_fde3_f-a5ce50d3d35c8191a3098f7b9e7c5831_968f6e806ba48191b80ffb1b7a35f663&account_id=personal). The board opens 17 camera-original photographs, 16 full-resolution camera frames and two 35-second drone excerpts. The 22 home and 11 allotment stills include two comparison views, H09 and A03. The retained media occupy about 291 MiB on the Mac. The [source register](sources.json), [motion register](motion-references.json) and [seven-clip drone index](drone-index.csv) record the original locations, dates and camera seeks. Each local media copy has a checksum. The folders of working media and the HTML board are excluded from Git staging. Rebuild the board with [the local builder](build-reference-board.py) and Python with Pillow.

## Date and location screening

John moved to the current home in August 2016. Exclude earlier capture dates from both location sets. Check the setting for move-month images. Hold undated material aside unless independent evidence establishes its capture period. A file's modification date or the publication date of a film cannot date an inserted archive photograph. Photos of someone else's plot and generated or retouched pictures do not establish either setting.

The [capture-date screen](photo-date-screen.csv) uses the original capture date in the file's EXIF. Its IDs refer to the [two-drive inventory](../../../publication/cover-photo-search/LOCAL-INVENTORY.json) and [NODE NAME inventory](../../../publication/cover-photo-search/NODE-INVENTORY.json). It records decisions against the existing entries without moving source material. The two-drive column uses grouped image entries. Cross-inventory duplicates may remain.

| Inventory | Before August 2016 | August 2016 | September 2016 onwards | Date unresolved |
| --- | ---: | ---: | ---: | ---: |
| Two-drive image groups | 10 | 0 | 216 | 32 |
| NODE NAME archive files | 1,933 | 0 | 5,486 | 13 |
| Total | 1,943 | 0 | 5,702 | 45 |

These counts cover the two named inventories. In the earlier 42-entry catalogue, VG09 and VG12 are 2013 photographs and are excluded from location references.

## Wider source search on 18 November

- **Apple Photos.** The active local Photos library contains 1,373 non-trashed photographs across 188 capture days from 2017 to 2026. Its catalogue contained no video assets. Visually reviewed one photograph per day and a further event pass covering 151 photographs from 17 selected dates, with overlap between passes. The March 2024 construction and no-dig sequences came from these originals. H15 records the 2019 blue shed and greenhouse arrangement; date-specific backgrounds matter as the house and structures changed.
- **NODE NAME.** Visually sampled 65 date-eligible photographs across archive folder/month groups and 29 entries from specific March and April dates. N01968/N01969 show the near-identical 2022 bare-frame views. N03476–N03481 cover the 2024 ground and foundation. The three loose January 2026 DJI photographs at the drive root show printed book pages. The archive still contains thousands of date-eligible entries without an individual visual decision.
- **Videos and five_backup.** Looked beyond the old candidate inventories, including both movie trees, export folders, book-photo folders and the camera photograph collections. Reviewed 72 distinct candidate still files across selected named folders and the loose NODE images (matching filename and byte size suppressed for this visual pass). Then reviewed 26 frames from 13 April backup clips. The April At The Allotment folder mixes locations. Clips 0138/0139 show allotment beds and covers; 0143 shows the home garden, matched by its blue shed, greenhouses and house. A07–A09 were recovered as wider camera originals from Photos using the named allotment copies.
- **Other local material.** Checked the media filenames and folder structure under Documents/Photos, Book photos, Book, Backups and Disk Drill, plus Pictures, Downloads and the 4K Video Downloader folder. The loose Book photos directory is dominated by insulation and building photographs. USB backups include travel and family collections. Media discovery omitted hidden/system, software dependency, generated output and historical website-backup trees. No original was moved or removed.

## Drone footage

John identified the Home and Allotment folders on Videos. All seven camera clips were probed and 74 frames visually reviewed, spanning each clip from near its start to its end. The four home and three allotment clips total 32 minutes 50 seconds; all are 3840 × 2160. High town-wide views were passed over where a lower view provided clearer garden geometry.

| Local excerpt | Camera clip and raw time | Useful relationship |
| --- | --- | --- |
| [HM01, home](home-garden/HM01-0016-95-130.mp4) | 0016, 01:35–02:10 | The moving camera connects the beds and paths with the greenhouses, shed and house. |
| [AM01, allotment](allotment/AM01-0017-150-185.mp4) | 0017, 02:30–03:05 | The change of angle relates shed walls and rooflines to grass paths and covered beds. |

The excerpts are 1080p, with the original camera time ranges in the motion register. The 4K originals remain indexed on Videos. H11 gives the home plan from above; H12 reverses the sightline from the lawn. A04–A06 add the paved corner, shed roof and a lower angle along the covered beds. John identified his plot on page 4 of the [review PDF](Vegetable-Guru-Location-Contact-Sheet.pdf). In **A02** it occupies the left side, reaching almost halfway across the frame, and ends just beyond his pale green shed. The brown shed belongs to a neighbouring plot. In **A05** the pale green shed is his and his ground appears only in the bottom-right corner. Most of the frame shows the allotment behind his. Use A05 for the shed's appearance and A02 for the extent of the plot.

## Greenhouse and allotment evidence

- H01 is the original **DSC00335.JPG**, 5472 × 3080, 8 March 2022. The unglazed aluminium frame, masonry plinth, blue shed and fence are visible together. The earlier book photograph named greenhouse_base.jpeg is a cropped 1280-pixel copy. Match to the Photos original was checked by capture time and composition. A near-identical second shot seven seconds earlier was left out.
- H13 shows the March 2024 ground preparation beside standing glazing; H02 and H14 show the foundation three days later from two sides. H03–H06 show masonry, door detail, the small greenhouse threshold and the beds inside the larger greenhouse. Preserve the distinction between the two structures. The [earlier greenhouse research](../../../publication/topic-pages/techniques-expansion/GREENHOUSE-SOURCES.html) identifies the different bed arrangements. Do not join the 2022 frame and the 2024 foundation into a construction sequence without further evidence.
- H07, from the March 2026 home drone shoot, places both greenhouses, the blue shed, beds and paving in a single oblique view. H08–H10 come from May's four *Greenhouse Bases* clips. Both the May originals on Videos and the equivalent shoot folder on five_backup were located.
- A01–A03 are from three March 2026 allotment drone clips, showing paths, beds and adjoining sheds from different positions. Use the pale green shed to match these views. The frame positions John confirmed apply specifically to A02 and A05. Detailed subjects can then be matched to the June support footage.

## Channel comparison and downloads

The [first video cross-check](channel-crosscheck.csv) covers the 70 entries in the [8 October Videos-tab snapshot](../../../../../hackriculture-resources/local/hackriculture-youtube/CHANNEL-INVENTORY-2026-10-08.json). It omits Shorts, live videos and subsequent uploads. Live channel verification was unavailable this session. Renew the source list before calling the channel inventory complete.

Two entries have locally retained picture streams tied to their YouTube IDs. Six have likely finished exports matched by subject/title and a probed runtime within two seconds. Thirty-three have named raw shoot leads, including overlaps with complete edits. These are usable search leads, not frame-accurate matches. The 62 episodes without a matched finished copy are not a download queue. A transcript or audio track alone supplies no visual reference.

The search included the Videos and five_backup movie trees **and their separate To Upload folders**, the local Hackriculture 4K Video Downloader folder, the local channel resource folders and CapCut project video filenames. Generic or date-named files may still match. The October *Windy at the Allotment* export was found on Videos, outside the dated channel snapshot. Keep it as an additional local lead. The May backup has a 4K *Early May In The Greenhouse* export and raw footage also exists. Reuse that material.

| Priority | Episode | Reason |
| --- | --- | --- |
| First | [Greenhouse Cleaning and Repairs, 20 January](https://www.youtube.com/watch?v=-9YOuMxFFh8) | The saved transcript discusses a replacement pane and glazing clips in the real structure. No corresponding picture copy or clearly identified shoot was located in this pass. |
| Optional | [January at the Allotment, 18 January](https://www.youtube.com/watch?v=Xe6z-bRBzdg) | Winter tour of covered beds and paths. Useful for a different season if the local March aerial and summer ground views leave a gap. No matching finished copy was identified. |

## Next visual pass

1. Use the confirmed A02 and A05 landmarks when selecting further views for a teaching action. H16–H18 already record the cardboard, compost and finished stages of a single home-garden no-dig bed on 9 March 2024.
2. Map each setting separately, beginning with the aerial views and the fixed landmarks in ground-level photographs. Distinguish the particular greenhouse, bed or boundary and whether the scene has changed since it was photographed.
3. Keep selected originals and full-resolution frames locally. Retain a short clip locally only when a camera move or construction action explains more than individual frames. Keep its source in/out times. Index long rushes and duplicate backups where they live.
4. Build the generation skill after the location references are established. For the greenhouse test, use the 2022 construction evidence for structure and build stage, with a supported angle from the current garden references for context. Reserve H09 and A03 for comparison. Review the first generated artwork at the fixed Techniques illustration size.
