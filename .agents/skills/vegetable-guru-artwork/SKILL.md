---
name: vegetable-guru-artwork
description: "Create, restyle or compare The Vegetable Guru vegetable illustrations, matching the approved hero artwork. Use for cover, header and decorative stock images in hackriculture-print; not page layout, typography or diagnostic pest artwork."
---

# The Vegetable Guru artwork

Keep new illustrations recognisably in the same drawing style as the approved
vegetable heroes. Matching subject matter and colours alone is insufficient.
John's brief is to retain useful new subjects and compositions while preventing
drift towards detailed botanical or naturalistic illustration.

## Source authority

This skill belongs to `hackriculture-print`. Resolve project-relative paths from
the repository root, three directories above this skill. Read the current
[handover](../../../docs/handover/START-HERE.md) and relevant
[asset registry](../../../docs/assets/README.md) entries before artwork work.

For book compositions, use the [book design system](../../../docs/BOOK-DESIGN-SYSTEM.md)
for colour roles, intended image slots and section relationships. The
[overall book-design skill](../vegetable-guru-book-design/SKILL.md) coordinates
new section treatments; this skill remains the authority for matching illustration
style. Reading the design system does not require changing any page layout.

The style authority is the approved raster hero set in
`public/images/heroes/richer-a/`, mapped by
[heroArtwork.json](../../../src/print/heroArtwork.json) and recorded in the
[approval manifest](../../../docs/redesign-rollout/APPROVAL.json).
Inspect actual pixels, not only filenames or prompt descriptions.

Choose two or three relevant approved heroes as direct generation inputs:

| Need | Strong references in `public/images/heroes/richer-a/` |
| --- | --- |
| Root groups and simple foliage | `carrot.png`, `beetroot.png`, `radish.png` |
| Pale roots and chard | `parsnip.png`, `turnip.png`, `beet_leaf.png` |
| Summer crops | `marrow_courgette.png`, `capsicum.png`, `tomato-greenhouse.png` |
| Pods and portrait greenery | `bean_french.png`, `pea.png` |
| Leafy harvests | `kale.png`, `lettuce.png`, `leek.png`, `onion-shallot.png` |

Select other approved crop heroes when they are closer to the requested subject.
The original harvest cluster and Cover C can inform composition or colour but
must not be the sole style reference. Previously generated stock is a composition
reference unless its approval status explicitly establishes otherwise.

## Drawing language to carry forward

- Bold simplified silhouettes and broad, overlapping colour/shadow shapes.
- Saturated lime/forest greens and clear crop colours, with strong readable volume.
- Graphic cream or pale highlight strokes: tapered slashes and, where the relevant
  hero uses them, rhythmic scalloped strips. Match the reference rather than
  applying every highlight motif to every object.
- Foliage described by a bold midrib, a few clear branches and large lobes or
  folded planes. Crop-specific complexity, such as kale curls, stays graphic.
- Root tips and surface markings simplified to confident shapes. Preserve crop
  identity and plausible attachments while simplifying the rendering.

Avoid adding networks of fine veins, root hairs, etched skin texture, tiny
stippling, naturalistic wood grain, soft painted modelling or photographic gloss.
The target is dimensional, vector-like illustration, not a flat monochrome icon.
Do not introduce heavy black outlines, faces or decorative text. Translate new
props such as pots, tools and trugs into the same broad colour-plane treatment.

## Generation and comparison workflow

Use the available `imagegen` skill and built-in image-generation tool for these
raster assets. Keep each illustration as a separate output. For edits, inspect
the local target first and identify every input's role explicitly:

> Images 1–3 are the authoritative approved hero style. Image 4 supplies only
> the subject mix and broad arrangement. Redraw that arrangement with the
> references' bold simplified shapes, discrete colour planes and graphic
> highlight strokes. Preserve the requested crops and props. Remove fine
> naturalistic surface detail. One illustration on a genuinely transparent
> background, with the full silhouette inside the canvas and no coloured halo.

Adapt that scaffold to the actual input count and subject. State the invariant
subjects, arrangement and intended slot; do not silently change them to solve a
style problem. Retain distinctive variations for paired headers rather than
mirroring or duplicating one image.

For a new batch or significant style change, make one or two representative
samples first and compare them with the approved heroes before expanding the
batch. Use matching background and display scale; inspect both full detail and
the intended page size. Compare silhouette, foliage, shadow shapes, highlight
rhythm and texture density. Do not call the style matched merely because the
palette agrees. If the samples still drift, correct them before generating the
rest. This is a visual quality check, not an automatic extra permission step.

Check transparency on cream and dark green, complete tips and leaves, sufficient
clearance for contain-fit, crop identity and distinct paired compositions.
Refine framing without reintroducing detail. Show a direct reference comparison
when delivering a new style pass. Keep approval separate from technical review.

## Save and reuse

Save project assets under an appropriate versioned path; for current decorative
stock use `docs/assets/vegetable-guru-stock/assets/`. Keep the approved originals
intact. Record prompts, exact reference paths, output hashes, revisions and
actual review coverage in the owning `ARTWORK.json`, preserving prior versions.
Read the [stock inventory](../../../docs/assets/vegetable-guru-stock/README.md)
and [prompt/source record](../../../docs/assets/vegetable-guru-stock/ARTWORK.json)
when continuing that set. The latter distinguishes the overly detailed first
attempt from the subsequent hero-referenced redraw.

For this stock set, `node scripts/build-guru-stock-gallery.mjs` rebuilds the
gallery, direct comparisons and screen placement studies from saved assets.
It requires the existing loopback Vite workflow and does not regenerate images
or export book PDFs. For layout changes or actual print proofs, use
[book-layout-review](../book-layout-review/SKILL.md) for book pages or the retained
[guide-layout-review](../guide-layout-review/SKILL.md) for A4 sheets.
Artwork work alone does not authorise
guide regeneration, new gardening copy or installation into approved pages.
