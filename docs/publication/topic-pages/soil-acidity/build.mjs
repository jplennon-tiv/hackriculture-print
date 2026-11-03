import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(dir,'../../../..');
if(await fs.access(path.join(dir,'APPROVAL.json')).then(()=>true,()=>false))throw Error('Approved page is frozen; use a new revision path.');
const copyPath=path.join(root,'src/print/book/soil-acidity/copy.json');
const copy=JSON.parse(await fs.readFile(copyPath,'utf8'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const header=p=>`<header><p class="eyebrow">${esc(p.runningTitle)}</p><h1>${esc(p.title)}<span>${esc(p.subtitle)}</span></h1><p class="lead">${esc(p.lead)}</p></header>`;
const footer=p=>`<p class="source-note">${esc(p.source)}</p><footer><span>GROWING TECHNIQUES</span><span>${p.folio}</span></footer>`;
const panel=p=>`<section class="topic-panel panel-${p.id}"><h2>${esc(p.title)}</h2><div class="panel-grid"><div>${p.paragraphs.map(t=>`<p>${esc(t)}</p>`).join('')}</div><figure><img src="assets/${p.image}" alt="${esc(p.alt)}"></figure></div><p class="panel-note">${esc(p.note)}</p></section>`;
const sheets=copy.pages.map(p=>`<section class="sheet ${p.folio%2?'recto':'verso'}" data-folio="${p.folio}"><div class="page-content">${header(p)}<div class="panels">${p.panels.map(panel).join('')}</div></div>${footer(p)}</section>`);
await fs.writeFile(path.join(dir,'draft.html'),`<!doctype html><html lang="en-GB"><meta charset="utf-8"><title>Organic growing — testing and adjusting pH — review draft</title><link rel="stylesheet" href="draft.css"><main>${sheets.join('')}</main></html>`);
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1600,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto(`http://127.0.0.1:5173/${path.relative(root,dir)}/draft.html`,{waitUntil:'networkidle'});await page.emulateMedia({media:'print'});
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 const checks=await page.evaluate(()=>{
  const mm=96/25.4,rect=(el,base)=>{const r=el.getBoundingClientRect();return{left:(r.left-base.left)/mm,right:(r.right-base.left)/mm,top:(r.top-base.top)/mm,bottom:(r.bottom-base.top)/mm}};
  return{fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,natural:[i.naturalWidth,i.naturalHeight]})),pages:[...document.querySelectorAll('.sheet')].map(s=>{const base=s.getBoundingClientRect(),c=rect(s.querySelector('.page-content'),base),f=rect(s.querySelector('footer'),base),source=rect(s.querySelector('.source-note'),base);return{folio:Number(s.dataset.folio),contentBottom:c.bottom,sourceGap:source.top-c.bottom,footerGap:f.top-Math.max(c.bottom,source.bottom),blocks:[...s.querySelectorAll('h1,h2,h3,p,figcaption,img,footer,.scale-label,.tick')].map(e=>({tag:e.tagName,text:e.innerText||e.alt,...rect(e,base),fontPt:parseFloat(getComputedStyle(e).fontSize)*.75})),text:s.innerText};})};
 });
 const violations=[];for(const p of checks.pages){if(p.sourceGap<2)violations.push(`${p.folio}: source gap ${p.sourceGap.toFixed(2)} mm`);if(p.footerGap<3)violations.push(`${p.folio}: footer gap ${p.footerGap.toFixed(2)} mm`);const left=p.folio%2?17:8,right=p.folio%2?177:168;for(const b of p.blocks)if(b.left<left-.2||b.right>right+.2||b.top<5||b.bottom>233)violations.push(`${p.folio}: unsafe ${b.tag}: ${b.text?.slice(0,40)}`);}
 const output=path.join(root,'output/pdf/soil-acidity/soil-acidity-draft.pdf');
 await page.pdf({path:output,preferCSSPageSize:true,printBackground:true});
 const hash=b=>createHash('sha256').update(b).digest('hex');
 await fs.writeFile(path.join(dir,'CHECKS.json'),JSON.stringify({date:copy.date,status:copy.status,units:copy.units,copyPath,copySha256:hash(await fs.readFile(copyPath)),output,pdfSha256:hash(await fs.readFile(output)),errors,violations,...checks},null,2)+'\n');
 console.log(JSON.stringify({output,errors,violations,pages:checks.pages.map(({folio,contentBottom,sourceGap,footerGap})=>({folio,contentBottom,sourceGap,footerGap}))}));
 if(errors.length||violations.length)process.exitCode=1;
}finally{await browser.close();}
