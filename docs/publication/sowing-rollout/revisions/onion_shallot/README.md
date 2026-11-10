# Onions and Shallots one-off amendment

7 November 2026. [Review both editions](REVIEW.html). John approved both editions;
the [approval record](APPROVAL.json) binds the exact reviewed files. The original full readers and main book remain separate.

John requested bottom alignment of the three soil cross-sections in Sowing &
planting. The existing visible-artwork alignment method excludes transparent
margins (alpha > 8). Sow shallowly moves down 1.75 mm and Plant tip showing
moves down 1.05 mm; Space young plants stays in place. Their visible bases
share the 94.78 mm page coordinate in both editions, with 5.35 mm to the level
captions. The fourth drawing, Allow room to grow, is not moved. All original
image bytes, sizes, proportions and captions are retained.

The builder now accepts an optional `plantingImageAlignmentSources` list so
only the specified images move. It requires each listed source to match exactly
one image and rejects duplicate sources. Omitting the list retains the existing
all-image alignment behaviour. The amendment lists the three cross-sections.

The standing Quick facts check groups Germination, Seed depth, Harvest and Yield
as short pairs, with Ready in spanning the left column. Sow, Plant sets and both
spacing entries occupy the wider right column (45:55). All nine facts, exact
values and icons remain. Under the standing pH/liming rule, Soil & preparation
now says “Rotate crops yearly. Rake a fine seedbed for sowing.” The general
“test acid soil before liming” clause is removed; canonical advice is unchanged.

Both actual PDFs remain two pages, 185 × 240 mm, numbered 68–69. Footer clearances
are 6.03 mm and 7.49 mm in each edition. All six varieties, ten pest entries,
9 pt planting text, other wording, original artwork and See also links remain.
No pests are trimmed. Both rendered spreads were inspected against the baseline.
The reader works locally and over the preview server in both units; its links,
images and edition selector were checked. The selected-source and default
alignment paths, including invalid input rejection, were checked without
re-exporting another guide. The routine suite passed: seven files, 43 tests.

Sources and evidence:

- [Book-only amendment](../../../../../src/print/book/sowing-rollout/revisions/onion_shallot.json)
- [Original review evidence](../../checks/onion_shallot.json)
- [Layout and alignment evidence](checks/onion_shallot.json)
- [PDF verification](checks/onion_shallot.verified)
- [Content, source, artwork and reader checks](CHECKS.json)

The amendment is now frozen. Make any future change in a separate revision;
do not rerun its builders or replace the full review books.
