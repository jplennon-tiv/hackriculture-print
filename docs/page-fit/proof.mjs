import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';import {createHash} from 'node:crypto';
import {revision} from '../../../hackriculture-data/lib/records.mjs';const crops=['bean_broad','bean_french','marrow_courgette','garlic','radish'];
const mode='final',out='output/pdf/page-fit/'+mode;fs.mkdirSync(out,{recursive:true});const b=await chromium.launch(),results=[];
for(const key of crops)for(const units of ['metric','imperial']){
 const p=await b.newPage({viewport:{width:688,height:979}});
 await p.goto(`http://127.0.0.1:5173/print/vegetable/${key}?units=${units}`,{waitUntil:'networkidle'});await p.waitForFunction(()=>document.body.dataset.printReady==='true');
 const state=await p.evaluate(()=>({warnings:JSON.parse(document.body.dataset.printWarnings),fonts:document.fonts.status,missing:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),pests:[...document.querySelectorAll('[class*="cheatPestLbl"]')].map(e=>e.textContent),risks:[...document.querySelectorAll('[class*="cheatKeyRiskName"]')].map(e=>e.textContent),content:[...document.querySelectorAll('[class*="cheatPage_"]')].map(e=>({height:e.getBoundingClientRect().height,end:e.lastElementChild.getBoundingClientRect().bottom-e.getBoundingClientRect().top})),text:document.body.innerText}));
 assert.equal(state.fonts,'loaded');assert.deepEqual(state.missing,[]);
 const pdf=await p.pdf({format:'A4',printBackground:true,scale:1,margin:{top:'18mm',bottom:'20mm',left:'14mm',right:'14mm'}}),file=`${out}/${key}-${units}.pdf`;fs.writeFileSync(file,pdf);const pages=(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
 results.push({key,units,file,pages,...state,sha256:createHash('sha256').update(pdf).digest('hex')});console.log(key,units,pages,state.warnings,state.pests);await p.close();
}
await b.close();fs.writeFileSync('docs/page-fit/'+mode.toUpperCase()+'.json',JSON.stringify({revision:revision(),results},null,2)+'\n');
