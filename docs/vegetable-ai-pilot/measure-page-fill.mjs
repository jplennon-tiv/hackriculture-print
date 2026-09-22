import fs from 'node:fs';
import {chromium} from 'playwright';
import {readCollection} from '../../../hackriculture-data/lib/records.mjs';
import {printChecksum,layoutDependencies,extractDependencies} from '../../src/lib/vegetablePrint.ts';
const [label='baseline',proposalPath,requested]=process.argv.slice(2);
const data=readCollection('vegetables'),proposals=proposalPath?JSON.parse(fs.readFileSync(proposalPath)):{};
const keys=requested?.split(',')??Object.keys(data).filter(k=>data[k].ai_print_layout?.status==='draft'&&k!=='kale');
for(const[k,c]of Object.entries(proposals)){
 const v=data[k],p=v.ai_print_layout;
 Object.assign(p.value,c.layout??{});
 for(const[slot,value]of Object.entries(c.sections??{})){
  const e=v.ai_print_extracts.sections[slot]??{dependencies:extractDependencies(v,[slot]),status:'draft',locked:false};
  v.ai_print_extracts.sections[slot]={...e,value,output_checksum:printChecksum(value)};
 }
 p.dependencies=layoutDependencies(v);p.output_checksum=printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))});
}
const browser=await chromium.launch(),results=[];
try{
 const page=await browser.newPage({viewport:{width:688,height:979}});
 if(proposalPath)await page.route('**/generated/master/vegetables.json*',route=>route.fulfill({contentType:'text/javascript',body:'export default '+JSON.stringify(data)+';'}));
 for(const key of keys)for(const units of ['metric','imperial']){
  await page.goto(`http://127.0.0.1:5173/print/vegetable/${key}?units=${units}&aiReview=1`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
  const state=await page.evaluate(()=>({error:document.body.dataset.printError,warnings:JSON.parse(document.body.dataset.printWarnings||'[]'),pages:[...document.querySelectorAll('[class*="cheatPage_"]')].map(e=>{let r=e.getBoundingClientRect(),s=getComputedStyle(e),end=e.lastElementChild.getBoundingClientRect().bottom;let box=e.querySelector('[data-align-bottoms]');let cols=[...box.children].filter(e=>/cheatLeft_|cheatRight_/.test(e.className));return{content_px:end-r.top,budget_px:parseFloat(s.minHeight)-parseFloat(s.paddingBottom)-parseFloat(s.borderBottomWidth),unused_mm:(parseFloat(s.minHeight)-parseFloat(s.paddingBottom)-parseFloat(s.borderBottomWidth)-(end-r.top))*25.4/96,column_gap:Math.abs(cols[0].lastElementChild.getBoundingClientRect().bottom-cols[1].lastElementChild.getBoundingClientRect().bottom)};})}));
  results.push({key,units,...state});console.log(key,units,state.pages.map(p=>p.unused_mm.toFixed(1)).join('/'),state.warnings.join(';'));
 }
 fs.writeFileSync(`docs/vegetable-ai-pilot/page-fill-${label}.json`,JSON.stringify(results,null,2)+'\n');
}finally{await browser.close();}
