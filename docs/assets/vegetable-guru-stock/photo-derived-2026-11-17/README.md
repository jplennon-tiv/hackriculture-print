# The Vegetable Guru — 30 photo-derived illustration choices

17 November 2026. John requested an expanded set of about 30 illustrations for
selection and later use inside the book. This collection contains **six previously
accepted masters and 24 new candidates**. John reviewed the plant sketches as useful for a later return to the interior;
selection and placement are deferred. The new drawings remain proposals; no
approved page, gardening record or earlier artwork was replaced.

- **[Online downloads](DOWNLOADS.md):** preview and all 30 masters, split into three smaller artwork ZIPs.
- **[Numbered preview PDF](Vegetable-Guru-Photo-Library-30-Preview.pdf):** all 30
  drawings with their source photographs, followed by source credits and notes.
- **Separate originals:** `assets/`, `sources/`, `style-references/` and `recipes/`.
  Redundant complete/source ZIPs were pruned on 17 November after byte verification;
  the three smaller artwork downloads remain available.
- [Artwork manifest](ARTWORK.json), [used-source register](SOURCES-USED.json),
  [technical checks](CHECKS.json) and [file checksums](SHA256.json).

## Selection and numbering

01–04, 07 and 08 are byte-exact copies of John's accepted selection from the
[first collection](../photo-derived-2026-11/README.md). Their original approval
record is retained in [ACCEPTED-SELECTION.json](ACCEPTED-SELECTION.json).
05 and 06 remain set aside because they looked too arranged; neither is in this
30-image selection. New choices are numbered **09–32**.

The set includes fruiting plants, leafy crops, root crops, loose harvests and a
few broader groups. The runner-bean flowers and young plant rootball provide
growing-technique subjects as well as crop portraits. Suggested uses in the
manifest are editorial proposals, not installed layouts. Image 23 keeps a general
plant-raising label because its exact crop identity is unconfirmed; the original
generation prompt used “courgette” and is preserved as an input record, not an
identification authority.

## Source and style

John's original Photos and archive photographs and native local video frames
provide 21 of the 30 compositions. Nine use online photographs marked CC0/public
domain by their source sites. The source register retains the photographer,
source-page URL, licence, original filename or video path/timestamp and SHA-256.
The preview's online source photographs and credit links are clickable.

Each new illustration was generated from its source photograph with direct
approved richer-a vegetable heroes as style references: broad shapes, dimensional
colour planes, sparse tapered highlights and simple veins. This is the current
interior style, not the earlier fine-lined watercolour description. Source
backgrounds, distracting objects and surplus foliage were omitted; simplified
or completed elements are recorded per drawing. These are AI-generated drawings
derived from photographs, not unaltered photographs or exact botanical tracings.

## Using the files

Use the separate **RGBA PNGs in `assets/`** and preserve their alpha channel.
Cream backgrounds and smaller JPEG copies in the PDF are for viewing only;
full-resolution masters remain separate and unchanged. Some PNGs contain colour
in nearly transparent pixels; a viewer that ignores alpha can display a dark
or coloured haze. The masters were reviewed composited on cream and dark green.
Do not flatten against black or repeatedly regenerate a complete page to move an
illustration. Place the master on its own layer instead.

Native images are 1024 × 1536, 1536 × 1024 or 1254 × 1254 pixels. At 300 dpi their
whole canvases are approximately 87 × 130 mm, 130 × 87 mm or 106 × 106 mm. The
manifest gives exact dimensions per image. This suits interior spots and many
section details; larger placements require their own print-size check. No image
has been enlarged and presented as newly recovered detail.

The original generated outputs are also preserved under `generated_images/` in
the project. Retained PNG masters are the exact reusable results. Source photos,
style references and generation requests permit another attempt, but generative
reruns are not deterministic and should not replace the originals.

## Rebuilding the preview

`build_collection.py` uses the project's primary Python runtime with Pillow,
numpy, ReportLab and pypdf. It copies accepted masters without altering pixels,
measures alpha/dimensions, creates the PDF and verifies the final ZIP. Review
composites are made by `review/render_contacts.mjs` with Sharp; they do not edit
master pixels. Final visual review is recorded separately. No browser server,
book regeneration, application test suite or supplier action is involved.

Choose images by their displayed numbers. Placement and any further revisions
can follow John's review of this selection.
