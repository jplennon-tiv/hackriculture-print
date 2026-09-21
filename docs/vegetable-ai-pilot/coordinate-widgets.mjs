// One-time, revision-guarded editorial pass. See WIDGET-COORDINATION.md before use.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {VegetableSchema} from '../../src/schema.ts';
import {printChecksum,extractDependencies,layoutDependencies,assertVegetableExtractWritable,VEGETABLE_PRINT_REVISION,resolveVegetableExtracts} from '../../src/lib/vegetablePrint.ts';
const baseline='c4451d693f2b147763fd431b40b6e97322b03b5eaebee790c79d519a7fa0c6a5';
assert.equal(revision(),baseline,'Newer work exists: inspect it, never restore this baseline blindly.');
const data=readCollection('vegetables'),before=structuredClone(data);
const pair=(metric,imperial)=>({metric,imperial});
data.radish.sowing_and_planting.plant_spacing_summary=pair('Salad 2.5–5 cm; winter/Japanese 15–20 cm','Salad 1–2 in.; winter/Japanese 6–8 in.');
data.potato.sowing_and_planting.row_spacing_summary=pair('First earlies 60 cm; maincrop 75 cm','First earlies 24 in.; maincrop 30 in.');
data.turnip.sowing_and_planting.plant_spacing_summary=pair('Baby 10 cm; early 15 cm; maincrop 23 cm; tops 10 cm','Baby 4 in.; early 6 in.; maincrop 9 in.; tops 4 in.');
for(const [key,short,summary]of [
 ['broccoli','12–44 weeks','Calabrese ~12 weeks; sprouting ~44 weeks from sowing'],
 ['brussels_sprouts','28–36 weeks','Early ~28 weeks; late ~36 weeks from sowing'],
 ['cabbage','10–35 weeks','Chinese ~10 weeks; other types 20–35 weeks from sowing'],
])Object.assign(data[key].time_to_harvest,{ready_in_short:short,ready_in_summary:summary});
const sprouts=data.brussels_sprouts;
// RHS: main winter crop, early/late varieties; Garden Organic: end Sep–mid Feb;
// Tozer's variety catalogue confirms extended maturity slots through March.
sprouts.calendar.harvest_time.most_popular=['--11/--02'];
sprouts.calendar.harvest_time.less_usual=['--09/--10','--03'];
sprouts.calendar.harvest_time.notes=[
 'Main winter picking is shown as November–February. Early varieties can start in September or October; suitable late varieties may continue into March. Exact timing depends on variety, sowing and weather; one planting does not necessarily crop across the whole span.',
 'Pick firm, tightly closed buttons from the bottom upwards. Yellowing leaves are removed for hygiene, not used as the harvest trigger.',
 'Tender late shoots and leafy tops can still be eaten after button cropping ends, sometimes in March or April; this is distinct from the main button harvest.',
];
sprouts.harvesting[1].text='Pick sprouts when the buttons are firm and tightly closed, starting with the lowest usable sprouts. Do not wait for accompanying leaves to turn yellow. Remove yellowing leaves before they decay over the sprouts.';
sprouts.harvesting[1].short_text='Pick firm, tightly closed buttons; remove yellow leaves separately.';
for(const v of Object.values(data))VegetableSchema.parse(v);
const sourceSave=saveCollections({vegetables:data},{expectedRevision:baseline,actor:'admin: John requested researched sprout calendar and data-first widget corrections; authored by AI:gpt-6-astra'});
console.log('Source restore point',sourceSave);
const rev=revision(),current=readCollection('vegetables'),now=new Date().toISOString();
function edit(key,slot,rows,note){
 const v=current[key];assertVegetableExtractWritable(v,slot);
 const e=v.ai_print_extracts.sections[slot];
 e.value=rows.map(([text,icon,rank=8])=>({text,rank,icon}));
 e.dependencies=extractDependencies(v,Object.keys(e.dependencies));
 Object.assign(e,{output_checksum:printChecksum(e.value),updated_at:now,updated_by:'AI:gpt-6-astra',status:'draft',editorial_note:note+' Full master advice retained. Coordinated with neighbouring widgets; selection is complete, not a prefix for automatic top-up. See WIDGET-COORDINATION.md.'});
}
// Retain already reviewed soil/care/harvest decisions where they cover the
// source well. Edit only repetition, omissions or wording affected by research.
edit('broccoli','looking_after_the_crop',[
 ['Hoe regularly. Protect plants with mesh, especially late calabrese; keep bird netting clear of foliage.','protection'],
 ['Water in dry weather and mulch in summer. Use an organic liquid feed if growth is weak.','water'],
 ['Stake tall sprouting plants on exposed sites; mulch with straw in very cold winters.','support'],
 ['Check for club root and caterpillars. Hand-pick pests and remove damaged or diseased leaves.','protection'],
],'Five source care entries combined into four: the late-calabrese mesh advice shares the protection step; no separate action discarded.');
edit('brussels_sprouts','harvesting',[
 ['Pick firm, tightly closed buttons from the bottom upwards; discard loose or damaged ones. Do not wait for leaves to yellow.','harvest',9],
 ['Pick regularly, mainly November–February. Early and late varieties extend the season; remove yellow leaves before they decay.','harvest',10],
 ['After button cropping, use tender shoots and leafy tops. Chop finished stems for compost by late spring.','harvest',7],
],'RHS harvest readiness replaces the misleading yellow-leaf trigger. Main button season distinguished from extended varieties and edible tops; five source entries combined into three.');
edit('cabbage','looking_after_the_crop',[
 ['Protect plants from birds and caterpillars with mesh or netting held clear of the leaves.','protection'],
 ['Hoe until plants suppress weeds. Keep soil firm; earth up stems loosened by wind or frost.','weeding'],
 ['Water during drought. Use organic feed for weak plants as heads mature; avoid excess nitrogen before winter and soft, lush growth.','water'],
 ['Remove yellow lower leaves, especially on winter cabbages and savoys, before they rot or shelter slugs.','protection',10],
],'Five source care entries combined into four: feeding and steady moisture belong together, while hygiene remains a separate high-priority action.');
edit('bean_french','looking_after_the_crop',current.bean_french.ai_print_extracts.sections.looking_after_the_crop.value.map((v,i)=>[i===3?'Water and use an organic liquid feed after the first flush of pods to encourage a smaller second crop.':v.text,v.icon,v.rank]),'Existing four complete care steps retained; feed wording made explicitly organic.');
edit('bean_runner','looking_after_the_crop',current.bean_runner.ai_print_extracts.sections.looking_after_the_crop.value.map((v,i)=>[i===2?'Use organic liquid feed if growth weakens or plants carry a heavy crop. Pinch growing points at the tops of supports.':v.text,v.icon,v.rank]),'Existing four complete care steps retained; feed wording made explicitly organic.');
edit('broccoli','sowing_notes',[
 ['Sow early calabrese indoors in March; plant under fleece in April. Sow May–late June for autumn heads.','sow'],
 ['Sow sprouting broccoli in April for large plants or June for smaller ones.','sow'],
],'Timing routes selected from notes 0–2. Module method is in the illustrated caption; mesh protection is in care.');
edit('bean_french','sowing_notes',[
 ['Sow outdoors from late May in warm soil, or raise plants under glass and harden off. Sow again in late June or early July for later picking.','sow'],
 ['For early crops, warm soil under cloches from March, sow in April and uncover in late May.','protection',7],
],'Outdoor, indoor and protected early routes retained. Support details belong in care, not a duplicate planting note.');
edit('bean_runner','sowing_notes',[
 ['Sow under glass in April; harden off and plant after frost. Outdoors, wait for warm soil in late May or early June; sow spares for gaps.','sow'],
],'Standard routes remain in planting. Conditional soaking and July sowing moved to Final Tips so both are considered independently of prefix fitting.');
edit('beetroot','sowing_notes',[
 ['Soak seed clusters for several hours or overnight. Sow early crops with warmth and plant in early spring; sow into early summer for tender roots before winter.','sow'],
],'Timing notes 3–4 combined; clump management is in care and the selected final reminder.');
edit('lettuce','sowing_notes',[
 ['Sow small leaf-lettuce batches from March to August. Modules help early crops and in sluggy weather; fewer strong plants can be picked repeatedly.','sow'],
],'Complete note set. Hearting succession and hot-weather germination are selected Final Tips; neither is left to the optional prefix fitter.');
for(const [key,rows,note]of [
 ['radish',[
  ['Sow winter radishes in July or early August, not spring.','sow',9],
  ['Clear quick crops promptly for the next crop.','harvest',7],
 ],'Two reminders chosen: the distinct winter route and timely clearance. Repeated watering/thinning wording stays in care and harvest.'],
 ['bean_broad',[
  ['Sow spare seeds to fill gaps.','sow'],
  ['Wide rows of tall beans can shelter lower follow-on crops.','planting',7],
 ],'Keep the useful later nurse-crop note; pinching and leaving roots already have complete care steps.'],
 ['bean_french',[
  ['Pick before beans swell inside pods.','harvest',9],
  ['Give climbers supports at sowing or planting time.','support'],
 ],'Two practical timing reminders. Cold-soil and early cloche routes belong in planting; no extra count target.'],
 ['bean_runner',[
  ['Soak seed only if halo blight has not been a problem.','sow',9],
  ['A warm July sowing may crop in autumn if soil stays moist.','sow',7],
  ['Keep roots moist from flowering.','water',9],
 ],'Two conditional source notes retained alongside a critical moisture reminder. Support and frequent picking are already in care/harvest.'],
 ['beetroot',[
  ['Leave four or five seedlings in module clumps.','planting'],
  ['Take the largest clump roots first, leaving others to swell.','harvest'],
  ['Twist off foliage; do not cut roots for storage.','storage'],
 ],'Retain module clump size from optional note 2, which otherwise disappeared; two useful harvest reminders remain.'],
 ['broccoli',[
  ['Side shoots follow the main calabrese head.','harvest',7],
  ['Keep netting clear of leaves.','protection',9],
 ],'Two useful reminders support the different crop routes and protection; no third tip added merely to fill a slot.'],
 ['brussels_sprouts',[
  ['Choose early and late varieties to extend winter picking.','harvest'],
  ['Stake tall plants on windy sites.','support'],
  ['Use tender leafy tops after button cropping.','harvest',7],
 ],'Season, conditional staking and usable tops coordinated with harvest/planting. Removed repeated firm-soil and yellow-leaf reminders.'],
 ])edit(key,'final_tips',rows,note);
// Re-link source changes only after checking the affected saved text above.
for(const [key,v]of Object.entries(current))if(v.ai_print_layout){
 for(const [slot,e]of Object.entries(v.ai_print_extracts.sections)){
  const deps=extractDependencies(v,Object.keys(e.dependencies));
  if(printChecksum(deps)!==printChecksum(e.dependencies)){
   assertVegetableExtractWritable(v,slot);
   Object.assign(e,{dependencies:deps,updated_at:now,updated_by:'AI:gpt-6-astra',status:'draft'});
  }
 }
 const p=v.ai_print_layout;assert.equal(p.locked,false);
 p.renderer_revision=VEGETABLE_PRINT_REVISION;p.dependencies=layoutDependencies(v);
 p.output_checksum=printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))});
 p.updated_at=now;p.updated_by='AI:gpt-6-astra';delete p.measurements;
 assert.deepEqual(resolveVegetableExtracts(v,true).warnings,[]);
 VegetableSchema.parse(v);
 assert.deepEqual(v.print_planting,before[key].print_planting,'Approved planting companion changed');
 if(['asparagus','celery'].includes(key))assert.deepEqual(v.ai_print_extracts,before[key].ai_print_extracts,'Approved extracts changed');
}
const draftSave=saveCollections({vegetables:current},{expectedRevision:rev,actor:'AI:gpt-6-astra'});
console.log('Editorial restore point',draftSave);
fs.writeFileSync('docs/vegetable-ai-pilot/widget-restore.json',JSON.stringify({baseline,sourceSave,draftSave,revision:revision()},null,2)+'\n');
