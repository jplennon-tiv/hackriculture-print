import fs from'node:fs';import assert from'node:assert/strict';import crypto from'node:crypto';
import{readCollection,revision,saveCollections}from'../../../hackriculture-data/lib/records.mjs';
import{resolveVegetablePrintLayout,printChecksum}from'../../src/lib/vegetablePrint.ts';
const dir='docs/vegetable-ai-pilot/',checks=JSON.parse(fs.readFileSync(dir+'PAGE-FILL-CHECKS.json')),record=JSON.parse(fs.readFileSync(dir+'PAGE-FILL-RESTORE.json'));
const files=Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync(dir+'PAGE-FILL-CODE-CHECKS.json')).files).map(([f,h])=>[f,h.current]));
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');for(const[f,h]of Object.entries(files))assert.equal(sha(f),h);
const data=readCollection('vegetables'),before=structuredClone(data),rev=revision();
for(const key of record.changed){const v=data[key],results=checks.filter(c=>c.key===key),plan=v.ai_print_layout;assert.equal(results.length,2);assert.equal(plan.status,'draft');assert.equal(resolveVegetablePrintLayout(v,true).warning,null);
 for(const c of results){assert.equal(c.pages,2);assert.equal(c.layout_checksum,plan.output_checksum);assert.equal(c.source_checksum,printChecksum(plan.dependencies));assert.equal(c.pdf_sha256,sha(c.path));assert.equal(c.error,null);assert.equal(c.fonts,'loaded');assert.deepEqual(c.missing,[]);assert.ok(c.alignment.every(a=>a.column_bottom_gap_px<=1));}
 plan.measurements={checked_at:new Date().toISOString(),checked_by:'AI:gpt-6-astra',format:'A4',margin_mm:{top:18,bottom:20,left:14,right:14},renderer_files:files,results};
}
const strip=v=>Object.fromEntries(Object.entries(v).filter(([k])=>!k.startsWith('ai_')&&k!=='_field_metadata'));
const prior=JSON.parse(fs.readFileSync('../hackriculture-data/'+record.backup+'/transaction.json'));
for(const f of prior.files){const key=f.file.split('/')[1],v=JSON.parse(fs.readFileSync('../hackriculture-data/'+record.backup+'/'+f.backup));assert.deepEqual(strip(data[key]),strip(v));}
for(const[k,v]of Object.entries(before))if(!record.changed.includes(k))assert.deepEqual(data[k],v);
const save=saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'});
record.followups??=[];record.followups.push({at:new Date().toISOString(),previous_revision:rev,save,kind:'measurements',backup:'backups/admin/'+fs.readdirSync('../hackriculture-data/backups/admin').sort().at(-1)});record.final_revision=save.revision;record.status='revised-draft-proofs';record.master_advice_unchanged=true;
fs.writeFileSync(dir+'PAGE-FILL-RESTORE.json',JSON.stringify(record,null,2)+'\n');console.log(save);
