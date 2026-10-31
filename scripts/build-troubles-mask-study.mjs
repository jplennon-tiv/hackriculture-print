// Separate image-alpha wrap trial. Only four invisible SVG layout masks are new;
// the diagnostic PNGs, live renderer and previous polygon trial remain intact.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'..'),base='http://127.0.0.1:5173';
const evidence=path.join(root,'docs/publication/troubles-mask-study');
const scratch=path.join(root,'tmp/pdfs/troubles-mask-study');
const prior=path.join(root,'docs/publication/troubles-wrap-study');
const shapeMarginMm=4;
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
// These source files are bound by John's later image-treatment approval.
try { await fs.access(path.join(root,'docs/publication/troubles-image-size-study/APPROVAL.json')); throw Error('Frozen approved specimen: use the separate full-guide preview workflow'); }
catch(error) { if(error.code!=='ENOENT')throw error; }
await fs.mkdir(path.join(evidence,'masks'),{recursive:true});await fs.mkdir(scratch,{recursive:true});
const original=JSON.parse(await fs.readFile(path.join(prior,'CHECKS.json'),'utf8'));
const protectedFiles=['src/print/book/compact.css','src/print/book/renderCompact.ts','src/print/editorialTrouble.css','output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'];
const protectedHashes={};for(const p of protectedFiles)protectedHashes[p]=hash(await fs.readFile(path.join(root,p)));
for(const asset of original.results[0].assets)if(hash(await fs.readFile(path.join(root,'public',asset.src)))!==asset.sha256)throw Error('Source artwork changed: '+asset.src);
const report={date:'2026-10-31',status:'proposal, not installed',shapeMarginMm,scope:'Brassica opening, folio 106, four entries; same geometry and artwork as the rectangular baseline',method:`Separate transparent SVG silhouettes used as shape-outside image URLs, with 0.5 alpha threshold and ${shapeMarginMm} mm margin. Outer float margins are enlarged only as needed to avoid clipping the gap on the text-facing, top and bottom edges. The displayed PNGs and multiply blending are unchanged. SVG geometry encloses the outermost source marks in each short band and fills internal gaps; isolated components smaller than 16 source pixels, and edge flecks smaller than 256 pixels, are excluded from the layout mask only.`,protectedHashes,results:[]};
const browser=await chromium.launch();
try{
 for(const units of ['imperial','metric']){
  const page=await browser.newPage({viewport:{width:1240,height:1100}});
  await page.goto(base+'/print-shell.html');
  const sourceHtml=await fs.readFile(path.join(prior,`${units}-current.html`),'utf8');
  await page.setContent(sourceHtml);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const metrics=()=>page.evaluate(()=>{
   const sheet=document.querySelector('.sheet'),bounds=sheet.getBoundingClientRect(),footer=sheet.querySelector('footer').getBoundingClientRect();
   const entries=[...sheet.querySelectorAll('.entry')].map(e=>{
    const img=e.querySelector('.diagnostic'),r=e.getBoundingClientRect();
    const range=document.createRange();range.selectNodeContents(e.querySelector('.advice section:last-child p'));
    const textEnd=Math.max(...[...range.getClientRects()].map(r=>r.bottom));
    const style=getComputedStyle(img);
    return {key:e.dataset.key,text:e.innerText,heightPx:r.height,bottomPx:r.bottom-bounds.top,textEndPx:textEnd-bounds.top,image:{src:img.getAttribute('src'),width:img.width,height:img.height,blend:style.mixBlendMode,shape:style.shapeOutside,shapeMargin:style.shapeMargin,floatMargins:{top:style.marginTop,bottom:style.marginBottom,left:style.marginLeft},loaded:img.complete&&img.naturalWidth>0}};
   });
   const cols=[...sheet.querySelectorAll('.column')].map(c=>{const r=document.createRange();r.selectNodeContents(c.lastElementChild.querySelector('.advice section:last-child p'));return Math.max(...[...r.getClientRects()].map(r=>r.bottom));});
   return {text:sheet.innerText,entries,fonts:document.fonts.status,footerClearanceMm:(footer.top-bounds.top-Math.max(...entries.map(e=>e.bottomPx)))*25.4/96,columnTextEndDifferencePx:Math.abs(cols[0]-cols[1])};
  });
  const current=await metrics();
  await fs.writeFile(path.join(evidence,`${units}-current.html`),sourceHtml);
  await page.pdf({path:path.join(scratch,`${units}-current.pdf`),preferCSSPageSize:true,printBackground:true});
  const masks=await page.evaluate(()=>[...document.querySelectorAll('.diagnostic')].map(img=>{
   const w=img.naturalWidth,h=img.naturalHeight,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
   const pixels=ctx.getImageData(0,0,w,h).data,ink=new Uint8Array(w*h),kept=new Uint8Array(w*h);
   for(let i=0;i<ink.length;i++)ink[i]=pixels[4*i+3]>0&&Math.min(pixels[4*i],pixels[4*i+1],pixels[4*i+2])<247?1:0;
   let discardedPixels=0;const queue=new Int32Array(w*h);
   for(let start=0;start<ink.length;start++)if(ink[start]){
    let head=0,tail=1,touchesEdge=false;queue[0]=start;ink[start]=0;
    while(head<tail){const i=queue[head++],x=i%w;
     if(x===0||x===w-1||i<w||i>=(h-1)*w)touchesEdge=true;
     for(const next of [x>0?i-1:-1,x<w-1?i+1:-1,i-w,i+w])if(next>=0&&next<ink.length&&ink[next]){ink[next]=0;queue[tail++]=next;}
    }
    if(tail>=16&&!(touchesEdge&&tail<256))for(let i=0;i<tail;i++)kept[queue[i]]=1;else discardedPixels+=tail;
   }
   const scale=Math.min(img.width/w,img.height/h),dx=(img.width-w*scale)/2,dy=(img.height-h*scale)/2;
   const step=Math.max(1,Math.floor(2/scale)),left=[],right=[];
   for(let y=0;y<h;y+=step){let lo=w,hi=-1;
    for(let yy=y;yy<Math.min(y+step,h);yy++)for(let x=0;x<w;x++)if(kept[yy*w+x]){lo=Math.min(lo,x);hi=Math.max(hi,x+1);}
    if(hi<0)continue;
    const top=dy+y*scale,bottom=dy+Math.min(y+step,h)*scale;
    left.push([dx+lo*scale,top],[dx+lo*scale,bottom]);right.push([dx+hi*scale,top],[dx+hi*scale,bottom]);
   }
   if(!left.length)throw Error('No mask silhouette');
   const points=[...left,...right.reverse()].map(p=>p.map(n=>n.toFixed(3)).join(',')).join(' ');
   const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}"><polygon fill="black" points="${points}"/></svg>\n`;
   const bounds={left:Math.min(...left.map(p=>p[0])),top:Math.min(...left.map(p=>p[1])),bottom:Math.max(...left.map(p=>p[1]))};
   return {key:img.closest('.entry').dataset.key,src:img.getAttribute('src'),width:img.width,height:img.height,bounds,svg,discardedPixels};
  }));
  for(const mask of masks){
   const filename=mask.key+'.svg';
   if(units==='imperial')await fs.writeFile(path.join(evidence,'masks',filename),mask.svg);
   else if(await fs.readFile(path.join(evidence,'masks',filename),'utf8')!==mask.svg)throw Error('Mask differs between unit editions');
   mask.url=base+'/docs/publication/troubles-mask-study/masks/'+filename;mask.sha256=hash(mask.svg);
  }
  await page.evaluate(async ({masks,shapeMarginMm})=>{
   for(const mask of masks){const preload=new Image();preload.src=mask.url;await preload.decode();
    const img=document.querySelector(`[data-key="${mask.key}"] .diagnostic`);
    img.style.shapeOutside=`url("${mask.url}")`;img.style.shapeImageThreshold='0.5';img.style.shapeMargin=shapeMarginMm+'mm';
    // Shape margins cannot extend beyond the float's margin box. Give the
    // larger gap enough room without moving the right-aligned drawing sideways.
    const gap=shapeMarginMm*96/25.4,style=getComputedStyle(img);
    img.style.marginLeft=Math.max(parseFloat(style.marginLeft),gap-mask.bounds.left)+'px';
    img.style.marginTop=Math.max(parseFloat(style.marginTop),gap-mask.bounds.top)+'px';
    img.style.marginBottom=Math.max(parseFloat(style.marginBottom),gap-(img.height-mask.bounds.bottom))+'px';
   }
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   const cols=[...document.querySelectorAll('.column')];cols.forEach(c=>{c.style.height='auto';c.style.alignSelf='start';});
   const ends=cols.map(c=>{const range=document.createRange();range.selectNodeContents(c.lastElementChild.querySelector('.advice section:last-child p'));return Math.max(...[...range.getClientRects()].map(r=>r.bottom));});
   const target=Math.max(...ends),heights=cols.map((c,i)=>c.getBoundingClientRect().height+target-ends[i]);
   cols.forEach((c,i)=>c.style.height=heights[i]+'px');
  },{masks:masks.map(({key,url,bounds})=>({key,url,bounds})),shapeMarginMm});
  const masked=await metrics();
  if(current.text!==masked.text||masked.fonts!=='loaded'||masked.entries.some(e=>!e.image.loaded)||masked.footerClearanceMm<4||masked.columnTextEndDifferencePx>1)throw Error('Content or fit check failed');
  const unchangedArt=e=>e.entries.map(({key,image})=>({key,src:image.src,width:image.width,height:image.height,blend:image.blend}));
  if(JSON.stringify(unchangedArt(current))!==JSON.stringify(unchangedArt(masked)))throw Error('Displayed artwork changed');
  await fs.writeFile(path.join(evidence,`${units}-masked.html`),await page.content());
  await page.pdf({path:path.join(scratch,`${units}-masked.pdf`),preferCSSPageSize:true,printBackground:true});
  // Show the mask over the original artwork for alignment review only.
  if(units==='imperial'){
   await page.setContent('<html><head><style>body{margin:20px;font:18px system-ui;background:#fff8e8}main{display:grid;grid-template-columns:repeat(4,260px);gap:16px}.pair{position:relative;width:260px;height:303.333px}.pair img{position:absolute;width:260px;height:303.333px;object-fit:contain;mix-blend-mode:multiply}.mask{opacity:.23;filter:invert(30%) sepia(90%) saturate(5000%) hue-rotate(300deg)}</style></head><body><main></main></body></html>');
   await page.evaluate(masks=>{for(const m of masks){const card=document.createElement('section'),title=document.createElement('p');title.textContent=m.key.replaceAll('_',' ');card.append(title);const pair=document.createElement('div');pair.className='pair';for(const [src,cls] of [[m.src,'art'],[m.url,'mask']]){const img=document.createElement('img');img.src=src;img.className=cls;pair.append(img);}card.append(pair);document.querySelector('main').append(card);}},masks);
   await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode()));});
   await page.locator('main').screenshot({path:path.join(evidence,'mask-alignment-review.png')});
  }
  report.results.push({units,sourceHtmlSha256:hash(sourceHtml),current,masked,masks:masks.map(({svg,...m})=>m),wordingUnchanged:true,displayedArtworkUnchanged:true});
  console.log(JSON.stringify({units,entries:masked.entries.length,footerClearanceMm:masked.footerClearanceMm,columnTextEndDifferencePx:masked.columnTextEndDifferencePx}));
  await page.close();
 }
 for(const p of protectedFiles)if(hash(await fs.readFile(path.join(root,p)))!==protectedHashes[p])throw Error('Protected source changed: '+p);
 report.protectedFilesUnchanged=true;
 await fs.writeFile(path.join(evidence,'CHECKS.json'),JSON.stringify(report,null,2)+'\n');
}finally{await browser.close();}
