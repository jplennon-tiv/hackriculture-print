// Measured, prose-preserving packing pass. Preview by default; --save installs plans.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {readCollection,revision,saveCollections,refreshGenerated} from '../../hackriculture-data/lib/records.mjs';
import {layoutSourceSignature} from '../src/lib/aiPrint.ts';
const rev=revision(),data=readCollection('troubles'),before=structuredClone(data);
const requested=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const groups=requested.length?requested:['tomato_troubles','bean_and_pea_troubles','brassica_troubles','carrot_and_parsnip_troubles','cucurbit_troubles','beetroot_troubles'];
const browser=await chromium.launch(),reports=[];
try{for(const slug of groups){
 const g=data[slug],plan=g.ai_layout;assert.equal(plan.status,process.argv.includes('--draft')?'draft':'approved');assert.equal(plan.source_signature,layoutSourceSignature(g));
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/print/trouble/'+slug+'?aiReview=1',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.body.dataset.printReady||document.body.dataset.printError);
 const heights=await page.evaluate(()=>{
  if(document.body.dataset.printError)throw Error(document.body.dataset.printError);
  const result={};for(const original of document.querySelectorAll('[data-source-card]')){
   if(original.dataset.key==='__intro')continue;
   const card=original.cloneNode(true);card.style.cssText='width:90mm;height:auto';original.parentElement.append(card);
   const img=card.querySelector('img');if(!img?.naturalWidth)throw Error('Missing image '+original.dataset.key);
   img.style.height='18mm';result[original.dataset.key]=Math.ceil(card.getBoundingClientRect().height/3.779527559)+1;card.remove();
  }return result;
 });
 const order=plan.pages.flatMap(p=>p.columns.flatMap(c=>c.map(e=>e.key)));
 let intro=plan.pages[0].intro_height_mm??0,cap=238-intro;
 let best=null,pairs;
 do {
 pairs=[];for(let i=0;i<order.length;i++)for(let j=i+1;j<order.length;j++)if(heights[order[i]]+heights[order[j]]+3<=cap)pairs.push([i,j]);
 let score=Infinity;
 for(const a of pairs)for(const b of pairs){if(a.some(i=>b.includes(i)))continue;const s=[...a,...b].reduce((sum,i)=>sum+i,0);if(s<score){score=s;best=[a,b];}}
 if(best||!process.argv.includes('--full-first'))break;
 assert(intro>26,'Cannot pack four without further design review');intro--;cap=238-intro;
 }while(!best);
 let first;
 if(best)first=best.map(p=>p.map(i=>order[i]));
 else if(pairs.length){const p=pairs[0];first=[p.map(i=>order[i]),[order.find((_,i)=>!p.includes(i))]];}
 else first=[[order[0]],[order[1]]];
 const used=new Set(first.flat()),remaining=order.filter(k=>!used.has(k));
 const specs=[{intro_height_mm:intro,columns:first}];
 while(remaining.length){const batch=remaining.splice(0,4),split=batch.length===2?1:2;specs.push({columns:[batch.slice(0,split),batch.slice(split)]});}
 const pages=specs.map((p,index)=>({...(index===0?{intro_height_mm:intro}:{}),columns:p.columns.map(keys=>{
  if(!keys.length)return [];
  const capacity=index?256:cap,min=keys.reduce((n,k)=>n+heights[k],0),space=capacity-3*(keys.length-1)-min;
  assert(space>=0,slug+': pair needs manual review');
  return keys.map(key=>({key,height_mm:Math.floor((heights[key]+space/keys.length-(index?18/keys.length:0))*10)/10}));
 })}));
 const proposed={...plan,pages};
 const result=await page.evaluate(async proposed=>{
  const {paginateTroublePlan}=await import('/src/print/troublePlan.ts');
  const source=document.querySelector('[data-source-card]').parentElement,output=source.nextElementSibling;
  const result=paginateTroublePlan(source,output,source.querySelector('[data-template]'),proposed);
  const cards=[...output.querySelectorAll('[data-key]')];
  return {...result,counts:[...output.children].map(p=>p.querySelectorAll('[data-key]').length),keys:cards.map(c=>c.dataset.key),overflow:cards.filter(c=>c.scrollHeight>c.clientHeight+1).length};
 },proposed);
 assert.equal(result.overflow,0);assert.deepEqual([...result.keys].sort(),Object.keys(g.conditions).sort());assert.equal(result.warnings.length,0);
 g.ai_layout.pages=pages;g.ai_layout.updated_at=new Date().toISOString();g.ai_layout.updated_by='User-authorised measured packing pass; no prose changes';
 reports.push({slug,before:before[slug].ai_layout.pages.length,after:pages.length,counts:result.counts,minimumCardHeights:heights});
 await page.close();
}
 const stripped=structuredClone(data);for(const slug of groups)stripped[slug].ai_layout=before[slug].ai_layout;assert.deepEqual(stripped,before);
 await fs.mkdir('output/pdf/ai-once-pilot',{recursive:true});
 await fs.writeFile('output/pdf/ai-once-pilot/packing-report.json',JSON.stringify(reports,null,2));
 if(process.argv.includes('--save')){console.log(saveCollections({troubles:data},{actor:'User-authorised layout packing (model not recorded)',expectedRevision:rev}));refreshGenerated();}
 console.log(JSON.stringify(reports.map(({minimumCardHeights,...r})=>r),null,2));
}finally{await browser.close();}
