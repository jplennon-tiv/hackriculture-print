# Contents: approved four-column colour key

3 November 2026. **Approved by John and integrated**, following his request to move
the page-5 image below the left column and make the colour key full width with
four columns. [Exact approval](APPROVAL.json). The frozen proof retains its earlier
draft labels as historical evidence.

[Review and comparison](REVIEW.html) ·
[Two-page PDF](../../../output/pdf/contents-key-reflow/contents-preview.pdf) ·
[Page 5 image](imperial-2.png) · [Facing contents](imperial-spread.png).

## Accepted changes

- Move the existing H6 harvest basket directly below Vegetable Troubles, centred
  in that column. Keep its accepted 45 × 33.75 mm size and original artwork.
- Extend the pale roots.wash key across the 160 mm text width. Eight labels form
  four columns of two, preserving the accepted down-column category order.
- Keep the 8 pt key labels, 10 pt key heading, colours and rounded panel treatment.
  The panel is now about 19.7 mm high instead of the former 34 mm band.
- Restore page-5 list padding to the earlier 2 CSS px per side, from the current
  0.9 px. Reading type remains 10.5 pt; all labels and page references are retained.
- Page 4 is unchanged. No gardening copy, shared book JSON or page order is edited.

The approved source is the [30 October contents/key composition](../contents-colour-study/key-preview/APPROVAL.json),
with current folios and the pH/turf rows from [the integrated derivative](../contents-update/README.md).
Both header illustrations and the H6 basket are reused verbatim. H5 remains omitted.
The current contents renderer now reproduces this approved composition exactly.

## Evidence and reproduction

[Build checks](CHECKS.json) bind current input hashes, DOM measurements, preserved
rows/key labels and both unit proofs. [PDF checks](PDF-CHECKS.json) verify text,
fonts, geometry and the unchanged first page; [visual review](VISUAL-REVIEW.json)
records inspection of the actual rendered PDFs. Page-5 content clears the footer
by 4.33 mm in both units. This is a focused contents proof; no complete book or
vegetable catalogue export was performed.

This proposal is frozen. Do not rerun `build.mjs` or `check-proof.py` against the
accepted files. The live continuation route is `npm run book:contents`, followed
by its PDF checks and the current main-book assembly. The original 30 October
source styles, approved proposal files and artwork remain intact.
