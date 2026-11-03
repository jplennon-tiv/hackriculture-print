# Book index

The current index is in the [full preview](../whole-book-order-preview/REVIEW.html#spread=87)
at **172–175**. It has **307 entries and 36 see references**, four pages at the
approved 9.45 pt reading size. All original terms are retained, plus five approved
reader-edit entries and eight terms for the nutrient page. The follow-on crops
entry also links to the two-page rotation spread. The 30 October integration adds
11 terms for Netting and Supports, and seven crop/problem references.

The 2 November integration adds Acid soil, Alkaline soil, Garden lime, Liming,
pH, soil, and Soil testing, all pointing to page 152. Clubroot and Common scab
retain their diagnostic destinations and also link to the new page’s cautions.
[Guarded save](../whole-book-order-preview/integration-2026-11-02/BOOK-COPY-UPDATE.json).

The 3 November turf integration adds Turf, lifting and reusing; Loam, from turf;
Lawn, converting to vegetables; and Grass, removing (see Lawn). Page 162 is also
added to the existing double-digging, potting-mix and new-plot weed entries.
The [guarded save](../whole-book-order-preview/integration-2026-11-03/BOOK-COPY-UPDATE.json)
preserves the exact prior contents/index bytes.

The [12 October approval](APPROVAL.json) and [standalone review](REVIEW.html) are
preserved source evidence: 273 entries / 33 see references with historical T/C
labels. They are not the current full-book folios or a pending task.

## Editable terms and rebuild

Shared [index.json](../../../../hackriculture-data/book-layout/index.json) stores
terms, stable IDs, source locators and “see” destinations, never page numbers.
AI/app changes use `saveBookLayout({index}, {expectedRevision, actor})`, preserving
unknown fields and exact prior bytes. Condition references use the approved Troubles condition-page map and verify their exact explanation heading in the actual PDF, not an incidental mention. The 31 October integration refreshes all these locations and later topic folios; no index JSON edit was required. An optional zero-based `pageOffset` locates
advice within a multi-page source; omission indexes the whole source. The shared
writer validates integer shape and the resolver checks actual PDF bounds. Broken aliases, unknown sources and changed
PDF hashes stop the build. Crop guides and condition entries remain substantive
index targets; varieties and passing mentions are not exhaustively indexed.

With loopback Vite running, `npm run book:index` builds the current numeric index
against the contents plan and approved source PDFs. `npm run book:preview` includes
this stage and assembles the full book. Do not invoke the older standalone command
against the original plan: it lacks the newly approved topics.

Current [resolved references](../whole-book-order-preview/index/RESOLVED.json) and
[fit checks](../whole-book-order-preview/index/CHECKS.json) belong in the full-book
folder. Both units resolve independently and currently match. If they diverge,
the builder stops before export. Exact condition headings, all numeric references
and actual PDF link destinations are verified during integration.

The two-column cream-paper design retains forest-green text, orange references,
ruled letter headings and mirrored 17/8 mm margins. Short letter groups stay
together; longer groups use continued headings. The index forms two facing spreads, 172–173 and 174–175, followed by the
end balancing blank 176. Full-book links jump to its own pages, including “see”
destinations. The current integrated stylesheet retains the 7 mm column gap,
reduced space around letter headings, 9.45 pt type and 1.28 line spacing. It
removes the former 0.3 CSS px extra paragraph gap to fit all 307 entries in four
pages. No index terms or reading type have been reduced.
No frozen approval files or source stylesheets have been overwritten.
