import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'../../../../..');
const copyPath=path.resolve(root,'../hackriculture-resources/summaries/plant-protection-supports/supports-copy.json');
const copy=JSON.parse(await fs.readFile(copyPath,'utf8'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const header=p=>`<header><p class="eyebrow">${esc(p.runningTitle)}</p><h1>${esc(p.title)}<span>${esc(p.subtitle)}</span></h1><p class="lead">${esc(p.lead)}</p></header>`;
const footer=p=>`<p class="source-note">${esc(p.source)}</p><footer><span>GROWING TECHNIQUES</span><span>${p.folio}</span></footer>`;
const figure=b=>`<figure><div class="art${b.constructionImage?' art-pair':''}">${b.constructionImage?`<img src="assets/${esc(b.constructionImage)}" alt="${esc(b.constructionAlt)}">`:''}<img src="assets/${esc(b.image||`${b.id}.png`)}" alt="${esc(b.alt)}"></div><figcaption>${esc(b.caption)}</figcaption></figure>`;
const [a,b]=copy.pages;
const row=m=>`<section class="method-row method-${m.id}">${figure(m)}<div><h2>${esc(m.title)}</h2><p>${esc(m.text)}</p></div></section>`;
const first=`<section class="sheet verso climbers" data-folio="${a.folio}"><div class="page-content">${header(a)}<div class="bean-options">${a.sections.slice(0,2).map(m=>`<section class="option option-${m.id}"><h2>${esc(m.title)}</h2>${figure(m)}<p>${esc(m.text)}</p></section>`).join('')}</div>${a.sections.slice(2).map(row).join('')}</div>${footer(a)}</section>`;
const second=`<section class="sheet stakes" data-folio="${b.folio}"><div class="page-content">${header(b)}<div class="method-rows">${b.sections.map(row).join('')}</div><section class="closing"><h2>${esc(b.closingTitle)}</h2><p>${esc(b.closing)}</p></section></div>${footer(b)}</section>`;
const html=`<!doctype html><html lang="en-GB"><meta charset="utf-8"><title>Supports — revised two-page draft</title><link rel="stylesheet" href="draft.css"><main>${first}${second}</main></html>`;
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
 const output=path.join(root,'output/pdf/topic-pages/supports-revised-draft.pdf');await fs.mkdir(path.dirname(output),{recursive:true});
 await page.pdf({path:output,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
 const hash=x=>createHash('sha256').update(x).digest('hex');
 await fs.writeFile(path.join(dir,'CHECKS.json'),JSON.stringify({date:copy.date,status:'Draft; not integrated or author-approved',units:copy.units,copyPath,copySha256:hash(await fs.readFile(copyPath)),output,pdfSha256:hash(await fs.readFile(output)),errors,violations,...checks},null,2)+'\n');
 await fs.writeFile(path.dirname(copyPath)+'/supports-draft-copy.txt',checks.pages.map(p=>`PROPOSED PAGE ${p.folio}\n\n${p.text}`).join('\n\n')+'\n');
 console.log(JSON.stringify({output,errors,violations,pages:checks.pages.map(({folio,contentBottom,sourceGap,footerGap})=>({folio,contentBottom,sourceGap,footerGap}))}));
 if(errors.length||violations.length)process.exitCode=1;
}finally{await browser.close();}
