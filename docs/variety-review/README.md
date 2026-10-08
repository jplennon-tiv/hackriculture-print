# UK variety refresh

Installed 1 October 2026 after John approved the general listings/rankings,
requested Blue Lake in print, asked for the beetroot repair, and confirmed that
the full reserve catalogue must be retained and maintained.

Open the [searchable review](REVIEW.html), which links the six individual
two-page representative PDFs in their checked units.
John approved the final corrected proofs on 1 October: “That's better - all
looks good now.” Initial capitals are applied in the print template and review
list, with F1 and mixed-case spellings preserved. No full catalogue export was run.

## Installed changes

- Reviewed all 44 guides; changed the 43 with variety lists. All **626 existing
  entries remain**, with **68 additions** and **183 printed choices**. These
  counts include crop types and seasonal duplicate records, not 694 distinct cultivars.
- Blue Lake is rank 9 and appears first in French beans. Its summary explains
  green pods and dried white haricot beans. The RHS confirms both uses:
  [plant profile](https://www.rhs.org.uk/plants/199447/phaseolus-vulgaris-blue-lake/details).
- Beetroot retains its valid nested globe/colour groups. The print adapter now
  reads arbitrary group depth: all 13 old entries plus Pablo F1 are eligible.
  The printed five are Boltardy, Pablo, Cylindra, Chioggia and Forono.
- The same generic adapter respects `character.short_text` in metadata-style
  garlic/fennel entries and prints identical cultivar names only once across
  seasonal groups. Source records remain separate. No crop-specific rendering
  conditional, schema change, artwork change or new layout template was needed.
- Existing full practical descriptions and unit pairs remain. Approved concise
  descriptions use `short_text`; a small number of unsupported superlatives were
  corrected in full descriptions. Original wording is retained in the decision
  ledger and exact-byte backups. Celery and Potato summaries were further
  shortened after measured overflow, retaining every selected variety.
- Existing per-guide `variety_count` selects the approved shortlist plus Blue
  Lake. All other layout choices and all non-variety crop advice remain unchanged.
  Runtime: `richer-a-v5-variety-case`; legacy extraction adapter v10.
  Saved Richer A content remains compatible with `richer-a-v2-editorial-fill`.

## Evidence and maintenance limits

The live, field-level [decision ledger](../../../hackriculture-data/planning/variety-refresh/DECISIONS.json)
records paths, prior/new ranks, descriptions, reasons and source links. It is a
maintenance record, not a replayable migration. Do not rerun temporary preparation
scripts over the installed catalogue.

Core ranks 7–10 reflect the approved UK selection. Supported alternatives are
rank 6. **380 legacy entries have provisional rank 4** because the checked crop
sources did not establish current availability/popularity; this is explicitly
not a finding that they are discontinued. Eighteen crop-type/reference entries
have rank 3. The duplicated seasonal Greyhound record retains its cultivar rank
but occupies no second print slot. Reserve checking is an evidence triage, not
an exhaustive supplier census or proof of market share. Revalidate full legacy
descriptions and uncertain names before making extended variety sheets.

Sources include RHS, Charles Dowding, independent UK suppliers, and Suttons,
Dobies and Thompson & Morgan (counted as one commercial group). The additional
[Kings 2026 commercial catalogue](https://www.kingsseedsdirect.com/images/uploaded/Catalogue%20Request/Pdf/2026-commercial-seed-catalogue.pdf)
supports reserve availability checks; absence from it did not establish extinction.
Cheltenham Green Top remains a supported alternative despite its age. Kings
explicitly offers Gowrie in place of Ruby swede; Ruby is retained at lower priority.

Telegraph/Telegraph Improved, Marketmore/Marketmore 76, and French Breakfast/French
Breakfast 3 remain separate because exact strain equivalence was not established.
All Green Bush's marrow/courgette placement remains a recorded identity question.
Mushroom has no cultivar list: the three species/kit suggestions remain research
options, pending a separate cultivation-content decision.

## Checks and rollback

Final fit pass after John approved the capitalisation correction: all 44 guides
in both units pass (88 checks, 176 A4 DOM pages; 38.84 seconds). No overflow,
warnings, missing images or font-loading failures. Footer clearances match the
preceding checks, including the recorded whitespace exceptions. No content or
layout adjustment was needed, and the canonical source revision is unchanged.
This pass did not export physical PDFs. See [current fit results](DOM-CHECKS.json).

Capitalisation follow-up: five focused variety tests pass. Beetroot and French
bean PDFs were refreshed in both units (two pages each, no warnings or missing
images/fonts); all four affected front pages were visually checked. Review
thumbnails and names were refreshed. This is display formatting only: canonical
keys, ranks, descriptions and the installed data revision remain unchanged. The
broader checks below describe the preceding variety installation.

- Nine focused variety/adapter tests and TypeScript pass.
- All 88 guide/unit DOM checks pass, with no warnings, missing images or font
  failures. These are not 88 physical PDF checks.
- Six representative PDFs pass: French beans and Beetroot in both units,
  Celery and Potato in metric. All are two A4 pages; all twelve pages were
  visually inspected. Individual PDFs are retained, following the print contract.
- `npm test`: 40 pass, one pre-existing failure. Mushroom's saved
  `ai_print_layout.value.intro_sentences` exceeds the schema maximum of 12.
  Its record is byte-identical to the pre-task snapshot. All 43 changed records
  validate; no new whole-store schema error was introduced.
- Parsnip and Rhubarb have first-page gaps of 10.6 and 11.1 mm. Their shorter
  approved lists are retained without padding them with uncertain varieties.
  Mushroom's larger existing first-page gap is unchanged. No font/art resizing.

[Checks](CHECKS.json), [DOM results](DOM-CHECKS.json), and the
[save receipt](SAVE-RECEIPT.json) record the evidence. The receipt contains four
guarded transactions and their exact prior-byte backup paths, including the
initial 43-record rollback. All prior bytes were verified with SHA-256. The final
installed revision is
`f15430f54b6011a7c68ea5b9448a091277f368a362a1df006172addc6d8bde64`.
Read the live revision before a future save; never reuse it blindly.
