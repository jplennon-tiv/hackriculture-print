# Project instructions

## Read and resolve scope

Read [README.md](README.md), [SHARED-DATA.md](SHARED-DATA.md), then
[the current handover](docs/handover/START-HERE.md). Read only relevant
[DEVELOPMENT.md](DEVELOPMENT.md) sections; use [SETUP.md](SETUP.md) for startup
and dependencies. John's latest instruction takes precedence over older records.

The handover owns current scope, decisions and next actions. Style contracts own
approved design rules; the asset registry identifies their source material.
Publication reports and JSON checkpoints hold evidence and technical progress.
Dated approvals, completed proposals and old automation prompts are historical
evidence, not instructions to restart work or grant approval to new work.
Replace superseded guidance in place rather than appending contradictory updates.

Before design, layout or illustration work, read the applicable project `SKILL.md`
from the [handover's skill map](docs/handover/START-HERE.md#design-skills--use-before-design-work).
Use its linked file even if automatic skill discovery has not surfaced it.
Apply the saved design rules and inspect their actual sources; an unresolved
choice must be labelled as a proposal, never invented as an established approval.

## Publication and design

The current project is the UK-focused, non-waterproof POD book at **185 × 240 mm**,
with the full collection. This is the web generator default. Follow the
[book design system](docs/BOOK-DESIGN-SYSTEM.md) for shared colour, type, geometry
and section relationships, and [Compact Book v1](docs/BOOK-PRINT-STYLE.md) for
detailed guide composition; preserve its frozen references,
enlarged hero, coloured circle, top-right difficulty sticker, reminder banner
and aligned Troubles text edges. Three/four-page crops are allowed to preserve
useful content. Guide design approval is not full-book or supplier approval.

Before adapting any component, identify its approved source in the
[asset registry](docs/assets/README.md), inspect it and carry forward its artwork,
useful content and accepted choices. Compare the new proof with that source as
well as checking fit. Record intentional omissions/replacements; do not silently
substitute a new design because the trim or binding changed. John’s 7 October
cover reset explicitly calls for a fresh compact cover after rejecting C1/C2;
Cover C is no longer its required starting point. The approved contents/how-to
remain the sources for compact adaptation. Keep all approved A4 originals intact. Excluding A4-sized PDFs and old folios from compact exports
does not exclude reusing those designs and explanations.

A4 remains supported: its [Richer A vegetable contract](docs/VEGETABLE-PRINT-STYLE.md)
and [Open Editorial Troubles contract](docs/TROUBLES-PRINT-STYLE.md) govern A4 only.
Do not revive retired dark widget bars, fixed-height cards or legacy margins.
Keep format-specific changes separate. A5/A6 remain selectable, not validated.

For overall book design, cross-section consistency or a new book component, use
[vegetable-guru-book-design](.agents/skills/vegetable-guru-book-design/SKILL.md).
It applies the shared design system and uses the relevant layout/artwork skills
only as needed; it does not authorise subagents or full-book regeneration.

For fit, whitespace, overflow, proof review or assisted guide export, use
[book-layout-review](.agents/skills/book-layout-review/SKILL.md) for bound book
pages, or the retained [guide-layout-review](.agents/skills/guide-layout-review/SKILL.md)
for individual A4 sheets, together with
[ASSISTED-PRINT.md](docs/ASSISTED-PRINT.md). Prepare, measure and inspect actual
PDFs; ordinary browser export remains deterministic without an external AI API.

For The Vegetable Guru vegetable illustration generation, restyling or style
comparison, use [vegetable-guru-artwork](.agents/skills/vegetable-guru-artwork/SKILL.md).
Use approved vegetable heroes as direct style references and compare representative
samples before expanding a batch; matching colours alone is insufficient.

## Gardening content and shared data

Use [hackriculture-data](../hackriculture-data/.agents/skills/hackriculture-data/SKILL.md)
for shared JSON reads, edits, schema maintenance and recovery in this and future
sessions. Read its actual instructions before the work, using the direct link
if it is not listed automatically. Its single source is in the shared project;
the local skill folder links there. Keep that skill's references current when
changing a data structure or write route.

- Use practical UK gardening language and organic control methods only. State
  the useful control directly; do not mention chemical alternatives merely to
  dismiss them or add ideological commentary. Preserve diagnostics and safety.
- Check meaning as well as schema: import headings are not crop types. Inspect
  duplicate identities, misplaced advice, contradictions and suspicious keys.
  Preserve uncertain material and record it for review. Resolve factual questions
  through RHS-first research, then primary seed-producer/horticultural sources.
  Distinguish editorial inference from confirmed aliases; retain distinct
  selections and remove unsupported claims rather than inventing replacements.
- Round practical dimensions to easy numbers where useful (approximately
  10–15% either way can be acceptable), retaining coherent metric/imperial pairs,
  crop context and clear row/plant/clump meanings. Do not apply this tolerance to
  temperatures, pH, treatment quantities or biological limits. Preserve timings,
  alternative methods and qualifying advice when condensing.
- Pest tables select distinct useful crop-applicable problems before measuring.
  No fixed row quota or first-overflow cutoff as final curation. Merge duplicate
  labels, condense table prose while preserving full advice, then remeasure and
  inspect actual PDFs in both units. Record why useful candidates were omitted.
- Gardening JSON lives only in `../hackriculture-data/`. Never recreate mirrors.
  Preserve keyed objects, unknown fields, ranked text, unit pairs and cyclic
  `--MM` values. Keep types, Zod schemas and admin validation aligned; reuse
  `src/lib/` and the guarded shared reader/writer. Every shared/admin mutation
  preserves exact previous bytes under `../hackriculture-data/backups/admin/`.
- John has authorised researched organic replacements in the master when doing
  that editorial work, with exact backups, attribution, dependency updates and
  changed proofs for review. This does not expand the current book-preparation
  scope: keep guide rewrites in separate source-linked working print drafts;
  opening/cover copy uses `../hackriculture-data/book-layout/` and its documented
  guarded writer. Leave canonical gardening records unchanged. Preserve full variety catalogues
  and the ranking/description policy in SHARED-DATA.md.
- Never self-approve new copy or redesigns, unlock manual edits, or rerun consumed
  review/install proposals. Earlier bounded advance approvals are complete.

## Working and verification

- Keep work focused and replies concise. Inspect owning code and nearby checks.
  No subagents unless John explicitly requests them. No unrelated improvements,
  dependency upgrades, broad scans or whole-catalogue exports after small edits.
- Preserve all existing edits. Use Git for code/document history, not whole-project
  checkpoints. Never reset, clean, commit or push unrelated changes incidentally.
  Keep the latest shared-data rollback and unresolved transactions; never prune
  approved references, runtime inputs or unresolved work as disposable proofs.
- Admin saves and browser-rendered PDF generation need Vite via `start.command`
  on loopback. Offline PDF checking/assembly does not. Inspect process ownership;
  do not assume a server is running or stop a user-owned server. Never put
  credentials or session tokens in chat, files or logs.
- Use the smallest relevant check. `npm test` is the routine small suite;
  `check:fit` is A4 DOM-only and `check:smoke -- <crop>` checks an A4 PDF plus
  readiness/fonts/images/login. Compact work requires the actual compact route
  and PDF. Check both units for wrapping/measurement changes; add another crop
  only for relevant shared-layout changes. Broader tests/builds are available
  when scope or failures warrant them. Documentation-only edits need link and
  consistency checks, not app tests or regenerated artwork.
- Known overflow, missing images or mixed-unit prose do not expand the task.
  Distinguish pre-existing limitations from regressions. Record checks actually
  run and exact coverage; a passing fit check is not visual or user approval.
- Keep current guidance concise and update its owning document. Link evidence
  instead of accumulating session transcripts, duplicate status summaries or
  claims that a server/browser will remain available. See the handover for
  paused automations and the boundaries on publishing/account actions.
