# Current two-page contents

**22 November current contents:** the [approved swapped-header spread](../overnight-2026-11-19/openings/contents-no-category-colours/swapped-headers/APPROVAL.json) is now installed in the [current full book](../whole-book-order-preview/README.md). It uses seven 32 mm photographs, no category colours/key, plain folios and 84 entries after shortening Introduction and merging the duplicate Vegetable Guides entry. The older component workflow and dated evidence below remain historical; do not run them over the current approved spread.

[Review the contents](REVIEW.html), integrated at facing pages **4–5** in the
[current full book](../whole-book-order-preview/REVIEW.html).
The approved simple headings, chronological lists and H1/H2 header art remain.
The 31 October integration applies the [approved coloured composition](../contents-colour-study/key-preview/APPROVAL.json): category-coloured vegetable and Troubles names/folios, and the 8 pt key in a pale roots.wash panel. The [3 November approved reflow](../contents-key-reflow/APPROVAL.json) places H6 below the left column and the full-width key in four columns of two. H5 seedlings is intentionally omitted. There are no new section numbers or family/topic subheadings. Contents and index pages remain outside the layout-review skills' scope.

All **85 destinations** appear once at the retained **10.5 pt** reading size.
The current book has **176 interior pages**; Troubles begins at 99, Techniques at
147 and the index at **172–175**. Both unit proofs share these folios. Blank 8 faces
the approved three-panel Guides/how-to at 9. The original plain and illustrated
sources, and the accepted coloured/key proof, remain frozen.

The 3 November integration adds Lifting and using turf after Digging at 162.
Sowing is 163; Netting and Supports retain their facing spreads at 164–167;
Watering follows at 168 and Greenhouses at 169–171. The pH destination remains 152.
The [current derivative](current.css) restores the original 2 px row padding,
retaining type sizes, colours and art in the approved shallower composition. The accepted
colour-study sources are not overwritten.

Editable labels live in shared [contents.json](../../../../hackriculture-data/book-layout/contents.json).
Groups remain metadata and are preserved; the current renderer follows the
assembly’s alphabetical vegetable order in a flat list. Stable destinations
are resolved by [ASSEMBLY-PROPOSAL.json](ASSEMBLY-PROPOSAL.json) and
[TOPIC-FOLIOS.json](TOPIC-FOLIOS.json). The historical filename “proposal” now holds
the approved current placement map. The [guarded save](../whole-book-order-preview/integration-2026-11-03/BOOK-COPY-UPDATE.json)
records exact previous bytes. The earlier plain/illustrated proofs remain frozen
in `references/`; old folios in them are source provenance.

`npm run book:contents` retains the older two-page component workflow in both units and its placement plan; it is not the current approved photographic spread.
Use bundled Python/Poppler for `scripts/check-updated-contents.py`, then inspect
its renders. [Build checks](CHECKS.json), [PDF checks](PDF-CHECKS.json) and
[visual review](VISUAL-REVIEW.json) identify coverage. `npm run book:preview`
performs the complete integration; it does not regenerate the guide catalogue.

The retained component PDFs reproduce their earlier accepted contents proof in both units.
The [frozen review](../contents-key-reflow/REVIEW.html) preserves the comparison;
its draft labels are historical. Preserve the newer approved photographic spread during later work,
not the consumed proposal builder.
