import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {extractDependencies,printChecksum,layoutDependencies,VEGETABLE_PRINT_REVISION,assertVegetableExtractWritable} from '../../src/lib/vegetablePrint.ts';
const data=readCollection('vegetables'),before=structuredClone(data),rev=revision(),now=new Date().toISOString();
const items=(texts,icon='soil')=>texts.map(text=>({text,rank:8,icon}));
const edits={
 beetroot:{
  key_notes:[{title:'A cool-climate crop.',body:'Use well-drained soil rich in organic matter.'},{title:'Keep moisture steady.',body:'Drought hardens roots; sudden wet can split them.'},{title:'Sow for a long season.',body:'Successive sowings extend the harvest.'}],
  soil_facts:items(['Use humus-rich, well-drained soil, but avoid fresh manure before sowing. Remove stones; long roots need deep, sandy soil.','Use ground manured for an earlier crop, or add well-rotted compost in autumn. Lime acid soil towards pH 6.5; feed poor ground if needed.']),
  looking_after_the_crop:items(['Thin direct sowings early to one plant per station; protect seedlings from birds. Plant module clumps intact and take their largest roots first.','Hoe carefully without damaging roots. Water moderately and evenly: drought hardens roots, while sudden wet after a dry spell can split them.','Fleece can bring crops forward, but weed beneath it regularly. Pick young leaves before they toughen and use them like spinach.']),
  harvesting:items(['Pull globe roots before they exceed cricket-ball size. Twist larger roots from module clumps, leaving smaller ones to swell.','Fork up storage roots carefully in autumn without touching them with the prongs. Discard damaged roots; twist off foliage, leaving short stalks rather than cutting the roots.','Roots can stay outside in mild winters, but lift before severe frost. Store sound roots cool in paper sacks or moist sand, without touching.'],'harvest'),
  sowing_notes:items(['Soak seed clusters for several hours or overnight to speed germination. Early sowings under cover can crop from late spring; later sowings extend the season.']),
  final_tips:items(['Keep moisture steady; avoid drought.','Pick the largest roots from clumps.','Twist off foliage; do not cut roots.']),
 },
 carrot:{
  key_notes:[{title:'Prepare the soil well.',body:'Deep, fertile, stone-free and sandy soil is ideal.'},{title:'Avoid fresh manure.',body:'Follow a crop manured the previous year.'},{title:'Weed young seedlings.',body:'Weeds can easily smother them.'}],
  soil_facts:items(['Use deep, fertile, sandy, stone-free soil; choose short-rooted varieties for heavy or stony ground. Improve heavy clay well before sowing.','Follow a previously manured crop. Avoid fresh manure, which encourages forking; lime acid soil in winter and prepare a fine seedbed.']),
  looking_after_the_crop:items(['Thin only where necessary, in the evening or damp weather; water dry ground first. Firm soil afterwards and remove thinnings: bruised roots attract carrot fly.','Weed carefully while seedlings are small. Avoid hoeing close to established carrots or loosening soil around their roots.','Water deeply and evenly during dry spells. Sudden heavy watering after drought may split roots.','Keep young beds bare to reduce slug shelter; clear early weeds before later sowings.']),
  harvesting:items(['Lift small carrots as needed from June; baby roots may be ready in about eight weeks. Work from one row end and ease roots with a fork to avoid disturbance.','Usually lift maincrops for storage in October. Lift sooner if carrot fly appears, and before hard frost or very wet weather causes splitting.','Store only sound roots. Trim leaves to about 1/2 in. (1.3 cm) above the crown; keep roots separate in sand, cool and ventilated just above freezing. Inspect for rot; sound roots can keep until March.'],'harvest'),
  sowing_notes:items(['Mix seed with sand to sow thinly. Wait for warmer soil when early conditions are cold and wet.']),
  final_tips:items(['Avoid fresh manure and disturbance around established roots.','Work from one end of the row when harvesting.','Inspect stored roots and remove any that rot.']),
 },
 lettuce:{
  key_notes:[{title:'Cool, moist soil gives tender leaves.',body:'Sun or light shade is suitable; hot, dry conditions encourage bolting.'},{title:'Prepare a clean, fertile bed.',body:'Well-rotted compost helps the soil hold water evenly.'},{title:'Avoid acid soil.',body:'Lime if necessary and improve heavy clay with compost.'}],
  soil_facts:items(['Use cool, moist, humus-rich soil that drains well. Prepare a clean bed with well-rotted compost or manure.','Lime acid soil towards neutral; improve heavy clay with repeated compost dressings. Fleece or cloches help early crops, with room for growth.']),
  looking_after_the_crop:items(['Keep beds clean and weed-free, with bare soil between plants to reduce slug shelter.','Water deeply when needed, especially hearting crops, rather than sprinkling every day.','Protect early plants with fleece or cloches for faster growth. Established young plants tolerate light frost.','Harvest or remove lettuces promptly when flower stems rise; leaf quality soon declines.']),
  harvesting:items(['Pick outer leaves regularly, leaving the centre and at least four young leaves so the plant regrows.','Harvest firm-hearted lettuces promptly before warm weather causes bolting. Secondary shoots may be useful, but young plants give the best leaves.','Harvest close to use; lettuce does not store for long. Trim damaged leaves and compost overmature plants before they shelter slugs or seed.'],'harvest'),
  sowing_notes:items(['Sow small leaf-lettuce batches from March to August. Modules help early crops and in sluggy weather; fewer strong plants can be picked repeatedly.']),
  final_tips:items(['Keep summer seed trays cool and shaded.','Pick outer leaves without damaging the growing point.','Sow hearting lettuces in succession to avoid a glut.']),
 },
};
const storage=edits.carrot.harvesting[2].text;
edits.carrot.harvesting[2].text={metric:storage.replace('1/2 in. (1.3 cm)','1.3 cm'),imperial:storage.replace('1/2 in. (1.3 cm)','1/2 in.')};
for(const [key,values] of Object.entries(edits)){
 const v=data[key];
 if(v.ai_print_layout){assert.equal(v.ai_print_layout.status,'draft');assert.equal(v.ai_print_layout.locked,false);assert.equal(v.ai_print_layout.output_checksum,printChecksum({...v.ai_print_layout.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([k,e])=>[k,e.value]))}));}
 const sections={};for(const [slot,value] of Object.entries(values)){
  assertVegetableExtractWritable(v,slot);assert.notEqual(v.ai_print_extracts?.sections[slot]?.status,'approved');
  const paths=slot==='sowing_notes'?['sowing_and_planting']:slot==='final_tips'?['soil_facts','looking_after_the_crop','harvesting','sowing_and_planting']:slot==='key_notes'?['key_notes','soil_facts']: [slot];
  sections[slot]={value,dependencies:extractDependencies(v,paths),output_checksum:printChecksum(value),updated_at:now,updated_by:'AI:gpt-6-astra',status:'draft',locked:false,editorial_note:'Close source-based condensation for batch 01; full master and approved planting companion retained.'};
 }
 v.ai_print_extracts={version:1,sections};
 const value={pest_limit:4,target_pages:2,tips_position:key==='carrot'?'left-column':'full-width',intro_sentences:key==='lettuce'?2:4,variety_count:6,align_bottoms:true};
 v.ai_print_layout={value,dependencies:layoutDependencies(v),output_checksum:printChecksum({...value,extracts:values}),updated_at:now,updated_by:'AI:gpt-6-astra',status:'draft',locked:false,renderer_revision:VEGETABLE_PRINT_REVISION};
}
const undo=structuredClone(data);for(const key of Object.keys(edits))for(const f of ['ai_print_extracts','ai_print_layout']){if(Object.hasOwn(before[key],f))undo[key][f]=before[key][f];else delete undo[key][f];}assert.deepEqual(undo,before);
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
