import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

// Focused, unit-neutral topic proof. Approved pages and canonical records are read-only.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'docs/publication/topic-pages/nutrient-cycles');
const lib=path.resolve(root,'../hackriculture-resources/summaries/nutrient-cycles');
const output=path.join(root,'output/pdf/nutrient-cycles/nutrient-cycles.pdf');
const copyPath=path.join(lib,'copy.json');
const c=JSON.parse(await fs.readFile(copyPath,'utf8'));
const design=JSON.parse(await fs.readFile(path.join(dir,'COMPOSITION.json'),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const [file,hash] of Object.entries(design.assets))if(sha(await fs.readFile(path.join(root,file)))!==hash)throw Error('Artwork changed: '+file);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const p=t=>'<p>'+esc(t)+'</p>';
const lines=t=>esc(t).replaceAll('|','<br>');
const body=`<article id="nutrient-cycles" class="sheet verso" data-folio="${c.folio}"><div class="page-content">
<header><p class="eyebrow">${esc(c.eyebrow)}</p><h1>${esc(c.heading.main)} <span>${esc(c.heading.accent)}</span></h1><p class="lead">${esc(c.lead)}</p></header>
<section class="carbon-section"><h2>${esc(c.carbon.title)}</h2>${p(c.carbon.text)}
<figure class="carbon-loop" aria-label="Carbon dioxide enters plants; plant remains decay and release carbon dioxide back to the air.">
<svg viewBox="0 0 605 147" aria-hidden="true"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10" fill="#a44007"/></marker></defs><g fill="none" stroke="#a44007" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrow)"><path d="M152 93 H208"/><path d="M351 93 H408"/><path d="M510 35 V15 Q510 8 503 8 H78 Q72 8 72 15 V58"/></g></svg>
<p class="return-label">${esc(c.carbon.returnLabel)}</p>
<div class="cycle-node air-node"><p>${lines(c.carbon.nodes[0])}</p></div>
<div class="cycle-node plant-node"><img src="/images/heroes/richer-a/cabbage.png" alt="Cabbage"><p>${lines(c.carbon.nodes[1])}</p></div>
<div class="cycle-node compost-node"><img src="/docs/publication/topic-pages/techniques-expansion/references/compost-use-approved-2026-10-12/assets/compost-mix-v1.png" alt="Plant trimmings, cardboard and mature compost"><p>${lines(c.carbon.nodes[2])}</p></div></figure>
<aside class="humus"><h2>${esc(c.humus.title)}</h2>${p(c.humus.text)}</aside></section>
<section class="nitrogen"><h2>${esc(c.nitrogen.title)}</h2><div class="nitrogen-copy">${p(c.nitrogen.text)}${p(c.nitrogen.action)}</div><div class="nitrogen-flow">${c.nitrogen.stages.map((s,i)=>(i?'<span class="arrow" aria-hidden="true">→</span>':'')+p(s)).join('')}</div></section>
<aside class="minerals"><h2>${esc(c.minerals.title)}</h2><div class="mineral-columns">${c.minerals.items.map(i=>'<section><h3>'+esc(i.title)+'</h3>'+p(i.text)+'</section>').join('')}</div></aside>
</div><p class="source-note">${esc(c.source)}</p><footer><span>GROWING TECHNIQUES</span><span>${c.folio}</span></footer></article>`;
const html=`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nutrient cycles — The Vegetable Guru</title><link rel="stylesheet" href="/docs/publication/topic-pages/techniques-expansion/references/collection-approved-2026-10-12/draft.css"><link rel="stylesheet" href="/docs/publication/topic-pages/nutrient-cycles/draft.css"></head><body><main>${body}</main></body></html>`;
await fs.writeFile(path.join(dir,'page.html'),html);await fs.mkdir(path.dirname(output),{recursive:true});
const browser=await chromium.launch();
try{
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto('http://127.0.0.1:5173/docs/publication/topic-pages/nutrient-cycles/page.html',{waitUntil:'networkidle'});await page.emulateMedia({media:'print'});
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 const check=await page.evaluate(()=>{
  const mm=96/25.4,rd=x=>Math.round(x*1000)/1000,s=document.querySelector('.sheet'),b=s.getBoundingClientRect(),content=s.querySelector('.page-content').getBoundingClientRect(),source=s.querySelector('.source-note').getBoundingClientRect(),footer=s.querySelector('footer').getBoundingClientRect();
  const blocks=[...s.querySelectorAll('h1,h2,h3,p,img,footer')].map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,text:e.innerText||e.getAttribute('src'),leftMm:rd((r.left-b.left)/mm),rightMm:rd((r.right-b.left)/mm),topMm:rd((r.top-b.top)/mm),bottomMm:rd((r.bottom-b.top)/mm),fontPt:rd(parseFloat(getComputedStyle(e).fontSize)*.75),overflow:e.scrollWidth>e.clientWidth+1};});
  return {folio:Number(s.dataset.folio),text:s.innerText,sourceNoteClearanceMm:rd((source.top-content.bottom)/mm),footerClearanceMm:rd((footer.top-Math.max(source.bottom,content.bottom))/mm),fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),blocks};
 });
 const violations=[];
 for(const b of check.blocks)if(b.leftMm<7.85||b.rightMm>168.15||b.topMm<5||b.bottomMm>233||b.overflow)violations.push(`${b.tag} ${b.text}: unsafe/overflow`);
 if(check.sourceNoteClearanceMm<1)violations.push('Source note clearance '+check.sourceNoteClearanceMm);
 if(check.footerClearanceMm<3)violations.push('Footer clearance '+check.footerClearanceMm);
 const result={status:'Proposed page; visual PDF review pending',units:'Unit-neutral, identical content for both editions',output,copy:copyPath,copySha256:sha(await fs.readFile(copyPath)),errors,violations,...check};
 await fs.writeFile(path.join(dir,'CHECKS.json'),JSON.stringify(result,null,2)+'\n');
 if(errors.length||violations.length||check.images.some(i=>!i.loaded)||check.fonts.some(f=>f.status!=='loaded'))throw Error(JSON.stringify({errors,violations}));
 await page.pdf({path:output,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
 console.log(JSON.stringify({output,sourceNoteClearanceMm:check.sourceNoteClearanceMm,footerClearanceMm:check.footerClearanceMm}));
}finally{await browser.close();}
