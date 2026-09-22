# Fuller vegetable proofs — 22 September 2026

John rejected the large bottom gaps in the overnight packs. These revised drafts
supersede both overnight combined packs; the same crop order and page index apply.

- [Metric review — 58 pages](../../output/pdf/vegetables-page-fill-metric-review.pdf)
- [Imperial review — 58 pages](../../output/pdf/vegetables-page-fill-imperial-review.pdf)
- [29-crop page index](OVERNIGHT-INDEX.json)
- [Both-unit measurements and PDF hashes](PAGE-FILL-CHECKS.json)
- [Restore transactions](PAGE-FILL-RESTORE.json)
- [Combined PDF hashes](PAGE-FILL-PACKS.json)

## Cause and correction

The A4 height and export margins were unchanged and correct. The overnight author
chose short introductions, compact care/harvest selections and two tips too often,
then checked overflow, physical page count and **column alignment**, but failed to
act on the remaining **page-bottom space**. Explicit saved content counts correctly
stop the automatic fitter from overriding editorial choices; the saved choices
were too conservative. Column alignment alone could leave both columns short.

Reconsidered all 29 overnight crops, starting from fuller useful original text.
Longer introductions now fit where possible. For dense crops such as marrow,
outdoor cucumber and squash, longer versions were actually measured and did not
fit alongside the retained variety choices; their shorter openings remain.
Restored numbered care/soil detail and fuller harvest instructions on the sparse
pages. Seven crops now have four useful tips in a saved two-column, two-row banner:
salsify/scorzonera, chicory, endive, Florence fennel, both artichokes and rhubarb.
There is no new universal tip or introduction count. Pest selections are unchanged.

Two optional layout fields make the selected content reproducible:

- `tips_columns: 2` gives the requested square arrangement without changing the
  normal full-width banner or existing column exceptions.
- `fill_bottoms: true` shares a modest measured remainder through existing
  flexible rows after natural fitting and image/font readiness. It resets before
  each measurement, never shrinks overflow and refuses gaps above 96 px (25.4 mm).
  Large content shortages therefore remain visible for editorial attention.

Fonts, minimum padding, artwork, margins, planting companions and approved
records are unchanged. New measurement-bearing text uses separate metric and
imperial strings. All edits to gardening records are in the `ai_` print layer;
master advice and the paused normalisation programme are untouched.

## Measured outcome

Unused space is measured below the last content widget, excluding the normal
page-bottom padding and PDF margin. Rounded figures below are for metric proofs;
imperial proofs have the same final result on these examples.

| Crop/page | Before | Revised |
| --- | ---: | ---: |
| Salsify/scorzonera P2 | 46.9 mm | 1.0 mm |
| Chicory P1 / P2 | 26.3 / 40.5 mm | 1.0 / 1.0 mm |
| Endive P2 | 45.1 mm | 1.0 mm |
| Florence fennel P1 / P2 | 47.2 / 47.7 mm | 1.0 / 1.0 mm |
| Outdoor tomato P1 | 24.3 mm | 1.0 mm |
| Aubergine P1 / P2 | 24.4 / 16.7 mm | 1.0 / 1.0 mm |
| Globe artichoke P1 / P2 | 23.5 / 28.9 mm | 1.0 / 1.0 mm |
| Jerusalem artichoke P1 / P2 | 35.1 / 63.9 mm | 1.0 / 1.0 mm |
| Rhubarb P1 / P2 | 36.3 / 37.2 mm | 1.0 / 1.0 mm |

All 58 final individual PDFs have two physical pages, loaded fonts/images,
unchanged pest selections, correct explicit tip icons and aligned column bottoms.
Across the 28 crops other than mushroom, the largest remaining bottom gap is
about **1.1 mm**. Physical checking caught a marginal parsnip third page missed
by the conservative warning threshold; one introduction sentence was removed
before the final export. Rhubarb harvest prose was consolidated and a seed note
duplicating its protected planting caption was removed to retain safe fit.

Visual inspection: salsify metric P2; chicory imperial P1 and metric P2; endive
imperial P2; fennel imperial P1 and metric P2; outdoor tomato metric P1; aubergine
imperial both pages; globe artichoke metric both pages; Jerusalem artichoke
imperial both pages; rhubarb metric both pages. Four-tip banners and final bottom
borders are intact. Other previously logged speech-icon/alias issues remain
outside this whitespace correction.

## Checks and remaining exception

22 focused tests passed; the full suite passed **247 tests** and the build passed
with its existing bundle-size warning. Shared integrity passed (44 crops / 14
trouble groups / 8 vegetable groups). Final read-only preflight passed with the
explicit existing kale and mushroom warnings.

Ten regression PDFs for carrot, broccoli, cauliflower, kohlrabi and celery were
checked in both units. All **20 pages are pixel-identical** to the prior checked
proofs at 1000 px. Exact code-transition hashes and comparison evidence are in
[PAGE-FILL-CODE-CHECKS.json](PAGE-FILL-CODE-CHECKS.json) and
[PAGE-FILL-PIXEL-CHECKS.json](PAGE-FILL-PIXEL-CHECKS.json). Historical approval
evidence has not been rewritten; preflight recognises the verified opt-in change.

**Mushroom remains sparse:** its fuller introduction reduces P1 unused space from
83.2 to 52.7 mm; P2 retains 53.3 mm. It has no varieties and little appropriate
additional kit-route content. Its unsafe/obsolete homemade remedies were not
restored, nor were missing varieties invented or a large blank stretched away.
It also retains the documented missing-sowing-source contract warning. A different
composition for this exceptional crop needs a separate design decision. Kale
and the overnight report's other data-review exceptions remain unchanged.

All revised records are **draft**, pending John's review. Nothing was published;
the completed overnight automation remains paused. Do not rerun historical
one-time author scripts over these newer extracts and measured layouts.
