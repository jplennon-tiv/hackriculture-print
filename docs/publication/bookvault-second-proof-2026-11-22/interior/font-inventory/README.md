# Font additions and fraction cleanup — 23 November 2026

John asked which fonts had been added since the successful October upload, then instructed that a font used for only two fractions should be replaced. The comparison found **two added variants**, not two new families:

| Added variant | Actual use in the current 174-page interior |
| --- | --- |
| Nunito Sans SemiBold | Page 1: “Traditional measurements edition”; pages 2–3: contents entries. |
| Lucida Grande Regular | Only **⅝**, once on Leek page 61 and once on Onions and Shallots page 67. |

Lilita One, the other Nunito Sans weights and **Lucida Grande Bold** were already present in the accepted October PDF. No named variant was removed. [Comparison script](compare-fonts.py) and [complete inventories](COMPARISON.json) recover names from FontDescriptor as well as BaseFont; Poppler alone lists many Type3 resources as unnamed. The conversion removes Lucida Regular’s descriptor name, leaving its two self-contained glyph resources unnamed. This makes it a specific candidate to isolate, **not the proven font behind Bookvault’s “Unknown” error**. The accepted PDF also contains many unnamed Type3 resources.

## Completed cleanup

[Vegetable-Guru-Interior-Nunito-Fractions.pdf](../../../../../output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Nunito-Fractions.pdf) is the separate revised 174-page supplier candidate: **206,403,322 bytes**, SHA-256 `a7af3c88d43d7671a7e4904269f30af350b9be9194ea2dd74c4ccc09b1435b12`.

Both **⅝** characters now read **5/8**, using the existing 9 pt Nunito Sans Regular already embedded on each page. This also matches the quick-facts notation on the facing pages. The quantity is unchanged. No font is imported, and the two Lucida Grande Regular font resources and their unused glyph objects are removed. SemiBold and the existing Lucida Grande Bold remain unchanged.

Review [Vegetable-Guru-Fraction-Font-Checks.pdf](../../../../../output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Fraction-Font-Checks.pdf): four exact pages, 60–61 and 66–67, 4.56 MB. [Before/after detail](Fraction-Before-After.jpg), [Leek spread](spread-60-61.jpg), [Onions and Shallots spread](spread-66-67.jpg).

[Replacement script](replace-fractions.py) is tied to the exact rejected PDF/X-1a source checksum. [Change receipt](FRACTION-REPLACEMENT.json), [verification script](verify-fractions.py), [page checks](FRACTION-CHECKS.json) and [independent checks](INDEPENDENT-CHECKS.json) record:

- All 174 page boxes, metadata and the exact FOGRA39 output intent retained; all retained font and artwork resources unchanged.
- All 172 unaffected page instruction streams unchanged. Extracted text on all pages matches except the two specified fraction substitutions.
- At 300 dpi, zero changed pixels outside the two edited line suffixes. Following lines retain exact positions. Both full spreads and before/after details visually inspected; neither replacement clips or collides.
- Font resources reduced from 1,043 to 1,041. No remaining five-eighths fallback resource. Independent Poppler font listing and Ghostscript full-file parse are recorded alongside the checks; local checks do not establish supplier acceptance or certified PDF/X conformance.

**Uploaded once — Failed.** John reported the failure; a freshly reloaded File Processing Logs view independently confirms **Failed** for this exact filename, logged **23 November 16:40**. The earlier Pending screenshot is retained as intermediate evidence. The current history view gives no detailed rejection cause or final subcheck results, so do not carry the previous PDF/X-1a font message forward as a newly observed error. [Upload record](UPLOAD-RESULT.json) · [failed-log screenshot](Bookvault-Nunito-Fractions-failed.jpg). Removing Lucida Grande Regular alone was insufficient. All six attempts through this fraction test Failed. The cover remains Approved; the later authorised Bold upload is tracked separately below. No order/payment, support message or proof-responsibility acceptance.

## Proposed next font test

**Authorised, completed locally, uploaded once and Failed:** see the [Bold substitution and current supplier result](../semibold-retry/README.md).

John asked what title elements use Nunito Sans SemiBold and whether another font could replace it. [Exact element mapping](SEMIBOLD-ELEMENTS.json): page 1 uses it only for **Traditional measurements edition**; pages 2–3 use it for ordinary contents labels. The main title and Contents headings use Lilita One; the subtitle and author use Nunito Sans ExtraBold; copyright/ISBN use Nunito Sans Regular; contents section headings and page references use Nunito Sans Black.

**Nunito Sans Bold** was the selected substitute: the same family, one step heavier, and already present in both the accepted October PDF and the current book. The authorised replacement affects those three pages and retains the 5/8 correction. Text widths and actual pages passed local checks; its single upload Failed. John then requested the [all-300-dpi raster test](../all-300dpi-retry/README.md). Neither newness nor the supplier’s previous “Unknown” message proves SemiBold is faulty.

Blanket outlining has not been performed. Original reading master, approved source PDFs and canonical gardening data remain untouched; future production regeneration must reapply this notation fix and any retained Bold substitution rather than reintroduce either dependency. App tests and metric export are not applicable to this two-line PDF change.
