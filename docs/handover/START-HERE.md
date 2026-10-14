# Current project handover

Updated 12 October 2026. This is the authoritative current scope and next-action
summary. Replace changed decisions here; keep detailed checks in their receipts.
John's latest instruction overrides older documentation. Start with the root
README, AGENTS and SHARED-DATA; then read the relevant style/implementation files.

**Latest complete-book review:** the [whole-book order preview](../publication/whole-book-order-preview/REVIEW.html)
includes G2/B5, current opening copy and contents, all approved additional pages
and the index with updated references. Its imperial PDF has **170 interior pages
plus four cover leaves (174 PDF pages)**; the browser shows every facing spread.
John wants to settle page order before refining the contents. This is a screen
derivative, not an upload file or new approval. All 137 guide pages reuse saved
content; no guide re-export or new artwork generation was performed.
[Preview notes and checks](../publication/whole-book-order-preview/README.md)
record source preservation, coverage and the proposed ordering choices.

**Author biography draft (8 October):** John resumed copy work with the author
bio. The [focused preview](../publication/author-bio-draft-2026-10-08/REVIEW.html)
shows a 55-word, source-based draft in the existing welcome-page author panel,
using Gardening Research and Write Like John. `author.paragraphs` and the shared
`book.authorName` (John Lennon) were saved through the guarded writer with exact
backups; [receipt](../publication/author-bio-draft-2026-10-08/SAVE-RECEIPT.json).
The [source record](../../../hackriculture-resources/summaries/author-bio-2026-10-08/research-notes.md)
uses his manuscript and corrected September transcript. The preview carries
forward H3/S1 and the existing 9.75 pt author type, without new artwork or approval.
[Checks](../publication/author-bio-draft-2026-10-08/CHECKS.json) cover both-unit DOM
fit, 4.81 mm footer clearance, one actual imperial PDF and its visual review,
plus screen context at folios 2–3. John confirmed he will refine the biography
himself in editable JSON; the page and source copy are saved, not newly approved. Other
welcome/publication copy remains placeholder text; existing full books and
approved files are unchanged. Old opening proofs predate this author-copy edit.

**Editable book copy:** John authorised the move into shared
[book-layout JSON](../../../hackriculture-data/book-layout/README.md) on 8 October.
The original seven files own opening copy, common metadata and future cover copy; `index.json` is now the eighth supported document.
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

## Writing skill — Write Like John

[Write Like John](/Users/johnlennon/.codex/skills/write-like-john/SKILL.md)
is installed as a personal skill (`write-like-john`), available across projects.
Read its actual instructions before drafting or rewriting in John's voice;
use the direct link if it is absent from the session's skill list.

It supports fresh prose from notes/data and rewrites of existing text, from a
sentence to a chapter, using correct British English rather than reproducing
spelling or grammatical errors. Preserve facts, qualifications, quotations and
attribution; never invent John's experiences. Its
[source record](/Users/johnlennon/.codex/skills/write-like-john/references/sources.md)
identifies the three supplied books: *Attics & Lofts*, *External Wall Insulation*
and *Walls, Windows, Floors & Ventilation*. The originals remain unchanged in
`/Users/johnlennon/Documents/web_site/design ideas/johns_writing`.
The skill includes a voice profile, writing workflows, annotated examples and
calibration cases; ordinary use does not require re-reading the full books.

The skill is complete. John was happy with the first supplied-text rewrite test
(an AI-safety passage, 8 October). Use it for introduction, author and back-cover
drafts when book-copy work resumes. This supplies writing style; it does not
approve new book copy or change source-write rules. Shared `book-layout` reads
and saves still require the data skill and its guarded writer.

## Gardening Research and illustrated topic pages

[Gardening Research](/Users/johnlennon/.codex/skills/gardening-research/SKILL.md)
is installed as a personal skill (`gardening-research`), created at John's request
on 8 October. Read its actual file before use. It researches practical gardening
questions in the JSON → local references → online order below, records claim-level support
and produces summaries through Write Like John. Illustrated-page requests also
use the existing design, artwork and layout skills; text-only requests remain text.

The book-design skill now includes an
[illustrated topic-page composition workflow](../../.agents/skills/vegetable-guru-book-design/references/illustrated-topic-pages.md)
for headers, hierarchy, reading order, text/image allocation, whitespace and
render-and-revise review. Explanatory/diagnostic art receives factual checks as
well as visual review. Explicit summary page limits are preserved through
curation and composition, with scope/space conflicts raised rather than hidden
by smaller type or extra pages. This creates a workflow, not a newly approved
template. Book pages default to 185 × 240 mm; A4 retains its own contracts.

The [resource library](../../../hackriculture-resources/README.md) owns the
[local catalogue](../../../hackriculture-resources/local/README.md) and
[remote sources](../../../hackriculture-resources/REMOTE-SOURCES.md), including
RHS and Charles Dowding. Local references now contain only John's own work:
about 43,000 words from his unfinished *Hackriculture* and the video transcripts
described below. On 8 October John removed *The Vegetable Expert* from the
library. Its four extracted text/source-note files were moved to Trash; its local
catalogue entry, remote book entry and former presentation-reference role were
removed. Original supplied screenshots remain untouched outside the library and
are not active research sources. Retained source notes record coverage, provenance
and extraction checks. These texts are not part of Write Like John's voice corpus.

**John's order of truth (8 October) now controls Gardening Research:**

1. **Exact canonical JSON matches are definitive**, including measurements and
   simple techniques. Use the current per-record vegetable and Troubles store
   through the data skill, preserving values, conditions and steps. The former
   aggregate names `vegetables.json` and `troubles.json` mean these collections;
   do not recreate old masters. No online vote or debate can displace an exact match.
2. **John's book and corrected video transcripts fill JSON gaps.** Treat them as
   correct without routine online corroboration. If multiple online sources
   disagree, their majority may correct a clear simple error such as a spelling
   or impossible depth. Substantive disagreements or uncertainty about a proposed
   correction require John to clarify before the affected advice is finalised.
3. **Online sources fill remaining gaps.** Start with the maintained list, widen
   the search if it lacks consensus, and use a simple majority of independent
   sources addressing the same claim/context. Ask John if still unclear. Add new
   sources when actual use establishes their reliability under these rules.

The [core skill](/Users/johnlennon/.codex/skills/gardening-research/SKILL.md)
and [evidence workflow](/Users/johnlennon/.codex/skills/gardening-research/references/evidence.md)
own the decision details. This replaces the earlier RHS-first research policy;
it does not authorise changes to the underlying JSON, manuscript or transcripts.

John also commissioned a [two-video YouTube pilot](../../../hackriculture-resources/local/hackriculture-youtube/README.md)
on 8 October. The two newest public video uploads now have readable local
transcripts, retained source media and three inspected stills each. The drying
video uses original-English automatic captions; the allotment tour uses local
audio recognition. John supplied seven corrections on 8 October, now applied,
including Sarpo Mira, swede and the 48-hour chilli-drying duration. Remaining
uncertain wording stays marked. Use the source notes and timestamps when researching.
John then authorised continued gardening-video transcription, newest to oldest,
stopping before the main account allowance falls below 10%. The
[channel catalogue](../../../hackriculture-resources/local/hackriculture-youtube/CHANNEL-CATALOGUE.md)
and [checkpoint](../../../hackriculture-resources/local/hackriculture-youtube/CHANNEL-IMPORT.json)
own coverage and exclusions. The first pass is complete: 54 selected videos
(52 added to the two-video pilot), with 16 unrelated uploads excluded. The new
material covers just over 10 hours; extraction and source-integrity checks passed.
These remain machine transcripts, with limited textual review and no full
listening pass. John has also resolved five clarification points across four
older videos (eleven occurrences), now applied and recorded in their source notes
and author-correction records. Preserve raw sources and distinguish machine text
from author-confirmed corrections. Voice-corpus expansion and book changes
remain outside this work; no recurring monitoring was requested.

Save future research copy and sources under the library's `summaries/`; link to
separate editable topic layouts/artwork/proofs in the print project when requested.
Canonical JSON and approved book pages are not automatically changed.
The [calibration briefs](/Users/johnlennon/.codex/skills/gardening-research/references/calibration.md)
include John's two-page no-dig overview and one-page watering comparison with one
hero. These remain example briefs, not commissioned or visually tested proofs.
The hierarchy update passed both changed skills' frontmatter validation,
Gardening Research UI-metadata checks, 314 local links/anchors across fourteen
Markdown files and Git whitespace checks. A desk review covered nineteen authority
cases; it was not a live research or visual test. Catalogue regeneration changed
only its source-use paragraph and preserved all 54 transcript entries. No new
research pages, artwork or PDFs were generated for this policy update.
The support-structures skill test was successful as a trial, but John explicitly
discarded its pages on 9 October. Its working files, resource summary and PDF
have been moved to the local Trash; original gardening sources are intact.
It is not part of the book or an active design reference.

## Design skills — use before design work

John explicitly requires future sessions to use the saved project skills and
source designs. Read the relevant `SKILL.md` before designing, changing layout
or generating artwork; do not rely only on its name or on memory from a chat.

| Work | Required project skill |
| --- | --- |
| Overall book style, illustrated topic-page composition, cross-section consistency, or a new/revised cover or opening-page design | [vegetable-guru-book-design](../../.agents/skills/vegetable-guru-book-design/SKILL.md) |
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

John selected **G2 Cream centre** on 7 October from the
[grid variations](../publication/vegetable-guru-grid-variations/REVIEW.html).
Keep its front-cover grid composition, current title/subtitle and no count footer.
For the back, John prefers **B5 Off-centre collage** from the
[B4–B6 concepts](../publication/vegetable-guru-back-collage/REVIEW.html): dark green,
left-hand blurb and slightly angled, overlapping torn-page snippets on the right.
Use **The Vegetable Guru** and **44 growing guides and 14 troubleshooting guides**,
with lipsum, £17.50 and reserved ISBN/barcode space until final copy is agreed.
The snippets suggest what is inside; detailed explanations belong inside the
covers. G2/B5 are included in the rough preview without a production spine.
Exact page crops, editable typography and the final production wrap remain pending.

Cover C remains the approved A4 cover and a colour/illustration-style reference
for the book. Its compact [C1/C2 adaptations](../publication/cover-c-compact/REVIEW.html),
the growing-bed sketch and [B1–B3 back covers](../publication/vegetable-guru-back-cover/REVIEW.html)
were rejected. Those studies are historical evidence, not instructions to restart
the selected cover directions.

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
| Contents | [Harvest corner A](../assets/README.md#contents) | Compact pages 4–5 approved; expanded three-page contents and 170-page order now proposed for review |
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

**Current focus: ratify page order before refining contents (12 October 2026).**
John requested a whole-book preview. The [complete imperial browser and PDF](../publication/whole-book-order-preview/REVIEW.html)
are ready, with all latest pages and revised physical folios. The
[three-page contents proposal](../publication/contents-update/REVIEW.html) remains
available in both editions. Its 78 destinations use the **170-page placement proposal**:
contents 4–6, How to use 7–8, Why Grow Your Own 9, existing guides 10–150,
Growing Techniques 151–166, index 167–170. Cultivation is proposed after plot
layout; Organic leads the back section. Why Grow's front placement, the cultivation
insertion, extra contents page and overall order still need review. Four existing
proposed interstitial blanks and verso crop openings are preserved.

The preview flags two decisions, neither applied: moving Why Grow to page 7
would put How to use on facing pages 8–9; one page before Growing Techniques
would turn Beds 153–154, Digging 157–158 and Compost 163–164 into facing pairs.
A section opener is one possible use of that extra page. Agree order and blank
policy before changing the plan or regenerating references. The current contents
watering label also differs from the approved page title and needs reconciliation
during contents refinement.

The [contents notes](../publication/contents-update/README.md) own editing/build
instructions and the exact assembly proposal. Shared `contents.json.expanded`
owns the new copy and stable destinations; `npm run book:contents` builds only
the three changed contents pages. Both-unit PDF checks cover six actual pages,
113 text regions and 78 references per edition. The separate whole-book preview
updates folios and resolves the index without altering original proofs. Its
checks verify every reused guide's body text, all seventeen approved topic pages,
365 measured component text regions and 488 numeric index references. All 174
pages were rendered; visual coverage is recorded separately. Only imperial was
assembled. Do not treat 170 pages as a confirmed print/spine
specification or silently reuse the older contents builders for this preview.

**Index approved (12 October 2026).** John said “Looks good - approved.” The
[four-page index](../publication/book-index/REVIEW.html) has 273 entries covering
44 crops, 220 individual Troubles conditions and practical topics, with 33 see
references. The [approval record and frozen sources](../publication/book-index/APPROVAL.json)
preserve the exact reviewed copy, layout, resolver, PDF and renders. Editable
terms remain in [index.json](../../../hackriculture-data/book-layout/index.json).
The frozen approved proof retains the old plan and local T/C references. The
whole-book preview has a separate four-page version with ordinary folios and
371 internal PDF links. The approved terms, layout and original proof remain
preserved. [Index notes](../publication/book-index/README.md) own the workflow.

**Techniques expansion complete and approved (12 October 2026).** John confirmed
“That works - I think this section is done now” after the final move of Organic
growing to second position. This closes review of all thirteen pages, including
the revised Rotation copy and Why Grow impersonal wording amendment. The
[collection approval and frozen sources](../publication/topic-pages/techniques-expansion/COLLECTION-APPROVAL.json)
preserve the final editable copy, layout and both-unit proofs. Earlier individual
approvals remain intact; their local numbering is historical.

Approved focused order: Why Grow Your Own (1), Organic growing (2), Start with
the right spot (3), Beds and paths (4–5), Greenhouses (6–8), Rotation (9), Compost
(10–11), Watering (12), Sowing (13). [Open the approved preview](../publication/topic-pages/techniques-expansion/REVIEW.html).
These are local review numbers, not final book folios. Why Grow Your Own remains
a proposed opening placement; the twelve techniques pages plus the four already
approved cultivation pages make sixteen pages at the back in the current preview.
The combined order is under review above. Final pagination and production
integration remain pending; do not restart
exports or reopen approved content review merely to resume.

[Editable JSON](../../../hackriculture-resources/summaries/techniques-expansion/copy.json)
owns all headings, paragraphs, captions and diagram labels. Preserve future
manual edits and the immutable approved snapshot separately. The
[research record](../../../hackriculture-resources/summaries/techniques-expansion/research-notes.md)
covers the manuscript, fifteen video accounts, reconciliations and online gaps.
[Section notes](../publication/topic-pages/techniques-expansion/README.md) retain
individual decisions, approved sources and superseded trials. Both compost pages
are approved: the one-page bin overview has Compost bin basics left and Three
bins is best right; the use page keeps the original stacked composition and
accepted 30 mm illustration. The construction pilot and side-by-side image trial
remain superseded/rejected. No further image enlargement or copy reduction is pending.

[PDF checks](../publication/topic-pages/techniques-expansion/CHECKS.json) cover
both thirteen-page proofs and 228 text regions each. The
[visual receipt](../publication/topic-pages/techniques-expansion/VISUAL-REVIEW.json)
and [page-order record](../publication/topic-pages/techniques-expansion/ORGANIC-PAGE-ORDER.json)
record exact coverage and preservation; the [checkpoint](../publication/topic-pages/techniques-expansion/WORK-STATE.json)
marks the focused work complete. The later whole-book order preview is a separate derivative.

**Use impersonal advice throughout this expansion:** retain John's methods and
qualifications, but remove autobiographical framing such as ‘I use’ and ‘my garden’.
Source titles remain verbatim. The [earlier wording receipt](../publication/topic-pages/techniques-expansion/IMPERSONAL-COPY-REVISION.json)
records the first 21 changes; the rule continues to apply to new pages.

Gardening Research now requires a full relevant manuscript/video reading and a
record of **John's approach before the outline**. The method, sequence, reasons
and practical compromises must come from his work after the focused canonical
check. Online authorities only fill named gaps; they do not decide the structure
or routinely validate his advice. A later video may explicitly develop an earlier
book method; record that development rather than losing it.

**Approved cultivation baseline.** John **approved the
four cultivation pages on 8 October 2026**, including the labelled comparison,
digging continuation and separate smothering panel. The [approval record](../publication/topic-pages/cultivation-dig-no-dig/APPROVAL.json)
hashes frozen proofs, editable text, layout sources and placed artwork. He may
make further text tweaks in the linked working JSON; preserve those edits and
rebuild only affected proofs when requested. John requested
compact overview sections, developed one at a time, with balanced treatment of
the first topic: cultivation by digging and no-dig. The current
[four-page plan](../publication/topic-pages/cultivation-dig-no-dig/PLAN.md) follows
John's requested expansion after he liked the first draft and four-column
comparison. The [focused draft preview](../publication/topic-pages/cultivation-dig-no-dig/REVIEW.html)
contains comparison/pros-and-cons, no-dig practice and **two digging pages**.
These distinguish annual single digging from initial/occasional double digging,
explain the trench sequence fully, and devote roughly the final half-page to
temporary tarpaulin smothering from John's manuscript. Four illustration groups
contain ten panels; the new fork diagram shows loosening below the trench.
Both unit editions and the proposed 150–151 facing spread have actual PDF checks; see
[checks](../publication/topic-pages/cultivation-dig-no-dig/CHECKS.json).
John chose **about 10 cm / 4 inches** as the starting compost depth after reviewing
Dowding's advice. [Editable working copy](../../../hackriculture-resources/summaries/cultivation-dig-no-dig/copy.json)
and [claim/source notes](../../../hackriculture-resources/summaries/cultivation-dig-no-dig/research-notes.md)
are saved in the resource library. John's latest corrections are now reflected:
the matrix has a leading **Topic** column (Overview, Weeds, Compost, Tools, Soil,
Later years), followed by **Dig pro / Dig con / No-dig pro / No-dig con**. Page 152
is headed **Digging — continued**; **Another option: Smothering** is a separate
coloured panel explicitly usable before digging or no-dig. Pages 150–151 and all
artwork are unchanged. The preceding four-page proof is retained under
`references/expanded-digging-reviewed/` in the topic folder; the approved baseline
is under `references/approved-2026-10-08/`. The presentation review is complete.
The whole-book order preview places cultivation at 155–158 with matching contents
and index references; final order remains unapproved. Original folios 149–152
are historical. The two digging pages still require a page turn in the current
170-page proposal, as flagged above. Original proofs and canonical records remain
unchanged. The earlier crop-supports skill test has been discarded.

The author biography is saved for John's own edits. Wider opening-copy and
artwork work remains deferred during this focused section. Write Like John
is complete and its first rewrite test received positive feedback. Gardening
Research and the illustrated topic-page composition workflow are installed.
The book-copy migration, existing design/data skills, record-level saves and
Mushroom schema correction are also complete.
The sequence below remains the wider publication plan after this focused work.

1. **Cover price — working choice made:** £17.50, customer shipping separate.
   The 148-page costing basis remains provisional. Retain the sensitivity
   [matrix](../publication/README.md#cover-price-matrix--6-october-2026) and recost
   if stock/page count changes.
2. **POD service — working choice made:** Bookvault, with YouTube as the main
   source of buyers. Direct Great British Bookshop links are the selected launch route;
   final stock/process choice still needs physical proof evaluation.
3. **Opening copy and image review — deferred:** preserve John's author-bio edits.
   When he resumes the wider opening review, leaf through the
   [whole-book order preview](../publication/whole-book-order-preview/REVIEW.html),
   including pages 1–9 with the approved-source contents illustration, H5/H6 how-to,
   H3 welcome and S1 author artwork. H4/S2 remain alternatives. Review the opening sequence, image allocation,
   four blank interior pages and blank inside covers. Then agree introduction,
   author, publication and back-cover copy in the shared `book-layout` JSON,
   using Write Like John for prose and the data skill for safe reads/saves.
   The latest author draft is included; introduction/publication lipsum remains
   in place. The approved contents/how-to source files remain byte-identical.
   The current three-page contents has 78 destinations; only imperial is assembled
   in the whole-book order preview. Make affected production proofs after these decisions;
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
- The Mushroom `intro_sentences` schema mismatch is resolved, as recorded above.
  Its old missing-sowing warning is also fixed: preserve the approved kit route.
- Crop bubbles and [shared editorial questions](../../../hackriculture-data/planning/EDITORIAL-OPEN-QUESTIONS.json)
  remain outside this publication task; their existence does not reopen them.

Preserve all working-tree edits and exact shared-data rollback receipts. Git
history does not imply uncommitted work is saved remotely. No incidental reset,
cleanup of approved assets, commit or push. Future shared writes follow the live
revision guard, never a revision copied from this handover.
