// Capture source-linked book-only additions. Canonical records are read-only.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {readRecord} from '../../../../hackriculture-data/lib/records.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
if(await fs.access('docs/publication/variety-additions/APPROVAL.json').then(()=>true,()=>false))throw Error('Preserve approved set; create a new derivative.');
const audit=JSON.parse(await fs.readFile('docs/publication/variety-space-audit/MEASUREMENTS.json','utf8'));
const v=(name,text,path,type='')=>({name,text,sourcePath:path,type});
const additions={
 aubergine:[v('Black Beauty','A relatively easy, prolific dark-fruited variety and a good general choice for greenhouse growing.',['BLACK BEAUTY']),v('Rosa Bianca','Rounded fruits with pale white and violet colouring. Give plants warmth and pick while the skins remain glossy.',['ROSA BIANCA'])],
 beet_leaf:[v('Lucullus','Pale stems and crinkled green leaves. Pick the outer leaves regularly for a continuing crop.',['SWISS CHARD']),v('White Silver 2','Broad green leaves and white, fleshy stalks. Useful for both leafy greens and cooked stems.',['SWISS CHARD'])],
 beetroot:[v('Red Ace F1','F1 hybrid with round roots and dark red flesh.',['GLOBE varieties','Red','RED ACE'],'Globe · Red')],
 capsicum:[v('Gypsy F1','An early sweet pepper with pale green fruits that ripen red. Give it warmth, regular watering and support when laden.',['GYPSY'])],
 carrot:[v('Amsterdam Forcing','Early cylindrical roots with little core. Useful under cloches and for freezing.',['SHORT-ROOTED varieties','AMSTERDAM FORCING'],'Short-Rooted')],
 cucumber_greenhouse:[v('Pepinex F1','Long greenhouse fruits. Keep plants warm and evenly watered; remove any male flowers according to the packet.',['Pepinex'],'All female')],
 endive:[v('Bubikopf','A reliable broad-leaved variety with plentiful, smaller leaves and good self-blanching qualities.',['BROAD-LEAVED varieties','BUBIKOPF'],'Broad-leaved')],
 florence_fennel:[v('Finale','Large, flattened bulbs with useful resistance to bolting.',['Finale'])],
 garlic:[v('Spanish Roja','A strongly flavoured hardneck with thin skins. Remove tender flower stems as buds form; check specialist suppliers for planting stock.',['Spanish Roja'],'Hardneck')],
 lettuce:[v('Webb’s Wonderful','Large, frilly, crunchy hearts for summer cropping. More crinkled than true iceberg types.',['Crisphead varieties',"Webb's Wonderful"],'Crisphead')],
 oriental_leaves:[v('Shungiku','Pungent chop suey greens. Pick young shoots regularly before flowering.',['Shungiku'])],
 turnip:[v('Snowball','Quick-growing, round, white-fleshed turnip for harvesting young.',['SNOWBALL'],'Early')]
};
const find=(obj,name,path=[])=>{for(const [k,val] of Object.entries(obj)){if(k.toLowerCase()===name.toLowerCase())return{path:[...path,k],value:val};if(val&&typeof val==='object'&&!Array.isArray(val)){const r=find(val,name,[...path,k]);if(r)return r;}}};
const crops=[];
for(const [key,entries] of Object.entries(additions)){
 const a=audit.results.find(x=>x.crop===key),record=readRecord('vegetables',key);
 for(const e of entries){const source=find(record.varieties,e.sourcePath.at(-1));if(!source)throw Error('Missing variety '+key+' '+e.name);e.sourcePath=['varieties',...source.path];e.sourceValue=source.value;}
 const sourceUnits=Object.fromEntries(Object.entries(a.units).map(([u,x])=>[u,{html:x.html,pdf:x.pdf,image:x.image,hashes:x.hashes,oldVarieties:x.varieties.map(v=>({name:v.name,type:v.type,text:v.text}))}]));
 crops.push({key,name:a.name,folios:a.folios,approval:a.approval,approvalSha256:sha(await fs.readFile(a.approval)),masterSha256:sha(await fs.readFile(`../hackriculture-data/vegetables/${key}/${key}.json`)),sourceUnits,layout:['carrot','endive','florence_fennel'].includes(key)?'four-across':entries.length+a.units.imperial.varieties.length===5?'balanced-five':'two-by-three',additions:entries});
}
await fs.writeFile('src/print/book/variety-additions.json',JSON.stringify({date:'2026-11-10',status:'For John’s review',scope:'Append 14 source-linked selections to the remaining 12 shortlisted guides. Preserve all existing text, typography, illustrations, facts and practical pages. No canonical changes or main-book assembly.',research:'../hackriculture-resources/summaries/vegetable-variety-additions/SOURCES.md',crops},null,2)+'\n');
console.log(crops.map(c=>c.key+': '+c.additions.map(v=>v.name).join(', ')).join('\n'));
