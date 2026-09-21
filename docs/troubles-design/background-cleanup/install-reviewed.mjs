#!/usr/bin/env node

// Guarded, one-shot installation of locally cleaned and visually reviewed art.
// The manifest is the exact source/candidate contract; originals remain intact.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {readCollection, revision, saveCollections} from '../../../../hackriculture-data/lib/records.mjs';
import {layoutSourceSignature} from '../../../src/lib/aiPrint.ts';

if (process.argv[2] !== '--install-reviewed') throw new Error('Usage: install-reviewed.mjs --install-reviewed');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const manifest = JSON.parse(fs.readFileSync(path.join(here, 'manifest.json'), 'utf8'));
assert.equal(manifest.version, 1);
assert.equal(manifest.summary.total, 220);
assert.equal(manifest.summary.generatedCandidates, 177);
assert.equal(manifest.summary.needsReview, 0);
assert.equal(manifest.summary.skipped, 43);
assert.equal(manifest.entries.length, 220);

const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const publicUrl = projectPath => `/${projectPath.replace(/^public\//, '')}`;
const rev = revision();
const data = readCollection('troubles');
const before = structuredClone(data);
const touchedGroups = new Set();
let installed = 0;

for (const groupKey of new Set(manifest.entries.filter(entry => entry.status === 'candidate').map(entry => entry.group))) {
  const group = data[groupKey];
  assert.equal(group?.ai_layout?.status, 'approved', `${groupKey}: layout is not approved`);
  assert.equal(group.ai_layout.source_signature, layoutSourceSignature(group), `${groupKey}: stale layout before install`);
}

for (const entry of manifest.entries.filter(entry => entry.status === 'candidate')) {
  assert(entry.candidate && entry.candidateSha256, `${entry.group}/${entry.key}: incomplete candidate`);
  const group = data[entry.group];
  const condition = group?.conditions?.[entry.key];
  assert(condition, `${entry.group}/${entry.key}: missing canonical condition`);
  const originalFile = path.join(root, entry.original);
  const candidateFile = path.join(root, entry.candidate);
  assert.equal(condition.image, publicUrl(entry.original), `${entry.group}/${entry.key}: canonical image path changed`);
  assert.equal(hash(originalFile), entry.originalSha256, `${entry.group}/${entry.key}: original bytes changed`);
  if (condition.image_revision !== undefined) assert.equal(condition.image_revision, entry.originalSha256, `${entry.group}/${entry.key}: canonical image hash changed`);
  assert.equal(hash(candidateFile), entry.candidateSha256, `${entry.group}/${entry.key}: candidate bytes changed`);
  const [originalInfo, candidateInfo] = await Promise.all([sharp(originalFile).metadata(), sharp(candidateFile).metadata()]);
  assert.equal(candidateInfo.format, 'png', `${entry.group}/${entry.key}: candidate is not PNG`);
  assert.equal(candidateInfo.width, originalInfo.width, `${entry.group}/${entry.key}: width changed`);
  assert.equal(candidateInfo.height, originalInfo.height, `${entry.group}/${entry.key}: height changed`);

  condition.image = publicUrl(entry.candidate);
  condition.image_revision = entry.candidateSha256;
  touchedGroups.add(entry.group);
  installed++;
}

for (const group of touchedGroups) data[group].ai_layout.source_signature = layoutSourceSignature(data[group]);

// Prove this transaction changes only the two condition image fields and the
// signature that binds the already-approved layout to those fields.
const stripped = structuredClone(data);
for (const entry of manifest.entries.filter(entry => entry.status === 'candidate')) {
  const old = before[entry.group].conditions[entry.key];
  for (const field of ['image', 'image_revision']) {
    if (Object.hasOwn(old, field)) stripped[entry.group].conditions[entry.key][field] = old[field];
    else delete stripped[entry.group].conditions[entry.key][field];
  }
}
for (const group of touchedGroups) stripped[group].ai_layout.source_signature = before[group].ai_layout.source_signature;
assert.deepEqual(stripped, before, 'Unexpected canonical field changed');
assert.equal(installed, 177);
assert.equal(touchedGroups.size, 11);

const result = saveCollections(
  {troubles: data},
  {actor: 'admin: user-authorised local checkerboard cleanup', expectedRevision: rev},
);
console.log(JSON.stringify({installed, groups: [...touchedGroups], ...result}));
