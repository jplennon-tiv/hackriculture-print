# Cultivation heading correction

These notes describe the 18 October source proofs and their original folios.
The [19 October subsection derivative](../techniques-subsections/README.md) owns
current headings and placements. Rebuild it after changing these source proofs,
then refresh the full book; its source hashes must be reconciled explicitly.

John requested these four flowing headings on 18 October 2026. Each uses green
**Cultivation**, followed by the orange qualifier at the existing 31.5 / 22.5 pt sizes:

| Folio | Qualifier |
| --- | --- |
| 156 | Dig or No-Dig? |
| 157 | No-Dig |
| 158 | Digging |
| 159 | Digging continued |

The [frozen approved source](../topic-pages/cultivation-dig-no-dig/APPROVAL.json)
and [requested digging order](../digging-order/README.md) supply the original
content and layout. All five double-digging steps remain on 158; single digging
starts 159. John's subsequent [copy replacement](../../../src/print/book/final-text-edits/digging.json)
adds “There are two ways of digging:” to the introduction, with “Single digging”
and “Double digging” in bold, and changes the heading to “Double digging: start
a new plot, or revive a tired one”. All remaining words, type sizes and artwork
are preserved. These are
author-requested changes for review, not an inferred new design approval.

With the loopback app available, run
`node scripts/build-digging-order.mjs --cultivation-headings`, then the bundled
Python with `scripts/check-cultivation-headings.py`. These build and check only
the four affected pages in both units, registering exact proofs in the existing
final-edit manifest. Continue through the subsection route above before
`npm run book:preview` refreshes the current complete book.

[Source and fit checks](CHECKS.json), [actual PDF checks](PDF-CHECKS.json) and
[visual review](VISUAL-REVIEW.json) record the evidence. Each heading fits on one
line without reducing type. The heading colours and wording are checked in the
PDF itself. The two replacements and bold font are checked separately; all
remaining body glyphs and sizes match the retained sources in both units.
The revised page 158 retains 16.28 mm clearance to its source-proof footer.
