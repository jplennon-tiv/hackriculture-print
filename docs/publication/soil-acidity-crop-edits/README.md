# Vegetable guides — pH and liming wording review

**Historical comparison, superseded 5 November.** John now requests removal of
pH/liming instructions unless there is a definite crop-specific need. Apply that
rule during the individual vegetable review. The older proposals below were
never approved or integrated and must not be installed as a batch. The current
[crop editing guidance](../sowing-planting-mockups/CROP-EDITING-NOTES.md) owns the rule.

2 November 2026. **Sixteen proposed changes across twelve guides**, following
John’s request to update the vegetable pages and show a diff alongside the new
[soil acidity page](../topic-pages/soil-acidity/README.md).

[Full before-and-after comparison](DIFF.html) · [Plain-text comparison](DIFF.md).
The comparison links to clean and highlighted compact proofs in both editions.
Current book folios are retained. No integration or renumbering has taken place.

The historical comparison changed: Asparagus; Broad, French and Runner Beans; Beetroot; Broccoli;
Brussels Sprouts; Cabbage; Carrot; Lettuce; Potato; Radish. The other 32 retain
their present wording. Existing crop pH numbers and reasonable soil preferences
remain. Advice already requiring a test, avoiding unnecessary lime, or diagnosing
a deficiency is retained. The cauliflower’s “lime-green” cultivar description is
a colour, not a liming instruction. Existing brassica clubroot tables already say
to test before liming and that there is no cure; they need no replacement.

## Sources and scope

- [Working copy](../../../src/print/book/soil-acidity/crop-edits.json) owns exact
  before/after fragments, selectors and reasons. It applies only in the isolated
  proof builder, not ordinary exports or the main-book assembly.
- [Current-book audit](current-book-audit.json) covers pH/acidity/lime mentions
  on all 88 vegetable pages; [canonical audit](canonical-audit.json) records the
  relevant shared source strings read through the supported reader. Search hits
  include some metadata and culinary acidity that were reviewed as out of scope.
- [Checks](CHECKS.json) bind the affected source records, approved HTML/PDF inputs
  and copy to hashes. They also record full baseline/proposed paragraphs, folios,
  placement and footer clearances.
- Asparagus, Cabbage, Carrot and Lettuce reuse the exact approved reader-edit HTML.
  The other eight use the established compact production composition and source-
  linked working copy. All retain existing artwork, body type, crop content and
  two-page structure, plus the approved larger category labels and current footer
  destinations. The only prose edits are those in the comparison.
- The potato wording is “avoid fresh lime”; the Techniques page gives the fuller
  explanation about liming before potatoes and common scab. The longer first trial
  added a line beyond the available space; the concise wording restores the source
  fit without reducing type or removing another instruction.

Canonical gardening records, approved copy files, main-book PDF, contents/index,
Troubles guides, website and supplier files remain unchanged. No shared-data
transaction or approval has been created. No numeric cross-reference to the new
page is inserted before its location is accepted.

## Reproduce and verify

With `start.command` running on loopback:

```sh
node scripts/build-soil-acidity-crop-edits.mjs
python3 scripts/review-soil-acidity-crop-edits.py
```

Use the bundled PDF Python (pypdf, pdfplumber and Pillow) and `pdftoppm`.
The builder accepts `--only=key,key` for a focused iteration; the unqualified run
owns the final complete `CHECKS.json`. It never writes to frozen sources.

[Verification](VERIFICATION.json) covers 24 two-page PDFs: twelve crops in both
units. It checks all sixteen replacements against the current imperial main-book
text, proves that no other DOM prose changes, confirms complete replacement text
in each actual PDF, checks clean/highlighted text identity, embedded fonts, exact
trim, decoded images and source preservation. Dense retained pages with 2.7 mm
footer clearance remain at their baseline clearance; no new footer regression is
accepted. Both-unit page contact sheets and individual rendered page images are
saved for visual inspection. [Visual review](VISUAL-REVIEW.json) records its exact
coverage and limits. These checks are not author approval.
