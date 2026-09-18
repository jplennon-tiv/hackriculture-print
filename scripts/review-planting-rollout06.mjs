// Light checks requested by John. Output every layout; preserve production guards.
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const out=new URL('../output/pdf/planting-rollout06/',import.meta.url);
await fs.mkdir(out,{recursive:true});
const crops=['artichoke_jerusalem','artichoke_globe','asparagus','aubergine','capsicum','celeriac','celery','florence_fennel','mushroom','rhubarb','tomato_greenhouse','tomato_outdoor'];
const browser=await chromium.launch();const results=[];
try {
 const page=await browser.newPage({viewport:{width:688,height:979}});
 for(const crop of crops){
  const url=`http://127.0.0.1:5173/print/vegetable/${crop}?units=metric&plantingReview=1`;
  const read=()=>page.evaluate(()=>({error:document.body.dataset.printError??'',layout:document.body.dataset.plantingLayout,review:document.body.dataset.plantingReview==='true',fonts:document.fonts.status,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)}));
  await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>document.body.dataset.printReady==='true'||!!document.body.dataset.printError);
  const normal=await read();
  const review=true;
  const state=await read();assert.equal(state.error,'',`${crop}: source/readiness issue`);assert.deepEqual(state.broken,[]);assert.equal(state.fonts,'loaded');assert.match(state.layout,/:images$/);
  const file=crop+'-metric-A4'+(review?'-review':'-illustrated')+'.pdf';
  await page.pdf({path:new URL(file,out).pathname,format:'A4',printBackground:true,margin:{top:'18mm',bottom:'20mm',left:'14mm',right:'14mm'},displayHeaderFooter:review,headerTemplate:review?'<div style="font-size:8px;color:#9b4b00;width:100%;text-align:center">LAYOUT REVIEW - illustration placement draft; pagination may need adjustment</div>':'',footerTemplate:'<div></div>'});
  results.push({crop,file,review,normal,...state});await fs.writeFile(new URL('results.json',out),JSON.stringify(results,null,2));console.log(crop,review?'review draft':'normal export layout',state.layout);
 }
}finally{await browser.close();}
