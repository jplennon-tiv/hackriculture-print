# Page 9 · Expanded calendar explanation

22 November 2026. **Earlier proposal, superseded by [John’s text revision](../calendar-text-revision/README.md).** John requested removal of “Vegetable index” and an expanded Calendar panel based on the variations now used in the guides. The installed page and approved guide PDFs remain unchanged.

[Full-size page PDF](../../../../../../output/pdf/page-9-index-review/calendar-revision/Vegetable-Guru-Page-9-Index-Proposal.pdf) · [Latest online proof](https://chatgpt.com/library?file_id=libfile_fde3_f-d4ba6ad38d2c8191aa597255b49eb66f_968f6e806ba48191b80ffb1b7a35f663&account_id=personal) · [Page preview](page-preview.jpg) · [Calendar detail](calendar-detail.jpg).

## What the guide review found

The read-only audit covers the latest approved, hash-bound HTML and PDF for **all 44 vegetable guides**. All source hashes and PDF row labels were checked. Ten representative PDF calendar excerpts were also visually inspected: carrot, runner bean, leek, greenhouse tomato, globe artichoke, potato, onion/shallot, garlic, rhubarb and mushroom. See the [audit](CALENDAR-AUDIT.json), [PDF checks](SOURCE-PDF-CHECKS.json) and [visual evidence sheet](calendar-evidence.jpg).

| Calendar row | Guides using it |
| --- | ---: |
| SOW | 32 |
| SOW INDOORS | 12 |
| PLANT OUT | 14 |
| TRANSPLANT | 6 |
| PLANT UNDER GLASS | 2 |
| PLANT TUBERS | 2 |
| PLANT CROWNS | 2 |
| PLANT OFFSETS | 1 |
| PLANT CLOVES | 1 |
| PLANT SETS | 1 |
| START KIT | 1 |
| HARVEST | 44 |

Green identifies starting/planting work and orange identifies harvesting. Bright bars mean usual months; muted bars mean less usual months. Family background colours vary, and the retained leek sample has a slightly different green shade, without changing that meaning. The old “Normal planting / Extended season” explanation does not fully describe these expanded row types.

Some calendars offer alternative starting methods rather than a compulsory sequence. “SOW” cannot be defined universally as outdoor sowing: for example, endive’s sowing row includes an indoor option explained in its guide. The new panel therefore refers readers to the crop’s notes rather than inventing a single interpretation. The special leek note is also retained in its source; the opener does not replace crop-specific qualifications.

## Proposed panel and fit

The **160 × 80 mm** peach panel uses an actual four-row runner-bean calendar, with its exact approved months and row order. A two-colour, two-intensity key explains sowing/planting and harvesting. Brief text covers alternative starts, transplanting, planting under glass and the specialised planting materials. [Proposed wording and month data](PANEL-COPY.json).

The example is bound to the [approved runner-bean proof](../../../../sowing-rollout/revisions/bean_runner/APPROVAL.json): SOW May–June, less usual July; SOW INDOORS April; PLANT OUT May–June, less usual July; HARVEST July–September, less usual October. No guide dates or canonical gardening advice were changed.

Intentional replacements: the old two-row illustration, climate pictures, “Normal planting / Extended season” headings and US-zone equivalence line are omitted. Their replacements explain the book’s actual calendar vocabulary and retain the need to consider protection, suitable varieties and local conditions. This is new explanatory copy for review, not a new approved rule or new crop advice.

The separate “Vegetable index” heading is removed. All **44 exact names and folios**, three **29 mm** original camera photographs, the approved opener title treatment and folio **9** remain. The pea photograph and index move up to give the panel more room. Index and panel body remain **10.5 pt**. The index-to-panel ink gap is **6.07 mm**; the panel has clear bottom padding. This replaces the [first page-9 proposal](../README.md) as the current review proof.

The final PDF was rendered and visually inspected at page and panel scale. All text extracts correctly; no text/image collisions or unsafe bounds were found. The chart is vector artwork and its text is selectable. [Geometry/text checks](CHECKS.json) · [Hash and visual-review record](REVIEW.json) · [Delivery](DELIVERY.json).

This page is unit-neutral; the audit used the latest approved imperial source pair for each crop and did not regenerate either edition. No shared JSON edits, full-book integration, supplier work or artwork generation occurred. The previous page proof and every approved source remain intact.

Rebuild only this proposal from the repository root:

```sh
swift -module-cache-path /tmp/vg-swift-module-cache docs/publication/overnight-2026-11-19/openings/page-9-index-review/calendar-revision/build-proof.swift
```

The [audit script](audit-calendars.py) and [PDF inspection script](inspect-source-pdfs.swift) preserve the read-only review process.
