// Brassica only: retain the selected 4 mm wrap and compare 100% with 125% art.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'..'),base='http://127.0.0.1:5173';
const prior=path.join(root,'docs/publication/troubles-mask-study');
const evidence=path.join(root,'docs/publication/troubles-image-size-study');
const scratch=path.join(root,'tmp/pdfs/troubles-image-size-study');
const hash=b=>createHash('sha256').update(b).digest('hex');
const previous=JSON.parse(await fs.readFile(path.join(prior,'CHECKS.json'),'utf8'));
if(previous.shapeMarginMm!==4)throw Error('Expected selected 4 mm baseline');
// These source files are bound by John's later image-treatment approval.
try { await fs.access(path.join(root,'docs/publication/troubles-image-size-study/APPROVAL.json')); throw Error('Frozen approved specimen: use the separate full-guide preview workflow'); }
catch(error) { if(error.code!=='ENOENT')throw error; }
await fs.mkdir(evidence,{recursive:true});await fs.mkdir(scratch,{recursive:true});
const protectedPaths=['src/print/book/compact.css','src/print/book/renderCompact.ts','output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf','output/pdf/troubles-mask-study/brassica-mask-comparison.pdf'];
const protectedHashes={};for(const file of protectedPaths)protectedHashes[file]=hash(await fs.readFile(path.join(root,file)));
const report={date:'2026-10-31',status:'larger-image proposal; 4 mm gap selected by John',scope:'Brassica opening, folio 106; both units',imageScale:1.25,shapeMarginMm:4,protectedHashes,results:[]};
const browser=await chromium.launch();
try{
 for(const units of ['imperial','metric']){
  const sourceHtml=await fs.readFile(path.join(prior,`${units}-masked.html`),'utf8');
  const source=previous.results.find(r=>r.units===units);
  for(const mask of source.masks)if(hash(await fs.readFile(path.join(prior,'masks',mask.key+'.svg')))!==mask.sha256)throw Error('Source mask changed');
  const page=await browser.newPage({viewport:{width:1240,height:1100}});
  await page.goto(base+'/print-shell.html');await page.setContent(sourceHtml);
  await page.evaluate(async masks=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));await Promise.all(masks.map(async m=>{const i=new Image();i.src=m.url;await i.decode();}));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));},source.masks);
  const metrics=()=>page.evaluate(()=>{
   const sheet=document.querySelector('.sheet'),box=sheet.getBoundingClientRect(),footer=sheet.querySelector('footer').getBoundingClientRect();
   const end=e=>{const r=document.createRange();r.selectNodeContents(e);return Math.max(...[...r.getClientRects()].map(r=>r.bottom));};
   const entries=[...sheet.querySelectorAll('.entry')].map(e=>{const img=e.querySelector('.diagnostic'),s=getComputedStyle(img),r=e.getBoundingClientRect();return {key:e.dataset.key,text:e.innerText,heightPx:r.height,bottomPx:r.bottom-box.top,textEndPx:end(e.querySelector('.advice section:last-child p'))-box.top,image:{src:img.getAttribute('src'),widthPx:parseFloat(s.width),heightPx:parseFloat(s.height),shape:s.shapeOutside,shapeMargin:s.shapeMargin,blend:s.mixBlendMode,loaded:img.complete&&img.naturalWidth>0}};});
   const ends=[...sheet.querySelectorAll('.column')].map(c=>end(c.lastElementChild.querySelector('.advice section:last-child p')));
   return {text:sheet.innerText,fonts:document.fonts.status,entries,footerClearanceMm:(footer.top-box.top-Math.max(...entries.map(e=>e.bottomPx)))*25.4/96,columnTextEndDifferencePx:Math.abs(ends[0]-ends[1])};
  });
  const current=await metrics();
  await fs.writeFile(path.join(evidence,`${units}-current.html`),sourceHtml);
  await page.pdf({path:path.join(scratch,`${units}-current.pdf`),preferCSSPageSize:true,printBackground:true});
  await page.evaluate(({masks,scale})=>{
   for(const m of masks){
    const img=document.querySelector(`[data-key="${m.key}"] .diagnostic`),gap=4*96/25.4;
    img.style.width=m.width*scale+'px';img.style.height=m.height*scale+'px';
    // SVG alpha masks scale with the same content box as the unchanged PNGs.
    // The text gap stays 4 mm, rather than growing with the illustration.
    img.style.marginLeft=Math.max(8,gap-m.bounds.left*scale)+'px';
    img.style.marginTop=Math.max(2,gap-m.bounds.top*scale)+'px';
    img.style.marginBottom=Math.max(5,gap-(m.height-m.bounds.bottom)*scale)+'px';
   }
   const cols=[...document.querySelectorAll('.column')];cols.forEach(c=>{c.style.height='auto';c.style.alignSelf='start';});
   const ends=cols.map(c=>{const r=document.createRange();r.selectNodeContents(c.lastElementChild.querySelector('.advice section:last-child p'));return Math.max(...[...r.getClientRects()].map(r=>r.bottom));});
   const target=Math.max(...ends),heights=cols.map((c,i)=>c.getBoundingClientRect().height+target-ends[i]);
   cols.forEach((c,i)=>c.style.height=heights[i]+'px');
  },{masks:source.masks,scale:report.imageScale});
  const larger=await metrics();
  if(current.text!==larger.text||larger.fonts!=='loaded'||larger.entries.some(e=>!e.image.loaded)||larger.footerClearanceMm<4||larger.columnTextEndDifferencePx>1)throw Error('Text, image or fit failure');
  for(let i=0;i<larger.entries.length;i++){
   const a=current.entries[i].image,b=larger.entries[i].image;
   if(a.src!==b.src||a.shape!==b.shape||a.blend!==b.blend||a.shapeMargin!==b.shapeMargin||Math.abs(b.widthPx/a.widthPx-1.25)>.001||Math.abs(b.heightPx/a.heightPx-1.25)>.001)throw Error('Unexpected artwork change');
  }
  await fs.writeFile(path.join(evidence,`${units}-larger.html`),await page.content());
  await page.pdf({path:path.join(scratch,`${units}-larger.pdf`),preferCSSPageSize:true,printBackground:true});
  report.results.push({units,sourceHtmlSha256:hash(sourceHtml),current,larger,wordingUnchanged:true,originalArtworkRetained:true,masks:source.masks.map(({key,sha256})=>({key,sha256}))});
  console.log(JSON.stringify({units,widthPx:larger.entries[0].image.widthPx,heightPx:larger.entries[0].image.heightPx,footerClearanceMm:larger.footerClearanceMm,columnTextEndDifferencePx:larger.columnTextEndDifferencePx}));
  await page.close();
 }
 for(const p of protectedPaths)if(hash(await fs.readFile(path.join(root,p)))!==protectedHashes[p])throw Error('Protected source changed: '+p);
 report.protectedFilesUnchanged=true;await fs.writeFile(path.join(evidence,'CHECKS.json'),JSON.stringify(report,null,2)+'\n');
}finally{await browser.close();}
