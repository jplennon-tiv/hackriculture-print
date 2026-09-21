import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {printChecksum,layoutDependencies,extractDependencies,assertVegetableExtractWritable} from '../../src/lib/vegetablePrint.ts';
const rev=revision(),data=readCollection('vegetables'),now=new Date().toISOString();
for(const [key,count]of Object.entries({broccoli:7,brussels_sprouts:9,cabbage:8})){
 const v=data[key],p=v.ai_print_layout;
 assert.equal(p.status,'draft');assert.equal(p.locked,false);
 assert.equal(p.output_checksum,printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))}));
 for(const [slot,e]of Object.entries(v.ai_print_extracts.sections)){
  assertVegetableExtractWritable(v,slot);assert.equal(e.status,'draft');
  if(key==='brussels_sprouts'&&slot==='key_notes')e.value[0].title='Fertile soil and steady growth.';
  e.dependencies=extractDependencies(v,Object.keys(e.dependencies));e.output_checksum=printChecksum(e.value);e.updated_at=now;
 }
 p.value.pest_limit=count;p.dependencies=layoutDependencies(v);
 p.output_checksum=printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))});
 p.updated_at=now;delete p.measurements;
}
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
