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

For guide fit, whitespace, overflow, proof review or assisted guide export, use
[guide-layout-review](.agents/skills/guide-layout-review/SKILL.md). It is a
repository-local skill with automatic selection enabled. Its workflow links to
the maintained contracts below; it does not replace them.

For vegetable print/editorial/layout work, also read `docs/VEGETABLE-PRINT-STYLE.md`.
It is John's approved style contract: fit first, column-bottom alignment second,
useful whitespace filling third; full-width Final Tips remains the default.

- Forward Troubles design (John, 28 September): **Open Editorial v1** is approved and locked. Read `docs/TROUBLES-PRINT-STYLE.md`. Use open columns, natural entry heights and larger uncropped diagnostic illustrations; six entries per page is demonstrated density, not a quota. Do not revive padded fixed-height cards for new design work. Preserve the hashed references under `docs/troubles-style-pilot/editorial/`; the live template is installed and representative A4 PDFs have been validated.

- Preferred PDF workflow (John, 19 September): requests here to "generate the troubles pages" or "generate the vegetables pages" mean assisted preparation and export, not merely pressing batch. Follow `docs/ASSISTED-PRINT.md`: measure, edit source-linked print companions where needed, render/review and save a resume point. Preserve full master advice. Existing browser exports remain deterministic; no external AI API integration requested.

- Keep work focused and replies concise; the user wants to conserve credits. Inspect the owning implementation and nearby tests. Avoid repeated broad scans, unrelated improvements and full-catalogue renders. Do not spawn agents unless explicitly requested.
- Preserve existing user edits. This project now has Git history. Keep local pre-edit backups for shared JSON under `../hackriculture-data/backups/`; use Git for code and documentation history. Do not create whole-project checkpoints or copy artwork, output PDFs, dist or dependencies into data backups. John authorises pruning superseded backups; keep the latest rollback and unresolved transactions.
- Forward vegetable design (John, 28 September): **Richer A v1** is approved and locked. Follow `docs/VEGETABLE-PRINT-STYLE.md` and its hashed reference proofs. Preserve its full information richness, cover-C typography/art direction, facts/icons and 1–5 needs scales. Earlier staggered layout/dark-heading rules apply only to retained legacy code; do not revive superseded experiments. Richer A is installed; all 44 heroes, refined headers and the 30 September content-refinement batch are approved. See the current handover for evidence and remaining limits.
- Gardening JSON lives only in `../hackriculture-data/`. Never recreate source/root mirrors. Every admin data mutation must preserve the previous bytes in `../hackriculture-data/backups/admin/` using the existing dated version scheme.
- Preserve keyed objects, unknown fields, ranked text, measurement pairs and cyclic `--MM` month values. Keep `src/types.ts`, Zod schemas and admin validation aligned. Reuse `src/lib/` helpers.
- Admin saves and PDF generation require the Vite dev server. Use `start.command` and loopback only. Never put credentials in chat or project files.
- John's POC verification policy (24 September) supersedes earlier full-suite/batch requirements: use the smallest relevant unit test or quick sizing/smoke check. `npm test` is the small routine suite; `npm run check:smoke -- <crop>` checks one real A4 PDF, fonts/images and login; `check:fit` is DOM-only. Use both units for unit/wrapping changes and another crop only for a relevant shared-layout change. No automatic full tests, production builds, catalogue runs, raster packs or cross-project checks after a small edit. `test:all`, `check:types` and `build` remain available when the scope/failure warrants them. Documentation-only work needs link/content checks.
- Cleanup policy (John, 24 September): remove superseded handovers, proofs, scripts and old backups. Keep current runtime/build inputs, live resources, unresolved editorial questions and the latest rollback. Never remove a prepared/unresolved transaction. Use Git for history; do not create replacement archives or long session transcripts. Future shared writes still require exact prior-byte backups.
- Known overflow, missing images and mixed-unit prose are not permission to expand scope. Distinguish existing limitations from new regressions. Do not upgrade dependencies or resize artwork without a task-related reason.
- Maintain current working docs when architecture, data contracts or accepted design changes. Record checks actually run and material limitations; do not accumulate session transcripts or claims about servers still running.

John’s follow-up (22 September): resolve normalisation questions through RHS-first
research, then primary seed-producer or horticultural sources. Correct likely
name errors; record editorial inference separately from confirmed aliases, and
retain genuinely distinct selections. Simplify conflicting spacing to mainstream
advice. Remove unsupported claims rather than inventing replacements. Use a short
decision summary; full diffs are optional. All normalised groups are now approved.
Website/video work is excluded from this follow-up.
