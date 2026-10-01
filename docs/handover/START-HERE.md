# Current handover

Updated 30 September 2026. This is the handover pack's entry point; maintain it
in place. No separate session archive is needed.

## Resume in a new session

Open `hackriculture-print`. Read AGENTS.md, README.md and SHARED-DATA.md, then this
file and the documents relevant to John's next request. The repository-local
[Guide layout review skill](../../.agents/skills/guide-layout-review/SKILL.md)
is available for automatic selection on layout/content-fit and assisted export
work. Explicit invocation: “Use $guide-layout-review for the affected guides.”
It links to maintained contracts and existing scripts; it adds no AI to exports.

No new batch, content edit or design task is pending approval here. Ask what John
wants to work on next if the new session has no specific task. Do not resume an old
rollout or rerun a consumed proposal just because its scripts remain on disk.

## Approved and installed

- **Vegetables:** Richer A v1, Family Tint, practical headings, all 44 heroes and
  the refined title/header design. Full-height art, raised oval difficulty badge,
  bold floating harvest seasons; Ready in appears in Quick Facts only.
- **Content refinement:** John approved all 44 guides on 30 September: “Batch
  output looks good - approved.” Installed source-linked companions restore
  care/harvest detail in 42 crops and fuller introductions in 13. Bounded spacing
  uses `richer-a-v2-editorial-fill`. Full master advice and locks are preserved.
- **Troubles:** Open Editorial v1, larger uncropped diagnostic art, natural entry
  heights. All 220 conditions in 14 guides; no fixed card-height or row quota.
- **Front matter:** cover C with both badges and current guide thumbnails;
  Harvest corner A contents (approved 29 September); illustrated calendar,
  Difficulty rating and Core needs how-to (approved 30 September). Installed
  assets are under `public/front-matter/`.
- **Pagination:** 44 vegetables at 1–88; Troubles at 89–132; three opening pages
  unnumbered. Native A4, 8.5 mm side text insets accepted for now. A5/A6 unreviewed.
- Coloured icons, crop-specific Key Risks and planting/diagnostic drawings remain
  approved. Crop bubbles are deferred on John's own list.

## Latest output and checks

John ran the imperial A4 batch on 30 September. The saved batch report contains
61 documents (3 opening pages + 44 vegetables + 14 Troubles), no export errors,
and only the Mushroom sowing-notes warning. `output/collection-order.json` says
`complete: true`; use its assembly order rather than every PDF left in output.
These output files are generated local evidence, not Git-backed source.

The Mushroom warning was a reporting bug: there is no sowing source or companion,
and the approved kit route lives in planting captions/introduction. Fixed in
`vegetableModel.ts`; absent notes report `not_applicable`. Invalid or stale
companions still warn. Five focused tests and a live Mushroom DOM/font/image
check passed with zero warnings (2.34 s). Page content was unchanged. The saved
batch report predates the fix; no new full batch was run just to replace it.

Content-refinement evidence: 88 both-unit DOM checks, three two-page physical
PDFs and visual inspection of their six pages; ten focused tests and app type
check. After installation, live greenhouse tomato PDFs passed in both units
(two pages each, 4.18 s). Mean page-two bottom gap improved 13.2 → 6.1 mm.
Known exceptions remain accepted: Leaf beet page two about 13 mm; Mushroom page
one about 47 mm; modest first-page gaps for Jerusalem artichoke/greenhouse tomato;
eleven crops retain uneven internal column bottoms. No filler was invented.

## Source, approvals and rollback

- [Content review and exceptions](../content-refinement/README.md) and
  [approved proofs](../content-refinement/REVIEW.html).
- [Latest shared save receipt](../content-refinement/SAVE-RECEIPT.json): 44 records,
  exact prior bytes verified. Installed revision:
  `d1e4b8218bf80c92d595dbc43eb4d58faac8e131a081313d86368ed605497abf`.
  Inspect live revision before any future save; never reuse this value blindly.
- [Installation checks](../content-refinement/INSTALLATION-CHECKS.json) and
  [central approvals](../redesign-rollout/APPROVAL.json).
- Immutable proposal: `../hackriculture-data/planning/vegetable-content-refinement/PROPOSAL.json`
  relative to the project root. It is consumed. Do not rerun prepare/install over
  expanded companions. Preserve hashes and approved reference proofs.
- Full canonical data remains only in `../hackriculture-data/`; use its guarded
  writer and exact-byte transaction backups. No data changes in the skill/docs task.
- Both projects may contain uncommitted work. Preserve it; no commit or push was
  made in this handover task. Git history is not proof that current edits are saved
  remotely. Do not reset, clean or archive the working tree incidentally.

## Owners and next-work boundaries

[DEVELOPMENT.md](../../DEVELOPMENT.md) identifies active components and pagination
procedures; [SETUP.md](../../SETUP.md) owns startup and quick checks. Use
`start.command` on loopback; inspect existing processes, don't assume a server
is running and don't stop a user-owned server. Never expose a session password.

Active vegetables: `RichVegetablePage.tsx`, `vegetableModel.ts`,
`richVegetable.css`, `richPageFill.ts`. Active Troubles: `EditorialTroublePage.tsx`,
`editorialTroubleLayout.ts`, `editorialTrouble.css`. Older card-based Troubles
checker/export-review scripts require adaptation before use on the live template;
this is optional tooling work, not a blocker or an authorised new task.

Keep checks bounded: affected unit tests, DOM sizing, one real PDF when visual
changes warrant it; both units for wrapping/measurement changes. No full catalogue
packs, subagents or broad tests by default. Read the vegetable or Troubles style
contract for their different whitespace rules. Maintain RHS-first research,
practical organic advice, crop distinctions and coherent unit pairs when editing.

[Shared editorial questions](../../../hackriculture-data/planning/EDITORIAL-OPEN-QUESTIONS.json)
remain available; verify their current relevance before acting. They do not
reopen approved content automatically. No continuation or overnight job is scheduled.

## Handover validation

The project-local skill passes the skill-creator validator. Its referenced files
and current working-document links resolve. Automatic selection is enabled; AGENTS
also points to the skill explicitly. Reviewed routing covers a small vegetable fit
fix, a Troubles proof review and exclusion of unrelated artwork/site work; no new
agent session or full rendering run was launched to test discovery. All 55 recorded
hero/front-matter file hashes checked intact. Canonical revision is unchanged by
this documentation task. No application tests were rerun for documentation alone.
