# Current project handover

Updated 18 October 2026 during John's final text and design pass.
This document owns current scope, decisions and next actions. Read README,
AGENTS and SHARED-DATA first. John's latest instruction takes precedence;
dated reports and approvals are evidence, not instructions to resume old work.

## Resume here

The approved integration is complete; John's final copy changes now update Organic growing, page 146. The current
[full preview](../publication/whole-book-order-preview/REVIEW.html?revision=organic-copy-2026-10-18#spread=74)
has **170 interior pages plus four cover leaves: 174 PDF pages**, imperial,
185 × 240 mm. [PDF](../../output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf),
[page map](../publication/whole-book-order-preview/PAGE-MAP.json),
[checks](../publication/whole-book-order-preview/CHECKS.json) and
[visual review](../publication/whole-book-order-preview/VISUAL-REVIEW.json).
The introduction loses its last sentence and the three named advice paragraphs
use John's replacement text, with spelling/punctuation corrections only. His
follow-up shortens the middle paragraph to end “your garden will ultimately flourish.” The
diagram, closing box and existing type sizes remain. Both-unit single-page proofs
are checked; the revised page is for John's review. [Copy, sources and checks](../publication/final-text-edits/README.md).
Continue the final text/design pass as John directs; do not restart the completed
overnight reader exercise or repeat its persona/subagent simulations.

John approved the Growing Techniques order **including blank pages 150 and 162**
and requested full-book integration, refreshed navigation and this handover.
All earlier [reader edits](../publication/reader-edit-pass/APPROVAL-2026-10-16.json)
are included, with their superseded one-page rotation replaced by the approved
expanded spread. The optional holiday item remains excluded.

## Current page order

| Interior pages | Content |
| --- | --- |
| 1–2 | Title, publication details |
| 3 | Blank placing contents on facing pages |
| 4–5 | Simple illustrated contents |
| 6–7 | Blank / Introduction — why grow your own |
| 8–9 | Blank / combined Vegetable Guides and how-to |
| 10–97 | All 44 vegetable guides, two facing pages each |
| 98–99 | Blank / Vegetable Troubles opener |
| 100–144 | Fourteen Troubles guides |
| 145 | Growing Techniques opener |
| 146–147 | Organic growing / Nutrient cycles |
| 148–149 | Crop rotation & planning |
| 150–151 | Approved blank / Planning your plot |
| 152–153 | Beds and paths |
| 154–155 | Making compost |
| 156–157 | Dig or No-Dig: choosing / no dig |
| 158–159 | Digging parts 1 and 2 |
| 160–161 | Sowing and planting / Watering |
| 162–163 | Approved blank / Greenhouses introduction |
| 164–165 | Greenhouse growing options and seasons |
| 166–169 | Index |
| 170 | End balancing blank |

PDF page = printed folio + 2. All three section openers are right-hand pages;
all crops open on the left. Contents 4–5 and each two-page Techniques topic face.
The welcome/author page stays omitted. Interior blanks are 3, 6, 8, 98, 150, 162, 170.
The section stays unified as Growing Techniques; no theory/practice subdivision.

## Accepted content and design

- [Reader edits A1–A7, O1 and D1–D3](../publication/reader-edit-pass/README.md)
  are integrated cleanly: calendar interpretation, sowing/planting terms,
  selected crop timings, Onion & Leek diagnostics, compost wording, greenhouse
  handover and navigation. Carrots distinguish fresh/unfinished additions from
  mature compost; Greyhound is Summer cabbages; broad pet litter is omitted.
  Eight affected crops remain two pages; Lettuce uses a 52:48 column split.
- [Rotation approval](../publication/topic-pages/crop-rotation-planning/APPROVAL-2026-10-18.json)
  covers the two-page spread now at 148–149: three-year families, record keeping,
  plant nutrition, eight family rows and disease warning; then broad beans → kale,
  four-bed rotation and the British-muddle alternative. Household planning and
  the appetite note remain removed. Nitrogen wording retains the researched
  qualifications; do not revive the original one-page trial.
- [Nutrients approval](../publication/topic-pages/nutrient-cycles/APPROVAL-2026-10-18.json)
  covers the single practical page now at 147, with N/P/K/micronutrients table and
  rotation, compost and seaweed examples. Its rotation reference is now 148–149.
- [Section-order approval](../publication/techniques-sequence/APPROVAL-2026-10-18.json)
  freezes the exact accepted section, including both blanks and facing spreads.
- Earlier approved headers, shortened carrot/onion/tomato guides, combined
  peach-panel opener, navigation labels, flowing green/orange technique headings,
  publication copy and B5 blurb remain integrated. Exact provenance is in the
  [asset registry](../assets/README.md) and [full-preview notes](../publication/whole-book-order-preview/README.md).

Contents remain two pages with simple headings/list rows and existing H1/H2/H5/H6
artwork: **81 destinations**, 10.5 pt rows. No numbers, family subheadings or panels.
The index stays four pages, 9.45 pt, **286 entries / 35 see references**. All
previous terms remain; eight nutrient-page terms and the rotation succession
reference are added. Crop-specific links require literal relevant crop mentions;
74 links are present, with repeated section labels omitted within a footer.
All highlights are removed from the current PDF and viewer.

## Sources and current rebuild route

The [whole-book workflow](../publication/whole-book-order-preview/README.md) owns
reassembly. With the loopback app available, `npm run book:preview` rebuilds the
contents/index, reference footers, full native PDF and facing-page viewer from
hash-bound approved inputs. It does **not** regenerate the guide catalogue.
The approved baseline and new section proof are retained; never overwrite them.

The older `book:build`, `book:entries` and `book:guide-key` target retained standalone
opening compositions, not the current combined opener. The earlier full-preview
prepare/assemble commands are retired. Normal individual-guide exports still
need reconciliation with the approved presentation drafts before a new catalogue
export. Use the present integration route for the current book.

| Editable material | Owner |
| --- | --- |
| Metadata, opening/cover words, contents and index locators | [Shared book-layout JSON](../../../hackriculture-data/book-layout/README.md); guarded `saveBookLayout` writer |
| Source-linked approved guide edits | [Reader-edit drafts](../../src/print/book/reader-edit-pass/) and [proof manifest](../publication/reader-edit-pass/guides/MANIFEST.json) |
| Original techniques/cultivation prose | Resource-library summaries, linked in the asset registry |
| Expanded rotation and nutrient prose | [Rotation copy](../../../hackriculture-resources/summaries/crop-rotation-planning/copy.json) and [nutrient copy](../../../hackriculture-resources/summaries/nutrient-cycles/copy.json) |
| Final author-requested Organic growing copy | [Source-linked working copy](../../src/print/book/final-text-edits/organic.json); [build and proof notes](../publication/final-text-edits/README.md) |
| Final folios and source placements | [Current assembly plan](../publication/contents-update/ASSEMBLY-PROPOSAL.json), not stored folio examples in older proofs |

Canonical gardening JSON is unchanged. All 58 record hashes and reused native
page bodies are checked. Shared contents/index changes have an exact-byte
[backup receipt](../publication/whole-book-order-preview/integration-2026-10-18/BOOK-COPY-UPDATE.json).
Original source copy, A4 originals and approved references remain intact. Frozen
source folios may differ from current book folios; never treat them as instructions.

## Remaining production decisions

The current brief remains a UK-focused, non-waterproof, full-colour POD paperback,
**The Vegetable Guru: Your at-a-glance growing companion**, 185 × 240 mm.
Bookvault is the working service, £17.50 the working cover price, shipping separate;
The Great British Bookshop direct links are the selected launch route. Shopify /
native YouTube Shopping is deferred; KDP is a comparison/fallback. No listing activated.

G2 Cream centre is selected for the front; B5 Off-centre collage is preferred for
the back. Preserve the cream/grid front without a count footer and the dark-green
back with 44 growing / 14 Troubles wording. Approved blurb is native text above a
separate B5 derivative; original raster art is intact. Remaining lettering,
exact snippet crops and production wrap need later work. Cover C is a style/A4
reference only. Rejected cover studies are not alternatives to resume.

Missing copyright year, imprint, ISBN, edition and publication year remain
placeholders by request. Full metric assembly, print-resolution export, stock,
colour/PDF preflight, final cover wrap, current costs and physical proof remain
outstanding. Old 148-page costs/spine templates are historical; derive a fresh
wrap only after verified pagination/stock. The old 8 mm label / 8.436 mm filename
discrepancy is not a final spine specification. Component approvals do not imply
supplier approval or authorise publishing, ordering or payment.

## Design skills — use before design work

Read the applicable actual SKILL.md. The [design system](../BOOK-DESIGN-SYSTEM.md)
owns shared rules; [Compact Book v1](../BOOK-PRINT-STYLE.md) owns guide composition;
the [asset registry](../assets/README.md) owns source provenance.

| Work | Skill |
| --- | --- |
| Book design, openings, covers, illustrated topics, ordering | [vegetable-guru-book-design](../../.agents/skills/vegetable-guru-book-design/SKILL.md) and its [topic workflow](../../.agents/skills/vegetable-guru-book-design/references/illustrated-topic-pages.md) |
| Simple bound-book pages and facing-spread fit | [book-layout-review](../../.agents/skills/book-layout-review/SKILL.md) |
| Contents/index and whole-book assembly | Agreed structure and book design directly; outside layout-review scope |
| Vegetable illustration style | [vegetable-guru-artwork](../../.agents/skills/vegetable-guru-artwork/SKILL.md) |
| Retained A4 sheets | [guide-layout-review](../../.agents/skills/guide-layout-review/SKILL.md) |
| John's writing voice | [Write Like John](/Users/johnlennon/.codex/skills/write-like-john/SKILL.md) |
| Gardening research | [Gardening Research](/Users/johnlennon/.codex/skills/gardening-research/SKILL.md) |
| Shared JSON | [hackriculture-data](../../../hackriculture-data/.agents/skills/hackriculture-data/SKILL.md) |

Research order: exact canonical JSON → John's manuscript/corrected video accounts →
online sources. Read the full relevant local method before outlining. Exact JSON
measurements and techniques are definitive; online sources fill named gaps.
Use a simple majority of independent comparable online sources for disagreements;
substantive local conflicts require John's decision. The Vegetable Expert remains
removed. The [library](../../../hackriculture-resources/README.md) owns John's
manuscript and 54 selected transcripts; no renewed channel monitoring or transcript
pass is requested. Preserve raw transcripts and recorded corrections.

Use British English and organic methods; preserve diagnostics and qualifications.
No invented personal experience, silent source edits or shrinking body type to
force fits. All 44 crops currently fit two pages. John's last-resort table omission
permission remains bounded; it was not needed for the four shortening trials.
No routine persona tests or subagents without a fresh request.

## Runtime and boundaries

Use [SETUP](../../SETUP.md) and relevant [DEVELOPMENT](../../DEVELOPMENT.md) sections.
Browser PDF authoring/admin saves need `start.command` on loopback; offline
assembly/checking does not. Check server ownership; do not assume it survives or
stop a user-owned server. The existing interactive-browser policy restriction was
not bypassed; current verification uses project PDF authoring, local PDF renders
and static viewer checks, not a claim of interactive UI testing.

A4 keeps its separate Richer A / Open Editorial approvals. A5/A6 are selectable,
unreviewed. Completed UK variety refresh, onion-set work, Mushroom schema fix,
skill installation and content refinements are not work queues. Preserve manual
edits, unknown fields, approved sources and the latest shared-data rollback.
Never reset, clean, commit or push unrelated work.

Both the waterproof quote monitor and compact preparation automation remain
**paused**. No restart or new schedule is requested. No supplier messaging, upload,
fees, proof order, ISBN allocation, rights declaration, contract acceptance or
distribution activation is authorised. Preserve existing KDP titles; the old
Practical Gardener draft is unrelated. Final publication/purchase needs John's decision.
