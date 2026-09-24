// One bounded, revision-guarded save after both-unit candidate proof review.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readCollection,revision,recordPath,dataRoot,saveCollections,canonical} from '../../../hackriculture-data/lib/records.mjs';
import {GardeningDataSchema} from '../../src/schema.ts';
import {VEGETABLE_PRINT_REVISION,resolveVegetablePrintLayout} from '../../src/lib/vegetablePrint.ts';
import {prepare,crops} from './prepare.mjs';
const expectedRevision='e25a96e1cc08f8beab170f0750d9cd7628dcb33dbe25bee0b2eb145944b13c8b';
assert.equal(revision(),expectedRevision);
const proofs=JSON.parse(fs.readFileSync('docs/page-fit/CANDIDATE.json','utf8'));
assert.equal(proofs.revision,expectedRevision);assert.equal(proofs.results.length,10);
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const key of crops)for(const units of ['metric','imperial']){
 const p=proofs.results.find(p=>p.key===key&&p.units===units);assert.ok(p);
 assert.equal(p.pages,2);assert.deepEqual(p.warnings,[]);assert.deepEqual(p.missing,[]);assert.equal(p.fonts,'loaded');assert.equal(hash(fs.readFileSync(p.file)),p.sha256);
}
const original=readCollection('vegetables'),next=prepare(original),before=new Map();
for(const collection of ['vegetables','troubles'])for(const key of Object.keys(readCollection(collection))){const file=recordPath(dataRoot,collection,key);before.set(path.relative(dataRoot,file),fs.readFileSync(file));}
for(const key of crops){
 const a=original[key],b=next[key];
 assert.deepEqual(b.ai_print_extracts,a.ai_print_extracts);assert.deepEqual(b.ai_print_layout.value,a.ai_print_layout.value);
 for(const [label,row] of Object.entries(a.troubles)){
  const fresh=b.troubles[label];assert.ok(fresh);assert.equal(fresh.rank,row.rank);
  if(canonical(row)!==canonical(fresh)){
   assert.ok(!row.locked,`${key}/${label} locked`);
   const prefix='/troubles/'+label.replaceAll('~','~0').replaceAll('/','~1');
   for(const [pointer,meta] of Object.entries(a._field_metadata??{}))if(pointer===prefix||pointer.startsWith(prefix+'/'))assert.ok(!meta.locked,pointer);
   assert.ok(canonical(fresh.text)===canonical(row.text)||(typeof row.text==='string'&&fresh.text.includes(row.text)),'Full original advice retained');
   if(fresh.control!==row.control)assert.ok(fresh.text.includes(row.control));
   if(fresh.signs!==row.signs)assert.ok(fresh.text.includes(row.signs));
  }
 }
 b.ai_print_layout.renderer_revision=VEGETABLE_PRINT_REVISION;
 b.ai_print_layout.measurements={checked_at:new Date().toISOString(),scope:'A4, both units; candidate PDF pages visually inspected; unchanged approved layout choices',proofs:proofs.results.filter(p=>p.key===key).map(({units,file,pages,content,warnings,sha256})=>({units,file,pages,content,warnings,sha256}))};
 assert.equal(resolveVegetablePrintLayout(b).warning,null);
}
GardeningDataSchema.parse(next);
assert.deepEqual(Object.keys(next).filter(k=>canonical(original[k])!==canonical(next[k])).sort(),[...crops].sort());
const backups=path.join(dataRoot,'backups/admin'),prior=new Set(fs.readdirSync(backups));
const result=saveCollections({vegetables:next},{expectedRevision,actor:'admin: John authorised page-fit corrections; applied by AI:gpt-6-astra'});
assert.equal(result.changed,5);
const added=fs.readdirSync(backups).filter(k=>!prior.has(k));assert.equal(added.length,1);
const backup=path.join(backups,added[0]),journal=JSON.parse(fs.readFileSync(path.join(backup,'transaction.json'),'utf8'));
assert.equal(journal.state,'complete');assert.equal(journal.files.length,5);
const changed=new Set(journal.files.map(f=>f.file));
for(const f of journal.files)assert.deepEqual(fs.readFileSync(path.join(backup,f.backup)),before.get(f.file),'Exact prior-byte backup');
for(const [file,bytes] of before)if(!changed.has(file))assert.deepEqual(fs.readFileSync(path.join(dataRoot,file)),bytes,file);
fs.writeFileSync('docs/page-fit/SAVE-RECEIPT.json',JSON.stringify({date:new Date().toISOString(),previous_revision:expectedRevision,current_revision:result.revision,changed:result.changed,backup,exact_prior_bytes_verified:true,other_records_unchanged:before.size-changed.size,unchanged_print_extracts_and_layout_choices:true,proof_approval:'Prepared for John to review; existing approval statuses preserved, no new prose self-approved.',sources:['https://www.rhs.org.uk/vegetables/watering','https://www.rhs.org.uk/vegetables/broad-beans/grow-your-own'],files:journal.files.map(f=>({...f,before_sha256:hash(before.get(f.file)),after_sha256:hash(fs.readFileSync(path.join(dataRoot,f.file)))}))},null,2)+'\n');
console.log(result,backup);
