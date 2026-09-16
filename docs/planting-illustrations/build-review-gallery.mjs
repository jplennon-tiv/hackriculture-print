// Local review artifact only; no runtime/public data writes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const batches = fs.readdirSync(root).filter(f => /^BATCH-\d+\.json$/.test(f)).sort().map(f => JSON.parse(fs.readFileSync(path.join(root, f))));
const crops = new Map();
const esc = s => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
for (const b of batches) for (const j of [...b.jobs, ...(b.reuse ?? [])]) {
  if (j.status && j.status !== 'generated') continue;
  const file = j.preferredFile ?? j.file;
  if (!fs.existsSync(path.join(root, file))) continue;
  if (!crops.has(j.crop)) crops.set(j.crop, []);
  crops.get(j.crop).push({ ...j, file, stage: j.stage ?? Number(j.id.slice(0, 2)) });
}
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Planting artwork review</title><style>body{margin:0;background:#ede8dc;color:#403c2a;font:17px/1.5 Georgia,serif}main{max-width:1100px;margin:auto;padding:32px}h1{font-size:32px}h2{text-transform:capitalize;border-bottom:1px solid #c9bea7;padding-bottom:8px}nav{display:flex;flex-wrap:wrap;gap:8px}a{color:#405d36}nav a{padding:3px 9px;background:#fffaf0;border-radius:5px}section{margin:32px 0;break-inside:avoid}.row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}figure{margin:0;background:#fffaf0;border:1px solid #d5cbb5;border-radius:8px;padding:14px}img{display:block;width:100%;aspect-ratio:2;object-fit:contain}figcaption{margin-top:8px}small{display:block;font:12px/1.5 system-ui;color:#766d58}body.compact img{width:48mm;height:24mm;margin:auto}.note{background:#fffaf0;padding:16px;border-left:3px solid #688258}button{font:inherit;padding:6px 12px;cursor:pointer}@media(max-width:650px){.row{grid-template-columns:1fr}main{padding:16px}}@media print{nav,button{display:none}}</style><main><h1>Sowing &amp; planting · artwork review</h1><p class="note">Draft catalogue, 15 September 2026. Preferred revisions shown. No images installed in the PDFs. Measurements, captions and row plans will be separate live-data elements. Mushroom is conditional on supplier stage and page space. Click any image for its original PNG.</p><button onclick="document.body.classList.toggle('compact')">Toggle 24 mm image slots</button><nav>${[...crops.keys()].sort().map(c => `<a href="#${c}">${esc(c.replaceAll('_', ' '))}</a>`).join('')}</nav>${[...crops].sort(([a],[b])=>a.localeCompare(b)).map(([crop,jobs])=>`<section id="${crop}"><h2>${esc(crop.replaceAll('_',' '))}</h2><div class="row">${jobs.sort((a,b)=>a.stage-b.stage).map(j=>`<figure><a href="${esc(j.file)}"><img loading="lazy" src="${esc(j.file)}" alt="${esc(j.alt ?? `${crop}: shared scene ${j.stage}`)}"></a><figcaption>${j.stage}. ${esc(j.title ?? 'Shared raising/sowing scene')}<small>${esc(j.approval ?? j.reason)}${j.conditional ? ' · CONDITIONAL' : ''}</small></figcaption></figure>`).join('')}</div></section>`).join('')}<p>Prompts and original paths: BATCH and revision JSON manifests. See PROGRESS.md and REVIEW.md for checks and installation cautions.</p></main></html>`;
fs.writeFileSync(path.join(root, 'gallery.html'), html.replace('15 September 2026', '16 September 2026'));
console.log(`Gallery written: ${crops.size} crop records, ${[...crops.values()].reduce((n, a) => n + a.length, 0)} placements.`);
