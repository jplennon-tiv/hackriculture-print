// Bounded full-guide proof. No catalogue export, shared-data save or book assembly.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {buildWrappingMasks} from './lib/troubles-mask.mjs';

const root=path.resolve(import.meta.dirname,'..'),base='http://127.0.0.1:5173';
const ev=path.join(root,'docs/publication/brassica-flow-preview');
const tmp=path.join(root,'tmp/pdfs/brassica-flow-preview');
const hash=b=>createHash('sha256').update(b).digest('hex');
await fs.mkdir(path.join(ev,'masks'),{recursive:true});await fs.mkdir(tmp,{recursive:true});
try{await fs.access(path.join(ev,'APPROVAL.json'));throw Error('Approved proof is frozen; use a new working path');}catch(e){if(e.code!=='ENOENT')throw e;}
const frozen=JSON.parse(await fs.readFile(path.join(root,'docs/publication/troubles-mask-study/CHECKS.json'),'utf8')).results[0].masks;
const protectedFiles=['output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf','output/pdf/troubles-image-size-study/brassica-larger-images-comparison.pdf','src/print/editorialTrouble.css'];
const protectedHashes={};for(const p of protectedFiles)protectedHashes[p]=hash(await fs.readFile(path.join(root,p)));
const {outputFiles}=await build({entryPoints:[path.join(root,'src/print/book/renderCompact.ts')],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
await fs.writeFile(path.join(tmp,'renderer.mjs'),outputFiles[0].contents);
const {prepareCompactBook}=await import(path.join(tmp,'renderer.mjs'));
const browser=await chromium.launch();
const report={date:'2026-10-31',status:'full Brassica layout for review; image settings already approved',startFolio:106,scope:'Brassica only; imperial and metric; Bookvault body margins in trim-only review PDFs',results:[],protectedHashes};
let masks;
async function source(page,units){
 await page.goto(`${base}/print/trouble/brassica_troubles?units=${units}`,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.body.dataset.printReady==='true');
}
async function trim(page){
 await page.evaluate(()=>{
  const sheets=[...document.querySelectorAll('.sheet')],root=document.querySelector('.editorial-trouble');
  root.replaceChildren(...sheets);
  sheets.forEach((s,i)=>s.querySelector('footer').innerHTML=`<span>VEGETABLE TROUBLES</span><span>${106+i}</span>`);
 });
 await page.addStyleTag({content:'@page{size:185mm 240mm;margin:0}body .editorial-trouble .sheet{position:relative!important;left:auto!important;top:auto!important;margin:0!important;overflow:hidden!important;break-after:page!important}.editorial-trouble .sheet:last-child{break-after:auto!important}'});
}
async function measure(page){return page.evaluate(()=>{
 const mm=96/25.4;
 return [...document.querySelectorAll('.sheet')].map((s,i)=>{
  const box=s.getBoundingClientRect(),footer=s.querySelector('footer').getBoundingClientRect();
  const entries=[...s.querySelectorAll('.entry')].map(e=>{
   const r=e.getBoundingClientRect(),img=e.querySelector('.diagnostic'),style=img&&getComputedStyle(img);
   const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let maxBottom=r.top;
   while(walker.nextNode()){const n=walker.currentNode;if(!n.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(n);for(const q of range.getClientRects())if(q.width&&q.height){if(q.left<r.left-.5||q.right>r.right+.5)throw Error('Text outside entry: '+e.dataset.key);maxBottom=Math.max(maxBottom,q.bottom);}}
   if(maxBottom>r.bottom+.5)throw Error('Text outside entry height: '+e.dataset.key);
   return {key:e.dataset.key,text:e.textContent,topPx:r.top-box.top,bottomPx:r.bottom-box.top,heightPx:r.height,image:img&&{src:img.getAttribute('src'),width:parseFloat(style.width),height:parseFloat(style.height),shape:style.shapeOutside,shapeMargin:style.shapeMargin,blend:style.mixBlendMode,loaded:img.complete&&img.naturalWidth>0}};
  });
  const columns=[...s.querySelectorAll('.column')].map(c=>{
   const es=[...c.children];return {keys:es.map(e=>e.dataset.key),gapsPx:es.slice(1).map((e,i)=>e.getBoundingClientRect().top-es[i].getBoundingClientRect().bottom),heightPx:c.getBoundingClientRect().height};
  });
  return {folio:106+i,bodyTopPx:s.querySelector('.columns').getBoundingClientRect().top-box.top,footerTopPx:footer.top-box.top,footerClearanceMm:(footer.top-box.top-Math.max(...entries.map(e=>e.bottomPx)))/mm,entries,columns};
 });});}
try{
 for(const units of ['imperial','metric']){
  const page=await browser.newPage({viewport:{width:1100,height:1100}});
  await source(page,units);
  await prepareCompactBook(page,base,'trouble','brassica_troubles',units,root,{supplier:'bookvault',startPage:106});
  await trim(page);const before=await measure(page);
  await fs.writeFile(path.join(ev,`${units}-before.html`),await page.content());
  await page.pdf({path:path.join(tmp,`${units}-before.pdf`),preferCSSPageSize:true,printBackground:true});
  if(!masks){
   masks=await page.evaluate(buildWrappingMasks);
   for(const m of masks){
    const old=frozen.find(f=>f.key===m.key);
    if(old&&old.sha256!==hash(m.svg))throw Error('Approved mask geometry changed: '+m.key);
    m.sourceSha256=hash(await fs.readFile(path.join(root,'public',m.src)));
    m.sha256=hash(m.svg);m.url='/docs/publication/brassica-flow-preview/masks/'+m.key+'.svg';
    m.reusedApprovedMask=!!old;
    await fs.writeFile(path.join(ev,'masks',m.key+'.svg'),m.svg);delete m.svg;
   }
   await fs.writeFile(path.join(ev,'MASKS.json'),JSON.stringify({baseBoxPx:[108,126],displayBoxPx:[135,157.5],shapeMarginMm:4,masks},null,2)+'\n');
  }
  await source(page,units);
  const result=await prepareCompactBook(page,base,'trouble','brassica_troubles',units,root,{supplier:'bookvault',startPage:106},{masks});
  const checks=await page.evaluate(()=>JSON.parse(document.body.dataset.bookChecks));
  await trim(page);const after=await measure(page);
  const content=pages=>pages.flatMap(p=>p.entries).map(e=>({key:e.key,text:e.text,src:e.image?.src}));
  if(JSON.stringify(content(before))!==JSON.stringify(content(after)))throw Error('Entry order, wording or displayed art changed');
  if(after.some(p=>p.footerClearanceMm<3.5||p.entries.some(e=>!e.image?.loaded)||p.columns.some(c=>c.gapsPx.some(g=>Math.abs(g-8)>.1))))throw Error('Fit, image or natural gap check failed');
  await fs.writeFile(path.join(ev,`${units}-after.html`),await page.content());
  await page.pdf({path:path.join(tmp,`${units}-after.pdf`),preferCSSPageSize:true,printBackground:true});
  report.results.push({units,before,after,checks,sourcePreserved:true,result});
  console.log(JSON.stringify({units,beforePages:before.length,afterPages:after.length,entries:content(after).length,footerGapsMm:after.map(p=>+p.footerClearanceMm.toFixed(2)),columns:after.map(p=>p.columns.map(c=>c.keys.length))}));
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1130,height:1100}});await page.goto(base+'/print-shell.html');
 await page.setContent('<html><head><style>body{margin:20px;background:#fff8e8;font:15px system-ui}main{display:grid;grid-template-columns:repeat(5,200px);gap:16px}.pair{position:relative;width:200px;height:233.333px}.pair img{position:absolute;width:200px;height:233.333px;object-fit:contain;mix-blend-mode:multiply}.mask{opacity:.23;filter:invert(30%) sepia(90%) saturate(5000%) hue-rotate(300deg)}</style></head><body><main></main></body></html>');
 await page.evaluate(masks=>{for(const m of masks){const c=document.createElement('section'),t=document.createElement('p');t.textContent=m.key.replaceAll('_',' ');c.append(t);const p=document.createElement('div');p.className='pair';for(const [src,cls]of[[m.src,'art'],[m.url,'mask']]){const img=document.createElement('img');img.src=src;img.className=cls;p.append(img);}c.append(p);document.querySelector('main').append(c);}},masks);
 await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode()));});await page.locator('main').screenshot({path:path.join(ev,'mask-alignment-review.png')});await page.close();
 for(const p of protectedFiles)if(hash(await fs.readFile(path.join(root,p)))!==protectedHashes[p])throw Error('Protected file changed: '+p);
 for(const m of masks)if(hash(await fs.readFile(path.join(root,'public',m.src)))!==m.sourceSha256)throw Error('Diagnostic artwork changed: '+m.src);
 report.protectedFilesUnchanged=true;
 await fs.writeFile(path.join(ev,'CHECKS.json'),JSON.stringify(report,null,2)+'\n');
}finally{await browser.close();await fs.rm(path.join(tmp,'renderer.mjs'),{force:true});}
