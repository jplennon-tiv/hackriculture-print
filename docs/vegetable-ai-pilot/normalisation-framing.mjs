// John authorised this focused framing/page-fill pass on 23 September 2026.
// Canonical writes use the shared revision guard and exact prior-byte backup.
import {fs,assert,readCollection,revision,clone,refresh,save} from '../../../hackriculture-data/planning/normalisation-02-tools.mjs';
const before=readCollection('vegetables'),data=clone(before),rev=revision(),changes=[];
assert.equal(rev,'1870b7ca9b1f46f5bc4459796915d59c04a8023c870c686b11f71266fd305205','Historical one-shot correction: source has moved; do not replay');
const pair=(metric,imperial)=>({metric,imperial});
const numeric=s=>String(s).match(/\d+(?:\.\d+)?|[½¾¼]/g)??[];
function set(k,obj,field,value,reason){if(JSON.stringify(obj[field])===JSON.stringify(value))return;changes.push({crop:k,field,before:obj[field],after:value,reason});obj[field]=value;}
function frame(value,kind){
 if(!value)return value;if(typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,x])=>[k,frame(x,kind)]));
 if(typeof value!=='string')return value;
 if(kind==='rows'&&/between.*rows|rows.*apart|each way|each direction|block of four/.test(value))return value;
 if(kind==='plants'&&/between.*plants|apart|each way|all ways|per (?:pot|station|prepared)|between mounds/.test(value))return value;
 const target=kind==='rows'?'between rows':'between plants';
 // A single dimension reads naturally with a suffix; multi-route advice gets a clear prefix.
 const out=/^(?:About |about )?\d+(?:[.\d/ –-]*)\s*(?:cm|m|in\.|ft)$/.test(value.trim())?value.trim()+' '+target:target[0].toUpperCase()+target.slice(1)+': '+value;
 assert.deepEqual(numeric(out),numeric(value));return out;
}
for(const[k,v]of Object.entries(data)){
 function walk(s){if(!s||typeof s!=='object')return;for(const[f,x]of Object.entries(s)){if(['row_spacing','row_spacing_summary','final_row_spacing'].includes(f))set(k,s,f,frame(x,'rows'),'Restore row-spacing context; dimensions unchanged');else if(['plant_spacing','plant_spacing_summary'].includes(f))set(k,s,f,frame(x,'plants'),'Restore plant-spacing context; dimensions unchanged');else if(x&&typeof x==='object'&&!Array.isArray(x))walk(x);}}
 walk(v.sowing_and_planting);
 if(k==='bean_french')set(k,v.sowing_and_planting,'dwarf_block_spacing',pair('15 cm between plants each way in a block','6 in. between plants each way in a block'),'Distinguish dwarf block spacing from rows and climbing supports');
}
// Clarify mixed row/plant routes without changing any dimensions.
for(const[k,p]of Object.entries({
 broccoli:pair('Sprouting: 75 cm between plants and rows; calabrese: 30–45 cm between plants, rows 45 cm apart','Sprouting: 30 in. between plants and rows; calabrese: 12–18 in. between plants, rows 18 in. apart'),
 cabbage:pair('30–45 cm between plants and rows; spring greens: 10 cm between plants, thin to 30 cm; Chinese: 30 cm between plants, rows 45 cm apart','12–18 in. between plants and rows; spring greens: 4 in. between plants, thin to 12 in.; Chinese: 12 in. between plants, rows 18 in. apart'),
 cauliflower:pair('Summer/autumn: 45–60 cm between plants; winter/spring: 70 cm; mini-cauliflowers: 15 cm','Summer/autumn: 18–24 in. between plants; winter/spring: 28 in.; mini-cauliflowers: 6 in.'),
 celery:pair('Trench types: 30–45 cm between plants; self-blanching/green: 25 cm each way.','Trench types: 12–18 in. between plants; self-blanching/green: 10 in. each way.'),
 spinach:pair('True spinach: thin to 8 cm between plants, then harvest alternate plants to leave about 15 cm. Baby leaves need little thinning.','True spinach: thin to 3 in. between plants, then harvest alternate plants to leave about 6 in. Baby leaves need little thinning.')
})){
 for(const u of ['metric','imperial'])assert.deepEqual(numeric(p[u]),numeric(before[k].sowing_and_planting.plant_spacing[u]));
 set(k,data[k].sowing_and_planting,'plant_spacing',p,'Clarify each route in mixed spacing advice');
}
set('cauliflower',data.cauliflower.sowing_and_planting,'row_spacing',pair('Summer/autumn: 60 cm between rows; winter/spring: 70 cm; mini: 15 cm','Summer/autumn: 24 in. between rows; winter/spring: 28 in.; mini: 6 in.'),'Restore between-rows description');
const summaries={
 artichoke_jerusalem:'Late autumn; about 8–9 months after spring planting',
 artichoke_globe:'First main crop in the second summer after planting',
 asparagus:'First cutting 2 years after planting crowns; 3 years from seed',
 bean_broad:'From sowing: spring crops ~14 weeks; autumn crops ~26 weeks',
 beetroot:'From sowing: globe roots ~11 weeks; long roots ~16 weeks',
 carrot:'From sowing: early roots ~12 weeks; maincrop ~16 weeks',
 cauliflower:'From sowing: summer/autumn 18–24 weeks; winter 40–50 weeks',
 celery:'From sowing: self-blanching ~25 weeks; trench types ~40 weeks',
 endive:'Heads 12–16 weeks from sowing; baby leaves sooner',
 florence_fennel:'From sowing: baby bulbs ~6 weeks; full bulbs 12–16 weeks',
 garlic:'Summer harvest: roughly 8–9 months from autumn planting; spring crops sooner',
 leek:'From sowing: early crops ~30 weeks; late winter/spring crops ~45 weeks',
 lettuce:'From sowing: loose leaves 6–8 weeks; hearts 8–14 weeks',
 marrow_courgette:'About 8–14 weeks from sowing; pick courgettes young',
 squash_pumpkin:'From sowing: summer squash 8–12 weeks; ripe winter crops 16–24 weeks',
 mushroom:'First flush a few weeks after casing; kit preparation and conditions vary',
 onion_shallot:'From planting: sets ~20 weeks, shallots ~18; from sowing: spring ~22, August ~46 weeks',
 oriental_leaves:'From sowing: baby leaves ~3–4 weeks; pak choi ~6; cabbage hearts ~10 weeks',
 pea:'From sowing: spring crops 12–16 weeks; autumn crops ~32 weeks',
 potato:'From planting: first earlies ~13 weeks; second earlies 16–18; maincrop ~22 weeks',
 radish:'From sowing: salad roots 3–6 weeks; winter roots 10–12 weeks',
 rhubarb:'Crowns: second spring, 12–18 months after planting; seed-grown plants a year longer',
 salsify_scorzonera:'About 25 weeks from sowing; lift from autumn through winter',
 spinach:'From sowing: baby leaves ~4 weeks; mature leaves ~8; longer in cold weather',
 sweet_corn:'About 10–16 weeks from sowing for early varieties; later varieties take longer',
 turnip:'About 6–12 weeks from sowing; baby roots may be ready sooner'
};
for(const[k,v]of Object.entries(data)){
 let s=summaries[k];const t=v.time_to_harvest;
 if(!s&&!t.ready_in_summary){const route=t.default?.from_sowing?'sowing':'planting',d=t.default?.['from_'+route];if(d?.min)s=`About ${d.min}${d.max&&d.max!==d.min?'–'+d.max:''} ${d.unit} from ${route}`;}
 if(s)set(k,t,'ready_in_summary',s,'Explain harvest stage and the start of the elapsed interval');
}
// Seasonal-to-duration estimates are explicit editorial inferences, not RHS quoted durations.
set('artichoke_jerusalem',data.artichoke_jerusalem.time_to_harvest.default.from_planting,'text','Late autumn, roughly 8–9 months after spring planting; lift tubers as needed through winter','RHS spring planting to late autumn harvest; approximate calendar interval');
// Restore more of already-reviewed source descriptions where normalisation left large holes.
for(const k of ['aubergine','asparagus','beetroot','brussels_sprouts','cabbage','cauliflower','celery','kohl_rabi']){
 const v=data[k];function fuller(obj){if(!obj||typeof obj!=='object')return;for(const x of Object.values(obj)){if(x&&typeof x==='object'&&x.text&&!x.short_text){x.short_text=clone(x.text);}else fuller(x);}}
 fuller(v.varieties);
 const n={brussels_sprouts:4,cabbage:4,cauliflower:4,celery:4}[k];if(n)v.ai_print_layout.value.intro_sentences=n;
}
// Garlic's metadata-style varieties display character.text; restore useful type/flavour/season context there.
const garlicDescriptions={
 Elephant:'A leek relative with very large, mild cloves; plant in October–November for July lifting, give extra room and remove young scapes as they form.',
 Germidour:'A purple-skinned softneck with no flower stalk; plant in October–December and expect lifting in late June or July.',
 'Spanish Roja':'A strongly flavoured hardneck with thin skins; plant in October–February for July lifting and remove tender scapes once the bud forms.',
 'Solent Wight':'A white-skinned softneck with strong flavour and good keeping quality; plant in October–December and lift in July–August, depending on planting.'
};
for(const[name,text]of Object.entries(garlicDescriptions))data.garlic.varieties[name].character.text=text;
// Fuller paragraphs copied from current master, preserving unit pairs and avoiding repeated points.
const restore={asparagus:{soil_facts:[0,1,2]},brussels_sprouts:{looking_after_the_crop:[0,1,2,3,4]},cabbage:{soil_facts:[0,1]},cauliflower:{harvesting:[0,1]},celery:{looking_after_the_crop:[0,1,3,5,6]},kohl_rabi:{soil_facts:[0,1,2],harvesting:[0,2,3]},lettuce:{harvesting:[0,1,3]},mushroom:{soil_facts:[0,1,2],looking_after_the_crop:[0,1,2,5],harvesting:[0,1,2,3,4]}};
for(const[k,slots]of Object.entries(restore))for(const[slot,indices]of Object.entries(slots))data[k].ai_print_extracts.sections[slot].value=indices.map(i=>{const x=data[k][slot][i];assert.ok(x?.text);return{text:clone(x.text),rank:x.rank??8,...(x.icon?{icon:x.icon}:{})};});
data.mushroom.ai_print_extracts.sections.introduction.value=data.mushroom.introduction;
const changed=[];
for(const[k,v]of Object.entries(data))if(JSON.stringify(v)!==JSON.stringify(before[k])){
 v.metadata??={};v.metadata.measurement_framing={at:new Date().toISOString(),by:'AI:gpt-6-astra',scope:'Restore spacing and elapsed-time context; dimensions unchanged. Restore fuller existing source text in underfilled proofs.',status:'draft-for-John-review'};
 if(['artichoke_jerusalem','garlic'].includes(k))v.metadata.measurement_framing.duration_evidence={source:`https://www.rhs.org.uk/vegetables/${k==='garlic'?'garlic':'jerusalem-artichokes'}/grow-your-own`,note:'8–9 months is an approximate editorial interval between typical planting and harvest seasons, not a fixed RHS maturity claim.'};
 refresh(v,before[k]);changed.push(k);
}
function checkNumbers(a,b,p){if(a&&typeof a==='object'){for(const[k,x]of Object.entries(a))checkNumbers(x,b[k],p+'/'+k);}else assert.deepEqual(numeric(b),numeric(a),p);}
for(const[k,v]of Object.entries(data)){function dims(a,b,p=''){if(!a||typeof a!=='object')return;for(const[f,x]of Object.entries(a)){if(/spacing|depth/.test(f)&&b?.[f])checkNumbers(x,b[f],k+p+'/'+f);else if(x&&typeof x==='object')dims(x,b?.[f],p+'/'+f);}}dims(before[k].sowing_and_planting,v.sowing_and_planting);}
fs.mkdirSync('tmp/framing',{recursive:true});fs.writeFileSync('tmp/framing/field-changes.json',JSON.stringify(changes,null,2));fs.writeFileSync('tmp/framing/baseline-layouts.json',JSON.stringify(Object.fromEntries(Object.entries(before).map(([k,v])=>[k,v.ai_print_layout])),null,2));
if(process.argv.includes('--apply'))save(data,rev,changed,'NORMALISATION-FRAMING-WRITTEN.json','admin: John authorised measurement framing and source-grounded page fill; authored by AI:gpt-6-astra');
console.log(JSON.stringify({audited:Object.keys(data).length,changed,framing_edits:changes.length,dry_run:!process.argv.includes('--apply')}));
