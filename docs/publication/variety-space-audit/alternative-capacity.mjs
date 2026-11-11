// Measurement probes, not changed book proofs. No source page is saved.
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const dir='docs/publication/variety-space-audit';
const {results}=JSON.parse(await fs.readFile(dir+'/MEASUREMENTS.json','utf8'));
const {trials}=JSON.parse(await fs.readFile(dir+'/CAPACITY-TRIALS.json','utf8'));
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1100,height:1200}});const out=[];
try{
 for(const crop of ['carrot','endive','florence_fennel','beet_leaf']){
  const source=results.find(r=>r.crop===crop);const units={};
  const additions=trials.find(t=>t.crop===crop)?.additions;
  for(const unit of ['imperial','metric']){
   await page.goto('http://127.0.0.1:5173/'+source.units[unit].html);await page.emulateMedia({media:'print'});
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
   units[unit]=await page.evaluate(({crop,additions})=>{
    const f=document.querySelector('.front'),g=f.querySelector('.varieties>div');
    const template=g.querySelector('article');
    if(crop==='beet_leaf'){
     // Deliberately repeat two existing entries as geometry loads. No new horticultural copy or identity asserted.
     g.append(template.cloneNode(true),template.nextElementSibling.cloneNode(true));
    }else{
     const e=template.cloneNode(true),a=additions[0];e.querySelector('h3').textContent=a.name;e.querySelector('p').textContent=a.text;
     if(e.querySelector('small'))e.querySelector('small').textContent=a.type;
     g.append(e);
    }
    g.style.setProperty('grid-template-columns',`repeat(${crop==='beet_leaf'?3:4},1fr)`,'important');
    [...g.children].forEach(e=>e.style.setProperty('grid-column','span 1','important'));
    return {gapMm:(f.querySelector('footer').getBoundingClientRect().top-f.querySelector('.key-risks').getBoundingClientRect().bottom)*25.4/96,count:g.children.length};
   },{crop,additions});
   if(process.argv.includes('--screenshots')&&unit==='imperial')await page.locator('.front').screenshot({path:`${dir}/${crop}-capacity-probe.png`});
  }
  out.push({crop,kind:crop==='beet_leaf'?'Geometry test with duplicated existing entries: no proposed cultivar choices.':'Four-column alternative: unapproved composition, not a finished PDF.',additions:crop==='beet_leaf'?null:additions,units});
 }
}finally{await browser.close();}
await fs.writeFile(dir+'/ALTERNATIVE-TRIALS.json',JSON.stringify({status:'Ephemeral capacity probes only; approved originals unchanged. Browser screenshots are diagnostic, not replacement proofs.',trials:out},null,2)+'\n');
console.table(out.map(r=>({crop:r.crop,count:r.units.imperial.count,gapI:r.units.imperial.gapMm.toFixed(2),gapM:r.units.metric.gapMm.toFixed(2)})));
