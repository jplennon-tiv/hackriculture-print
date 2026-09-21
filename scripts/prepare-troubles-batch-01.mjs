// One-shot preparation of the authorised batch. No AI calls; refuses existing drafts.
// --apply persists source corrections explicitly authorised by John, then AI drafts.
import assert from 'node:assert/strict';
import {readCollection,saveCollections,revision} from '../../hackriculture-data/lib/records.mjs';
import {signature,printFields,layoutSourceSignature} from '../src/lib/aiPrint.ts';
import plans from '../docs/troubles-design/batch-01-copy.mjs';
const data=readCollection('troubles'),rev=revision();
const now=new Date().toISOString(),actor='AI: assisted print (model not recorded)';
// All changes below are limited to the named three source records. Source detail
// outside these exact fields is preserved. The store retains preceding bytes.
const sourceEdits={
beetroot_troubles:{
mangold_fly_leaf_miner:{treatment:'Remove mined leaves or squeeze the mines to crush the larvae. Inspect leaf undersides for groups of white eggs.',prevention:'Use insect-proof mesh over a rotated bed, so flies cannot emerge from old pupae beneath the cover.'},
heart_rot:{treatment:'Confirm boron deficiency and check soil pH and moisture before acting. Existing damaged roots will not recover; obtain advice on an organic-compatible correction if a shortage is confirmed.',prevention:'Maintain steady soil moisture, improve soil with mature compost and avoid unnecessary liming. Do not apply borax by guesswork: the margin between deficiency and toxic excess is narrow.'},
blackleg:{treatment:'Remove diseased seedlings. Improve drainage and avoid excess watering; collapsed plants cannot be restored.'},
speckled_yellows:{treatment:'Confirm the deficiency rather than diagnosing from leaf colour alone. Check pH, drainage and moisture, and obtain advice on an organic-compatible manganese correction if needed.'},
leaf_spot:{prevention:'Practise crop rotation and prepare fertile soil with mature compost before sowing.'}
},
bean_and_pea_troubles:{
black_bean_aphid:{treatment:'Pinch off and compost infested broad-bean tips as soon as colonies appear. Squash small damaging colonies by hand and encourage natural predators; tolerate light infestations.'},
pea_aphid:{treatment:'Tolerate small colonies. Check tender growth frequently, squash damaging colonies by hand and encourage natural predators rather than spraying.',prevention:'Encourage aphid predators and monitor new growth. Complete prevention outdoors is rarely practical.'},
downy_mildew:{treatment:'Remove affected leaves and destroy severely diseased plants. Improve air circulation and avoid prolonged leaf wetness.'},
powdery_mildew:{treatment:'Remove badly affected growth where practical. Clear exhausted, badly affected late crops; maintain root moisture and airflow around the remaining plants.'},
foot_rot_and_root_rot:{treatment:'Lift and dispose of badly affected plants. Improve drainage and investigate repeated losses before replanting; a drench will not restore rotten roots.'},
pea_and_bean_weevil:{treatment:'Established plants usually tolerate the notching. Water young plants during dry weather to help them grow through damage; protect particularly vulnerable seedlings with insect-proof mesh.'},
pea_thrips:{treatment:'Confirm thrips by inspecting damaged foliage and pods. Keep plants watered to reduce stress and tolerate minor damage; do not apply household soap or detergent sprays.'},
no_flowers:{prevention:'Build soil fertility with mature compost and avoid excessive nitrogen-rich feeding. Check for bud damage before assuming a nutrient shortage.'},
chocolate_spot:{treatment:'There is little to do once severe disease is established. Remove badly diseased plants and infected crop remains; improve spacing and airflow around survivors.'},
marsh_spot:{prevention:'Improve soil with mature compost. Check soil pH and confirm manganese deficiency before seeking an organic-compatible correction; do not apply trace elements indiscriminately.'},
grey_mould_botrytis:{treatment:'Remove and dispose of mouldy pods and damaged tissue promptly.',prevention:'Avoid overcrowding, keep the crop picked and improve airflow. Avoid leaving foliage wet for long periods.'},
pea_moth:{prevention:'Early sowings, especially March and April, may avoid the peak June-July flight; late sowings can also avoid peak activity. Use insect-proof mesh before flowering on a rotated site. Exposed pupae may be eaten by birds during cultivation, but digging is not essential to this approach.'},
anthracnose:{treatment:'Remove and destroy badly diseased plants. Keep healthy plants well spaced and avoid saving seed from affected crops.'}
},
brassica_troubles:{
downy_mildew:{treatment:'Remove affected leaves and severely diseased plants. Improve ventilation and avoid prolonged leaf wetness.'},
gall_weevil:{treatment:'Usually not worth treating because damage is slight. Confirm the diagnosis if plants wilt or roots are extensively distorted.',prevention:'Monitor plants; no dependable preventative treatment is offered here.'},
wire_stem:{prevention:'Avoid wet, cold soil or compost and overcrowding. Raise seedlings in fresh seed compost using clean containers.'},
leaf_spot_ring_spot:{treatment:'Remove and dispose of badly diseased leaves and improve airflow around plants.'},
whiptail:{treatment:'Confirm the deficiency and test soil pH. Correct excessive acidity before the next crop, using a soil-test recommendation; seek advice on organic-compatible trace elements only if still needed.'},
heartless_cabbages:{treatment:'Check watering, light and soil fertility. Improve the soil with mature compost and avoid excessive nitrogen feeding; loose planting also needs attention.'},
slugs_and_snails:{treatment:'Inspect after dark or in damp weather and hand-remove slugs and snails around vulnerable crops. Check under loose outer leaves and nearby hiding places.',prevention:'Raise sturdy transplants. Keep dense damp debris and yellowing leaves away from vulnerable seedlings, while retaining wildlife habitat elsewhere for natural predators.'},
split_hearts:{treatment:'Harvest mature split heads promptly; a split cannot be healed by feeding. Discard decaying tissue.'},
flea_beetle:{treatment:'Water damaged seedlings in dry weather to help them grow through the damage. Stronger established plants often tolerate some feeding.',prevention:'Use fine insect-proof mesh, secured at the edges and held clear of foliage. Raise sturdy transplants if direct-sown seedlings repeatedly fail.'},
swede_midge:{treatment:'Remove and dispose of badly affected plants. Confirm the diagnosis before acting on unexplained blind growth; do not assume every damaged growing point is swede midge.'},
mealy_aphid:{treatment:'Check leaf undersides and growing tips. Squash small damaging colonies by hand and encourage natural predators. Tolerate minor populations where growth is unaffected.'},
cabbage_whitefly:{treatment:'Usually tolerate populations on outer leaves, where harm to the crop is slight. Check leafy crops such as kale more closely and encourage natural enemies. Glasshouse-whitefly biological controls are not suitable for this species.'},
magnesium_deficiency:{treatment:'Confirm the cause and review soil pH, watering and feeding. If deficiency persists, obtain advice on a magnesium amendment suitable for organic cultivation rather than applying mixed trace elements blindly.',prevention:'Improve soil with mature compost. Avoid excessive potassium feeding, which can reduce magnesium uptake.'},
manganese_deficiency:{treatment:'Check soil conditions and confirm the deficiency. Improve moisture and soil structure; seek advice on an organic-compatible manganese correction if required.'},
chafer_grubs:{prevention:'Identify grubs before removing them: some similar larvae are harmless decomposers. Where root damage is confirmed, hand-remove grubs found near affected plants. A suitable biological nematode treatment may help if its temperature, moisture and target-species requirements are met.'},
boron_deficiency:{treatment:'Confirm the deficiency and check soil pH and moisture. Existing damaged curds will not recover. Obtain advice on an organic-compatible correction only if a shortage is confirmed.',prevention:'Improve soil with mature compost and avoid unnecessary lime. Do not improvise borax doses: excessive boron can damage plants.'},
diamond_back_moth:{treatment:'Inspect the undersides of leaves and remove caterpillars by hand on small crops.',prevention:'Use well-secured insect-proof mesh and check under it regularly during summer.'},
cutworm:{prevention:'Where losses recur, a suitable biological nematode treatment may help; follow its target-pest, soil-temperature and moisture requirements.'}
}};
for(const [slug,plan]of Object.entries(plans)){
 const group=data[slug];assert(group&&!group.ai_layout,'Existing layout: stop and review '+slug);
 assert.deepEqual(Object.keys(plan.copy).sort(),Object.keys(group.conditions).sort());
 for(const c of Object.values(group.conditions))assert(!c.ai_print&&!printFields.some(f=>c['ai_'+f]!==undefined),'Existing AI copy: stop');
 for(const [key,fields]of Object.entries(sourceEdits[slug]))Object.assign(group.conditions[key],fields);
 if(slug==='beetroot_troubles')group.conditions.blackleg.description=group.conditions.blackleg.description.replace('If an attack occurs, remove diseased plants and water the remainder with Cheshunt Compound.','If an attack occurs, remove diseased plants and improve drainage and watering practice.');
 if(slug==='bean_and_pea_troubles')group.conditions.no_flowers.description=group.conditions.no_flowers.description.replace('Use a balanced fertilizer containing phosphates and potash for peas and beans.','Build soil fertility with mature compost rather than feeding excess nitrogen.');
}
// Source edits have separate provenance and occur before draft dependency capture.
if(process.argv.includes('--apply'))console.log('Source corrections',saveCollections({troubles:data},{actor:'User-authorised AI source edit: organic methods (model not recorded)',expectedRevision:rev}));
const draftRevision=revision();
for(const [slug,plan]of Object.entries(plans)){
 const group=data[slug];
 for(const [key,values]of Object.entries(plan.copy)){
  const c=group.conditions[key];
  const dependencies=Object.fromEntries([...printFields,'name','applies_to','active_period'].map(f=>[f,signature(c[f])]));
  c.ai_print={version:1,fields:{}};
  printFields.forEach((field,i)=>{c['ai_'+field]=values[i];c.ai_print.fields[field]={updated_at:now,updated_by:actor,status:'draft',locked:false,dependencies,output_signature:signature(values[i])};});
 }
 group.ai_introduction=plan.intro;
 group.ai_layout={version:1,status:'draft',renderer:'troubles-cards-2',updated_at:now,updated_by:actor,
  hero_images:plan.heroes.map(k=>'/images/vegetables/'+k+'.png'),
  pages:plan.pages.map((columns,index)=>({...index===0?{intro_height_mm:38}:{},columns:columns.map(keys=>keys.map(key=>({key,height_mm:((index===0?200:238)-(keys.length-1)*3)/keys.length})))})),source_signature:layoutSourceSignature(group)};
 const keys=plan.pages.flat(2);assert.equal(new Set(keys).size,keys.length);assert.deepEqual(keys.sort(),Object.keys(group.conditions).sort());
 console.log(slug,Object.keys(group.conditions).length,'cards;',plan.pages.length,'planned pages');
}
if(process.argv.includes('--apply'))console.log('Drafts',saveCollections({troubles:data},{actor,expectedRevision:draftRevision}));
else console.log('Dry run only; use --apply to persist the authorised source changes and drafts.');
