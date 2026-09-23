# Coding rules

John's editorial clarification (22 September): state the practical organic
control directly and move on. Do not mention chemical alternatives merely to
dismiss them or add ideological commentary. Preserve useful diagnostic or
safety information; this is a rule about unnecessary reader-facing comparisons.

John’s normalisation rules (22 September): check meaning as well as schema—
import headings are not crop types; inspect duplicate identities, misplaced
crop advice, contradictory fields and suspicious keys/prose. Preserve uncertain
material and record it for review. Round practical gardening dimensions to easy
numbers where useful (approximately 10–15% either way is acceptable), retaining
coherent metric/imperial pairs and growing context. Do not mechanically apply a
percentage rule to temperatures, pH, treatment quantities or biological limits.

- John's standing preference (21 September): organic control methods only.
  He authorises researched replacements of chemical pest/disease prescriptions
  in the canonical master, with exact prior-byte backups and honest AI attribution.
  Update affected print dependencies and re-present changed proofs for review.

- Pest tables: select distinct, useful, crop-applicable problems before measuring.
  No blanket row count, and no first-overflow cutoff as the final decision.
  Merge duplicate labels, condense table prose while preserving full master
  advice, then remeasure after edits and inspect actual PDFs in both units.
  Record why useful candidates were omitted; do not force differing counts.

Read README.md and SHARED-DATA.md first, then only the DEVELOPMENT.md sections relevant to the requested work. Read SETUP.md when working on startup or dependencies.

For vegetable print/editorial/layout work, also read `docs/VEGETABLE-PRINT-STYLE.md`.
It is John's approved style contract: fit first, column-bottom alignment second,
useful whitespace filling third; full-width Final Tips remains the default.

- Preferred PDF workflow (John, 19 September): requests here to "generate the troubles pages" or "generate the vegetables pages" mean assisted preparation and export, not merely pressing batch. Follow `docs/ASSISTED-PRINT.md`: measure, edit source-linked print companions where needed, render/review and save a resume point. Preserve full master advice. Existing browser exports remain deterministic; no external AI API integration requested.

- Keep work focused and replies concise; the user wants to conserve credits. Inspect the owning implementation and nearby tests. Avoid repeated broad scans, unrelated improvements and full-catalogue renders. Do not spawn agents unless explicitly requested.
- Preserve existing user edits. This project now has Git history. Keep local pre-edit backups for shared JSON under `../hackriculture-data/backups/`; use Git for code and documentation history. Do not create whole-project checkpoints or copy artwork, output PDFs, dist or dependencies into data backups. John authorised pruning redundant backups on 18 September 2026; see the shared cleanup record.
- Preserve the accepted staggered print layout, borders/dark headings, 19 Quick Facts icons, 1–5 Core Needs scale and lossless hero crops unless the user requests changes to them. Do not revive rejected layout experiments.
- Gardening JSON lives only in `../hackriculture-data/`. Never recreate source/root mirrors. Every admin data mutation must preserve the previous bytes in `../hackriculture-data/backups/admin/` using the existing dated version scheme.
- Preserve keyed objects, unknown fields, ranked text, measurement pairs and cyclic `--MM` month values. Keep `src/types.ts`, Zod schemas and admin validation aligned. Reuse `src/lib/` helpers.
- Admin saves and PDF generation require the Vite dev server. Use `start.command` and loopback only. Never put credentials in chat or project files.
- Run focused tests for code changes, then `npm test` and `npm run build` before delivery. For print changes, verify actual PDFs for four or five representative crops in both units, including font/image readiness; add A5/A6 checks when paper sizing changes. Documentation-only changes need link/content checks, not application tests.
- Planting rollout exception, explicitly requested by John on 17 September: prioritise speed and produce all crop review PDFs with basic readiness/source checks and a small PDF spot-check only. Do not repeat full suites, cross-project builds or exhaustive both-unit visual comparisons for routine crop additions. Record layout/page-count issues for later polish rather than withholding previews. Broader renderer/data-contract changes still warrant focused tests. Preserve granular text, user edits and existing padding; keep restore points. Review output is not permission to deploy publicly. See the current policy at the top of planting PROGRESS.md.
- Known overflow, missing images and mixed-unit prose are not permission to expand scope. Distinguish existing limitations from new regressions. Do not upgrade dependencies or resize artwork without a task-related reason.
- Maintain current working docs when architecture, data contracts or accepted design changes. Record checks actually run and material limitations; do not accumulate session transcripts or claims about servers still running.

John’s follow-up (22 September): resolve normalisation questions through RHS-first
research, then primary seed-producer or horticultural sources. Correct likely
name errors; record editorial inference separately from confirmed aliases, and
retain genuinely distinct selections. Simplify conflicting spacing to mainstream
advice. Remove unsupported claims rather than inventing replacements. Use a short
decision summary; full diffs are optional. Batch-02 outputs will be reviewed later.
Website/video work is excluded from this follow-up.
