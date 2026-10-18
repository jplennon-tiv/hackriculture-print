# Nutrient cycles — proposed follow-on page

[Open the preview](REVIEW.html). One page at 185 × 240 mm, proposed folio 158,
following approved Crop rotation & planning 156–157. Copy is unit-neutral.
The practical overview leads into an N/P/K/micronutrient table, then three
illustrated examples: legumes, compost and winter seaweed. The broad-bean and
compost artwork is retained; the new seaweed trug remains proposed. Body text
is unchanged at 9.45 pt. The first proof is preserved in `revisions/first-proof/`.

The preview also offers the unchanged approved rotation spread for context.
New copy and composition await John’s review. The current full book is unchanged.

Editable copy and research live in the resource library’s
[nutrient-cycles folder](../../../../../hackriculture-resources/summaries/nutrient-cycles/).
[Sources and qualifications](RESEARCH.html), [composition/asset references](COMPOSITION.json),
[PDF checks](PDF-CHECKS.json) and [visual review](VISUAL-REVIEW.json) record the work.
The exact approved rotation and Organic growing sources informed the composition.

Build with `scripts/build-nutrient-cycles.mjs` while loopback Vite is running;
check and render with `scripts/check-nutrient-cycles.py` using the bundled Python.
The checker verifies the actual one-page PDF, text coverage, font embedding,
four relevant canonical-record hashes, both approved rotation PDF hashes and
the full-book hash. No application-wide test or catalogue export is needed.

If approved and integrated with the two-page rotation, the two additions together
shift later content by two pages: Sowing 159, Watering 160, Greenhouses 161–163,
Index 164–167 and the existing final blank 168. This preserves the previous later
page parity without adding a balancing blank; folios and navigation still need
refreshing at integration. No book assembly has been performed.
