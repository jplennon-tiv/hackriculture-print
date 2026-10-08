# The Vegetable Guru — illustration stock

[Review all eight illustrations and placement studies](REVIEW.html).
Generated and restyled 7 October 2026 with the built-in image-generation tool.
The gallery now shows the revised set; John said the redraws are better.
Page allocation and installation into the book PDFs remain pending.

The first stock generation drifted towards fine veins, root hairs, surface
texture and softer naturalistic shading. John accepted the subjects and requested
a style correction. All eight have now been redrawn with approved crop heroes as
direct inputs. [Compare approved references, earlier versions and current redraws](STYLE-REDRAW.html).
The [earlier comparison](STYLE-COMPARISON.html) remains evidence of the problem.
The project [artwork skill](../../../.agents/skills/vegetable-guru-artwork/SKILL.md)
records the source hierarchy, drawing language and comparison workflow for reuse.

| ID | Subject | Suggested use |
| --- | --- | --- |
| H1 | Beetroot, carrots and radishes | Contents page 4, roots pair |
| H2 | Turnips, parsnips and chard | Contents page 5, roots pair |
| H3 | Courgettes, pepper and tomatoes | Welcome header; summer pair |
| H4 | Aubergine, cucumber, beans and squash | Summer-pair alternative / reserve |
| H5 | Seedlings, pots and trowel | How-to page 6, growing-season pair |
| H6 | Harvest in a wooden trug | How-to page 7, growing-season pair |
| S1 | Climbing beans and blossom | Replacement in the author portrait slot |
| S2 | Radishes and leaves | Alternative portrait / reserve |

Each is a separate transparent RGBA PNG in `assets/`: headers are 1448 × 1086 px;
portraits are 1024 × 1536 px. Files are copied verbatim from generated outputs.
[ARTWORK.json](ARTWORK.json) records exact prompts, sources, hashes, alpha checks
and proposed placements. Earlier stock remains in `assets/`, with its metadata
under each asset's `previousVersions`; filenames containing `hero-style` identify
the current redraws. The portrait framing refinements finish the top of each
plant. The first S1 attempt under `attempts/` predates its botanical correction.

## Sources and intentional changes

The [approved crop heroes](../../../src/print/heroArtwork.json) are the direct
style authority for the redraw. Each generation uses two or three relevant
heroes plus the earlier stock as a composition-only input. The
[original harvest cluster](../../front-matter/entry-pages/studies/assets/harvest-cluster.png)
and [approved pea hero](../../../public/images/heroes/richer-a/pea.png) supplied
the first set's references; the harvest cluster alone was insufficient to keep
the full set aligned with the heroes. All approved originals remain intact.

John requested unique artwork to reduce repetition, related variations on facing
headers, and a replacement rather than removal of the author-area image. The
proposed allocation replaces the repeated harvest cluster with five distinct
headers and replaces the author-area pea with S1. Title-page artwork is unchanged.
H4 and S2 provide additional stock. No gardening advice or canonical data changed.

## Placement studies and checks

The gallery includes [contents headers](previews/contents-headers.png),
[how-to headers](previews/how-to-headers.png) and a [welcome example](previews/welcome.png).
These are screen-only copies of existing layouts, with artwork substitutions;
the author portrait uses contain-fit to retain its silhouette. They are not
print proofs. Approved contents/how-to files, existing opening proposals and
all PDFs remain unchanged. The approved five-file manifest was checked before
and after making the studies.

H1 and S1 were redrawn and compared first; the treatment was then applied to the
other six. All eight drawings, the updated overview, direct comparisons and
placement studies were visually inspected. Image decoding, gallery links and
background controls were checked. These checks are
technical/design review by Codex, not approval by John. Selected artwork still
needs both-unit PDF placement checks when revised opening proofs are requested.

Rebuild this gallery and its screen studies with an existing loopback Vite
instance started via `start.command`:

```sh
node scripts/build-guru-stock-gallery.mjs
```

This builder neither regenerates AI artwork nor exports/replaces book PDFs.
