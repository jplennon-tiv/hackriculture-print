# The Vegetable Guru — book design system

Consolidated 8 October; cover/source-status references updated 10 November 2026. Based on the selected covers, approved Compact Book v1,
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
Use its validated builders for the components they own; shared style rules
stay here and in their existing CSS. The installed introduction at page 7 instead
comes from the illustrated `why-grow` Techniques source; shared `introduction.json`
belongs to an omitted welcome layout. Consult the [source map](handover/START-HERE.md#resume-here)
before the requested rewrite. Frozen source proofs remain unchanged.

Status labels below distinguish **approved** designs, **selected** visual
directions and **working** proposals/adaptations. Working values are useful
starting points, not new approvals. A section-specific rule is intentional;
consistency does not require the same title size or grid on every page.

## Current navigation treatment

John approved the combined **Growing guide · <crop>** practical-page headings
and references limited to pages explicitly naming the crop on 15 October. See
[the exact approval](publication/whole-book-order-preview/references/navigation-approved-2026-10-15/APPROVAL.json).
Those additions are retained, with review highlights removed from the current book.

The approved navigation and heading treatment is:
- Use **Vegetable Guides**, **Vegetable Troubles** and **Growing Techniques**
  consistently in section navigation and related-reading labels.
- State **Imperial edition** once in the publication details; show only the
  folio on the right of the footer. Retain section identification at left.
- Every Growing Techniques content page uses a flowing display heading:
  a shared topic name in green, then a page-specific qualifier in deep orange.
  Related pages repeat the topic name. The small running title groups pages into
  the subsections below; a subsection can contain several related topic names.
  The established heading sizes are 31.5 pt for the shared name and 22.5 pt for the
  qualifier, both Lilita. Keep both parts on one line wherever they fit; wrap the
  qualifier only when needed, retaining it as a readable phrase. Do not force
  line breaks or shrink the type to avoid necessary wrapping. Keep body type,
  artwork and page count.

Cultivation uses “Growing Techniques - Cultivation” on all four pages. John's
18 October correction uses green “Cultivation” followed by orange “Dig or No-Dig?”,
“No-Dig”, “Digging” and “Digging continued”, respectively. The same treatment covers the current technique pages;
Introduction 7 and the section divider 145 retain their established roles.

John's 19 October subsection grouping is retained; these current folios include
the 3 November turf integration. The [working heading definition](../src/print/book/techniques-subsections.json)
and [native-page derivative](publication/techniques-subsections/README.md) own the
current presentation; earlier frozen proofs retain their dated titles.

| Current folios | Running title after “GROWING TECHNIQUES -” | Display headings |
| --- | --- | --- |
| 148–152 | ORGANIC GROWING | Core ideas; Nutrient cycles; Rotation & planning; Testing and adjusting pH |
| 153–155 | PLANNING A NEW PLOT | Choosing the right spot; Beds and paths; continued |
| 156–157 | COMPOST | Making compost headings |
| 158–162 | CULTIVATION | Dig or No-Dig?; No-Dig; Digging; Digging continued; Lifting and using turf |
| 163–168 | PLANT CARE | Sowing; Netting; Supports; Watering |
| 169–171 | GREENHOUSES | Greenhouses headings |

Current placement is owned by the handover and assembly plan. The pH page follows Rotation & planning; the 3 November turf page completes
Cultivation. Watering follows Supports to preserve Netting and Supports facing
spreads without restoring an internal blank. Native
bodies on changed sides shift 9 mm to retain 17/8 mm gutters; cream fills the full
page. Body type, artwork and frozen source proofs remain unchanged.

These changes apply to the whole-book screen preview. The individual guide
exporter, frozen references and A4 outputs retain their existing treatments.

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
| Pale peach | `#ffe1b7` | Supporting fields, including the combined Guides/how-to panel |
| Light green | `#d6ea9b` | Supporting fields and established calendar keys |
| Quiet rule | `#d4d6bf` | Opening-page dividers and dotted navigation rules |

Use dark text on pale fields and cream text on sufficiently dark fields, following
the existing proofs. Do not make small explanatory text depend on a pale accent
alone. The selected cover rasters contain tonal variations; these interior tokens
are not permission to recolour the selected images or claim exact cover ink values.
These are RGB design values, not a confirmed CMYK/press specification.

### Family Tint

Retain the family colour system in guides and approved reference contents.
John’s 30 October instruction places complete vegetable spreads in title
alphabetical order while retaining their family colours. Family blocks no longer
determine reading order. His current simple contents deliberately omits family
headings. John approved larger category names on both guide pages on 30 October:
10 pt Nunito Sans 900, uppercase, in the existing family deep colour, with the
practical title moved slightly down at its existing size. The
[scoped approval and exact examples](publication/category-navigation-preview/APPROVAL.json)
own this treatment; it is integrated across all 88 vegetable pages. The how-to colour key was
rejected, including its smaller title/hero adaptation. The how-to uses its separate approved three-panel revision at 9. John also selected [contents option A](publication/contents-colour-study/APPROVAL.json):
vegetable titles and folios use the existing category `deep` colour; titles retain
10.5 pt size with weight 600. It is integrated at 4–5. The separate
[complete contents approval](publication/contents-colour-study/key-preview/APPROVAL.json)
also covers Troubles titles/folios in their group colours and the key, with
root-family `wash` as its pale fill. The [3 November approval](publication/contents-key-reflow/APPROVAL.json)
places H6 harvest below the left column and the key across the full page width. H5 seedlings is omitted.
This approved composition is now integrated. Exact `ink`, `dark`,
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
for the retained original opening proposal. Current title/publication placement and approved copy are recorded in the handover; its omitted welcome page is not pending work.

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
The source styles own finer spacing. Follow each section's text-edge rules and keep a clear reading
order; do not force a new universal baseline grid over the accepted layouts.

The [Bookvault profile](../src/print/book/bookvault.css) changes binding allocation,
not body scale. [DEVELOPMENT](../DEVELOPMENT.md#compact-book-exports) owns export
and normalisation mechanics. Screen previews may omit bleed and add cover leaves;
their page total is not the interior count used for print costing/spine calculations.

## Section treatments and sources

| Area | Carry forward | Status/source |
| --- | --- | --- |
| Front cover | G2 cream title centre; flush vegetable tiles above/below; bold dark lettering; author name below subtitle; no count footer | Selected [G2 artwork](publication/vegetable-guru-grid-variations/assets/G2-centre-title.png); [native production adaptation and wrap](publication/bookvault-print-ready/REVIEW.html) used for the first physical proof; new cover work follows the handover |
| Back cover | B5 dark green; cream title/count subtitle; left blurb and slightly angled torn fragments at right; price and ISBN area | Preferred [B5 artwork](publication/vegetable-guru-back-collage/B5.png); production adaptation uses exact book crops in place of generated snippets |
| Title/publication | Cover-related title strip and quieter publication page | [Original pages 1–3 proposal](publication/vegetable-guru-opening-pages/REVIEW.html) retained; current assembly omits the welcome/author page. Metadata placeholders remain. |
| Contents/how-to | Simple illustrated contents with calculated page references; calendar, difficulty and needs explanations in the combined Guides opening | [Approved source pages 4–7](publication/vegetable-guru-entry-pages/REVIEW.html) remain frozen. The accepted [two-page contents](publication/contents-update/REVIEW.html) and [approved combined Guides/how-to](publication/combined-guides-opening/APPROVAL.json) are integrated in the full preview. |
| Index | Two open columns; 9.45 pt reading type, orange folios, ruled alphabet headings, continued labels, no decorative artwork | [Four-page index](publication/book-index/REVIEW.html), approved 12 October; [frozen sources](publication/book-index/APPROVAL.json); current integrated folios 172–175 |
| Section openers | Vegetable Guides: right-hand title/H4 artwork, centred orange how-to heading above three separate peach panels, revised calendar wording and two crop/badge examples. Troubles/Techniques retain their existing recto title-page proposals. | [Three-panel revision approved 31 October](publication/guides-intro-detail/APPROVAL.json), integrated on 2 November; blank 8 / combined 9 remains. The earlier [15 October version](publication/combined-guides-opening/APPROVAL.json) is preserved as source evidence. Other [14 October opener proposals](publication/whole-book-order-preview/SECTION-OPENERS.json) remain for review. |
| Vegetables | Expressive hero/circle/sticker opening, useful information hierarchy, practical continuation and full-width Final Tips | Approved [guide contract](BOOK-PRINT-STYLE.md#vegetable-opening-page); collection review remains separate |
| Troubles | Open two-column entries, complete diagnostics, small Recognise / Act / Prevent advice labels. Approved separate wrapping masks, 4 mm gap and 25% larger drawings. Natural book flow leaves unused space after the final content, with normal gaps and unequal lower edges where complete entries require them. The Brassica specimen is accepted for rollout: descending importance, bounded fit moves and separated pale panels with top-right ribbons and no panel border; alphabetical ties are withdrawn. All 14 guides now use exactly 24 approved Common Pest / Common Disease / Common Problem highlights; potato slugs remain ordinary. Both-unit [complete section proofs](publication/troubles-rollout/README.md) are built; these exact approved pages are now integrated in the main book. Explain the sequence on the opener instead of repeating the arrowed page header. | [Guide contract](BOOK-PRINT-STYLE.md#troubles); [image-treatment approval](publication/troubles-image-size-study/APPROVAL.json); [header revision](publication/troubles-header-refinement/README.md); no enclosing equal-height cards |

Shared character comes from colour, typography and illustration language, with
different information densities. Keep cover tiles rectangular and flush; do not
spread that grid across editorial pages. Rounded/asymmetric supporting fields,
small tilted ribbons and fine rules retain their existing roles. A diagnostic
entry stays open even when a contents panel has a coloured background.

Cover C remains an A4 approval and a book colour/style reference only. Preserve
its original files and the approved A4 entry pages. The compact entry adaptation
retains their useful explanations; this system does not reopen discarded sections.

John's 19 October production-review direction adds **John Lennon** to the front
and spine and gives the five intentional interior blanks (3, 6, 8, 98, 168) the
same warm cream as surrounding pages. On the selected white coated stock this
is a printed tint, continued through bleed. The current production adaptation
implements this and was used for the first physical proof. John accepted its
physical quality on 28 October. The requested cover reconstruction is a new
revision; its design and final geometry still need review.

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

The [current whole-book preview](publication/whole-book-order-preview/REVIEW.html)
uses the accepted H1/H2 contents headers, H6 lower-page decoration and pale category key. H5
remains on the one-page guide key and H4 on the Vegetable Guides opener. H3
welcome and S1 author remain in retained proposals; that page is now omitted.
Approved original page files remain the references.

### Approved navigation and combined opener

John’s latest correction replaces the numbered three-page contents with two
simple pages. John has confirmed this structure. Contents and index pages are
now explicitly outside the layout skills’ scope; use the agreed component design
and PDF checks directly.
Each page uses one Contents title (25.5 pt), plain section titles and 10.5 pt
reading rows. Section numbers, family/topic subheadings and explanatory notes remain omitted. The later approved category key is the only contents panel. With the approved pH and turf additions, all 85 current destinations are included.
The [3 November composition](publication/contents-key-reflow/APPROVAL.json) restores
2 CSS px vertical row padding on page 5, retaining 10.5 pt type. H1/H2 decorate
the headers; H6 harvest remains 45 × 33.75 mm beneath the left column with an
8 mm top margin. The pale key spans the 160 mm text width beneath both columns:
four columns of two, 8 pt labels, 10 pt heading, about 19.7 mm overall height.
The original down-column category order is retained. H5 remains omitted.
A short deep-orange rule accents each header.
The later 30 October approval of option A colours the crop names and folios by
category without changing their positions, size or the two-column list. The
approved revised proof keeps that page clear and uses matching Troubles colours
with a paler key panel low on page 5; the how-to key stays rejected.
These reuse the current house-style stock verbatim; John accepted the illustrated
contents for integration into the full preview. The plain baseline and accepted
illustrated 4–5 proofs are retained. The current sequence puts a blank at 3,
contents facing at 4–5, blank 6 and Introduction — why grow your own at 7.
The current complete preview retains John's approved opening sequence with
blank 8 / combined right-hand Vegetable Guides opener and how-to at 9;
Troubles 99 and Techniques 147 remain recto.

The shared guide-key title remains “Vegetable guides / how to use”. The
[31 October approved revision](publication/guides-intro-detail/APPROVAL.json)
uses “Vegetable Guides” with the unchanged H4 artwork, then “How to use the
guides” centred in deep orange **above three separate pale-peach panels**
(`#ffe1b7`). Retain 10.5 pt explanatory text, native calendar dates and Core Needs
values. Calendar copy uses John's UK wording and Normal planting / Extended
season headers. Difficulty has only radish 1/5 and outdoor tomato 3/5 badges,
each above its approved crop hero. Core Needs retains the dropper/wave, 1 and 5
endpoints and restored Low demand / High demand captions. The rejected third
example and numeric-only endpoint trial are superseded.

The exact accepted layout and dimensions are in the
[page source](publication/guides-intro-detail/README.md). This revision was integrated at page 9 on 2 November; the earlier
[15 October combined composition](publication/combined-guides-opening/APPROVAL.json)
remains a preserved source, not the current page.
Blank 8 / combined 9 and crop spreads beginning at 10 remain unchanged. Preserve
all earlier approved compact and A4 originals; do not back-port this revision.

## Changes and unresolved decisions

Retain the original light-green advice panels without a Top tip badge. John
[discarded the ribbon/splash proposals](publication/top-tip-panels/DECISION.json)
on 18 October; these are not a selected direction or a pending design task.

For a new page or element, begin with the closest established role and section
treatment. Any new font, colour role, type tier or structural treatment should
be a visible proposal alongside the relevant existing page. Compare individual
pages and facing spreads; maintain continuity without forcing identical layouts.
For illustrated topic summaries, use the book-design skill's
[composition workflow](../.agents/skills/vegetable-guru-book-design/references/illustrated-topic-pages.md)
to plan headers, reading order, copy/image allocation and visual revision. It
applies this system; it does not establish a new approved page template.
After John's decision, update the owning rule here (or the detailed guide
contract), the affected working implementation and its approval/source record.
Do not create another competing style guide or overwrite a frozen proof.

Next-session work covers revised artwork, introduction and cover text. The final
cover typography/snippets, publication metadata, stock-dependent wrap/spine and
revised print files remain to be settled. Retain the current opening sequence
and cream blank-page treatment unless John changes them. Consult the handover
for current scope; old proposal-stage questions are not a renewed work queue. Creating this system does not
resolve them or authorise guide regeneration, publication or a physical-proof order.
