# Development guide

## Architecture

React 19, TypeScript and Vite provide the local app. React Router handles public, admin and print routes. Exact dependency versions are in `package.json` and the lockfile.

| Owner | Responsibility |
| --- | --- |
| `src/App.tsx`, `src/components/` | Routing, crop/trouble views, navigation, units, paper and batch controls |
| `src/admin/` | Password-gated editing, field editors and image uploads |
| `adminApiPlugin.ts` | Local `/api/admin/*` middleware, validation, shared JSON writes and versioned backups |
| `pdfPlugin.ts` | Sole PDF renderer; Playwright Chromium loads local print HTML |
| `src/pdf/` | PDF request/download interface |
| `src/print/PrintVegetablePage.tsx`, `PrintTroublePage.tsx` | Printed content |
| `src/print/print.module.css` | Print styling |
| `src/print/useVegetableLayout.ts` | DOM measurement, readiness and fitting phases |
| `src/print/vegetableLayout.ts` | Pure fitting rules and limits, with neighbouring tests |
| `src/lib/` | Shared ranking, slug, unit, measurement, month, duration and fact helpers |
| `public/` | Runtime illustrations and icons |

Admin middleware resolves the sibling data folder from the configured Vite project root. No database is involved. Vite allows the imported shared JSON files without exposing the shared backup folder. Both admin and PDF plugins require the development server; PDF endpoints are unauthenticated and must remain local-only.

## Accepted print design

Page one uses a staggered grid: introduction and hero interlock above Quick Facts/Core Needs on the left, with sowing/harvest calendar and varieties on the right. Retain original borders, dark headings, tinted variety tables and coloured Key Risks. The borderless experiment was rejected.

The 19 Quick Facts icons have SVG masters and transparent 384px PNG exports in `public/images/quick_facts/trial/`. Printed icons display at 28px. `src/lib/quickFactIcons.ts` owns context-sensitive selection and legacy paths; see the [icon guide](public/images/quick_facts/trial/README.md).

Core Needs uses 1–5 scores for sun, water and nutrition: PNG icons/five-cell bars in print, shared SVG/continuous bars on public pages.

`src/print/heroImageCrops.json` maps originals to lossless crops and records dimensions. Cropping trims fully transparent margins, retains a 2% border and checks retained RGBA pixels without resampling. Originals remain intact. Use crop dimensions to recover space without shrinking illustrations.

The intro fitter adds whole sentences to the same introduction after assets are ready, with bounded rollback when space runs out. There is no separate continuation below Core Needs.

Page two uses the approved illustrated **existing-column** planting card for active crops; Final Tips stays full-width. `plantingIllustrations.ts` owns layout/measurement bindings; `PlantingCard.tsx` and `planting.module.css` render the widget. Normal fit uses bounded images and optional notes without trimming neighbouring advice. Review-only layouts require the explicit review query. Missing art falls back to text; stale captions, missing required measurements and unresolved normal-layout overflow block production export. See [implementation](docs/planting-illustrations/IMPLEMENTATION.md).

## Data contracts

Read [SHARED-DATA.md](SHARED-DATA.md) for paths and ownership. Preserve these rules when editing data or validators:

- Vegetables and troubles are keyed objects. Preserve unknown fields and opaque `group_overview` content during round trips.
- Keep `src/types.ts`, `src/schema.ts` and hand-written admin validation aligned. Zod warns at boot and rejects invalid saves.
- Ranked text can be `{text, rank, star?, short_text?, icon?}` or plain strings. Preserve ranks and existing filtering. `hero_header` is the short print lead, separate from difficulty/ease data.
- Measurements may be strings, `{imperial, metric}` pairs, variety-keyed values or null. Use `src/lib/measure.ts`. Unit selection does not rewrite prose; sowing-diagram geometry deliberately uses imperial values while labels reflect selected units.
- Calendar values are `--MM` fragments and inclusive cyclic ranges, not timestamps. Use `harvest_time`, not obsolete picking/cutting/lifting/pulling keys. Structured durations and seasonal ranges are distinct concepts.
- Vegetable routes derive from slugified display names; trouble routes use guide keys. Reuse `src/lib/slug.ts`. Broad bean's current key/route is `bean_broad`.
- Optional `print_planting` stores granular print steps, supplementary text, source references, reviewed optional note paths and a source fingerprint. It supplements, never replaces, original gardening text. The admin JSON editor and explicit review confirmation support human edits; normal export never calls AI. Measurements are read live via explicit stage/variety bindings, not copied into captions. Referenced advice changes require caption review; number changes flow through automatically.

## Verification

Run focused checks after changes, then `npm test` and `npm run build` for code work. `src/data.integrity.test.ts` validates shared data and the absence of mirrors. `src/admin.shared-data.test.ts` exercises save and vegetable/trouble image mutations using disposable sibling directories; never test writes against the real master.

For print changes, run `node scripts/check-transfer.mjs` with the local server running and visually inspect the resulting PDFs. It checks chicory, carrot, broad bean and lettuce in imperial/metric A4, plus a trouble PDF and login. Its two-page expectation applies to those crops only. Add targeted A5/A6 checks when paper sizing changes; avoid full-catalogue generation for routine work.

The renderer uses a 688 × 979 viewport and waits for `document.body.dataset.printReady === "true"` or a non-empty `printError`. Errors stop export (single endpoint: HTTP 422; batch: per-crop failure). Preserve font/image readiness, bounded fitting, React StrictMode replay handling and conservative page budgets. Browser height does not prove PDF pagination. A5/A6 request scaling, but visual review found the existing fixed-A4 CSS page setup does not preserve the intended layout reliably; use A4 for reviewed output pending separate paper-size work.

PDF endpoints: `GET /api/pdf/vegetable/:slug`, `GET /api/pdf/trouble/:slug`, `POST /api/pdf/batch`. See [SETUP.md](SETUP.md) for parameters and commands.

Batch includes the approved cover first: `public/front-matter/cover-A4.pdf` is copied byte-for-byte to `output/00_cover_A4.pdf` and counted as a normal progress item. Cover failure is reported without stopping crop/trouble jobs. It always remains A4, independent of unit/paper selectors. Artwork lives in `public/images/front-matter/`; rebuild only after approved design edits with `node scripts/build-front-cover.mjs`. No generation or remote fonts are needed for the batch cover copy. See `public/front-matter/README.md` for source ownership.

## Asset maintenance

- `node scripts/crop-hero-images.mjs` defaults to chicory; it also accepts stable crop keys or `--all`. Inspect before broad runs. It uses sharp and rewrites generated crops/the crop manifest; regenerate only affected crops after replacing originals.
- `node scripts/render-quick-fact-icons.mjs` exports SVG masters using installed Chromium. Inspect transparency and legibility at actual print size after edits.
- Some asset paths are constructed dynamically; text searches alone do not prove an image is unused. Preserve original image quality and avoid speculative cleanup.

## Current baseline and limitations

Current rollout checkpoint (18 September): illustrated POC output exists for all 44 crops, with 29 normal-active and 15 review-only layouts. [Final batch](docs/planting-illustrations/ROLLOUT-06.md) records basic readiness checks, pagination warnings and restore points. The user explicitly requested no regression suites or exhaustive proofing for these routine additions. `plantingReview=1` on the print page includes staged layouts and bypasses fit rejection only, with visible REVIEW labels; normal PDF endpoints retain their guards. Original source text and padding are unchanged. Earlier checks below are historical, not rerun claims.

Earlier pilot verification: 16 September 2026, Node 24.20.0. All 159 tests and the TypeScript/Vite build passed. Five planting pilots produced 30 two-page PDFs across both units and A4/A5/A6; page-one text, baseline visible planting notes and neighbouring advice were retained. All A4 pilot backs and metric fronts were visually reviewed. The transfer smoke check also passed four representative crops in both units, a trouble PDF and login. Admin write/backup and batch error handling were checked against temporary fixtures; missing-art and source-change guards passed browser fault injection. No full-catalogue live batch was generated. Smaller-paper page counts pass but visual quality has the limitation below.

Known issues, to address only within requested scope:

- Some page-two overflow and unused Core Needs space remain; capsicum has previously produced three pages.
- Some prose still contains imperial quantities in metric mode.
- A5/A6 currently leave excessive whitespace and undersize text (observed in carrot/chicory exports); two-page/content checks do not imply visual approval. Paper-size CSS/renderer settings predate the planting widget and remain unchanged.
- Ten missing trouble-image references are listed in `TRANSFER-MANIFEST.json`.
- Inter and Playfair Display are fetched from Google Fonts; fully offline typography is not packaged and font timing can affect layout.
- The build emits a large-chunk warning. The last dependency audit reported one moderate and five high advisories; remediation remains separate work.

Maintain this current summary when the implementation changes. Put historical logs in backups rather than extending the working guide with repeated session notes.
