import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {applyHeaderWidgetTrial} from '../src/print/book/header-widget-trial/layout.mjs';
const root=process.cwd(),base='http://127.0.0.1:5173',dir='docs/publication/vegetable-header-review',tmp='tmp/pdfs/vegetable-header-review';
const sha=b=>createHash('sha256').update(b).digest('hex'),read=async p=>JSON.parse(await fs.readFile(p));
const book=await read('docs/publication/whole-book-order-preview/CHECKS.json');
const plan=await read('docs/publication/contents-update/ASSEMBLY-PROPOSAL.json');
const crops=[['carrot','carrot'],['onion_shallot','onions_and_shallots'],['oriental_leaves','oriental_leaves'],['florence_fennel','florence_fennel']];
const inputs=Object.fromEntries(await Promise.all(['src/print/book/header-widget-trial/layout.mjs','src/print/book/renderCompact.ts','src/print/book/production.ts','src/print/book/compact.css','src/print/book/production.css','src/print/book/bookvault.css','src/print/richVegetable.css','src/print/familyThemes.json',book.pdf,...crops.map(([k])=>`../hackriculture-data/vegetables/${k}/${k}.json`)].map(async p=>[p,sha(await fs.readFile(p))])));
if(inputs[book.pdf]!==book.sha256)throw Error('Current book changed');
const bundle=await build({entryPoints:['src/print/book/renderCompact.ts'],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
const {prepareCompactBook}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].contents).toString('base64'));
const browser=await chromium.launch(),results=[];
try{
 const page=await browser.newPage();
 for(const unit of ['imperial','metric'])for(const [key,slug] of crops){
  const d=plan.editions[unit].documents.find(d=>d.key===key);
  await page.goto(`${base}/print/vegetable/${slug}?units=${unit}`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
  // This source route is A4; the bound-book adapter owns the checks used here.
  await prepareCompactBook(page,base,'vegetable',slug,unit,root,{supplier:'bookvault',startPage:d.startPage});
  await page.evaluate(()=>{
   const front=document.querySelector('.sheet.front');
   for(const leaf of document.querySelectorAll('.book-leaf')){if(leaf.contains(front))leaf.replaceWith(front);else leaf.remove();}
   front.style.setProperty('position','relative','important');front.style.setProperty('top','0','important');front.style.setProperty('left','0','important');
   // Keep exactly the original header. Body pages in the mockup come from the saved PDF.
   for(const child of [...front.children])if(child.tagName!=='HEADER')child.remove();
   const style=document.createElement('style');style.textContent='@page{size:185mm 240mm;margin:0}body{margin:0}.sheet{overflow:hidden!important}';document.head.append(style);
  });
  await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const before=`${tmp}/${slug}-${unit}-before-header.pdf`;
  if(unit==='imperial')await page.pdf({path:before,preferCSSPageSize:true,printBackground:true});
  const measures=await page.evaluate(applyHeaderWidgetTrial,{circleGapPx:20,titleGapPx:20});
  const after=`${tmp}/${slug}-${unit}-after-header.pdf`;
  if(unit==='imperial')await page.pdf({path:after,preferCSSPageSize:true,printBackground:true});
  const assets=await page.evaluate(()=>[...document.images].map(i=>new URL(i.src).pathname));
  for(const asset of assets){const p='public'+asset;if(!inputs[p])inputs[p]=sha(await fs.readFile(p));}
  const html=`${dir}/${slug}-${unit}.html`;await fs.writeFile(html,await page.content());
  results.push({key,slug,unit,folio:d.startPage,sourcePdf:d.pdf,sourceSha256:d.sha256,beforeHeader:unit==='imperial'?before:null,afterHeader:unit==='imperial'?after:null,html,...measures});
  console.log(JSON.stringify({slug,unit,paper:measures.paper,gap:measures.titleGapMm,movedLeft:measures.shiftLeftMm,badgeGap:measures.seasonToBadgeGapMm}));
 }
}finally{await browser.close();}
for(const [p,h]of Object.entries(inputs))if(sha(await fs.readFile(p))!==h)throw Error('Source changed: '+p);
await fs.writeFile(`${dir}/CHECKS.json`,JSON.stringify({date:'2026-10-15',status:'Header-only mockups; proposed and not installed',fullBook:{path:book.pdf,sha256:book.sha256},inputs,results,bodyReflowed:false,canonicalJsonChanged:false,productionRendererChanged:false},null,2)+'\n');
