# hackriculture-print

Local gardening editor and A4 growing-sheet generator. The canonical data lives
beside this project in `hackriculture-data`; the website and video projects share it.

Start with `zsh start.command`, then open <http://127.0.0.1:5173>.
The launcher selects Node 24 and asks privately for a session admin password.
Keep its terminal open; Control-C stops it. Admin saves and PDF exports need this
local dev server. No AI service runs during ordinary exports.

All 44 vegetable guides, 14 shared Troubles groups, coloured icons and Key Risks
artwork are approved. The latest page-fit corrections are in
[the current proofs](docs/page-fit/REVIEW.html). See [current status](docs/handover/START-HERE.md)
for the remaining warnings; crop bubbles are on John's own task list.

## Working documents

- [AGENTS.md](AGENTS.md): editing rules and proportionate POC checks.
- [SETUP.md](SETUP.md): startup, dependencies and quick commands.
- [DEVELOPMENT.md](DEVELOPMENT.md): current implementation and contracts.
- [SHARED-DATA.md](SHARED-DATA.md): data ownership and safe writes.
- [Vegetable print style](docs/VEGETABLE-PRINT-STYLE.md): approved design rules.
- [Assisted printing](docs/ASSISTED-PRINT.md): preparation and review workflow.
- [Asset registry](docs/assets/README.md): approved artwork and preserved hashes.

Routine check: `npm test` (small data/layout suite). For a print change, with the
server running, use `npm run check:smoke -- carrot` or substitute the affected crop.
It checks readiness, fonts, images and one actual A4 PDF. See SETUP for options.
Full tests and production builds remain available when the change warrants them.

Historical handovers, completed pilots and disposable proofs were removed at
John's request. Git holds source history; do not recreate session archives.
