import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'../../../..');
const copyPath=path.resolve(root,'../hackriculture-resources/summaries/compost-bins-pilot/copy.json');
const copy=JSON.parse(await fs.readFile(copyPath,'utf8'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const all=[];
const browser=await chromium.launch();
try{
 for(const units of ['imperial','metric']){
  const t=s=>esc(s.replace(/\{(\w+)\}/g,(_,k)=>copy.measurements[k][units]));
  const blocks=arr=>arr.map(b=>`<section class="block"><h2>${t(b.title)}</h2><p>${t(b.text)}</p></section>`).join('');
  const pages=copy.pages.map((p,i)=>{
   let content;
   if(i===0)content=`<figure class="hero"><img src="assets/${p.image}" alt="${t(p.imageAlt)}"></figure><div class="stages">${p.stages.map(s=>`<section><h3>${t(s.title)}</h3><p>${t(s.text)}</p></section>`).join('')}</div><div class="blocks two">${blocks(p.blocks)}</div><div class="common-details">${[p.base,p.lid].map(b=>`<aside><h2>${t(b.title)}</h2><p>${t(b.text)}</p></aside>`).join('')}</div><p class="materials-line">${p.materials.map(m=>`<strong>${t(m.title)}:</strong> ${t(m.text)}`).join(' ')}</p>`;
   else content=`<div class="method-headings">${p.methods.map(m=>`<h2>${t(m.title)}</h2>`).join('')}</div><figure class="hero"><img src="assets/${p.image}" alt="${t(p.imageAlt)}"></figure><div class="method-captions">${p.methods.map(m=>`<p>${t(m.caption)}</p>`).join('')}</div><div class="methods">${p.methods.map(m=>`<section>${m.steps.map((s,n)=>`<section class="method-step"><h3><span class="step-number">${n+1}</span>${t(s.title)}</h3><p>${t(s.text)}</p></section>`).join('')}</section>`).join('')}</div>`;
   return `<section class="sheet ${i?'construction verso':'overview'}" id="${p.id}" data-folio="${i+1}"><div class="page-content"><header><p class="eyebrow">${t(p.section)}</p><h1>${t(p.title)}<span>${t(p.subtitle)}</span></h1><p class="lead">${t(p.lead)}</p></header>${content}</div><p class="source-note">${t(p.source)}</p><footer><span>THE VEGETABLE GURU · COMPOST PILOT</span><span>${units.toUpperCase()} · ${i+1}</span></footer></section>`;
  }).join('');
  await fs.writeFile(path.join(dir,units+'.html'),`<!doctype html><html lang="en-GB"><meta charset="utf-8"><title>Compost bins: two-page pilot</title><link rel="stylesheet" href="pilot.css"><main>${pages}</main></html>`);
  const page=await browser.newPage({viewport:{width:1400,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.goto(`http://127.0.0.1:5173/docs/publication/topic-pages/compost-bins-pilot/${units}.html`,{waitUntil:'networkidle'});
  await page.emulateMedia({media:'print'});await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const checks=await page.evaluate(()=>{
   const mm=96/25.4,round=n=>Math.round(n*1000)/1000;
   return {fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,width:i.naturalWidth,height:i.naturalHeight,effectiveDpi:Math.round(i.naturalWidth/(i.width/96))})),pages:[...document.querySelectorAll('.sheet')].map(s=>{
    const bounds=s.getBoundingClientRect(),foot=s.querySelector('footer').getBoundingClientRect(),content=s.querySelector('.page-content').getBoundingClientRect(),source=s.querySelector('.source-note').getBoundingClientRect();
    const blocks=[...s.querySelectorAll('h1,h2,h3,p,figcaption,footer,img')].map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName.toUpperCase(),text:e.innerText||e.textContent||e.getAttribute('src'),leftMm:round((r.left-bounds.left)/mm),rightMm:round((r.right-bounds.left)/mm),topMm:round((r.top-bounds.top)/mm),bottomMm:round((r.bottom-bounds.top)/mm),fontPt:round(parseFloat(getComputedStyle(e).fontSize)*.75)};});
    return {folio:Number(s.dataset.folio),id:s.id,contentBottomMm:round((content.bottom-bounds.top)/mm),footerGapMm:round((foot.top-Math.max(content.bottom,source.bottom))/mm),sourceGapMm:round((source.top-content.bottom)/mm),blocks,text:s.innerText};
   })};
  });
  const violations=[];
  for(const p of checks.pages){
   if(p.footerGapMm<3)violations.push(`${p.id}: footer gap ${p.footerGapMm}`);
   if(p.sourceGapMm<2)violations.push(`${p.id}: source gap ${p.sourceGapMm}`);
   const left=p.folio%2?17:8,right=p.folio%2?177:168;
   for(const b of p.blocks)if(b.leftMm<left-.15||b.rightMm>right+.15||b.topMm<5||b.bottomMm>233)violations.push(`${p.id}: unsafe ${b.tag}: ${b.text.slice(0,45)}`);
  }
  all.push({units,errors,violations,...checks});await fs.writeFile(path.join(dir,'DOM-CHECKS.json'),JSON.stringify({copyPath,status:'Separate two-page pilot; no integration',results:all},null,2)+'\n');
  if(errors.length||checks.images.some(i=>!i.loaded)||checks.fonts.some(f=>f.status!=='loaded')||violations.length)throw Error(JSON.stringify({units,errors,violations,pages:checks.pages.map(p=>({id:p.id,bottom:p.contentBottomMm}))}));
  const output=path.join(root,'output/pdf/topic-pages',`compost-bins-pilot-${units}.pdf`);await fs.mkdir(path.dirname(output),{recursive:true});
  await page.pdf({path:output,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
  await fs.writeFile(path.resolve(path.dirname(copyPath),`summary-${units}.txt`),`DRAFT COMPOST-BIN PILOT\n\n${checks.pages.map(p=>p.text).join('\n\n\n')}`);
  console.log(JSON.stringify({units,output,pages:checks.pages.map(p=>({id:p.id,bottom:p.contentBottomMm,sourceGap:p.sourceGapMm}))}));await page.close();
 }
}finally{await browser.close();}
