# Smaller vegetable previews — 22 September 2026

**Approved by John:** all five crops below are now approved in canonical data.
Only status/audit metadata changed; source prose, extracts, layouts and the proof
files are unchanged. [SMALL-PREVIEW-SIGNOFF.json](SMALL-PREVIEW-SIGNOFF.json)
records the guarded save, exact prior-byte backup and proof hashes.
John clarified that Final Tips should vary from 2 to 4 useful items according to
space remaining after the important content is fitted. These five already use
four tips except outdoor tomato, which uses two.

Approval checks: all ten ordinary print routes use the approved content with
loaded fonts/images and no warnings. Shared integrity and the updated read-only
preflight passed. After updating preflight's explicit approval list, all 247
tests and the build passed (existing bundle-size warning). Exact preceding bytes
for all five records were verified in the transaction backup. No proof content
or layout values changed during sign-off.

John resumed the recovered task and prefers shorter PDFs. This first review
batch re-presents five crops flagged for excessive page-bottom space. Each file
contains one crop's two A4 pages, approximately 7–10 MB. These are byte-identical
copies of the saved page-fill corrections, preserving full image quality.

| Crop | Metric | Imperial |
| --- | --- | --- |
| Salsify & scorzonera | [PDF](../../output/pdf/page-fill-review/salsify_scorzonera-metric.pdf) | [PDF](../../output/pdf/page-fill-review/salsify_scorzonera-imperial.pdf) |
| Chicory | [PDF](../../output/pdf/page-fill-review/chicory-metric.pdf) | [PDF](../../output/pdf/page-fill-review/chicory-imperial.pdf) |
| Florence fennel | [PDF](../../output/pdf/page-fill-review/florence_fennel-metric.pdf) | [PDF](../../output/pdf/page-fill-review/florence_fennel-imperial.pdf) |
| Outdoor tomato | [PDF](../../output/pdf/page-fill-review/tomato_outdoor-metric.pdf) | [PDF](../../output/pdf/page-fill-review/tomato_outdoor-imperial.pdf) |
| Rhubarb | [PDF](../../output/pdf/page-fill-review/rhubarb-metric.pdf) | [PDF](../../output/pdf/page-fill-review/rhubarb-imperial.pdf) |

The saved changes restore fuller introductions and useful care/harvest detail;
salsify, chicory, fennel and rhubarb use four Final Tips in a two-by-two banner.
See [PAGE-FILL-REVIEW.md](PAGE-FILL-REVIEW.md) for the original correction,
measurement evidence and remaining exceptions. Review natural page balance as
well as bottom alignment; the drafts are not automatically approved.

## Checks performed in this resumed task

- Read-only preflight: no unexpected failures; existing kale source-review and
  mushroom fallback exceptions remain explicit.
- All ten source/output SHA256 checks match the previously checked proofs.
  Saved font readiness, image availability and warning evidence were checked.
- Reopened all ten PDFs: two physical A4 pages each. Rendered and visually
  inspected all 20 pages in both units; intact bottom borders, tip grids,
  artwork and text, without new clipping or overlap.
- Poppler emitted Type 3 glyph bounding-box warnings for fennel in both units;
  its rendered pages appear intact. Existing Key Risks duplicate labels and
  speech-icon issues remain outside this packaging change.
- [SMALL-PREVIEW-CHECKS.json](SMALL-PREVIEW-CHECKS.json) records sizes, hashes and
  rendering warnings. Only artifact copies and documentation were changed;
  no code, data, artwork or layouts changed, and application tests/build were
  not rerun. No server-based PDF regeneration was needed.

## Resume point

All five crops are approved. Next flagged crops to
re-present in the same small-file format: endive, aubergine, globe artichoke and
Jerusalem artichoke. The other corrected drafts remain saved; do not rerun
historical author scripts. Mushroom retains its documented sparse-layout
exception; kale/normalisation remain pending the existing review decisions.

Future assisted review defaults to one crop per PDF and separate unit files.
The existing combined packs are preserved but are no longer the default review
entry point. This does not alter the application's browser batch export.
