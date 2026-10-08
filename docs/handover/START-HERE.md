# Current project handover

Updated 8 October 2026. This is the authoritative current scope and next-action
summary. Replace changed decisions here; keep detailed checks in their receipts.
John's latest instruction overrides older documentation. Start with the root
README, AGENTS and SHARED-DATA; then read the relevant style/implementation files.

**Latest review:** the [rough Bookvault progress preview](../publication/bookvault-progress-preview/REVIEW.html)
brings G2/B5, the latest opening-page artwork and the complete imperial interior
together for John's morning review. It has 148 interior pages plus four cover
leaves (152 PDF pages), sample spreads and a short next-decision list. This is a
screen derivative, not an upload file or new approval. No guide re-export or
new artwork generation was performed; [checks](../publication/bookvault-progress-preview/CHECKS.json)
record its sources and coverage.

**Editable book copy:** John authorised the move into shared
[book-layout JSON](../../../hackriculture-data/book-layout/README.md) on 8 October.
The seven files now own opening copy, common metadata and future cover copy.
`npm run book:check` validates edits; `npm run book:build` creates separate
working opening proofs. The [migration receipt](../publication/book-layout-working/MIGRATION.json)
records unchanged text and pixel-identical 90 dpi renders for all 14 pages
(seven per edition), plus 58 contents references per edition. Approved originals,
canonical gardening records, full-book previews and guide PDFs are unchanged.
Current JSON uses the source-proof artwork; the rough preview's stock allocation
remains separate and proposed. Existing G2/B5 lettering is raster; cover-copy edits
will take effect when the selected covers are rebuilt as editable compositions.

## Data maintenance skill — use before JSON work

John requires [hackriculture-data](../../../hackriculture-data/.agents/skills/hackriculture-data/SKILL.md)
for shared-data reads, edits, schema changes and recovery in this and future
sessions. Read the skill before the work, following its data map and safe-write
reference as needed. Its maintained source is in `hackriculture-data`; local
skill-folder links make it available to print, website and video. Automatic
selection is enabled; use the direct link when it is not shown in the session.
Keep its references aligned with live schemas/writers. It adds no authority to
change approved copy or resume completed work.

The admin editor now saves just changed records through `/api/admin/save-records`
and the shared `saveRecords` writer. Omitted records remain untouched; complete
supplied records replace their predecessors. Revision guards, schema/semantic
validation, AI protections, attribution and exact-byte backups remain in place.
The revision still covers both collections. `saveCollections` and `/save` are
compatibility adapters for retained batch tools; use record saves for new work.
See [safe writes](../../../hackriculture-data/.agents/skills/hackriculture-data/references/safe-writes.md).
This implementation/skill work changed no gardening JSON or layouts.

The data-maintenance checks pass: 10 shared-writer tests, 3 admin HTTP/client tests,
8 book-copy tests, skill metadata and all three discovery links.

**Mushroom schema mismatch resolved (8 October):** saved introduction counts now
accept positive integers above twelve. The retained legacy fitter honours saved
counts, while automatic fitting keeps its twelve-sentence limit. Active Richer A
and compact renderers already included all thirteen approved Mushroom sentences;
the correction changes no gardening JSON, approval signatures or current layout.
All 43 routine tests, 9 focused print tests and TypeScript pass. Mushroom proofs
in both units remain two A4 pages and three ordinary compact pages, with all ten
PDF pages visually checked. Compact text and page counts match saved proofs.
[Checks and proof paths](../publication/mushroom-schema-fix/CHECKS.json) record
the bounded coverage; supplier books and full collections were not rebuilt.

## Design skills — use before design work

John explicitly requires future sessions to use the saved project skills and
source designs. Read the relevant `SKILL.md` before designing, changing layout
or generating artwork; do not rely only on its name or on memory from a chat.

| Work | Required project skill |
| --- | --- |
| Overall book style, cross-section consistency, or a new/revised cover or opening-page design | [vegetable-guru-book-design](../../.agents/skills/vegetable-guru-book-design/SKILL.md) |
| Book page fit, vegetable/Troubles layouts, facing spreads, pagination and PDF assembly | [book-layout-review](../../.agents/skills/book-layout-review/SKILL.md) |
| Decorative vegetable illustration generation, restyling or style comparison | [vegetable-guru-artwork](../../.agents/skills/vegetable-guru-artwork/SKILL.md) |
| Individual A4 sheets and loose-leaf guides | [guide-layout-review](../../.agents/skills/guide-layout-review/SKILL.md), retained under its original identifier |

The overall skill uses layout and artwork skills only when the task needs them.
All four allow automatic selection; if a skill is not shown in the session's
catalogue, read its linked project file directly. This does not authorise subagents.

The [book design system](../BOOK-DESIGN-SYSTEM.md) owns shared colours, typography,
geometry and section treatments; [Compact Book v1](../BOOK-PRINT-STYLE.md) owns
detailed guide composition. Inspect the actual sources in the
[asset registry](../assets/README.md) before adapting them. Reuse established
rules and approved assets. Where a choice is unresolved, identify the gap and
prepare a clearly labelled proposal within the task's scope; do not present an
invented choice as an existing rule or approval. Keep A4 and book rules separate.

## Current brief and decisions

Prepare a **non-waterproof, conventionally bound, full-colour POD book** for UK
vegetable gardeners. Include all **44 vegetable guides, 14 Troubles groups** and
suitable opening pages. **185 × 240 mm Compact Book v1** is approved and is the
web generator default. Keep useful information; three/four-page crops are allowed.
John's current working choice (6 October) is **£17.50 cover price and Bookvault**.
He expects most sales to originate from his **hackriculture YouTube channel**,
so Amazon's customer reach is less important. On 7 October John selected
**direct links to The Great British Bookshop for launch**, saving Shopify/native
YouTube Shopping for a later iteration. No listing is activated. Customer
shipping is separate and excluded from the present comparison. The earlier
£25-delivered target is historical context. Stock, print quality and final
production specification remain to be confirmed. KDP is retained as comparison
evidence/fallback, not the lead production route.

John’s latest title decision on 7 October is **The Vegetable Guru**, with subtitle
**Your at-a-glance growing companion**. This replaces *Veg Sorted* / *The vegetable
grower’s cheat book*. John has removed the **44 at-a-glance…** line from the
front cover. The book still contains 44 growing guides and 14 Troubles groups;
the working price remains **£17.50**.

John rejected both compact Cover C proposals, C1 and C2, on 7 October. The next
cover design should be **redrawn from scratch**, rather than constrained to the
Cover C composition. The [rejected proposals](../publication/cover-c-compact/REVIEW.html)
remain historical evidence. Cover C remains approved for A4, but is no longer the
required starting point for the compact book. John then requested fresh sketches,
using Cover C for colour and illustration style only, alongside the approved
heroes and inner pages. John rejected the growing-bed sketch, found harvest
promising but its layout boring, and then **selected G2 Cream centre** from the
[grid variations](../publication/vegetable-guru-grid-variations/REVIEW.html).
Keep that front-cover direction, without the count footer. John requested several
back-cover ideas using **The Vegetable Guru** and **44 growing guides and 14
troubleshooting guides**, real book-element thumbnails, lorem ipsum, £17.50 and
an ISBN/barcode panel. John rejected all [B1–B3 mock-ups](../publication/vegetable-guru-back-cover/REVIEW.html).
Retain **B2’s dark green background**, but replace the neat explanatory widgets
with **slightly angled, overlapping pieces that look torn from book pages**.
They should give an impression of the contents; explanations belong on the
inside covers. John now **prefers B5 Off-centre collage** from the
[B4–B6 concepts](../publication/vegetable-guru-back-collage/REVIEW.html), alongside
the selected G2 front. Carry B5's dark green, left-hand blurb and angled torn-page
collage on the right into refinement. This is a preferred design direction;
final artwork and production wrap remain pending. Both concepts are now included
in the rough progress preview, without a production spine.

John **approved the compact contents and illustrated how-to on 7 October**:
[four pages in both units](../publication/vegetable-guru-entry-pages/REVIEW.html)
at physical folios 4–7, with original artwork/explanations and current Bookvault
guide references. Exact approved files are recorded under `compactEntryPages`
in the [central manifest](../redesign-rollout/APPROVAL.json). They preserve the
seven-page opening allowance. Separate copies, with proposed replacement header
artwork, are now included in the rough imperial preview; approved files remain intact.
John then authorised title, publication and welcome pages with **lipsum orum
for the text blocks**. A separate [three-page proposal](../publication/vegetable-guru-opening-pages/REVIEW.html)
is now ready in both units for pages 1–3: G2-inspired title, publication placeholders
and illustrated welcome/author space. These new layouts and final copy await
review. These three pages are also included in the rough preview. The earlier
production-sized assemblies retain their older opening pack.

John then requested a moderate stock of unique illustrations, related variations
for facing-page headers, and a replacement for the pea beside the author block
while retaining its position. [Eight new illustrations](../assets/vegetable-guru-stock/REVIEW.html)
are ready: three header pairs and two portrait options, with separate screen
placement studies. These are candidates for review; approved page files and
source PDFs remain unchanged. [Prompts and checks](../assets/vegetable-guru-stock/ARTWORK.json)
record the new artwork and proposed allocation.
John accepted the subjects but required the styles to match the approved heroes.
All eight have now been redrawn with those heroes as direct references; John
said the redraws are better. [Reference/old/new comparisons](../assets/vegetable-guru-stock/STYLE-REDRAW.html)
are saved. The rough preview tries H1/H2 on contents, H5/H6 on how-to, H3 on
welcome and S1 beside the author block. This allocation awaits review; production
installation remains pending. At John's request, the project now has a reusable
[Vegetable Guru artwork skill](../../.agents/skills/vegetable-guru-artwork/SKILL.md)
with explicit style rules and sample comparisons before batch expansion.

YouTube Shopping research finds no published author-level direct connection for
the Bookshop. Native product tags are supported through an own Shopify/Wix store
with Bookvault fulfilment; that changes fees and customer-service responsibility.
Ordinary links to the individual Bookshop page are now the selected launch
route. Retain the [compatibility findings](../publication/README.md#youtube-shopping-compatibility--checked-6-october-2026)
for a later iteration. Channel eligibility and an end-to-end checkout
have not been tested; no store connection or account change is authorised by
this research request.

The 6 October direction to adapt the approved **Harvest corner A contents** and
**illustrated how-to** remains current. Their source files and approved A4 output
PDFs remain intact. The separate four-page compact adaptation now carries forward
the original artwork and explanations and has John's approval. Smaller openings
are authorised. Preserve
those A4 originals and use separate compact working files. The cover part of the
6 October direction is superseded by the fresh-design decision above.

Waterproof folders/books are deferred to a possible second run. The research is
[retained in design ideas](<../../../design ideas/waterproof-publication-research-2026-10-05/README.md>).
Both the waterproof quote monitor and compact preparation automation are **paused**.
Do not restart either, send supplier mail or resume an old completed rollout
without John's direction. The overnight deadline was specific to that completed
run, not an ongoing work schedule.

## Components and approval status

The [asset registry](../assets/README.md) locates exact source layouts, artwork and
approval manifests. Preserve those sources; record intentional departures when
adapting them. An approved specimen is not approval of every page in a new book.

| Component | Approved basis | Current book status |
| --- | --- | --- |
| Vegetable pages | [Compact Kale reference and contract](../BOOK-PRINT-STYLE.md) | All 44 prepared in both units; full collection awaits John's review |
| Troubles | Same compact contract; frozen Carrot/Parsnip specimen | All 14 groups / 220 conditions prepared; some spacing exceptions remain |
| Front cover | G2 Cream centre, selected by John on 7 October | Preserve selected grid composition and title/subtitle; final production artwork/wrap pending |
| Back cover and spine | B5 Off-centre collage preferred by John on 7 October | Refine B5 with exact page crops; final wrap requires confirmed stock, pagination and template |
| Contents | [Harvest corner A](../assets/README.md#contents) | Compact pages 4–5 approved; H1/H2 replacement headers tried in the rough imperial preview |
| How-to | [Approved illustrated page](../assets/README.md#illustrated-how-to) | Compact pages 6–7 approved; H5/H6 replacement headers tried in the rough imperial preview |
| Title, publication details, introduction | [Three-page design proposal](../publication/vegetable-guru-opening-pages/REVIEW.html) | Included in rough imperial preview, with H3/S1 welcome artwork; lipsum and metadata placeholders remain; design and final copy await approval |
| Guide artwork and gardening data | [Source registry](../assets/README.md), [shared-data policy](../../SHARED-DATA.md) | Existing approvals remain; book copy changes stay in separate source-linked drafts |

## Prepared evidence and remaining limits

The earlier [technical review pack](../publication/book-preparation/REVIEW.html) retains
**148-page review interiors in imperial and metric for KDP and Bookvault**:
92 vegetable pages + 45 Troubles pages + seven opening drafts + four blanks.
Forty crops have two pages; Carrot, both Tomatoes and Onions/Shallots have three.
Every vegetable opens verso so its first two pages face; the four blank rectos
at folios 15/69/87/91 are an **unapproved pagination proposal**. Revised openings
may change this count, contents references, costs and spine calculations.

All 288 KDP source content pages have recorded PDF visual review. Bookvault has
complete physical/text/folio checks with representative visual review. Separate
600 dpi RGB artwork-flattened books retain vector text and pass complete local
checks; their visual review is representative. These checks establish neither
physical print quality nor user/supplier approval. The
[technical checkpoint](../publication/BOOK-PREPARATION-STATE.json) links exact
hashes, coverage, original/derivative files and unresolved findings.

Remaining production issues: small icon details below KDP line-weight guidance;
final colour/PDF requirements; Bookvault's template labels an 8 mm spine while
its filename encodes 8.436 mm; no final cover wrap, Previewer acceptance or
physical proof. Some continuation/Mushroom pages and Troubles columns remain
naturally open. Use the recorded crop-specific exceptions when reviewing, not
blanket filling or font reduction. Canonical data and frozen references remain
unchanged by book preparation. Costs/specifications are dated evidence in
[publication research](../publication/README.md), not guaranteed quotes.

## Next work, in order

The current decision sequence, including John’s 7 October title and cover reset:


1. **Cover price — working choice made:** £17.50, customer shipping separate.
   The 148-page costing basis remains provisional. Retain the sensitivity
   [matrix](../publication/README.md#cover-price-matrix--6-october-2026) and recost
   if stock/page count changes.
2. **POD service — working choice made:** Bookvault, with YouTube as the main
   source of buyers. Direct Great British Bookshop links are the selected launch route;
   final stock/process choice still needs physical proof evaluation.
3. **Opening copy and image review — current focus:** leaf through the
   [rough Bookvault progress preview](../publication/bookvault-progress-preview/REVIEW.html),
   including pages 1–7 with H1/H2 contents, H5/H6 how-to, H3 welcome and S1 author
   artwork. H4/S2 remain alternatives. Review the opening sequence, image allocation,
   four blank interior pages and blank inside covers. Then agree introduction,
   author, publication and back-cover copy in the shared `book-layout` JSON.
   Lipsum remains in place. The approved
   contents/how-to files remain byte-identical; all 58 references still match the
   existing interior. Only imperial was assembled, as John requested one edition
   and a rough review. Make affected production proofs after these decisions;
   do not repeat the full guide export merely to resume.
4. **Later cover refinement — G2 selected; B5 preferred:** use **The Vegetable Guru** /
   **Your at-a-glance growing companion**, without the 44/14 front footer. Refine
   [B5 Off-centre collage](../publication/vegetable-guru-back-collage/B5.png)
   alongside the selected G2 front. Snippets should suggest the contents, with
   torn edges and slight angles; reserve explanation for inside covers. Refine
   B5 with exact page crops and the requested copy/placeholders
   before the stock-dependent wrap.
   Cover C guides colour/style only. The growing-bed sketch and C1/C2 are rejected.

After those decisions, undertake only the affected design/review work. The old
overnight builders reproduce the unselected drafts until revised. Do not repeat
completed guide exports merely to resume. Remaining production dependencies are:

- Review revised proofs and the prepared collection with John; settle first unit
   edition and facing-page/blank-page policy.
- After opening-page/order changes, remeasure both editions, regenerate contents
   and folios, reassemble, update costs and derive the cover from the chosen
   supplier's verified stock/template. Resolve icon detail and final PDF preflight.
- Plan supplier preflight around Bookvault. The earlier KDP trial authority is
   retained as a fallback, not an instruction to create a parallel edition.
   Account work depends on suitable files, confirmed metadata and applicable
   authorisation; verify draft identity/upload outcomes and record file hashes.
- Physical proof purchase, final proof approval and publication need John's
   explicit decision. No orders, fees, ISBN allocation, rights declarations,
   contractual acceptance or distribution activation have been authorised.

The earlier Kindle draft *The Practical Gardener* is not this book's authorised
trial. No new title, upload, proof order or publishing declaration has occurred.
Leave existing KDP titles untouched. If access or missing publishing decisions
block account work, continue independent local preparation without inventing facts.

## Runtime and retained work

The ordinary compact web batch exports individual **guide proofs**, with local
numbers and no openings. The separately prepared book assemblies contain actual
physical folios and draft openings. See [DEVELOPMENT](../../DEVELOPMENT.md#compact-book-exports)
for these distinct paths and [SETUP](../../SETUP.md) for proportionate checks.
Do not substitute A4 smoke checks for actual compact PDF checks.

A4 still follows [Richer A](../VEGETABLE-PRINT-STYLE.md) and
[Open Editorial](../TROUBLES-PRINT-STYLE.md), with Cover C and the approved entry
pages. A4 folios 1–88 / 89–132 describe that edition only. Its September full
batch predates October updates; existence of a complete old manifest does not
make every current output file a coherent new batch. A5/A6 remain unreviewed.

Completed editorial work must not be restarted:

- [UK variety refresh](../variety-review/README.md): John approved final proofs,
  Blue Lake inclusion, Beetroot nested-group handling and initial-capital display.
  Full reserve catalogues remain for possible extended sheets; provisional legacy
  claims need evidence before reuse. [Latest save receipt](../variety-review/SAVE-RECEIPT.json).
- [Onions/Shallots](../onion-planting/README.md): separate seed/set routes and
  illustrations, including March–April set planting, are approved and installed.
- Difficulty labels are **Easy / Fairly Easy / Medium / Tricky / Difficult**.
  [Central approvals](../redesign-rollout/APPROVAL.json) record current front-matter hashes.
- [September content refinement](../content-refinement/README.md) is installed.
  Its proposal is consumed; do not rerun it over expanded live companions.
- Historical test evidence records a Mushroom `intro_sentences` schema failure;
  check its current relevance if touching that field. Its old missing-sowing
  warning was fixed: do not invent seed instructions for the approved kit route.
- Crop bubbles and [shared editorial questions](../../../hackriculture-data/planning/EDITORIAL-OPEN-QUESTIONS.json)
  remain outside this publication task; their existence does not reopen them.

Preserve all working-tree edits and exact shared-data rollback receipts. Git
history does not imply uncommitted work is saved remotely. No incidental reset,
cleanup of approved assets, commit or push. Future shared writes follow the live
revision guard, never a revision copied from this handover.
