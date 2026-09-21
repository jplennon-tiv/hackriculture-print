// One-shot authorised source corrections, followed by separate draft AI companions.
import assert from 'node:assert/strict';
import {readCollection,saveCollections,revision} from '../../hackriculture-data/lib/records.mjs';
import {signature,printFields,layoutSourceSignature} from '../src/lib/aiPrint.ts';
import plans from '../docs/troubles-design/batch-02-copy.mjs';
const data=readCollection('troubles'),rev=revision();
const edits={tomato_troubles:{
virus:{prevention:'Buy healthy plants from reputable suppliers. Monitor aphids and encourage their natural enemies; squash small damaging colonies by hand. Wash hands and tools before handling healthy plants, particularly after handling tobacco or infected plants.'},
tomato_leaf_mould:{treatment:'Pick off infected leaves as soon as they appear. Remove some lower leaves after fruit has set to improve airflow, without excessive defoliation. Dispose of infected plants and debris at the end of the crop.',prevention:'Provide ample ventilation, avoid wetting foliage during watering, and do not allow compost to dry out. Resistant cultivars can help, but resistance may not cover every strain.'},
grey_mould_botrytis:{treatment:'Remove infected leaves, fruit and damaged tissue promptly. Remove badly affected plants; there is no dependable curative treatment for established stem infection.',prevention:'Reduce excessive humidity through ventilation. Clear decaying leaves and fruit, avoid overcrowding, and minimise wounds and prolonged surface wetness.'},
root_rot:{treatment:'Remove collapsed plants and correct drainage. Rotten roots cannot be repaired. Where losses recur, use clean containers and fresh peat-free compost for the next crop.'},
foot_rot:{description:'Foot rot is generally a disease of seedlings, but mature plants can be attacked. Brown decay develops around the stem base and can cause collapse. Remove badly affected plants and investigate drainage and recurring disease before replanting.',treatment:'Remove badly affected plants. Improve drainage and avoid keeping the stem base persistently wet; seek a diagnosis if losses recur.'},
stem_rot_didymella:{treatment:'Remove badly affected plants and infected crop remains. Avoid cutting into cankers in an attempt to cure established disease.',prevention:'Clean the greenhouse, supports, tools and containers between crops. Avoid stem damage, overcrowding and persistent wetness.'},
hormone_damage:{treatment:'Stop further exposure and confirm the cause; there is no direct cure for weedkiller injury.',prevention:'Keep lawn weedkiller drift and contaminated equipment away from vegetables. Avoid compost or manure suspected of herbicide contamination.'},
greenhouse_whitefly:{treatment:'Use an appropriate biological control, such as Encarsia formosa, early while numbers are low. Follow supplier guidance for temperature, timing and pest identification.',prevention:'Inspect new plants and leaf undersides regularly. Yellow sticky cards can monitor adults, but position or remove them as advised when releasing beneficial insects.'},
eelworm:{prevention:'Avoid infested soil and contaminated plants or root balls. Confirm the nematode species before choosing rotation crops or an interval: host ranges and persistence differ.'},
verticillium_wilt:{treatment:'There is no curative treatment. Confirm the diagnosis and remove badly affected plants; manage watering to avoid adding drought or waterlogging stress.'},
magnesium_deficiency:{treatment:'Confirm the cause by checking watering, pH and feeding before adding nutrients. Seek advice on a suitable organic-compatible magnesium amendment if deficiency persists.',prevention:'Use balanced nutrition. Excess potassium can reduce magnesium uptake, so do not overfeed with high-potash products.'},
potato_blight:{treatment:'Remove affected tomato plants when blight is established; damaged tissue cannot be cured. Check harvested fruit regularly because rot may develop after picking. Discard infected fruit.',prevention:'Water soil or compost rather than foliage, provide airflow and consider blight-resistant varieties. Rain protection can reduce leaf wetness but must allow ventilation. Monitor crops closely in warm, wet weather.'},
blotchy_ripening:{prevention:'Use greenhouse shading and ventilation to limit excessive heat. Feed with an organic-compatible tomato fertiliser at its recommended rate; avoid overfeeding.'},
blossom_drop:{prevention:'Maintain regular root watering and ventilate during heat. Gently tap flowering trusses to assist pollen release rather than routinely spraying flowers.'},
sun_scald:{prevention:'Use greenhouse shading and ventilation during strong sunshine. Maintain root moisture and avoid exposing fruit by excessive leaf removal.'},
dry_set:{prevention:'Ventilate and shade during excessive heat and keep root moisture steady. Avoid routine leaf spraying that prolongs foliage wetness.'},
greenback:{prevention:'Use greenhouse shading and ventilation, feed appropriately with an organic-compatible tomato feed, and consider resistant varieties.'},
tomato_moth:{treatment:'Hand-pick caterpillars where practical and discard damaged fruit; internal feeding damage cannot be repaired.',prevention:'Inspect plants regularly and remove small caterpillars before they tunnel into fruit or stems.'},
potato_blight_2:{prevention:'Monitor for leaf blight, avoid wetting foliage and fruit, and remove affected plants promptly. Resistant varieties and ventilated rain protection can reduce risk.'},
buckeye_rot:{prevention:'Support lower trusses clear of soil, apply a clean mulch and water carefully at root level to reduce soil splashing.'},
aphids:{treatment:'Tolerate small colonies on vigorous plants. Squash damaging colonies by hand and encourage natural predators; use suitable biological controls under cover only with supplier advice.'},
cutworm:{treatment:'Search just below the soil around damaged stems and hand-remove caterpillars. Replace plants that cannot recover.',prevention:'Protect vulnerable transplants with collars around the stem and check regularly; do not rely on wood ash as a dependable barrier.'}
},cucurbit_troubles:{
no_fruit:{treatment:'For courgettes, marrows and squash needing pollination, transfer pollen from a male flower to two or three female flowers on a dry morning. Keep roots moist. Do not hand-pollinate greenhouse cucumbers grown for unpollinated fruit; follow the variety instructions.'},
eelworm:{prevention:'Avoid infested soil and contaminated root balls. Confirm the nematode species before selecting rotation crops or duration; a fixed six-year interval is not a universal remedy.'},
grey_mould_botrytis:{treatment:'Remove and dispose of infected fruit, leaves and badly affected plants promptly.',prevention:'Ventilate, avoid overcrowding and remove dying tissue. Avoid waterlogging and persistent surface wetness.'},
anthracnose_on_fruit:{treatment:'Discard infected fruit and remove badly affected plants. Improve airflow and avoid splashing healthy foliage and fruit.'},
slugs_and_snails:{treatment:'Inspect in damp weather or after dark and hand-remove slugs and snails around vulnerable plants and fruit.',prevention:'Keep damp debris away from vulnerable seedlings, avoid planting into cold conditions, and support fruit on a clean tile or board. Retain wildlife habitat elsewhere for natural predators.'},
mice:{prevention:'Where previous damage warrants protection, raise plants in protected pots or use secure rodent-resistant guards over sowings. Confirm the cause of missing seeds before acting; do not use poison bait around the crop.'},
anthracnose_leaf_spot:{treatment:'Remove affected leaves and dispose of badly diseased plants. Improve ventilation and avoid splashing foliage.'},
blotch:{treatment:'Remove badly affected leaves and plants. Confirm the diagnosis if losses recur.',prevention:'Use clean containers and fresh compost. Maintain ventilation and avoid prolonged leaf wetness; all-female flower type is not a guarantee of disease resistance.'},
basal_stem_rot:{treatment:'Remove severely affected plants and correct wet growing conditions. Do not bury a rotten stem base in wet mulch or rely on a fungicide dust to restore it.'},
powdery_mildew:{treatment:'Remove badly affected older leaves and keep the remaining crop growing steadily. Maintain root moisture and airflow without routine fungicide spraying.'},
withering_of_young_fruit:{treatment:'Remove failed fruit. Check pollination requirements, root condition, compost moisture and drainage. Water according to actual need rather than withholding water for a fixed week; reduce water only where compost is too wet.'},
bitterness:{treatment:'Do not eat unusually bitter cucumbers, courgettes, marrows, squash or pumpkins. Discard them. Cutting or rubbing the ends, and cooking, are not reliable ways to make bitter fruit safe.'},
sun_scald:{prevention:'Use greenhouse shading and ventilation during strong sunshine. Keep roots evenly moist without waterlogging.'},
under_ripe_squash_and_pumpkin_fruit:{treatment:'Use sound immature edible squash promptly rather than storing it for winter. Discard fruit that is rotten or tastes unusually bitter; do not use ornamental gourds as food.'}
}};
for(const[slug,plan]of Object.entries(plans)){
 const g=data[slug];assert(!g.ai_layout,'Preserve existing layout');
 assert.deepEqual(Object.keys(plan.copy).sort(),Object.keys(g.conditions).sort());
 for(const c of Object.values(g.conditions))assert(!c.ai_print&&!printFields.some(f=>c['ai_'+f]!==undefined),'Preserve existing AI edits');
 for(const[k,fields]of Object.entries(edits[slug]))Object.assign(g.conditions[k],fields);
}
console.log('Source',saveCollections({troubles:data},{actor:'User-authorised AI source edit: organic methods and associated corrections (model not recorded)',expectedRevision:rev}));
const draftRev=revision(),now=new Date().toISOString(),actor='AI: assisted print (model not recorded)';
for(const[slug,plan]of Object.entries(plans)){
 const g=data[slug];
 for(const[k,values]of Object.entries(plan.copy)){
  const c=g.conditions[k],dependencies=Object.fromEntries([...printFields,'name','applies_to','active_period'].map(f=>[f,signature(c[f])]));
  c.ai_print={version:1,fields:{}};
  printFields.forEach((f,i)=>{c['ai_'+f]=values[i];c.ai_print.fields[f]={updated_at:now,updated_by:actor,status:'draft',locked:false,dependencies,output_signature:signature(values[i])};});
 }
 g.ai_introduction=plan.intro;
 g.ai_layout={version:1,status:'draft',renderer:'troubles-cards-2',updated_at:now,updated_by:actor,hero_images:plan.heroes.map(k=>'/images/vegetables/'+k+'.png'),pages:plan.pages.map((cols,i)=>({...i===0?{intro_height_mm:32}:{},columns:cols.map(keys=>keys.map(key=>({key,height_mm:((i===0?206:238)-(keys.length-1)*3)/keys.length})))})),source_signature:layoutSourceSignature(g)};
 assert.deepEqual(plan.pages.flat(2).sort(),Object.keys(g.conditions).sort());
}
console.log('Drafts',saveCollections({troubles:data},{actor,expectedRevision:draftRev}));
