// Bounded fit adjustment; validate source/output guards before touching drafts.
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {assertVegetableExtractWritable,resolveVegetablePrintLayout,printChecksum} from '../../src/lib/vegetablePrint.ts';
const rev=revision(),data=readCollection('vegetables');
for(const [key,count] of Object.entries({broccoli:5,brussels_sprouts:5,cabbage:6})){
 const v=data[key],plan=v.ai_print_layout;
 assert.equal(plan.status,'draft');assert.equal(plan.locked,false);assert.equal(resolveVegetablePrintLayout(v,true).warning,null);
 plan.value.intro_sentences=3;plan.value.variety_count=count;
 if(key==='broccoli'){
  const values={
   soil_facts:['Choose sunny, firm, fertile soil. Prepare in autumn with compost or well-rotted manure if soil is poor; lime only if needed.','Firm the settled bed before planting. Sprouting broccoli can follow peas, beans, garlic, early roots or salads if the ground is ready in time.'],
   looking_after_the_crop:['Hoe regularly. Protect plants with mesh, especially late calabrese; keep bird netting clear of foliage.','Water in dry weather and mulch in summer. Feed slow or hungry crops.','Stake tall sprouting plants on exposed sites; mulch with straw in very cold winters.','Watch for club root and caterpillars. Pick pests off early and remove diseased or damaged leaves.'],
   harvesting:['Cut well-formed calabrese heads before buds open or stems elongate, without damaging surrounding leaves.','Side shoots usually follow in two or three weeks. Keep plants growing; late calabrese can crop into autumn, but drought reduces yield and frost damages buds.','Pick the main sprouting-broccoli spear first, then tender side shoots regularly. Early sorts may start in January in mild seasons; late sorts continue into April or May.'],
  };
  for(const [slot,texts] of Object.entries(values)){
   assertVegetableExtractWritable(v,slot);const entry=v.ai_print_extracts.sections[slot];assert.equal(entry.status,'draft');
   entry.value=texts.map((text,i)=>({...entry.value[i],text}));entry.output_checksum=printChecksum(entry.value);entry.updated_at=new Date().toISOString();
  }
 }
 plan.output_checksum=printChecksum({...plan.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))});
 plan.updated_at=new Date().toISOString();delete plan.measurements;
}
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
