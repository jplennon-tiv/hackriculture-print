# Vegetable content refinement — approved and installed

John requested an AI-assisted content/space review of all vegetable guides after
his print run (30 September 2026). John approved the batch on 30 September: “Batch output looks good - approved.”
[All 44 approved proofs](REVIEW.html).

All 44 crops were audited in both units. The existing shorter print selections
were carried over from the previous renderer. This pass restores source-supported
care/harvest details in 42 crops and one more useful introductory sentence in 13.
Examples include pepper ripening/drying, asparagus picking frequency, onion curing,
winter squash storage, and cordon versus bush tomato care. The original selected
advice is preserved in substance; fuller paragraphs are edited to avoid repetition.
No new gardening claims, chemical controls, cultivars or crop identities were added.
Canonical master advice is preserved. The approved print companions are now installed.

Content comes first. Approved layouts then compare the two existing column
arrangements, distribute small gaps (at most 12 px between sections, 8 px between
eligible column items, 4 px per trouble row), and use the actual number of reminder
and Final Tips items instead of reserving an empty third slot. Fonts, image sizes,
cell padding and source-selected trouble rows are unchanged. The filler refuses
large shortages and leaves about 6 mm before the footer where space permits.
Only layouts carrying `richer-a-v2-editorial-fill` enable these refinements;
all 44 installed layouts now carry this revision.

## Results and limits

- 88 metric/imperial DOM checks pass; no page overflow.
- Average page-two bottom clearance: 13.2 → 6.1 mm. 43 of 44 are under 10 mm.
- Leaf beet retains 13.1 mm on page two: its useful advice is already represented,
  and its short trouble table is not padded with extra problems.
- First-page exceptions: Jerusalem artichoke 13.7 mm, greenhouse tomato 10.8 mm,
  mushroom 47.3 mm. Mushroom retains the identified kit route, without invented
  varieties, unsuitable outdoor instructions or generic sowing advice.
- Eleven pages retain column-bottom differences over 25 mm. See REPORT.json.
  These are reported, not presented as perfect alignment; useful prose, planting
  diagrams and the two-page composition take precedence over stretching gaps.
- Three actual PDFs (Capsicum metric; greenhouse tomato metric/imperial) remain
  two A4 pages, with loaded fonts/images. All six rendered pages inspected.
- Ten focused tests and the app TypeScript check pass. No catalogue PDF pack.
- Contents, front matter, all guide numbering and locked design references remain
  unchanged. The guarded save updated 44 print companions, with exact preceding
  bytes verified. [Installation checks](INSTALLATION-CHECKS.json): ten focused tests
  pass; live greenhouse tomato PDFs remain two pages in both units (4.18 seconds).

## Ownership and approval

Source-linked draft companions are in
`../hackriculture-data/planning/vegetable-content-refinement/PROPOSAL.json`
(relative to the project root). Each addition identifies its master source paths;
normal exports now use these approved values. Preserve the proposal as the
immutable reviewed snapshot; its hash is recorded in the approval manifest.

`choices.mjs` holds the reviewed editorial choices; `prepare.mjs` verifies locks
and previous checksums and prepares draft companions. `check.mjs` previews them
through a browser response override, measures both units and freezes standalone
HTML proofs. It never writes generated projections or canonical JSON.
`prove.mjs` validates representative physical PDFs, fonts and images and prepares
before/after captures. `review.mjs` builds the review index and verification report.
These tools use start.command on loopback for the live source routes.

The approved installation used `install-approved.mjs --john-approved` and the
revision-guarded writer. [SAVE-RECEIPT.json](SAVE-RECEIPT.json) identifies the complete
transaction and exact prior-byte rollback. Do not rerun preparation or installation:
the proposal is consumed, and before/after builders describe the pre-install state.
The live smoke passed after installation. Future exports use the refinement;
existing output PDFs were not replaced and no full batch was regenerated.
