# hackriculture-print

Local gardening editor and print generator. The active publication is a
UK-focused, non-waterproof POD book at **185 × 240 mm**. A4 sheets remain supported;
A5/A6 are selectable but unreviewed. Canonical gardening data lives beside this
repository in `hackriculture-data`, shared with the website and video projects.

## Start or resume

Read [AGENTS.md](AGENTS.md), [SHARED-DATA.md](SHARED-DATA.md) and
[the current handover](docs/handover/START-HERE.md). The handover is the single
entry point for current decisions, component status, outstanding work and
publication/automation boundaries. It distinguishes approved designs from
working book proofs and historical evidence. Follow John's latest instruction.

The [book review pack](docs/publication/book-preparation/REVIEW.html) contains
the prepared interiors and drafts. The current title is **The Vegetable Guru** /
**Your at-a-glance growing companion**. John selected **G2 Cream centre** for the
front, without the count footer, and now prefers **B5 Off-centre collage** for
the back. [Cover ideas and preference](docs/publication/vegetable-guru-back-collage/REVIEW.html)
retain the dark-green, angled-snippet direction. Cover C guides colour and illustration style only. The approved
compact contents/how-to are now approved by John on 7 October, with book
integration pending. Find source artwork
and approvals in the [asset registry](docs/assets/README.md).

For the local app, run `zsh start.command` and open <http://127.0.0.1:5173>.
The launcher selects the pinned Node version and asks privately for a session
admin password. Keep its terminal open; Control-C stops it. Admin saves and
browser-rendered PDFs need this server. Normal exports use no AI service.
Detailed startup and check commands are in [SETUP.md](SETUP.md).

## Document ownership

| Document | Use it for |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Standing work, editorial, data and verification rules |
| [Current handover](docs/handover/START-HERE.md) | Current scope, decisions, next actions and exact resume links |
| [Shared data](SHARED-DATA.md) | Canonical ownership, safe writes and retained catalogue policy |
| [Book style](docs/BOOK-PRINT-STYLE.md) | Approved compact design and adaptation boundaries |
| [A4 vegetables](docs/VEGETABLE-PRINT-STYLE.md), [A4 Troubles](docs/TROUBLES-PRINT-STYLE.md) | Retained sheet designs, only when working on A4 |
| [Asset registry](docs/assets/README.md) | Approved source compositions, illustrations and provenance |
| [Assisted printing](docs/ASSISTED-PRINT.md) | Preparation, source comparison and proof-review workflow |
| [Development](DEVELOPMENT.md), [setup](SETUP.md) | Live implementation, export profiles and commands |
| [Publication research](docs/publication/README.md) | Dated supplier/cost evidence and research limits |
| [Preparation checkpoint](docs/publication/BOOK-PREPARATION-STATE.json) | Technical coverage, file evidence and incomplete batches |

Two repository-local layout skills cover fit, proof review and assisted export:
[Layout — book pages](.agents/skills/book-layout-review/SKILL.md) for the bound book,
and [Layout — single sheets](.agents/skills/guide-layout-review/SKILL.md) for
retained A4 guides. Both allow automatic selection; the sheet skill keeps its
original `guide-layout-review` identifier.
Read only the format and implementation details needed for the current task.
Frozen approvals record decisions at their date; old pending items are not a new
work queue. Git retains superseded instructions; do not create handover archives.
