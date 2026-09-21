import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const batch=process.argv.includes('--batch-01');
const batch02=process.argv.includes('--batch-02');
const label=batch02?'batch-02':batch?'batch-01':null;
const keys=batch02?['bean_broad','bean_french','bean_runner']:batch?['beetroot','carrot','lettuce']:['asparagus','radish','celery'];
const dir=label?`tmp/pdfs/vegetable-${label}`:'tmp/pdfs/vegetable-ai-pilot';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch();const results=[];
try{
 const page=await browser.newPage({viewport:{width:688,height:979}});
 for(const key of keys)for(const units of ['metric','imperial']){
  await page.goto(`http://localhost:5173/print/vegetable/${key}?units=${units}&aiReview=1`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
  const state=await page.evaluate(()=>({error:document.body.dataset.printError||null,warnings:JSON.parse(document.body.dataset.printWarnings||'[]'),planting:document.body.dataset.plantingLayout,missing:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),cards:[...document.querySelectorAll('[class*="cheatCardHd"]')].map(e=>({title:e.textContent,height:Math.round(e.parentElement.getBoundingClientRect().height)}))}));
  if(state.error||state.missing.length)throw Error(JSON.stringify(state));
  Object.assign(state,await page.evaluate(()=>({varieties:[...document.querySelectorAll('[class*="cheatVarName"]')].map(e=>e.textContent),risks:[...document.querySelectorAll('[class*="cheatKeyRiskName"]')].map(e=>e.textContent),tipIcons:[...document.querySelectorAll('[class*="cheatFinalTipIcon"]')].map(e=>e.getAttribute('src'))})));
  state.alignment=await page.evaluate(()=>[...document.querySelectorAll('[data-align-bottoms]')].map(body=>{
   const columns=[...body.children].filter(e=>/cheatLeft|cheatRight/.test(e.className));
   const bottoms=columns.map(c=>c.lastElementChild.getBoundingClientRect().bottom);
   return {column_bottom_gap_px:Math.round(Math.abs(bottoms[0]-bottoms[1])*100)/100};
  }));
  const pdf=await page.pdf({format:'A4',printBackground:true,scale:1,margin:{top:'18mm',bottom:'20mm',left:'14mm',right:'14mm'}});
  if(key==='bean_runner')assert.deepEqual(state.varieties,['Streamline','Mergoles','Kelvedon Marvel','Sunset','Czar']);
  if(key==='lettuce'){assert.ok(state.risks.some(n=>/^bolting$/i.test(n)));assert.ok(!state.risks.some(n=>/^tipburn$/i.test(n)));}
  const expectedIcons={asparagus:['soil','feeding'],radish:['water','harvest','water'],celery:['protection','protection'],beetroot:['water','harvest','harvest'],carrot:['soil','harvest','storage'],lettuce:['protection','harvest','sow'],bean_broad:['sow','harvest','soil'],bean_french:['sow','support','harvest'],bean_runner:['support','water','harvest']};
  assert.deepEqual(state.tipIcons,expectedIcons[key].map(k=>`/images/quick_facts/trial/${k}.png`));
  await fs.writeFile(`${dir}/${key}-${units}.pdf`,pdf);
  const result={key,units,pages:(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length,...state};results.push(result);console.log(JSON.stringify(result));
 }
 await fs.writeFile(`docs/vegetable-ai-pilot/${label?`${label}-checks`:'checks'}.json`,JSON.stringify(results,null,2)+'\n');
}finally{await browser.close();}
