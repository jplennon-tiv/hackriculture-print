// Browser regression: exercise the real streamed UI without starting a PDF batch.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
const browser=await chromium.launch();
const warnings=Array.from({length:14},(_,i)=>({event:'progress',label:i===0?'Bean, Broad':`Guide ${i+1}`,status:'ok',warnings:['Page 2: content exceeds the layout budget by approximately 45 mm; check the exported PDF for spillover. Exported 4 PDF pages (usual target: 2).']}));
const body=[{event:'start',total:15,outputDir:'./output'},...warnings,{event:'progress',label:'Example export error',status:'error',detail:'Image could not be loaded.'},{event:'done',ok:14,errors:1,outputDir:'./output'}].map(x=>JSON.stringify(x)+'\n').join('');
try {
 for(const width of [1600,1100,768,390]) {
  const page=await browser.newPage({viewport:{width,height:800}});
  await page.route('**/api/pdf/batch?*',route=>route.fulfill({status:200,contentType:'application/x-ndjson',body}));
  await page.goto('http://127.0.0.1:5173/vegetable/artichoke_jerusalem',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'🖨 Batch print all'}).click();
  const report=page.locator('.batch-print-report');await report.waitFor();
  await page.getByText('Example export error',{exact:true}).waitFor();
  const measure=()=>page.evaluate(()=>{
   const header=document.querySelector('.app-header').getBoundingClientRect();
   const report=document.querySelector('.batch-print-report');const rect=report.getBoundingClientRect();
   const next=document.querySelector('.app-header').nextElementSibling.getBoundingClientRect();
   return {headerBottom:header.bottom,reportTop:rect.top,reportBottom:rect.bottom,nextTop:next.top,mainTop:document.querySelector('main').getBoundingClientRect().top,scrolls:report.scrollHeight>report.clientHeight,width:document.documentElement.scrollWidth,viewport:innerWidth};
  });
  const state=await measure();assert.ok(state.reportTop>=0);assert.ok(state.reportBottom<=state.headerBottom);assert.ok(state.nextTop>=state.headerBottom);assert.ok(state.mainTop>=state.reportBottom);assert.ok(state.scrolls);assert.equal(state.width,state.viewport);
  await report.evaluate(e=>e.scrollTop=e.scrollHeight);
  assert.ok(await report.locator('p').isVisible());
  await report.evaluate(e=>e.scrollTop=0);
  await report.locator('summary').click();assert.equal(await report.getAttribute('open'),null);
  const closed=await measure();assert.ok(closed.headerBottom<state.headerBottom);
  await report.locator('summary').click();
  if(width===1600){fs.mkdirSync('output/ui-checks',{recursive:true});await page.screenshot({path:'output/ui-checks/batch-report-fixed.png'});}
  console.log(width,'expanded, collapsed and scroll checks passed');await page.close();
 }
} finally {await browser.close();}
