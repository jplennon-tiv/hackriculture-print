# Handover: promotional YouTube slides for The Vegetable Guru

Prepared for John on 2 November 2026. This is a new creative task, separate from
editing the book. John wants a set of slides showing the book’s contents, to insert
into a promotional YouTube video. The first six-slide sequence and timed page
insets are now prepared separately under `output/promotional-video/`.

## Current promotional edit

John confirmed a **45-second, 16:9 sequence at the end of the current video**, with
background music only and a soft transition. John approved the full v4 sequence.
Native CapCut project `1102` is now **05:52:00 at 30 fps**, including his final
filmed take and six-second logo closing card. Preserve the current introduction edits, including
the subsequently added 0.1-second audio dip at 01:26.533.

- Closing card: `output/promotional-video/hackriculture-outro-6s.mp4`
  is rendered, decoded, visually checked and installed in CapCut. It preserves
  John's supplied Hackriculture logo image, uses the same Carefree music at the
  slide level, and fades in/out gently. John appended it after automated placement
  failed. Native placement is verified at **05:46–05:52**, with 0 dB clip gain;
  all seven previous segments and both Mix transitions match the immediate
  baseline exactly. The card was visually inspected at 05:49. Provenance is in
  `ending/OUTRO.json`; retain the newer introduction audio edit.

- Final native export: `/Volumes/Videos/To Upload/vegetable-guru-book-launch-final-v3-4k.mp4`,
  **3840 × 2160, 30 fps**, H.264/AAC, 1.52 GB, **5:52**. John requested 4K.
  Full decoding passed; actual exported frames verify the filmed ending's fade,
  logo fade-in, complete supplied image and final fade to black. Music matches
  the slide bed (0.999 correlation after AAC alignment, 0.06 dB level difference).
  Saved locally and **not published**. Earlier 1080p exports remain available.
- John's +8 dB filmed-audio revision remains applied, along with his subsequent
  0.1-second audio dip at 01:26.533. Slide music and all existing timeline segments
  were preserved exactly during outro installation. Earlier gain evidence is in
  `output/promotional-video/ending/audio-boost-checks.json`; current export and
  outro evidence are in `output/promotional-video/source/CHECKS.json`.
- Sequence: retained book intro; contents 4–5; complete Carrot guide 36–37;
  Brassica Troubles 106–107; approved Netting spread 164–165; Supports 166–167.
- `output/promotional-video/vegetable-guru-features-45s-v4.mp4`: six slides,
  1920 × 1080, 30 fps, gentle dissolves and an instrumental music bed.
- `output/promotional-video/book-page-insets.mov`: transparent, silent 3:17.5
  overlay, aligned to timeline zero. Shows the cover and the Kale, Cabbage,
  Brussels Sprouts and Carrot spreads at the filmed page-holding moments.
- Slide PNGs, separate inset PNGs, editable composition sources, exact cue times
  and asset provenance are retained alongside the exports. Uses a front-only crop
  of the actual printed cover with John's byline, matching the filmed copy.
- Music is Kevin MacLeod's **Carefree**, CC BY 4.0; put the supplied
  `output/promotional-video/MUSIC-CREDIT.txt` credit in the YouTube description.
- John placed both imported media clips in native CapCut project `1102` after
  automated dragging failed. Placement is verified: inset layer starts at zero;
  slides start at 03:17:15. A soft Mix transition is applied at that join, and
  the original two source cuts are retained. The slides end at **04:02:15**.
- `output/promotional-video/vegetable-guru-complete-review-v4.mp4` is a separate
  complete review render with the same cuts, insets and slides. It uses a
  0.6-second dissolve; native CapCut's Mix is approximately 0.5 seconds. The
  complete 1080p/30 fps H.264/AAC file passes decode checking. Actual page-inset
  and transition frames were visually inspected, including the native preview.
- John approved the actual Netting spread and requested real book pages in every
  slide after the intro. V4 replaces slides 2, 3, 4 and 6 with complete original
  spreads and short green context ribbons above the pages. The ribbons cover no
  book content. Intro and approved Netting PNGs are unchanged. Source images were
  checked against the current PDF, and both v4 video exports passed full decoding.
  The v4 clip is installed in CapCut; the original cuts, audio, 45-second timing
  and Mix transition are retained. Supports was visually inspected in the native
  preview at03:59:13. John subsequently approved the complete v4 sequence.
  Earlier image/excerpt/end-card treatments are superseded.
- `output/promotional-video/vegetable-guru-closing-with-signup.mp4` now follows
  the slides at 04:02:15. It retains source 0049 from 01:02.800 to 02:46.300,
  removing the false starts and recording tail without cuts within the final
  take. Duration is 1:43.5, with original speech at normal speed and a 0.8-second
  final fade. A second native Mix dissolve matches the first (466666 µs).
- The real **hackriculture.com** signup form appears at the top left from
  **04:24.1 to 04:46.7**, aligned to John's signup explanation. Sequential real
  browser captures show typing and the site's actual check-inbox confirmation.
  The authorised sample address was `alex.gardener@example.com`; the sample
  inbox was not confirmed. This inset is included in the closing MP4, with its
  standalone demo, captures, transcript and exact provenance under `ending/`.
  The original 0049 source remains intact and imported. The closing clip passed
  full decoding; the native inset was inspected at 04:30:06. Original clips,
  overlays, slides, volume, framing and speed were checked unchanged.
- Current YouTube thumbnail: `output/promotional-video/thumbnail/vegetable-guru-book-launch.jpg`
  (PNG also retained). John confirmed the **Book Launch** cover is good on
  2 November; retain it unchanged. It is an AI-assisted composite using his filmed appearance and
  the printed book cover. Exact prompts and provenance are saved in
  `output/promotional-video/thumbnail/PROMPT.txt`. Earlier exports remain for comparison.

Approved book files and the sixteen pending wording changes remain untouched.

## Start here

Project: `/Users/johnlennon/Documents/web_site/hackriculture-print`

Read `AGENTS.md`, `README.md`, `SHARED-DATA.md` and `docs/handover/START-HERE.md`,
then this file. Follow the book-design skill and applicable presentation workflow.
Use Write Like John for new prose. No subagents unless John requests them.

The book is **The Vegetable Guru: Your at-a-glance growing companion**, by
**John Lennon**, UK-focused, full colour, 185 × 240 mm. Its three main sections
are **44 Vegetable Guides**, **14 Vegetable Troubles guides**, and **Growing
Techniques**. Vegetable guides are alphabetical and keep their category colours.
Troubles covers 220 conditions with 24 selected Common Pest / Common Disease /
Common Problem panels. Use these distinctions accurately; do not call diseases pests.

## Current source book and assets

All paths below are relative to the project directory unless stated otherwise.

- Current complete imperial PDF: `output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf`.
- Facing-page browser: `docs/publication/whole-book-order-preview/REVIEW.html`.
- Exact page map: `docs/publication/whole-book-order-preview/PAGE-MAP.json`.
- Current file hash and verification: `docs/publication/whole-book-order-preview/CHECKS.json`.
- Selected 300 dpi page PNGs and asset paths: `docs/publication/promotion-source-pack/MANIFEST.json`; images under `output/promotion-source-pack/`.
- Shared styling: `docs/BOOK-DESIGN-SYSTEM.md`; approved asset registry: `docs/assets/README.md`.
- Hero mappings: `src/print/heroArtwork.json`; original crop art under `public/images/heroes/richer-a/`.
- Reusable stock illustrations: `docs/assets/vegetable-guru-stock/ARTWORK.json` and its `assets/` folder.
- The book PDF uses selected G2 front / preferred B5 back artwork. The separately printed cover adaptation (with John’s byline) is documented in `docs/publication/bookvault-print-ready/README.md`; consult its cover preparation record if that cover is wanted instead. Do not mistake a wrap with spine/back/barcode area for a front-only image.

Use the PDF as the content/placement authority. The PNG pack is a convenience,
not a second manuscript. John's current direction is complete real page images,
with brief contextual ribbons if useful. Preserve all page content. Use the
300 dpi renders or freshly render the relevant current PDF pages; small browser
thumbnails are not finished slide artwork. Rasterising preserves the PDF appearance
but does not add detail absent from its embedded images.

The current book has **174 interior pages plus four cover leaves (178 PDF pages)**.
For an interior folio, **PDF page = folio + 2**. Front cover is PDF page 1;
back cover is PDF page 178. Do not present the PDF leaf count as the book’s page count.

## Latest changes included

- Approved three-panel “How to use the guides” page at **9**.
- Approved “Organic growing / Testing and adjusting pH” page at **152**, after
  Rotation & planning. Short intro, testing panel and lime panel; no laboratory advice.
- Contents **4–5**, index **171–174**, numbering, bookmarks and links refreshed.
- Sowing and Watering face at **162–163**; Netting **164–165** and Supports **166–167**
  remain facing spreads. No new internal blank; the old end blank is absorbed.
- Earlier approved Troubles, coloured contents and bolder category names remain.

Useful excerpts: Carrot **36–37**, Kale **58–59**, outdoor tomatoes **94–95**,
Brassica Troubles **106–111**, Organic growing **148–152**, Netting **164–165**,
Supports **166–167**. Verify against the manifest before exporting.

## What remains open

The separate sixteen wording changes across twelve vegetable guides are **not
approved or integrated** (`docs/publication/soil-acidity-crop-edits/DIFF.html`).
The page-7 Introduction rewrite and further proofreading remain. Use the current
book as-is for this promotional task; do not silently install pending copy.

John accepted the physical proof’s printing, colours, coated-paper feel/weight and
book size. This is not approval to publish the revised book. Ordered supplier PDFs
are unchanged. The sales link, ISBN and final price are unresolved; do not invent a
purchase destination or claim “available now”. Any sales end card needs John’s
current wording and destination. No publishing or purchasing is authorised.
The one sample launch-list signup was explicitly authorised for the promotional
demonstration. Both existing automations remain paused.

## Continuing the promotional edit

The 16:9, 45-second sequence and music-only treatment are confirmed. Preserve that
timing when revising individual slides. Reuse cream, green, orange, Nunito Sans and
Lilita One, with larger screen typography and factual examples from the actual book.
John accepted the full v4 page-based sequence and Book Launch cover. His trimmed
final take and signup demonstration are installed in the native project. The older
`complete-review-v4` file ends after the slides and does not contain this ending.

Keep editable slide sources and final exports separate from the book. Never
overwrite approved illustrations or manuscript pages, or move media currently
linked from CapCut. The native desktop project remains the editable master.
