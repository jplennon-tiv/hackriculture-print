import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {extractDependencies,printChecksum,layoutDependencies,VEGETABLE_PRINT_REVISION,assertVegetableExtractWritable} from '../../src/lib/vegetablePrint.ts';
const data=readCollection('vegetables'),before=structuredClone(data),rev=revision(),now=new Date().toISOString();
const items=(texts,icon='soil')=>texts.map(text=>({text,rank:8,icon}));
const edits={
 bean_broad:{
  key_notes:[{title:'Rich soil, without waterlogging.',body:'Moisture-retentive, free-draining ground suits broad beans.'},{title:'Support tall varieties.',body:'Stakes and strings keep plants upright in wind.'},{title:'Pinch out the soft tops.',body:'Do this at full flower or when the first pods form to discourage blackfly.'}],
  soil_facts:items(['Choose sunny, moisture-retentive but free-draining ground where beans did not grow last year. Avoid waterlogging; lime very acid soil towards pH 6.5.','Ground enriched for a previous crop is ideal. Add compost or well-rotted manure in autumn if soil is poor.']),
  looking_after_the_crop:items(['Weed young rows and earth stems up lightly to steady them. Support tall varieties in windy gardens with stakes and strings; dwarfs usually need little support.','Water thoroughly in dry weather while pods swell, rather than little and often. Mulch between plants to conserve moisture.','Pinch out soft tops at full flower or when the first pods form to discourage black bean aphid. Cook the tender tops like spinach.','After cropping, cut stems at the base, leaving roots and nodules in the soil. Compost the chopped stems.']),
  harvesting:items(['Pick regularly before pods become large and leathery. Very small pods with pea-sized beans can be cooked whole.','For shelling, pick when beans show clearly through the pods, before their attachment scars turn dark. Remove pods with a sharp downward twist.','For dried winter beans, let pods mature and dry on the plant if weather allows, then finish drying in an airy place before shelling and storing.'],'harvest'),
  sowing_notes:items(['Sow hardy varieties in late autumn only in mild districts. On cold or wet ground, wait until spring; pots or modules under glass are useful where mice threaten direct sowings.']),
  final_tips:items(['Sow spare seeds to fill gaps.','Pinch tops when the first pods form.','Leave roots in the soil after cropping.']),
 },
 bean_french:{
  key_notes:[{title:'Wait for warmth.',body:'Cold, wet ground can rot seed; plant out after frost danger has passed.'},{title:'Protect young seedlings.',body:'Keep beds clean and weed-free, and watch for slugs.'},{title:'Water from flowering.',body:'Dry roots can cause flower drop and poor pod set.'}],
  soil_facts:items(['Choose a warm, sheltered, sunny site with light, well-drained soil. Add compost or well-rotted manure; avoid cold, wet clay and lime only if soil is too acid.','Use ground where beans did not grow last year. Climbing beans need richer, moisture-retentive soil than dwarfs: enrich a trench or planting strip where ground is poor.']),
  looking_after_the_crop:items(['Protect seedlings from slugs and keep beds clean and weed-free, especially around dwarf beans with low-hanging pods.','Dwarf varieties normally need no support. Give climbers canes, netting, wigwams or strings early; guide wandering shoots onto them.','Water regularly in dry weather from flowering onwards. Steady root moisture and warmth matter more than spraying flowers.','Water and liquid-feed healthy plants after the first flush of pods to encourage a smaller second crop.']),
  harvesting:items(['Pick tender green pods every few days before the beans inside swell. Search carefully for pods hidden in climbing foliage.','Dwarfs usually crop first, for about four to six weeks; replace tired plants with a later sowing. Climbers may crop for six to ten weeks with regular picking and watering.','For dried haricots, let pods ripen and turn straw-coloured. Finish drying plants in an airy shed if needed, then shell and dry beans fully before storing airtight.'],'harvest'),
  sowing_notes:items(['Sow outdoors from late May once soil is warm, or raise plants under glass and harden off. A second sowing in late June or early July can extend picking.']),
  final_tips:items(['Avoid cold, wet soil when sowing.','Support climbers before they need it.','Pick before beans swell inside pods.']),
 },
 bean_runner:{
  key_notes:[{title:'Rich soil and shelter.',body:'Choose a sunny site with moist, free-draining ground.'},{title:'Pinch out at support height.',body:'Remove growing points once plants reach the tops of their supports.'},{title:'Keep roots steadily moist.',body:'Water thoroughly from flowering onwards for a good pod set.'}],
  soil_facts:items(['Use sunny, sheltered, rich ground that holds moisture but drains well. Lime acid soil if needed towards pH 6.5.','Prepare deeply with compost or well-rotted manure in autumn or winter. Avoid shading neighbouring crops.']),
  looking_after_the_crop:items(['Protect young plants from slugs and tie them loosely to supports until they climb naturally. Hoe while young, then mulch once growth is strong.','Water thoroughly in dry weather from flowering onwards. Steady root moisture matters far more than misting flowers for pod set.','Liquid-feed occasionally if growth weakens or plants carry a heavy crop. Pinch out growing points at the tops of their supports.','After frost, dismantle supports and compost the stems. Leave roots and stem bases in the ground where practical, and mulch the bed for the next crop.']),
  harvesting:items([{metric:'Pick flat, tender pods about 15–20 cm long, before beans swell inside. Hold the vine with one hand while snapping the pod with the other.',imperial:'Pick flat, tender pods about 6–8 in. long, before beans swell inside. Hold the vine with one hand while snapping the pod with the other.'},'Pick every couple of days in late summer to keep plants cropping, sometimes into October in mild seasons. Leaving pods to ripen slows new pod production.','Leave pods to mature only for drying or seed saving. White-bean varieties such as Czar can give an autumn crop; dry pods thoroughly before shelling and storing.'],'harvest'),
  sowing_notes:items(['Sow under glass in April and harden off before planting out after frost danger. Outdoors, wait for warm soil in late May or early June; sow spare seeds to fill gaps.']),
  final_tips:items(['Install sturdy supports early.','Keep roots moist once flowers open.','Pick often; do not let pods toughen.']),
 },
};
for(const [key,values] of Object.entries(edits)){
 const v=data[key];
 if(v.ai_print_layout){assert.equal(v.ai_print_layout.status,'draft');assert.equal(v.ai_print_layout.locked,false);assert.equal(v.ai_print_layout.output_checksum,printChecksum({...v.ai_print_layout.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([k,e])=>[k,e.value]))}));}
 const sections={};for(const [slot,value] of Object.entries(values)){
  assertVegetableExtractWritable(v,slot);assert.notEqual(v.ai_print_extracts?.sections[slot]?.status,'approved');
  const paths=slot==='sowing_notes'?['sowing_and_planting']:slot==='final_tips'||slot==='key_notes'?['key_notes','soil_facts','looking_after_the_crop','harvesting','sowing_and_planting']:[slot];
  sections[slot]={value,dependencies:extractDependencies(v,paths),output_checksum:printChecksum(value),updated_at:now,updated_by:'AI:gpt-6-astra',status:'draft',locked:false,editorial_note:'Batch 02 source-based condensation. Full master, measurements and planting companion retained. Runner harvest length converted to rounded metric equivalent.'};
 }
 v.ai_print_extracts={version:1,sections};
 const value={pest_limit:4,target_pages:2,tips_position:'full-width',intro_sentences:key==='bean_runner'?3:4,variety_count:6,align_bottoms:true};
 v.ai_print_layout={value,dependencies:layoutDependencies(v),output_checksum:printChecksum({...value,extracts:values}),updated_at:now,updated_by:'AI:gpt-6-astra',status:'draft',locked:false,renderer_revision:VEGETABLE_PRINT_REVISION};
}
const undo=structuredClone(data);for(const key of Object.keys(edits))for(const f of ['ai_print_extracts','ai_print_layout']){if(Object.hasOwn(before[key],f))undo[key][f]=before[key][f];else delete undo[key][f];}assert.deepEqual(undo,before);
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
