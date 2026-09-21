// Bounded authoring: no renderer changes, refuses to replace existing companions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {extractDependencies,printChecksum,layoutDependencies,VEGETABLE_PRINT_REVISION} from '../../src/lib/vegetablePrint.ts';
import {VegetableSchema} from '../../src/schema.ts';
const baseline='a7e88c69995c4337a65986834e95152817f21053e1df95cfa3941e14dbcd289f';
assert.equal(revision(),baseline);
const data=readCollection('vegetables'),before=structuredClone(data),shared=readCollection('troubles').brassica_troubles.conditions;
export const selected={
 cauliflower:['Club Root (Finger and Toe)','Cabbage Caterpillars','Cabbage Root Fly','Button Cauliflowers','Blind Plants','Slugs and Snails','Boron Deficiency','Whiptail','Mealy Aphid','Flea Beetle'],
 kale:['Cabbage Caterpillars','Cabbage Whitefly','Mealy Aphid','Club Root (Finger and Toe)','Pigeons','Slugs and Snails','Cabbage Root Fly','Flea Beetle'],
 kohl_rabi:['Woody Kohl Rabi','Flea Beetle','Cabbage Caterpillars','Club Root (Finger and Toe)','Cabbage Root Fly','Slugs and Snails','Pigeons','Mealy Aphid'],
};
const advice={
 'Club Root (Finger and Toe)':['Swollen roots; wilting.','Avoid infected soil; clean tools. Test before liming; no cure.'],
 'Cabbage Caterpillars':['Holes; feeding caterpillars.','Hand-pick eggs and larvae; use fine mesh.'],
 'Cabbage Root Fly':['Wilting; tunnelled roots.','Use collars or mesh on a rotated bed.'],
 'Slugs and Snails':['Holes; seedlings eaten.','Hand-pick at dusk; clear yellow leaves near seedlings.'],
 'Pigeons':['Pecked or stripped leaves.','Net securely, clear of leaves.'],
 'Flea Beetle':['Tiny holes; jumping beetles.','Mesh young plants; keep growth steady.'],
 'Mealy Aphid':['Grey colonies; curled leaves.','Squash damaging colonies; encourage predators.'],
 'Cabbage Whitefly':['White flies under leaves.','Tolerate minor colonies; encourage natural enemies.'],
 'Button Cauliflowers':['Tiny premature heads.','Prevent drought, crowding and other growth checks.'],
 'Blind Plants':['No central growing bud.','Discard blind seedlings before planting.'],
 'Boron Deficiency':['Small, bitter or brown curds.','Confirm deficiency; seek organic correction advice.'],
 'Whiptail':['Narrow, strap-like leaves.','Test soil; correct acidity and confirmed deficiency.'],
 'Woody Kohl Rabi':['Hard, fibrous globes.','Water steadily; space well and harvest young.'],
};
const aliases={BUTTONING:'Button Cauliflowers','BLIND PLANTS':'Blind Plants',CATERPILLARS:'Cabbage Caterpillars','BORON DEFICIENCY':'Boron Deficiency'};
data.cauliflower.troubles=Object.fromEntries(Object.entries(data.cauliflower.troubles).map(([k,v])=>[aliases[k]??k,v]));
for(const[key,names]of Object.entries(selected)){
 const v=data[key];assert.equal(v.ai_print_layout,undefined);assert.equal(v.ai_print_extracts,undefined);
 for(const name of names){
  const c=Object.values(shared).find(c=>c.name===name);
  if(c?.applies_to)assert.ok(c.applies_to.includes(key));
  if(!v.troubles[name]){assert.ok(c,name);v.troubles[name]={text:c.description,rank:c.rank};}
  const t=v.troubles[name],[signs,control]=advice[name];
  // Preserve useful former organic instructions in the full advice before
  // compacting the table fields; chemical prescriptions are superseded.
  if(t.control&&!/permethrin|heptenophos|mancozeb|lindane|cheshunt|borax/i.test(t.control)&&!t.text.includes(t.control))t.text+=' '+t.control;
  t.signs=signs;t.control=control;t.rank=10;
  if(!t.text.includes(control))t.text+=' '+control;
 }
 v.troubles=Object.fromEntries([...names.map(n=>[n,v.troubles[n]]),...Object.entries(v.troubles).filter(([n])=>!names.includes(n))]);
}
for(const k of ['kale','kohl_rabi']){
 const white=data[k].troubles['Cabbage Whitefly'];
 if(k==='kale')white.text='Small white-winged insects and scale-like young live below brassica leaves; adults fly up when disturbed. Honeydew can support sooty mould. Colonies often cause little harm, but can spoil kale leaves intended for eating. Tolerate minor colonies and encourage natural enemies; glasshouse-whitefly biological controls are unsuitable.';
}
data.cauliflower.sowing_and_planting.notes[2]={...data.cauliflower.sowing_and_planting.notes[2],text:'Where club root is a concern, avoid infected soil and use clean tools and healthy plants. Improve drainage and test soil before liming; lime reduces disease but does not cure infection. There is no chemical root-dip treatment recommended here.',short_text:'Avoid infected soil; use clean tools and plants. Test before liming; no cure.'};
// Distinguish repeat leaf picking from the older crown-cutting route.
data.kale.harvesting[0].text='For a continuing leaf crop, pick two or three usable lower or outer leaves from each plant at a time from autumn onwards, leaving the growing top intact. Use a sharp knife or downward tug and choose tender leaves rather than tough or yellowing foliage. Crown cutting is a separate way to encourage side shoots, not a requirement for routine leaf picking.';
data.kale.harvesting[0].short_text='Pick a few tender outer leaves at a time; leave the growing top for repeat crops.';
for(const v of Object.values(data))VegetableSchema.parse(v);
const sourceSave=saveCollections({vegetables:data},{expectedRevision:baseline,actor:'admin: John authorised organic source corrections during vegetable rollout; authored by AI:gpt-6-astra using RHS'});
const rev=revision(),fresh=readCollection('vegetables'),now=new Date().toISOString();
const items=(texts,icon)=>texts.map(text=>({text,rank:8,icon}));
const tips=rows=>rows.map(([text,icon])=>({text,rank:8,icon}));
const values={
 cauliflower:{
  key_notes:[{title:'Prepare well ahead.',body:'Add compost in autumn and let the bed settle.'},{title:'Keep growth steady.',body:'Water reliably, especially while curds form.'}],
  soil_facts:items(['Use rich, moist, well-drained soil in sun. Add compost or well-rotted manure in autumn and let the ground settle; large varieties need ample space.','Avoid poor or acid ground. Test before liming; use organic feed where needed. Rake and firm the bed rather than forking it before planting.'],'soil'),
  looking_after_the_crop:items(['Hoe carefully; protect plants from birds and caterpillars with mesh held clear of leaves.','Water reliably as plants establish and curds form. Mulch with compost; organically feed weak plants without disturbing their roots.','Fold or tie outer leaves over white curds against sunlight, and over winter curds against frost and snow. Purple types need no blanching.'],'water'),
  harvesting:items(['Check hidden curds frequently: they can swell quickly. Cut firm, tight heads before florets separate or stems lengthen; do not wait for the whole row.','Cut below each head and clear the spent plant: one curd is the main crop. For brief storage, lift and hang whole plants upside down in a cool shed; mist curds occasionally.'],'harvest'),
  sowing_notes:items(['Water nursery rows the day before moving; lift with soil around the roots. Plant young, sturdy seedlings without delay.','For very early heads, raise plants indoors in winter and plant in mid-spring when soil warms. Choose early and late varieties to spread cutting.'],'sow'),
  final_tips:tips([['Keep following peas or beans in settled soil; avoid pulling roots out.','soil'],['Mini varieties need closer spacing than maincrops.','plant_spacing'],['Cut heads when ready, even if still small.','harvest']]),
 },
 kale:{
  key_notes:[{title:'Use settled, fertile soil.',body:'Follow an early crop and avoid loose ground.'},{title:'Keep plants steady.',body:'Water young plants and protect against wind rock.'},{title:'Save the spring shoots.',body:'Feed hungry plants organically as fresh growth starts.'}],
  soil_facts:items(['Choose a reasonably sunny spot with good drainage. Kale tolerates many soils, but fertile ground gives heavier crops.','Follow peas, early potatoes or another early crop. Weed and settle the bed; add compost or organic feed if needed and lime only if acid. Set transplants securely.'],'soil'),
  looking_after_the_crop:items(['Hoe carefully and water young plants in dry weather. Keep stems firm against wind rock.','Remove yellow leaves, earth up in autumn and stake tall plants on exposed sites.','Protect with mesh where birds and caterpillars threaten. Red leaves are not immune to pests.','Use an organic liquid feed in March if plants need it, to encourage tender spring shoots.'],'protection'),
  harvesting:items(['Pick a few tender outer leaves from each plant, leaving the growing top for repeat picking. Avoid tough or yellow leaves.','Tender side shoots and flowering shoots give a later crop in early spring; pick before they become coarse or bitter. Mild winter spells may give fresh leaves.', 'Pick Red Russian baby leaves from New Year into spring. Chop finished stems into short lengths before composting.'],'harvest'),
  sowing_notes:items(['Water nursery rows before lifting. A June–early July sowing planted by early August can follow early crops; earlier April sowing gives larger plants but more summer pest exposure.'],'sow'),
  final_tips:tips([['Rape kale is sown direct, not transplanted.','sow'],['Winter-worn plants can still give tender spring shoots.','harvest']]),
 },
 kohl_rabi:{
  key_notes:[{title:'Keep moisture steady.',body:'Dry soil and growth checks make the stem woody.'},{title:'Harvest while tender.',body:'Do not wait for ordinary varieties to become oversized.'},{title:'Hoe shallowly.',body:'Avoid disturbing the roots while plants are small.'}],
  soil_facts:items(['Choose sun and fertile, well-drained soil. Prepare early with compost if poor; lime acid ground only if needed.','Rake level and settle the bed. The edible globe is a swollen stem above ground, so deep soil is less critical than steady moisture.'],'soil'),
  looking_after_the_crop:items(['Thin promptly. Protect young plants from birds; use collars or mesh where root fly is a problem.','Hoe shallowly and use organic feed if growth is slow. Keep plants growing without checks.','Water during dry spells to prevent woody globes. Allow more room for larger autumn crops.'],'water'),
  harvesting:items(['Pull ordinary varieties between golf-ball and tennis-ball size, while tender. Only let varieties bred for large globes grow bigger.','April sowings may crop in June or July. Later crops last into autumn; suitable varieties may stand into December in mild weather.',{metric:'Lift late crops before nights fall to about -3°C. Use fresh globes promptly; quality declines after lifting.',imperial:'Lift late crops before nights fall to about 27°F. Use fresh globes promptly; quality declines after lifting.'}],'harvest'),
  sowing_notes:items([{metric:'Modules are an alternative: plant while small, before growth is checked, about 25 cm each way.',imperial:'Modules are an alternative: plant while small, before growth is checked, about 10 in. each way.'}],'planting'),
  final_tips:tips([['Sow two or three small batches from April to June.','sow'],['Try White Superschmelz for a July sowing and late crop.','sow'],['Moist soil and timely picking keep globes tender.','water']]),
 },
};
for(const[key,sections]of Object.entries(values)){
 const v=fresh[key];v.ai_print_extracts={version:1,sections:{}};
 for(const[slot,value]of Object.entries(sections)){
  const paths=slot==='key_notes'||slot==='final_tips'?['key_notes','soil_facts','looking_after_the_crop','harvesting','sowing_and_planting']:slot==='sowing_notes'?['sowing_and_planting']:[slot];
  v.ai_print_extracts.sections[slot]={value,dependencies:extractDependencies(v,paths),output_checksum:printChecksum(value),updated_at:now,updated_by:'AI:gpt-6-astra',status:'draft',locked:false,editorial_note:'Batch 04 coordinated source-linked selection. Caption routes are not repeated; optional notes evaluated together with care and tips. Full master and approved planting companion retained. See BATCH-04.md for coverage, omissions and source conflicts.'};
 }
 const value={pest_limit:selected[key].length,target_pages:2,tips_position:'full-width',intro_sentences:key==='kohl_rabi'?4:3,variety_count:key==='kohl_rabi'?5:6,align_bottoms:true};
 v.ai_print_layout={value,dependencies:layoutDependencies(v),output_checksum:printChecksum({...value,extracts:sections}),updated_at:now,updated_by:'AI:gpt-6-astra',status:'draft',locked:false,renderer_revision:VEGETABLE_PRINT_REVISION};
 assert.deepEqual(v.print_planting,before[key].print_planting);VegetableSchema.parse(v);
}
for(const key of Object.keys(before).filter(k=>!Object.hasOwn(selected,k)))assert.deepEqual(fresh[key],before[key]);
const draftSave=saveCollections({vegetables:fresh},{expectedRevision:rev,actor:'AI:gpt-6-astra'});
fs.writeFileSync('docs/vegetable-ai-pilot/batch-04-restore.json',JSON.stringify({baseline,sourceSave,draftSave,revision:revision(),selected},null,2)+'\n');
console.log({sourceSave,draftSave});
