# Entry pages — Harvest corner A

John selected A on 29 September. [Current numbered contents and how-to](REVIEW.html)
use its grouped artwork. **Contents signed off by John on 29 September**;
approval hashes are in `docs/redesign-rollout/APPROVAL.json`. **The illustrated how-to is approved by John on 30 September**; its exact
HTML/PDF hashes are recorded in the same approval manifest. The current one-page how-to retains the selected title, hero and
intro, then an illustrated calendar section, followed by the illustrated Difficulty
rating and Core needs sections as full-width rows. Other explanatory sections
and the closing paragraph are omitted at John’s request (30 September). The
calendar uses an actual Radish capture, a usual/less-usual colour key, and
two self-contained legend groups: Usual / Temperate climates with a sunny
English ploughed field and bright sow/harvest swatches; Less usual / Warmer
climates with the tropical island and muted swatches. This uses John’s latest
climate mapping (30 September), superseding the warm/cold comparison. The
explanation defines the guide’s temperate baseline as lowland England, US zones
8 to 9, using John’s supplied wording.
Calendar assets and capture provenance are in `calendar-assets/`.

The scale rows reuse the [focused study](scales-study/REVIEW.html): Broccoli’s
3/5 difficulty badge, Radish’s Core Needs with Water emphasised, and coloured
baby/healthy-plant, Einstein/withered-plant, dropper and wave illustrations.
The study HTML supplies the scale content to the entry-page builder; its assets
remain runtime inputs. Do not prune them as disposable proofs. The assembled
how-to PDF is approved and installed for batch export. See `HOW-TO-CHECKS.json` for the one-page fit check.

- [Installed cover C](../../../public/front-matter/cover-A4.pdf): current guide thumbnails.
- [Contents PDF](contents.pdf): approved, unchanged.
- [How-to PDF](how-to.pdf): current assembled calendar and illustrated scales.

For how-to-only revisions, use:

```
node docs/front-matter/entry-pages/build.mjs --how-to-only
```

This preserves the approved contents HTML/PDF and pagination receipt. It rebuilds
and installs only the how-to; refresh its PNG preview after visual inspection.


Vegetables occupy pages 1–88; Troubles follows on pages 89–132 in both units.
Opening pages are unnumbered. Groups follow navigation order, with alphabetical
vegetables inside each group; Troubles guides are alphabetical. Contents columns
read downwards. Numbers come from `src/print/bookPagination.json`, shared with
both live renderers and batch ordering; no hand-maintained page references.

With start.command running, refresh changed lengths/order using:

```
node scripts/measure-book-pagination.mjs
node docs/front-matter/entry-pages/build.mjs
```

The first command measures all 14 Troubles guides in both units without PDFs;
vegetables have two pages each. The second needs no server: it checks the source
signature, equality of unit-edition numbering, page fit and single-page PDFs,
then installs current contents/how-to PDFs and their pagination receipt under
`public/front-matter/`. If the editions diverge it stops for separate contents.
Recheck numbering after Troubles source or shared layout changes. Single guide
exports also use collection numbers. Stale source or actual page-count changes
fail explicitly, and batch rejects outdated contents references.

Both entry PDFs were visually checked. Four boundary-guide PDFs verify numbers
1–2, 87–88, 89–92 and 131–132. Ten focused pagination/export tests passed in
238 ms; app and export-plugin type checks passed. Evidence: `CHECKS.json` and
`output/pagination/CHECKS.json`. No full catalogue PDF export was run.

The old [A/B/C comparison](studies/REVIEW.html) is a historical design reference,
not current numbered copy. Its builder is superseded for ongoing entry-page work.
The chosen artwork and its prompts remain in `studies/assets/` and
`studies/PROMPTS.json`. No canonical gardening records changed.
