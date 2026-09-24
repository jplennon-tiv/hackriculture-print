// Read-only inventory of the actual Key Risks rendered on every vegetable sheet.
// Start start.command, then run with Node 24. No PDF exports or data writes.
import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';
import {readCollection,revision} from '../../../hackriculture-data/lib/records.mjs';
const before=revision(), crops=Object.entries(readCollection('vegetables'));
const browser=await chromium.launch();const results=[];let cursor=0;
try{await Promise.all(Array.from({length:3},async()=>{
 const page=await browser.newPage({viewport:{width:688,height:979}});
 while(cursor<crops.length){const [key,veg]=crops[cursor++];
 const slug=veg.name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
 await page.goto(`http://127.0.0.1:5173/print/vegetable/${slug}?units=metric`,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError,null,{timeout:45000});
 const result=await page.evaluate(()=>({ready:document.body.dataset.printReady,error:document.body.dataset.printError||'',warnings:JSON.parse(document.body.dataset.printWarnings||'[]'),fonts:document.fonts.status,pests:[...document.querySelectorAll('[class*="cheatPestLbl"]')].map(e=>e.textContent.trim()),risks:[...document.querySelectorAll('[class*="cheatKeyRiskItem"]')].map(e=>({label:e.querySelector('[class*="cheatKeyRiskName"]').textContent.trim(),text:e.querySelector('[class*="cheatKeyRiskText"]').textContent.trim(),icon:e.querySelector('img')?.getAttribute('src')??null,loaded:!!e.querySelector('img')?.naturalWidth}))}));
 assert.equal(result.ready,'true',key);assert.equal(result.error,'',key);assert.ok(result.risks.length,key);results.push({key,name:veg.name,slug,...result});console.log(key,result.risks.length);
 }
 await page.close();
}));assert.equal(revision(),before);results.sort((a,b)=>a.name.localeCompare(b.name));
fs.writeFileSync(process.argv[2] || 'docs/icon-pilot/KEY-RISK-ASSIGNMENTS-INVENTORY.json',JSON.stringify({date:'2026-09-24',scope:'Every currently displayed Key Risks card in ordinary production HTML, metric. Selection and icon mapping are unit-independent. No PDF generation.',shared_revision:before,crops:results},null,2)+'\n');
}finally{await browser.close();}
