// QA only: inspect original PNGs and render a review sheet without editing assets.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from 'playwright';
const root = path.dirname(fileURLToPath(import.meta.url));
const batchName = process.argv[2];
if (!/^BATCH-\d+\.json$/.test(batchName ?? '')) throw new Error('Pass BATCH-NN.json');
const q = JSON.parse(fs.readFileSync(path.join(root, batchName)));
const jobs = q.jobs.filter(j => j.status === 'generated').map(j => ({ ...j, file: j.preferredFile ?? j.file }));
for (const j of jobs) {
  const file = path.join(root, j.file);
  const m = await sharp(file).metadata();
  const s = await sharp(file).stats();
  if (!m.hasAlpha || s.isOpaque) throw new Error(`${j.file}: no actual transparency`);
  console.log(JSON.stringify({ file: j.file, width: m.width, height: m.height, alpha: true, opaque: s.isOpaque }));
}
const esc = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 2 });
  await page.setContent(`<style>body{margin:24px;background:#ede8dc;color:#413c2a;font-family:Georgia,serif}h1{font-size:24px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}figure{margin:0;background:#fffaf0;padding:12px;border:1px solid #d5cbb5;border-radius:9px}.slot{height:145px;display:flex;align-items:center;justify-content:center}img{max-width:100%;max-height:100%;object-fit:contain}figcaption{font-size:16px;margin-top:6px}.small .slot{height:24mm}.small img{max-width:48mm}.small{grid-template-columns:repeat(3,65mm)}</style><h1>${esc(batchName.replace('.json', ''))} · planting artwork review</h1><p>Drafts; labels below are review headings, not final PDF captions.</p><div class="grid">${jobs.map(j => `<figure><div class="slot"><img src="data:image/png;base64,${fs.readFileSync(path.join(root, j.file)).toString('base64')}"></div><figcaption>${esc(j.crop.replaceAll('_', ' '))} · ${esc(j.title)}</figcaption></figure>`).join('')}</div>`);
  await page.evaluate(async () => Promise.all([...document.images].map(i => i.decode())));
  const base = path.join(root, 'drafts/2026-09-15', batchName.replace('.json', '').toLowerCase());
  await page.screenshot({ path: base + '-review.png', fullPage: true });
  await page.locator('.grid').evaluate(el => el.classList.add('small'));
  await page.screenshot({ path: base + '-small-size.png', fullPage: true });
  console.log(`Review sheets: ${base}-review.png and ${base}-small-size.png`);
} finally { await browser.close(); }
