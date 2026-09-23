**23 September update:** All 44 normalised crops and current proofs are approved by John. The final three planting clarifications are signed off: [catalogue review](../hackriculture-data/planning/NORMALISATION-FRAMING-REVIEW.html) · [completion report](../hackriculture-data/planning/NORMALISATION-PLANTING-REPORT.md). Earlier checkpoints below are historical.

# hackriculture-print

A local gardening reference, content editor and printable growing-sheet generator. It produces vegetable and pest/disease guides as A4 PDFs, with imperial/metric controls and scaled A5/A6 output.

This project is also the master gardening-data editor for the sibling website (`hackriculture`) and video project (`hackriculture-video`). Authoritative gardening records live in shared `vegetables/<key>/<key>.json` and `troubles/<key>/<key>.json`, with `records.json` indexing 44 crops and 14 trouble groups. Eight navigation groups remain in shared `vegetable_groups.json`. Browser builds use disposable shared projections, not editable local copies.

## Start working

From `/Users/johnlennon/Documents/web_site/hackriculture-print`, run:

```sh
zsh start.command
```

The launcher selects the Node version in `.nvmrc`, prompts privately for a session admin password and starts the local server on port 5173. Keep its Terminal open; Control-C stops it.

- [Browse crops](http://127.0.0.1:5173/vegetable/carrot)
- [Edit shared data](http://127.0.0.1:5173/admin/login)
- [Preview a metric carrot PDF](http://127.0.0.1:5173/api/pdf/vegetable/carrot?inline=1&units=metric&paper=A4)

## Working documentation

- [Current vegetable rollout handover](docs/handover/START-HERE.md): completed rollout, researched normalisation corrections and eight drafts for later output review, and read-only preflight.

- [AGENTS.md](AGENTS.md): concise rules for coding assistants; read first.
- [DEVELOPMENT.md](DEVELOPMENT.md): architecture, accepted print design, data contracts and validation.
- [Approved vegetable print style](docs/VEGETABLE-PRINT-STYLE.md): layout priorities, typography/art preservation, editorial rules and saved per-crop exceptions.
- [SETUP.md](SETUP.md): local commands, dependencies and troubleshooting.
- [SHARED-DATA.md](SHARED-DATA.md): data ownership, backups and cross-project effects.
- [Planting illustration progress](docs/planting-illustrations/PROGRESS.md): resume point, all 44 crop briefs, RHS correction audit and draft-image batch status.

Update the relevant document when behaviour or architecture changes. Keep these files focused on current practice; historical migration details and prior documentation belong in shared backups.
