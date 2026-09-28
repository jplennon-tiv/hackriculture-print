// Bounded POC check: one crop / one unit by default; no catalogue or raster pass.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const args=process.argv.slice(2);
if(args.includes('--help')){console.log('npm run check:smoke -- [crop-key-or-slug] [--units=metric|imperial|both] [--no-pdf]\nRequires start.command on loopback. Defaults: carrot, metric, one A4 PDF. Output overwrites output/smoke/.');process.exit(0);}
const crop=args.find(x=>!x.startsWith('--'))??'carrot';
assert(/^[a-z][a-z0-9_-]*$/.test(crop),'Invalid crop');
assert(args.every(x=>x===crop||/^--units=(metric|imperial|both)$/.test(x)||x==='--no-pdf'),'Unknown option; use --help');
const chosen=args.find(x=>x.startsWith('--units='))?.split('=')[1]??'metric';
const units=chosen==='both'?['metric','imperial']:[chosen],pdf=!args.includes('--no-pdf');
const base='http://127.0.0.1:5173',out=path.resolve(import.meta.dirname,'../output/smoke');
const start=performance.now(),browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:688,height:979}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/admin/login',{waitUntil:'domcontentloaded'});
 await page.locator('input[type="password"]').waitFor();
 const results=[];
 for(const unit of units){
  const response=await page.goto(`${base}/print/vegetable/${crop}?units=${unit}`,{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200);
  await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError,null,{timeout:20000});
  const state=await page.evaluate(()=>({error:document.body.dataset.printError??'',ready:document.body.dataset.printReady,fonts:document.fonts.status,missing:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src')),warnings:JSON.parse(document.body.dataset.printWarnings??'[]'),pages:[...document.querySelectorAll('[class*="cheatPage_"]')].map(e=>({height_px:e.getBoundingClientRect().height,content_end_px:e.lastElementChild.getBoundingClientRect().bottom-e.getBoundingClientRect().top}))}));
  assert.equal(state.error,'');assert.equal(state.ready,'true');assert.equal(state.fonts,'loaded');assert.deepEqual(state.missing,[]);assert.equal(state.pages.length,2);
  let count=null;
  if(pdf){const bytes=await page.pdf({format:'A4',printBackground:true,scale:1,margin:{top:'18mm',bottom:'20mm',left:'14mm',right:'14mm'}});count=(bytes.toString('latin1').match(/\/Type\s*\/Page\b/g)??[]).length;assert.equal(count,2,`${crop}/${unit}: physical PDF spillover`);await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,`${crop}-${unit}.pdf`),bytes);}
  results.push({crop,units:unit,physical_pages:count,...state});
  console.log(`${crop}/${unit}: ready; images/fonts loaded; ${pdf?count+' PDF pages':'DOM size checked (PDF pagination not checked)'}`);
  for(const warning of state.warnings)console.log('Warning: '+warning);
 }
 assert.deepEqual(errors,[]);await fs.mkdir(out,{recursive:true});
 const seconds=+( (performance.now()-start)/1000).toFixed(2);
 await fs.writeFile(path.join(out,'latest.json'),JSON.stringify({seconds,pdf,results},null,2)+'\n');
 console.log(`Login and print smoke checks passed in ${seconds}s. Results: ${out}`);
}finally{await browser.close();}
