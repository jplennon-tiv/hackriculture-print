# Vegetable guides — how to use

[Review both editions](REVIEW.html). The renamed one-page key is at interior page 9,
facing the Vegetable Guides intro at 8 in the rebuilt complete preview.
John requested this title/order and authorised full-book integration on 14 October.
The blank formerly after the key is now at 6, preserving the first crop at 10–11.

Source: [approved compact how-to](../vegetable-guru-entry-pages/REVIEW.html),
originally two pages. All three explanations and all nine instructional assets
are retained. The calendar's lowland-England / US-zone-8–9 qualification and
usual/less-usual meanings remain. Difficulty and Core Needs are condensed without
changing their meaning. Body explanations remain 10.5 pt. The calendar example
is 120 mm wide rather than 150 mm; the Core Needs example retains 80 mm width and
the approved crop of its duplicate raster heading. Native type checks do not
measure text inside raster examples; final physical/detail proof remains pending.

The H5 seedling header is smaller; the former H6 basket header is intentionally
omitted. Approved originals and all source images remain unchanged. Editable
copy stays in shared `book-layout/how-to.json`; its second header remains for
compatibility with the older two-page renderer. The current one-page composition
is owned by `scripts/lib/book-guide-key.mjs` and `guide-key.css`.

Run `npm run book:guide-key` with `start.command` active, then run
`scripts/check-book-guide-key.py` using bundled Python and Poppler. This produces
one Bookvault-format PDF per edition, with exact trim/bleed, text-block, font,
image and footer checks. [CHECKS.json](CHECKS.json), [PDF-CHECKS.json](PDF-CHECKS.json)
and [VISUAL-REVIEW.json](VISUAL-REVIEW.json) record the result.
[Guarded copy saves](../whole-book-order-preview/REFINEMENT-SAVE.json) retain exact
previous bytes. Full-book integration uses the [whole-book workflow](../whole-book-order-preview/README.md).
