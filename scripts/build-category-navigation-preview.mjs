// Focused category-name/key proposal: only the new opening and transparent labels.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const dir='docs/publication/category-navigation-preview',tmp='tmp/pdfs/category-navigation-preview';
const source='docs/publication/reader-edit-pass/navigation/guide-key-imperial-clean.html';
const book='output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf';
const sha=b=>createHash('sha256').update(b).digest('hex');
const themes=JSON.parse(await fs.readFile('src/print/familyThemes.json'));
const guard=Object.fromEntries(await Promise.all([source,book,'src/print/familyThemes.json'].map(async p=>[p,sha(await fs.readFile(p))])));
for(const p of [dir,tmp,'output/pdf/category-navigation-preview'])await fs.mkdir(p,{recursive:true});
let html=await fs.readFile(source,'utf8');
html=html.replace('/docs/publication/combined-guides-opening/opening.css',`/${dir}/proposal.css`);
const key=`<section class="category-key"><h2>Category colours</h2><div class="category-colours">${themes.map(t=>`<div style="--deep:${t.deep}"><i aria-hidden="true"></i><span>${t.group.replaceAll('&','&amp;')}</span></div>`).join('')}</div></section>`;
html=html.replace('</header>','</header>'+key);
await fs.writeFile(`${dir}/opening.html`,html);
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:5173/${source}`);await page.emulateMedia({media:'print'});await page.evaluate(()=>document.fonts.ready);
 const original=await page.evaluate(()=>({paragraphs:[...document.querySelectorAll('.key-calendar>p,.scale-copy>p')].map(p=>p.textContent),widgets:[...document.querySelectorAll('.native-calendar,.native-difficulty,.native-needs')].map(p=>p.outerHTML),images:[...document.images].map(i=>i.getAttribute('src'))}));
 await page.goto(`http://127.0.0.1:5173/${dir}/opening.html`);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 const checks=await page.evaluate(original=>{
  const s=document.querySelector('.sheet'),r=s.getBoundingClientRect(),mm=96/25.4;
  const box=e=>{const b=e.getBoundingClientRect();return {left:(b.left-r.left)/mm,top:(b.top-r.top)/mm,right:(b.right-r.left)/mm,bottom:(b.bottom-r.top)/mm};};
  const paragraphs=[...s.querySelectorAll('.key-calendar>p,.scale-copy>p')];
  const now={paragraphs:paragraphs.map(p=>p.textContent),widgets:[...s.querySelectorAll('.native-calendar,.native-difficulty,.native-needs')].map(p=>p.outerHTML),images:[...document.images].map(i=>i.getAttribute('src'))};
  if(JSON.stringify(original)!==JSON.stringify(now))throw Error('Approved explanation, widget or illustration changed');
  if(paragraphs.some(p=>parseFloat(getComputedStyle(p).fontSize)!==14))throw Error('Body text shrunk');
  const blocks=[...s.querySelectorAll('h1,h2,h3,p,figcaption,.category-colours span')].map(e=>({text:e.textContent,...box(e),overflow:e.scrollWidth>e.clientWidth+1}));
  if(blocks.some(b=>b.overflow||b.left<16.9||b.right>177.2||b.bottom>226))throw Error('Text out of bounds: '+JSON.stringify(blocks.filter(b=>b.overflow||b.left<16.9||b.right>177.2||b.bottom>226)));
  const footer=box(s.querySelector('footer')),panel=box(s.querySelector('.how-panel'));
  if(footer.top-panel.bottom<3)throw Error('Panel too close to footer');
  return {blocks,footerGapMm:footer.top-panel.bottom,bodyPt:10.5,images:now.images.length,categoryLabels:[...s.querySelectorAll('.category-colours span')].map(e=>e.textContent),approvedParagraphs:now.paragraphs,nativeExamplesPreserved:true};
 },original);
 await page.pdf({path:`${tmp}/opening.pdf`,preferCSSPageSize:true,printBackground:true});
 const rows=[{folio:36,group:'Root Crops',id:'roots',title:'Carrot'},{folio:37,group:'Root Crops',id:'roots',title:'Carrot'},{folio:58,group:'Brassicas',id:'brassicas',title:'Kale'},{folio:59,group:'Brassicas',id:'brassicas',title:'Kale'}];
 for(const row of rows){
  const theme=themes.find(t=>t.id===row.id),left=row.folio%2?17:8;
  const heading=row.folio%2?`<h1>Growing guide · <span>${row.title}</span></h1>`:'';
  const labelHtml=`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/docs/publication/vegetable-guru-entry-pages/entry-pages.css"><style>@page{size:185mm 240mm;margin:0}html,body{margin:0;background:transparent;width:185mm;height:240mm}.label{position:absolute;left:${left}mm;top:5.8mm;font:900 13.3333px/1 Nunito;color:${theme.deep};letter-spacing:.2px}h1{position:absolute;left:17mm;top:9mm;margin:0;font:400 38px/1.08 Lilita;letter-spacing:0;color:${theme.ink};white-space:nowrap}h1 span{color:${theme.deep}}</style></head><body><div class="label">${row.group.toUpperCase().replaceAll('&','&amp;')}</div>${heading}</body></html>`;
  await fs.writeFile(`${dir}/label-${row.folio}.html`,labelHtml);
  await page.goto(`http://127.0.0.1:5173/${dir}/label-${row.folio}.html`);await page.evaluate(()=>document.fonts.ready);
  await page.pdf({path:`${tmp}/label-${row.folio}.pdf`,preferCSSPageSize:true,printBackground:true,omitBackground:true});
 }
 if(errors.length)throw Error(errors.join('\n'));
 for(const [p,h] of Object.entries(guard))if(sha(await fs.readFile(p))!==h)throw Error('Source changed: '+p);
 await fs.writeFile(`${dir}/CHECKS.json`,JSON.stringify({date:'2026-10-30',status:'Separate proposal; not integrated or approved',inputs:guard,opening:checks,guideSamples:rows,unit:'imperial saved guides; unit-neutral opening and label treatment',fullBookChanged:false,sharedJsonChanged:false},null,2)+'\n');
 console.log(JSON.stringify({footerGapMm:checks.footerGapMm,categories:checks.categoryLabels.length,images:checks.images}));
}finally{await browser.close();}
