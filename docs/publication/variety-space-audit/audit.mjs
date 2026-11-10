// Read-only review of approved openings. Never writes approved proofs or shared records.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {readCollection} from '../../../../hackriculture-data/lib/records.mjs';
const dir='docs/publication/variety-space-audit';
const sha=b=>createHash('sha256').update(b).digest('hex');
const crops=(await fs.readdir('docs/publication/sowing-rollout/checks')).filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5));
const samples=['carrot','leek','beetroot','potato','tomato_outdoor'];
const overrides={garlic:'garlic_yield',florence_fennel:'florence_fennel_yield',pea:'pea_intro'};
const records=readCollection('vegetables');
const sources=[];
for(const crop of [...crops,...samples]){
 const folder=samples.includes(crop)?`docs/publication/sowing-planting-mockups/${crop}-revision`:`docs/publication/sowing-rollout/revisions/${overrides[crop]||crop}`;
 const approval=JSON.parse(await fs.readFile(folder+'/APPROVAL.json','utf8'));
 const files=Object.keys(approval.files);
 const units={};
 for(const unit of ['imperial','metric']){
  const find=(extension)=>files.find(f=>f.endsWith(`/${crop}-${unit}.${extension}`)||f.endsWith(`/${crop}-${unit}-spread.${extension}`));
  const chosen={html:find('html'),pdf:find('pdf'),image:find('jpg')};
  const hashes={};
  for(const [kind,file] of Object.entries(chosen)){
   if(!file)throw Error(`Missing ${kind}: ${crop} ${unit}`);
   hashes[kind]=sha(await fs.readFile(file));
   if(hashes[kind]!==approval.files[file])throw Error('Approval hash mismatch: '+file);
  }
  units[unit]={...chosen,hashes};
 }
 sources.push({crop,name:records[crop].name,approval:folder+'/APPROVAL.json',review:folder+'/REVIEW.html',folios:approval.folios,units,recordSha256:sha(await fs.readFile(`../hackriculture-data/vegetables/${crop}/${crop}.json`))});
}
if(sources.length!==44)throw Error('Expected 44');
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1100,height:1200}});
const results=[];
try{
 await page.goto('http://127.0.0.1:5173/'+sources[0].units.imperial.html);
 const catalogues=await page.evaluate(async data=>{
  const {flattenVarieties}=await import('/src/print/vegetableModel.ts');
  return Object.fromEntries(Object.entries(data).map(([crop,vars])=>[crop,flattenVarieties(vars,'imperial')]));
 },Object.fromEntries(Object.entries(records).map(([k,r])=>[k,r.varieties||{}])));
 for(const source of sources){
  const units={};
  for(const unit of ['imperial','metric']){
   await page.goto('http://127.0.0.1:5173/'+source.units[unit].html,{waitUntil:'load'});
   await page.emulateMedia({media:'print'});
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
   units[unit]=await page.evaluate(()=>{
    const front=document.querySelector('.sheet.front'),mm=25.4/96;
    const box=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x*mm,y:r.y*mm,width:r.width*mm,height:r.height*mm,bottom:r.bottom*mm};};
    const footer=front.querySelector('footer'),risk=front.querySelector('.key-risks');
    const varieties=[...front.querySelectorAll('.varieties article')].map(e=>({name:e.querySelector('h3').textContent,type:e.querySelector('small')?.textContent||'',text:e.querySelector('p')?.textContent||'',box:box(e),span:getComputedStyle(e).gridColumn}));
    return {folio:Number(footer.querySelector('.folio').textContent),gapMm:(footer.getBoundingClientRect().top-risk.getBoundingClientRect().bottom)*mm,front:box(front),varieties,sections:Object.fromEntries(['.intro','.quick','.fact-grid','.year-needs','.varieties','.key-risks','footer'].map(s=>[s,box(front.querySelector(s))])),facts:[...front.querySelectorAll('.fact-column')].map(e=>({box:box(e),entries:[...e.querySelectorAll('article')].map(a=>({name:a.querySelector('h3').textContent,box:box(a)}))})),fonts:[...document.fonts].filter(f=>f.status!=='loaded').map(f=>f.family),images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)};
   });
  }
  const seen=new Set(),normal=n=>n.toLowerCase().replace(/[^a-z0-9]/g,'');
  const selected=new Set(units.imperial.varieties.map(v=>normal(v.name)));
  const catalogue=catalogues[source.crop].sort((a,b)=>b.rank-a.rank).filter(v=>{const k=normal(v.name);if(seen.has(k))return false;seen.add(k);return true;});
  results.push({...source,units:Object.fromEntries(Object.entries(source.units).map(([u,s])=>[u,{...s,...units[u]}])),catalogueCount:catalogue.length,reserves:catalogue.filter(v=>!selected.has(normal(v.name)))});
 }
}finally{await browser.close();}
results.sort((a,b)=>a.units.imperial.folio-b.units.imperial.folio);
await fs.writeFile(dir+'/MEASUREMENTS.json',JSON.stringify({date:'2026-11-10',scope:'Read-only audit of the 44 approved openings in both units. No approved guide or canonical record changed.',approvalHashesVerified:true,results},null,2)+'\n');
console.table(results.map(r=>({crop:r.crop,page:r.units.imperial.folio,count:r.units.imperial.varieties.length,gapI:r.units.imperial.gapMm.toFixed(2),gapM:r.units.metric.gapMm.toFixed(2),reserves:r.reserves.length,names:r.reserves.slice(0,5).map(v=>v.name).join('; ')})));
