// Proposal measurement only: no canonical writes. All attempted choices are retained.
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {readCollection,revision} from '../../../hackriculture-data/lib/records.mjs';
import {curate,plan,candidates} from './redraft-earlier-content.mjs';
const rev=revision(),data=curate(readCollection('vegetables'),readCollection('troubles'));
const b=await chromium.launch(),results=[];
try{
 for(const [key,counts]of Object.entries(candidates))for(const count of counts){
  const copy=structuredClone(data);plan(copy[key],count);
  const page=await b.newPage({viewport:{width:688,height:979}});
  await page.route('**/vegetables.json*',route=>route.fulfill({contentType:'application/javascript',body:'export default '+JSON.stringify(copy)+';'}));
  await page.goto(`http://localhost:5173/print/vegetable/${key}?units=metric&aiReview=1`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
  await page.evaluate(()=>document.fonts.ready);
  const state=await page.evaluate(()=>({error:document.body.dataset.printError||null,warnings:JSON.parse(document.body.dataset.printWarnings||'[]'),pests:[...document.querySelectorAll('[class*="cheatPestLbl"]')].map(e=>e.textContent),rows:[...document.querySelectorAll('[class*="cheatPestLbl"]')].map(e=>e.parentElement.innerText),alignment:[...document.querySelectorAll('[data-align-bottoms]')].map(body=>{const cols=[...body.children].filter(e=>/cheatLeft|cheatRight/.test(e.className));const bs=cols.map(c=>c.lastElementChild.getBoundingClientRect().bottom);return Math.abs(bs[0]-bs[1]);})}));
  if(!state.warnings.length&&!state.error){const pdf=await page.pdf({format:'A4',printBackground:true,scale:1,margin:{top:'18mm',bottom:'20mm',left:'14mm',right:'14mm'}});state.pages=(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;}
  results.push({key,count,...state});console.log(JSON.stringify({key,count,...state}));await page.close();
 }
 if(revision()!==rev)throw Error('Source changed during measurement');
 const file='docs/vegetable-ai-pilot/earlier-redraft-candidates.json';
 let history=[];try{const old=JSON.parse(await fs.readFile(file,'utf8'));history=old.history??[old];}catch{}
 history.push({revision:rev,checked_at:new Date().toISOString(),results});
 await fs.writeFile(file,JSON.stringify({history},null,2)+'\n');
}finally{await b.close();}
