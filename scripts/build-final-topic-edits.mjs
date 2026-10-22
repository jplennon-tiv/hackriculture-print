import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {topicHeadings} from './lib/book-review-refinements.mjs';

// Bounded copy derivatives: source collections and frozen approvals stay intact.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir='docs/publication/final-text-edits', pdfDir='output/pdf/final-text-edits';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFile(path.join(root,p));
const pageId=process.argv.find(a=>a.startsWith('--page='))?.slice(7)||'organic';
if(!/^[a-z][a-z-]*$/.test(pageId))throw Error('Invalid page id');
const draftPath=`src/print/book/final-text-edits/${pageId}.json`;
const draft=JSON.parse(await read(draftPath));
const inputs={[draftPath]:sha(await read(draftPath))};
for(const [p,h] of [[draft.sourceCopy,draft.sourceCopySha256],[draft.sourceCss,draft.sourceCssSha256]]){
  if(sha(await read(p))!==h)throw Error('Frozen source changed: '+p);
  inputs[p]=h;
}
const before=JSON.parse(await read(draft.sourceCopy)).pages.find(p=>p.id===draft.id);
const heading=topicHeadings[draft.id];
const css=`@media print{.sheet{margin:0!important}}
.sheet.unified-topic-heading h1{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:.22em;row-gap:0;font-size:42px;line-height:1.04;margin:2.5mm 0 3mm;color:#173e2c}
.sheet.unified-topic-heading h1 span{display:inline-block;white-space:nowrap;font-size:30px;line-height:1.04;margin:0;color:#a44007}`;
await fs.mkdir(path.join(root,dir),{recursive:true});await fs.mkdir(path.join(root,pdfDir),{recursive:true});
const browser=await chromium.launch();const proofs=[];let referenceText;
try{
  for(const units of ['imperial','metric']){
    const sourceHtml=`docs/publication/topic-pages/techniques-expansion/${units}.html`;
    inputs[sourceHtml]=sha(await read(sourceHtml));
    const page=await browser.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
    await page.goto('http://127.0.0.1:5173/'+sourceHtml,{waitUntil:'networkidle'});
    await page.emulateMedia({media:'print'});
    const preserved=await page.evaluate(({draft,before,heading,css})=>{
      document.querySelectorAll('script').forEach(e=>e.remove());
      const s=document.getElementById(draft.id);if(!s)throw Error('Missing source page');
      document.querySelector('main').replaceChildren(s);
      document.querySelector('link[rel=stylesheet]').href='/'+draft.sourceCss;
      const style=document.createElement('style');style.textContent=css;document.head.append(style);
      const replace=(selector,expected,value)=>{const e=s.querySelector(selector);if(e.textContent!==expected)throw Error('Source mismatch: '+selector);e.textContent=value;};
      if(draft.lead!==undefined)replace('.lead',before.lead,draft.lead);
      (draft.blocks||[]).forEach((block,i)=>{
        const sel=`.block:nth-child(${i+1})`;
        if(s.querySelector(sel+' h2').textContent!==block.title||before.blocks[i].title!==block.title)throw Error('Heading mismatch');
        replace(sel+' p',before.blocks[i].text,block.text);
      });
      if(s.querySelector('.closing h2').textContent!==before.closing.title||s.querySelector('.closing p').textContent!==before.closing.text)throw Error('Closing changed');
      if(draft.closing!==undefined)replace('.closing p',before.closing.text,draft.closing);
      if(before.diagramCaption!==undefined&&s.querySelector('figcaption').textContent!==before.diagramCaption)throw Error('Caption changed');
      s.dataset.folio=draft.folio;s.classList.toggle('verso',draft.folio%2===0);s.classList.add('unified-topic-heading');
      s.querySelector('.eyebrow').textContent=heading.eyebrow;
      const h=s.querySelector('h1');h.replaceChildren(document.createTextNode(heading.lines[0]+' '));
      const span=document.createElement('span');span.textContent=heading.lines[1];h.append(span);
      const f=s.querySelector('footer');f.firstElementChild.textContent='GROWING TECHNIQUES';f.lastElementChild.textContent=draft.folio;
      for(const image of s.querySelectorAll('img'))image.setAttribute('src',image.src);
      return {diagram:s.querySelector('.diagram')?.outerHTML||null,closing:s.querySelector('.closing').outerHTML,images:[...s.querySelectorAll('img')].map(i=>({src:i.src,alt:i.alt}))};
    },{draft,before,heading,css});
    await page.waitForLoadState('networkidle');
    await page.evaluate(async()=>{await Promise.all([document.fonts.load('42px Lilita'),document.fonts.load('12.6px Nunito')]);await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
    const check=await page.evaluate(()=>{
      const s=document.querySelector('.sheet'),b=s.getBoundingClientRect(),mm=96/25.4;
      const c=s.querySelector('.page-content').getBoundingClientRect(),source=s.querySelector('.source-note').getBoundingClientRect(),f=s.querySelector('footer').getBoundingClientRect();
      const pt=selector=>parseFloat(getComputedStyle(s.querySelector(selector)).fontSize)*.75;
      return {text:s.innerText,fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),sourceGapMm:(source.top-c.bottom)/mm,footerGapMm:(f.top-Math.max(source.bottom,c.bottom))/mm,bodyFontPt:pt('.block p'),headingFontPt:pt('h1'),qualifierFontPt:pt('h1 span'),blocks:[...s.querySelectorAll('h1,h2,p,figcaption,footer,svg')].map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,leftMm:(r.left-b.left)/mm,rightMm:(r.right-b.left)/mm,topMm:(r.top-b.top)/mm,bottomMm:(r.bottom-b.top)/mm,overflow:e.scrollWidth>e.clientWidth+1};})};
    });
    const violations=[];
    if(check.sourceGapMm<1||check.footerGapMm<3)violations.push('Insufficient footer/source clearance');
    if(check.bodyFontPt!==9.45||check.headingFontPt!==31.5||check.qualifierFontPt!==22.5)violations.push('Type size changed');
    const left=draft.folio%2?17:8;
    for(const b of check.blocks)if(b.leftMm<left-.15||b.rightMm>left+160+.15||b.topMm<5||b.bottomMm>233||b.overflow)violations.push('Unsafe/overflowing block: '+b.text.slice(0,60));
    if(errors.length||violations.length||check.fonts.some(f=>f.status!=='loaded'))throw Error(JSON.stringify({errors,violations,check}));
    if(referenceText&&referenceText!==check.text)throw Error('Unit editions differ on this measurement-free page');
    referenceText=check.text;
    const html=`${dir}/${draft.id}-${units}.html`,pdf=`${pdfDir}/${draft.id}-${units}.pdf`;
    await fs.writeFile(path.join(root,html),await page.content());
    await page.pdf({path:path.join(root,pdf),preferCSSPageSize:true,printBackground:true});
    proofs.push({units,pdf,sha256:sha(await read(pdf)),sourcePage:1,physicalPages:1,sourcePdfPages:1,html,htmlSha256:sha(await read(html)),preserved,check,errors,violations});
    await page.close();
  }
}finally{await browser.close();}
for(const [p,h] of Object.entries(inputs))if(sha(await read(p))!==h)throw Error('Source changed during build: '+p);
const existing=JSON.parse(await read(dir+'/MANIFEST.json'));
const edit={source:draft.source,folio:draft.folio,id:draft.id,copy:draftPath,proofs};
const manifest={...existing,date:draft.date,status:'Author-requested copy derivatives; see individual approval records',inputs:{...existing.inputs,...inputs},edits:[...existing.edits.filter(e=>e.source!==draft.source),edit].sort((a,b)=>a.folio-b.folio),canonicalDataChanged:false,unitTextIdentical:true};
await fs.writeFile(path.join(root,dir,'MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(proofs.map(p=>({units:p.units,pdf:p.pdf,bodyFontPt:p.check.bodyFontPt,sourceGapMm:p.check.sourceGapMm,footerGapMm:p.check.footerGapMm}))));
