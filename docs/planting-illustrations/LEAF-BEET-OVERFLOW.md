# Leaf beet overflow diagnosis - 17 September 2026

## User decision - supersedes the proposed padding repair below

Later update: John reports a two-page browser-interface export and requests a
faster, basic-check rollout that includes all review results. The measurements
below describe the saved earlier baseline, not necessarily the current document.
Use current text/export on resume; see PROGRESS.md for the new review policy.

John explicitly requested no padding changes and will adjust the text manually.
Leave padding, typography and layout code unchanged. Preserve his text edits;
do not implement the earlier dense-table recommendation. Leaf beet remains
inactive until the revised text and illustrated output are checked in a future
authorised rollout. The measurements and experiment below are historical findings.

Read-only diagnosis requested with remaining credits. No application code,
gardening data, active layouts or PDFs changed/re-exported. Leaf beet remains
staged and inactive. Runtime state is the completed rollout03 checkpoint.

## Confirmed cause

Saved metric baseline pages 2 and 3 were rendered and visually inspected. All
page-two text remains on page two; only the bottom border/background tail spills
onto page three. This predates the illustrations.

Fresh browser checks used the renderer's 688 x 979 viewport, both units, fonts
loaded, zero broken images, print media. Measurements are identical in both units:

- A4 container minimum height: 978.89 px (259 mm printable height).
- Actual page-two height: 988.59 px, approximately 9.70 px too tall.
- Content-end sentinel: 971.59 px from page top.
- Container adds 16 px bottom padding and a 1 px computed bottom border.
- Six-row pests table: 415.02 px including its table header; enclosing card is
  442.34 px. The right column determines page height; left column has spare room.

The legacy check in useVegetableLayout.ts compares only the content sentinel to
965 px and nextPage2Trim accepts a 15 px overshoot. Here the gap is -6.59 px, so
it accepts the sheet, despite padding/border causing real PDF overflow. The newer
planting guard correctly refuses to build on that oversized baseline. Increasing
its budget would conceal the defect, not repair it.

## Non-persistent browser experiments

Only inline styles in an isolated headless page were changed; it was then closed.
Page-two innerText was asserted byte-identical before/after in each unit. Fonts,
line heights, widths, source text and row counts were not changed.

| Pests body-cell top/bottom padding | Table height | Content end | Container height |
| --- | --- | --- | --- |
| Original 4 px | 415.02 px | 971.59 px | 988.59 px |
| 3 px | 403.02 px | 959.59 px | 978.89 px |
| 2 px | 391.02 px | 947.59 px | 978.89 px |

Two-pixel padding saves 24 px across six rows and leaves approximately 10.41 px
below the usual 958 px planting content budget. Three-pixel padding also fits
the browser container, but leaves much less safety. No experimental PDF was
exported, so these results are a proposed repair, NOT pagination/visual approval.

## Historical proposal - not approved; do not implement

Use a leaf-beet-specific dense-table presentation setting (2 px top/bottom body
cell padding), leaving typography, content, page margins and other crops alone.
This is preferable to cutting a pest row or widening the left planting column.
Retain the planting overflow guard. Do not solve this by clipping overflow or
reducing the container's bottom padding alone.

Then activate the staged leaf-beet mapping and test both units with its two
existing illustrations. Let the normal bounded art fitter choose size; do not
assume from the text-only experiment that the illustrated card will fit. Compare
all existing visible notes and neighbouring content to rollout03 baseline.json.
Check real PDFs are two pages, fonts/images ready, and visually inspect page two
and its complete bottom border. Run focused/full print tests and build, plus the
four-crop both-unit regression required by AGENTS.md. No gardening data correction
or image generation appears necessary for the overflow repair.

A broader correction to legacy overflow/readiness accounting can be considered
separately: changing global trim logic now could silently remove advice on other
crops. This diagnosis does not authorise that wider behaviour change.

## Save points

Pre-note backup of progress/rollout docs and relevant original layout files:
`../hackriculture-data/backups/documentation/2026-09-17-leaf-beet-diagnosis.nqo3G5/`.
This directory also holds a copy of this diagnosis. Existing complete source,
master, assets and PDF restore point remains:
`../hackriculture-data/backups/documentation/2026-09-17-planting-rollout03-complete.x5Ejrd/`.

No application test rerun was needed for this diagnostic/documentation-only turn.
