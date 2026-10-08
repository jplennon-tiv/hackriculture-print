# Onions and Shallots: seed and set methods

John approved the final changes on 1 October 2026: “That's good - I approve
the changes.” The separate seed/set routes, four final illustrations and explicit
March–April set-planting caption are approved and installed in both A4 editions.
Proof and artwork hashes are recorded in the [central approval manifest](../redesign-rollout/APPROVAL.json).

The existing two-page guide now presents **From seed** and **From sets (small
bulbs)** as separate routes. Four transparent illustrations show shallow sowing,
young seedlings, a set with its tip showing, and an onion bulb beside a shallot
cluster. At John’s follow-up request, the set caption now gives March–April
explicitly. This is the practical month range for the RHS early-to-mid-spring
window for both crops. Both PDF editions were regenerated and the changed second
pages visually checked. Each route carries its relevant timings and spacing. Indoor modules,
salad onions and overwintering qualifications remain explicit. Quick Facts now
says **Seed depth** and distinguishes seed-grown plants, sets and module clumps.

Research was RHS-first: [onions](https://www.rhs.org.uk/vegetables/onions/grow-your-own)
and [shallots](https://www.rhs.org.uk/vegetables/shallots/grow-your-own), checked
against Kings Zebrune seed instructions and DT Brown sets advice. Detailed source
findings, practical rounding decisions, illustration attribution and asset hashes
are in [SOURCES-AND-ART.json](SOURCES-AND-ART.json).

Only the canonical `onion_shallot` record changed, via the guarded shared writer.
Full master notes are retained; ambiguous spring-planted wording and shallot
spacing were clarified. A `seed_sowing` section and source-linked print groups
carry the two methods. The redundant print-only sowing notes are empty because
that advice is now placed beside its method. Existing key notes and Final Tips
were rechecked against the changed source. The [save receipt](SAVE-RECEIPT.json)
identifies the exact previous-byte backup and installed revision.

The shared renderer has one optional, data-driven grouping path in
`PlantingSection.tsx`; no onion-specific branch was added to the page template.
Types, schema, admin validation and source fingerprints accept complete unit text
pairs and route notes. Changing their source measurements invalidates the review.
Ordinary guides retain their existing stage sequence and measurements. Runtime
revision is v3; approved v2 content-layout companions remain compatible.

Verification:

- 81 focused planting/redesign tests; TypeScript check and diff whitespace check.
- [Onion smoke checks](SMOKE-CHECKS.json): metric and imperial, two physical A4
  pages each; no errors, warnings or missing fonts/images.
- [Proof checks and PDF hashes](PROOF-CHECKS.json): all four PDF pages visually
  inspected. Page-two footer clearance is 5.42 mm in both units. Page one remains
  close at 1.77 mm but passes the renderer and is visually clear.
- [Carrots check](CARROT-CHECK.json): one metric A4 PDF, two pages, no warnings.
- Ten pest rows, full-width tips, all six variety entries and page numbers 57–58
  retained. A5/A6 and a fresh full catalogue export were not checked.

Finished proofs:
[metric A4](../../output/pdf/onion-planting/onions-and-shallots-metric-A4.pdf) and
[imperial A4](../../output/pdf/onion-planting/onions-and-shallots-imperial-A4.pdf).
The saved September batch predates these changes. Historical approved proofs and
the two older illustrations they reference are preserved.
