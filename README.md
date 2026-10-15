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

Before design or artwork work, use the handover's
[project skill map](docs/handover/START-HERE.md#design-skills--use-before-design-work)
and read the applicable skill files. They are the starting point for continued
work, together with the saved design system and approved source assets.

For drafting or rewriting prose in John's voice, use
[Write Like John](/Users/johnlennon/.codex/skills/write-like-john/SKILL.md),
the personal skill built from his three DIY Home Insulation books. It covers
sentences through chapters, including composition from notes/data, using correct
British English while preserving meaning. The handover records its use and
the current opening-copy review; new book copy still needs John's review.

[Gardening Research](/Users/johnlennon/.codex/skills/gardening-research/SKILL.md)
is installed for practical summaries: exact canonical JSON first, John's own book
and corrected transcripts in the sibling
[hackriculture-resources library](../hackriculture-resources/README.md) next,
online sources last. Online disagreements use a simple majority; substantive
conflicts with John's local material require his clarification. The Vegetable
Expert has been removed from the active library. The skill uses Write Like John
and, when requested, the existing artwork
and layout skills to produce illustrated pages. The book-design skill's
[topic-page composition workflow](.agents/skills/vegetable-guru-book-design/references/illustrated-topic-pages.md)
covers headers, text/image relationships and visual revision. Research drafts
remain separate from structured JSON and approved book pages. For techniques,
read the relevant manuscript and video accounts before outlining, and record
John’s method and reasons; web research fills named gaps. The
[thirteen-page expansion preview](docs/publication/topic-pages/techniques-expansion/REVIEW.html)
is approved as a completed collection on 12 October, with Organic growing second. Its final sources are preserved and included in the whole-book order preview.

For shared JSON work, use the
[hackriculture-data skill](../hackriculture-data/.agents/skills/hackriculture-data/SKILL.md)
in this and future sessions. Its maintained source is shared across the data,
print, website and video projects.

The [whole-book order preview](docs/publication/whole-book-order-preview/REVIEW.html)
is the latest combined review: 174 interior pages in the revised section order plus G2/B5 covers,
including all approved additional pages, current contents and updated index.
Its opening sequence is title, copyright, blank 3, facing contents 4–5,
blank 6, Introduction 7, and Vegetable Guides/how-to facing at 8–9. The welcome
page is omitted. Troubles and Growing Techniques retain right-hand starts;
see the [preview notes](docs/publication/whole-book-order-preview/README.md).
The earlier
[technical review pack](docs/publication/book-preparation/REVIEW.html) retains
both-unit production drafts with older openings. The current title is **The Vegetable Guru** /
**Your at-a-glance growing companion**. John selected **G2 Cream centre** for the
front, without the count footer, and now prefers **B5 Off-centre collage** for
the back. [Cover ideas and preference](docs/publication/vegetable-guru-back-collage/REVIEW.html)
retain the dark-green, angled-snippet direction. Cover C guides colour and
illustration style only. John approved the compact contents/how-to on 7 October;
the current whole-book preview uses the accepted illustrated two-page contents
at 4–5 and H5 on the one-page guide key at 9, facing Vegetable Guides at 8. Production integration remains pending. Find exact sources and approvals in the
[asset registry](docs/assets/README.md).

For the local app, run `zsh start.command` and open <http://127.0.0.1:5173>.
The launcher selects the pinned Node version and asks privately for a session
admin password. Keep its terminal open; Control-C stops it. Admin saves and
browser-rendered PDFs need this server. Normal exports use no AI service.
Detailed startup and check commands are in [SETUP.md](SETUP.md).

The [four-page index](docs/publication/book-index/REVIEW.html) is approved by John
on 12 October. Its terms remain editable and references refresh from content locations.
The [simple two-page contents](docs/publication/contents-update/REVIEW.html) follow
John’s latest correction: plain section titles and page lists, without section
numbers or subheadings. Shared copy/plan place “Vegetable guides / how to use”
after the Vegetable Guides intro. These corrections and the illustrated contents
are now integrated into the rebuilt complete imperial preview. See the [contents notes](docs/publication/contents-update/README.md).
New copy/layout remains for review.

Book opening and cover copy is editable in the sibling
[book-layout JSON folder](../hackriculture-data/book-layout/README.md).
Run `npm run book:check` after editing. Use `npm run book:contents` and
`npm run book:guide-key` for the revised contents and guide key and the [whole-book workflow](docs/publication/whole-book-order-preview/README.md)
for section openers and reassembly. `npm run book:build` retains the earlier
seven-page opening composition; it does not refresh the current full preview.
Approved sources remain intact; cover concepts still require editable reconstruction.

## Document ownership

| Document | Use it for |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Standing work, editorial, data and verification rules |
| [Current handover](docs/handover/START-HERE.md) | Current scope, decisions, next actions and exact resume links |
| [Shared data](SHARED-DATA.md) | Canonical ownership, safe writes and retained catalogue policy |
| [Book design system](docs/BOOK-DESIGN-SYSTEM.md) | Shared colour, typography, geometry and section relationships, with approval status |
| [Book guide style](docs/BOOK-PRINT-STYLE.md) | Detailed approved compact vegetable/Troubles composition and fit rules |
| [A4 vegetables](docs/VEGETABLE-PRINT-STYLE.md), [A4 Troubles](docs/TROUBLES-PRINT-STYLE.md) | Retained sheet designs, only when working on A4 |
| [Asset registry](docs/assets/README.md) | Approved source compositions, illustrations and provenance |
| [Assisted printing](docs/ASSISTED-PRINT.md) | Preparation, source comparison and proof-review workflow |
| [Development](DEVELOPMENT.md), [setup](SETUP.md) | Live implementation, export profiles and commands |
| [Publication research](docs/publication/README.md) | Dated supplier/cost evidence and research limits |
| [Preparation checkpoint](docs/publication/BOOK-PREPARATION-STATE.json) | Technical coverage, file evidence and explicitly dated earlier batches |

The [Vegetable Guru book-design skill](.agents/skills/vegetable-guru-book-design/SKILL.md)
coordinates the overall design, applying the shared system and using layout or
[artwork](.agents/skills/vegetable-guru-artwork/SKILL.md) skills when needed.
Two layout skills cover fit, proof review and assisted export:
[Layout — book pages](.agents/skills/book-layout-review/SKILL.md) for the bound book,
and [Layout — single sheets](.agents/skills/guide-layout-review/SKILL.md) for
retained A4 guides. Both allow automatic selection; the sheet skill keeps its
original `guide-layout-review` identifier.
Read only the format and implementation details needed for the current task.
Frozen approvals record decisions at their date; old pending items are not a new
work queue. Git retains superseded instructions; do not create handover archives.
