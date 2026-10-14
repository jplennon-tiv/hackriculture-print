# Current project handover

Updated 14 October 2026 for the next session. This document owns current scope,
decisions and next actions. Read the root README, AGENTS and SHARED-DATA first.
John's latest instruction takes precedence. Approval manifests and dated reports
are evidence, not instructions to restart completed work.

## Resume here

The latest complete review is the [whole-book order preview](../publication/whole-book-order-preview/REVIEW.html?revision=section-openers#spread=5):
**176 interior pages plus four cover leaves (180 PDF pages), imperial only**.
It includes G2/B5, current opening copy, expanded contents, all 44 vegetable guides,
14 Troubles groups, seventeen approved additional pages, three new section
openers and the approved index with updated numeric references.

John's requested 14 October order is implemented. He thanked us and requested a
fresh session; this is **not an explicit design approval of the three new
openers or expanded contents**. Start with this saved preview, not the earlier
148-page production drafts or 170-page order study. Do not regenerate it merely
to resume. The [preview notes](../publication/whole-book-order-preview/README.md)
own the build workflow, page map, exact checks and retained preceding PDF.

| Interior folios | Current placement |
| --- | --- |
| 1–3 | Title, publication details, welcome and author |
| 4–6 | Expanded contents proposal |
| 7 | Why Grow Your Own |
| 8–9 | Blank verso / Vegetable Varieties opener |
| 10–11 | How to Use, facing |
| 12–107 | Vegetable guides; crop-alignment blanks at 19, 73, 91 and 95 |
| 108–109 | Blank verso / Vegetable Troubles opener |
| 110–154 | Troubles guides |
| 155 | Growing Techniques opener |
| 156–157 | Organic growing; plot location |
| 158–159 | Beds and paths, facing |
| 160–161 | Cultivation comparison; no-dig |
| 162–163 | Digging and smothering, facing |
| 164–166 | Greenhouses |
| 167 | Crop rotation |
| 168–169 | Compost, facing |
| 170–171 | Watering; sowing and planting |
| 172–175 | Index |
| 176 | End balancing blank |

The blank versos before the first two openers keep them recto and preserve the
How-to and crop spreads. All vegetable guides still open verso. The seven blank
interior folios are **8, 19, 73, 91, 95, 108 and 176**; inside covers are also blank.
PDF page = interior folio + 2. The four cover leaves are not interior pages.

## Next work, in order

1. Review the **three section opener designs and short introductory copy**, and
   the assembled sequence, with John. The order already follows his instruction;
   do not reopen it as an unimplemented proposal.
2. Refine the **three-page contents** after that review. It currently has 81
   destinations, correctly resolved to this book. Its design remains for review.
3. Resume wider opening-copy/artwork review when John requests it: title,
   publication details, introduction, author biography, how-to stock allocation
   and back-cover copy. The author bio is saved for his own editing; other
   opening placeholders remain.
4. After copy/order decisions, prepare affected production proofs, settle the
   unit edition and stock, refresh costs and derive the final cover wrap from
   verified pagination and the chosen supplier template. Do not repeat the
   full guide export unless the required production change warrants it.

The new openers reuse existing artwork: H4 summer vegetables, established
aphid/mildew/slug risk drawings, and the approved starter-plot illustration.
[Their source record](../publication/whole-book-order-preview/SECTION-OPENERS.json)
distinguishes accepted source art from the new proposed compositions. No artwork
was generated for this ordering change.

## Components and approval status

| Component | Current approval and review position |
| --- | --- |
| Format and guides | 185 × 240 mm Compact Book v1 approved through [frozen specimens and contract](../BOOK-PRINT-STYLE.md). All 44 crops and 14 Troubles groups / 220 conditions prepared in both units; full-collection approval remains separate. |
| Covers | G2 Cream centre selected; B5 Off-centre collage preferred. Exact source artwork is in the [asset registry](../assets/README.md). Editable lettering, exact page crops and production wrap remain pending. |
| Contents | Original compact source pages 4–5 approved 7 October. [Expanded three-page contents](../publication/contents-update/REVIEW.html) at current 4–6 is a proposal. Original harvest illustration is retained. |
| How-to | Original compact source pages 6–7 approved 7 October. Current book positions are 10–11; H5/H6 replacement headers remain proposed. |
| Title, publication, welcome | [Three-page design proposal](../publication/vegetable-guru-opening-pages/REVIEW.html); placeholders and final copy await review. Current combined preview includes the later author bio and H3/S1 artwork allocation. |
| Section openers | New 14 October designs/copy at 9, 109 and 155, ready for review; no new approval asserted. |
| Why Grow and twelve further techniques pages | [Thirteen-page collection](../publication/topic-pages/techniques-expansion/COLLECTION-APPROVAL.json) approved complete 12 October. Includes Rotation and all final wording; no rolling section review remains. |
| Cultivation | [Four pages approved 8 October](../publication/topic-pages/cultivation-dig-no-dig/APPROVAL.json), including labelled matrix, two digging pages and separate smothering panel. Current folios 160–163. |
| Index | [Four-page index approved 12 October](../publication/book-index/APPROVAL.json), with 273 entries and 33 see references. Numeric integrated derivative at 172–175; frozen proof retains its historical T/C labels. |

Focused collection numbers are not current book folios. Organic remains local
page 2 of the approved thirteen-page proof and now starts the book's technique
content at 156 after Why Grow moved to the opening. The techniques content totals
sixteen pages at the back, plus its new divider; Why Grow is the seventeenth
approved additional page. The two-page compost construction pilot and the
side-by-side compost-image trial are superseded/rejected. Compost's approved
30 mm image and final copy need no further restoration. The crop-supports skill
test was discarded at John's request and is not a book/design reference.

## Editable copy and safe changes

| Copy | Owning editable source |
| --- | --- |
| Book metadata, three new opener headings/copy/artwork | [book.json](../../../hackriculture-data/book-layout/book.json), including `sectionOpeners` |
| Welcome, author, publication, how-to, contents, index, future cover copy | [Eight-document book-layout folder](../../../hackriculture-data/book-layout/README.md) |
| Why Grow and twelve techniques pages | [Expansion copy.json](../../../hackriculture-resources/summaries/techniques-expansion/copy.json) |
| Four cultivation pages | [Cultivation copy.json](../../../hackriculture-resources/summaries/cultivation-dig-no-dig/copy.json) |

Preserve John's manual edits. Shared AI/app writes require the
[hackriculture-data skill](../../../hackriculture-data/.agents/skills/hackriculture-data/SKILL.md)
and guarded writer with the freshly read revision, honest actor and exact-byte
backups. The [14 October save receipt](../publication/whole-book-order-preview/SECTION-OPENERS-SAVE.json)
records changes to `book.json` and `contents.json`; no canonical gardening advice
was changed. John may edit book-layout files directly, then validate them.

`npm run book:check` validates book copy. `npm run book:contents` builds the
expanded contents only. The older `book:build` / `book:entries` commands retain
the seven-page opening composition and **do not update the current full preview**.
Use the [whole-book workflow](../publication/whole-book-order-preview/README.md)
for affected components and reassembly; index terms store stable destinations,
not page numbers. Do not manually patch generated HTML or PDF text as the master.
The selected G2/B5 lettering is raster; cover JSON edits need a separate editable
cover reconstruction before they become visible.

## Current brief and decisions

**The Vegetable Guru: Your at-a-glance growing companion** is a UK-focused,
non-waterproof, full-colour paperback at **185 × 240 mm**, with the full collection.
Three/four-page crops are allowed to preserve useful content. The working service
is **Bookvault** and cover price **£17.50**, customer shipping separate. Direct
links to **The Great British Bookshop** are the selected launch route, with most
buyers expected from John's Hackriculture YouTube channel. Shopify/native YouTube
Shopping is deferred. Stock, physical quality and final production specification
remain open; no listing has been activated. KDP remains comparison/fallback only.

Keep G2's cream centre/grid, title/subtitle and no guide-count front footer. B5
uses dark green, left blurb and angled torn-page snippets on the right; replace
those snippets with exact book crops for production. Back wording uses the title
and **44 growing guides and 14 troubleshooting guides**, with price and reserved
ISBN/barcode space. Detailed explanations belong inside. Cover C is the retained
A4 cover and a book colour/style reference only; C1/C2, the growing-bed sketch and
B1–B3 are rejected studies, not current directions.

The eight hero-style stock redraws and their [comparisons](../assets/vegetable-guru-stock/STYLE-REDRAW.html)
remain saved. Current combined allocations: original harvest contents artwork,
H5/H6 how-to, H3 welcome, S1 author and H4 varieties opener. Proposed placements
are not approved merely because their source style is accepted. H1/H2 contents
placements belong to the older rough preview; S2 remains an alternative.

## Design skills — use before design work

Read the actual relevant `SKILL.md` before design/layout/artwork work, even if
it is not automatically listed. The [book design system](../BOOK-DESIGN-SYSTEM.md)
owns shared rules; [Compact Book v1](../BOOK-PRINT-STYLE.md) owns guide composition;
the [asset registry](../assets/README.md) identifies exact approved sources.

| Work | Skill |
| --- | --- |
| Overall book design, openings, covers, illustrated topic composition | [vegetable-guru-book-design](../../.agents/skills/vegetable-guru-book-design/SKILL.md), including its [topic workflow](../../.agents/skills/vegetable-guru-book-design/references/illustrated-topic-pages.md) |
| Bound-book fit, pagination, facing spreads and PDF proofs | [book-layout-review](../../.agents/skills/book-layout-review/SKILL.md) |
| Matching the approved vegetable illustration style | [vegetable-guru-artwork](../../.agents/skills/vegetable-guru-artwork/SKILL.md) |
| Retained individual A4 sheets | [guide-layout-review](../../.agents/skills/guide-layout-review/SKILL.md) |
| Drafting/rewriting in John's voice | [Write Like John](/Users/johnlennon/.codex/skills/write-like-john/SKILL.md) |
| Researched gardening summaries | [Gardening Research](/Users/johnlennon/.codex/skills/gardening-research/SKILL.md) |
| Shared JSON reads, safe saves and structure | [hackriculture-data](../../../hackriculture-data/.agents/skills/hackriculture-data/SKILL.md) |

Use correct British English, preserving facts and qualifications. For technique
advice retain John's methods but use impersonal wording, not invented experience
or “I use”/“my garden”. Source titles remain verbatim. No subagents unless John
explicitly requests them. Passing checks do not confer design/copy approval.

## Gardening Research and local resources

The research order is **exact canonical JSON → John's manuscript/corrected video
transcripts → online sources**. An exact JSON measurement or simple technique is
definitive. For techniques, read the full relevant manuscript and video accounts
and record **John's method, sequence, reasons and compromises before outlining**.
Online authorities fill named gaps; they do not replace his approach or routinely
validate it. Use a simple majority of independent comparable online sources for
online disagreements. Only a clear simple local error may be corrected that way;
substantive conflicts or unresolved votes require John's clarification.

The [resource library](../../../hackriculture-resources/README.md) owns the local
catalogue and [remote list](../../../hackriculture-resources/REMOTE-SOURCES.md),
including RHS and Charles Dowding. Local active references contain only John's
work: his part-finished *Hackriculture* and 54 selected gardening-video transcripts.
The first newest-to-oldest transcription pass is complete; 16 unrelated uploads
were excluded. [Channel catalogue and source notes](../../../hackriculture-resources/local/hackriculture-youtube/README.md)
record coverage, timestamps, source media, limitations and applied author
corrections. Machine transcripts have not had a full listening pass. Preserve
raw sources and distinguish them from confirmed corrections. No ongoing channel
monitor or resumed transcription job is requested.

*The Vegetable Expert* is removed from the active library and has no research or
style-reference role. Original supplied screenshots remain outside it. Research
copy belongs in `hackriculture-resources/summaries/`, separate from canonical
JSON and frozen approved pages. The [cultivation research](../../../hackriculture-resources/summaries/cultivation-dig-no-dig/research-notes.md)
and [expansion research](../../../hackriculture-resources/summaries/techniques-expansion/research-notes.md)
retain claims and sources. John explicitly chose **about 10 cm / 4 inches** for a
new no-dig bed's starting compost layer.

## Prepared evidence and remaining limits

The [current preview checks](../publication/whole-book-order-preview/CHECKS.json)
and [visual receipt](../publication/whole-book-order-preview/VISUAL-REVIEW.json)
record 137 saved guide pages reused, seventeen approved additional-page text
checks, 81 contents destinations, 273 index entries and 371 internal index links.
All 180 leaves were rendered. Visual coverage is representative, including new
openers and the key facing pairs; it is not a fresh review of every guide.
Both-unit contents passed PDF/visual checks. Fourteen focused tests passed on
14 October; 95 protected source files and all eight current copy inputs were
verified. No guide re-export, new art or canonical gardening edit was performed.

The [technical review pack](../publication/book-preparation/REVIEW.html) retains
**earlier 148-page** imperial/metric KDP and Bookvault production drafts, plus
600 dpi flattened-art derivatives. Their geometry/text/visual receipts remain
valid evidence for those files, but they omit later pages and are not the current
book order. The preceding 170-page order preview is also preserved. See the
[technical ledger](../publication/BOOK-PREPARATION-STATE.json) for hashes and exact
coverage; dated fields are not a work queue.

The current complete PDF is a screen derivative. Final print-resolution output,
metric integration, small icon detail, stock/colour/PDF preflight, final cover
wrap and physical proof remain outstanding. The saved 148-page costs and spine
template are **historical inputs**, not estimates for 176 pages. Its 8 mm label
versus 8.436 mm filename discrepancy remains unresolved; derive a fresh final
wrap after stock/pagination decisions. [Publication research](../publication/README.md)
is dated evidence and needs rechecking when that production work is requested.

## Runtime, completed work and boundaries

Use [SETUP](../../SETUP.md) and relevant [DEVELOPMENT](../../DEVELOPMENT.md) sections.
Admin saves and browser PDF generation need `start.command` on loopback; offline
assembly/checking does not. Check process ownership and availability instead of
assuming a server or browser tab survives this session. Do not expose credentials
or stop a user-owned server. This handover refresh changed documentation only.

Write Like John, Gardening Research, the topic-composition workflow, JSON copy
migration, record-level saves and the [Mushroom schema fix](../publication/mushroom-schema-fix/CHECKS.json)
are complete. Do not restart installers or consumed proposals. Preserve the
[UK variety refresh](../variety-review/README.md), [onion-set work](../onion-planting/README.md)
and [installed content refinement](../content-refinement/README.md). Difficulty
labels remain Easy / Fairly Easy / Medium / Tricky / Difficult. Crop bubbles and
unrelated shared editorial questions remain outside this task.

A4 retains [Richer A](../VEGETABLE-PRINT-STYLE.md) and [Open Editorial](../TROUBLES-PRINT-STYLE.md)
with separate approvals; do not apply compact changes to it. Old A4 batch folios
and manifests are historical. A5/A6 remain selectable but unreviewed.

Both the waterproof quote monitor and compact preparation automation remain
**paused**. Do not restart them or treat the completed overnight brief as an
ongoing schedule. Waterproof work is deferred. No supplier messages, title
creation/upload, fees, proof orders, ISBN allocation, rights declarations,
contractual acceptance or distribution activation are authorised by this resume.
Preserve existing KDP titles; the old *The Practical Gardener* draft is not this
book's trial. Publication and physical-proof purchase need John's explicit decision.

Preserve all working-tree edits, approved references, runtime inputs and exact
shared-data rollback receipts. Do not reset, clean, commit or push incidentally.
Git history does not mean uncommitted work is saved remotely. Fresh edits must
read the live revision; never reuse a revision copied from old documentation.
