import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'../../../..');
const copyPath=path.resolve(root,'../hackriculture-resources/summaries/plant-protection-supports/copy.json');
const copy=JSON.parse(await fs.readFile(copyPath,'utf8'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const [n,s]=copy.pages;
const header=p=>`<header><p class="eyebrow">${esc(p.runningTitle)}</p><h1>${esc(p.title)}<span>${esc(p.subtitle)}</span></h1><p class="lead">${esc(p.lead)}</p></header>`;
const footer=p=>`<p class="source-note">${esc(p.source)}</p><footer><span>GROWING TECHNIQUES</span><span>${p.folio}</span></footer>`;
const img=(name,alt)=>`<img src="assets/${name}.png" alt="${esc(alt)}">`;
const net=`<section class="sheet verso" data-folio="160" id="netting"><div class="page-content">${header(n)}
<div class="net-figure"><figure><div class="main-art">${img('netting-bed-v1','Fine mesh supported on bottle-topped canes, clear of brassicas, with all edges weighted closed')}</div><figcaption>${esc(n.caption)}</figcaption></figure>
<figure><div class="detail-art">${img('bottle-detail-v1','Two views of an inverted bottle over a cane, supporting the cover at different heights')}</div><figcaption>${esc(n.detailCaption)}</figcaption></figure></div>
<section class="materials"><h2>${esc(n.materialsTitle)}</h2><div class="material-grid">${n.materials.map(m=>`<section><h3>${esc(m.label)}</h3><p>${esc(m.text)}</p></section>`).join('')}</div></section>
<div class="net-methods"><section><h2>${esc(n.methodTitle)}</h2><p>${esc(n.method)}</p></section><section class="checks"><h2>${esc(n.checkTitle)}</h2><p>${esc(n.check)}</p><h3>${esc(n.pollinationTitle)}</h3><p>${esc(n.pollination)}</p></section></div>
<p class="wildlife">${esc(n.wildlife)}</p></div>${footer(n)}</section>`;
const supports=`<section class="sheet" data-folio="161" id="supports"><div class="page-content">${header(s)}<div class="support-rows">${s.sections.map(b=>`<section class="support-row"><figure><div class="art">${img(b.id+'-v1',({beans:'Two rows of crossed canes, joined by a ridge and braced along the row',peas:'A rectangular cane frame with climbing net and diagonal bracing on its sides and ends',tomatoes:'An anchored wire tomato cage with supplementary cane and diagonal brace'})[b.id])}</div><figcaption>${esc(b.caption)}</figcaption></figure><div><h2>${esc(b.title)}</h2><p>${esc(b.text)}</p></div></section>`).join('')}</div><section class="closing"><h2>${esc(s.closingTitle)}</h2><p>${esc(s.closing)}</p></section></div>${footer(s)}</section>`;
const html=`<!doctype html><html lang="en-GB"><meta charset="utf-8"><title>Netting and supports — two-page review draft</title><link rel="stylesheet" href="draft.css"><main>${net}${supports}</main></html>`;
await fs.writeFile(path.join(dir,'draft.html'),html);
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1600,height:1100}});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto(`http://127.0.0.1:5173/${path.relative(root,dir)}/draft.html`,{waitUntil:'networkidle'});await page.emulateMedia({media:'print'});
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 const checks=await page.evaluate(()=>{
  const mm=96/25.4;const rect=(el,base)=>{const r=el.getBoundingClientRect();return{left:(r.left-base.left)/mm,right:(r.right-base.left)/mm,top:(r.top-base.top)/mm,bottom:(r.bottom-base.top)/mm}};
  return{fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,natural:[i.naturalWidth,i.naturalHeight]})),pages:[...document.querySelectorAll('.sheet')].map(s=>{
   const base=s.getBoundingClientRect(),c=rect(s.querySelector('.page-content'),base),f=rect(s.querySelector('footer'),base),source=rect(s.querySelector('.source-note'),base);
   return{folio:Number(s.dataset.folio),contentBottom:c.bottom,sourceGap:source.top-c.bottom,footerGap:f.top-Math.max(c.bottom,source.bottom),blocks:[...s.querySelectorAll('h1,h2,h3,p,figcaption,img,footer')].map(e=>({tag:e.tagName,text:e.innerText||e.alt,...rect(e,base),fontPt:parseFloat(getComputedStyle(e).fontSize)*.75})),text:s.innerText};
  })};
 });
 const violations=[];
 for(const p of checks.pages){
  if(p.sourceGap<2)violations.push(`${p.folio}: source gap ${p.sourceGap.toFixed(2)} mm`);
  if(p.footerGap<3)violations.push(`${p.folio}: footer gap ${p.footerGap.toFixed(2)} mm`);
  const left=p.folio%2?17:8,right=p.folio%2?177:168;
  for(const b of p.blocks)if(b.left<left-.2||b.right>right+.2||b.top<5||b.bottom>233)violations.push(`${p.folio}: unsafe ${b.tag}: ${b.text?.slice(0,40)}`);
 }
 const output=path.join(root,'output/pdf/topic-pages/plant-protection-supports-draft.pdf');await fs.mkdir(path.dirname(output),{recursive:true});
 await page.pdf({path:output,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
 const hash=x=>createHash('sha256').update(x).digest('hex');
 await fs.writeFile(path.join(dir,'CHECKS.json'),JSON.stringify({date:'2026-10-28',status:'Draft; not integrated or author-approved',units:copy.units,copyPath,copySha256:hash(await fs.readFile(copyPath)),output,pdfSha256:hash(await fs.readFile(output)),errors,violations,...checks},null,2)+'\n');
 await fs.writeFile(path.dirname(copyPath)+'/draft-copy.txt',checks.pages.map(p=>`PROPOSED PAGE ${p.folio}\n\n${p.text}`).join('\n\n')+'\n');
 console.log(JSON.stringify({output,errors,violations,pages:checks.pages.map(({folio,contentBottom,sourceGap,footerGap})=>({folio,contentBottom,sourceGap,footerGap}))}));
 if(errors.length||violations.length)process.exitCode=1;
}finally{await browser.close();}
