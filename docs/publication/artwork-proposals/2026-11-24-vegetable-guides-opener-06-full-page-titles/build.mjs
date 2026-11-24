import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const generation = JSON.parse(await fs.readFile(path.join(HERE, 'GENERATION.json'), 'utf8'));
await fs.mkdir(path.join(HERE, 'assets'), { recursive: true });
const art = [];
for (const item of generation.candidates) {
  const file = item.id === 21 ? '21-red-cabbage-native.png' : '09-leeks-native.png';
  const target = path.join(HERE, 'assets', file);
  const bytes = await fs.readFile(item.generated_file);
  await fs.writeFile(target, bytes);
  const meta = await sharp(target).metadata();
  const scalePxPerMm = Math.min(meta.width / 191, meta.height / 246);
  art.push({ id: item.id, rank: item.rank, file, sha256: hash(bytes),
    width: meta.width, height: meta.height,
    effective_ppi_full_bleed: 25.4 * scalePxPerMm,
    meets_300_ppi: 25.4 * scalePxPerMm >= 300 });
}
await fs.copyFile(path.join(ROOT, 'public/fonts/richer-a-1.woff2'), path.join(HERE, 'assets/LilitaOne.woff2'));
const options = [
  { key: 'A', name: 'Upper left / large stack', cls: 'upper-left', words: '<span>Vegetable</span><span>Guides</span>' },
  { key: 'B', name: 'Top / centred single line', cls: 'top-centre', words: '<span>Vegetable Guides</span>' },
  { key: 'C', name: 'Lower right / compact stack', cls: 'lower-right', words: '<span>Vegetable</span><span>Guides</span>' }
];
const pages = art.flatMap(item => options.map(option => ({ ...option, id: item.id, image: item.file, code: String(item.id) + option.key })));
const html = '<!doctype html><html lang="en"><meta charset="utf-8"><title>Vegetable Guru — title studies 21 and 9</title><style>' +
'@font-face{font-family:Lilita;src:url("assets/LilitaOne.woff2") format("woff2");font-weight:400;font-style:normal;font-display:block}' +
'*{box-sizing:border-box}html,body{padding:0;margin:0}body{background:#e9e6df;font-family:Arial,sans-serif}' +
'@page{size:191mm 246mm;margin:0}.page{position:relative;width:191mm;height:246mm;overflow:hidden;page-break-after:always;break-after:page;background:#16351d}.page:last-child{page-break-after:auto;break-after:auto}' +
'.photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block}' +
'.title{position:absolute;margin:0;color:#fff;font-family:Lilita;font-weight:400;line-height:.89;letter-spacing:-.012em;z-index:1}.title span{display:block;white-space:nowrap}' +
'.upper-left{left:20mm;top:18mm;font-size:72pt}.upper-left span+span{font-size:84pt;margin-top:1mm}' +
'.top-centre{left:20mm;right:11mm;top:20mm;text-align:center;font-size:50pt;letter-spacing:-.016em;line-height:1}' +
'.lower-right{right:11mm;bottom:19mm;text-align:right;font-size:64pt}.lower-right span+span{font-size:76pt;margin-top:1mm}' +
'.screen-label{display:none}@media screen{body{padding:24px}.page{margin:0 auto 40px;box-shadow:0 3px 20px #0003}.screen-label{display:block;max-width:722px;margin:0 auto 10px;font-size:15px;color:#263f32}}' +
'</style><body>' + pages.map(p=>'<div class="screen-label">'+p.code+' — '+p.name+'</div><section class="page" data-code="'+p.code+'"><img class="photo" src="assets/'+p.image+'" alt=""><h1 class="title '+p.cls+'">'+p.words+'</h1></section>').join('') + '</body></html>';
await fs.writeFile(path.join(HERE, 'REVIEW.html'), html);
const manifest = {
  date:'2026-11-24',status:'Layout proposals only; higher native resolution still required',
  brief:'Ranked candidates 21 then 9; full-bleed photographs with white Vegetable Guides title only.',
  trim_mm:[185,240],bleed_mm:3,media_mm:[191,246],target_ppi:300,
  minimum_pixels_at_300ppi:[2256,2906],
  native_artwork:art,
  font:{family:'Lilita One',weight:400,source:'public/fonts/richer-a-1.woff2',sha256:hash(await fs.readFile(path.join(HERE,'assets/LilitaOne.woff2')))},
  image_processing:'Native generated PNG bytes copied unchanged. Page placement crops a negligible strip to exact media aspect ratio. No source-image upsampling, retouching or colour conversion.',
  colour:'RGB layout proof. Future production conversion should reuse the exact approved ISOcoated_v2_300_eci.icc profile after artwork/layout approval. This is not a Bookvault upload file or a certified PDF/X file.',
  title_treatment:'Solid white native text; no gradient, outline, shadow, panel, subtitle, part number, contents or folio.',
  options: pages.map(p=>({code:p.code,arrangement:p.name})),
  production_files:'Untouched; no book build, upload or order performed.'
};
await fs.writeFile(path.join(HERE,'ARTWORK.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({output:path.join(HERE,'REVIEW.html'),art},null,2));

