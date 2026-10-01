# Troubles guides — approved open editorial design

## Decision and authority

**Open Editorial v1 is approved and locked as the forward Troubles design.**
John, 28 September 2026: “These are fine - no other input needed. Fix this as the
design and document it well.” No further design-option review is needed.

The [four approved reference pages](troubles-style-pilot/editorial/REVIEW.html)
and [SHA256 approval manifest](troubles-style-pilot/editorial/DESIGN-APPROVAL.json)
identify the exact composition, wording, typography and artwork. Preserve these
files; create separate paths for any intentional variants. The earlier boxed
Troubles pilot and the installed four-card layout are superseded as the forward
design. The live route now uses `EditorialTroublePage.tsx`.

## Visual system

- Use Lilita One for titles and condition headings, Nunito Sans for advice,
  crop labels and navigation. The reference `style.css` owns exact proportions.
- Use the vegetable collection's selected Family Tint tokens: group-coloured
  ribbons, coordinated ink/dark accents, subtle page backgrounds and fine rules.
  The approved examples use Root Crops and Onion Family. Resolve other groups
  from their applicable crop families; mixed-family groups need an explicit,
  documented choice, not an arbitrary first-crop match.
- Opening pages use a prominent typographic crop title, compact tilted Troubles
  ribbon, soft irregular backdrop, full approved introduction and the
  Recognise → Act → Prevent cue. The opening header responds to intro length.
- Continuations have compact titles and the same navigation/ribbon. Production
  footers identify the guide and actual page count; the frozen sample's
  “DESIGN STUDY” footer records its proof status, not final publication copy.
- Keep the diagnostic drawings detailed, complete and correctly assigned.
  They carry information, not decoration. Use contain sizing with preserved
  aspect ratios; do not crop symptoms, stretch, simplify or regenerate them
  merely to match a decorative cover illustration. The reference uses multiply
  blending on the tinted page; inspect image backgrounds during migration.
- Diagnostic slots are 160 × 180 px on the opening reference pages and
  160 × 190 px on continuations. These are 794 × 1123 px browser-page dimensions,
  not a mandate to resize source artwork. Opening widths grew from 104 px and
  continuation widths from 128 px. Maintain this visual prominence in production.

## Open layout and information hierarchy

- Two readable editorial columns. Text flows around illustrations. Fine rules
  separate conditions; no enclosing card fills, rounded card containers, fixed
  card heights or large internal padding. Entry height follows its content.
- Crop-applicability labels precede chunky condition names. Retain stars and
  visual symptom captions when present. Preserve the complete available
  Recognise, Act and Prevent wording. Act gets a small highlighted label, not
  another panel enclosing the whole paragraph. Do not invent an absent section.
- Reference body text is 12 px with 1.4 line height; normal condition headings
  are 27 px. Do not achieve density by shrinking type or cutting approved prose.
- **Six conditions per page is the demonstrated density, not a universal quota.**
  Let longer advice, large diagrams and final pages use fewer entries. Fit and
  diagnostic clarity take precedence over a numerical count or even page total.
  Reuse source ordering, regrouping at page/column boundaries as needed; ensure
  every condition appears exactly once in a complete exported guide.
- Natural staggered column endings are part of the approved layout. Do not pad
  short entries into equal boxes or force identical column bottoms. Useful white
  space outside entries is preferable to filler, enlarged gaps inside advice,
  or distorted artwork. Keep each condition together where practicable.

## Data and editorial contract

Read canonical records through `readCollection`; use the existing `troubleCopy`
resolver to reuse approved, source-current adaptations and expose stale-copy
warnings. Retain applicable crops, useful distinctions, diagnosis uncertainty,
safety details, prevention timing and practical organic controls. Do not discard
full master advice or alter facts to make a design fit. Editorial research remains
RHS-first. Shared record changes, if actually needed, require the revision-guarded
writer, exact prior-byte backups and honest attribution; preserve locks and manual
edits. Approval here changes design status, not source facts or saved data locks.

## Approved evidence and implementation boundary

The references show the first twelve conditions of Carrot and Parsnip Troubles
and the first twelve of Onion & Leek Troubles, two pages each. All 24 entries and
both introductions preserve the current resolved print wording without cuts.
Fonts/images loaded; six entries fit each sample; no text extends into the footer
or outside the page. All four rendered browser pages were visually inspected.
The [check report](troubles-style-pilot/editorial/CHECKS.json) records actual bounds.

The live renderer is now installed with local fonts and revision
`open-editorial-v1-family-tint`. `editorialTroubleLayout.ts` packs whole entries
into measured columns without fixed card budgets. `familyTheme.ts` explicitly
maps all 14 groups; old source-current approved plans supply reading order only.
Stale introductions fall back to full source wording with a warning. Visual
captions use the selected measurement unit; canonical source text is untouched.

All 220 conditions appear exactly once across all 14 guides in DOM checks.
Complete Carrot/Parsnip and Onion/Leek A4 PDFs each have three pages; opening,
continuation and final-page proofs were inspected. Other guides take 1–6 pages
according to content. This is not a universal six-entry or page-count target.

**Physical geometry review point:** native A4, 8.5 mm horizontal text insets,
page-wide Family Tint, matching the vegetable rollout. This departure from the
old PDF margins is accepted for now by John (29 September). Larger illustrations retain aspect
ratio and body type remains at the reference size. John reports satisfactory test printing with details to follow; A5/A6 remain
unreviewed. [Rollout evidence](redesign-rollout/PLAN.md).

The approved references load Google Fonts online. Diagnostic artwork and palette
files are dependencies captured by the approval manifest. Source data remains
canonical; CONTENT.json is the frozen reference snapshot, not a second master.
