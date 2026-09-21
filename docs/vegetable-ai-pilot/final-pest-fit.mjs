import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {printChecksum,layoutDependencies,assertVegetableExtractWritable} from '../../src/lib/vegetablePrint.ts';
const rev=revision(),data=readCollection('vegetables');
for(const key of ['bean_broad','bean_french']){
 const t=data[key].troubles['Halo Blight'];if(!t.text.includes(t.control))t.text+=' '+t.control;
 t.control='Remove diseased plants; use clean seed, save none from affected plants, and rotate to a fresh site.';
}
data.carrot.troubles['Small Roots'].signs='Small roots; weak growth.';
data.radish.troubles['WOODY OR HOLLOW ROOTS'].signs='Hot, woody or hollow roots.';
data.radish.troubles['WOODY OR HOLLOW ROOTS'].control='Water evenly; thin and harvest promptly.';
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'admin: John requested fuller lists; AI:gpt-6-astra shortened table fields with full master advice retained'}));
const fresh=readCollection('vegetables'),next=revision();
for(const key of ['bean_broad','bean_french','carrot','radish','brussels_sprouts','cabbage']){
 const v=fresh[key],p=v.ai_print_layout;assert.equal(p.status,'draft');assert.equal(p.locked,false);
 const edit=(slot,index,text)=>{assertVegetableExtractWritable(v,slot);const e=v.ai_print_extracts.sections[slot];assert.equal(e.status,'draft');e.value[index].text=text;e.output_checksum=printChecksum(e.value);e.updated_at=new Date().toISOString();};
 if(key==='brussels_sprouts'){
  p.value.pest_limit=7;
  edit('looking_after_the_crop',2,'Mulch dry or hungry soil. Prevent drought and growth checks that contribute to blown sprouts.');
  edit('harvesting',2,'Eat tender late-winter flowering shoots and leafy tops before they toughen. Cut down and chop finished stems for composting by late spring.');
 }
 if(key==='cabbage')edit('harvesting',2,'Cut winter heads as needed; store sound heads frost-free before severe cold. Red and winter white types keep best: remove loose leaves, keep cool and dry on straw or in lined boxes, and check for rot.');
 p.dependencies=layoutDependencies(v);p.output_checksum=printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))});p.updated_at=new Date().toISOString();delete p.measurements;
}
console.log(saveCollections({vegetables:fresh},{expectedRevision:next,actor:'AI:gpt-6-astra'}));
