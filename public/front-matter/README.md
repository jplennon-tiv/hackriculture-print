# Approved front matter

`cover-A4.pdf` is the approved fan-v3 cover, with the review/study label removed. Batch Print All copies this file to `output/00_cover_A4.pdf` first and includes it in progress/error counts. It remains A4 regardless of the crop paper/unit selectors. No AI, image generation or font download is required to copy the cover during batch printing.

Artwork: `public/images/front-matter/hands-sheet-fan.png`. Editable layout snapshot: `docs/front-matter/templates/approved-cover.html`. To rebuild after an approved change, run `node scripts/build-front-cover.mjs`; this needs installed Chromium and access to Google Fonts. The template embeds its historical preview image, but the builder replaces that with the canonical public artwork. Keep generated PDF and artwork together in backups.

`how-to-use-A4.pdf` contains the two native A4 how-to pages installed on 18 September. Batch copies it next as `output/01_how-to-use_A4.pdf`, counting the document as one job. Missing front matter is reported without stopping subsequent jobs. Both front-matter documents stay A4 regardless of crop selectors.

Rebuild the how-to pages using Node 24: `node scripts/build-how-to.mjs`. Review `output/pdf/how-to-final/how-to-use-A4.pdf`, then copy it to `public/front-matter/how-to-use-A4.pdf`. The builder needs Chromium and Google Fonts; normal batch copying does not. Source sheet reference PNGs live under `docs/front-matter/references/`; these are retained examples, not live crop renders. All connector arrows run from the example sheet out to an explanation. No generated image-model gardening text is used. No crop guide or shared data changes accompany this installation.
