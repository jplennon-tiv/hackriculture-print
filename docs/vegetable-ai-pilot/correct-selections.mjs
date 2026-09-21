import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {printChecksum,layoutDependencies,assertVegetableExtractWritable,VEGETABLE_PRINT_REVISION} from '../../src/lib/vegetablePrint.ts';
const data=readCollection('vegetables'),before=structuredClone(data),rev=revision(),now=new Date().toISOString();
const icons={asparagus:['soil','feeding'],radish:['water','harvest','water'],celery:['protection','protection'],beetroot:['water','harvest','harvest'],carrot:['soil','harvest','storage'],lettuce:['protection','harvest','sow'],bean_broad:['sow','harvest','soil'],bean_french:['sow','support','harvest'],bean_runner:['support','water','harvest']};
for(const [key,keys]of Object.entries(icons)){
 const v=data[key],e=v.ai_print_extracts.sections.final_tips,l=v.ai_print_layout;
 assertVegetableExtractWritable(v,'final_tips');assert.equal(l.locked,false);
 assert.equal(printChecksum(l.dependencies),printChecksum(layoutDependencies(v)),'source changed: '+key);
 assert.equal(l.output_checksum,printChecksum({...l.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([k,x])=>[k,x.value]))}));
 assert.equal(e.value.length,keys.length);
 const corrected=e.value.map((x,i)=>({...x,icon:keys[i]}));
 if(printChecksum(corrected)!==e.output_checksum){e.value=corrected;e.output_checksum=printChecksum(corrected);e.updated_at=now;e.updated_by='AI:gpt-6-astra';}
 if(key==='bean_runner'){l.value.variety_count=5;l.value.intro_sentences=2;}
 if(key==='bean_broad')l.value.variety_count=5;
 if(key==='carrot')l.value.variety_count=3;
 if(key==='lettuce')l.value.variety_count=5;
 l.renderer_revision=VEGETABLE_PRINT_REVISION;l.updated_at=now;l.updated_by='AI:gpt-6-astra';delete l.measurements;
 l.output_checksum=printChecksum({...l.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([k,x])=>[k,x.value]))});
 // User requested icon/renderer correction, not a rewrite or new approval.
 assert.equal(e.status,before[key].ai_print_extracts.sections.final_tips.status);assert.equal(l.status,before[key].ai_print_layout.status);
}
const undo=structuredClone(data);for(const k of Object.keys(icons)){undo[k].ai_print_extracts=before[k].ai_print_extracts;undo[k].ai_print_layout=before[k].ai_print_layout;}assert.deepEqual(undo,before);
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
