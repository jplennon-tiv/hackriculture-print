# Batch 01 artwork correction — 19 September 2026

John authorised installing the audited corrections and regenerating the three proofs. Installation and PDF checks are COMPLETE. Do not rerun the guarded one-shot `scripts/correct-troubles-art-batch-01.mjs`: it now deliberately refuses the changed records. Its `assignments` table is the exact destination-condition -> existing-file mapping. Do not rename legacy files based on their misleading names, overwrite originals or rerun the initial batch preparation.

Exact preceding-byte backup: shared `backups/admin/2026-09-19T21-56-51.812Z-6d3537e4-2e7d-4a7c-bd02-b2df3f066af2/`; transaction complete, 0.json bean/pea, 1.json beetroot, 2.json brassica. No images deleted or overwritten. All three selected generated PNGs are installed under public/images/troubles.

Regenerated `output/pdf/ai-once-pilot/{beetroot_troubles,bean_and_pea_troubles,brassica_troubles}-review-A4.pdf` without the old mapping-warning banner. Reports: 2/6/8 pages, 8/21/29 entries, zero overflowing columns, only expected draft-approval warnings and no fallback. All 16 final rendered pages inspected. Existing checkerboards and spare space in single-card columns remain POC limitations, not newly introduced fit errors. Poppler issued Type 3 glyph bounding-box warnings, with no visible clipping in the inspected renders. Tests: 225 passed; TypeScript/Vite build passed (existing chunk-size warning); shared 44/14/8 integrity check passed. Next: John reviews these corrected proofs; do not silently approve their draft summaries/layouts. Further exports use saved data and need no image-generation calls.

All 49 legacy bean/pea and brassica files were visually inspected via contact sheets and selected full-size views. SHA256 comparison with the 14 September TRANSFER-MANIFEST found all 49 byte-identical: mismatches predate this batch; the historical cause is unknown. The PDF renderer follows the supplied image path correctly. Reuse saves unnecessary duplicate media. Original assets remain untouched; misleading legacy basenames are retained deliberately, with corrected record references.

19 bean/pea image references and 27 brassica references change. Two missing beetroot images are added (48 changed paths total). Three new PNG assets: beetroot fanging, autumnal fungal root rots and brassica frost. New and audited referenced files have content hashes in the records. Frost's caption becomes “Cold-damaged leaves”. Full condition prose and its AI companions are unchanged. Beetroot's print-only introduction is shortened slightly and cards reordered to accommodate both images on two pages; no padding/font changes.

Key visual matches: the legacy `downy_mildew` bean image actually shows mice eating young plants/seeds; `pea_thrips` shows green pea aphids; `mice` shows vigorous growth without flowers; `pea_and_bean_weevil` shows flowering without pods. Bean images `pea_moth` and `leaf_and_pod_spot`, plus brassica `downy_mildew`, remain assigned. The old brassica `mealy_aphid` image is an ambiguous bleached leaf and is not reused; a clearer frost illustration replaces it. `woody_kohl_rabi` remains text-only, outside this missing-art request.

Research used to check appearance (not an assertion that illustrations diagnose disease conclusively):

- RHS aphids: https://www.rhs.org.uk/biodiversity/aphids
- PGRO pea aphid: https://www.pgro.org/tu05-pea-aphid2/
- INRAE pea aphid: https://eng-encyclopedie-pucerons.hub.inrae.fr/species/aphids/acyrthosiphon/a.-pisum
- RHS runner bean pod set: https://www.rhs.org.uk/advice/grow-your-own/features/runner-beans
- RHS downy mildew: https://www.rhs.org.uk/disease/brassica-downy-mildew
- RHS frost injury: https://www.rhs.org.uk/prevention-protection/frost-damage
- UMN beet diagnosis: https://apps.extension.umn.edu/garden/diagnose/plant/vegetable/beet/leavesdiscolored.html
- UC IPM beet: https://ipm.ucanr.edu/home-and-landscape/beet/

Remaining limitations: existing baked checkerboard backgrounds are unchanged. Nutrient symptoms are illustrative, not uniquely diagnostic. Root-rot art depicts general decay, not a confirmed pathogen. Some source crop-applicability metadata needs a separate editorial check; no blanket factual approval is claimed. Dedicated crop hero art remains deferred. New proofs remain drafts pending John’s review.

## New artwork provenance

Generated with the built-in OpenAI image tool, not a separately billed API script. Full prompts below. Sources in `/Users/johnlennon/.codex/generated_images/01a0a1a6-e9a1-7142-93c1-f53aed65e55d/`; selected outputs are copied to `public/images/troubles/<group>/`. No generation needed on later exports.

### Fanging, `fanging-v1.png`

Selected `exec-4d4194f9-dcf8-4b27-8672-e34bccb91c18.png`. Earlier `exec-d90464c1-9f94-47e9-aaca-3977ea7ea690.png` rejected for dark background.

Initial prompt: Use case: scientific-educational. Create ONE standalone botanical watercolour illustration for a UK vegetable troubleshooting sheet: FANGING in BEETROOT. Show one freshly lifted red beet with a broad rounded beetroot shoulder that divides clearly into two substantial tapered fleshy red root branches, with fine root hairs and a few short red leaf stalks/green beet leaves. The fork is abnormal root shape, not a split/crack, not two separate beets, no black rot and no insects. Delicate ink edges, realistic hand-painted watercolour detail, natural burgundy and fresh green, like a traditional professional gardening field guide. Clear simple silhouette readable in a 90mm wide printed card. Isolated composition, whole root visible with generous margin, genuinely transparent background, no painted checkerboard, no paper rectangle, no text, no labels, no border. This is a new illustration, not a full page.

Final edit prompt: Edit this beetroot illustration. Keep the exact forked beetroot anatomy, red colours, fine root hairs, green leaves and hand-painted botanical watercolour style. Change ONLY the background: remove ALL the dark black/green/red hazy background and replace it with a completely flat pure white #FFFFFF background, including all spaces between leaves and fine roots. No gradient, no shadow, no texture, no checkerboard. Preserve full subject within frame. This isolated botanical asset is for printing on a white card.

### Autumnal root rots, `autumnal_fungal_root_rots-v1.png`

Selected `exec-bcd36b77-ce2c-4631-9416-1e6570e39a10.png`.

Prompt: Use case: scientific-educational. Create ONE standalone traditional botanical watercolour illustration for a UK gardening troubleshooting card, AUTUMNAL FUNGAL ROOT ROTS OF BEETROOT. Show one freshly lifted golden beetroot with short cut leaf stalks and a small root tail, resting in an isolated vignette; beside it one longitudinal cut half of the SAME kind of golden beet, showing an irregular dark brown-black decayed lesion advancing inward from one outer side while most flesh remains golden yellow. Outside of whole beet has a corresponding irregular dark sunken decayed side patch. This is a general illustration of root decay after prolonged damp soil, NOT a specific pathogen diagnosis: no mushrooms, no dramatic fuzzy mould, no insects, no black central heart rot. Clear gentle realistic pen-and-watercolour botanical detail, restrained natural gold ochre olive burgundy brown, clean readable shapes, consistent with a professional vegetable field guide. Compact horizontal composition with both roots fully visible, generous margin. Completely plain solid WHITE background, no checkerboard, no coloured wash or shadows outside objects, no text, no labels, no frame. Do not draw a full page.

### Frost, `frost-v2.png`

Selected `exec-81d9df71-f987-4718-81f1-5cf4cf984fef.png`.

Prompt: Use case: scientific-educational. One botanical pen-and-watercolour gardening illustration of FROST DAMAGE ON CABBAGE, for a UK vegetable troubles guide. Show one cabbage head still attached to a short stalk, with green intact central head and two outer leaves visibly limp, collapsed and water-soaked dark olive-brown/near black along patches and edges after a hard freeze. A few subtle ice crystals on one leaf may indicate the cold, but the diagnostic subject is damaged limp tissue, not a snow scene or a powdery white coating. Accurate cabbage form, no insects, no circular fungal spots, no chewing holes, no split head. Traditional detailed but readable botanical watercolour, fine ink contours, forest green and muted brown natural palette, single isolated compact composition on a perfectly plain WHITE background. Full plant head in frame with margin, no text, labels, arrows, frame, checkerboard or background landscape. Print-ready illustration, not a full page.
