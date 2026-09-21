import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readCollection,revision} from '../../../hackriculture-data/lib/records.mjs';
import {printChecksum} from '../../src/lib/vegetablePrint.ts';
const earlier=process.argv.includes('--earlier');
const widgets=process.argv.includes('--widgets');
const batch04=process.argv.includes('--batch-04');
const keys=batch04?['cauliflower','kale','kohl_rabi']:widgets?['asparagus','celery','radish','beetroot','carrot','lettuce','bean_broad','bean_french','bean_runner','broccoli','brussels_sprouts','cabbage']:earlier?['radish','beetroot','carrot','lettuce','bean_broad','bean_french','bean_runner']:['broccoli','brussels_sprouts','cabbage'];
const dir=batch04?'tmp/pdfs/vegetable-batch-04':widgets?'tmp/pdfs/vegetable-widgets':earlier?'tmp/pdfs/vegetable-earlier-pests':'tmp/pdfs/vegetable-batch-03';
const only=process.argv.includes('--sprouts-only');
const polish=process.argv.includes('--polish-only');
const requested=process.argv.find(x=>x.startsWith('--keys='))?.slice(7).split(',');
if(requested)assert.ok(requested.every(k=>keys.includes(k)));
const initialRevision=revision(),data=readCollection('vegetables');
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch(),results=[];
try{
 const page=await browser.newPage({viewport:{width:688,height:979}});
 const selected=requested??(only?['brussels_sprouts']:polish?['broccoli','brussels_sprouts']:keys);
 for(const key of selected)for(const units of ['metric','imperial']){
  await page.goto(`http://localhost:5173/print/vegetable/${key}?units=${units}&aiReview=1`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
  await page.evaluate(()=>document.fonts.ready);
  const state=await page.evaluate(()=>({
   error:document.body.dataset.printError||null,warnings:JSON.parse(document.body.dataset.printWarnings||'[]'),
   planting:document.body.dataset.plantingLayout,fonts:document.fonts.status,
   missing:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),
   editorial:JSON.parse(document.querySelector('[data-editorial-report]')?.getAttribute('data-editorial-report')||'{}'),
   quickFacts:[...document.querySelectorAll('[class*="cheatQfRow"]')].map(e=>e.innerText),
   cards:[...document.querySelectorAll('[class*="cheatCardHd"]')].map(e=>({title:e.textContent,height:Math.round(e.parentElement.getBoundingClientRect().height)})),
   varieties:[...document.querySelectorAll('[class*="cheatVarName"]')].map(e=>e.textContent),
   risks:[...document.querySelectorAll('[class*="cheatKeyRiskName"]')].map(e=>e.textContent),
   tipIcons:[...document.querySelectorAll('[class*="cheatFinalTipIcon"]')].map(e=>e.getAttribute('src')),
   pests:[...document.querySelectorAll('[class*="cheatPestLbl"]')].map(e=>e.textContent),
   pestRows:[...document.querySelectorAll('[class*="cheatPestLbl"]')].map(e=>e.parentElement.innerText),
   alignment:[...document.querySelectorAll('[data-align-bottoms]')].map(body=>{
    const cols=[...body.children].filter(e=>/cheatLeft|cheatRight/.test(e.className));
    const bottoms=cols.map(c=>c.lastElementChild.getBoundingClientRect().bottom);
    return {column_bottom_gap_px:Math.round(Math.abs(bottoms[0]-bottoms[1])*100)/100};
   }),
  }));
  assert.equal(state.error,null);assert.deepEqual(state.missing,[]);assert.equal(state.fonts,'loaded');
  assert.deepEqual(state.tipIcons,data[key].ai_print_extracts.sections.final_tips.value.map(t=>`/images/quick_facts/trial/${t.icon}.png`));
  const pdf=await page.pdf({format:'A4',printBackground:true,scale:1,margin:{top:'18mm',bottom:'20mm',left:'14mm',right:'14mm'}});
  await fs.writeFile(`${dir}/${key}-${units}.pdf`,pdf);
  const result={key,units,pages:(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length,layout_checksum:data[key].ai_print_layout.output_checksum,source_checksum:printChecksum(data[key].ai_print_layout.dependencies),...state};
  results.push(result);console.log(JSON.stringify(result));
 }
 assert.equal(revision(),initialRevision,'Source changed during export; remeasure.');
 const checksPath=batch04?'docs/vegetable-ai-pilot/batch-04-checks.json':widgets?'docs/vegetable-ai-pilot/widget-checks.json':earlier?'docs/vegetable-ai-pilot/earlier-pests-checks.json':'docs/vegetable-ai-pilot/batch-03-checks.json';
 const combined=only||polish||requested?[...JSON.parse(await fs.readFile(checksPath,'utf8')).filter(r=>!selected.includes(r.key)),...results]:results;
 await fs.writeFile(checksPath,JSON.stringify(combined,null,2)+'\n');
}finally{await browser.close();}
