# Combined title and copyright trials · 22 November 2026

John requested several layouts combining the title page with the core copyright declaration and ISBN. He explicitly asked to omit the AI/design credit, source note and UK growing-conditions guidance from the book for now. John selected **C — Pictures above**. The [exact approval](APPROVAL.json) is now installed in the [updated book](../whole-book-order-preview/README.md), with former pages 2 and 3 removed. The four trials and prior book remain preserved.

[Open the delivered trials](https://chatgpt.com/library?file_id=libfile_fde3_f-f6316b2e5de4819188c3a38df6b4ef67_968f6e806ba48191b80ffb1b7a35f663&account_id=personal).

[Five-page comparison PDF](../../../output/pdf/title-copyright-trials/Vegetable-Guru-Title-Copyright-Design-Trials.pdf): a labelled A3 overview followed by A–D at actual **185 × 240 mm**. Print pages 2–5 at 100%, without Fit, for size comparison.

| Option | Composition | Pictures |
| --- | --- | --- |
| A | Familiar scatter, closest to approved option 01 | Pea and onion above; tomatoes and chard below |
| B | Two-picture balance | Tomatoes and chard beneath the central title |
| C | Pictures above | Tomatoes, pea and chard above a lower title block |
| D | Side column | Tomatoes, chard and pea at left; title at right |

All four retain the approved Lilita One/Nunito Sans families and sizes, cream/green palette, title/subtitle/author and “Traditional measurements edition”. No branding, imprint or visible folio is added. The footer uses 8.25 pt Nunito Sans and the existing copyright wording verbatim; only line wrapping changes. Copyright year and ISBN remain placeholders. All photographs are byte-identical existing approved assets. Courgette is deliberately omitted; other image omissions vary by option. Smaller placements keep the lowest effective resolution at **203.2 dpi**, without upscaling or redrawing.

[Source approval](../overnight-2026-11-19/openings/title-page-trials/mixed-size-variations/APPROVAL.json) · [copy, sources and layouts](VARIANTS.json) · [geometry checks](CHECKS.json) · [final review](REVIEW.json).

The native builder [build.swift](build.swift) produces four separate layouts and verifies text/image bounds and collisions. [finish.py](finish.py) assembles the overview and actual-size pages, checks complete copy and requested omissions, verifies source hashes and renders the final PDF. All four designs and the overview were visually inspected against the approved title and contents style. The trial creation used no app/browser export or shared JSON mutation. The later authorised installation is recorded separately; supplier files remain unchanged.

Installed sequence: combined title C at page 1, contents at 2–3, Introduction at 5 and Guides at 7. Former publication page 2 and blank page 3 are removed; downstream folios, references and navigation are updated. The title remains a right-hand page and all facing spreads are preserved. Final supplier pagination/spine remains a separate production check.
