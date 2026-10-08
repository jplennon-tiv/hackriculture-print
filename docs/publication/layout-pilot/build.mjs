// Bounded, isolated POD study: rendered approved copy, no canonical/template writes.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {readCollection,revision} from '../../../../hackriculture-data/lib/records.mjs';

const root=path.resolve(import.meta.dirname,'../../..');
const out=import.meta.dirname;
const base='http://127.0.0.1:5173';
const pdfOut=path.join(root,'output/pdf/publication-pilot');
const sourceRevision=revision();
const v=readCollection('vegetables').kale;
assert.equal(v.ai_print_layout.status,'approved');
const css=await fs.readFile(path.join(out,'pilot.css'),'utf8');
await fs.mkdir(pdfOut,{recursive:true});
await fs.mkdir(path.join(root,'tmp/pdfs/publication-pilot'),{recursive:true});
await fs.writeFile(path.join(root,'tmp/pdfs/publication-pilot/blank.html'),'<!doctype html><html><head><title>Isolated print renderer</title></head><body></body></html>');
const browser=await chromium.launch();
const results=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:1200}});
 for(const unit of ['imperial','metric']){
  const captured={};
  for(const [kind,route,selector]of [['vegetable','vegetable/kale','.rich-print'],['trouble','trouble/carrot_and_parsnip_troubles','.editorial-trouble']]){
   await page.goto(`${base}/print/${route}?units=${unit}`,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
   captured[kind]=await page.evaluate(selector=>{
    if(document.body.dataset.printError)throw Error(document.body.dataset.printError);
    const el=document.querySelector(selector).cloneNode(true);
    if(selector==='.editorial-trouble'){
     const source=el.querySelector('.measure');
     const entries=[...source.querySelectorAll('[data-source-entry]')];
     entries.slice(6).forEach(e=>e.remove());
     el.querySelector(':scope>div:last-child').replaceChildren();
    }
    return {html:el.outerHTML,css:[...document.querySelectorAll('style')].map(e=>e.textContent).join('\n'),warnings:JSON.parse(document.body.dataset.printWarnings??'[]'),revision:document.body.dataset.printRevision};
   },selector);
   assert.deepEqual(captured[kind].warnings,[]);
  }
  for(const format of ['a4','compact']){
   const [w,h]=format==='a4'?[210,297]:[185,240];
   const name=`${format}-${unit}`;
   // A new document clears the live route's React/Vite work before reflow.
   await page.goto(`${base}/tmp/pdfs/publication-pilot/blank.html`);
   await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><base href="${base}/"><title>POD size pilot — ${format} — ${unit}</title><style>${captured.vegetable.css}\n${captured.trouble.css}\n${css}\n:root{--trim-width:${w}mm;--trim-height:${h}mm}@page{size:${w}mm ${h}mm;margin:0}</style></head><body class="${format==='compact'?'compact-study':'a4-study'}">${captured.vegetable.html}${captured.trouble.html}</body></html>`);
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
   const result=await page.evaluate(async({format,unit})=>{
    const rich=document.querySelector('.rich-print'),trouble=document.querySelector('.editorial-trouble');
    const originals=[...rich.querySelectorAll('p,li,td,th,h2,h3,.measurements')].map(e=>e.textContent.trim()).filter(Boolean).sort();
    const originalImages=[...rich.querySelectorAll('img')].map(e=>e.getAttribute('src')).sort();
    // Remove only runtime spacing additions: source text and illustrations stay intact.
    rich.querySelectorAll('[style]').forEach(e=>{e.style.removeProperty('margin-top');e.style.removeProperty('margin-bottom');if(e.tagName==='TR')e.style.removeProperty('height');});
    const front=rich.querySelector('.front'),back=rich.querySelector('.back');
    if(format==='compact'){
     const reference=document.createElement('section');reference.className='sheet back reference';
     const header=back.querySelector('header').cloneNode(true);header.querySelector('h1').textContent='Varieties & plant health';
     header.querySelector('.hero-art')?.remove();
     reference.append(header,front.querySelector('.varieties'),back.querySelector('.pests'),back.querySelector('.tips'),back.querySelector('.content-end').cloneNode(),back.querySelector('footer').cloneNode(true));
     rich.append(reference);
    }
    const sheets=[...rich.querySelectorAll('.sheet')];
    const parity=()=>[...document.querySelectorAll('.sheet:not([data-template])')].filter(e=>!e.closest('.measure')).forEach((p,i)=>p.classList.toggle('verso',i%2===1));
    parity();
    const source=trouble.querySelector('.measure'),output=trouble.querySelector(':scope>div:last-child');
    const originalsTrouble=[...source.querySelectorAll('[data-source-entry]')].map(e=>({key:e.dataset.key,text:e.textContent,images:[...e.querySelectorAll('img')].map(i=>i.getAttribute('src'))}));
    if(format==='compact')for(const entry of source.querySelectorAll('[data-source-entry]')){
     // Narrow columns need a complete heading before the float; never strand a
     // long diagnostic name underneath its own illustration.
     const img=entry.querySelector('.diagnostic');
     if(img)(entry.querySelector('.symptom')??entry.querySelector('h2')).after(img);
    }
    const {paginateEditorial}=await import('/src/print/editorialTroubleLayout.ts');
    // Account for the global recto/verso position while measuring the excerpt.
    source.querySelector('[data-template]').classList.toggle('verso',sheets.length%2===1);
    paginateEditorial(source,output);parity();
    const finalTrouble=[...output.querySelectorAll('.entry')].map(e=>({key:e.dataset.key,text:e.textContent,images:[...e.querySelectorAll('img')].map(i=>i.getAttribute('src'))}));
    source.remove();
    const all=[...document.querySelectorAll('.sheet')];
    all.forEach((p,i)=>{
     p.dataset.pilotPage=String(i+1);
     p.querySelector('footer').innerHTML=`<span>FORMAT PILOT · ${format==='a4'?'A4':'185 × 240 mm'} · ${unit.toUpperCase()}</span><span>${p.closest('.rich-print')?'KALE':'TROUBLES SAMPLE'} · ${i+1} / ${all.length}</span>`;
    });
    const finalText=[...rich.querySelectorAll('p,li,td,th,h2,h3,.measurements')].map(e=>e.textContent.trim()).filter(Boolean).sort();
    const finalImages=[...rich.querySelectorAll('img')].map(e=>e.getAttribute('src')).sort();
    const checks=all.map(p=>{
     const box=p.getBoundingClientRect(),footer=p.querySelector('footer').getBoundingClientRect();
     const content=p.querySelector('.content-end')?.getBoundingClientRect().bottom??Math.max(...[...p.querySelectorAll('.entry')].map(e=>e.getBoundingClientRect().bottom));
     const textOverflow=[];const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);
     while(walker.nextNode()){
      const n=walker.currentNode;if(!n.textContent.trim())continue;
      const range=document.createRange();range.selectNodeContents(n);
      for(const r of range.getClientRects())if(r.width&&r.height&&(r.left<box.left+1||r.right>box.right-1||r.top<box.top||r.bottom>box.bottom))textOverflow.push(n.textContent.trim().slice(0,60));
     }
     const header=p.querySelector('header'),title=header?.querySelector('h1'),nav=header?.querySelector('.navigation'),badge=header?.querySelector('.header-difficulty');
     if(nav&&title&&title.getBoundingClientRect().bottom>nav.getBoundingClientRect().top-2)textOverflow.push('Header title overlaps navigation');
     if(badge&&title&&title.getBoundingClientRect().bottom>badge.getBoundingClientRect().top-2)textOverflow.push('Header title overlaps difficulty badge');
     return {page:Number(p.dataset.pilotPage),kind:p.closest('.rich-print')?'vegetable':'trouble',classes:p.className,widthMm:+(box.width/3.77952756).toFixed(2),heightMm:+(box.height/3.77952756).toFixed(2),footerGapMm:+((footer.top-content)/3.77952756).toFixed(2),textOverflow,
      bodyPt:[...new Set([...p.querySelectorAll('.growing-columns li,.advice p,.intro,.fact-grid p,.varieties p,.pests td')].map(e=>+(parseFloat(getComputedStyle(e).fontSize)*.75).toFixed(2)))].sort((a,b)=>a-b),
      diagnosticSlots:[...p.querySelectorAll('.diagnostic')].map(e=>({widthPx:e.width,heightPx:e.height,fit:getComputedStyle(e).objectFit}))};
    });
    return {format,unit,pages:checks,vegetableTextPreserved:JSON.stringify(originals)===JSON.stringify(finalText),vegetableImagesPreserved:JSON.stringify(originalImages)===JSON.stringify(finalImages),troubleEntriesPreserved:JSON.stringify(originalsTrouble)===JSON.stringify(finalTrouble),troubleKeys:finalTrouble.map(e=>e.key),fonts:document.fonts.status,missingImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)};
   },{format,unit});
   assert.equal(result.vegetableTextPreserved,true);
   assert.equal(result.vegetableImagesPreserved,true);
   assert.equal(result.troubleEntriesPreserved,true);
   assert.equal(result.troubleKeys.length,6);
   assert.equal(new Set(result.troubleKeys).size,6);
   assert.deepEqual(result.missingImages,[]);
   assert.equal(result.fonts,'loaded');
   for(const p of result.pages){assert.deepEqual(p.textOverflow,[]);assert(p.footerGapMm>=3,`${name} page ${p.page}: only ${p.footerGapMm} mm footer clearance`);}
   const html=await page.content();
   await fs.writeFile(path.join(out,name+'.html'),html.replace(`<base href="${base}/">`,'').replaceAll('src="/','src="../../../public/').replaceAll('url("/fonts/','url("../../../public/fonts/').replaceAll("url('/fonts/","url('../../../public/fonts/"));
   const bytes=await page.pdf({width:`${w}mm`,height:`${h}mm`,preferCSSPageSize:true,printBackground:true,scale:1,margin:{top:0,bottom:0,left:0,right:0}});
   await fs.writeFile(path.join(pdfOut,name+'.pdf'),bytes);
   result.physicalPages=(bytes.toString('latin1').match(/\/Type\s*\/Page\b/g)??[]).length;
   assert.equal(result.physicalPages,result.pages.length,'Physical PDF pagination differs from DOM');
   result.sha256=createHash('sha256').update(bytes).digest('hex');
   results.push(result);
   console.log(JSON.stringify(result));
  }
 }
 assert.equal(revision(),sourceRevision,'Canonical data changed during pilot');
 await fs.writeFile(path.join(out,'CHECKS.json'),JSON.stringify({checkedAt:new Date().toISOString(),sourceRevision,canonicalUnchanged:true,scope:'Kale complete guide; first six Carrot and Parsnip Troubles conditions, excerpt only',results},null,2)+'\n');
}finally{await browser.close();}
