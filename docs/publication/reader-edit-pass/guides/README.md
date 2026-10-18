# Reader corrections — affected guide proofs

15 October 2026. Separate source-linked print derivatives for John's approved
A2/A3/A4/A7 scope and resolved D2/D3. These are review proofs, not a replacement
full book or publication approval. The holiday suggestion is excluded.

The final [manifest](MANIFEST.json) gives clean/highlight PDF paths, checksums,
review-page-to-current-folio mappings and actual-PDF text checks. The consolidated
[checks](CHECKS.json) contain all nine guides in both units, exact edits and source
conditions, typography/coverage checks, geometry and current navigation.
Images are `images/{imperial|metric}-{clean|highlighted}/folio-{folio}.png`.

| Guide | Current folios | Changes |
| --- | --- | --- |
| Carrot | 14–15 | Distinguish forking risks from properly used mature compost; August short-rooted sowing, October cloches, November–December crop. |
| Celeriac | 16–17 | Label the crown/soil-level fact **Planting depth**. |
| Cabbage | 36–37 | Label the selected Greyhound **Summer Cabbages**; keep its current description. |
| Lettuce | 56–57 | Slug signs; suitable August–early September varieties may overwinter in mild conditions or under cover. |
| Leek | 64–65 | May–July planting window with pencil-thick readiness. |
| Courgettes and Marrows | 72–73 | Replace repeated picking tip with after-frost clearance: compost healthy plants and remove virus-infected/badly rotted remains without spreading them. |
| Greenhouse Tomato | 82–83 | Canonical 64°F/18°C germination warmth; avoid nights below about 50°F/10°C; first true-leaf pair and root-fill stages; stopping often in August under unheated cover, leaving two leaves above the last useful truss. |
| Asparagus | 88–89 | Label 1 in./2.5 cm **Seed depth**; retain Row spacing. |
| Onion & Leek Troubles | 126–128 | Cut-back recovery remains conditional on enough growing season being left. |

All additions use the exact canonical records through the shared reader. D2 and
D3 also use John's explicit resolutions. The full source paths and retained
values are in `src/print/book/reader-edit-pass/guide-copy.json`; no lower-tier
substitutions were needed. Both Greyhound master entries are unchanged.

The builder imports the retained approved carrot/tomato two-page compositions
and current header treatment without editing them. It adds the current combined
Growing guide heading, folios and crop-specific See also references before the
reader corrections. All eight vegetables remain two pages; all 17 Onion & Leek
Troubles entries remain on their existing three pages. Pest rows, variety names
and descriptions, artwork, body font sizes and leading are retained.

Lettuce's existing growing columns use a 52:48 split to preserve the baseline
overall height. Its duplicated repeat-leaf sentence is consolidated into the
retained Harvesting explanation; the new note retains both sowing routes and
their conditions. No other vegetable column arrangement is changed. The
leek-moth page re-shares only space between complete entries to keep the final
text edges aligned. Both optional additions — late protected carrots and
August tomato stopping — fit in both editions.

Actual-PDF text checks cover 38 pages: 19 in each edition. Before edits, all 19
imperial pages have the same text-token coverage as their current assembled
folios in the frozen book (SHA256
`39d437e8571d92aca177c31a2da4e2f371dada19a5f66465e4826678ac747cd6`).
Six pages (16, 17, 64, 72, 88, 128) have extraction-order differences where
adjacent columns share lines; there are no extra or missing words. Those
differences concern Core needs, a celeriac harvesting line and a Troubles crop
label, not additional copy edits. After edits, the PDFs contain only the 28
listed edition-specific text replacements; clean and highlighted text matches.

All affected pages/spreads were visually checked in both units, including
headers, selected labels, planting captions, tables, artwork, current See also
references and footers. Highlights were also inspected on the tomato,
leek-moth and corrected asparagus changes. The smallest footer clearance is the
retained 2.68 mm on folios 17, 57 and 65; none is reduced from its baseline.
Production-safe-area checks pass. Exact 185 × 240 mm review boxes are set using
the current assembly convention, without scaling or moving content, to account
for Chromium's fractional-millimetre paper quantisation.

Checks confirm 22 original source/code inputs and all 18 retained approved guide
PDFs are unchanged. No canonical records, approved trials, frozen PDFs, shared
book copy, index, techniques, handover or full-book assembly were edited by this
guide pass. See [verification receipt](VERIFICATION.json).

Rebuild the bounded set with `node scripts/build-reader-guides.mjs`, followed by
the bundled Python running `scripts/build-reader-guides.py`. The first needs the
existing loopback Vite server; the second checks PDFs, assembles the four focused
packs and renders their pages. This does not export the full catalogue.
