# Vegetable PDF rollout completed - 22 September 2026

**All 44 vegetables are approved. Zero drafts or unprepared crops remain.**
John approved the latest eight-crop set and explicitly approved all remaining
vegetables in advance. The final approval save covers those eight, potato,
greenhouse tomato, capsicum, mushroom and the refreshed kale proof.
The [approved register](FINAL-APPROVED-REGISTER.json) records every crop's saved
layout and tip count: 29 crops have two tips, eight have three, and seven have four.
Variation follows useful content and space, not a quota.

## Saved rules and final PDFs

The maintained [approved style contract](../VEGETABLE-PRINT-STYLE.md) now includes
John's completion decisions. Its **complete five-page printable hard copy** is
[Vegetable layout rules](../../output/pdf/vegetable-layout-rules-approved-2026-09-22.pdf)
(17.7 kB), with [source/PDF hashes and visual checks](LAYOUT-RULES-HARD-COPY.json).
The reproducible builder is `build-layout-rules.py` in this directory.

Each crop file below is two A4 pages. These remain separate files to keep previews
small; no large combined pack was generated.

| Final crop | Metric | Imperial |
| --- | --- | --- |
| Potato | [PDF](../../output/pdf/page-fill-review/potato-metric.pdf) | [PDF](../../output/pdf/page-fill-review/potato-imperial.pdf) |
| Greenhouse tomato | [PDF](../../output/pdf/page-fill-review/tomato_greenhouse-metric.pdf) | [PDF](../../output/pdf/page-fill-review/tomato_greenhouse-imperial.pdf) |
| Capsicum | [PDF](../../output/pdf/page-fill-review/capsicum-metric.pdf) | [PDF](../../output/pdf/page-fill-review/capsicum-imperial.pdf) |
| Mushroom | [PDF](../../output/pdf/page-fill-review/mushroom-metric.pdf) | [PDF](../../output/pdf/page-fill-review/mushroom-imperial.pdf) |
| Kale, refreshed | [PDF](../../output/pdf/page-fill-review/kale-metric.pdf) | [PDF](../../output/pdf/page-fill-review/kale-imperial.pdf) |

The previous eight files per unit remain available in
[batch 05](SMALL-PREVIEW-05-REVIEW.md), now approved. The final four rollout crops
reuse byte-identical checked page-fill proofs; kale was freshly exported from
its current corrected source. No unnecessary artwork regeneration took place.

## What changed

Kale's six stale editorial selections were refreshed from its already accepted
master, preserving conditional organic feeding, soil-test-led liming, separate
leaf/shoot harvest routes, and pest protection for both early and late crops.
Repeated advice was merged across widgets; detailed master prose was preserved.
The existing planting captions still match that source, so only their review
fingerprint changed. No planting captions, master advice or Troubles data changed.

Kale's full five-sentence introduction overflowed page one by about 10 mm; four
sentences overflowed about 5 mm. Three sentences with six varieties still
exceeded the budget by about 4 mm. The final three-sentence/five-variety selection
fits with about 1 mm bottom allowance. Tender-leaf picking and pest advice from
the two omitted introductory sentences remain in harvest/care/pest widgets.
Eight existing pest rows and two useful full-width tips remain. Fonts, padding,
artwork and the renderer were unchanged. Both units have zero column-bottom gap.

All 13 status changes were saved only after source/output signatures, renderer
hashes, readiness and proof hashes were checked. Approval is attributed to John;
AI:gpt-6-astra recorded the decisions. The other 31 records stayed byte-identical.

## Checks and evidence

- [Final 10 PDF checks](FINAL-ROLLOUT-CHECKS.json): five crops, both units,
  two physical A4 pages each; all 20 crop pages visually reviewed.
- [Kale measurement evidence](FINAL-KALE-CHECKS.json): current content and
  renderer checksums, loaded fonts/images, no warnings and measured alignment.
- [Ordinary export routes](FINAL-NORMAL-ROUTE-CHECKS.json): all 13 newly approved
  crops, both units, without draft-review flags; 26 successful readiness checks.
  Mushroom's known diagnostic is the only allowed warning.
- Read-only handover preflight passes for all 44 records and saved evidence.
  Shared data validation passes: 44 vegetables, 14 Troubles groups, eight groups.
- `npm test`: 247 tests passed across 22 files. `npm run build` passed with the
  existing large-chunk warning. `git diff --check` passed.
- Every new crop PDF and every rules-document page was rendered and inspected.
  Poppler's existing fontconfig warning did not prevent rendering.

## Saved state and restore points

Current shared revision:
`ef74442574b8150b3fc3ae3ce5cab7660b979af7bbe0b67f2d3083b1a45a12cd`.
[Approval receipt](FINAL-APPROVE-RECEIPT.json) records John's exact instruction,
13 changed keys and verified prior-byte backups at shared
`backups/admin/2026-09-22T15-15-46.336Z-8355077f-4b7a-43e3-9ac9-a6fa4a082c20`.

Kale's preceding transactions are separately recorded in
[extract refresh](FINAL-REFRESH-KALE-RECEIPT.json),
[icon correction](FINAL-FIX-KALE-ICON-RECEIPT.json),
[planting-source review](FINAL-REVIEW-KALE-PLANTING-RECEIPT.json),
[measured fit](FINAL-FIT-KALE-RECEIPT.json), and
[measurement save](FINAL-MEASURE-KALE-RECEIPT.json).
Each transaction verified exact previous bytes and preservation of unrelated
records. Do not blindly restore an older revision over later edits.

## Retained exceptions and next action

- John explicitly deferred speech-bubble overlap to a later task.
- Mushroom keeps sparse pages (roughly 53 mm unused at the bottom), no invented
  varieties and its approved kit-growing route. With no master sowing source,
  its existing `sowing_notes` fallback-selection diagnostic remains visible.
- Legacy catalogue normalisation findings remain in shared
  `planning/DATA-NORMALISATION.md`; that programme is paused. Print approval does
  not certify every legacy master claim or authorise public deployment.
- No new print task is pending. Preserve this approved state and wait for John's
  next instruction. Earlier pending-review statuses are historical.
