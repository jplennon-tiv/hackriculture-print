// QA against the saved v6 installation baseline. Run with the local server:
// node docs/icon-pilot/check-risk-border-fix.mjs after
// Writes disposable individual PDFs; never writes canonical records.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(process.cwd()+'/package.json');
const {chromium}=require('playwright');
const mode=process.argv[2];
const out='output/pdf/naturalistic-icons-border-fix';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();const results=[];
try{for(const crop of ['broccoli','carrot','cucumber_greenhouse','rhubarb'])for(const units of ['metric','imperial']){
 const page=await browser.newPage({viewport:{width:688,height:979}});
 await page.goto(`http://127.0.0.1:5173/print/vegetable/${crop}?units=${units}`,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError,null,{timeout:30000});
 const state=await page.evaluate(()=>({text:document.body.innerText,ready:document.body.dataset.printReady,error:document.body.dataset.printError||'',warnings:JSON.parse(document.body.dataset.printWarnings||'[]'),fonts:document.fonts.status,missing:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),risks:[...document.querySelectorAll('[class*="cheatKeyRiskItem"]')].map(e=>({label:e.innerText,src:e.querySelector('img')?.getAttribute('src'),mask:e.querySelector('[class*="cheatKeyRiskIcon_"]')?getComputedStyle(e.querySelector('[class*="cheatKeyRiskIcon_"]')).maskImage:null})),unaffected:[...document.images].filter(i=>!i.closest('[class*="cheatKeyRiskItem"]')).map(i=>i.getAttribute('src'))}));
 assert.equal(state.ready,'true');assert.equal(state.error,'');assert.deepEqual(state.missing,[]);assert.equal(state.fonts,'loaded');
 if(mode==='after'){
 const prior=JSON.parse(fs.readFileSync('output/pdf/naturalistic-icons-installed/checks.json')).find(x=>x.crop===crop&&x.units===units);
 assert.equal(state.text,prior.text);assert.deepEqual(state.unaffected,prior.unaffected);assert.deepEqual(state.warnings,prior.warnings);
 const pdf=await page.pdf({format:'A4',printBackground:true,scale:1,margin:{top:'18mm',bottom:'20mm',left:'14mm',right:'14mm'}});
 state.pdf=`${out}/${crop}-${units}.pdf`;fs.writeFileSync(state.pdf,pdf);state.pages=(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;assert.equal(state.pages,2);
 }
 results.push({crop,units,...state});console.log(crop,units,JSON.stringify(state.warnings));await page.close();
}fs.writeFileSync(`${out}/${mode==='after'?'checks':'baseline'}.json`,JSON.stringify(results,null,2)+'\n');}finally{await browser.close();}
