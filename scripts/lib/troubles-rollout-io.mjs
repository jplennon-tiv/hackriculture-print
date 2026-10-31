import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
export const root=path.resolve(import.meta.dirname,'../..'),base='http://127.0.0.1:5173';
export const ev=path.join(root,'docs/publication/troubles-rollout'),tmp=path.join(root,'tmp/pdfs/troubles-rollout');
export const hash=b=>createHash('sha256').update(b).digest('hex');
export const json=async p=>JSON.parse(await fs.readFile(p,'utf8'));
export const save=async(p,d)=>fs.writeFile(p,JSON.stringify(d,null,2)+'\n');
export async function source(page,key,units){
 await page.goto(`${base}/print/trouble/${key}?units=${units}&pagination=measure`,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
 await page.waitForSelector('.editorial-trouble .measure',{state:'attached'});
 const state=await page.evaluate(()=>({error:document.body.dataset.printError,pages:document.querySelectorAll('.editorial-trouble>div:last-child>.sheet').length,warnings:JSON.parse(document.body.dataset.printWarnings||'[]')}));
 if(state.error)throw Error(key+': '+state.error);return state;
}
export async function trim(page,start){
 await page.evaluate(start=>{const sheets=[...document.querySelectorAll('.sheet')],root=document.querySelector('.editorial-trouble');root.replaceChildren(...sheets);sheets.forEach((s,i)=>s.querySelector('footer').innerHTML=`<span>VEGETABLE TROUBLES</span><span>${start+i}</span>`);},start);
 await page.addStyleTag({content:'@page{size:185mm 240mm;margin:0}body .editorial-trouble .sheet{position:relative!important;left:auto!important;top:auto!important;margin:0!important;overflow:hidden!important;break-after:page!important}.editorial-trouble .sheet:last-child{break-after:auto!important}'});
}
export async function measure(page,start){return page.evaluate(start=>[...document.querySelectorAll('.sheet')].map((s,i)=>{
 const box=s.getBoundingClientRect(),footer=s.querySelector('footer').getBoundingClientRect();
 const entries=[...s.querySelectorAll('.entry')].map(e=>{
  const r=e.getBoundingClientRect(),img=e.querySelector('.diagnostic'),style=img&&getComputedStyle(img),copy=e.cloneNode(true);copy.querySelector('.feature-label')?.remove();
  const h=copy.querySelector('h2');if(h)h.textContent=h.textContent.replace(/\s*★\s*$/,'');
  const label=e.querySelector('.feature-label>span'),lb=label?.getBoundingClientRect();
  const featureLabel=label&&{text:label.textContent,bounds:{left:lb.left-box.left,right:lb.right-box.left,top:lb.top-box.top,bottom:lb.bottom-box.top}};
  const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){const n=walker.currentNode;if(!n.textContent.trim()||n.parentElement.closest('.feature-label'))continue;const range=document.createRange();range.selectNodeContents(n);for(const q of range.getClientRects())if(q.width&&q.height&&(q.left<r.left-.6||q.right>r.right+.6||q.bottom>r.bottom+.6))throw Error('Text outside entry '+e.dataset.key);}
  return {key:e.dataset.key,featured:e.classList.contains('featured'),featureLabel,text:copy.textContent,topPx:r.top-box.top,bottomPx:r.bottom-box.top,leftPx:r.left-box.left,rightPx:r.right-box.left,heightPx:r.height,image:img&&{src:img.getAttribute('src'),width:parseFloat(style.width),height:parseFloat(style.height),shape:style.shapeOutside,shapeMargin:style.shapeMargin,loaded:img.complete&&img.naturalWidth>0}};
 });
 const columns=[...s.querySelectorAll('.column')].map(c=>{const es=[...c.children];return{keys:es.map(e=>e.dataset.key),gapsPx:es.slice(1).map((e,j)=>e.getBoundingClientRect().top-es[j].getBoundingClientRect().bottom)};});
 return{folio:start+i,bodyTopPx:s.querySelector('.columns').getBoundingClientRect().top-box.top,footerTopPx:footer.top-box.top,footerClearanceMm:(footer.top-box.top-Math.max(...entries.map(e=>e.bottomPx)))*25.4/96,entries,columns};
}),start);}
