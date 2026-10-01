---
name: guide-layout-review
description: Review and improve hackriculture-print vegetable or Troubles cheat-sheet content fit, whitespace, overflow and print layout, including assisted preparation for guide exports. Use for guide sizing and proof review, not unrelated website work, artwork generation or a new visual design.
---

# Guide layout review

Work within the requested crops/groups and existing approval boundaries. This is
AI-assisted editorial preparation around deterministic rendering, not AI inside
normal exports. Explicit user instructions and existing session authorisation
control scope; do not request approval again for already authorised work.

## Read the current contract

This skill belongs to the repository three directories above this folder. Resolve
links from this file, not an assumed working directory. Read the current project
[AGENTS.md](../../../AGENTS.md), [README](../../../README.md),
[shared-data contract](../../../SHARED-DATA.md) and
[current handover](../../../docs/handover/START-HERE.md); avoid rereading unchanged
files already loaded in the conversation. Then use:

- [Assisted printing](../../../docs/ASSISTED-PRINT.md) for preparation and approval.
- [Vegetable style](../../../docs/VEGETABLE-PRINT-STYLE.md) for vegetable work.
- [Troubles style](../../../docs/TROUBLES-PRINT-STYLE.md) for diagnostic guides.
- Relevant [implementation sections](../../../DEVELOPMENT.md) and
  [setup commands](../../../SETUP.md) when needed.

Keep these documents authoritative. Do not copy their design rules into a new
policy file or revive a frozen pilot's builder as a live maintenance tool.

## Inspect, diagnose, adjust

Read live canonical records and current companions, including locks, source/output
signatures and editorial notes. Determine whether the issue is missing useful
content, unsuitable content selection, layout geometry, or a false review warning.
An absent optional section is different from an unreviewed or stale companion.

Measure the actual affected route after fonts/images load. Inspect print warnings
and errors, overflow, bottom clearance and column endings. For visual changes,
inspect the affected rendered pages: numerical fit alone cannot establish quality.

For vegetables, prioritise fit, then column alignment, then useful space filling.
Restore relevant source detail before adding space; preserve readable type,
measurement meaning and crop distinctions. A bottom gap over 10 mm prompts review,
not automatic filler. Retain justified sparse cases. Use crop-applicable distinct
trouble rows; no uniform row quota or first-overflow cutoff as final curation.

For Troubles, preserve complete diagnostic entries and images, natural entry
heights and every condition exactly once. Uneven column endings are acceptable;
do not apply vegetable column stretching or old card-height budgets.

Choose the smallest justified source-companion or template change. Research only
when a substantive advice question needs resolving, using the project's RHS-first
rules. Preserve full master advice. Do not infer permission to shrink artwork,
change typography or redesign the pages from a request to improve fit.

## Save and verify proportionately

Use the existing shared reader/writer and print helpers for companion changes.
Respect revision guards, manual edits, locks and exact prior-byte backups. Keep
new editorial copy draft until John approves it; existing approval is not lost
merely because a reporting bug is corrected. Never stamp approval to clear a warning.
Do not rerun consumed content-refinement proposals against expanded live records.

From the project root, with start.command on loopback when needed:

- `npm run test:focused -- <owning-test-file>` for changed logic.
- `npm run check:fit -- <crop>` for vegetable DOM sizing/readiness only.
- `npm run check:smoke -- <crop>` for a vegetable A4 PDF; add `--units=both`
  for unit/wrapping changes. Add another crop only for relevant shared geometry.
- For Troubles, use the active `/print/trouble/<key>?units=metric` route and
  `EditorialTroublePage.tsx` selectors. Inspect any existing checker before use:
  older card-based scripts are not validators for Open Editorial. Check actual PDF
  pages and condition coverage when layout changes; keep checks group-scoped.

No automatic full catalogue export, build, raster pack or broad test suite after
a small edit. Distinguish DOM fit from actual PDF pagination and warnings from
export failures. For a changed page count/order, follow the pagination procedure
in DEVELOPMENT before refreshing approved contents; don't rebuild it incidentally.

## Leave a usable result

Report what changed, checks actually run, and material remaining exceptions.
Present changed proofs for review where needed; preserve approved references.
Record accepted edits and their save receipt in the current working documents.
Update START-HERE in place with outstanding work and exact resume paths rather
than creating session transcripts or duplicate handover archives. Do not imply
that a full batch was regenerated or a fresh print run approved unless it was.
