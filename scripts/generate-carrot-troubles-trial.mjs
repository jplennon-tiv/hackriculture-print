import {refreshGenerated} from '../../hackriculture-data/lib/records.mjs';
refreshGenerated();
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {reviewAiField,printFields} from '../src/lib/aiPrint.ts';
const plan=JSON.parse(await fs.readFile('../hackriculture-data/planning/troubles-print/carrot-parsnip-trial-2026-09-19.json','utf8'));
const live=JSON.parse(await fs.readFile('../hackriculture-data/generated/master/troubles.json','utf8'))[plan.group];
const sourceSnapshot=structuredClone(live);
delete sourceSnapshot.ai_layout;delete sourceSnapshot.ai_introduction;
for(const condition of Object.values(sourceSnapshot.conditions)){
 delete condition.ai_print;for(const field of printFields)delete condition[`ai_${field}`];
}
assert.deepEqual(sourceSnapshot,plan.source,'Source has changed: review the saved trial wording before reuse.');
for(const [key,condition]of Object.entries(live.conditions))for(const field of printFields){
 assert.ok(reviewAiField(condition,field,condition,true).usable,`${key}.${field} needs review before reusing this fixed proof layout`);
 plan.copy[key][{description:'recognise',treatment:'act',prevention:'prevent'}[field]]=condition[`ai_${field}`];
}
const out='output/pdf/carrot-parsnip-assisted-trial';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:794,height:1123}});
 await page.goto('http://127.0.0.1:5173/print/trouble/'+plan.group+'?aiReview=1',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.body.dataset.printReady||document.body.dataset.printError);
 const report=await page.evaluate(async plan=>{
  if(document.body.dataset.printError)throw Error(document.body.dataset.printError);
  const source=document.querySelector('[data-source-card]').parentElement,output=source.nextElementSibling;
  const template=source.querySelector('[data-template]');output.replaceChildren();
  const all=[...source.querySelectorAll('[data-source-card]')];const report=[];
  for(const [index,keys]of plan.pages.entries()){
   const sheet=template.cloneNode(true);sheet.removeAttribute('data-template');output.append(sheet);
   sheet.querySelector('footer span').textContent='VEGETABLE CHEAT SHEETS · EDITORIAL TRIAL';
   sheet.querySelector('[data-page-number]').textContent=(index+1)+' / '+plan.pages.length;
   const columns=sheet.querySelectorAll('[data-column]');
   for(const [i,key]of keys.entries()){
    const original=all.find(c=>c.dataset.key===key);if(!original)throw Error('Missing '+key);
    const card=original.cloneNode(true);card.removeAttribute('data-source-card');card.style.height='117.5mm';
    const img=card.querySelector('img');if(img&&!original.querySelector('img').naturalWidth)card.querySelector('figure').remove();
    const target=card.querySelector('[data-copy]');target.replaceChildren();
    for(const field of ['recognise','act','prevent'])if(plan.copy[key][field]){
     const section=document.createElement('section');section.dataset.section=field;
     const h=document.createElement('h3');h.textContent=field;const p=document.createElement('p');p.textContent=plan.copy[key][field];section.append(h,p);target.append(section);
    }
    columns[Math.floor(i/2)].append(card);
    const picture=card.querySelector('img');
    if(picture){let low=18,high=48;
     while(high-low>.2){const mid=(low+high)/2;picture.style.height=mid+'mm';if(card.scrollHeight<=card.clientHeight)low=mid;else high=mid;}
     picture.style.height=low+'mm';
    }
    if(card.scrollHeight>card.clientHeight+1)throw Error('Needs editorial shortening: '+key);
    const actual=[...target.querySelectorAll('p')].map(p=>p.textContent);
    if(JSON.stringify(actual)!==JSON.stringify(['recognise','act','prevent'].map(f=>plan.copy[key][f]).filter(Boolean)))throw Error('Text mismatch '+key);
    report.push({page:index+1,key,imageHeight:picture?.style.height??null});
   }
   for(const col of columns)if(col.scrollHeight>col.clientHeight+1)throw Error('Column overflow');
  }
  if(output.querySelectorAll('[data-key]').length!==16)throw Error('Card count mismatch');
  return report;
 },plan);
 await page.pdf({path:out+'/carrot-parsnip-troubles-A4.pdf',format:'A4',preferCSSPageSize:true,printBackground:true});
 await fs.writeFile(out+'/fit-report.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
}finally{await browser.close();}
