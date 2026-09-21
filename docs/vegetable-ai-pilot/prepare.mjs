import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {extractDependencies,printChecksum,layoutDependencies,VEGETABLE_PRINT_REVISION,assertVegetableExtractWritable} from '../../src/lib/vegetablePrint.ts';
const save=process.argv.includes('--save');
const rev=revision(),data=readCollection('vegetables'),before=structuredClone(data);
const actor='AI:gpt-6-astra',now=new Date().toISOString();
const items=(texts,icon='soil')=>texts.map(text=>({text,rank:8,icon}));
const dual=(imperial,metric)=>({imperial,metric});
const sections={
 asparagus:{
  key_notes:[
   {title:'Good drainage is essential.',body:'Choose a sunny, sheltered site and enrich the soil with compost or well-rotted manure.'},
   {title:'Clear perennial weeds before planting.',body:'A light-excluding mulch for a whole season is worthwhile on badly infested ground.'},
   {title:'Plant crowns in early April.',body:'Delay if the soil is cold and wet; keep bought crowns moist.'},
  ],
  soil_facts:items([
   'Choose sunny, sheltered, well-drained ground. Add compost or well-rotted manure; lime very acid soil if needed.',
   'Clear perennial weeds before planting: their roots are difficult to remove once tangled with the crowns.',
  ]),
  looking_after_the_crop:items([
   'Hand-weed or hoe shallowly. Water in dry spells, especially while young plants establish.',
   dual('Mulch established beds with 1-2 in. of compost or well-rotted manure each year. Tidy and lightly feed with compost before spears appear.','Mulch established beds with 2.5-5 cm of compost or well-rotted manure each year. Tidy and lightly feed with compost before spears appear.'),
   'Support tall ferns where needed and remove berries before they fall. Let ferns yellow naturally before cutting them down; remove diseased growth from the bed.',
  ]),
  harvesting:items([
   'Do not cut in the planting year. Take few or no spears in year two: young crowns are weakened by heavy picking.',
   dual('Cut spears about 4-6 in. high just below soil level, before they turn woody. Pick every few days in cool weather and daily in warmth.','Cut spears about 10-15 cm high just below soil level, before they turn woody. Pick every few days in cool weather and daily in warmth.'),
   'Established beds crop for about 6-8 weeks; keep the first proper cutting season shorter. Stop by early or mid-June, sooner if the bed is weak, and let later spears form fern.',
  ],'harvest'),
  sowing_notes:[],
  final_tips:items(['Treat the bed as a permanent feature: clean ground and patience pay off.','Strong summer fern growth feeds the crowns for next spring.']),
 },
 radish:{
  key_notes:[
   {title:'Sun in spring; light shade in summer.',body:'Hot, dry conditions make roots hotter and woodier.'},
   {title:'Thin only where needed.',body:'Pull the largest roots first and let smaller ones grow on.'},
   {title:'Do not sow winter radishes too early.',body:'They need to grow steadily into autumn, not bolt in summer.'},
  ],
  soil_facts:items([
   'Use rich, damp soil with a little compost and a fine tilth for rapid, tender growth.',
   'Choose sun in spring and light shade in summer. Lime acid soil if needed; give winter radishes humus-rich drainage.',
  ]),
  looking_after_the_crop:items([
   'Keep rows moist and weed-free. Quick, uninterrupted growth is the secret of crisp, mild radishes; water particularly as roots swell.',
   'Thin only where needed. Pull the largest summer roots first, letting smaller ones grow on, but do not leave any too long.',
   'Protect young leaves with fine mesh or fleece where flea beetle threatens. Clear quick radish crops promptly for the following crop.',
  ],'water'),
  harvesting:items([
   'Pull spring and summer radishes while small, crisp and mildly flavoured. French Breakfast types are best before they become finger-thick and tough.',
   'Many spring varieties take 40-50 days; very quick crops may be ready in three to four weeks in good conditions. Pull surplus roots rather than leaving them to turn woody or hollow.',
   'Lift winter radishes in October or November before hard frost, or leave hardy kinds in the ground where frost is not severe. Store lifted roots cool and damp, for example in sand.',
  ],'harvest'),
  sowing_notes:items([
   'Sow small batches every fortnight. Early sowings can go under cloches, glass or plastic; late-winter sowing is for favourable areas.',
   'After May, cabbage root fly damage is more likely. Summer heat makes rapid growth harder to maintain.',
  ]),
  final_tips:items(['Winter radishes need wider spacing and longer in the ground than salad types.','Drought and checks to growth make roots hot, woody or pithy.']),
 },
 celery:{
  key_notes:[
   {title:'Rich soil and steady moisture.',body:'Plenty of compost or manure helps on drier ground.'},
   {title:'Do not let celery dry out.',body:'Dry spells make stems tough and stringy and encourage bolting.'},
   {title:'Feed and mulch generously.',body:'Compost holds moisture; liquid feeding helps hungry summer crops.'},
  ],
  soil_facts:[...items(['Use rich, humus-filled soil kept evenly moist. Add compost or well-rotted manure; do not lime routinely.']),
   {text:'Prepare traditional trenches as follows:',measurement_path:'sowing_and_planting.trench_or_ridge_depth',rank:8,icon:'soil'}],
  looking_after_the_crop:items([
   'Keep soil moist, weed well and mulch generously. Feed hungry summer crops; dry checks encourage tough stems and bolting.',
   'Earth up trench celery from late summer. Gather the stems and tie the tops temporarily; keep soil out of the heart and remove the ties afterwards.',
   'Repeat after two or three weeks until only leaves show; check collars for slugs. Self-blanching types need close planting and moisture, not trenching.',
  ],'water'),
  harvesting:items([
   'Cut self-blanching celery before hard frost and before stems toughen. Cutting just above soil may give a small second picking in mild weather.',
   'Pick larger outside stems of celery leaf regularly to encourage new growth.',
   'Harvest trench celery as needed through winter. Protect against severe frost with cloches, straw or bracken; remove protection on warmer days.',
   dual('Finish or protect crops before about 28°F. Lift from one row end, replacing soil around remaining plants. Store stalks cool in a polythene bag.','Finish or protect crops before about -2°C. Lift from one row end, replacing soil around remaining plants. Store stalks cool in a polythene bag.'),
  ],'harvest'),
  sowing_notes:items(['Keep seedlings bright, damp and well aired. Water new plants regularly, especially during the first two rainless weeks.']),
  final_tips:items(['Light frost may help mature trench celery; protect young plants.','Check for slugs; keep earth out of the heart.']),
 },
};
const paths={key_notes:['key_notes','soil_facts','looking_after_the_crop','sowing_and_planting'],soil_facts:['soil_facts','sowing_and_planting'],looking_after_the_crop:['looking_after_the_crop'],harvesting:['harvesting'],sowing_notes:['sowing_and_planting'],final_tips:['soil_facts','looking_after_the_crop','introduction']};
for(const [key,values] of Object.entries(sections)){
 const veg=data[key];
 if(veg.ai_print_layout?.value.align_bottoms)throw Error('Pilot has newer reviewed layout guidance: use revise-alignment.mjs, not the original preparation script.');
 if(veg.ai_print_layout?.locked)throw Error(`${key}: layout locked`);
 if(veg.ai_print_layout){
  const old=veg.ai_print_layout;
  assert.equal(old.status,'draft','Do not rewrite an approved layout in pilot preparation');
  assert.equal(old.output_checksum,printChecksum({...old.value,extracts:Object.fromEntries(Object.entries(veg.ai_print_extracts.sections).map(([k,v])=>[k,v.value]))}),'Preserve manual layout edits');
 }
 const entries={};
 for(const [slot,value] of Object.entries(values)){
  assertVegetableExtractWritable(veg,slot);
  if(veg.ai_print_extracts?.sections[slot]?.status==='approved')throw Error('Do not rewrite approved pilot extracts');
  entries[slot]={value,dependencies:extractDependencies(veg,paths[slot]),output_checksum:printChecksum(value),updated_at:now,updated_by:actor,status:'draft',locked:false,editorial_note:'Close condensation of the linked original prose; duplication removed, detailed source retained. See pilot editorial review for omissions and unit conversions.'};
 }
 veg.ai_print_extracts={version:1,sections:entries};
 const value={pest_limit:4,target_pages:2,tips_position:key==='celery'?'left-column':'right-column'};
 veg.ai_print_layout={value,dependencies:layoutDependencies(veg),output_checksum:printChecksum({...value,extracts:values}),updated_at:now,updated_by:actor,status:'draft',locked:false,renderer_revision:VEGETABLE_PRINT_REVISION};
}
const stripped=structuredClone(data);for(const key of Object.keys(sections))for(const f of ['ai_print_extracts','ai_print_layout']){if(Object.hasOwn(before[key],f))stripped[key][f]=before[key][f];else delete stripped[key][f];}assert.deepEqual(stripped,before);
if(save)console.log(saveCollections({vegetables:data},{actor,expectedRevision:rev}));
else console.log('Dry run: '+Object.keys(sections).join(', ')+'; use --save to store draft extracts.');
