import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

// Focused proposed section. Approved sources and the full-book assembly are read-only.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const research=path.resolve(root,'../hackriculture-resources/summaries/crop-rotation-planning');
const dir=path.join(root,'docs/publication/topic-pages/crop-rotation-planning');
const pdfDir=path.join(root,'output/pdf/crop-rotation-planning');
const sourceCss='docs/publication/topic-pages/techniques-expansion/references/collection-approved-2026-10-12/draft.css';
const copy=JSON.parse(await fs.readFile(path.join(research,'copy.json'),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const s of Object.values(copy.sources))if(sha(await fs.readFile(s.path))!==s.sha256)throw Error('Source changed: '+s.path);
const reader=JSON.parse(await fs.readFile(copy.sources.readerRotation.path,'utf8'));
const successionSource=reader.pages.find(p=>p.id==='rotation');
const successionPage=copy.pages.find(p=>p.succession);
// John requested a new title/nitrogen paragraph on 18 October; retain the exact timing and crop identities.
const successionTiming=successionSource.succession.text.split(' Choose a suitable variety')[0];
if(JSON.stringify(successionPage.succession.crops)!==JSON.stringify(successionSource.succession.crops)||!successionPage.succession.text.startsWith(successionTiming)||!successionPage.succession.text.endsWith('See Kale, pages 40–41.')||successionPage.successionTitle!=='One bed, two complementary crops in the same year')throw Error('Succession timing, crops, reference or requested title changed');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const p=t=>'<p>'+esc(t)+'</p>';
const block=b=>'<section><h2>'+esc(b.title)+'</h2>'+p(b.text)+'</section>';
const groups=['Peas & beans','Brassicas','Potatoes','Onions & roots'];
const threeYear=d=>`<figure class="diagram example-panel three-year-panel"><figcaption><h2>${esc(d.threeYear.title)}</h2>${p(d.threeYear.caption)}</figcaption><div class="rotation-row">${d.threeYear.crops.map((c,i)=>(i?'<span class="arrow" aria-hidden="true">→</span>':'')+`<div><p class="year">${esc(c.year)}</p><img src="/images/heroes/richer-a/${esc(c.asset)}" alt="${esc(c.crop)}"><h3>${esc(c.crop)}</h3></div>`).join('')}</div></figure>`;
const succession=d=>`<figure class="diagram example-panel succession-diagram"><h2>${esc(d.successionTitle)}</h2><div class="succession-layout"><div class="succession-crops">${d.succession.crops.map((c,i)=>(i?'<span class="arrow" aria-hidden="true">→</span>':'')+`<div><img src="/images/heroes/richer-a/${esc(c.asset)}" alt="${esc(c.name)}"><h3>${esc(c.name)}</h3><p class="family">${esc(c.family)}</p></div>`).join('')}</div>${p(d.succession.text)}</div></figure>`;
function body(d,u){
 if(d.id==='rotation-plans')return `${succession(d)}
 <section class="four-year-section"><h2>${esc(d.fourBlock.title)}</h2>${p(d.fourBlock.intro)}<table class="four-block"><thead><tr>${d.fourBlock.headers.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')}</tr></thead><tbody>${d.fourBlock.rows.map(r=>'<tr><th scope="row">'+esc(r[0])+'</th>'+r.slice(1).map(t=>'<td class="group-'+groups.indexOf(t)+'">'+esc(t)+'</td>').join('')+'</tr>').join('')}</tbody></table>${p(d.fourBlock.reading)}</section>
 <div class="year-notes">${d.notes.map(block).join('')}</div>
 <aside class="alternative-panel"><h2>${esc(d.alternative.title)}</h2>${p(d.alternative.text)}</aside>`;
 if(d.id==='rotation-basics')return `${threeYear(d)}
 <div class="blocks two"><div class="block"><h2>${esc(d.record.title)}</h2>${p(d.record.text)}</div><div class="block"><h2>${esc(d.cooperation.title)}</h2>${p(d.cooperation.text)}</div></div>
 <section class="families"><h2>${esc(d.familiesTitle)}</h2><table><tbody>${d.families.map(r=>'<tr><th scope="row">'+esc(r[0])+'</th><td>'+esc(r[1])+'</td></tr>').join('')}</tbody></table></section>
 <section class="closing"><h2>${esc(d.closing.title)}</h2>${p(d.closing.text)}</section>`;
 throw Error('Unexpected page '+d.id);
}
function sheet(d,u){return `<article id="${d.id}" class="sheet planning ${d.folio%2===0?'verso':''}" data-folio="${d.folio}"><div class="page-content"><header><p class="eyebrow">Growing Techniques - Crop rotation &amp; planning</p><h1>${esc(copy.heading.main)} <span>${esc(copy.heading.accent)}</span></h1>${d.lead?'<p class="lead">'+esc(d.lead)+'</p>':''}</header>${body(d,u)}</div><p class="source-note">${esc(d.source)}</p><footer><span>GROWING TECHNIQUES</span><span>${d.folio}</span></footer></article>`;}
await fs.mkdir(pdfDir,{recursive:true});
const browser=await chromium.launch(),results=[];
try{
 for(const units of ['imperial','metric']){
  const page=await browser.newPage({viewport:{width:1000,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  const html=`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Crop rotation &amp; planning — ${units} proof</title><base href="http://127.0.0.1:5173/docs/publication/topic-pages/techniques-expansion/"><link rel="stylesheet" href="/${sourceCss}"><link rel="stylesheet" href="/docs/publication/topic-pages/crop-rotation-planning/draft.css"></head><body><main>${copy.pages.map(d=>sheet(d,units)).join('')}</main></body></html>`;
  await fs.writeFile(path.join(dir,units+'.html'),html);
  await page.goto(`http://127.0.0.1:5173/docs/publication/topic-pages/crop-rotation-planning/${units}.html`,{waitUntil:'networkidle'});
  await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const check=await page.evaluate(()=>{
   const mm=96/25.4,rd=n=>Math.round(n*1000)/1000;
   return {fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),pages:[...document.querySelectorAll('.sheet')].map(s=>{
    const b=s.getBoundingClientRect(),content=s.querySelector('.page-content').getBoundingClientRect(),footer=s.querySelector('footer').getBoundingClientRect(),source=s.querySelector('.source-note').getBoundingClientRect();
    const blocks=[...s.querySelectorAll('h1,h2,h3,p,th,td,figcaption,footer,img')].map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,text:e.innerText||e.textContent||e.getAttribute('src'),leftMm:rd((r.left-b.left)/mm),rightMm:rd((r.right-b.left)/mm),topMm:rd((r.top-b.top)/mm),bottomMm:rd((r.bottom-b.top)/mm),fontPt:rd(parseFloat(getComputedStyle(e).fontSize)*.75),overflow:e.scrollWidth>e.clientWidth+1};});
    return {folio:Number(s.dataset.folio),id:s.id,context:!!s.dataset.context,sourceNoteClearanceMm:rd((source.top-content.bottom)/mm),footerClearanceMm:rd((footer.top-Math.max(content.bottom,source.bottom))/mm),headingFontPt:rd(parseFloat(getComputedStyle(s.querySelector('h1')).fontSize)*.75),qualifierFontPt:rd(parseFloat(getComputedStyle(s.querySelector('h1 span')).fontSize)*.75),blocks,text:s.innerText};
   })};
  });
  const violations=[];
  for(const s of check.pages){
   if(s.footerClearanceMm<3)violations.push(`${s.folio}: footer gap ${s.footerClearanceMm}`);
   if(s.sourceNoteClearanceMm<1)violations.push(`${s.folio}: source gap ${s.sourceNoteClearanceMm}`);
   const left=s.folio%2===0?8:17,right=s.folio%2===0?168:177;
   if(s.headingFontPt!==31.5||s.qualifierFontPt!==22.5)violations.push(`${s.folio}: heading type changed`);
   for(const b of s.blocks)if(b.leftMm<left-.15||b.rightMm>right+.15||b.topMm<5||b.bottomMm>233||b.overflow)violations.push(`${s.folio}: unsafe ${b.tag}: ${b.text.slice(0,60)}`);
  }
  const output=path.join(pdfDir,`crop-rotation-planning-${units}.pdf`);
  results.push({units,output,errors,violations,...check});
  await fs.writeFile(path.join(dir,'CHECKS.json'),JSON.stringify({status:'Proposed section; actual PDF review recorded separately',copy:path.join(research,'copy.json'),copySha256:sha(await fs.readFile(path.join(research,'copy.json'))),sourceCss,results},null,2)+'\n');
  if(errors.length||violations.length||check.images.some(x=>!x.loaded)||check.fonts.some(x=>x.status!=='loaded'))throw Error(JSON.stringify({units,errors,violations}));
  await page.pdf({path:output,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
  console.log(JSON.stringify({units,output,folios:check.pages.map(s=>s.folio),sourceClearances:check.pages.map(s=>s.sourceNoteClearanceMm)}));
  await page.close();
 }
}finally{await browser.close();}
for(const s of Object.values(copy.sources))if(sha(await fs.readFile(s.path))!==s.sha256)throw Error('Source changed during build');
