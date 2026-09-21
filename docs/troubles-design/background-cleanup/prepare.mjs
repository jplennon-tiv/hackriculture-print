#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {readCollection} from '../../../../hackriculture-data/lib/records.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(here, '../../..');
const manifestPath = path.join(here, 'manifest.json');
const reports = path.join(here, 'reports');
const mode = process.argv.includes('--all') ? 'all' : 'trial';
const contactsOnly = process.argv.includes('--contacts-only');
const priorManifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const trialIds = new Set([
  'brassica_troubles/boron_deficiency', // pale cauliflower
  'carrot_and_parsnip_troubles/green_top', // fine foliage
  'bean_and_pea_troubles/pea_moth', // small pale insect/larvae
]);

const relative = absolute => path.relative(project, absolute).split(path.sep).join('/');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const xml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

async function inspectBorder(file) {
  const {data, info} = await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject: true});
  let min = 255;
  let max = 0;
  let transparent = 0;
  let samples = 0;
  const size = Math.min(32, info.width, info.height);
  for (const [x0, y0] of [[0, 0], [info.width - size, 0], [0, info.height - size], [info.width - size, info.height - size]]) {
    for (let y = y0; y < y0 + size; y++) for (let x = x0; x < x0 + size; x++) {
      const i = (y * info.width + x) * 4;
      const luminance = (data[i] + data[i + 1] + data[i + 2]) / 3;
      min = Math.min(min, luminance);
      max = Math.max(max, luminance);
      if (data[i + 3] < 250) transparent++;
      samples++;
    }
  }
  return {width: info.width, height: info.height, borderRange: max - min, borderMin: min, borderMax: max, transparentBorderFraction: transparent / samples};
}

// Only light, near-neutral pixels connected to an outer edge are whitened.
// The deliberately explicit pixel loop makes the preservation limits auditable.
async function clean(file, output) {
  const {data, info} = await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject: true});
  const width = info.width;
  const height = info.height;
  const pixels = width * height;
  const seen = new Uint8Array(pixels);
  const queue = new Int32Array(pixels);
  let head = 0;
  let tail = 0;
  const eligible = p => {
    const i = p * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    return a >= 250 && Math.min(r, g, b) >= 235 && Math.max(r, g, b) - Math.min(r, g, b) <= 10;
  };
  const add = p => {
    if (!seen[p] && eligible(p)) {
      seen[p] = 1;
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
  let changedPixels = 0;
  let alreadyWhitePixels = 0;
  let changedDarkOrColouredPixels = 0;
  for (let p = 0; p < pixels; p++) if (seen[p]) {
    const i = p * 4;
    if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
      alreadyWhitePixels++;
      continue;
    }
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    const chroma = Math.max(data[i], data[i + 1], data[i + 2]) - min;
    if (min < 235 || chroma > 10) changedDarkOrColouredPixels++;
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    changedPixels++;
  }
  await fs.mkdir(path.dirname(output), {recursive: true});
  await sharp(data, {raw: {width, height, channels: 4}}).png({compressionLevel: 9, adaptiveFiltering: true}).toFile(output);
  return {width, height, changedPixels, changedFraction: changedPixels / pixels, alreadyWhitePixels, changedDarkOrColouredPixels};
}

async function thumb(file, width, height) {
  return sharp(file).flatten({background: '#ffffff'}).resize(width, height, {fit: 'contain', background: '#ffffff'}).png().toBuffer();
}

async function sheet(items, output, {paired}) {
  const columns = paired ? 2 : 3;
  const cellWidth = 360;
  const imageHeight = 300;
  const labelHeight = 62;
  const cellHeight = imageHeight + labelHeight;
  const rows = Math.ceil((paired ? items.length * 2 : items.length) / columns);
  const composites = [];
  let slot = 0;
  for (const item of items) {
    const variants = paired ? [['BEFORE', item.originalAbsolute], ['AFTER', item.candidateAbsolute]] : [['UNCHANGED', item.originalAbsolute]];
    for (const [tag, file] of variants) {
      const left = (slot % columns) * cellWidth;
      const top = Math.floor(slot / columns) * cellHeight;
      composites.push({input: await thumb(file, cellWidth, imageHeight), left, top});
      const label = `${tag}  ${item.group}/${item.key}`;
      const svg = `<svg width="${cellWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#17251d"/><text x="12" y="25" font-family="Arial,sans-serif" font-size="15" fill="white">${xml(label.slice(0, 43))}</text><text x="12" y="47" font-family="Arial,sans-serif" font-size="12" fill="#cfe0d5">${xml(label.slice(43, 92))}</text></svg>`;
      composites.push({input: Buffer.from(svg), left, top: top + imageHeight});
      slot++;
    }
  }
  await fs.mkdir(path.dirname(output), {recursive: true});
  await sharp({create: {width: columns * cellWidth, height: rows * cellHeight, channels: 3, background: '#e9ecea'}}).composite(composites).png().toFile(output);
}

const troubles = readCollection('troubles');
if (Object.values(troubles).some(group => Object.values(group.conditions ?? {}).some(condition => condition.image?.startsWith('/images/troubles/cleaned/')))) {
  throw new Error('Cleanup paths are already installed; preserving the completed manifest. Do not rebuild it from post-install records.');
}
const entries = [];
for (const [group, record] of Object.entries(troubles)) for (const [key, condition] of Object.entries(record.conditions ?? {})) {
  const originalAbsolute = path.join(project, 'public', condition.image.replace(/^\//, ''));
  const candidateAbsolute = path.join(project, 'public/images/troubles/cleaned', group, `${key}-v1.png`);
  const originalBytes = await fs.readFile(originalAbsolute);
  const border = await inspectBorder(originalAbsolute);
  // Current generated solid-white assets vary only 0–2 RGB levels in the four
  // sampled corners. Every visually verified checkerboard exceeds 5 levels.
  const affected = border.borderRange > 5 && border.transparentBorderFraction === 0;
  const selected = affected && (mode === 'all' || trialIds.has(`${group}/${key}`));
  let stats = null;
  let candidateSha256 = null;
  if (selected && !contactsOnly) {
    stats = await clean(originalAbsolute, candidateAbsolute);
    candidateSha256 = sha256(await fs.readFile(candidateAbsolute));
  } else if (selected) {
    const previous = priorManifest.entries.find(entry => entry.group === group && entry.key === key);
    if (!previous?.candidate || !previous?.candidateSha256) throw new Error(`Missing prior candidate for ${group}/${key}`);
    const bytes = await fs.readFile(path.join(project, previous.candidate));
    if (sha256(bytes) !== previous.candidateSha256) throw new Error(`Candidate hash changed for ${group}/${key}`);
    stats = previous.metrics;
    candidateSha256 = previous.candidateSha256;
  }
  entries.push({
    group,
    key,
    original: relative(originalAbsolute),
    originalSha256: sha256(originalBytes),
    candidate: selected ? relative(candidateAbsolute) : null,
    candidateSha256,
    status: selected ? 'candidate' : affected ? 'needs-review' : 'skip',
    notes: selected
      ? `Edge-connected neutral whitening; ${stats.changedPixels}/${stats.width * stats.height} pixels changed (${(stats.changedFraction * 100).toFixed(2)}%); dark/coloured pixels changed: ${stats.changedDarkOrColouredPixels}.`
      : affected
        ? `Checkerboard-likely border range ${border.borderRange.toFixed(2)}; candidate not generated in ${mode} mode.`
        : `No cleanup proposed: border range ${border.borderRange.toFixed(2)}, transparent fraction ${(border.transparentBorderFraction * 100).toFixed(2)}%.`,
    classification: affected ? 'checkerboard-likely' : border.transparentBorderFraction ? 'transparent-background' : 'plain-white-likely',
    confidence: affected && border.borderRange <= 9 ? 'medium' : 'high',
    metrics: {...border, ...(stats ?? {})},
    originalAbsolute,
    candidateAbsolute: selected ? candidateAbsolute : null,
  });
}

const serialisable = entries.map(({originalAbsolute, candidateAbsolute, ...entry}) => entry);
const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  mode,
  method: 'Four-corner 32px classification; 4-connected flood from image edges; RGB min >=235 and chroma <=10 whitened; no crop or resize.',
  summary: {
    total: entries.length,
    checkerboardLikely: entries.filter(entry => entry.classification === 'checkerboard-likely').length,
    generatedCandidates: entries.filter(entry => entry.status === 'candidate').length,
    needsReview: entries.filter(entry => entry.status === 'needs-review').length,
    skipped: entries.filter(entry => entry.status === 'skip').length,
  },
  entries: serialisable,
};
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
await fs.mkdir(reports, {recursive: true});
await fs.writeFile(path.join(reports, `${mode}-summary.json`), `${JSON.stringify(manifest.summary, null, 2)}\n`);

const candidates = entries.filter(entry => entry.status === 'candidate');
if (candidates.length) {
  await fs.rm(path.join(reports, `${mode}-before-after.png`), {force: true});
  for (let i = 0; i < candidates.length; i += 6) {
    await sheet(candidates.slice(i, i + 6), path.join(reports, `${mode}-before-after-${String(i / 6 + 1).padStart(2, '0')}.png`), {paired: true});
  }
}
const unaffected = entries.filter(entry => entry.status === 'skip');
for (let i = 0; i < unaffected.length; i += 12) {
  await sheet(unaffected.slice(i, i + 12), path.join(reports, `unaffected-${String(i / 12 + 1).padStart(2, '0')}.png`), {paired: false});
}
console.log(JSON.stringify(manifest.summary));
