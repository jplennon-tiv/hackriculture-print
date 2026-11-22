# Current complete book preview

Updated **22 November 2026**. John authorised the approved-page integration pass. [Browse the book](REVIEW.html) · [browsing PDF](../../../output/pdf/whole-book-order-preview/Vegetable-Guru-Updated-Book-Review.pdf) · [full-resolution native PDF](../../../output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf).

The Traditional measurements edition contains **176 interior pages plus four cover leaves: 180 PDF pages**. All 44 latest approved vegetable-guide pairs, including thirteen variety-addition derivatives, are installed alongside the approved photographic opening pages and Growing Techniques. No guide was re-exported. The selected gold cover panels replace the old G2/B5 screen placeholders; the original wrap and supplier files are unchanged.

[Integration receipt](integration-2026-11-22/INTEGRATION-CHECKS.json) · [exact source manifest](integration-2026-11-22/SOURCES.json) · [page map](PAGE-MAP.json).

## Installed updates

| Printed pages | Current approved source or treatment |
| --- | --- |
| 1 | Title option 01: large tomatoes, medium chard and three thumbnails; Traditional measurements edition; no branding/imprint line |
| 2 | Existing publication page, with the measurement-edition prefix removed; metadata placeholders retained |
| 4–5 | Seven 32 mm photographic thumbnails, swapped upper groups, 84 contents entries and plain folios; category colours/key removed |
| 7 | Approved two-thumbnail Introduction; exact text and 1991 photograph retained |
| 9 | Approved 44-entry vegetable index with the expanded calendar panel and selected photographs |
| 10–97 | All 44 latest approved vegetable-guide pairs, including the thirteen variety derivatives |
| 99 | Approved Vegetable Troubles option D |
| 100–146 | Fourteen accepted illustrated Troubles guides, 220 conditions and 24 highlights, retained |
| 147 | Approved Growing Techniques D2 opener with restored folio |
| 148–171 | Approved photographic Techniques, including latest 149–153, 160, 164, 168 and 170–171 approvals |
| 156 | Exact approved 3760 × 1256 compost panorama restored in place of the reduced proof image |
| 164 | Redundant caption removed, with no replacement |
| 170 | Exact approved corrected image with the two growbag supports |
| 172–175 | Existing four-page index, 307 entries and 36 see references, retained |

Page 151 uses the revised winter kale and 168 the fresh camera-grounded watering redraw. Earlier approved photos on 154–159 and 161–167 are retained. The nutrient loop at 148 and measured greenhouse plan at 169 remain intentional diagrams. Guide and Troubles body artwork remains illustrated.

PDF page = interior folio + 2. Blanks 3, 6, 8, 98 and 176 remain. Openers 9, 99 and 147 remain on right-hand pages; all 44 vegetable pairs and Techniques facing spreads retain their approved placement. The selected cover panels are review leaves, not a new print wrap.

## Checks and remaining print decisions

- All **110 bound source files** remain byte-for-byte unchanged. **174 page content streams** are exact native reuse; the remaining changes are two cropped cover panels, the publication-label removal, caption removal and two exact approved image replacements.
- All **180 pages** were rendered and compared between native and browsing PDFs. All **178 non-cover leaves** were compared with their exact approved sources: zero changed pixels outside the four intentional edit regions. Six contact sheets covering openings, all 88 guide pages, all 25 Techniques pages, covers and index were visually inspected.
- **662 internal links** match expected targets, including **84 contents links** and **77 new mini-contents links**. There are **90 bookmarks** after removing one duplicate baseline entry. Index/body destinations are preserved; no new index curation was performed.
- The full-resolution native book is about **820 MB**. The approximately **148 MB browsing copy** keeps native text, page geometry and navigation while reducing RGB images to a maximum 1200 pixels. Use the native book for source-resolution inspection.
- The [placed-resolution inventory](integration-2026-11-22/IMAGE-RESOLUTION.json) covers **796 visible image placements**. At the 200 dpi review threshold, three substantial placements remain flagged: **title-page tomato 162 dpi; front cover 151 dpi; back-cover background 151 dpi**. This threshold is a review aid, not supplier approval. The restored compost panorama is about 429 dpi. No artificial upscaling or new artwork was used.

[Final verification](integration-2026-11-22/FINAL-VERIFICATION.json) · [Native checks](integration-2026-11-22/NATIVE-CHECKS.json) · [render comparisons and inspection](integration-2026-11-22/VISUAL-CHECKS.json) · [browsing-copy checks](integration-2026-11-22/READING-COPY.json) · [navigation](NAVIGATION-PDF-CHECKS.json) · [sequence](SEQUENCE-CHECKS.json).

The current picture-selection/page-design review and integration are complete. Overall image production is not declared complete while the title/cover resolution decisions remain. The conditional print-colour reminder is still pending. Metadata placeholders, final colour/print preparation, revised spine/template and supplier approval remain separate. The prior accepted physical proof was a 168-page production edition; this no-bleed screen PDF must not be uploaded as the print interior.

The in-chat upload attempt failed before tool discovery; the local browsing PDF and viewer are complete. [Delivery record](integration-2026-11-22/DELIVERY.json).

## Rebuild deliberately

`npm run book:preview` now uses the frozen 22 November manifest **offline**, without Vite, canonical JSON writes or guide catalogue export. It verifies source hashes, assembles approved native pages, creates the browsing derivative, audits resolution, compares rendered pages and installs the checked result. Actual changed renders still require visual inspection; a rebuild resets that status to pending.

The first manifest preparation is already complete. Do not rerun `prepare-approved-integration-2026-11-22.py` against the new book or run older contents/index/assembly workflows over the approved pages. For new changes, first bind the separately approved source deliberately. Installation rejects an unrecognised current-book hash. Native candidates are written atomically so the installed book survives failed rebuilds.

The [prior complete book](integration-2026-11-22/before-book.pdf), its six metadata records and every approved component proof are preserved. The earlier [15 November introduction integration](integration-2026-11-15-introduction/INTEGRATION-CHECKS.json) and [3 November assembly](integration-2026-11-03/INTEGRATION-CHECKS.json) remain historical evidence. Supplier files, canonical gardening data and the completed promotional project are unchanged.
