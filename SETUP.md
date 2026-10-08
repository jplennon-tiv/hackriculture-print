# Local operation

## Runtime and dependencies

Working folder: `/Users/johnlennon/Documents/web_site/hackriculture-print`. Keep `hackriculture-data` beside it. Node 24.20.0 is installed through nvm and pinned in `.nvmrc`; dependencies and Playwright Chromium are installed on this Mac.

For maintenance commands in Terminal:

```sh
cd /Users/johnlennon/Documents/web_site/hackriculture-print
source "$HOME/.nvm/nvm.sh"
nvm use
```

Only if dependencies or the browser need installing again:

```sh
npm ci
npx playwright install chromium
```

These commands may download packages/browser files. Preserve the lockfile; do not use `sudo npm`, speculative dependency upgrades or `npm audit fix --force`.

## Start and stop

```sh
zsh start.command
```

Alternatively, double-click `start.command` in Finder. The launcher selects the pinned Node version, checks the shared data files, and asks for a non-empty admin password with hidden input. The password stays in the server process environment for that session. An existing `ADMIN_PASSWORD` environment value takes precedence.

Open [the app](http://127.0.0.1:5173) and use the same password at [admin login](http://127.0.0.1:5173/admin/login). Keep Terminal open and press Control-C to stop. Restart to choose a new session password. If an assistant started a temporary verification server, stop that identified server before launching your normal session.

The launcher binds to `127.0.0.1:5173` and refuses an occupied port. Identify the owner before stopping an existing process. The website can use port 5175 when both projects run.

Use the launcher for normal work: direct startup without a session password allows legacy fallback authentication. This is a local editor, not an internet-facing service. `npm run preview` and static hosting do not provide admin saves or PDF generation.

## Quick POC checks

```sh
npm test                              # small data/layout suite
npm run test:focused -- src/lib/months.test.ts
node ../hackriculture-data/scripts/verify-data.mjs
```

For editable opening/cover JSON in `../hackriculture-data/book-layout/`, use
`npm run book:check` without a server. With `start.command` running,
`npm run book:build` rebuilds only the seven opening pages in both editions into
separate working proofs. See the [editing guide](../hackriculture-data/book-layout/README.md)
and [PDF checks](DEVELOPMENT.md#editable-book-copy). It does not rebuild guides,
reassemble a full book or change lettering inside the raster cover concepts.

For retained A4, with start.command running, use the affected crop:

```sh
npm run check:fit -- carrot            # HTML sizing/readiness only
npm run check:smoke -- carrot          # same checks + one metric A4 PDF
npm run check:smoke -- garlic --units=both
```

Smoke checks cover admin login, page readiness, loaded fonts/images, browser
errors and actual two-page PDF output. They reuse `output/smoke/`; no screenshots,
combined packs or catalogue runs. Warnings are reported separately from errors.
Use one crop/unit by default; add coverage only when the change requires it.

For the compact book, use an affected real API PDF with `paper=185x240` and the
book-profile checks in [DEVELOPMENT](DEVELOPMENT.md#compact-book-exports).
`check:fit` / `check:smoke` above remain A4 checks even though the app default is
compact. Check both units for wrapping/measurement changes. Ordinary compact
batch exports individual guide proofs; the separate production/assembly scripts
create review books. Read the handover before running those broader procedures.
Offline PDF inspection/assembly does not need Vite.

Optional broader checks: `npm run test:all`, `npm run check:types`, `npm run build`.
They are not required after every small POC change. Do not automatically repeat
full builds or multi-crop PDF exports. Documentation-only edits need link checks.

PDF parameters are `units=imperial|metric` and case-sensitive
`paper=185x240|A4|A5|A6`; `inline=1` opens a preview. Defaults are imperial and
185 × 240 mm (Compact Book v1). A4 remains the approved sheet design. Single
downloads go to the browser's download folder; A4 batches use `output/`, compact
guide batches use `output/book-185x240/<units>/`, and working complete books live
under `output/pdf/book-preparation/`. See the handover for exact current proofs.

## Troubleshooting

- Missing shared JSON: restore the sibling folder arrangement; do not create local copies. See [SHARED-DATA.md](SHARED-DATA.md).
- PDF errors: verify Chromium is installed and the launcher/dev server is running. The active Richer A and Open Editorial routes use packaged Lilita One and Nunito Sans under `public/fonts/`; check their loading before measuring. Some frozen references and legacy templates use online fonts.
- Unknown crop routes: use the display-name slug helpers; keys and slugs are not always interchangeable.
- Invalid data: diagnose against the shared contract and current revision first. Restore a verified backup only within an authorised recovery, preserving newer edits; stop only the identified server involved and use focused validation before restarting.
