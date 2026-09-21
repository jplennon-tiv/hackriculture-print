import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {printChecksum,layoutDependencies,assertVegetableExtractWritable} from '../../src/lib/vegetablePrint.ts';
let rev=revision(),data=readCollection('vegetables');
if(process.argv.includes('--cabbage-only')){
 data.cabbage.troubles['Mealy Aphid'].control='Tolerate minor colonies; squash damaging ones.';
 console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'admin: John organic fuller-table revision; AI:gpt-6-astra kept full predator advice in master text'}));
 data=readCollection('vegetables');rev=revision();data.cabbage.ai_print_layout.dependencies=layoutDependencies(data.cabbage);delete data.cabbage.ai_print_layout.measurements;
 console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
 process.exit(0);
}
data.radish.troubles['CABBAGE ROOT FLY'].signs='Roots tunnelled by maggots.';
data.radish.troubles['FLEA BEETLE'].signs='Tiny holes in seedling leaves.';
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'admin: John fuller-list request; AI:gpt-6-astra condensed radish table signs, full source retained'}));
data=readCollection('vegetables');rev=revision();
for(const key of ['brussels_sprouts','cabbage','radish']){
 const v=data[key],p=v.ai_print_layout;assert.equal(p.status,'draft');assert.equal(p.locked,false);
 if(key!=='radish'){
  assertVegetableExtractWritable(v,'harvesting');const e=v.ai_print_extracts.sections.harvesting;assert.equal(e.status,'draft');
  if(key==='brussels_sprouts'){
   e.value[1].text='Pick regularly through winter; remove yellow leaves before sprouts deteriorate.';
   e.value[2].text='Eat tender late-winter shoots and leafy tops. By late spring, chop finished stems for compost.';
  }else{
   e.value[0].text='Thin spring rows for greens, leaving plants to heart. Cut heads cleanly near ground level.';
   e.value[1].text='Cross-cut healthy spring or summer stumps for possible extra shoots. Remove diseased stumps; chop healthy stems for compost.';
  }
  e.output_checksum=printChecksum(e.value);e.updated_at=new Date().toISOString();
 }
 p.dependencies=layoutDependencies(v);p.output_checksum=printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))});p.updated_at=new Date().toISOString();delete p.measurements;
}
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
