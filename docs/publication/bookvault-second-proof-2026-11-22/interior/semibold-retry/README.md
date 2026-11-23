# Nunito Sans Bold substitution — 23 November 2026

**PDF cleanup, 23 November:** obsolete diagnostic PDFs marked below were removed at John's request. [Removal manifest and preserved files](../../../../maintenance/pdf-cleanup-2026-11-23/README.md). Historical results, hashes, recipes and screenshots remain evidence; do not rerun completed upload tests or treat their retired outputs as current files.

John authorised the proposed substitution with “Ok, let's do that.” It changes only the **Traditional measurements edition** line on page 1 and **81 ordinary contents labels** on pages 2–3. Lilita One headings, section headings, references, subtitle, author, copyright, artwork and all other pages retain their existing type. The prior **⅝ → 5/8** correction is retained.

**Supplier status: Failed, logged 23 November 18:03.** John reported the failure; saved File Processing Logs independently confirmed it at 18:19. No detailed rejection cause was exposed. [Failed screenshot](Bookvault-Nunito-Bold-failed.jpg) · [result record](UPLOAD-RESULT.json). All seven replacement-interior tests through this attempt Failed; cover Approved. The next user-requested test reduces [all remaining raster artwork to 300 dpi](../all-300dpi-retry/README.md). Removing both newly added named font variants was insufficient; neither is proven to be the cause. No order, payment or proof-responsibility acceptance.

## Files and source

- Complete 174-page candidate (retired PDF): **206,404,140 bytes**, SHA-256 `9219a432b1be214452b48bbc68487c81f44affde17766ae56b28a7820a715243`.
- Three-page review PDF (retired PDF): exact pages 1–3, 6.16 MB.
- [Contents spread](Contents-Bold-Spread.jpg), [title page](page-1-after.jpg), [before/after detail](Bold-Before-After.jpg).

The source is the exact failed Nunito-fractions PDF, hash `a7af3c88d43d7671a7e4904269f30af350b9be9194ea2dd74c4ccc09b1435b12`. Existing embedded Bold subsets do not collectively provide a single reusable complete alphabet. The [replacement script](replace-bold.py) instantiates the project's original [Latin Nunito Sans variable font](../../../../../public/fonts/richer-a-6.woff2) at **wght=700**, using installed HarfBuzz/FreeType. It corrects static naming/style metadata and embeds an actual TrueType Bold subset with all needed characters. It does not simulate bold or outline other lettering. [Original font licence](../../../../../public/fonts/nunitosans-OFL.txt).

The title edition line is recentered by its new advance width without moving any other text. Contents retain original left edges, sizes, baselines and spacing. The isolated *fl* ligature in Cauliflower is encoded as ordinary f/l, preserving the word and its existing ActualText. The following fragment is shifted by the width difference; surrounding rows remain fixed. Both old SemiBold font programs and unused objects are removed.

## Checks

[Change receipt](REPLACEMENT.json), [verification script](verify-bold.py), [174-page checks](CHECKS.json), [independent checks](INDEPENDENT-CHECKS.json) and [visual review](VISUAL-REVIEW.json) record:

- All 174 page boxes, logical text, retained font/image resources, metadata and exact FOGRA39 output intent match the source.
- All **171 unaffected page instruction streams** are byte-identical. At **300 dpi**, each changed page has **zero changed pixels outside the intended text regions**.
- All 81 contents labels fit. The smallest gap to a page reference is **5.73 pt**. Cauliflower remains intact; title edition line is centred.
- **No SemiBold resources** remain; the new Bold resource has weight 700 and an embedded TrueType program. No five-eighths fallback returns.
- Poppler reports all **1,040 font resources embedded**. Ghostscript reads all 174 pages without an error. These local checks do not certify PDF/X conformance or establish supplier acceptance.

The approved reading master, exact source PDFs, cover, generator and canonical data are preserved. Reapply both font cleanups to any future production regeneration if this candidate is retained. No app tests or metric export are needed for this isolated production-PDF test. Neither the earlier “Unknown” message nor a failed substitution alone identifies the offending font.
