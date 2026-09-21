// Bounded editorial proposal. Pure in-memory changes until the guarded saver runs.
import {layoutDependencies,printChecksum,assertVegetableExtractWritable} from '../../src/lib/vegetablePrint.ts';
export const keys=['radish','beetroot','carrot','lettuce','bean_broad','bean_french','bean_runner'];
export const candidates={radish:[6],lettuce:[8,9],bean_runner:[8,9]};
export function curate(data,shared){
 const condition=(key,name)=>data[key].troubles_detail.flatMap(g=>Object.values(shared[g].conditions)).find(c=>c.name===name);
 const append=(t,text)=>{if(text&&!t.text.includes(text))t.text+=' '+text;};
 const edit=(key,name,signs,control)=>{
  const t=data[key].troubles[name];
  // Preserve earlier useful table-only wording, but withdraw chemical prescriptions.
  if(t.control&&!/permethrin|heptenophos|pirimicarb|cheshunt|carbendazim|fungicide|growmore/i.test(t.control))append(t,t.control);
  if(t.signs)append(t,t.signs);
  t.signs=signs;t.control=control;append(t,control);
 };
 const add=(key,name,signs,control,rank)=>{
  const c=condition(key,name);if(!c)throw Error(`Missing source ${key}/${name}`);
  data[key].troubles[name]={text:[c.description,c.treatment,c.prevention].filter(Boolean).join(' '),rank:rank??c.rank??5,signs,control};
 };
 // Radish already covers five distinct practical problems; avoid the shared
 // woody-roots/checked-growth and winter-bolting aliases. Add the RHS-confirmed slug risk.
 data.radish.troubles['Slugs and Snails']={text:'Slugs and snails can eat radish leaves and damage seedlings. Check vulnerable plants after dark or in damp weather and hand-remove animals causing damage. Keep nearby hiding places under review while retaining habitat elsewhere for predators.',rank:6,signs:'Chewed seedlings; slime trails.',control:'Check after dark; hand-pick around seedlings.'};
 edit('radish','FLEA BEETLE','Tiny holes in young leaves.','Keep seedlings growing; cover with fine mesh.');
 edit('radish','CABBAGE ROOT FLY','Roots tunnelled by maggots.','Use mesh; trim minor root damage.');
 edit('radish','ACID SOIL','Poor growth in acid soil.','Test soil; lime only where needed.');
 edit('radish','BOLTING','Early flowers; poor roots.','Sow winter radishes from July onwards.');
 // Beetroot: all eight existing, distinct entries are useful. Correct legacy
 // chemical wording against the already reviewed shared beetroot source.
 data.beetroot.troubles.Blackleg.text=condition('beetroot','Blackleg').description;
 const beet=[
  ['Bolting','Early flowering; poor roots.','Avoid early sowing; thin promptly; use resistant varieties.'],
  ['Fanging','Forked roots.','Avoid fresh manure and stones; prepare soil well.'],
  ['Mangold Fly (Leaf Miner)','Blisters and tunnels in leaves.','Crush larvae in mines; use mesh on a rotated bed.'],
  ['Heart Rot','Brown or black areas inside roots.','Confirm boron shortage; seek organic correction advice.'],
  ['Blackleg','Seedlings blacken and collapse.','Remove affected seedlings; improve drainage.'],
  ['Speckled Yellows','Yellow patches; rolled edges.','Confirm manganese shortage; avoid excess lime.'],
  ['Autumnal Fungal Root Rots','Dark rot in wet autumns.','Lift promptly; store only sound roots.'],
  ['Leaf Spot','Brown spots with pale centres.','Remove badly affected leaves; rotate; add compost.'],
 ];
 for(const [n,s,c]of beet){const t=data.beetroot.troubles[n],src=condition('beetroot',n);append(t,src.treatment);append(t,src.prevention);edit('beetroot',n,s,c);}
 // Carrot: preserve separate aphid and virus diagnoses, with no promise that
 // aphid control prevents infection; include useful storage disorders and green tops.
 edit('carrot','Carrot-Willow Aphid','Distorted, stunted leaves.','Squash damaging colonies; encourage predators.');
 append(data.carrot.troubles['Carrot-Willow Aphid'],'Aphid management cannot guarantee prevention of virus transmission.');
 edit('carrot','Motley Dwarf Virus','Yellow mottling; red outer leaves.','No cure; remove affected plants. Monitor aphids.');
 edit('carrot','Black Rot','Black lesions on stored roots.','Remove rotten roots; store sound roots; rotate.');
 edit('carrot','Green Top','Green exposed crowns.','Earth up to cover exposed root tops.');
 edit('carrot','Violet Root Rot','Purple felt-like growth on roots.','Destroy affected roots; never store them; rotate.');
 edit('carrot','Small Roots','Small roots; weak growth.','Improve soil; use organic feed if growth is poor.');
 edit('carrot','Sclerotinia Rot','White mould; rotting roots.','Remove diseased roots; store sound roots; rotate.');
 edit('carrot','Carrot Fly','Tunnelled roots.','Use fine mesh; remove thinnings; avoid bruising.');
 edit('carrot','Splitting','Split roots.','Water evenly; mulch in drought; use split roots now.');
 // Lettuce: one precise downy-mildew row, then distinct leaf aphids, grey
 // mould and cutworm rather than another copy of mildew from the fallback pool.
 const mildew=data.lettuce.troubles.MILDEW;
 data.lettuce.troubles=Object.fromEntries(Object.entries(data.lettuce.troubles).map(([k,v])=>[k==='MILDEW'?'Downy Mildew':k,v]));
 const downy=condition('lettuce','Downy Mildew');append(mildew,downy.description);append(mildew,downy.treatment);append(mildew,downy.prevention);
 edit('lettuce','Downy Mildew','Yellow patches; white mould beneath.','Remove affected leaves; space and ventilate plants.');
 edit('lettuce','SLUGS','Ragged leaves; slime trails.','Hand-pick after dark; protect seedlings.');
 edit('lettuce','ROOT APHID','Wilting; white patches on roots.','Water well; choose root-aphid resistance.');
 edit('lettuce','TIPBURN','Brown, scorched leaf edges.','Keep moisture steady; remove decaying leaves.');
 for(const a of [
  ['Bolting','Flower stems; bitter leaves.','Water steadily; sow in season; pick promptly.',9],
  ['Aphid','Sticky, curled leaves; colonies.','Squash colonies; encourage predators.',7],
  ['Grey Mould (Botrytis)','Grey mould; rotting stems.','Remove diseased plants; clear debris; ventilate.',6],
  ['Cutworm','Stems severed at soil level.','Search beside cut stems; remove caterpillars.',5],
  ['No Hearts','Hearting varieties stay open.','Check variety and maturity; space and water well.',2],
 ])add('lettuce',...a);
 // Broad and French beans: six/seven/eight are candidates, not a universal
 // cap. Respect existing explicit shared applicability exclusions.
 for(const key of ['bean_broad','bean_french']){
  edit(key,'Black Bean Aphid','Black colonies on soft growth.',key==='bean_broad'?'Pinch infested tips; squash colonies; allow predators.':'Squash damaging colonies; allow predators.');
  edit(key,'No Pods','Flowers fall without pods.','Mulch and water roots well from flowering.');
  edit(key,'Pea and Bean Weevil','Notches in young leaf edges.','Water seedlings in drought; protect with fine mesh.');
  edit(key,'Halo Blight','Leaf spots with yellow halos.','Remove diseased plants; use clean seed; rotate.');
  edit(key,'Bean Seed Fly','Tunnelled seeds and seedlings.','Remove damaged seedlings; plant module-raised beans.');
  const c=condition(key,'Foot Rot and Root Rot');append(data[key].troubles['Foot Rot and Root Rot'],c.treatment);append(data[key].troubles['Foot Rot and Root Rot'],c.prevention);
  edit(key,'Foot Rot and Root Rot','Dark, rotting roots and stem bases.','Remove affected plants; improve drainage; rotate.');
  edit(key,'Fusarium Wilt','Wilting; brown streaks inside stems.','Confirm cause; remove affected plants; use resistant varieties.');
 }
 edit('bean_broad','Chocolate Spot','Brown spots on leaves and stems.','Remove severe attacks; improve spacing and rotate.');
 // Runner beans: retain six distinct original entries and add applicable
 // aphids, seed fly and root rot. Do not import broad-bean tip-pinching advice.
 for(const [n,s,c]of [
  ['SLUGS','Chewed young plants.','Plant in warm soil; hand-pick slugs.'],
  ['NO PODS','Flowers drop; few pods set.','Mulch and water well from flowering.'],
  ['BEAN DISEASE','Dark, red-edged pod spots.','Remove sick plants; save no seed; rotate.'],
  ['HALO BLIGHT','Wet spots with yellow halos.','Remove sick plants; save no seed; rotate.'],
  ['MOSAIC DISEASE','Mottled, distorted leaves.','Avoid recent clover; remove sick plants.'],
  ['BIRDS AND ANIMALS','Seeds or seedlings disappear.','Raise in modules; protect with secure netting.'],
 ])edit('bean_runner',n,s,c);
 add('bean_runner','Black Bean Aphid','Black colonies; curled growth.','Squash colonies; encourage predators.',7);
 add('bean_runner','Bean Seed Fly','Tunnelled, failing seedlings.','Remove damaged plants; start beans in modules.',6);
 add('bean_runner','Foot Rot and Root Rot','Dark, rotting roots and stems.','Remove sick plants; improve drainage; rotate.',5);
 // Tenth runner candidate is the existing shared weevil row, condensed.
 add('bean_runner','Pea and Bean Weevil','Notched leaf edges.','Water young plants; protect seedlings with fine mesh.',4);
 // Preserve all useful advice while removing excess wording in two tight
 // crops. Changed approved sections become explicit drafts; originals are backed up.
 const extract=(key,slot,index,text)=>{
  const v=data[key];assertVegetableExtractWritable(v,slot);const e=v.ai_print_extracts.sections[slot];
  e.value[index].text=text;e.status='draft';e.updated_at=new Date().toISOString();e.updated_by='AI:gpt-6-astra';
  e.editorial_note='John requested individually fitted fuller pest tables. Condensed wording retains practical advice; full source and previous approved extract are preserved.';
  e.output_checksum=printChecksum(e.value);
 };
 extract('lettuce','harvesting',1,'Cut firm hearts before bolting in warm weather. Secondary shoots can be used; young plants give better leaves.');
 extract('lettuce','harvesting',2,'Pick near use; lettuce stores poorly. Trim damaged leaves; compost old plants before they seed or shelter slugs.');
 extract('radish','looking_after_the_crop',2,'Protect young leaves from flea beetle with fine mesh or fleece. Clear quick crops promptly for the next crop.');
 // The fourth lettuce care step repeats bolting/quality advice now present
 // in harvesting and the dedicated bolting row. Merge that repetition.
 assertVegetableExtractWritable(data.lettuce,'looking_after_the_crop');
 const care=data.lettuce.ai_print_extracts.sections.looking_after_the_crop;
 if(care.value.length!==4)throw Error('Unexpected lettuce care baseline');
 care.value.pop();care.status='draft';care.updated_at=new Date().toISOString();care.updated_by='AI:gpt-6-astra';
 care.editorial_note='Repeated bolting/declining-leaf-quality step merged into the harvesting advice and dedicated pest-table row; original approved extract and full source preserved.';
 care.output_checksum=printChecksum(care.value);
 extract('bean_runner','looking_after_the_crop',1,'Water deeply in dry weather from flowering; steady root moisture improves pod set more than misting flowers.');
 extract('bean_runner','looking_after_the_crop',3,'After frost, remove supports and compost stems. Leave roots and stem bases where practical; mulch for the next crop.');
 extract('bean_runner','harvesting',0,{metric:'Pick flat, tender pods about 15–20 cm long, before beans swell. Hold the vine while snapping off pods.',imperial:'Pick flat, tender pods about 6–8 in. long, before beans swell. Hold the vine while snapping off pods.'});
 return data;
}
export function plan(v,count){
 const p=v.ai_print_layout;p.value.pest_limit=count;p.status='draft';
 p.dependencies=layoutDependencies(v);p.output_checksum=printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))});
 p.updated_at=new Date().toISOString();p.updated_by='AI:gpt-6-astra';delete p.measurements;
}
