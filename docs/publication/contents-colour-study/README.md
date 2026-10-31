# Contents colour experiments

30 October 2026. John selected **A**, after approving larger guide category names
and rejecting the how-to colour key. [Approval](APPROVAL.json) freezes the exact
selected sources and PDF pages 1–2. A awaits integration; B and C remain unselected.
The [revised key-panel proof](key-preview/README.md) colours the Troubles entries
and returns the key to its earlier position beside the harvest basket on page 5,
with a much paler background as John requested. Page 4 returns to approved A,
and H5 seedlings remains omitted. John has now
[approved this complete composition](key-preview/APPROVAL.json); integration is
pending. The original A sources remain intact.

[Compare A, B and C](REVIEW.html) · [Six-page PDF](../../../output/pdf/contents-colour-study/contents-colour-options.pdf)

| Option | Treatment | PDF pages |
| --- | --- | --- |
| A | Crop names and folios in the category's existing deep colour; names at weight 600 | 1–2 |
| B | Original green crop names with full category names in smaller coloured brackets | 3–4 |
| C | Existing pale family colour behind each row, plus a narrow deep-colour left stripe | 5–6 |

All use the current alphabetical two-column vegetable list, with 10.5 pt crop
names, identical titles and folios, retained illustrations and all 83 contents
destinations. B uses 8.25 pt category labels. No row wraps in any variant.
The right-hand Troubles/Techniques contents page is unchanged. No legend or new
text is added to the how-to page. C uses the existing `soft` family colour and
`deep` stripe, rather than a new palette.

Source structure and artwork come from the [current contents](../contents-update/README.md).
The existing guarded reader supplies category membership from shared contents
metadata; [familyThemes.json](../../../src/print/familyThemes.json) supplies colour
tokens. Shared JSON, current contents source/style, main PDF and approved guide
label proofs remain unchanged. The [guide-name approval](../category-navigation-preview/APPROVAL.json)
is independent of this contents selection and already authorises its next integration.

[CHECKS.json](CHECKS.json) records all input hashes, both-unit DOM fit, unchanged
rows/order/references/artwork, exact text checks for all twelve component PDF
pages and the final six-page imperial comparison. [Visual review](VISUAL-REVIEW.json)
records inspected final page renders. The new PDF retains 185 × 240 mm trim.
These are focused comparisons, not production files or changes to the main book.

The original comparison was built with Vite started through `start.command`, using
`node scripts/build-contents-colour-study.mjs`, followed by
`scripts/review-contents-colour-study.py` with bundled PDF Python. The styles are
isolated in `study.css`; no normal book renderer or approved style was changed.
Preserve those now-approved A files; new trials use separate paths.
