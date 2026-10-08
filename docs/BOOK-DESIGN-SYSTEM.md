# The Vegetable Guru — book design system

Consolidated 8 October 2026 from the selected covers, approved Compact Book v1,
approved contents/how-to and current opening-page proposals. This is the shared
design reference for the 185 × 240 mm paperback. It records existing choices;
creating this document does not approve unfinished designs or change any artwork.

## Authority and use

This document owns the book-wide colour, type, geometry and section relationships.
[Compact Book v1](BOOK-PRINT-STYLE.md) owns detailed vegetable/Troubles composition
and fit behaviour. The [asset registry](assets/README.md) identifies actual source
files; its linked manifests establish exact approvals. The
[handover](handover/START-HERE.md) owns current scope, decisions and next work.
Latest instructions from John take precedence. Preserve the separate A4 contracts.

Editable words and image references live in the shared
[book-layout JSON folder](../../hackriculture-data/book-layout/README.md).
Use its validated builders for new working opening proofs; shared style rules
stay here and in their existing CSS. Frozen source proofs remain unchanged.

Status labels below distinguish **approved** designs, **selected** visual
directions and **working** proposals/adaptations. Working values are useful
starting points, not new approvals. A section-specific rule is intentional;
consistency does not require the same title size or grid on every page.

## Identity and colour

Front title: **The Vegetable Guru**. Subtitle: **Your at-a-glance growing companion**.
Keep the front free of the removed guide-count footer. The back uses the title
and **44 growing guides and 14 troubleshooting guides**, with the current price,
blurb and ISBN/barcode area as directed in the handover.

The established interior colour vocabulary is:

| Role | RGB hex | Use |
| --- | --- | --- |
| Warm paper | `#fff8e9` | General opening pages and most guide families |
| Main ink | `#173e2c` | General opening-page text; family ink overrides in guides |
| Forest green | `#064d32` | Strong panels and cream-on-green contrast |
| Harvest orange | `#ff781f` | Bright accents; preserve calendar harvest meaning |
| Deep orange | `#a44007` | Warm display emphasis and root-family headings |
| Pale peach | `#ffe1b7` | Supporting fields, including the contents Troubles panel |
| Light green | `#d6ea9b` | Supporting fields and established calendar keys |
| Quiet rule | `#d4d6bf` | Opening-page dividers and dotted navigation rules |

Use dark text on pale fields and cream text on sufficiently dark fields, following
the existing proofs. Do not make small explanatory text depend on a pale accent
alone. The selected cover rasters contain tonal variations; these interior tokens
are not permission to recolour the selected images or claim exact cover ink values.
These are RGB design values, not a confirmed CMYK/press specification.

### Family Tint

Retain the family system in guides and contents headings. Exact `ink`, `dark`,
`deep`, `accent`, `soft`, `wash` and `paper` values live in the existing
[familyThemes.json](../src/print/familyThemes.json), derived from the approved
[Family Tint study](vegetable-style-pilot/group-colours/TINTED.html). Reuse those
tokens instead of maintaining another palette file. Main heading/paper pairs:

| Family | Deep heading | Paper |
| --- | --- | --- |
| Root Crops | `#a44007` | `#fff8e9` |
| Brassicas | `#386337` | `#fff8e9` |
| Peas & Beans | `#586d2d` | `#fff8e9` |
| Salads & Leaves | `#2e694e` | `#f4f7ed` |
| Onion Family | `#754359` | `#faf3f6` |
| Fruiting Crops | `#a34332` | `#fff8e9` |
| Stalks & Shoots | `#316c65` | `#f1f6f2` |
| Other | `#795834` | `#fff8e9` |

Troubles uses the explicit group mapping in [familyTheme.ts](../src/print/familyTheme.ts),
including mixed-crop groups. Calendar usual/less-usual sow/harvest colours and
the sun/water/nutrition scales retain their meanings; do not recolour them merely
to match a family heading. Approved how-to diagrams explain those same signals.

## Typography

Use **Lilita One, weight 400**, for the established chunky display headings and
**Nunito Sans** for body copy, labels, folios and navigation. Keep component-specific
body/emphasis weights from the source styles; labels commonly use 800/900.
The local faces are declared in [local-fonts.css](../src/print/local-fonts.css).
Opening CSS calls the same bundled faces `Lilita` and `Nunito`; these are aliases,
not a choice of the separate Nunito font family. Keep local font loading and PDF
embedding. Do not identify the generated G2/B5 lettering as an editable font.

The following sizes describe the established hierarchy. Values are **points at
print scale 1**; in existing CSS, 1 px = 0.75 pt. They are not screen zoom sizes.
Use the relevant component role rather than a universal heading/body size.

### Approved guide and entry-page hierarchy

| Role | Size | Source/status |
| --- | --- | --- |
| Vegetable crop title | 57 pt starting size; measured fit for longer titles | Approved Kale reference, Lilita |
| Growing & harvesting title | 28.5 pt | Approved guide reference, Lilita |
| Vegetable section headings | 15.75 pt | Approved guide reference, Lilita |
| Troubles opening / continuation title | 25.5 / 21.75 pt | Approved compact reference styling, Lilita |
| Troubles condition heading | 15 pt | Approved reference, Lilita |
| Main guide advice, introduction, fact values | 9 pt; approximately 11.2–11.7 pt leading | Approved reference, Nunito Sans |
| Variety descriptions | 8.625 pt | Approved reference |
| Risk descriptions / pest table | 8.25 pt | Approved reference |
| Planting captions and measurements / explanatory notes | 7.875 / 8.25 pt | Approved reference |
| Contents title: first / continued page | 32.25 / 29.25 pt | Approved pages 4–5, Lilita |
| How-to title: calendar / scales page | 31.5 / 30.75 pt | Approved pages 6–7, Lilita |
| Entry-page section / family headings | 20.25 / 16.5 pt | Approved entry-page defaults, Lilita; local overrides remain in CSS |
| Contents crop / Troubles rows | 9.75 / 9.375 pt | Approved pages 4–5, Nunito Sans |
| How-to explanations / contents notes | 10.5 / 9 pt | Approved pages 4–7, Nunito Sans |

Sources: frozen [pilot.css](publication/book-pilot/pilot.css), maintained
[compact.css](../src/print/book/compact.css), and approved
[entry-pages.css](publication/vegetable-guru-entry-pages/entry-pages.css).
Preserve existing local overrides such as climate-key headings. Main guide type
must not shrink to force two pages; use sensible reflow and extra pages instead.

### Working title, publication and welcome hierarchy

These values are recorded from [opening-pages.css](publication/vegetable-guru-opening-pages/opening-pages.css)
for consistent continuation of the current proposal; pages 1–3 await approval.

| Role | Current proposed size |
| --- | --- |
| Title-page The / Vegetable / Guru | 24.75 / 58.5 / 82.5 pt, Lilita |
| Title-page subtitle | 15.75 pt, Nunito Sans 800 |
| Publication title / section heading / paragraph | 24 / 18.75 / 9.375 pt |
| Welcome heading / lead / main paragraphs | 38.25 / 13.5 / 10.5 pt |
| Welcome pull quote / author heading / author body | 19.5 / 19.5 / 9.75 pt |

Cover font selection, exact title/subtitle sizes and editable lettering remain
unresolved. Use the selected composition and visual weight when preparing those
proofs; adopting an interior font for the cover would be a proposal, not a match
already established by the raster concept.

Folios are an explicit profile exception: the frozen guide proof uses 6 pt;
the working supplier profile raises guide footers and sub-7-pt utility labels
to 9.4 CSS px (7.05 pt). The approved compact entry footer is 9.8 px (7.35 pt).
Do not propagate the older small proof labels into production or treat the
utility minimum as a target body size. See [production.ts](../src/print/book/production.ts).

## Page geometry and spacing

All dimensions below are measured from **trim**, not the bleed edge.

| Profile/component | Existing geometry and status |
| --- | --- |
| Book trim | 185 × 240 mm, approved format |
| Ordinary guide proof | Mirrored 15 mm inside / 10 mm outside; 160 mm body width; approved reference profile |
| Bookvault working interior | Mirrored 17 mm inside / 8 mm outside; same 160 mm width; 3 mm all-round bleed; 191 × 246 mm MediaBox |
| Bookvault text safety | Working template checks: 17 mm at binding, 5 mm at other trim edges; supplier acceptance remains separate |
| Contents/how-to | Approved 17/8 mm mirrored sides; 12 mm top and 18 mm bottom content padding |
| Title/publication/welcome | Proposed 17/8 mm mirrored sides; 14 mm top and 18 mm bottom content padding |
| Footers | 8 mm from trim bottom; align horizontally to that page's body margins |
| Content-to-footer gap | At least 3 mm measured clearance in the current book fit check |

Even folios are left/verso and odd folios right/recto. Decorative guide headers
may reach the trim/bleed edge; informative text and diagnostic drawings must remain
safe. Guide header space is shaped by its composition, not the opening pages'
top-padding rule. Do not impose interior gutters on front/back covers: a final
cover wrap follows the confirmed stock, spine and supplier template.

Preserve section grids: contents use a 9 mm column gap; practical vegetable
columns use 18 CSS px (about 4.8 mm); Troubles uses 20 px (about 5.3 mm).
The source styles own finer spacing. Keep aligned text edges and a clear reading
order; do not force a new universal baseline grid over the accepted layouts.

The [Bookvault profile](../src/print/book/bookvault.css) changes binding allocation,
not body scale. [DEVELOPMENT](../DEVELOPMENT.md#compact-book-exports) owns export
and normalisation mechanics. Screen previews may omit bleed and add cover leaves;
their page total is not the interior count used for print costing/spine calculations.

## Section treatments and sources

| Area | Carry forward | Status/source |
| --- | --- | --- |
| Front cover | G2 cream title centre; flush vegetable tiles above/below; bold dark lettering; no count footer | Selected [G2 artwork](publication/vegetable-guru-grid-variations/assets/G2-centre-title.png); final editable artwork/wrap pending |
| Back cover | B5 dark green; cream title/count subtitle; left blurb and slightly angled torn fragments at right; price and ISBN area | Preferred [B5 artwork](publication/vegetable-guru-back-collage/B5.png); generated snippets must become exact book crops for production |
| Title/publication/welcome | Cover-related title strip, quieter publication page, illustrated welcome and retained author-image slot | [Pages 1–3 proposal](publication/vegetable-guru-opening-pages/REVIEW.html); lipsum/metadata placeholders remain |
| Contents/how-to | Family-coloured navigation; illustrated calendar keys, difficulty and needs explanations; page references from the actual assembly | [Approved pages 4–7](publication/vegetable-guru-entry-pages/REVIEW.html); exact approval in the central manifest |
| Vegetables | Expressive hero/circle/sticker opening, useful information hierarchy, practical continuation and full-width Final Tips | Approved [guide contract](BOOK-PRINT-STYLE.md#vegetable-opening-page); collection review remains separate |
| Troubles | Open two-column entries, complete diagnostics, Recognise / Act / Prevent hierarchy, aligned first/last text with sparse-page exceptions | Approved [guide contract](BOOK-PRINT-STYLE.md#troubles); no enclosing equal-height cards |

Shared character comes from colour, typography and illustration language, with
different information densities. Keep cover tiles rectangular and flush; do not
spread that grid across editorial pages. Rounded/asymmetric supporting fields,
small tilted ribbons and fine rules retain their existing roles. A diagnostic
entry stays open even when a contents panel has a coloured background.

Cover C remains an A4 approval and a book colour/style reference only. Preserve
its original files and the approved A4 entry pages. The compact entry adaptation
retains their useful explanations; this system does not reopen discarded sections.

## Illustration and reuse

Decorative vegetables use the bold simplified silhouettes, broad colour planes
and graphic highlights of the approved heroes. The
[artwork skill](../.agents/skills/vegetable-guru-artwork/SKILL.md) owns generation
and direct-reference comparison. Use existing assets before creating more.

Preserve separate visual roles: decorative heroes may be cropped; diagnostic,
planting and explanatory artwork must keep its useful detail and full meaning.
Do not redraw the latter to resemble cover vegetables. For related headers on
facing pages, use distinct compositions in the same style rather than duplicated
or mirrored images. Record allocations against the stock registry to prevent
accidental repetition. Repetition of functional symbols is intentional.

The [rough progress preview](publication/bookvault-progress-preview/REVIEW.html)
tests H1/H2 contents, H5/H6 how-to, H3 welcome and S1 author artwork. These are
proposed placements; the approved original page files remain the references.

## Changes and unresolved decisions

For a new page or element, begin with the closest established role and section
treatment. Any new font, colour role, type tier or structural treatment should
be a visible proposal alongside the relevant existing page. Compare individual
pages and facing spreads; maintain continuity without forcing identical layouts.
After John's decision, update the owning rule here (or the detailed guide
contract), the affected working implementation and its approval/source record.
Do not create another competing style guide or overwrite a frozen proof.

Open decisions remain: finished cover typography and exact snippets; pages 1–3
design/copy and publication metadata; stock-image allocation; inside-cover use;
blank-page policy; stock-dependent wrap/spine and final print colour/detail checks.
Consult the handover for their latest status. Creating this system does not
resolve them or authorise guide regeneration, publication or a physical-proof order.
