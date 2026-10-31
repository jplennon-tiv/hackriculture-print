// Bounded, separate layout experiment. Does not change the live book renderer.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'..');
const base='http://127.0.0.1:5173';
const evidence=path.join(root,'docs/publication/troubles-wrap-study');
const scratch=path.join(root,'tmp/pdfs/troubles-wrap-study');
await fs.mkdir(evidence,{recursive:true});await fs.mkdir(scratch,{recursive:true});
const {outputFiles}=await build({entryPoints:[path.join(root,'src/print/book/renderCompact.ts')],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
const modulePath=path.join(scratch,'renderer.mjs');await fs.writeFile(modulePath,outputFiles[0].contents);
const {prepareCompactBook}=await import(modulePath);
const browser=await chromium.launch();
const report={status:'experiment — not installed or approved',scope:'Brassica opening, folio 106, imperial and metric',method:'CSS polygons around unchanged opaque illustrations; 2 mm shape margin. Image pixels are read only to propose conservative exclusion outlines. No raster artwork is edited.',results:[]};
try {
 for(const units of ['imperial','metric']) {
  const page=await browser.newPage({viewport:{width:900,height:1000},deviceScaleFactor:1});
  await page.goto(`${base}/print/trouble/brassica_troubles?units=${units}`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.dataset.printReady==='true');
  await prepareCompactBook(page,base,'trouble','brassica_troubles',units,root,{supplier:'bookvault',startPage:106});
  await page.evaluate(()=>{
   const sheets=[...document.querySelectorAll('.sheet')];
   const first=sheets[0];const wrapper=document.querySelector('.editorial-trouble');
   wrapper.replaceChildren(first);document.body.replaceChildren(wrapper);
   first.querySelector('footer').innerHTML='<span>VEGETABLE TROUBLES</span><span>106</span>';
  });
  await page.addStyleTag({content:'@page{size:185mm 240mm;margin:0}body .editorial-trouble .sheet{position:relative!important;left:auto!important;top:auto!important;margin:0!important;overflow:hidden!important;break-after:auto!important}'});
  const source=await page.locator('.sheet').innerText();
  const images=await page.locator('.diagnostic').evaluateAll(imgs=>imgs.map(i=>i.getAttribute('src')));
  const before=await page.content();
  const metrics=()=>page.evaluate(()=>{
   const sheet=document.querySelector('.sheet'),s=sheet.getBoundingClientRect(),footer=sheet.querySelector('footer').getBoundingClientRect();
   const entries=[...sheet.querySelectorAll('.entry')].map(e=>{
    const r=e.getBoundingClientRect();const img=e.querySelector('.diagnostic');
    const range=document.createRange();range.selectNodeContents(e.querySelector('.advice section:last-child p'));
    const end=Math.max(...[...range.getClientRects()].map(r=>r.bottom));
    return {key:e.dataset.key,heightPx:r.height,bottomPx:r.bottom-s.top,lastTextBottomPx:end-s.top,image:{src:img.getAttribute('src'),widthPx:img.width,heightPx:img.height,shape:getComputedStyle(img).shapeOutside,loaded:img.complete&&img.naturalWidth>0}};
   });
   const columns=[...sheet.querySelectorAll('.column')].map(c=>{const r=document.createRange();r.selectNodeContents(c.lastElementChild.querySelector('.advice section:last-child p'));return Math.max(...[...r.getClientRects()].map(r=>r.bottom));});
   return {fonts:document.fonts.status,entries,footerClearanceMm:(footer.top-Math.max(...entries.map(e=>e.bottomPx+s.top)))*25.4/96,columnTextEndDifferencePx:Math.abs(columns[0]-columns[1]),text:sheet.innerText};
  });
  const current=await metrics();
  await fs.writeFile(path.join(evidence,`${units}-current.html`),before);
  await page.pdf({path:path.join(scratch,`${units}-current.pdf`),preferCSSPageSize:true,printBackground:true});
  const outlines=await page.evaluate(()=>{
   const outlines=[];
   for(const img of document.querySelectorAll('.diagnostic')) {
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
    const {data}=ctx.getImageData(0,0,canvas.width,canvas.height);
    const scale=Math.min(img.width/canvas.width,img.height/canvas.height);
    const xOffset=(img.width-canvas.width*scale)/2,yOffset=(img.height-canvas.height*scale)/2;
    // The leftmost visible mark in each short band defines a conservative
    // staircase. Exclude everything to its right, including all internal holes.
    const step=Math.max(1,Math.floor(5/scale)),points=[];
    for(let y=0;y<canvas.height;y+=step){
     let left=canvas.width;
     for(let yy=y;yy<Math.min(y+step,canvas.height);yy++)for(let x=0;x<canvas.width;x++){
      const k=(yy*canvas.width+x)*4;
      if(data[k+3]>0&&Math.min(data[k],data[k+1],data[k+2])<247){left=Math.min(left,x);break;}
     }
     if(left===canvas.width)continue;
     const px=xOffset+left*scale;
     points.push([px,yOffset+y*scale],[px,yOffset+Math.min(y+step,canvas.height)*scale]);
    }
    if(!points.length)throw Error('No outline found');
    const polygon=[[img.width,points[0][1]],...points,[img.width,points.at(-1)[1]]];
    const shape=`polygon(${polygon.map(([x,y])=>`${x.toFixed(2)}px ${y.toFixed(2)}px`).join(',')})`;
    img.style.shapeOutside=shape;img.style.shapeMargin='2mm';
    outlines.push({key:img.closest('.entry').dataset.key,src:img.getAttribute('src'),shape,margin:'2mm'});
   }
   // Keep the same entries in the same columns. Rebalance only inter-entry
   // space after the changed wrapping; never stretch the advice itself.
   const columns=[...document.querySelectorAll('.column')];
   columns.forEach(c=>{c.style.height='auto';c.style.alignSelf='start';});
   const end=c=>{const r=document.createRange();r.selectNodeContents(c.lastElementChild.querySelector('.advice section:last-child p'));return Math.max(...[...r.getClientRects()].map(r=>r.bottom));};
   const ends=columns.map(end),target=Math.max(...ends);
   const heights=columns.map((c,i)=>c.getBoundingClientRect().height+target-ends[i]);
   columns.forEach((c,i)=>c.style.height=`${heights[i]}px`);
   return outlines;
  });
  const shaped=await metrics();
  if(shaped.text!==source||shaped.entries.some(e=>!e.image.loaded)||shaped.footerClearanceMm<4||shaped.columnTextEndDifferencePx>1)throw Error('Study content/fit check failed');
  await fs.writeFile(path.join(evidence,`${units}-contour.html`),await page.content());
  await page.pdf({path:path.join(scratch,`${units}-contour.pdf`),preferCSSPageSize:true,printBackground:true});
  for(const mode of ['current','contour']) {
   if(mode==='current'){await page.setContent(before);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});}
   else {await page.setContent(await fs.readFile(path.join(evidence,`${units}-contour.html`),'utf8'));await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});}
   await page.locator('.sheet').screenshot({path:path.join(evidence,`${units}-${mode}.png`)});
  }
  const assets=[];for(const src of images)assets.push({src,sha256:createHash('sha256').update(await fs.readFile(path.join(root,'public',src))).digest('hex')});
  report.results.push({units,current,shaped,outlines,assets,contentUnchanged:true});
  console.log(JSON.stringify({units,entries:shaped.entries.map(e=>e.key),footerClearanceMm:shaped.footerClearanceMm,columnTextEndDifferencePx:shaped.columnTextEndDifferencePx}));
  await page.close();
 }
 await fs.writeFile(path.join(evidence,'CHECKS.json'),JSON.stringify(report,null,2)+'\n');
}finally{await browser.close();await fs.rm(modulePath,{force:true});}
