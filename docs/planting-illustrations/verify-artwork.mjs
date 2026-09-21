import {refreshGenerated} from '../../../hackriculture-data/lib/records.mjs';
refreshGenerated();
// Read-only complete catalogue, preferred/reused PNG and source binding verification.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const master = JSON.parse(fs.readFileSync(path.resolve(root, '../../../hackriculture-data/generated/master/vegetables.json')));
const batches = fs.readdirSync(root).filter(f => /^BATCH-\d+\.json$/.test(f)).sort().map(f => JSON.parse(fs.readFileSync(path.join(root, f))));
const placements = new Map();
const originals = new Set();
const selected = new Set();
let pending = 0;
for (const b of batches) {
  for (const j of [...b.jobs, ...(b.reuse ?? [])]) {
    for (const p of j.sourcePaths ?? []) assert.notEqual(p.split('.').reduce((o, k) => o?.[k], master), undefined, p);
    if (j.status && j.status !== 'generated') { pending++; continue; }
    const stage = j.stage ?? Number(j.id.slice(0, 2));
    const key = `${j.crop}/${stage}`;
    assert(!placements.has(key), `Duplicate placement ${key}`);
    placements.set(key, j.preferredFile ?? j.file);
    selected.add(j.preferredFile ?? j.file);
    originals.add(j.file);
  }
}
for (const f of new Set([...originals, ...selected])) {
  const image = sharp(path.join(root, f));
  const m = await image.metadata(), s = await image.stats();
  assert(m.hasAlpha && !s.isOpaque, `Missing true alpha: ${f}`);
  assert.equal(m.width / m.height, 2, `Wrong aspect: ${f}`);
}
const three = new Set(['asparagus', 'bean_runner', 'carrot', 'celeriac', 'leek', 'sweet_corn']);
const incomplete = [];
for (const crop of Object.keys(master)) {
  const count = three.has(crop) ? 3 : 2;
  if (Array.from({ length: count }, (_, i) => !placements.has(`${crop}/${i + 1}`)).some(Boolean)) incomplete.push(crop);
}
console.log(JSON.stringify({ cropRecords: Object.keys(master).length, placements: placements.size, uniqueSelected: selected.size, pending, incomplete }, null, 2));
if (process.argv.includes('--complete')) { assert.equal(pending, 0); assert.deepEqual(incomplete, []); assert.equal(placements.size, 94); }
