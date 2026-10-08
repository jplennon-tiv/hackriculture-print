import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
import {build} from 'esbuild';
import {bookLayoutRevision} from '../../../hackriculture-data/lib/book-layout.mjs';
import {root, sharedRoot, sha256, escapeHtml, readBookContent, renderOpeningPages, renderEntryPages} from './book-content.mjs';

export async function buildBookPages(kind) {
  if (!['opening', 'entry'].includes(kind)) throw Error('Unknown book-page component');
  const args = process.argv.slice(2);
  if (args.some(a => !/^--units=(both|imperial|metric)$/.test(a)) || args.length > 1) throw Error('Use --units=both|imperial|metric (default: both)');
  const unitsOption = args[0]?.split('=')[1] || 'both';
  const editions = unitsOption === 'both' ? ['imperial', 'metric'] : [unitsOption];
  const relative = 'docs/publication/book-layout-working/' + kind;
  const dir = path.join(root, relative), out = path.join(root, 'output/pdf/book-layout-working');
  const scratch = path.join(root, 'tmp/pdfs/book-layout-working', kind);
  const start = kind === 'opening' ? 1 : 4, count = kind === 'opening' ? 3 : 4;
  const originalDir = `docs/publication/vegetable-guru-${kind === 'opening' ? 'opening' : 'entry'}-pages`;
  const css = originalDir + `/${kind === 'opening' ? 'opening' : 'entry'}-pages.css`;
  const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
  const python = process.env.BOOK_PYTHON || '/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
  const {data, revision, inputs, assets} = readBookContent();
  const approval = JSON.parse(await fs.readFile(path.join(root, 'docs/redesign-rollout/APPROVAL.json'), 'utf8'));
  const entry = approval.entryPages || approval.frontMatter?.entryPages;
  const protectedFiles = [...approval.compactEntryPages.files, ...[entry.contents, entry.howTo].flatMap(c => c.files)];
  const verify = async () => {
    for (const file of protectedFiles) if (sha256(await fs.readFile(path.join(root, file.path))) !== file.sha256) throw Error('Approved source changed: ' + file.path);
  };
  await verify();
  const planPath = 'docs/publication/book-preparation/ASSEMBLY-PLAN-BOOKVAULT.json';
  const planBytes = await fs.readFile(path.join(root, planPath)), plan = JSON.parse(planBytes);
  const themes = JSON.parse(await fs.readFile(path.join(root, 'src/print/familyThemes.json'), 'utf8'));
  await fs.mkdir(dir, {recursive: true}); await fs.mkdir(out, {recursive: true}); await fs.mkdir(scratch, {recursive: true});
  await fs.rm(path.join(dir, 'CHECKS.json'), {force: true});
  const receipt = {date: new Date().toISOString(), status: 'Working proof from editable JSON; not a new design or copy approval', supplier: 'Bookvault', trimMm: [185, 240], bleedMm: 3, physicalFolios: Array.from({length: count}, (_, i) => start + i), title: data.book.title, subtitle: data.book.subtitle, bookContent: {revision, inputs}, assemblyPlan: {path: planPath, sha256: sha256(planBytes)}, protectedApprovedFiles: protectedFiles, artwork: assets, results: []};
  const bundle = await build({entryPoints: [path.join(root, 'src/print/book/production.ts')], bundle: true, platform: 'node', format: 'esm', packages: 'external', write: false});
  const modulePath = path.join(scratch, 'production.mjs'); await fs.writeFile(modulePath, bundle.outputFiles[0].contents);
  const {finishProductionPages} = await import(modulePath);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({viewport: {width: 900, height: 1100}});
    await page.route('**/@vite/client', r => r.abort());
    for (const units of editions) {
      const rendered = kind === 'opening' ? renderOpeningPages(data, units) : renderEntryPages(data, units, plan, themes);
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="${escapeHtml(base)}/"><title>${escapeHtml(data.book.title)} · ${kind} pages · ${units}</title><link rel="stylesheet" href="/${css}"></head><body>${rendered.body}</body></html>`;
      const htmlPath = path.join(dir, units + '.html'); await fs.writeFile(htmlPath, html);
      await page.goto(base + '/' + relative + '/' + units + '.html'); await page.emulateMedia({media: 'print'});
      await page.evaluate(async () => {await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode()));});
      const checks = await page.evaluate(() => [...document.querySelectorAll('.sheet')].map(sheet => {
        const bounds = sheet.getBoundingClientRect(), content = sheet.querySelector('.content').getBoundingClientRect();
        const footer = sheet.querySelector('footer'), bottom = footer ? footer.getBoundingClientRect().top : bounds.bottom - 8 * 96 / 25.4;
        const overflow = [...sheet.querySelectorAll('li,.trouble-item,p,h1,h2,h3,dd,dt')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent);
        if (content.bottom > bottom - 12 || overflow.length) throw Error('Book content does not fit folio ' + sheet.dataset.folio + ': ' + JSON.stringify({gap: bottom - content.bottom, overflow}));
        return {folio: Number(sheet.dataset.folio), footerClearanceMm: (bottom - content.bottom) * 25.4 / 96, overflow, images: [...sheet.querySelectorAll('img')].map(i => ({src: i.getAttribute('src'), loaded: !!i.naturalWidth}))};
      }));
      if (checks.length !== count) throw Error('Unexpected sheet count');
      await page.evaluate(checks => document.body.dataset.bookChecks = JSON.stringify({type: 'book-layout-json', pages: checks}), checks);
      const geometry = await finishProductionPages(page, {supplier: 'bookvault', startPage: start});
      const raw = await page.pdf({width: geometry.width + 'mm', height: geometry.height + 'mm', preferCSSPageSize: true, printBackground: true, scale: 1, margin: {top: 0, right: 0, bottom: 0, left: 0}});
      const rawPath = path.join(scratch, units + '-raw.pdf'); await fs.writeFile(rawPath, raw); const fd = await fs.open(rawPath, 'r'); let norm;
      try {norm = spawnSync(python, [path.join(root, 'scripts/normalise-book-pdf.py'), '--supplier', 'bookvault', '--start-page', String(start)], {stdio: [fd.fd, 'pipe', 'pipe'], maxBuffer: 50 * 1024 * 1024, timeout: 60000});} finally {await fd.close();}
      if (norm.status !== 0) throw Error(norm.error?.message || norm.stderr.toString());
      const pdfPath = path.join(out, `${kind === 'opening' ? 'title-publication-welcome' : 'contents-how-to'}-${units}.pdf`); await fs.writeFile(pdfPath, norm.stdout);
      receipt.results.push({units, html: path.relative(root, htmlPath), htmlSha256: sha256(html), pdf: path.relative(root, pdfPath), sha256: sha256(norm.stdout), copyBlocks: rendered.copyBlocks, ...(rendered.contents ? {contents: rendered.contents} : {}), dom: checks, geometry, visualReview: 'pending'});
      console.log(`${kind} ${units}: ${count} working pages saved`);
    }
    await verify();
    if (bookLayoutRevision(sharedRoot) !== revision) throw Error('Book copy changed during export. Rebuild before reviewing these files.');
    receipt.approvedFilesUnchanged = true;
    receipt.implementation = {};
    for (const file of [css, 'scripts/lib/build-book-pages.mjs', 'scripts/lib/book-content.mjs', 'src/print/familyThemes.json']) receipt.implementation[file] = sha256(await fs.readFile(path.join(root, file)));
    await fs.writeFile(path.join(dir, 'CHECKS.json'), JSON.stringify(receipt, null, 2) + '\n');
  } finally {await browser.close(); await fs.rm(modulePath, {force: true});}
}
