import fs from'node:fs';import assert from'node:assert/strict';
import{readCollection,revision,saveCollections}from'../../../hackriculture-data/lib/records.mjs';
import{printChecksum,layoutDependencies,extractDependencies,assertVegetableExtractWritable}from'../../src/lib/vegetablePrint.ts';
import{VegetableSchema}from'../../src/schema.ts';
const proposals=JSON.parse(fs.readFileSync('docs/vegetable-ai-pilot/page-fill-proposals.json'));
const rev=revision(),data=readCollection('vegetables'),before=structuredClone(data),now=new Date().toISOString();
assert.equal(rev,'4ab6f355ed0d25cadd9c6ebfdebe0ce603e94c13c3f9a5ea37cfedab4edbe8e1','Inspect newer data before saving proposals');
for(const[key,c]of Object.entries(proposals)){
 const v=data[key],p=v.ai_print_layout;assert.equal(p.status,'draft');assert.equal(p.locked,false);
 assert.equal(p.output_checksum,printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))}));
 Object.assign(p.value,c.layout);
 for(const[slot,value]of Object.entries(c.sections)){
  assertVegetableExtractWritable(v,slot);
  const old=v.ai_print_extracts.sections[slot];if(old&&printChecksum(value)===old.output_checksum)continue;
  v.ai_print_extracts.sections[slot]={...old,value,dependencies:old?.dependencies??extractDependencies(v,[slot]),output_checksum:printChecksum(value),status:'draft',locked:false,updated_at:now,updated_by:'AI:gpt-6-astra',editorial_note:(old?.editorial_note??'')+' '+c.reason};
 }
 p.dependencies=layoutDependencies(v);p.output_checksum=printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))});p.updated_at=now;p.updated_by='AI:gpt-6-astra';delete p.measurements;VegetableSchema.parse(v);
 const withoutAI=v=>Object.fromEntries(Object.entries(v).filter(([k])=>!k.startsWith('ai_')));
 assert.deepEqual(withoutAI(v),withoutAI(before[key]));
}
for(const[k,v]of Object.entries(before))if(!Object.hasOwn(proposals,k))assert.deepEqual(data[k],v);
const save=saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'});
const backup=fs.readdirSync('../hackriculture-data/backups/admin',{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name).sort().at(-1);
fs.writeFileSync('docs/vegetable-ai-pilot/PAGE-FILL-RESTORE.json',JSON.stringify({at:now,previous_revision:rev,save,backup:`backups/admin/${backup}`,changed:Object.keys(proposals),protected:'All non-ai fields, all 15 other records and all planting companions unchanged'},null,2)+'\n');console.log(save,backup);
