import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {printChecksum,layoutDependencies,assertVegetableExtractWritable} from '../../src/lib/vegetablePrint.ts';
const rev=revision(),data=readCollection('vegetables');
const concise={
 'Club Root (Finger and Toe)':['Swollen roots; wilting.','Use clean ground and tools. Test before liming; no cure.'],
 'Cabbage Caterpillars':['Chewed leaves; caterpillars.','Pick off eggs and caterpillars; cover with fine mesh.'],
 'Cabbage Root Fly':['Wilting; tunnelled roots.','Fit collars or insect-proof mesh; rotate brassicas.'],
 'Slugs and Snails':['Holes; seedlings eaten.','Hand-pick at dusk; remove yellow leaves around seedlings.'],
 'SLUGS':['Holes; seedlings eaten.','Hand-pick at dusk; remove yellow leaves around seedlings.'],
 'Flea Beetle':['Small holes; jumping beetles.','Mesh young plants; tolerate minor feeding on established crops.'],
 'Mealy Aphid':['Grey colonies; curled leaves.','Squash damaging colonies; encourage predators and tolerate minor populations.'],
 'Cabbage Whitefly':['White insects under leaves.','Usually tolerate outer-leaf colonies; encourage predators.'],
 'PIGEONS':['Leaves pecked or stripped.','Net securely, clear of leaves.'],
 'Pigeons':['Leaves pecked or stripped.','Net securely, clear of leaves.'],
 'BLOWN SPROUTS':['Open, leafy buttons.','Choose F1 varieties; maintain fertility, water steadily and pick promptly.'],
 'FUNGAL LEAF SPOTS':['Spots or rings on foliage.','Remove badly affected leaves; improve airflow. Peel lightly marked sprouts.'],
};
for(const key of ['broccoli','brussels_sprouts','cabbage']){
 for(const [name,[signs,control]]of Object.entries(concise)){
  const t=data[key].troubles[name];if(!t||t.control===control)continue;
  // Retain complete organic methods in the full advice, with compact table fields.
  if(!t.text.includes(t.control))t.text+=' '+t.control;
  t.signs=signs;t.control=control;
 }
 const t=data[key].troubles.FROST;if(t){if(!t.text.includes(t.control))t.text+=' '+t.control;
 t.signs=key==='broccoli'?'Cold-damaged shoots.':'Cold-damaged older buttons.';
 t.control=key==='broccoli'?'Firm loosened plants; stake exposed stems and mulch.':'Pick regularly; keep cut stems cool and frost-free.';}
}
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'admin: John authorised fuller organic master advice; AI:gpt-6-astra retained details and condensed table fields'}));
const next=revision(),fresh=readCollection('vegetables');
for(const [key,count]of Object.entries({broccoli:6,brussels_sprouts:8,cabbage:7})){
 const v=fresh[key],p=v.ai_print_layout;assert.equal(p.status,'draft');assert.equal(p.locked,false);
 if(key==='broccoli'){
  assertVegetableExtractWritable(v,'harvesting');const e=v.ai_print_extracts.sections.harvesting;
  const texts=[
   'Cut well-formed calabrese heads before buds open or stems elongate, without damaging surrounding leaves. Side shoots follow in two or three weeks; steady growth can extend cropping for about two months.',
   'Late calabrese may crop into autumn or early winter, but drought reduces yield and frost damages buds.',
   'Pick the main sprouting-broccoli spear first, then side shoots regularly while tender. Early sorts may start in January in mild seasons; late sorts continue into April or May. Later shoots become more numerous and thinner as plants try to flower.',
  ];e.value=texts.map(text=>({text,rank:8,icon:'harvest'}));e.output_checksum=printChecksum(e.value);e.updated_at=new Date().toISOString();e.editorial_note='Full harvest distinctions condensed into three paragraphs to share space with a fuller pest table; main and side shoots, timing, two-month duration, drought/frost and thinner late shoots retained.';
 }
 p.value.pest_limit=count;p.dependencies=layoutDependencies(v);p.output_checksum=printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))});p.updated_at=new Date().toISOString();delete p.measurements;
}
console.log(saveCollections({vegetables:fresh},{expectedRevision:next,actor:'AI:gpt-6-astra'}));
