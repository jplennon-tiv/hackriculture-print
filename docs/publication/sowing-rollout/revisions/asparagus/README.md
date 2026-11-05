# Asparagus one-off amendment

5 November 2026. [Review both editions](REVIEW.html). John approved this derivative,
including the six varieties, bottom-aligned drawings and Quick facts arrangement.
The [approval record](APPROVAL.json) freezes both editions and their source copy.
The complete review readers and PDFs remain available.

John requests bottom alignment of the three planting illustrations, superseding
the centre-alignment trial. Transparent PNG margins made the image boxes an
unreliable guide. Each unchanged drawing is positioned by its visible lower edge
(alpha > 8), with image dimensions and level captions preserved. This is a
placement correction, with no cropping or artwork editing. The visible lower
edges are 111.470 mm from the page top in both editions; the drawings move down
2.119 mm, 0.936 mm and 0 mm from their original positions. Captions start at
115.582 mm, leaving 4.111 mm clearance below the artwork.

The existing “lime very acid ground if needed” reference is retained verbatim,
as John explicitly requested. All existing prose is unchanged. Quick facts
group four short entries above the wider Plant crowns entry on the left, with
Row spacing, Ready in and From seed on the right, using a 54:46 overall split.
All eight facts and icons remain at the existing type sizes.

To use the opening page's spare space, a second row adds **Pacific Purple,
Mondeo and Guelph Millennium**, with short researched descriptions. These are
approved book-only additions, not additions to the master catalogue. The three existing
varieties and their descriptions remain exact. The six older reserve varieties
in the master were not promoted: the previous review had not established their
current UK availability. [Research and claim sources](../../../../../../hackriculture-resources/summaries/asparagus-variety-extension/research-notes.md)
explain the choice of three currently listed alternatives. Listings do not imply
stock is available now. The new row uses the existing three-column styling and
text sizes; the opening-page footer clearance changes from 36.14 to 13.01 mm.

Both editions retain two pages at 185 × 240 mm, folios 14–15, all four pest entries
and all three original planting images. Actual PDFs were inspected in both units.
[Exact amendments and original artwork/proof hashes](../../../../../src/print/book/sowing-rollout/revisions/asparagus.json),
[layout evidence](checks/asparagus.json), [PDF checks](checks/asparagus.verified)
and [preservation checks](CHECKS.json) record the result. The main book, original
full review and approved Artichoke amendments remain unchanged.

Reproduce only this derivative with `node scripts/sowing-rollout/build.mjs
--revision asparagus`, using Vite started through `start.command`, then
`scripts/sowing-rollout/finish.py --revision asparagus` in the bundled Python
runtime. An approval file in this revision directory prevents overwriting.
Canonical gardening JSON is unchanged.
