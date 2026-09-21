// Run from the print project root against its loopback Vite server.
// Read-only browser checks and disposable PDF exports; no record mutations.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base='http://127.0.0.1:5173';
const dir='tmp/pdfs/background-cleanup';
await fs.mkdir(dir,{recursive:true});
const cases=[['brassica_troubles',8],['bean_and_pea_troubles',6],['carrot_and_parsnip_troubles',4],['potato_troubles',7]];
const browser=await chromium.launch();
const results=[];
try {
 const page=await browser.newPage({viewport:{width:688,height:979}});
 for(const [key,expectedPages] of cases){
  await page.goto(`${base}/print/trouble/${key}?units=metric&paper=A4`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
  const check=await page.evaluate(()=>{
   const source=document.querySelector('[data-source-card]').parentElement;
   const output=source.nextElementSibling;
   const images=[...output.querySelectorAll('img')];
   return {error:document.body.dataset.printError||null,warnings:JSON.parse(document.body.dataset.printWarnings||'[]'),pages:output.querySelectorAll('[data-column]').length/2,missing:images.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),cleaned:images.filter(i=>i.src.includes('/troubles/cleaned/')).length};
  });
  assert.equal(check.error,null);assert.deepEqual(check.warnings,[]);assert.deepEqual(check.missing,[]);assert.equal(check.pages,expectedPages);assert.ok(check.cleaned>0);
  const response=await fetch(`${base}/api/pdf/trouble/${key}?units=metric&paper=A4`);
  assert.equal(response.status,200);
  await fs.writeFile(`${dir}/${key}.pdf`,Buffer.from(await response.arrayBuffer()));
  results.push({key,...check});console.log(JSON.stringify(results.at(-1)));
 }
 await fs.writeFile('docs/troubles-design/background-cleanup/reports/pdf-checks.json',JSON.stringify(results,null,2)+'\n');
}finally{await browser.close();}
