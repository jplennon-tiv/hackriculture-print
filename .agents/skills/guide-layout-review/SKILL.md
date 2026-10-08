---
name: guide-layout-review
description: Review and improve hackriculture-print individual A4 vegetable and Troubles sheets, including fit, whitespace, overflow and actual PDF proofs. Use for single-sheet or loose-leaf work; bound book pages use book-layout-review.
---

# Layout — single sheets

This is the retained single-sheet workflow, under its original skill identifier.
Use it for individual A4 guides and loose-leaf collections. A guide may occupy
more than one sheet; “single sheets” does not impose a one-page limit. For a
bound book, use [book-layout-review](../book-layout-review/SKILL.md). An explicit
request for sheets takes precedence over the project's current book default.
A5/A6 are selectable but have no validated design contract.

## Sources and scope

Resolve repository links from this file. Read [AGENTS](../../../AGENTS.md),
[README](../../../README.md), [shared-data rules](../../../SHARED-DATA.md) and
[current handover](../../../docs/handover/START-HERE.md), skipping unchanged
material already read. Then use:

- [Richer A vegetable contract](../../../docs/VEGETABLE-PRINT-STYLE.md), including
  the approved header refinement and Family Tint rules.
- [Open Editorial Troubles contract](../../../docs/TROUBLES-PRINT-STYLE.md).
- [Assisted printing](../../../docs/ASSISTED-PRINT.md) for the shared review workflow;
  relevant [DEVELOPMENT](../../../DEVELOPMENT.md) / [SETUP](../../../SETUP.md)
  sections for the current implementation and commands.

Locate and inspect the approved component through the
[asset registry](../../../docs/assets/README.md). Preserve frozen references and
compare changed proofs with them. Approved A4 Cover C, contents and how-to remain
sheet sources; the book's later cover choices do not replace them.

## Review the sheet

Read current records, source-linked print companions, locks and warnings before
changing layout. Distinguish missing content, stale copy and real overflow from
measurement/reporting errors. Keep work limited to the requested crops/groups.

For vegetables, fit first, align practical columns second, then use spare space
for useful source detail. A bottom gap over 10 mm prompts review, not filler.
Retain justified sparse cases, readable type and approved artwork. Preserve the
expressive header, facts/calendar/needs/varieties/risks overview, practical advice,
reminder callouts, planting drawings and full-width Final Tips. Do not revive
dark widget bars, fixed-height cards, speech bubbles or retired margins.

For A4 Troubles, retain natural entry heights, complete diagnostic drawings and
Recognise / Act / Prevent advice. **Staggered column endings are approved**;
do not import the book's aligned-top-and-bottom requirement. Keep whole entries
together where practicable and every applicable condition exactly once. Six
conditions per reference page is an example, not a quota. Do not crop, stretch
or simplify diagnostic artwork to fit.

Select distinct useful crop-applicable pest rows before measuring. Merge duplicate
labels and condense table prose without losing signs, organic controls, timings
or qualifications; no fixed row quota or first-overflow cutoff. Keep full master
advice and record reasons for useful omissions. Preserve unit pairs and the
meaning of row/plant/clump spacing. Do not recurate accepted selections merely
because layout work has resumed.

Use the smallest justified companion/template change. Follow the shared-data
contract for any authorised editorial writes: guarded reader/writer, exact prior
bytes, attribution, locks and source signatures. Never self-approve copy, unlock
manual edits or rerun consumed proposals. A layout request does not itself
authorise new source gardening advice.

## Verify in A4

The live owners are `RichVegetablePage.tsx` / `richVegetable.css` and
`EditorialTroublePage.tsx` / `editorialTroubleLayout.ts`. Keep sheet changes
separate from `src/print/book/`; do not reduce a compact PDF back into A4.

Browser PDF generation needs the loopback Vite workflow through `start.command`;
inspect an existing process before starting or stopping anything. Pass
`paper=A4` explicitly to `/api/pdf/vegetable/<slug>` or `/api/pdf/trouble/<key>`:
the API default is the book size. Direct `/print/*` routes are A4 sources.

- For a vegetable, `npm run check:fit -- <crop>` measures A4 DOM fit only;
  `npm run check:smoke -- <crop>` checks an actual A4 PDF plus readiness.
  Add `--units=both` to smoke for unit/wrapping changes unless John scopes the
  review to one edition. Do not mistake these checks for visual approval.
- For Troubles, inspect the active `/print/trouble/<key>?units=<unit>` route
  with editorial selectors and export actual A4 PDFs. Retired card-layout
  checkers do not validate Open Editorial.
- Inspect changed PDF pages after fonts/images load: actual page count, complete
  text/images, header collisions, overflow, footer clearance and useful whitespace.
  Keep the accepted native A4 geometry and 8.5 mm side insets from the contracts.
  Do not restore legacy plugin margins or book binding gutters.
- Run the smallest relevant logic checks for code changes; documentation-only
  changes need link/consistency checks, not PDFs or app tests. Broaden crop/unit
  coverage only for the change or a failure, not an automatic catalogue export.

If an authorised sheet collection changes page count/order, refresh that
collection's contents and folios against its actual PDFs. Old A4 manifests are
historical evidence, not a current collection map. Report checks, omissions and
retained exceptions; update the owning handover/checkpoint without changing
approval status. Normal exports remain deterministic and need no external AI API.
