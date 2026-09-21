# Troubles condition background cleanup candidates

Local, non-generative preparation area for removing baked checkerboard backgrounds
from the 220 condition images currently referenced by the canonical shared Trouble
records. Originals remain unchanged. Candidate files are review-only and are not
installed in shared records by this work.

The authoritative association is the condition image path read through
`../hackriculture-data/lib/records.mjs`; filenames are not used to infer subjects.

## Files

- `prepare.mjs`: inventory, conservative edge-connected background cleanup, and
  labelled contact-sheet generation.
- `install-reviewed.mjs`: guarded one-shot canonical path/hash installation after
  visual review; uses the shared writer and exact preceding-byte backups.
- `manifest.json`: resumable per-condition inventory. Paths are project-relative;
  every candidate records source and output SHA-256 hashes.
- `reports/`: quantitative summaries and labelled before/after contact sheets.
- Candidate PNGs: `public/images/troubles/cleaned/<group>/<condition>-v1.png`.

`status` is `candidate`, `needs-review`, or `skip`. A candidate means only that a
mechanical output exists; it is not approval to install it. Review the contact
sheets and selected full-resolution pairs before any record changes.

The cleanup is intentionally bounded: it may change only light, near-neutral,
edge-connected pixels matching background evidence from the image border. It
does not crop, resize, redraw, synthesize, or alter pixels outside that mask.
Because antialiased edges can themselves be pale and neutral, the manifest reports
changed-pixel counts rather than claiming the subject is pixel-identical.

## Completed checkpoint — 21 September 2026

The inventory classifies 177 images as checkerboard-likely and 43 as
plain-white/transparent. The 43-image unaffected set was visually reviewed in
four labelled sheets without finding a missed checkerboard. All 177 candidates
were reviewed in 30 six-pair before/after sheets. This included pale cauliflower,
fine foliage and roots, white bulbs and leaf tips, powdery mildew, mould and pale
larvae. No visible subject loss, residual enclosed checkerboard or unsafe
exception was found. The mask audit records zero changed pixels outside the
declared light-neutral limits; this is not a claim that pale neutral subject-edge
pixels are pixel-identical.

The guarded installer changed only each reviewed condition's `image` and
`image_revision`, plus the approved layout's binding `source_signature`. It
installed 177 paths across 11 groups in one shared-writer transaction. Exact
preceding-byte backup:

`../hackriculture-data/backups/admin/2026-09-21T10-56-57.703Z-c7b8d85e-f0d1-4b25-ad28-332e8bba50ab/`

Post-install revision:
`375c9a20dfd4ab73df1e771afbc1c8ecd992539a04e0fbb1ab8119a7bb947233`.
All 220 image paths exist and their stored SHA-256 revisions match; all 14 layout
signatures and 660 approved AI-field signatures remain current. Shared-data
verification reports 44 vegetables, 14 trouble groups and eight vegetable groups.
