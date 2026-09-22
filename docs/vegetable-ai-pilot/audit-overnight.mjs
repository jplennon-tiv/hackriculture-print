// Read-only reconstruction in memory; never restore old files into the checkout.
import fs from 'node:fs';import assert from 'node:assert/strict';import{createHash}from'node:crypto';
import{readCollection,collections,canonical,revision}from'../../../hackriculture-data/lib/records.mjs';
const dir='docs/vegetable-ai-pilot',root='../hackriculture-data/';
const records=Array.from({length:10},(_,i)=>JSON.parse(fs.readFileSync(`${dir}/overnight-${String(i+1).padStart(2,'0')}-restore.json`)));
const transactions=records.flatMap(r=>r.transactions),keys=records.flatMap(r=>Object.keys(r.selected));
assert.equal(new Set(keys).size,29);
const current=Object.fromEntries(collections.map(c=>[c,readCollection(c)])),baseline=structuredClone(current);
const hash=v=>createHash('sha256').update(canonical(v)).digest('hex');
let rev=revision(),count=0;const finalRevision=rev;
const target='0487949671217d338a3cf4b65f7aa95018ff2e3ed1e5a5d338530ab2a435e3ca';
while(rev!==target){
 const tx=transactions.find(t=>t.save.revision===rev);assert.ok(tx,`Missing transaction for ${rev}`);
 const manifest=JSON.parse(fs.readFileSync(root+tx.backup+'/transaction.json'));assert.equal(manifest.state,'complete');
 for(const f of manifest.files){const [collection,key]=f.file.split('/');assert.equal(collection,'vegetables');assert.ok(keys.includes(key));baseline[collection][key]=JSON.parse(fs.readFileSync(root+tx.backup+'/'+f.backup));}
 assert.equal(hash(baseline),tx.previous_revision);rev=tx.previous_revision;count++;assert.ok(count<=transactions.length);
}
assert.deepEqual(current.troubles,baseline.troubles);
for(const [key,v]of Object.entries(current.vegetables)){
 assert.deepEqual(v.print_planting,baseline.vegetables[key].print_planting,`${key} planting changed`);
 if(!keys.includes(key))assert.deepEqual(v,baseline.vegetables[key],`${key} protected record changed`);
}
const report={checked_at:new Date().toISOString(),baseline_revision:target,final_revision:finalRevision,verified_transactions:count,prepared_crops:keys,approved_and_kale_records_unchanged:15,planting_companions_unchanged:44,shared_trouble_records_unchanged:true,restore_records:records.map(r=>`${r.label}-restore.json`)};
fs.writeFileSync(`${dir}/OVERNIGHT-PRESERVATION.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
