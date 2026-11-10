# Radish one-off amendment

7 November 2026. [Review both editions](REVIEW.html). John approved both editions;
the [approval record](APPROVAL.json) binds the exact reviewed files.

The Extended season snowflake keeps the existing winter artwork and size.
Its white background is now blended into the page using the same multiply
blending used by the book's season symbols. This is a scoped rendering change,
not an edited image or an alteration to other guides. The actual PDF render was
checked to confirm the white rectangle no longer shows.

The second Harvesting & storage item now reads:

> Spring varieties often take about 6–7 weeks; the quickest take 3–4 weeks in good conditions. Pull surplus roots before they turn woody or hollow.

The original 40–50 days is expressed approximately as about 6–7 weeks to make
both timings comparable. The qualification for the quickest crops and advice
to pull surplus roots remain. The canonical `harvesting[1].text` supplies the
original timings; this is the unit-consistency correction John requested,
not a researched change to crop performance. The master data is unchanged.

The standing checks retain the existing nine Quick facts and their arrangement.
A trial giving Ready in the full left-column width made the columns less
balanced, so it was not retained. Soil & preparation loses only “Lime acid soil
if needed.” The table's Acid soil diagnostic remains, with “Test soil; lime
only where needed.” This is conditional diagnosis rather than routine liming.

Both editions retain two 185 × 240 mm pages, numbered 78–79, five varieties,
six pest rows, original artwork, 9 pt planting text and See also links. Footer
clearances remain 4.95 mm and 6.82 mm. No pest cuts were needed. Both actual
PDF spreads were inspected against the original review spread.

[Content and preservation checks](CHECKS.json) cover the exact two text edits,
all facts/varieties/pests, the snowflake styling, unchanged source records and
approved Pea files, reader links and offline viewing. Actual PDF checks also
verify the revised harvesting text, page count, trim and links. `npm test`
passed all 43 tests in seven files. The revision builder now permits setting
an initially absent attribute through its exact-match amendment route; the
Radish icon's inline style is the only use added here. Existing guides and
their defaults are unchanged.

- [Book-only amendment](../../../../../src/print/book/sowing-rollout/revisions/radish.json)
- [Original review evidence](../../checks/radish.json)
- [Revised layout evidence](checks/radish.json)
- [Actual PDF verification](checks/radish.verified)

Original full readers, canonical data, approved crops and the main book remain
unchanged. This amendment is frozen. Make future changes in a separate revision;
do not rerun its builders or replace the full review books.
