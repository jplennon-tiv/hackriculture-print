# Troubles — approved Open Editorial v1

**Approved and locked by John, 28 September 2026.**
“These are fine - no other input needed. Fix this as the design and document it well.”

[Approved references](REVIEW.html) · [Style contract](../../TROUBLES-PRINT-STYLE.md) ·
[Approval manifest](DESIGN-APPROVAL.json). Use this as the forward Troubles design.

John requested larger diagnostic illustrations, less padding and a move away
from widgets towards the open vegetable-page design. The approved design removes
card backgrounds, rounded containers, fixed heights and internal padding. Advice
flows around full, uncropped illustrations, with a fine rule between conditions.
Chunky headings, Family Tint paper and group-coloured ribbons remain. Act uses
a small label highlight rather than another box around the whole paragraph.

Illustration slots are 160 × 180 px on opening pages (previously 104 × 112),
and 160 × 190 px on continuation pages (previously 128 × 155). Artwork aspect
ratios are preserved. Body text is 12 px, compared with 11.5 on the earlier
opening page and 12 on continuation pages. Content drives entry height.

The sample has six entries on each page: the first twelve conditions from
Carrot and Parsnip Troubles and the first twelve from Onion & Leek Troubles.
Existing saved column reading sequence is preserved, but entries are regrouped
into six-entry pages. Six is the demonstrated density, not a universal quota. Longer
advice, large diagrams and final pages may need different counts. Opening headers
reflect the actual introduction length. Column bottoms are naturally staggered;
short advice is not padded to make identical boxes.

Canonical records are read through readCollection. The current troubleCopy and
troublePlanStatus helpers determine approved source-current wording and sequence.
All intros, names, crop applicability, stars, visual captions and available
Recognise / Act / Prevent wording are retained. No rewritten/truncated paragraphs,
no source writes, no lock changes and no live template/palette migration.
CONTENT.json is the frozen approved reference snapshot, not canonical gardening data.

## Protecting the reference

Do not overwrite or prune the approved HTML, CSS, PNGs, snapshot or assets.
`build.mjs` and `check.mjs` retain the authoring workflow for reproducibility, but
are guarded against writing over this approved directory. For future intentional
variants, copy the authoring files into a new sibling directory and resolve their
relative input paths there. Keep this baseline and its manifest unchanged.

[Checks](CHECKS.json): all 24 entries' source strings and both introductions
verified; source resolvers report no warnings. Fonts/images loaded; six entries
per page; no entry overflow or text beyond page/footer bounds. All four browser
renders visually inspected. Local review links resolve. This is a small browser
layout study, not a PDF export or full-guide pagination test. Online Google Fonts
remain a dependency. Actual A4 margins, embedded fonts, longer entries and the
remaining conditions need validation before rollout.

The inherited Onion Fly visual caption still uses “1/4 in.”; unit-aware captions
remain a migration consideration, not a factual edit in this design experiment.
