// Scoped artwork-only installation; preserves approved text and layout dimensions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {readCollection,saveCollections,revision,refreshGenerated} from '../../hackriculture-data/lib/records.mjs';
import {layoutSourceSignature} from '../src/lib/aiPrint.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const jobs=JSON.parse(fs.readFileSync(path.join(root,'docs/troubles-design/backfill-results.json'),'utf8'));
assert.equal(jobs.length,10);
const rev=revision(),data=readCollection('troubles'),before=structuredClone(data);
for(const job of jobs){
 const g=data[job.group],c=g.conditions[job.key];assert(c);
 assert(!c.image||!fs.existsSync(path.join(root,'public',c.image)),'Existing artwork: stop');
 assert.equal(g.ai_layout.source_signature,layoutSourceSignature(before[job.group]));
 c.image='/'+job.destination.replace(/^public\//,'');
 c.image_revision=createHash('sha256').update(fs.readFileSync(path.join(root,job.destination))).digest('hex');
}
for(const slug of new Set(jobs.map(j=>j.group)))data[slug].ai_layout.source_signature=layoutSourceSignature(data[slug]);
const stripped=structuredClone(data);
for(const j of jobs){
 for(const field of ['image','image_revision']){
  const old=before[j.group].conditions[j.key];
  if(Object.hasOwn(old,field))stripped[j.group].conditions[j.key][field]=old[field];
  else delete stripped[j.group].conditions[j.key][field];
 }
 stripped[j.group].ai_layout.source_signature=before[j.group].ai_layout.source_signature;
}
assert.deepEqual(stripped,before);
console.log(saveCollections({troubles:data},{actor:'User-authorised AI artwork backfill (model not recorded)',expectedRevision:rev}));
refreshGenerated();
