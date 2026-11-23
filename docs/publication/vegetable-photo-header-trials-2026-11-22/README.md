# Vegetable headers with garden photographs

22 November 2026. **Experiment set aside at John’s request.** He felt it had not worked well and chose to move towards a second Bookvault proof. Retain the original illustrated headers. All trials, masters and references remain preserved; no selection or integration is pending. [Decision](DECISION.json).

[Eight-page proof](../../../output/pdf/vegetable-photo-header-trials/Vegetable-Guru-Garden-Photo-Header-Trials.pdf) · [comparison sheet](Header-Comparison.jpg) · [sources, prompts and masters](ARTWORK.json) · [technical and visual checks](PROOF-CHECKS.json).

John asked for a couple of vegetables and possible header designs. He clarified that photographs means vegetables **growing in soil in a real garden**, as if he had taken them. The earlier harvested cutouts are set aside and excluded from this proof. Two new generated garden scenes show Carrot and Cavolo Nero kale; these are image proposals, not claims that John photographed these exact plants.

## Choices

| Option | Treatment | Intentional change |
| --- | --- | --- |
| A | Familiar curved edge | Garden picture replaces the hero in a family-coloured curved field; title, season positions and overlaid difficulty sticker remain familiar. |
| B | Framed garden photograph | A slightly tilted landscape frame; the sticker moves beside the title so the photograph remains unobstructed. |
| C | Wider garden view | A larger photo and compact left-hand title/season column. Season wording remains; small season icons are omitted in this proposal. |

PDF pages 1–2 compare the original with A/B/C at actual page width. Pages 3–4 show complete A pages, 5–6 B, and 7–8 C. Every page uses 185 × 240 mm. These are the current Carrot 34 and Kale 56 guide bodies; all text, tables, calendars, advice, folios and body artwork below the 33 mm header are unchanged. The rating remains Fairly Easy, two filled dots and 2/5. Native Lilita One and Nunito Sans are retained.

The new photographs are [Carrot growing in soil](assets/carrot-growing-in-soil.png) and [Kale growing in soil](assets/kale-growing-in-soil.png). Both are 1536 × 1024 PNG masters; minimum effective resolution in these trials is approximately 368 dpi. Natural soil, believable crowns/stem attachments and varied leaves were checked against the references. H43 supplies the home-bed setting; John's original carrot camera frame supplies crop anatomy. A43 supplies the allotment ground/path, with the approved early-December kale study supplying plant structure. Seasonal planting is reconstructed; no distant structures or people are invented.

## Checks and working files

All six complete page trials have **zero changed pixels below the header**, with exact body text, fonts and geometry verified against the installed source. The source book hash is unchanged. The current opposite pages were inspected beside B: [Carrot 34–35](carrot-B-facing-spread.jpg) and [Kale 56–57](kale-B-facing-spread.jpg). Each header was visually compared against the original and the full C Carrot/B Kale pages were inspected at reading size. A/C deliberately allow the sticker to cover part of the photograph; B gives the clearest unbroken plant-and-soil view.

The two former cutout masters remain preserved under their original generated-image paths, recorded as set aside in ARTWORK.json. Original sketches and approved pages are untouched. No catalogue export, book integration or supplier work is included.

Reproduce these bounded proposals with the project's primary Python: `prepare-headers.py`, then `swift -module-cache-path /tmp/vegetable-guru-swift-cache build.swift`, then `build-proof.py`, run from the project root with this directory prefix. The writable module cache avoids an unrelated default cache permission problem. Native header sources contain only header glyphs/icons, avoiding duplicate hidden body text. The proof builder preserves the guide bodies and checks the actual exported PDF. A rerun sets technical status back to pending until visual review is recorded again.
