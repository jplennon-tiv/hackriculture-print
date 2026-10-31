# Supports — approved two-page section

30 October 2026. [Open the PDF](../../../../../output/pdf/topic-pages/supports-revised-draft.pdf)
or [facing preview](spread.png). **John approved the final copy, illustrations
and layout on 30 October.** [APPROVAL.json](APPROVAL.json) freezes the accepted
source bytes. The main book includes this spread at 162–163; its [integration record](../../../whole-book-order-preview/README.md) owns current assembly checks. This replaces the original 28 October Supports page. The adjacent
[Netting section is approved](../netting/APPROVAL.json) and remains unchanged.

The first page compares the simple traditional bean row and a circular wigwam,
then shows the pea frame without diagonals and the broad-bean stake/string layout.
The second separates a staked Brussels
sprout, an optional tomato cage without a central cane, and a bare frame explaining
side/end bracing. The final panel now describes fleece clipped to suitable cages
or frames as a temporary windbreak. Single-stake tomatoes remain a text alternative.
Nine separate images have clear instructional roles. The latest pass adds cane
pairs and plants between the original four pairs, preserving the corrected near/far
perspective. Two side-by-side pairs show driving a stake beside a mature brassica
before tying it, and curving/joining wire mesh before the finished tomato cage.

John's eight wording changes of 30 October are applied exactly, including the
heading “Outdoor tomatoes in cages”. The illustrations are unchanged. Small
spacing reductions on the right page accommodate the longer copy at the same
type size; the source note remains clear of the body.

[Editable copy](../../../../../../hackriculture-resources/summaries/plant-protection-supports/supports-copy.json),
[plain-text proof copy](../../../../../../hackriculture-resources/summaries/plant-protection-supports/supports-draft-copy.txt)
and [claim/source record](../../../../../../hackriculture-resources/summaries/plant-protection-supports/supports-revision-notes.md)
live in the research library. Canonical advice was read through the shared reader;
John's complete support/tomato transcripts were reread; RHS and the National
Botanic Garden of Wales fill the wigwam/tie gaps. The public wigwam photographs
were inspected, not reproduced. No canonical gardening record changed.

## Artwork and composition

[ARTWORK.json](ARTWORK.json) records the exact prompts, direct references,
generated origins and the [saved assets](assets/). Its current asset map identifies
the nine images used in this proof; earlier versions remain as source history.
Built-in image generation supplied the bean redraws, the broad-bean diagram,
construction pictures and portrait framing of the finished tomato cage.
The latest mature-brassica picture was reframed to preserve its complete leaf
edges. Earlier corrections removed unattached tomato ties and balanced the cage
pair. Original outputs remain intact; no image was altered through raster scripting.

The approved Netting spread and original Supports/Watering treatment supply the
cream background, green/orange Lilita headings, Nunito body, caption treatment,
mirrored margins and footer. Approved pea, broad-bean, French-bean and Brussels-sprout heroes
were inspected and used directly for the new crop drawing style. The practical
props retain the original Supports character, with simpler structure. All assets
use contain-fit without cropping, and their transparency was inspected on the
actual cream pages. The two bean options are open columns; the other examples
pair the drawings with their own explanations. Each construction/finished pair
occupies the existing 62 × 38 mm image area, with two 30 mm cells and a 2 mm gap.
The first page now gives broad beans a separate illustrated row. Bean/wigwam
image areas are 77 × 42 mm; the pea image is 62 × 32 mm and broad beans 62 × 28 mm.
No new book-wide style rule is set.

Proposed folios are **162–163**, following the accepted Netting 160–161 spread
and before Watering. These are review-placement assumptions; integration must
reconcile later references and production geometry. The current 168-page ordered
book, cover and earlier original two-page draft are untouched.

## Checks actually completed

- Two actual PDF pages, exact **185 × 240 mm** trim after normalising Chromium's
  fractional rounding. Complete body/caption copy is extractable; Lilita and
  Nunito glyph programs are embedded. All nine images loaded and there were no
  browser errors or unsafe/overflow blocks. [Measured checks](CHECKS.json).
- Body **12.6 CSS px / 9.45 pt**, lead 13.5 px and main display sizes are unchanged.
  Broad beans now use a section heading matching the adjacent pea section.
  Fit was achieved by removing surplus title/caption space and adjusting image
  heights, not shrinking prose. Content ends at **215.87 / 217.89 mm**, leaving
  **6.25 / 4.23 mm** before the source notes; source-to-footer gap is **3.56 mm**.
- Both final page renders were read at enlarged size and the final facing spread
  inspected at thumbnail size. No collisions, truncated diagrams or isolated
  single-word caption endings remain. Basic bean and pea frames have no diagonal
  braces; the bean frame has seven pairs and one ridge, with feet visibly
  separated across the bed; the cage has no cane;
  separate bracing joins the correct corner posts; brassica ties link stem/stake.
  Construction shows a mallet aligned above the stake beside a mature brassica,
  a steadying hand below, and mesh edges being joined. Broad beans have perimeter
  strings, corner/intermediate posts and a clearly readable double row.
- Compared with the original Supports page and approved Netting spread: practical
  subject clarity improved, shared type/colour/gutter treatment retained. The
  wigwam is a generic circular example with no specified pole count in the copy.
- The same unit-neutral copy covers metric and imperial editions. No crop guide
  export, application test suite, full-book rebuild, supplier preflight, CMYK
  conversion or physical proof was performed for this isolated revision.
- Exact approved Netting hashes, the original draft PDF hash, local review links
  and `git diff --check` were checked after the revision.

## Retained build route

The files are now frozen. Do not rerun these builders over approved sources; any
later revision needs separate outputs and explicit source reconciliation.


Use the project's `start.command` on loopback as documented in SETUP, then run
this folder's `build.mjs` with Node and `finish-proof.py` with the bundled PDF
Python (Pillow/pypdf and Poppler). The builder reads the library's Supports copy;
the finisher checks content/fonts, normalises trim and renders both pages/spread.
Do not run the parent builder or change its CSS for this revision: Netting's
approved composition imports that shared base. The review viewer itself is static.
