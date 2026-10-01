# hackriculture-print

Local gardening editor and A4 growing-sheet generator. The canonical data lives
beside this project in `hackriculture-data`; the website and video projects share it.

Start with `zsh start.command`, then open <http://127.0.0.1:5173>.
The launcher selects Node 24 and asks privately for a session admin password.
Keep its terminal open; Control-C stops it. Admin saves and PDF exports need this
local dev server. No AI service runs during ordinary exports.

All 44 vegetable guides, 14 shared Troubles groups, coloured icons, Key Risks
artwork and all 44 heroes are approved. Richer A vegetables, Open Editorial
Troubles, cover C, contents and the illustrated how-to are installed for batch
output. The 30 September vegetable content refinement is approved and installed;
John reports a successful batch export. See the [current handover](docs/handover/START-HERE.md)
and [approved content proofs](docs/content-refinement/REVIEW.html). Crop bubbles
remain on John's list.

**Forward vegetable design: Richer A v1, approved 28 September.** Use the
[approved reference](docs/vegetable-style-pilot/fresh-c/RICH-A.html) and
[style contract](docs/VEGETABLE-PRINT-STYLE.md). It combines cover C's visual
language with the existing guides' full information richness. The [refined title/header design](docs/vegetable-style-pilot/header-refinement/REVIEW.html)
is also approved and locked (30 September). The shared template is installed; both-unit sizing and representative physical
A4 proofs are checked. John has accepted the 8.5 mm side text insets for now after test printing.

**Forward Troubles design: Open Editorial v1, approved 28 September.** Use the
[approved references](docs/troubles-style-pilot/editorial/REVIEW.html) and
[Troubles style contract](docs/TROUBLES-PRINT-STYLE.md): open columns, larger
diagnostic illustrations and content-led density. The live renderer now uses measured, lossless pagination; all 220 conditions
are covered across 14 guides.

## Start a new session

Open this project and ask Codex to read `docs/handover/START-HERE.md`, then describe
the next task. The project-local [Guide layout review skill](.agents/skills/guide-layout-review/SKILL.md)
is discoverable from `.agents/skills/` and can be selected automatically for guide
fit/review work. You can also say “Use $guide-layout-review for these guides.”
It reuses the project rules and tools; no plugin, new API or external service is
needed. The handover links the approval evidence, latest rollback and known limits.

## Working documents

- [AGENTS.md](AGENTS.md): editing rules and proportionate POC checks.
- [SETUP.md](SETUP.md): startup, dependencies and quick commands.
- [DEVELOPMENT.md](DEVELOPMENT.md): current implementation and contracts.
- [SHARED-DATA.md](SHARED-DATA.md): data ownership and safe writes.
- [Vegetable print style](docs/VEGETABLE-PRINT-STYLE.md): approved design rules.
- [Troubles print style](docs/TROUBLES-PRINT-STYLE.md): approved diagnostic-guide design.
- [Assisted printing](docs/ASSISTED-PRINT.md): preparation and review workflow.
- [Asset registry](docs/assets/README.md): approved artwork and preserved hashes.

Routine check: `npm test` (small data/layout suite). For a print change, with the
server running, use `npm run check:smoke -- carrot` or substitute the affected crop.
It checks readiness, fonts, images and one actual A4 PDF. See SETUP for options.
Full tests and production builds remain available when the change warrants them.

Historical handovers, completed pilots and disposable proofs were removed at
John's request. Git holds source history; do not recreate session archives.
