// Read-only candidate renders: replaces the browser's disposable JSON module,
// never writes canonical records, projections, approval states or PDFs.
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {readCollection,revision} from '../../../hackriculture-data/lib/records.mjs';
import {printChecksum} from '../../src/lib/vegetablePrint.ts';
const data=readCollection('vegetables'),rev=revision();
const earlier=Object.keys(data).filter(k=>data[k].ai_print_layout?.status==='approved');
const keys=process.argv.includes('--brassicas')?['broccoli','brussels_sprouts','cabbage']:earlier;
const b=await chromium.launch(),results=[];
try{
 for(const key of keys){
  let best=null;
  for(const count of (process.argv.includes('--brassicas')?[5,6,7,8]:[5,6,7,8,9,10])){
   const copy=structuredClone(data),v=copy[key],p=v.ai_print_layout;p.value.pest_limit=count;
   p.output_checksum=printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))});
   const page=await b.newPage({viewport:{width:688,height:979}});
   await page.route('**/vegetables.json*',route=>route.fulfill({contentType:'application/javascript',body:'export default '+JSON.stringify(copy)+';'}));
   await page.goto(`http://localhost:5173/print/vegetable/${key}?units=metric&aiReview=1`,{waitUntil:'networkidle'});
   await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
   const state=await page.evaluate(()=>({error:document.body.dataset.printError||null,warnings:JSON.parse(document.body.dataset.printWarnings||'[]'),pests:[...document.querySelectorAll('[class*="cheatPestLbl"]')].map(e=>e.textContent),rows:[...document.querySelectorAll('[class*="cheatPestLbl"]')].map(e=>e.parentElement.innerText),height:[...document.querySelectorAll('[class*="cheatCardHd"]')].find(e=>e.textContent==='PESTS & DISEASES')?.parentElement.getBoundingClientRect().height}));
   await page.close();console.log(JSON.stringify({key,count,...state}));
   if(state.error||state.warnings.length)break;
   best={key,count,...state};if(state.pests.length<count)break;
  }
  results.push(best??{key,count:4});
 }
 if(revision()!==rev)throw Error('Master changed during read-only audit');
 await fs.writeFile(`docs/vegetable-ai-pilot/pest-cap-${process.argv.includes('--brassicas')?'brassicas':'earlier'}-audit.json`,JSON.stringify({revision:rev,results},null,2)+'\n');
}finally{await b.close();}
