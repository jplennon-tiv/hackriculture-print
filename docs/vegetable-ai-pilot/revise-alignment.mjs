import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {assertVegetableExtractWritable,printChecksum,layoutDependencies,VEGETABLE_PRINT_REVISION} from '../../src/lib/vegetablePrint.ts';
import {countSentences} from '../../src/lib/sentences.ts';
const rev=revision(),data=readCollection('vegetables'),before=structuredClone(data),now=new Date().toISOString();
for(const key of ['asparagus','radish','celery']){
 const v=data[key],plan=v.ai_print_layout,sections=v.ai_print_extracts.sections;
 assert.equal(plan.status,'draft');assert.equal(plan.locked,false);
 assert.equal(plan.output_checksum,printChecksum({...plan.value,extracts:Object.fromEntries(Object.entries(sections).map(([k,e])=>[k,e.value]))}));
 if(key==='radish'){
  assertVegetableExtractWritable(v,'final_tips');assert.equal(sections.final_tips.status,'draft');
  const value=v.looking_after_the_crop.slice(0,3).map(i=>({text:i.short_text||i.text,rank:i.rank,icon:i.icon}));
  Object.assign(sections.final_tips,{value,output_checksum:printChecksum(value),updated_at:now,updated_by:'AI:gpt-6-astra',editorial_note:'Restored the three original care tips verbatim, per John; stacked rows fill the right-column gap.'});
  plan.value.intro_sentences=4;
  plan.value.variety_count=9;
 }
 plan.value.align_bottoms=true;
 plan.value.intro_sentences=key==='celery'?3:countSentences(v.introduction);
 if(key==='celery')plan.value.variety_count=5;
 plan.renderer_revision=VEGETABLE_PRINT_REVISION;
 plan.dependencies=layoutDependencies(v);
 plan.output_checksum=printChecksum({...plan.value,extracts:Object.fromEntries(Object.entries(sections).map(([k,e])=>[k,e.value]))});
 plan.updated_at=now;plan.updated_by='AI:gpt-6-astra';delete plan.measurements;
}
const stripped=structuredClone(data);for(const key of ['asparagus','radish','celery']){stripped[key].ai_print_extracts=before[key].ai_print_extracts;stripped[key].ai_print_layout=before[key].ai_print_layout;}assert.deepEqual(stripped,before);
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
