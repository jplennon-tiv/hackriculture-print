import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {readCollection,saveCollections,revision,refreshGenerated} from '../../hackriculture-data/lib/records.mjs';
import {signature,printFields,layoutSourceSignature} from '../src/lib/aiPrint.ts';
import plans from '../docs/troubles-design/batch-03-copy.mjs';
const data=readCollection('troubles'),rev=revision();
for(const [slug,p]of Object.entries(plans)){assert(!data[slug].ai_layout);assert.deepEqual(Object.keys(p.copy).sort(),Object.keys(data[slug].conditions).sort());for(const c of Object.values(data[slug].conditions))assert(!c.ai_print);}
const edits={celery_troubles:{
celery_fly_leaf_miner:{description:'Small white maggots feed together within celery leaves from May into autumn. Broad pale blotch mines become brown and papery; severe early damage can stunt celery and make stalks bitter. Celeriac and related plants can also be affected.',treatment:'Tolerate light damage. On uncovered plants, pinch out badly mined parts of leaves; retain enough healthy foliage for growth.',prevention:'Inspect seedlings and young plants regularly. Use insect-proof mesh with crop rotation so flies cannot emerge from old pupae beneath the cover. Encourage natural enemies; do not rely on strong-smelling liquid feeds as a repellent.'},
celery_leaf_spot_blight:{treatment:'Remove affected leaves and discard badly diseased plants. Improve airflow and avoid splashing healthy foliage.',prevention:'Buy healthy seed and disease-free transplants from a reputable supplier. Never plant seedlings with spotted leaves. Keep trays clean, avoid stale wet conditions and clear infected crop debris; do not attempt improvised hot-water seed treatment.'},
slugs_and_snails:{treatment:'Check plants after dark or in damp weather and hand-remove slugs and snails. At harvest trim damaged celery and use only sound stems; discard rotten tissue. Harvest damaged celeriac before it deteriorates.'}
},florence_fennel_troubles:{
bolting_stemmy_bulbs:{prevention:'For direct outdoor sowing in British conditions, June or July is usually safer once temperatures have warmed. Earlier sowing needs suitable protected conditions and cultivar guidance. Choose a bolt-resistant variety and avoid checks from dryness, crowding, root disturbance or poor soil.'},
lower_sheath_rot:{treatment:'Harvest promptly when outer sheaths start deteriorating. Discard rotten tissue, use only firm sound parts promptly and discard extensively rotted bulbs.'}
},spinach_troubles:{
downy_mildew:{treatment:'Remove diseased leaves. Discard badly affected plants and resow a short row; use cultural controls rather than fungicide spraying.'},
leaf_spot:{treatment:'Pick off and dispose of diseased leaves. Remove badly affected plants and clear infected debris; do not use routine fungicide spraying.',prevention:'Rotate crops and maintain balanced fertility with compost and an appropriate organic fertiliser only where needed. Avoid overcrowding and prolonged foliage wetness.'},
spinach_blight:{prevention:'Remove weed hosts and infected plants after confirming the diagnosis. Monitor aphids and encourage natural predators; squash small damaging colonies where practical. Aphid management does not guarantee prevention of virus transmission.'},
manganese_deficiency:{description:'Yellow areas appear between greener leaf veins, sometimes with curled margins. Manganese deficiency can occur where alkaline or over-limed soil makes the nutrient unavailable; poor roots and other deficiencies can cause similar symptoms, so leaf colour alone is not a diagnosis.',treatment:'Check soil pH, root health, watering and feeding before applying nutrients. If deficiency is confirmed, seek advice on a suitable organic-compatible manganese correction rather than applying trace elements blindly.',prevention:'Maintain good soil condition and drainage and avoid unnecessary lime. Use a soil test to guide amendments; do not treat a single pH threshold as proof of deficiency.'},
bolting:{prevention:'Prepare moisture-retentive soil with compost and balanced organic nutrition where needed. Choose a bolt-resistant variety, thin promptly, mulch and water during dry weather. Use successive short sowings; New Zealand spinach can provide a tender summer alternative after frost danger has passed.'}
}};
for(const [slug,conditions]of Object.entries(edits))for(const [key,fields]of Object.entries(conditions))Object.assign(data[slug].conditions[key],fields);
const images=JSON.parse(fs.readFileSync('docs/troubles-design/batch-03-results.json','utf8'));assert.equal(images.length,12);
for(const j of images){const c=data[j.group].conditions[j.key];assert(c);c.image='/'+j.destination.replace(/^public\//,'');c.image_revision=createHash('sha256').update(fs.readFileSync(j.destination)).digest('hex');}
console.log('Source/art',saveCollections({troubles:data},{actor:'User-authorised organic source correction and artwork batch 03 (model not recorded)',expectedRevision:rev}));
const draftRev=revision(),now=new Date().toISOString(),actor='AI: assisted print (model not recorded)';
for(const [slug,p]of Object.entries(plans)){
 const g=data[slug];for(const [key,values]of Object.entries(p.copy)){
 const c=g.conditions[key],dependencies=Object.fromEntries([...printFields,'name','applies_to','active_period'].map(f=>[f,signature(c[f])]));
 c.ai_print={version:1,fields:{}};printFields.forEach((f,i)=>{c['ai_'+f]=values[i];c.ai_print.fields[f]={updated_at:now,updated_by:actor,status:'draft',locked:false,dependencies,output_signature:signature(values[i])};});
 }
 g.ai_introduction=p.intro;const keys=Object.keys(p.copy),pages=[];
 while(keys.length){const b=keys.splice(0,4),split=b.length===2?1:2,cols=[b.slice(0,split),b.slice(split)];pages.push({...pages.length===0?{intro_height_mm:32}:{},columns:cols.map(c=>c.map(key=>({key,height_mm:((pages.length===0?206:238)-(c.length-1)*3)/c.length})))});}
 g.ai_layout={version:1,status:'draft',renderer:'troubles-cards-2',updated_at:now,updated_by:actor,hero_images:p.heroes.map(k=>'/images/vegetables/'+k+'.png'),pages,source_signature:layoutSourceSignature(g)};
}
console.log('Drafts',saveCollections({troubles:data},{actor,expectedRevision:draftRev}));refreshGenerated();
