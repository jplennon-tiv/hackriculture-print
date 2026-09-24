// Targeted production proofs, including a core-data change and newly exposed cards.
import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {chromium} from 'playwright';
import {revision} from '../../../hackriculture-data/lib/records.mjs';
const out='output/pdf/key-risk-corrections';fs.mkdirSync(out,{recursive:true});const before=revision(),results=[];
const browser=await chromium.launch();
try {for(const crop of ['parsnip','beetroot','cauliflower','rhubarb','potato'])for(const units of ['metric','imperial']){
 const page=await browser.newPage({viewport:{width:688,height:979}});
 await page.goto(`http://127.0.0.1:5173/print/vegetable/${crop}?units=${units}`,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError,null,{timeout:45000});
 const state=await page.evaluate(()=>({ready:document.body.dataset.printReady,error:document.body.dataset.printError||'',warnings:JSON.parse(document.body.dataset.printWarnings||'[]'),fonts:document.fonts.status,missing:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),pests:[...document.querySelectorAll('[class*="cheatPestLbl"]')].map(e=>e.textContent.trim()),risks:[...document.querySelectorAll('[class*="cheatKeyRiskItem"]')].map(e=>({label:e.querySelector('[class*="cheatKeyRiskName"]').textContent.trim(),icon:e.querySelector('img')?.getAttribute('src')}))}));
 assert.equal(state.ready,'true');assert.equal(state.error,'');assert.deepEqual(state.missing,[]);assert.equal(state.fonts,'loaded');assert.ok(state.risks.every(r=>r.icon));
 if(crop==='parsnip')assert.deepEqual(state.pests.map(x=>x.toLowerCase()),['canker','poor germination','carrot root fly','forking','leaf miner','sclerotinia rot','violet root rot']);
 const pdf=await page.pdf({format:'A4',printBackground:true,scale:1,margin:{top:'18mm',bottom:'20mm',left:'14mm',right:'14mm'}});
 const file=`${out}/${crop}-${units}.pdf`;fs.writeFileSync(file,pdf);const pages=(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;assert.equal(pages,2);
 results.push({crop,units,...state,file,pages,pdf_sha256:createHash('sha256').update(pdf).digest('hex')});console.log(crop,units,state.warnings);
 await page.close();
 } assert.equal(revision(),before);fs.writeFileSync('docs/icon-pilot/KEY-RISK-CORRECTION-PROOFS.json',JSON.stringify({date:new Date().toISOString(),revision:before,results},null,2)+'\n');
}finally{await browser.close();}
