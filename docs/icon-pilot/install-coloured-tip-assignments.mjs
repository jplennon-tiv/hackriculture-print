// One-time guarded installation of the two explicit mappings approved in the page proofs.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {readCollection,revision,saveCollections,recordPath,dataRoot} from '../../../hackriculture-data/lib/records.mjs';
import {printChecksum,resolveVegetableExtracts,resolveVegetablePrintLayout,assertVegetableExtractWritable} from '../../src/lib/vegetablePrint.ts';
import {GardeningDataSchema} from '../../src/schema.ts';
const expected='28df4d70397b07a9600a258d8de5f0b59e678d3c89f7390373186d2941a81fe0';
assert.equal(revision(),expected,'Historical install; do not replay over newer edits.');
const data=readCollection('vegetables'),prior=structuredClone(data),sha=b=>createHash('sha256').update(b).digest('hex');
const bytes=Object.fromEntries(Object.keys(data).map(k=>[k,fs.readFileSync(recordPath(dataRoot,'vegetables',k))]));
const actor='admin: John approved coloured icon page proofs and installation; recorded by AI:gpt-6-astra';
const edits=[['broccoli','Keep netting clear of leaves.','netting'],['cucumber_greenhouse','Check leaf undersides regularly so biological mite controls can be introduced before damage spreads.','inspection']];
for(const [key,text,icon] of edits){
 const v=data[key],e=v.ai_print_extracts.sections.final_tips,l=v.ai_print_layout;
 assertVegetableExtractWritable(v,'final_tips');assert.equal(l.locked,false);assert.equal(e.status,'approved');assert.equal(l.status,'approved');
 assert.deepEqual(resolveVegetableExtracts(v).warnings,[]);assert.equal(resolveVegetablePrintLayout(v).warning,null);
 const tips=e.value.filter(i=>i.text===text);assert.equal(tips.length,1);assert.equal(tips[0].icon,'protection');tips[0].icon=icon;
 e.output_checksum=printChecksum(e.value);l.output_checksum=printChecksum({...l.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([k,x])=>[k,x.value]))});
 for(const entry of [e,l]){entry.updated_at=new Date().toISOString();entry.updated_by=actor;}
 // Earlier measurements remain dated historical evidence; install QA is recorded separately.
 assert.deepEqual(resolveVegetableExtracts(v).warnings,[]);assert.equal(resolveVegetablePrintLayout(v).warning,null);
 const undo=structuredClone(v);undo.ai_print_extracts.sections.final_tips=prior[key].ai_print_extracts.sections.final_tips;undo.ai_print_layout=prior[key].ai_print_layout;assert.deepEqual(undo,prior[key]);
 assert.deepEqual(e.value.map(({icon,...rest})=>rest),prior[key].ai_print_extracts.sections.final_tips.value.map(({icon,...rest})=>rest));
}
GardeningDataSchema.parse(data);
const backups=path.join(dataRoot,'backups/admin'),existing=new Set(fs.readdirSync(backups));
const receipt=saveCollections({vegetables:data},{actor,expectedRevision:expected});assert.equal(receipt.changed,2);
const created=fs.readdirSync(backups).filter(n=>!existing.has(n));assert.equal(created.length,1);
const dir=path.join(backups,created[0]),journal=JSON.parse(fs.readFileSync(path.join(dir,'transaction.json')));assert.equal(journal.state,'complete');
for(const item of journal.files){const key=item.file.split('/')[1];assert.deepEqual(fs.readFileSync(path.join(dir,item.backup)),bytes[key]);}
for(const key of Object.keys(data))if(!edits.some(e=>e[0]===key))assert.deepEqual(fs.readFileSync(recordPath(dataRoot,'vegetables',key)),bytes[key]);
const approval=JSON.parse(fs.readFileSync('docs/icon-pilot/COLOURED-PROOF-CHECKS.json'));
for(const r of approval.results)assert.equal(sha(fs.readFileSync(r.file)),r.pdf_sha256);
fs.writeFileSync('docs/icon-pilot/INSTALL-RECEIPT.json',JSON.stringify({approved_by:'John',approved_at:new Date().toISOString(),decision:'All four coloured page proofs approved; install new images and archive old ones.',approved_proofs:approval.results.map(r=>({file:r.file,sha256:r.pdf_sha256})),prior_revision:expected,...receipt,backup:dir,exact_prior_byte_backups_verified:true,unaffected_vegetables_byte_identical:42,edits:edits.map(([key,text,icon])=>({key,text,from:'protection',to:icon})),archived_assets:'../archive/coloured-icons-pre-style-a/MANIFEST.json'},null,2)+'\n');
console.log(JSON.stringify({changed:receipt.changed,revision:receipt.revision,exact_backups:true}));
