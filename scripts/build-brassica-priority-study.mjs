// Bounded Brassica ordering/feature experiment; no canonical writes or full-book build.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {readRecord} from '../../hackriculture-data/lib/records.mjs';
import {explorePriorityFit} from './lib/trouble-priority-fit.mjs';
const root=path.resolve(import.meta.dirname,'..'),base='http://127.0.0.1:5173';
const ev=path.join(root,'docs/publication/brassica-priority-study'),tmp=path.join(root,'tmp/pdfs/brassica-priority-study');
const hash=b=>createHash('sha256').update(b).digest('hex');
await fs.mkdir(ev,{recursive:true});await fs.mkdir(tmp,{recursive:true});
try{await fs.access(path.join(ev,'APPROVAL.json'));throw Error('Approved study is frozen');}catch(e){if(e.code!=='ENOENT')throw e;}
const g=readRecord('troubles','brassica_troubles');
const priority=Object.entries(g.conditions).map(([key,c])=>({key,rank:c.rank,star:c.star===true}));
const stars=priority.filter(p=>p.star).map(p=>p.key);
if(JSON.stringify([...stars].sort())!==JSON.stringify(['cabbage_caterpillars','slugs_and_snails']))throw Error('Review changed feature selection');
const masks=JSON.parse(await fs.readFile(path.join(root,'docs/publication/brassica-flow-preview/MASKS.json'),'utf8')).masks;
const previous=JSON.parse(await fs.readFile(path.join(root,'docs/publication/brassica-flow-preview/CHECKS.json'),'utf8'));
const protectedFiles=['output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf','output/pdf/brassica-flow-preview/brassica-troubles-imperial.pdf','output/pdf/troubles-image-size-study/brassica-larger-images-comparison.pdf'];
const protectedHashes={};for(const p of protectedFiles)protectedHashes[p]=hash(await fs.readFile(path.join(root,p)));
const {outputFiles}=await build({entryPoints:[path.join(root,'src/print/book/renderCompact.ts')],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
await fs.writeFile(path.join(tmp,'renderer.mjs'),outputFiles[0].contents);const {prepareCompactBook}=await import(path.join(tmp,'renderer.mjs'));
const browser=await chromium.launch();const report={date:'2026-10-31',status:'experiment for review',priority,stars,alphabeticalTieBreak:false,protectedHashes,results:[]};let experiment;
async function source(page,units){
 await page.goto(`${base}/print/trouble/brassica_troubles?units=${units}&pagination=measure`,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
 const state=await page.evaluate(()=>({error:document.body.dataset.printError,pages:document.querySelectorAll('.editorial-trouble>div:last-child>.sheet').length,warnings:document.body.dataset.printWarnings}));
 if(state.error)throw Error(state.error);return state;
}
async function trim(page){
 await page.evaluate(()=>{const sheets=[...document.querySelectorAll('.sheet')],root=document.querySelector('.editorial-trouble');root.replaceChildren(...sheets);sheets.forEach((s,i)=>s.querySelector('footer').innerHTML=`<span>VEGETABLE TROUBLES</span><span>${106+i}</span>`);});
 await page.addStyleTag({content:'@page{size:185mm 240mm;margin:0}body .editorial-trouble .sheet{position:relative!important;left:auto!important;top:auto!important;margin:0!important;overflow:hidden!important;break-after:page!important}.editorial-trouble .sheet:last-child{break-after:auto!important}'});
}
async function measure(page){return page.evaluate(()=>[...document.querySelectorAll('.sheet')].map((s,i)=>{
 const box=s.getBoundingClientRect(),footer=s.querySelector('footer').getBoundingClientRect();
 const entries=[...s.querySelectorAll('.entry')].map(e=>{
  const r=e.getBoundingClientRect(),img=e.querySelector('.diagnostic'),style=getComputedStyle(img),copy=e.cloneNode(true);copy.querySelector('.feature-label')?.remove();
  return {key:e.dataset.key,rank:+e.dataset.importance,featured:e.classList.contains('featured'),text:copy.textContent,topPx:r.top-box.top,bottomPx:r.bottom-box.top,leftPx:r.left-box.left,rightPx:r.right-box.left,heightPx:r.height,image:{src:img.getAttribute('src'),width:parseFloat(style.width),height:parseFloat(style.height),shape:style.shapeOutside,shapeMargin:style.shapeMargin,loaded:img.complete&&img.naturalWidth>0}};
 });
 const columns=[...s.querySelectorAll('.column')].map(c=>{const es=[...c.children];return {keys:es.map(e=>e.dataset.key),gapsPx:es.slice(1).map((e,i)=>e.getBoundingClientRect().top-es[i].getBoundingClientRect().bottom)};});
 const featured=entries.filter(e=>e.featured);
 for(let a=0;a<featured.length;a++)for(let b=a+1;b<featured.length;b++)if(featured[a].leftPx!==featured[b].leftPx&&Math.min(featured[a].bottomPx,featured[b].bottomPx)>Math.max(featured[a].topPx,featured[b].topPx))throw Error('Featured panels sit directly opposite');
 return {folio:106+i,bodyTopPx:s.querySelector('.columns').getBoundingClientRect().top-box.top,footerTopPx:footer.top-box.top,footerClearanceMm:(footer.top-box.top-Math.max(...entries.map(e=>e.bottomPx)))*25.4/96,entries,columns};
}));}
try{
 for(const units of ['imperial','metric']){
  const page=await browser.newPage({viewport:{width:1100,height:1100}});const result={units};
  for(const mode of ['strict','fit']){
   const a4=await source(page,units);if(mode==='strict'){result.a4=a4;await page.pdf({path:path.join(tmp,`${units}-a4.pdf`),format:'A4',printBackground:true});}
   await prepareCompactBook(page,base,'trouble','brassica_troubles',units,root,{supplier:'bookvault',startPage:106},{masks,priority,...(mode==='fit'?{order:experiment.selected.order}:{})});
   const checks=await page.evaluate(()=>JSON.parse(document.body.dataset.bookChecks));await trim(page);const pages=await measure(page);
   const entries=pages.flatMap(p=>p.entries),expected=new Map(previous.results.find(r=>r.units===units).after.flatMap(p=>p.entries).map(e=>[e.key,e]));
   if(entries.length!==expected.size||new Set(entries.map(e=>e.key)).size!==entries.length)throw Error('Entry coverage changed');
   for(const e of entries){const old=expected.get(e.key);if(e.text!==old.text||e.image.src!==old.image.src)throw Error('Advice/art changed: '+e.key);if(e.image.width!==135||e.image.height!==157.5||!e.image.loaded)throw Error('Image geometry/load changed');}
   if(pages.some(p=>p.footerClearanceMm<3.5||p.columns.some(c=>c.gapsPx.some(g=>Math.abs(g-8)>.1))))throw Error('Fit/gap failure');
   if(entries.some((e,i)=>e.featured&&entries[i+1]?.featured))throw Error('Consecutive feature entries');
   if(!experiment){
    const order=entries.map(e=>e.key),heights=Object.fromEntries(entries.map(e=>[e.key,e.heightPx])),capacities=[pages[0],pages[1]].map(p=>p.footerTopPx-14-p.bodyTopPx);
    experiment=explorePriorityFit(order,heights,capacities,priority);report.experiment=experiment;
   }
   const model=mode==='strict'?experiment.baseline:experiment.selected;
   if(JSON.stringify(model.pages.map(p=>p.columns))!==JSON.stringify(pages.map(p=>p.columns.map(c=>c.keys))))throw Error('Measured layout differs from model');
   result[mode]={pages,checks};
   await fs.writeFile(path.join(ev,`${units}-${mode}.html`),await page.content());
   await page.pdf({path:path.join(tmp,`${units}-${mode}.pdf`),preferCSSPageSize:true,printBackground:true});
   console.log(JSON.stringify({units,mode,pages:pages.length,columns:pages.map(p=>p.columns.map(c=>c.keys.length)),gaps:pages.map(p=>+p.footerClearanceMm.toFixed(1))}));
  }
  report.results.push(result);await page.close();
 }
 for(const p of protectedFiles)if(hash(await fs.readFile(path.join(root,p)))!==protectedHashes[p])throw Error('Protected PDF changed');
 report.protectedFilesUnchanged=true;await fs.writeFile(path.join(ev,'CHECKS.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({fitMoves:experiment.selected.moves,rankInversions:experiment.selected.inversions,baselineScore:experiment.baseline.score,fitScore:experiment.selected.score}));
}finally{await browser.close();await fs.rm(path.join(tmp,'renderer.mjs'),{force:true});}
