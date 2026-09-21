import {refreshGenerated} from '../../hackriculture-data/lib/records.mjs';
refreshGenerated();
// Deterministic review export: no rewriting and no AI calls.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const slug=process.argv[2]??'carrot_and_parsnip_troubles';
const data=JSON.parse(await fs.readFile(path.resolve(root,'../hackriculture-data/generated/master/troubles.json'),'utf8'));
if(!Object.hasOwn(data,slug)||!/^[a-z0-9_]+$/.test(slug))throw Error('Unknown group');
const out=path.join(root,'output/pdf/ai-once-pilot');await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:794,height:1123}});
 await page.goto('http://127.0.0.1:5173/print/trouble/'+slug+'?aiReview=1',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.body.dataset.printReady||document.body.dataset.printError);
 const report=await page.evaluate((artworkReview)=>{
  if(document.body.dataset.printError)throw Error(document.body.dataset.printError);
  const source=document.querySelector('[data-source-card]').parentElement,output=source.nextElementSibling;
  const columns=[...output.querySelectorAll('[data-column]')];
  for(const footer of output.querySelectorAll('footer span:first-child'))footer.textContent=artworkReview?'REVIEW DRAFT - ILLUSTRATION MAPPING NEEDS CORRECTION':'VEGETABLE CHEAT SHEETS - REVIEW DRAFT';
  return {pages:columns.length/2,cards:output.querySelectorAll('[data-key]').length,
   overflowingColumns:columns.filter(c=>c.scrollHeight>c.clientHeight+1).length,
   warnings:[...JSON.parse(document.body.dataset.printWarnings||'[]'),...(artworkReview?['Existing illustration-to-condition mappings are incorrect; artwork is not approved for publication.']:[])]};
 },process.argv.includes('--artwork-review'));
 await page.pdf({path:path.join(out,slug+'-review-A4.pdf'),preferCSSPageSize:true,printBackground:true});
 await fs.writeFile(path.join(out,slug+'-report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
}finally{await browser.close();}
