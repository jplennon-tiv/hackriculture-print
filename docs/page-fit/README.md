# A4 page-fit corrections — 24 September 2026

[Review the individual proofs](REVIEW.html). Broad bean, French bean, courgette/marrow,
garlic and radish now export as two pages in both units. All 20 candidate PDF pages
were inspected. Production exports have identical text, selected conditions and
DOM page coordinates; 17 raster pages are byte-identical, the other three have
less than 0.005% pixel differences and were visually rechecked.

## Decisions

- Keep approved typography, image sizes, padding, introductions, varieties, tips
  and saved layout choices. Six short Key Risks summaries use existing `short_text`;
  the original descriptions remain unchanged.
- Condense mouse controls in both bean tables, plus broad bean bird control and
  mouse signs. All original prose is retained verbatim in full master `text`.
- Restore broad bean's researched, crop-specific No Pods entry using explicit
  inline `applies_to`. Same-name shared French/runner advice must not exclude it.
  RHS supports watering broad beans at flowering for pod set:
  [watering guidance](https://www.rhs.org.uk/vegetables/watering) and
  [broad beans](https://www.rhs.org.uk/vegetables/broad-beans/grow-your-own).
- Broad bean retains eight distinct rows: restored No Pods ranks above No Flowers,
  which is omitted under the existing accepted limit. Full master advice remains.
  French bean retains seven rows; courgette seven, garlic six, radish six. No
  blanket count or first-overflow cutoff was used.
- Treat radish's two woody/hollow-root labels as one display identity. No master
  condition is deleted, and no unrelated crop is merged.
- Page-fit warnings now account for bottom padding and border, rather than only
  the old fixed sentinel budget. This catches narrow overruns previously missed.

## Preservation and verification

[Guarded save receipt](SAVE-RECEIPT.json): five records, exact prior-byte backups
verified, other 53 records unchanged. Existing section extracts, layout values,
locks and approval statuses preserved; changed fields carry honest AI attribution.
New summaries are presented for review, not self-approved. Layout dependencies and
measurement evidence refreshed. No shared Troubles changes or artwork changes.

26 focused tests, all 276 application tests, production build and shared schema
validation passed. The existing large-bundle build warning remains.
[Final proof measurements](FINAL.json); [all-crop scan](ALL-CROPS.json).
All 44 crops ready with fonts and risk images loaded. This is a metric HTML scan,
not a full-catalogue PDF batch.

Two separate warnings remain: mushroom's known missing sowing extract (not a
page-fit error), and a conservative 2 mm onion first-page budget warning. Extra
onion PDFs in both units are still two pages; metric pages visually inspected.
Its approved content is unchanged. [Onion check](ONION-CHECK.json).
Crop bubbles remain on John's own list, outside this work.

## Reproduction

Use `start.command` on loopback. `proof.mjs final` exports the five crops from
live production data. `prepare.mjs` / `save.mjs` capture this one-time migration;
the revision guard intentionally prevents rerunning against the changed master.
Historical candidate evidence is retained; do not regenerate it from current data.
