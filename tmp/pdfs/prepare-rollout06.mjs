import fs from 'node:fs';
import path from 'node:path';
import {plantingSourceFingerprint} from '../../src/lib/planting.ts';
const old=JSON.parse(fs.readFileSync('../hackriculture-data/vegetables.json'));
const s='sowing_and_planting.';
const step=(title,text,...paths)=>({title,text,source_paths:paths.map(p=>p.startsWith('@')?p.slice(1):s+p)});
const specs={
 artichoke_jerusalem:[
  step('Set the tuber','Plant tubers in late winter or early spring. Choose a clump or block where tall stems will not shade lower crops.','method','notes.1','notes.2'),
  step('Cover carefully','Replace the earth carefully over the tubers, then rake a low ridge. Remove stray tuber fragments when clearing the bed; they can regrow.','method','notes.3')],
 artichoke_globe:[
  step('Position the offset','Use rooted suckers or offsets for dependable results. Plant in spring in colder areas, or autumn where winters are mild.','planting.method','planting.notes.1','seed_sowing.notes.0'),
  step('Firm at the same level','Keep the crown at its previous growing depth. Remove leaf tips, firm the soil and water thoroughly. Allow extra room in rich soil.','planting.method','planting.notes.0')],
 asparagus:[
  step('Prepare a mound','Prepare clean, well-drained ground and a low mound of fine soil in the trench. Keep bought crowns moist until planting.','planting.method','planting.notes.2','planting.notes.3'),
  step('Spread the roots','Spread roots carefully over the mound, with the crown slightly higher than the root ends.','planting.method'),
  step('Cover progressively','Cover immediately with sifted soil and water if dry. Fill the trench gradually as growth develops, leaving the bed level by autumn.','planting.method')],
 aubergine:[
  step('Raise in warmth','Sow under cover in February or March. Keep the stronger seedling and pot on gently; buy young plants if reliable sowing heat is unavailable.','method','notes.3'),
  step('Plant into warmth','Harden off before outdoor planting. Wait for warm soil and weather, protect with cloches until settled, and water in without damaging roots.','method','notes.0','notes.1','notes.4')],
 capsicum:[
  step('Raise in warmth','Sow under cover in February or March with steady warmth. Keep the strongest seedling and pot on carefully, or buy young plants to grow on.','method'),
  step('Set the final plant','Harden off before moving outdoors after frost danger, when soil is warm. Set plants a little deeper and water in well; protect until weather settles.','method','notes.1')],
 celeriac:[
  step('Surface sow','Sow tiny seeds on moist compost under glass in early spring. Do not bury them; germination can take three weeks.','method'),
  step('Grow on','Prick out small seedlings into modules. Keep growth steady, avoiding cold and drought, then harden off before planting.','method','notes.3'),
  step('Keep the crown clear','Plant after late frost risk. Keep the swollen stem-base at soil level, firm and water well. Do not earth up like celery.','method','planting_depth','notes.0')],
 celery:[
  step('Raise seedlings','Surface sow, or cover only lightly. Keep compost damp and ventilated. Prick out at the first true leaves and harden off gradually.','method','sowing_depth'),
  step('Plant a block','After frost risk, plant self-blanching or green types in a close block at module depth. Water regularly to keep growth moving.','planting_depth','notes.0','notes.3')],
 florence_fennel:[
  step('Raise in modules','Sow into modules for a careful transplant, or direct into shallow drills after mid-May. Summer sowing is less prone to bolting.','seed_sowing.method'),
  step('Plant level','Plant while seedlings are still growing strongly. Keep the rootball intact, set at module depth without burying the growing point, and water well.','planting.method','planting.planting_depth','planting.notes.1')],
 mushroom:[
  step('Start with spawned compost','For the straightforward indoor route, buy fresh ready-spawned compost in a bag, bucket or box. Keep it shaded from direct sunlight.','@looking_after_the_crop.7','@looking_after_the_crop.5'),
  step('Maintain moisture','Once casing is added, keep it moist but not wet. Water lightly when needed and avoid saturation. This illustrates the supplied-compost route.','@looking_after_the_crop.2','@looking_after_the_crop.3')],
 rhubarb:[
  step('Set the crown','Use a bought crown or a vigorous piece divided during winter dormancy. Set it right way up, with buds or new shoots just above the soil.','planting.method','planting.notes.0'),
  step('Firm and water','Firm the soil around the crown and water in. Do not bury new shoots; leave room for a substantial permanent clump.','planting.method','planting.notes.2')],
 tomato_greenhouse:[
  step('Grow on in a pot','Sow in trays or small pots, keeping compost moist but not wet. Prick out and pot on as needed; keep seedlings bright for stout stems.','method','temperature','book3_seed_raising'),
  step('Plant and support','Water the pot first. Plant when well grown and the first truss is opening, setting slightly deeper. Add a firm cane or a string under the rootball.','planting_out','greenhouse_planting','supporting')],
 tomato_outdoor:[
  step('Grow on and harden','Raise seedlings under cover in spring or buy sturdy pot-grown plants. Harden them off gradually before outdoor planting.','method','seed_raising'),
  step('Plant beside support','Plant in settled late-spring weather as the first truss opens. Water first, preserve the rootball and set slightly deeper. Support tall types and tie in regularly.','planting_out','outdoor_tall_support')],
};
const extra={
 artichoke_globe:['Seed route: sow under cover in late winter or early spring, or in place in spring; harden off pot-grown seedlings before planting.','seed_sowing.method'],
 asparagus:['Seed route: sow thinly in spring, thin and grow on for planting into the final bed the following spring. Cropping starts later than with crowns.','seed_sowing.method','seed_sowing.notes.0'],
 celery:['Trench types follow a different route: plant in a prepared trench and earth up later as stems lengthen. The illustration shows the block-grown route.','notes.1','planting_depth'],
 rhubarb:['Seed is an alternative: grow young plants on for late-summer or autumn planting. Crowns preserve named varieties and crop sooner.','seed_sowing.method','seed_sowing.notes.0','seed_sowing.notes.1'],
 tomato_outdoor:['Bush and basket types have their own spacing and need a different support routine from tall cordons.','bush_tomato_planting'],
};
const measures={
 artichoke_jerusalem:[['Tuber depth','planting_depth'],['Rows','row_spacing'],['Plants / blocks','plant_spacing']],
 artichoke_globe:[['Final rows','row_spacing'],['Final plants','plant_spacing']],
 asparagus:[['Trench','trench_or_ridge_depth'],['Initial cover','planting_depth'],['Trenches','row_spacing'],['Crowns','plant_spacing']],
 aubergine:[['Rows','row_spacing'],['Plants','plant_spacing']],
 capsicum:[['Rows','row_spacing'],['Plants','plant_spacing']],
 celeriac:[['Rows','row_spacing'],['Plants','plant_spacing']],
 celery:[['Spacing by type','plant_spacing'],['Rows / blocks','row_spacing']],
 florence_fennel:[['Rows','row_spacing'],['Direct-sown plants','seed_sowing.plant_spacing']],
 mushroom:[],rhubarb:[['Rows','row_spacing'],['Crowns','plant_spacing']],
 tomato_greenhouse:[],tomato_outdoor:[['Tall plants','plant_spacing']],
};
const jobs=[];
for(let n=1;n<=8;n++){
 const b=JSON.parse(fs.readFileSync(`docs/planting-illustrations/BATCH-0${n}.json`));
 jobs.push(...b.jobs,...(b.reuse??[]).map(j=>({...j,id:`0${j.stage}-reuse`,title:'Reuse'})));
}
const patch=['*** Begin Patch','*** Update File: /Users/johnlennon/Documents/web_site/hackriculture-data/vegetables.json'];
const layouts=[];
for(const key of Object.keys(old).filter(k=>specs[k])){
 if(old[key].print_planting)throw Error('Already prepared '+key);
 const selected=jobs.filter(j=>j.crop===key).sort((a,b)=>a.id.localeCompare(b.id));
 if(selected.length!==specs[key].length)throw Error('Stage count '+key);
 const steps=specs[key].map((v,i)=>({id:`step${i+1}`,...v}));
 const supplementary=extra[key]?[{id:'alternative',text:extra[key][0],source_paths:extra[key].slice(1).map(p=>s+p)}]:[];
 const c={version:1,steps,supplementary,optional_note_paths:[],reviewed_source:''};
 c.reviewed_source=plantingSourceFingerprint(old[key],c);
 const a=JSON.stringify(old[key],null,2).split('\n'),tail=a.slice(-8,-1).map(l=>'  '+l);
 patch.push(`@@   "${key}": {`,...tail.slice(0,-1).map(l=>' '+l),'-'+tail.at(-1),'+'+tail.at(-1)+',',...JSON.stringify(c,null,2).split('\n').map((l,i)=>'+'+(i===0?'    "print_planting": {':'    '+l)),'   },');
 const stages=selected.map((j,i)=>{
  const file=j.preferredFile??j.file;
  const name=path.basename(file).replace(/^\d+-/,'');
  const dir=`public/images/planting/${key}`;fs.mkdirSync(dir,{recursive:true});
  fs.copyFileSync(`docs/planting-illustrations/${file}`,`${dir}/${name}`);
  return {id:`step${i+1}`,image:`/images/planting/${key}/${name}`};
 });
 layouts.push(`+    ${key}: ${JSON.stringify({stages,paired:steps.length===2,imageMm:14,minImageMm:14,maxImageMm:14,measurements:measures[key].map(([label,p])=>({label,path:s+p}))})},`);
}
patch.push('*** Update File: /Users/johnlennon/Documents/web_site/hackriculture-print/src/print/plantingIllustrations.ts','@@',' export const pendingPlantingLayouts: Record<string, PlantingLayout> = {',...layouts,'*** End Patch');
console.log(patch.join('\n'));
