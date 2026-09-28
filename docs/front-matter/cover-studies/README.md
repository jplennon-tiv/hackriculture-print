# Cover studies

Save the complete composition using **Save complete cover (PNG)** in the preview
or review page. This downloads `c-with-previews.png`, including both badges,
sheet thumbnails and the light background. Right-clicking the underlying artwork
in the editable layout saves only `assets/contemporary-c.png`. A verified copy of
the complete PNG was saved to `../design ideas/vegetable-growing-cover-complete.png`
(relative to the project root) on 28 September 2026.

25 September 2026: John prefers C, especially the illustration style, bright
colours and large type. The current [review](REVIEW.html) compares original C
with a [thumbnail/layout trial](preview-c.html): two real guide previews at lower
right. John likes the previews and rejected the charcoal footer; it and its
orange rule/extra wording have been removed. The original light background and
tagline remain. Artwork is reused without regeneration. Preview placement and
label are editable HTML; C's original main title remains raster artwork.
John approved the light, tilted “44 vegetable guides” badge at the top left.
A matching “14 trouble guides” badge is now alongside it for review. Both counts
match the canonical records index (14 crop-group guides, not a PDF page count).
Badge numbers and labels are editable HTML.

The previews reference existing `output/pdf/page-fit/final/rendered/` courgette
and broad bean metric page-one proofs. `c-with-previews.png` is a browser render
of that layout. All three images loaded and the composition was visually checked.
No new PDF, data mutation or app test was needed. This trial remains unapproved;
installed front matter is unchanged.

C and D are generated composition studies with raster lettering, not production
templates. The selected direction needs reconstruction with editable type.
Built-in imagegen prompts are in [CONTEMPORARY-PROMPTS.json](CONTEMPORARY-PROMPTS.json).
Artwork lives in `assets/contemporary-c.png` (1054 x 1492) and
`assets/contemporary-d.png` (1055 x 1491), displayed over pale backgrounds.
Both images and the browser review were visually inspected; image loading and
desktop horizontal fit passed. No new PDFs or app tests for this concept round.

The earlier A/B comparison PDFs remain linked for this active design decision.

Original artwork was generated with built-in imagegen using the final prompts
in [PROMPTS.json](PROMPTS.json). A has an alpha background; B includes its cream
background. Lettering is separate and editable in [covers.html](covers.html).
The artwork is concept resolution; assess higher-resolution production export
after choosing a direction.

Exported through local Vite and Playwright to
`output/pdf/cover-studies/{abundant-harvest,bold-seed-packet}-A4.pdf`.
Use the template query `?cover=a` or `?cover=b`; A4, zero margins, print background
and preferCSSPageSize enabled. Fonts/images loaded successfully. Each PDF has
one A4 page and no brand wording. Both PDF page renders were visually inspected.
No app tests or catalogue render were needed for these standalone concepts.
