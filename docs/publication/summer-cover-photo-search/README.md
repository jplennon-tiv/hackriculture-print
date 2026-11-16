# Real photographs for the cover — 15 November 2026

John requested that the current generated front be saved as **Version 1**, then a search of the mounted video drives and summer channel footage for genuine photographic alternatives. [Version 1](../cover-versions/version-1/Version-1.png) is an exact copy of front trial 10; [its receipt](../cover-versions/version-1/VERSION.json) records the source and checksum. It is a saved comparison, not production approval.

## Review files

- [Six-candidate contact sheet](Summer-Cover-Photo-Shortlist.png)
- [Four-page PDF: overview, originals and proposed strip crops](Summer-Cover-Photo-Shortlist.pdf)
- [Stills, retained carrot preview and source notes](Cover-Photo-Shortlist-Stills.zip)
- [Source manifest](SHORTLIST.json) and [readable source notes](SOURCE-NOTES.md)

**Current selected sources:** P04 courgette flowers above and P01 tomato trusses below. John liked the flower top in context but found P03 potatoes/hands less effective on the cover. [Exact selection](SELECTION.json). The requested [flowers-and-tomatoes front](../cover-refined-direction/revision-12-flowers-tomatoes/README.md) is ready for review. P02/P03/P05/P06 are not active cover candidates; all source files and earlier trials remain intact.

P01, P02, P03 and P05 are native 3840 × 2160 frames from newly reviewed camera footage. P04 courgette flowers and P06 carrot/beetroot are earlier archive-photo finds, included for comparison rather than claimed as new discoveries. P04 is copied from its original JPEG. **P06 uses the retained review JPEG:** its original `/Volumes/NODE NAME` drive is not currently mounted. It is retained only as an archived reference, not an active cover candidate. Its complete 1600-pixel width supplies about 220 ppi across 185 mm, before any bleed allowance.

## Actual search coverage

52 gardening/harvest clips spanning 301.4 minutes in the June, July, August and September 2026 folders on `/Volumes/Videos` were sampled. All 217 initial frames and 83 targeted follow-up frames were visually reviewed, followed by native-resolution checks. This was distributed sampling, not continuous playback of every clip. September was included for late harvest colour; the strongest red tomato frame is dated 30 September.

The May backup drive and older photographs had already been indexed by the [earlier photo search](../cover-photo-search/README.md); relevant entries were reused. Source files on all drives were read only. Fresh online access to the channel was throttled, so the delivered shortlist uses local originals rather than a claimed fresh review of online playback. **Times refer to the raw camera files, not edited YouTube episodes.**

The initial AVFoundation decoder could read metadata but could not decode frames in this environment. Software decoding with the locally installed ffmpeg succeeded for every requested scout frame. The apparent sweetcorn close-up resolved into a leaf at native resolution and was excluded; the lifted garlic was less effective in a narrow band and was also excluded.

## Preservation and checks

The selected PNG frames have no retouching, enhancement or upscaling. P04 is verified against its original hash; P06 is verified against its retained preview hash and clearly labelled. The full images, crop coordinates, source paths, seek positions and selected-file hashes are in the manifest. Crops are review proposals only. `build-shortlist.py` produces the PDF, preview and ZIP from the recorded sources; [checks](CHECKS.json) record verification and visual review.

No approved book pages, canonical JSON, original media, prior cover designs or supplier files were changed. No final cover selection or publication approval is inferred.

The first chat-file save failed and the local preview links did not load for John. **Delivery recovered:** [Cover-Previews.pdf](https://chatgpt.com/library?file_id=libfile_fde3_f-a1404bca9984819180d673c8149a3d10_968f6e806ba48191b80ffb1b7a35f663&account_id=personal) combines Version 1 and all four shortlist pages in one accessible five-page preview. Original local outputs remain intact. See [delivery receipt](DELIVERY.json).
