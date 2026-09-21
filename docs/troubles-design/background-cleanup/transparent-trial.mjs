#!/usr/bin/env node

// Five-case local alpha-mask trial. Changes alpha only; RGB bytes are retained.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const prior = JSON.parse(await fs.readFile(path.join(here, 'manifest.json'), 'utf8'));
const reports = path.join(here, 'transparent-trial', 'reports');
const manifestPath = path.join(here, 'transparent-trial', 'manifest.json');
const outputRoot = path.join(root, 'public/images/troubles/transparent-trial');
const ids = [
  'brassica_troubles/boron_deficiency',
  'bean_and_pea_troubles/pea_moth',
  'carrot_and_parsnip_troubles/green_top',
  'bean_and_pea_troubles/powdery_mildew',
  'brassica_troubles/frost',
];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const rel = absolute => path.relative(root, absolute).split(path.sep).join('/');
const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function backgroundMask(data, width, height) {
  const pixels = width * height;
  const mask = new Uint8Array(pixels);
  const queue = new Int32Array(pixels);
  let head = 0;
  let tail = 0;
  const eligible = p => {
    const i = p * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return data[i + 3] < 250 || (Math.min(r, g, b) >= 235 && Math.max(r, g, b) - Math.min(r, g, b) <= 10);
  };
  const add = p => {
    if (!mask[p] && eligible(p)) {
      mask[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < width; x++) {
    add(x);
    add((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y++) {
    add(y * width);
    add(y * width + width - 1);
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const y = Math.floor(p / width);
    if (x) add(p - 1);
    if (x + 1 < width) add(p + 1);
    if (y) add(p - width);
    if (y + 1 < height) add(p + width);
  }
  return mask;
}

async function cutout(source, output) {
  const {data, info} = await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject: true});
  const original = Buffer.from(data);
  const {width, height} = info;
  const mask = backgroundMask(data, width, height);
  let transparent = 0;
  let feathered = 0;
  let rgbChanged = 0;
  for (let p = 0; p < width * height; p++) if (mask[p]) {
    data[p * 4 + 3] = 0;
    transparent++;
  }
  // One-pixel boundary feather only. This reduces grey/white antialias fringes
  // while never reaching isolated white subject interiors.
  for (let p = 0; p < width * height; p++) {
    if (mask[p]) continue;
    const x = p % width, y = Math.floor(p / width);
    let touches = false;
    for (let dy = -1; dy <= 1 && !touches; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && mask[ny * width + nx]) { touches = true; break; }
    }
    if (!touches) continue;
    const i = p * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const min = Math.min(r, g, b), max = Math.max(r, g, b), chroma = max - min;
    if (min < 210 || chroma > 28) continue;
    const opacity = Math.max(0.12, Math.min(1, (255 - min) / 30 + chroma / 20));
    const nextAlpha = Math.min(data[i + 3], Math.round(255 * opacity));
    if (nextAlpha < data[i + 3]) { data[i + 3] = nextAlpha; feathered++; }
  }
  for (let i = 0; i < data.length; i += 4) if (data[i] !== original[i] || data[i + 1] !== original[i + 1] || data[i + 2] !== original[i + 2]) rgbChanged++;
  await fs.mkdir(path.dirname(output), {recursive: true});
  await sharp(data, {raw: {width, height, channels: 4}}).png({compressionLevel: 9, adaptiveFiltering: true}).toFile(output);
  return {width, height, transparentPixels: transparent, transparentFraction: transparent / (width * height), featheredPixels: feathered, rgbChangedPixels: rgbChanged};
}

async function panel(file, background, label) {
  const image = await sharp(file).resize(300, 270, {fit: 'contain'}).png().toBuffer();
  const title = Buffer.from(`<svg width="300" height="34" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#14231b"/><text x="10" y="22" font-family="Arial,sans-serif" font-size="14" fill="white">${escapeXml(label)}</text></svg>`);
  return sharp({create: {width: 300, height: 304, channels: 4, background}}).composite([{input: image, top: 0, left: 0}, {input: title, top: 270, left: 0}]).png().toBuffer();
}

async function comparison(item, output) {
  const panels = [
    await panel(item.sourceAbsolute, '#ffffff', 'ORIGINAL / OPAQUE'),
    await panel(item.outputAbsolute, '#ffffff', 'ALPHA ON WHITE'),
    await panel(item.outputAbsolute, '#e8f1e4', 'ALPHA ON LIGHT TINT'),
    await panel(item.outputAbsolute, '#30383d', 'ALPHA ON DARK QA'),
  ];
  const title = Buffer.from(`<svg width="1200" height="46" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#0b1710"/><text x="14" y="29" font-family="Arial,sans-serif" font-size="18" fill="white">${escapeXml(item.id)}</text></svg>`);
  await sharp({create: {width: 1200, height: 350, channels: 4, background: '#ffffff'}}).composite([
    {input: title, left: 0, top: 0},
    ...panels.map((input, index) => ({input, left: index * 300, top: 46})),
  ]).png().toFile(output);
}

const items = [];
for (const id of ids) {
  const [group, key] = id.split('/');
  const entry = prior.entries.find(entry => entry.group === group && entry.key === key);
  if (!entry) throw new Error(`Missing cleanup inventory entry: ${id}`);
  const sourceAbsolute = path.join(root, entry.original);
  const outputAbsolute = path.join(outputRoot, group, `${key}-v1.png`);
  const sourceBytes = await fs.readFile(sourceAbsolute);
  const stats = await cutout(sourceAbsolute, outputAbsolute);
  const outputBytes = await fs.readFile(outputAbsolute);
  const item = {id, group, key, source: entry.original, sourceSha256: hash(sourceBytes), output: rel(outputAbsolute), outputSha256: hash(outputBytes), stats, sourceAbsolute, outputAbsolute};
  items.push(item);
}

await fs.mkdir(reports, {recursive: true});
const rows = [];
for (const item of items) {
  const report = path.join(reports, `${item.group}--${item.key}.png`);
  await comparison(item, report);
  rows.push(await fs.readFile(report));
}
await sharp({create: {width: 1200, height: rows.length * 350, channels: 4, background: '#ffffff'}}).composite(rows.map((input, index) => ({input, left: 0, top: index * 350}))).png().toFile(path.join(reports, 'trial-contact-sheet.png'));

await fs.writeFile(manifestPath, `${JSON.stringify({
  version: 1,
  generatedAt: new Date().toISOString(),
  method: 'Alpha-only: edge-connected light-neutral flood (RGB min >=235, chroma <=10), then a bounded one-pixel light-edge feather. RGB channels retained exactly.',
  backgroundsReviewed: ['#ffffff', '#e8f1e4', '#30383d'],
  entries: items.map(({sourceAbsolute, outputAbsolute, ...item}) => item),
}, null, 2)}\n`);
console.log(JSON.stringify(items.map(({id, stats}) => ({id, ...stats}))));
