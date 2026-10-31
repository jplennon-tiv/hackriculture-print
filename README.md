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

**Current work, 31 October:** John has received the physical proof and is
satisfied with its print quality, accurate colours, coated-paper feel and weight,
and book size. The post-proof layout pass has started: all 44 vegetable guides
now run in alphabetical order by their displayed titles, retaining their original
category colours and complete facing pairs. Contents, index and internal page
references follow that order. The approved larger category names now appear on both pages of all 44 guides. The
[coloured contents and pale category key](docs/publication/contents-colour-study/key-preview/APPROVAL.json)
are integrated at 4–5; the existing how-to page is unchanged.
The subsequent [page-9 revision](docs/publication/guides-intro-detail/README.md)
is now approved: three how-to panels, revised calendar copy, two difficulty
examples and restored needs captions. Its exact proof is locked for the next
requested book update; the complete book still contains the earlier page.
John approved the [complete revised Troubles set](docs/publication/troubles-rollout/APPROVAL.json)
on 31 October and requested main-book integration. The exact approved pages are
now at **99–146**, retaining 220 conditions, 24 classified highlights, separate
wrapping masks, 4 mm clearance, enlarged illustrations, importance order and
natural trailing space. Potato slugs remain unstarred. Contents, index,
bookmarks, crop links and numeric cross-references follow the revised locations.
The [main-book evidence](docs/publication/whole-book-order-preview/README.md)
records source preservation and actual PDF checks. Netting is now **162–163**,
Supports **164–165**, and the index **170–173**.
The introduction
rewrite remains planned. The
[website is live](https://hackriculture.com/) and he confirms the SSL issue has
resolved. The [current handover](docs/handover/START-HERE.md#resume-here) records
where to resume, the website/print boundary and outstanding publication decisions.
Preserve the exact ordered files for proof **BV3012332**. Physical quality is
accepted; final corrections, introduction and publication preparation remain.
Book sales have not been activated.

Before design or artwork work, use the handover's
[project skill map](docs/handover/START-HERE.md#design-skills--use-before-design-work)
and read the applicable skill files. They are the starting point for continued
work, together with the saved design system and approved source assets.

For drafting or rewriting prose in John's voice, use
[Write Like John](/Users/johnlennon/.codex/skills/write-like-john/SKILL.md),
the personal skill built from his three DIY Home Insulation books. It covers
sentences through chapters, including composition from notes/data, using correct
British English while preserving meaning. The handover records its use and
the current copy approvals; new book copy still needs John's review.

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

The [current full preview](docs/publication/whole-book-order-preview/REVIEW.html)
contains **174 interior pages plus four cover leaves: 178 PDF pages**, imperial.
All approved reader edits, expanded Crop rotation & planning, the nutrient page
and John's Growing Techniques headings, Netting and Supports are integrated. Its two internal
blank pages have been removed. All 44 vegetables remain two-page facing guides. Contents, index and
page references are refreshed; editing annotations are absent. The approved Troubles highlights remain intentional. Canonical advice is unchanged; the previously approved 24 star flags are retained. [Current page map and evidence](docs/publication/whole-book-order-preview/README.md).

The opening sequence is title, publication, blank 3, facing contents 4–5,
blank 6, Introduction 7, blank 8 and combined Guides/how-to at 9. Troubles and
Techniques start on right-hand pages 99 and 147. G2 front, B5 back and approved
publication/back-cover copy are retained, with missing metadata left as placeholders.
Exact component sources are in the [asset registry](docs/assets/README.md).
The older [technical pack](docs/publication/book-preparation/REVIEW.html) is
historical evidence, not the current complete book or a current production specification.

For the local app, run `zsh start.command` and open <http://127.0.0.1:5173>.
The launcher selects the pinned Node version and asks privately for a session
admin password. Keep its terminal open; Control-C stops it. Admin saves and
browser-rendered PDFs need this server. Normal exports use no AI service.
Detailed startup and check commands are in [SETUP.md](SETUP.md).

The current index has 297 entries and 35 see references on pages 170–173.
Contents retain two simple illustrated pages with 83 destinations and no extra
subheadings. [Contents notes](docs/publication/contents-update/README.md) and
[index notes](docs/publication/book-index/README.md) distinguish current derivatives
from frozen approvals.

Book opening/cover copy, contents and index terms are editable in the sibling
[book-layout folder](../hackriculture-data/book-layout/README.md). Use its guarded
writer for AI/app edits. `npm run book:check` validates copy; `npm run book:preview`
is the current full-book rebuild route. See the
[workflow](docs/publication/whole-book-order-preview/README.md).
It reuses approved bodies and never exports the guide catalogue. Earlier
`book:build`, `book:entries` and `book:guide-key` commands retain standalone source
compositions; they do not build the current full preview.

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
