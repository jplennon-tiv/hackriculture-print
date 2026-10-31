# Lower contents key with a paler background

30 October 2026. John selected [option A](../APPROVAL.json), then found the first
key trial made the vegetable page cluttered. At his request, the revised proof
restores folio 4 to approved A, colours the Vegetable Troubles entries on folio 5
and returns the key to its lower panel beside the harvest basket. John preferred
this position after trying the key beneath Troubles, and requested a paler fill.
**John approved this complete composition on 30 October.** The
[approval record](APPROVAL.json) binds the exact PDF, both HTML editions and styles.
Integration into the main book remains pending; do not request approval again.

[Review PDF](../../../../output/pdf/contents-colour-study/contents-with-key.pdf)
· [Facing spread](spread.jpg) · [Revised second page](page-2.png)

Eight category labels use 8 pt Nunito Sans, weight 600, with 3 × 1.5 mm swatches,
in four rows of two, beneath a 10 pt heading, “Category colours”. The original
lower panel geometry is restored: 34 mm high, with 3 × 4 mm inset and opposite
rounded corners. Its fill uses the existing root-family `wash` (`#fff0dc`),
which is substantially paler than the preceding `soft` peach (`#ffe1b7`). The
token is read from the palette, not added as a separate colour. Names, swatches and Troubles entries use the
existing `deep` tokens from [familyThemes.json](../../../../src/print/familyThemes.json).
Troubles membership comes from the explicit mapping in
[familyTheme.ts](../../../../src/print/familyTheme.ts), including mixed-crop groups.
The 14 Troubles titles are 10.5 pt at weight 600, matching A; their folios retain
weight 900. Growing Techniques and all entries, order and references are retained.

H5 seedlings remains omitted from the preceding revision, as John allowed. H6
harvest basket remains at its existing size at the lower band's right edge;
both header illustrations remain. No replacement artwork was generated. The
first-page key, stronger peach fill and below-Troubles trials are superseded; approved A source
HTML/CSS/PDF remain intact.

[Checks](CHECKS.json) verify both units: two pages each, exact expected PDF text,
loaded images, no label overflow, and 4.06 mm clearance above the footer on page 5.
All contents row boxes and text are unchanged; the first-page render is
pixel-identical to approved A. Actual PDF colours for all 14 Troubles rows are
verified against the existing mapping, and unchanged glyph positions, sizes and
colours are preserved. The main book, how-to and shared JSON are unchanged.
[Visual review](VISUAL-REVIEW.json) records final page and spread inspection.

With Vite started through `start.command`, build using
`node scripts/build-contents-key-preview.mjs`, then run
`scripts/review-contents-key-preview.py` with bundled PDF Python. Sources are the
saved approved A HTML, guarded by approval hashes; `key.css` applies the revised
Troubles colours, pale key panel and lower artwork layout. These files are now
approved sources: preserve them and use separate paths for any further experiments.
