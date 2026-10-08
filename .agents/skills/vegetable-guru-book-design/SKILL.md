---
name: vegetable-guru-book-design
description: Coordinate The Vegetable Guru book design across covers, introduction, contents, vegetable and Troubles pages. Use for book-wide visual consistency or designing a new or revised book component, applying shared colour, typography, margins and section treatments with the existing layout and artwork skills.
---

# The Vegetable Guru — book design

Keep the whole book recognisable while respecting each section's purpose.
This skill coordinates design choices; it does not replace the specialist layout
checks, illustration workflow or existing approvals. Individual A4 sheets remain
under [guide-layout-review](../guide-layout-review/SKILL.md).

## Establish the design context

Resolve repository links from this file. Read [AGENTS](../../../AGENTS.md),
[README](../../../README.md), [shared-data rules](../../../SHARED-DATA.md) and
[current handover](../../../docs/handover/START-HERE.md), skipping unchanged
material already read. Then read the relevant parts of the single shared
[book design system](../../../docs/BOOK-DESIGN-SYSTEM.md).

Identify the component, its place in the book and the requested stage: idea,
rough preview, focused layout proof or production preparation. Inspect its exact
source through the [asset registry](../../../docs/assets/README.md), alongside
a neighbouring or related approved page. Do not infer editable type or exact
print colours from the generated cover concepts.

Use the system's role-based palette, typography and geometry. Approved references,
selected directions and working values have different status; a new skill does
not promote proposals to approval. Consult
[Compact Book v1](../../../docs/BOOK-PRINT-STYLE.md) for detailed guide composition.
Keep current selections in the handover rather than hard-coding them in this skill.

## Use only the specialist work needed

| Requested work | Apply |
| --- | --- |
| Reading or changing shared JSON, including book opening/cover copy | [hackriculture-data](../hackriculture-data/SKILL.md), before the data operation |
| New/revised page composition, fit, opening sequence, facing spreads, pagination or assembly | [book-layout-review](../book-layout-review/SKILL.md), plus the relevant section treatment in the design system |
| New/restyled decorative illustration or a style comparison | [vegetable-guru-artwork](../vegetable-guru-artwork/SKILL.md), which uses the available imagegen skill/tool |
| Reuse of existing artwork | Inspect the source, approval and placement inventory; do not generate a replacement merely to exercise an image tool |
| PDF creation/editing or visual PDF inspection | The available PDF skill, with the book layout/profile rules; use saved proofs for a rough assembly when appropriate |
| Standalone A4 sheets | The retained single-sheet skill and A4 contracts; do not apply the book system |

These are workflows to apply within the task, not instructions to spawn agents.
Do not load or execute unrelated specialists. Artwork work does not implicitly
rebuild guides, and a small layout edit does not require a catalogue export.

## Design and review coherently

Carry the existing visual language into the requested component: headline/body
contrast, readable type, family colours, illustration character and deliberate
spacing. Retain useful source content, diagnostic clarity and approved explanations.
Use section-specific grids and type roles; do not make a cover, publication page
and dense reference guide share one rigid template.

Choose the correct geometry before laying out: ordinary compact proof, Bookvault
working interior or cover wrap. Check physical folios before mirrored margins
and facing-page decisions. Keep cover leaves separate from interior pagination.
Inspect cover and opening designs together as well as the requested detail.

For a new visual rule, make a bounded proposal using the closest existing role
and show it beside its source/context. Preserve frozen originals. Mark deliberate
changes and open decisions rather than silently inventing a new default. Keep
requested lipsum/metadata placeholders until real copy is supplied or authorised.

Match verification to the request. Rough previews reuse existing art/proofs and
need clear scope plus representative inspection. Changed print layouts need the
actual affected PDFs, font/image checks and source comparison from the layout
skill. Respect an explicitly requested single edition; do not spend time on
unrequested polishing or production work. Documentation-only changes need skill,
link and consistency checks, not regenerated artwork or book PDFs.

## Keep one maintained system

Shared visual rules belong in `docs/BOOK-DESIGN-SYSTEM.md`; detailed guide behaviour
belongs in `docs/BOOK-PRINT-STYLE.md`. Existing palette/CSS files remain the
implementation, approval manifests the evidence, and the handover the task state.
Avoid copying evolving token tables into each skill or creating a second palette.

When a design decision changes, update its owning rule and relevant working
implementation within the authorised scope, retain approved source references,
and record exact review/approval status. Report what changed, how it was checked
and what still needs John's decision. Do not self-approve new work or imply that
a coherent screen preview establishes print readiness.
