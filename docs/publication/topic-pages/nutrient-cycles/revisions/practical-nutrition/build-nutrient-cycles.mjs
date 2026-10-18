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
const body=`<article id="nutrient-cycles" class="sheet verso" data-folio="${c.folio}"><div class="page-content">
<header><p class="eyebrow">${esc(c.eyebrow)}</p><h1>${esc(c.heading.main)} <span>${esc(c.heading.accent)}</span></h1><p class="lead">${esc(c.lead)}</p></header>
<section class="nutrients" aria-label="Nutrients and practical gardening activities"><p class="table-note">${esc(c.table.note)}</p>
<table><colgroup><col class="nutrient-col"><col class="benefit-col"><col class="activity-col"></colgroup><thead><tr>${c.table.headings.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')}</tr></thead><tbody>${c.table.rows.map(r=>'<tr><th scope="row">'+(r.symbol?'<span class="element">'+esc(r.symbol)+'</span>':'')+esc(r.name)+'</th><td>'+esc(r.benefit)+'</td><td>'+esc(r.activity)+'</td></tr>').join('')}</tbody></table></section>
<div class="examples">${c.examples.map(e=>'<section class="example '+esc(e.key)+'"><figure><img src="'+esc(e.image)+'" alt="'+esc(e.alt)+'"></figure><div><h2>'+esc(e.title)+'</h2>'+p(e.text)+'</div></section>').join('')}</div>
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
  const blocks=[...s.querySelectorAll('h1,h2,h3,p,img,th,td,footer')].map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,text:e.innerText||e.getAttribute('src'),leftMm:rd((r.left-b.left)/mm),rightMm:rd((r.right-b.left)/mm),topMm:rd((r.top-b.top)/mm),bottomMm:rd((r.bottom-b.top)/mm),fontPt:rd(parseFloat(getComputedStyle(e).fontSize)*.75),overflow:e.scrollWidth>e.clientWidth+1};});
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
