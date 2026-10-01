# Approved artwork registry

Forward vegetable-page design: [Richer A v1](../vegetable-style-pilot/fresh-c/RICH-A.html),
approved by John on 28 September. Its [approval manifest](../vegetable-style-pilot/fresh-c/DESIGN-APPROVAL.json)
hashes the reference proofs, CSS, HTML and local artwork dependencies. The C-style
transparent carrot is approved in that composition. Existing fact/risk/planting
artwork remains part of the design. All 44 hero files are now installed under
`public/images/heroes/richer-a/`; all 44 heroes are approved by John on 29 September.
[Approval hashes](../redesign-rollout/APPROVAL.json).
`src/print/heroArtwork.json` is the active mapping. [Gallery](../redesign-rollout/REVIEW.html)
and [AI provenance](../redesign-rollout/ARTWORK.json). Old hero artwork is preserved.

Forward Troubles design: [Open Editorial v1](../troubles-style-pilot/editorial/REVIEW.html),
approved by John on 28 September. Its [manifest](../troubles-style-pilot/editorial/DESIGN-APPROVAL.json)
protects the four reference proofs, source snapshots, layout files, palette input
and diagnostic artwork dependencies. Keep these references during cleanup;
the detailed diagnostic illustrations remain part of the design.

Active coloured icons: 36 Style-A SVG/PNG pairs under
`public/images/coloured-icons/style-a-v1/`. All approved by John on 23 September.
[Hashes](COLOURED-SET-APPROVAL.json).

Active Key Risks: 35 original naturalistic drawings, 31 supplementary silhouettes
and the dedicated bolting-onion image. John approved their drawings and proofs.
[Naturalistic registry](NATURALISTIC-SET-MANIFEST.json) ·
[Silhouette registry](SILHOUETTE-SET-MANIFEST.json) ·
[Onion registry](ONION-BOLTING-MANIFEST.json).
These retained registries protect current artwork without depending on old proof
folders. Prompt/source fields are historical provenance, not runtime dependencies.

Current mappings live in `src/lib/quickFactIcons.ts` and `src/lib/keyRiskIcons.ts`.
Crop bubbles are outside this task. Rejected/unused experiments and duplicate
Troubles artwork were removed; approved live drawings, hero originals/crops and
planting assets remain. Git holds superseded versions.

Official front matter uses cover C with current Broad Bean/Courgettes thumbnails,
the Harvest corner A vegetable cluster, and the how-to calendar/scales captures
and coloured illustrations. These inputs live under `docs/front-matter/`; owners
are `scripts/build-front-cover.mjs` and `entry-pages/build.mjs`. Preserve referenced
inputs and installed approval hashes; older builder files are not current owners.
