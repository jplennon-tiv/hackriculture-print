import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {topicHeadings} from './lib/book-review-refinements.mjs';

// Focused derivatives only: never runs the source collection builder or writes its copy.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const draftPath=path.join(root,'src/print/book/reader-edit-pass/techniques-copy.json');
const draft=JSON.parse(await fs.readFile(draftPath,'utf8'));
const sourcePath=path.resolve(root,draft.sourceCopy), sourceBytes=await fs.readFile(sourcePath);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
if(sha(sourceBytes)!==draft.sourceCopySha256)throw Error('Approved source copy changed; reconcile derivative before rebuilding.');
const original=JSON.parse(sourceBytes);
const dir=path.join(root,'docs/publication/reader-edit-pass/techniques');
const pdfDir=path.join(root,'output/pdf/reader-edit-pass/techniques');
await fs.mkdir(dir,{recursive:true});await fs.mkdir(pdfDir,{recursive:true});
const base='http://127.0.0.1:5173/docs/publication/topic-pages/techniques-expansion/';
const css=`@page{size:185mm 240mm;margin:0}
@media print{.sheet{margin:0!important}.sheet:last-child{break-after:auto}}
.sheet.unified-topic-heading h1{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:.22em;row-gap:0;font-size:42px;line-height:1.04;margin:2.5mm 0 3mm;color:#173e2c}
.sheet.unified-topic-heading h1 span{display:inline-block;white-space:nowrap;font-size:30px;line-height:1.04;margin:0;color:#a44007}
/* Existing reading type is retained. The replacement example reuses original crop art. */
.rotation .succession-diagram{margin-top:3mm}
.succession-layout{display:grid;grid-template-columns:45mm 1fr;gap:5mm;align-items:center}
.succession-crops{display:grid;grid-template-columns:1fr 5mm 1fr;align-items:center;text-align:center}
.succession-crops img{display:block;width:100%;height:19mm;object-fit:contain}
.succession-crops h3{font-size:17px;margin:.8mm 0 0}
.succession-crops .family{font-size:11px;line-height:1.25;font-weight:800}
.succession-layout>p{font-size:12.6px;line-height:1.36}
.rotation .blocks{margin-top:3mm}
.rotation .families{margin-top:3mm}
.rotation .closing{margin-top:3mm}
/* Temporary highlights affect paint only, not geometry. */
body.show-reader-changes .reader-change{background-color:#fff19a;box-shadow:0 0 0 .6mm #dfb819}
body.show-reader-changes .reader-change td,body.show-reader-changes .reader-change th{background-color:#fff19a}
`;
await fs.writeFile(path.join(dir,'reader-techniques.css'),css);
const browser=await chromium.launch();
const results=[];
try{
 for(const units of ['imperial','metric']){
  const sourceHtmlPath=path.join(root,'docs/publication/topic-pages/techniques-expansion',units+'.html');
  const html=await fs.readFile(sourceHtmlPath,'utf8');
  const page=await browser.newPage({viewport:{width:1000,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.goto(base+units+'.html',{waitUntil:'networkidle'});
  await page.emulateMedia({media:'print'});
  await page.evaluate(({draft,original,topicHeadings,base,css})=>{
   document.querySelectorAll('script').forEach(e=>e.remove());
   const baseTag=document.createElement('base');baseTag.href=base;document.head.prepend(baseTag);
   document.querySelector('link[rel=stylesheet]').href='/'+draft.frozenCss;
   const st=document.createElement('style');st.textContent=css;document.head.append(st);
   const main=document.querySelector('main');
   const selected=draft.pages.map(p=>{
    const s=document.getElementById(p.id);if(!s)throw Error('Missing source sheet '+p.id);
    const before=original.pages.find(x=>x.id===p.id);
    const rep=(sel,oldText,newText,reason)=>{
     const e=s.querySelector(sel);if(!e||e.textContent!==oldText)throw Error('Source mismatch '+p.id+' '+sel);
     e.textContent=newText;e.classList.add('reader-change');e.dataset.change=reason;
    };
    s.dataset.folio=p.printedFolio;s.dataset.changed=String(p.changed);s.classList.toggle('verso',p.printedFolio%2===0);
    const heading=topicHeadings[p.id];if(!heading)throw Error('Missing current heading '+p.id);
    const h=s.querySelector('h1');
    if(h.textContent.trim()!==before.title+before.subtitle)throw Error('Source heading mismatch '+p.id+': '+h.textContent);
    h.replaceChildren(document.createTextNode(heading.lines[0]+' '));
    const span=document.createElement('span');span.textContent=heading.lines[1];h.append(span);
    s.classList.add('unified-topic-heading');s.querySelector('.eyebrow').textContent=heading.eyebrow;
    const foot=s.querySelector('footer');foot.firstElementChild.textContent='GROWING TECHNIQUES';foot.lastElementChild.textContent=String(p.printedFolio);
    if(p.id==='compost-use')rep('.lead',before.lead,p.lead,'D1: suitable waste; remove pet-litter example and absolute claims');
    if(p.id==='sowing'){
     for(const i of [0,1])rep(`.step:nth-child(${i+1}) p`,before.steps[i].text,p.steps[i].text,'A7: explain drill/module in place');
     rep('.footnote',before.footnote,p.footnote,'A7: define station and retain crop-specific methods/depths');
    }
    if(p.id==='greenhouse-no-dig-seasons'){
     for(const i of [0,2])rep(`.season-sequence>div>section:nth-child(${i+1}) p`,before.seasons[i].text,p.seasons[i].text,i===0?'A2: protected sowing versus outdoor planting':'A4: prepare autumn replacements within sowing windows');
    }
    if(p.id==='rotation'){
     const fig=s.querySelector('.diagram');fig.replaceChildren();fig.className='diagram succession-diagram reader-change';fig.dataset.change='O1: replace three-year strip with source-backed within-year example';
     const title=document.createElement('h2');title.textContent=p.diagramTitle;fig.append(title);
     const layout=document.createElement('div');layout.className='succession-layout';fig.append(layout);
     const crops=document.createElement('div');crops.className='succession-crops';layout.append(crops);
     p.succession.crops.forEach((c,i)=>{
      if(i){const arrow=document.createElement('span');arrow.className='arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='→';crops.append(arrow);}
      const cell=document.createElement('div'),img=document.createElement('img'),name=document.createElement('h3'),family=document.createElement('p');
      img.src='/images/heroes/richer-a/'+c.asset;img.alt=c.name;name.textContent=c.name;family.className='family';family.textContent=c.family;cell.append(img,name,family);crops.append(cell);
     });
     const text=document.createElement('p');text.textContent=p.succession.text;layout.append(text);
     rep('.families h2',before.familiesTitle,p.familiesTitle,'A5: table explicitly gives useful examples');
     const tbody=s.querySelector('.families tbody');tbody.replaceChildren();
     p.families.forEach((r,i)=>{
      const tr=document.createElement('tr');
      if(JSON.stringify(r)!==JSON.stringify(before.families[i])){tr.className='reader-change';tr.dataset.change='A5: expand family examples';}
      const th=document.createElement('th'),td=document.createElement('td');th.scope='row';th.textContent=r[0];td.textContent=r[1];tr.append(th,td);tbody.append(tr);
     });
     rep('.source-note',before.source,p.source,'Source attribution for added family examples');
    }
    return s;
   });
   main.replaceChildren(...selected);
  },{draft,original,topicHeadings,base,css});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const check=await page.evaluate(()=>{
   const mm=96/25.4,rd=n=>Math.round(n*1000)/1000;
   return {fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),pages:[...document.querySelectorAll('.sheet')].map(s=>{
    const b=s.getBoundingClientRect(),content=s.querySelector('.page-content').getBoundingClientRect(),footer=s.querySelector('footer').getBoundingClientRect(),source=s.querySelector('.source-note').getBoundingClientRect();
    const blocks=[...s.querySelectorAll('h1,h2,h3,p,th,td,figcaption,footer,img')].map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,text:e.innerText||e.textContent||e.getAttribute('src'),leftMm:rd((r.left-b.left)/mm),rightMm:rd((r.right-b.left)/mm),topMm:rd((r.top-b.top)/mm),bottomMm:rd((r.bottom-b.top)/mm),fontPt:rd(parseFloat(getComputedStyle(e).fontSize)*.75),overflow:e.scrollWidth>e.clientWidth+1};});
    return {folio:Number(s.dataset.folio),id:s.id,changed:s.dataset.changed==='true',sourceNoteClearanceMm:rd((source.top-content.bottom)/mm),footerClearanceMm:rd((footer.top-Math.max(content.bottom,source.bottom))/mm),headingFontPt:rd(parseFloat(getComputedStyle(s.querySelector('h1')).fontSize)*.75),qualifierFontPt:rd(parseFloat(getComputedStyle(s.querySelector('h1 span')).fontSize)*.75),bodyFontPt:rd(parseFloat(getComputedStyle(s.querySelector('.block p,.step p,.season-sequence p,.greenhouse-option p')).fontSize)*.75),blocks,text:s.innerText};
   })};
  });
  const violations=[];
  for(const p of check.pages){
   if(p.footerClearanceMm<3)violations.push(`${p.folio}: footer gap ${p.footerClearanceMm}`);
   if(p.sourceNoteClearanceMm<1)violations.push(`${p.folio}: source gap ${p.sourceNoteClearanceMm}`);
   const left=p.folio%2===0?8:17,right=p.folio%2===0?168:177;
   if(p.bodyFontPt!==9.45||p.headingFontPt!==31.5||p.qualifierFontPt!==22.5)violations.push(`${p.folio}: changed reading/header type size`);
   for(const b of p.blocks)if(b.leftMm<left-.15||b.rightMm>right+.15||b.topMm<5||b.bottomMm>233||b.overflow)violations.push(`${p.folio}: unsafe ${b.tag}: ${b.text.slice(0,60)}`);
  }
  results.push({units,sourceHtml:sourceHtmlPath,sourceHtmlSha256:sha(html),errors,violations,...check});
  await fs.writeFile(path.join(dir,'CHECKS.json'),JSON.stringify({status:'Authorised edits for review; actual PDF inspection recorded separately',sourceCopy:draft.sourceCopy,sourceCopySha256:draft.sourceCopySha256,results},null,2)+'\n');
  await fs.writeFile(path.join(dir,units+'.html'),await page.content());
  if(errors.length||violations.length||check.images.some(x=>!x.loaded)||check.fonts.some(x=>x.status!=='loaded'))throw Error(JSON.stringify({units,errors,violations}));
  for(const mode of ['clean','highlighted']){
   await page.evaluate(mode=>document.body.classList.toggle('show-reader-changes',mode==='highlighted'),mode);
   const output=path.join(pdfDir,`techniques-${units}-${mode}.pdf`);
   await page.pdf({path:output,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
   console.log(JSON.stringify({units,mode,output,folios:check.pages.map(p=>p.folio)}));
  }
  await page.close();
 }
}finally{await browser.close();}
if(sha(await fs.readFile(sourcePath))!==draft.sourceCopySha256)throw Error('Source changed during proof generation');
