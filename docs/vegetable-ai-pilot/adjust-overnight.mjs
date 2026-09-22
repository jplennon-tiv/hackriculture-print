import fs from 'node:fs';
import assert from 'node:assert/strict';
import{readCollection,revision,saveCollections}from'../../../hackriculture-data/lib/records.mjs';
import{printChecksum,layoutDependencies,assertVegetableExtractWritable}from'../../src/lib/vegetablePrint.ts';
const[label,changesPath]=process.argv.slice(2),changes=JSON.parse(fs.readFileSync(changesPath));
assert.match(label,/^overnight-\d\d$/);
const rev=revision(),data=readCollection('vegetables'),before=structuredClone(data);
const file=`docs/vegetable-ai-pilot/${label}-restore.json`,r=JSON.parse(fs.readFileSync(file));
for(const[key,change]of Object.entries(changes)){
 assert.ok(Object.hasOwn(r.selected,key));const v=data[key],p=v.ai_print_layout;assert.equal(p.status,'draft');assert.equal(p.locked,false);
 assert.equal(p.output_checksum,printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([k,e])=>[k,e.value]))}));
 Object.assign(p.value,change.layout??{});
 for(const[slot,value]of Object.entries(change.sections??{})){assertVegetableExtractWritable(v,slot);const e=v.ai_print_extracts.sections[slot];e.value=value;e.output_checksum=printChecksum(value);e.updated_at=new Date().toISOString();e.updated_by='AI:gpt-6-astra';e.editorial_note+=' '+change.reason;}
 p.dependencies=layoutDependencies(v);p.output_checksum=printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([k,e])=>[k,e.value]))});p.updated_at=new Date().toISOString();p.updated_by='AI:gpt-6-astra';delete p.measurements;
 assert.deepEqual(v.print_planting,before[key].print_planting);
}
const save=saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'});
const backup=fs.readdirSync('../hackriculture-data/backups/admin',{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name).sort().at(-1);
r.transactions.push({at:new Date().toISOString(),previous_revision:rev,save,backup:`backups/admin/${backup}`,changes});r.revision=save.revision;fs.writeFileSync(file,JSON.stringify(r,null,2)+'\n');console.log(save);
