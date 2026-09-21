# Transparent Troubles condition-art trial

## Cancelled by user - 21 September 2026

John cancelled bulk transparency conversion of individual Troubles images. Agent
work was stopped; no trial assets were installed. Retain current white-background
condition images and trial artifacts for reference. Parent review found enclosed
white gaps in green-top foliage and powdery-mildew tendrils; do not treat these
trials as approved for rollout. All 14 current Troubles hero images separately
checked for real alpha and visually composited on light green: no white rectangular
backgrounds observed. Hero assets and renderer unchanged.

Five local, non-generative alpha-mask trials only. No canonical image references,
shared records, renderer code or layout tinting changed.

`transparent-trial.mjs` reads the retained source paths from the completed white-
background cleanup manifest. It changes alpha only: an edge-connected conservative
light-neutral background mask becomes transparent, followed by a bounded one-pixel
feather on the same boundary. RGB channels, dimensions and subject interiors are
retained. The manifest records source/output hashes and exact pixel counts.

Review `reports/trial-contact-sheet.png` or the five per-case reports. Each shows
the opaque source, alpha result on white, a light green widget tint and a dark QA
background. The dark view is diagnostic, not a proposed design.

This is a POC, not permission for bulk conversion or installation. Conservative
segmentation can retain tiny coloured antialias fringes; widening the mask would
risk pale subject edges. Fully enclosed background holes are not inferred or
removed unless connected to the image edge through background-like pixels.
