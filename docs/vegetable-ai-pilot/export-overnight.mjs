import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
import {readCollection,revision} from '../../../hackriculture-data/lib/records.mjs';
import {printChecksum,resolveVegetablePrintLayout,resolveVegetableExtracts} from '../../src/lib/vegetablePrint.ts';
const label=process.argv[2];assert.match(label,/^overnight-\d\d$/);
const restore=JSON.parse(fs.readFileSync(`docs/vegetable-ai-pilot/${label}-restore.json`));
const keys=process.argv[3]?.split(',')??Object.keys(restore.selected);
assert.ok(keys.every(k=>Object.hasOwn(restore.selected,k)));
const initialRevision=revision(),data=readCollection('vegetables'),dir=`tmp/pdfs/${label}`;
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch(),results=[];
try{
 const page=await browser.newPage({viewport:{width:688,height:979}});
 for(const key of keys)for(const units of ['metric','imperial']){
  assert.equal(resolveVegetablePrintLayout(data[key],true).warning,null);
  assert.deepEqual(resolveVegetableExtracts(data[key],true).warnings,[]);
  await page.goto(`http://localhost:5173/print/vegetable/${key}?units=${units}&aiReview=1`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
  await page.evaluate(()=>document.fonts.ready);
  const state=await page.evaluate(()=>({error:document.body.dataset.printError||null,warnings:JSON.parse(document.body.dataset.printWarnings||'[]'),fonts:document.fonts.status,
   missing:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),
   editorial:JSON.parse(document.querySelector('[data-editorial-report]')?.getAttribute('data-editorial-report')||'{}'),
   varieties:[...document.querySelectorAll('[class*="cheatVarName"]')].map(e=>e.textContent),
   risks:[...document.querySelectorAll('[class*="cheatKeyRiskName"]')].map(e=>e.textContent),
   tipIcons:[...document.querySelectorAll('[class*="cheatFinalTipIcon"]')].map(e=>e.getAttribute('src')),
   pests:[...document.querySelectorAll('[class*="cheatPestLbl"]')].map(e=>e.textContent),
   text:document.body.innerText,
   alignment:[...document.querySelectorAll('[data-align-bottoms]')].map(body=>{const cols=[...body.children].filter(e=>/cheatLeft|cheatRight/.test(e.className));return{column_bottom_gap_px:Math.round(Math.abs(cols[0].lastElementChild.getBoundingClientRect().bottom-cols[1].lastElementChild.getBoundingClientRect().bottom)*100)/100};}),
  }));
  assert.equal(state.error,null);assert.deepEqual(state.missing,[]);assert.equal(state.fonts,'loaded');
  assert.deepEqual(state.tipIcons,data[key].ai_print_extracts.sections.final_tips.value.map(t=>`/images/quick_facts/trial/${t.icon}.png`));
  const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
  assert.deepEqual(state.pests.map(norm).sort(),restore.selected[key].map(norm).sort());
  assert.ok(!/permethrin|heptenophos|thiophanate|mancozeb|lindane|cheshunt|malathion|pirimicarb|slug pellets|fungicide/i.test(state.text),`${key}: non-organic copy in rendered output`);
  const pdf=await page.pdf({format:'A4',printBackground:true,scale:1,margin:{top:'18mm',bottom:'20mm',left:'14mm',right:'14mm'}});
  fs.writeFileSync(`${dir}/${key}-${units}.pdf`,pdf);fs.writeFileSync(`${dir}/${key}-${units}.txt`,state.text);delete state.text;
  const result={key,units,pages:(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length,layout_checksum:data[key].ai_print_layout.output_checksum,source_checksum:printChecksum(data[key].ai_print_layout.dependencies),pdf_sha256:crypto.createHash('sha256').update(pdf).digest('hex'),...state};
  results.push(result);console.log(JSON.stringify({key,units,pages:result.pages,warnings:state.warnings,pests:state.pests.length,varieties:state.varieties,alignment:state.alignment}));
 }
 assert.equal(revision(),initialRevision,'Source changed during export; remeasure.');
 const p=`docs/vegetable-ai-pilot/${label}-checks.json`,prior=fs.existsSync(p)?JSON.parse(fs.readFileSync(p)):[];
 fs.writeFileSync(p,JSON.stringify([...prior.filter(r=>!keys.includes(r.key)),...results],null,2)+'\n');
}finally{await browser.close();}
