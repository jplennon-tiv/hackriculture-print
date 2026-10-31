// A single, unit-neutral page-9 proposal, derived from the accepted reader proof.
// Does not alter shared copy, approved sources or the main book.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {readRecord} from '../../hackriculture-data/lib/records.mjs';

const dir='docs/publication/guides-intro-detail';
const out='output/pdf/guides-intro-detail';
const tmp='tmp/pdfs/guides-intro-detail';
const source='docs/publication/reader-edit-pass/navigation/guide-key-imperial-clean.html';
const metricSource=source.replace('imperial','metric');
const book='output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf';
const sha=b=>createHash('sha256').update(b).digest('hex');
const paragraph='Bright: usual months for the UK; the US equivalent is zones 8 to 9. Muted: options that may need suitable varieties, protection, milder conditions or indoor starts. For planting out, read Sowing & planting and adjust for local conditions.';
const examples=[{key:'radish',label:'Radish',rating:1,name:'Easy'},{key:'tomato_outdoor',label:'Tomato',rating:3,name:'Medium'}];
const heroes=JSON.parse(await fs.readFile('src/print/heroArtwork.json','utf8'));
const inheritedCss=['docs/publication/combined-guides-opening/opening.css','docs/publication/guide-key/guide-key.css','docs/publication/vegetable-guru-entry-pages/entry-pages.css'];
const sourceFiles=[source,metricSource,book,'src/print/heroArtwork.json',...inheritedCss,...examples.flatMap(x=>['public'+heroes[x.key].src,`../hackriculture-data/vegetables/${x.key}/${x.key}.json`])];
const inputs=Object.fromEntries(await Promise.all(sourceFiles.map(async p=>[p,sha(await fs.readFile(p))])));
for(const e of examples){e.src=heroes[e.key].src;e.canonicalRating=readRecord('vegetables',e.key).difficulty;if(e.rating!==e.canonicalRating)throw Error('Example rating differs from crop: '+e.key);}
for(const d of [dir,out,tmp])await fs.mkdir(d,{recursive:true});
if(await fs.access(`${dir}/APPROVAL.json`).then(()=>true,()=>false))throw Error('Accepted source is frozen; use a new revision path.');
const browser=await chromium.launch();
try {
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.emulateMedia({media:'print'});
 const ready=async()=>page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 await page.goto(`http://127.0.0.1:5173/${source}`);await ready();
 const baseline=await page.evaluate(()=>({body:document.body.innerHTML,text:document.body.innerText,images:[...document.images].map(i=>i.getAttribute('src')),calendar:document.querySelector('.native-calendar').outerHTML,needs:document.querySelector('.native-needs').outerHTML,copy:[...document.querySelectorAll('.scale-copy>p')].map(p=>p.textContent),header:document.querySelector('.opening-title').outerHTML}));
 await page.goto(`http://127.0.0.1:5173/${metricSource}`);await ready();
 const metricText=await page.locator('body').innerText();
 if(metricText!==baseline.text)throw Error('Source editions differ; review both separately.');
 await page.goto(`http://127.0.0.1:5173/${source}`);await ready();
 await page.evaluate(({paragraph,examples,dir})=>{
  document.title='Vegetable Guides · three-panel intro proposal';
  document.querySelector('link[rel="stylesheet"]').href='/'+dir+'/proposal.css';
  document.querySelector('.key-calendar>p').textContent=paragraph;
  document.querySelectorAll('.key-climate h3').forEach((h,i)=>h.textContent=['Normal planting','Extended season'][i]);
  document.querySelectorAll('.how-panel>section').forEach(s=>s.classList.add('guide-panel'));
  const oldBadge=document.querySelector('.native-difficulty');
  const art=document.querySelector('.difficulty .scale-art');
  const figures=examples.map(e=>{
   const f=document.createElement('figure');f.className='difficulty-example';f.dataset.crop=e.key;f.setAttribute('aria-label',`${e.label}: ${e.name}, ${e.rating} out of 5`);
   const badge=oldBadge.cloneNode(true);badge.querySelector('strong').textContent=e.name;badge.querySelector('.difficulty-rating>b').textContent=e.rating+'/5';badge.querySelector('.scale').setAttribute('aria-label',e.rating+' out of 5');badge.querySelectorAll('.scale i').forEach((dot,i)=>dot.classList.toggle('on',i<e.rating));
   const img=document.createElement('img');img.src=e.src;img.alt=e.label;
   f.append(badge,img);return f;
  });
  art.replaceChildren(...figures);
  // Retain the original Low demand / High demand captions, as John requested.
  document.querySelectorAll('.reader-change').forEach(s=>s.classList.remove('reader-change'));
 },{paragraph,examples,dir});
 await ready();
 const html='<!DOCTYPE html>'+await page.locator('html').evaluate(e=>e.outerHTML);
 await fs.writeFile(`${dir}/opening.html`,html);
 await page.goto(`http://127.0.0.1:5173/${dir}/opening.html`);await ready();
 const checks=await page.evaluate(({baseline,paragraph})=>{
  const s=document.querySelector('.sheet'),r=s.getBoundingClientRect(),mm=96/25.4;
  const box=e=>{const b=e.getBoundingClientRect();return {left:(b.left-r.left)/mm,top:(b.top-r.top)/mm,right:(b.right-r.left)/mm,bottom:(b.bottom-r.top)/mm};};
  const blocks=[...s.querySelectorAll('h1,h2,h3,p,figcaption,.native-difficulty,figure.difficulty-example')].map(e=>({text:e.textContent,...box(e),overflow:e.scrollWidth>e.clientWidth+1}));
  const panels=[...s.querySelectorAll('.guide-panel')].map(box),footer=box(s.querySelector('footer'));
  const preserved={calendar:s.querySelector('.native-calendar').outerHTML===baseline.calendar,needs:s.querySelector('.native-needs').outerHTML===baseline.needs,otherCopy:JSON.stringify([...s.querySelectorAll('.scale-copy>p')].map(p=>p.textContent))===JSON.stringify(baseline.copy),header:s.querySelector('.opening-title').outerHTML===baseline.header};
  const fonts=[...s.querySelectorAll('.key-calendar>p,.scale-copy>p')].map(p=>parseFloat(getComputedStyle(p).fontSize)*.75);
  if(Object.values(preserved).some(v=>!v)||fonts.some(n=>n!==10.5))throw Error('Retained content or body size changed');
  if(s.querySelector('.key-calendar>p').textContent!==paragraph)throw Error('Requested paragraph differs');
  for(const dot of s.querySelectorAll('.native-needs .scale i')){
   const bounds=dot.getBoundingClientRect();
   if(Math.abs(bounds.width-10)>.1||Math.abs(bounds.height-10)>.1)throw Error('Core Needs scale square distorted');
  }
  return {blocks,panels,footerGapMm:footer.top-panels.at(-1).bottom,bodyPt:fonts,preserved,images:[...document.images].map(i=>({src:i.getAttribute('src'),alt:i.alt,loaded:i.complete&&i.naturalWidth>0,...box(i)})),difficulty:[...s.querySelectorAll('.difficulty-example')].map(e=>({key:e.dataset.crop,rating:e.querySelector('.difficulty-rating>b').textContent,on:e.querySelectorAll('.scale i.on').length})),calendarHeaders:[...s.querySelectorAll('.key-climate h3')].map(e=>e.textContent),coreEndpointLabels:[...s.querySelectorAll('.water .endpoint figcaption')].map(e=>e.textContent),pageText:s.innerText};
 },{baseline,paragraph});
 const overflow=checks.blocks.filter(b=>b.overflow||b.left<16.9||b.right>177.2||b.bottom>226);
 checks.fitPassed=!overflow.length&&checks.footerGapMm>=3;checks.overflow=overflow;
 await page.pdf({path:`${out}/vegetable-guides-intro.pdf`,preferCSSPageSize:true,printBackground:true});
 if(errors.length)throw Error(errors.join('\n'));
 for(const [p,h] of Object.entries(inputs))if(sha(await fs.readFile(p))!==h)throw Error('Source changed: '+p);
 const assets=Object.fromEntries(await Promise.all(checks.images.map(async i=>{const p=i.src.startsWith('/images/')?'public'+i.src:i.src.slice(1);return [p,sha(await fs.readFile(p))];})));
 const report={date:'2026-10-31',status:'proposal for John’s review',pdf:`${out}/vegetable-guides-intro.pdf`,pdfSha256:sha(await fs.readFile(`${out}/vegetable-guides-intro.pdf`)),inputs,assets,examples,sourceEditionsIdentical:true,unitScope:'Unit-neutral page; both source editions have identical visible content. No dimensions or unit-specific advice.',mainBookUnchanged:true,sharedCopyUnchanged:true,checks};
 await fs.writeFile(`${dir}/CHECKS.json`,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({fitPassed:checks.fitPassed,footerGapMm:checks.footerGapMm,panels:checks.panels,overflow},null,2));
} finally {await browser.close();}
