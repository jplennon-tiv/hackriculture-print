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

## Data contracts

Read [SHARED-DATA.md](SHARED-DATA.md) for paths and ownership. Preserve these rules when editing data or validators:

- Vegetables and troubles are keyed objects. Preserve unknown fields and opaque `group_overview` content during round trips.
- Keep `src/types.ts`, `src/schema.ts` and hand-written admin validation aligned. Zod warns at boot and rejects invalid saves.
- Ranked text can be `{text, rank, star?, short_text?, icon?}` or plain strings. Preserve ranks and existing filtering. `hero_header` is the short print lead, separate from difficulty/ease data.
- Measurements may be strings, `{imperial, metric}` pairs, variety-keyed values or null. Use `src/lib/measure.ts`. Unit selection does not rewrite prose; sowing-diagram geometry deliberately uses imperial values while labels reflect selected units.
- Calendar values are `--MM` fragments and inclusive cyclic ranges, not timestamps. Use `harvest_time`, not obsolete picking/cutting/lifting/pulling keys. Structured durations and seasonal ranges are distinct concepts.
- Vegetable routes derive from slugified display names; trouble routes use guide keys. Reuse `src/lib/slug.ts`. Broad bean's current key/route is `bean_broad`.

## Verification

Run focused checks after changes, then `npm test` and `npm run build` for code work. `src/data.integrity.test.ts` validates shared data and the absence of mirrors. `src/admin.shared-data.test.ts` exercises save and vegetable/trouble image mutations using disposable sibling directories; never test writes against the real master.

For print changes, run `node scripts/check-transfer.mjs` with the local server running and visually inspect the resulting PDFs. It checks chicory, carrot, broad bean and lettuce in imperial/metric A4, plus a trouble PDF and login. Its two-page expectation applies to those crops only. Add targeted A5/A6 checks when paper sizing changes; avoid full-catalogue generation for routine work.

The renderer uses a 688 × 979 viewport and waits for `document.body.dataset.printReady === "true"`. Preserve font/image readiness, bounded fitting, React StrictMode replay handling and conservative page budgets. Browser height does not prove PDF pagination. A5/A6 proportionally scale the A4 layout.

PDF endpoints: `GET /api/pdf/vegetable/:slug`, `GET /api/pdf/trouble/:slug`, `POST /api/pdf/batch`. See [SETUP.md](SETUP.md) for parameters and commands.

## Asset maintenance

- `node scripts/crop-hero-images.mjs` defaults to chicory; it also accepts stable crop keys or `--all`. Inspect before broad runs. It uses sharp and rewrites generated crops/the crop manifest; regenerate only affected crops after replacing originals.
- `node scripts/render-quick-fact-icons.mjs` exports SVG masters using installed Chromium. Inspect transparency and legibility at actual print size after edits.
- Some asset paths are constructed dynamically; text searches alone do not prove an image is unused. Preserve original image quality and avoid speculative cleanup.

## Current baseline and limitations

Last application verification: 14 September 2026, Node 24.20.0. All 133 tests and the TypeScript/Vite build passed. Four representative crops produced eight two-page A4 PDFs with loaded images; the trouble PDF and login passed. Admin write/backup behaviour was checked against temporary fixtures. This is not a full-catalogue or A5/A6 audit.

Known issues, to address only within requested scope:

- Some page-two overflow and unused Core Needs space remain; capsicum has previously produced three pages.
- Some prose still contains imperial quantities in metric mode.
- Ten missing trouble-image references are listed in `TRANSFER-MANIFEST.json`.
- Inter and Playfair Display are fetched from Google Fonts; fully offline typography is not packaged and font timing can affect layout.
- The build emits a large-chunk warning. The last dependency audit reported one moderate and five high advisories; remediation remains separate work.

Maintain this current summary when the implementation changes. Put historical logs in backups rather than extending the working guide with repeated session notes.
