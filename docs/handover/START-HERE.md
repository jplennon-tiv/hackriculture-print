# Current project handover

Updated 19 October 2026 after the first proof order and handover to website work.
This document owns current scope, decisions and next actions. Read README,
AGENTS and SHARED-DATA first. John's latest instruction takes precedence;
dated reports and approvals are evidence, not instructions to resume old work.

## Resume here

**John is taking a break from print design. His next session will work in the
website project to make hackriculture.com a sales channel for The Vegetable Guru.**
Start with the website handover below. The first physical proof is ordered;
preserve its exact PDFs while awaiting review. No print regeneration is needed
to start the website work.

Git storage update, 22 October: the large `integration-2026-10-18/baseline.pdf`
under `docs/publication/whole-book-order-preview/` and
`docs/publication/techniques-sequence/references/approved-2026-10-18/growing-techniques.pdf`
are retained locally but excluded from Git, including the unpublished commits
that caused GitHub's size rejection. They remain required reference inputs;
preserve them with the other local book files. A fresh clone alone does not
contain these PDFs. Their existing approval/hash records remain tracked.

### Next session — website sales channel

The website source is **`/Users/johnlennon/Documents/web_site/hackriculture`**,
saved in Codex as **Hackriculture Web Site**. John will start the new session
himself. This is the existing local website project; its current deployed contents
have not been compared with this checkout during this session.

| Resource | Where to start |
| --- | --- |
| Website instructions and overview | [AGENTS.md](../../../hackriculture/AGENTS.md), [README.md](../../../hackriculture/README.md), [shared-data rules](../../../hackriculture/SHARED-DATA.md), [guide editing](../../../hackriculture/docs/GUIDE-EDITING.md) |
| Website pages and shared styling | [Homepage](../../../hackriculture/app/page.tsx), [header/footer](../../../hackriculture/components/site/chrome.tsx), [styles](../../../hackriculture/app/globals.css) |
| Editable website content | `../../../hackriculture-data/website/`; use the [shared-data skill](../../../hackriculture-data/.agents/skills/hackriculture-data/SKILL.md) before JSON work |
| Book description, cover and samples | [Production review](../publication/bookvault-print-ready/REVIEW.html), [cover preparation/source record](../publication/bookvault-print-ready/COVER-PREPARATION.json), [asset registry](../assets/README.md), [shared book copy](../../../hackriculture-data/book-layout/README.md) |
| Selling route and Bookvault account evidence | [19 October setup and selling notes](../publication/bookvault-setup-2026-10-19/README.md#simplest-selling-route), [supplier/order record](../publication/bookvault-print-ready/SUPPLIER-CHECKS.json) |
| Website build for upload | `hackriculture/dist/client/`; source edits belong outside this generated folder |

The intended first integration remains a book presentation on John's website
linking to a Bookvault-hosted purchase page or Buy Now link. Shopify and native
YouTube Shopping remain deferred. A book page, homepage promotion and selected
sample pages are sensible starting proposals; no web layout, copy or samples
have yet been selected. Review the existing site and agree the presentation with
John while preserving its growing guides, videos, identity and existing edits.

No public book listing or working purchase URL exists yet. Reuse Bookvault title
**3822688** / internal SKU **9669932000017**; do not create a duplicate title.
The saved notes distinguish Bookvault Shop from The Great British Bookshop:
verify the actual chosen storefront, current selling costs and buyer journey
before wiring a live link. **£17.50 is a working price**, and the ISBN is deferred
until after the first proof. Final metadata, publication approval and public
availability remain to be settled; do not present the book as already on sale.

Website work can be developed and reviewed locally while the proof is pending.
Its documented preview command is `npm run dev -- --host 127.0.0.1 --port 5175 --strictPort`,
leaving port 5173 for print if in use. Inspect process ownership first; neither
server is guaranteed to be running. John handles deployment unless he instructs
otherwise. This handover requests documentation only: no website implementation,
deployment, distribution activation or new session has been performed here.

### Print checkpoint — first proof ordered

**Both Bookvault production files are uploaded and have passed supplier checks.** Open the
[production viewer](../publication/bookvault-print-ready/REVIEW.html) for the exact
168-page imperial interior and 12 mm-spine cover wrap. [Production notes and checks](../publication/bookvault-print-ready/README.md)
record restoration of original artwork, bleed, CMYK conversion, native-text
preservation and the cover adaptation. The G2/B5 production cover is a proposal:
native lettering and original vegetable/page crops differ from the concepts.
John Lennon now appears on the front and spine; all five intentional interior
blanks use matching printed cream, following John's latest request.
John has confirmed cream for the first physical proof and deferred the ISBN until
after it. Both PDFs are saved and marked **Approved** in Bookvault’s processing log;
the cover and sampled interior spreads were checked in its visual proof. John then
confirmed Bookvault’s artwork responsibility declaration, and “Approve proof” was
submitted successfully. [Supplier checks and exact review coverage](../publication/bookvault-print-ready/SUPPLIER-CHECKS.json).
**The first physical proof has been ordered by John.** He confirmed payment on
19 October; the portal independently shows [order BV3012332](https://portal.bookvault.app/order?ID=3012332),
reference 69932-#00001, created at 15:09, status **Created**. One copy totals
**£12.58**: £6.31 standard UK production + £6.27 Royal Mail 1st Class, to the
confirmed Truro address, postcode TR1 1BQ. [Order confirmation](../publication/bookvault-print-ready/supplier-proof-order-confirmed.png).
Checkout estimated dispatch 28 October and delivery 29–30 October; the order page
does not repeat those estimates. Await the copy, then assess cream consistency,
colour/detail, paper weight and opening comfort before final publication decisions.
The agent did not place the order or pay. No additional order is authorised.
Metadata/barcode placeholders remain; automatic barcode insertion was off at upload.
The reading preview below is preserved for continued copy/design work.

The approved integration is complete; John's final copy changes update Organic growing, page 146, and Beds and paths, page 152. The current
[full preview](../publication/whole-book-order-preview/REVIEW.html?revision=techniques-subsections-2026-10-19#spread=74)
has **168 interior pages plus four cover leaves: 172 PDF pages**, imperial,
185 × 240 mm. [PDF](../../output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf),
[page map](../publication/whole-book-order-preview/PAGE-MAP.json),
[checks](../publication/whole-book-order-preview/CHECKS.json) and
[visual review](../publication/whole-book-order-preview/VISUAL-REVIEW.json).
The introduction loses its last sentence and the three named advice paragraphs
use John's replacement text, with spelling/punctuation corrections only. His
follow-up shortens the middle paragraph to end “your garden will ultimately flourish.” The
diagram, closing box and existing type sizes remain. John approved this revised
page on 18 October; [the approval](../publication/final-text-edits/ORGANIC-APPROVAL-2026-10-18.json)
freezes its copy and both-unit proofs. [Copy, sources and checks](../publication/final-text-edits/README.md).
The latest exact replacement shortens “Sides are optional” on page 152 to end
“Choose what makes the plot easier to use for you.” [Both-unit checks](../publication/final-text-edits/BEDS-PDF-CHECKS.json)
confirm that all other page text and the existing type are preserved.
John discarded the Top tip ribbon/splash idea on 18 October. The original green
panels now at 151, 152, 154, 159 and 163 remain in the full preview; the proposals
were never integrated. [Decision and verification](../publication/top-tip-panels/DECISION.json).
The latest layout request moves all five double-digging steps onto page 157,
with single digging first on 158, followed by path care and smothering.
[The changed spread](../publication/digging-order/README.md) retains the original
copy and type; only the obsolete next-page instruction is removed.
The four headings at 155–158 now share green “Cultivation”, followed in orange
by “Dig or No-Dig?”, “No-Dig”, “Digging” and “Digging continued”.
[Earlier four-page source proofs and checks](../publication/cultivation-headings/README.md)
retain the reordered digging instructions and original reading sizes.
Page 157 now opens “There are two ways of digging:” with “Single digging” and
“Double digging” in bold. Its heading reads “Double digging: start a new plot,
or revive a tired one”; all five steps still fit at the existing type sizes.
Resume the final text/design pass only when John returns to it; do not restart the completed
overnight reader exercise or repeat its persona/subagent simulations.

John’s 19 October request removes the two internal Growing Techniques blanks
from the earlier approved order and groups the running titles into Organic growing,
Planning a new plot, Compost, Cultivation, Plant care and Greenhouses.
[Current headings, sources and both-unit checks](../publication/techniques-subsections/README.md)
preserve earlier copy and artwork while mirroring the new page positions.
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
| 150 | Planning your plot: Choosing the right spot |
| 151–152 | Planning your plot: Beds and paths / continued |
| 153–154 | Compost |
| 155–156 | Cultivation: Dig or No-Dig? / No-Dig |
| 157–158 | Cultivation: Digging / Digging continued |
| 159–160 | Plant care: Sowing and planting / Watering |
| 161 | Greenhouses introduction |
| 162–163 | Greenhouse growing options and seasons |
| 164–167 | Index |
| 168 | End balancing blank |

PDF page = printed folio + 2. All three section openers are right-hand pages;
all crops open on the left. Growing Techniques is continuous; some two-page
technique topics now cross a page turn. Their margins follow the new physical
folios. Interior blanks are 3, 6, 8, 98 and 168. The welcome/author page stays omitted.


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
  preserves the earlier accepted source. The current 19 October derivative removes
  its two internal blanks and applies the new subsection headings.
- Earlier approved headers, shortened carrot/onion/tomato guides, combined
  peach-panel opener, navigation labels, flowing green/orange technique headings,
  publication copy and B5 blurb remain integrated. Exact provenance is in the
  [asset registry](../assets/README.md) and [full-preview notes](../publication/whole-book-order-preview/README.md).

Contents remain two pages with simple headings/list rows and existing H1/H2/H5/H6
artwork: **81 destinations**, 10.5 pt rows. No numbers, family subheadings or panels.
The index stays four pages, 9.45 pt, **286 entries / 35 see references**. All
previous terms remain; eight nutrient-page terms and the rotation succession
reference are added. Crop-specific links require literal relevant crop mentions;
73 links are present, with repeated section labels omitted within a footer.
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

For current Techniques heading/placement edits, first rebuild the
[subsection derivative](../publication/techniques-subsections/README.md). It consumes
the saved original and author-edited source proofs. Earlier builders use their
dated folios; they are inputs to this current derivative, not the current book.

Canonical gardening JSON is unchanged. All 58 record hashes and reused native
page bodies are checked. Shared contents/index changes have an exact-byte
[backup receipt](../publication/whole-book-order-preview/integration-2026-10-18/BOOK-COPY-UPDATE.json).
The single-digging index destination now follows its moved instructions at 158;
[the guarded save](../publication/techniques-subsections/INDEX-REFERENCE-SAVE.json) preserves exact previous bytes.
Original source copy, A4 originals and approved references remain intact. Frozen
source folios may differ from current book folios; never treat them as instructions.

## Remaining production decisions

The current brief remains a UK-focused, non-waterproof, full-colour POD paperback,
**The Vegetable Guru: Your at-a-glance growing companion**, 185 × 240 mm.
Bookvault title **3822688**, internal SKU **9669932000017**, was created on
19 October at John's request; reuse it rather than creating another title.
Both files passed supplier validation and the visual proof was approved after
John confirmed the artwork responsibility declaration. John selected **150 gsm coated**
for the initial proof. Saved settings are 168 full-colour pages, 185 × 240 mm,
perfect bound, standard inkjet, with provisional matt lamination. The `Sample`
promotion reduced setup to £0; the observed UK production quote is **£6.31**,
delivery additional. John ordered the first copy as **BV3012332**, described above;
no public listing or distribution has been enabled.
[Setup evidence, fresh templates and print issues](../publication/bookvault-setup-2026-10-19/README.md).

John has no ISBN yet. The title uses Bookvault's autogenerated internal stock
number, not a registered ISBN. Bookvault Shop / The Great British Bookshop and
their Buy Now links are the simplest intended launch route; distribution must
be enabled later for the shop listing. £17.50 remains a working cover price,
not a saved retail price. Shopify / native YouTube Shopping is deferred; KDP
is a comparison/fallback.

G2 Cream centre is selected for the front; B5 Off-centre collage is preferred for
the back. Preserve the cream/grid front without a count footer and the dark-green
back with 44 growing / 14 Troubles wording. Approved blurb is native text above a
separate B5 derivative; original raster art is intact. A separate native production adaptation now supplies editable lettering, exact
current-page snippets and the 12 mm wrap. This adaptation is being tested in the
first physical proof; final publication design approval remains open. Cover C is
a style/A4 reference only. Rejected cover studies are not alternatives to resume.

Missing copyright year, imprint, ISBN, edition and publication year remain
placeholders by request. The imperial print-resolution interior, proposed cover wrap and local colour/font/geometry
preflight and Bookvault file validation are complete. Physical proof review, full
metric assembly if requested, final metadata and publication cover approval remain
outstanding.
The fresh 168-page/150 gsm template specifies a **12 mm spine**, **388 × 246 mm
cover wrap**, and **191 × 246 mm interior** including 3 mm all-round bleed;
interior safety is 17 mm at the binding and 5 mm elsewhere. Regenerate templates
if stock, binding or pagination changes. The old 148-page templates and their
8 mm / 8.436 mm discrepancy are historical, not production inputs. The current
screen preview includes four cover leaves, lacks bleed and contains lower-resolution
image placements; it must not be uploaded as the print interior. Component
approvals do not imply supplier approval or authorise publishing, ordering or payment.

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
stop a user-owned server. Local PDF checks and supplier-browser inspection have
separate recorded coverage. Earlier browser restrictions belong to their dated
checks, not the successful 19 October Bookvault upload and proof review.

A4 keeps its separate Richer A / Open Editorial approvals. A5/A6 are selectable,
unreviewed. Completed UK variety refresh, onion-set work, Mushroom schema fix,
skill installation and content refinements are not work queues. Preserve manual
edits, unknown fields, approved sources and the latest shared-data rollback.
Never reset, clean, commit or push unrelated work.

Both the waterproof quote monitor and compact preparation automation remain
**paused**. No restart or new schedule is requested. The authorised upload, supplier
checks and proof-order preparation are complete. John separately confirmed the
artwork responsibility declaration, then placed and paid for the order himself.
The next session is website sales-channel preparation, as described above. ISBN
purchase is deferred until after the first proof. Further purchases, supplier
messages, rights declarations, contract acceptance, distribution activation and
deployment need applicable authorisation; completed actions are not standing
approval for new ones. Preserve existing KDP titles; the old Practical Gardener
draft is unrelated.
