import {refreshGenerated} from '../../../hackriculture-data/lib/records.mjs';
refreshGenerated();
// Read-only checks for resumable design work; no generated data or master writes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const dir = path.dirname(fileURLToPath(import.meta.url));
const masterPath = path.resolve(dir, '../../../hackriculture-data/generated/master/vegetables.json');
const bytes = fs.readFileSync(masterPath);
const master = JSON.parse(bytes);
const hash = createHash('sha256').update(bytes).digest('hex');
const markdown = fs.readFileSync(path.join(dir, 'CROP-BRIEFS.md'), 'utf8');
const sections = markdown.split(/^## /m).slice(1);
const cropSections = sections.filter(s => /^[a-z_]+\n/.test(s));
const keys = cropSections.map(s => s.split('\n')[0]);
assert.equal(new Set(keys).size, keys.length, 'Duplicate crop briefs');
assert.deepEqual([...keys].sort(), Object.keys(master).sort(), 'Catalogue coverage changed');

function resolve(value, dottedPath) {
  return dottedPath.split('.').reduce((v, key) => v?.[key], value);
}
for (const section of cropSections) {
  const key = section.split('\n')[0];
  const line = section.split('\n').find(l => l.startsWith('Bindings:'));
  assert(line, `${key}: missing source bindings`);
  for (const [, source] of line.matchAll(/`([^`]+)`/g)) {
    const base = key === 'mushroom' ? master[key] : master[key].sowing_and_planting;
    assert.notEqual(resolve(base, source), undefined, `${key}: missing ${source}`);
  }
}
const counts = { C2: 0, S2: 0, S3: 0, mushroom: 0 };
for (const section of cropSections) {
  if (section.startsWith('mushroom\n')) counts.mushroom++;
  else {
    const mode = section.match(/\*\*(C2|S2|S3) ·/);
    assert(mode, 'Missing layout mode');
    counts[mode[1]]++;
  }
}

let generated = 0;
for (const name of fs.readdirSync(dir).filter(n => /^BATCH-\d+\.json$/.test(n)).sort()) {
  const batch = JSON.parse(fs.readFileSync(path.join(dir, name)));
  const ids = batch.jobs.map(j => `${j.crop}/${j.id}`);
  assert.equal(new Set(ids).size, ids.length, `${name}: duplicate asset IDs`);
  for (const job of batch.jobs) {
    assert(master[job.crop], `${name}: unknown crop`);
    assert(job.alt && job.scene, `${name}: missing prompt/alt text`);
    for (const source of job.sourcePaths) assert.notEqual(resolve(master, source), undefined, source);
    if (job.status === 'generated') {
      const image = fs.readFileSync(path.join(dir, job.file));
      assert(image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), job.file);
      generated++;
    }
  }
  console.log(`${name}: ${batch.jobs.filter(j => j.status === 'generated').length}/${batch.jobs.length} generated; approval states preserved`);
  if (batch.sourceSha256 !== hash) console.log(`${name}: master changed since generation snapshot; review relevant bindings before installation`);
}
console.log({ crops: keys.length, layouts: counts, generated, masterSha256: hash });
