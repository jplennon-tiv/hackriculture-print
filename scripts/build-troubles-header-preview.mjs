// Focused opener proof; retained native guide pages are changed separately without reflow.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const dir='docs/publication/troubles-header-refinement',tmp='tmp/pdfs/troubles-header-refinement';
for(const p of [dir,tmp,'output/pdf/troubles-header-refinement'])await fs.mkdir(p,{recursive:true});
const sha=b=>createHash('sha256').update(b).digest('hex');
const inputs={};
for(const p of ['output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf','docs/publication/whole-book-order-preview/section-openers.html','docs/publication/whole-book-order-preview/section-openers.css','docs/publication/vegetable-guru-entry-pages/entry-pages.css'])inputs[p]=sha(await fs.readFile(p));
const copy='Recognise the signs, act to limit the damage, then use the prevention advice to help stop the problem returning.';
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:5173/docs/publication/whole-book-order-preview/section-openers.html');
 await page.emulateMedia({media:'print'});
 await page.evaluate(copy=>{
  for(const s of document.querySelectorAll('.sheet:not(.section-troubles)'))s.remove();
  document.querySelector('.section-intro').textContent=copy;
  document.querySelector('footer').innerHTML='<span>VEGETABLE TROUBLES</span><span>99</span>';
 },copy);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 const dom=await page.evaluate(()=>{
  const sheet=document.querySelector('.sheet'),b=sheet.getBoundingClientRect(),mm=96/25.4;
  const box=e=>{const r=e.getBoundingClientRect();return {left:(r.left-b.left)/mm,top:(r.top-b.top)/mm,right:(r.right-b.left)/mm,bottom:(r.bottom-b.top)/mm};};
  const footerGapMm=box(sheet.querySelector('footer')).top-box(sheet.querySelector('.content')).bottom;
  if(footerGapMm<3)throw Error('Opener footer collision: '+footerGapMm);
  const blocks=[...sheet.querySelectorAll('p,h1,footer')].map(e=>({text:e.textContent,fontPt:parseFloat(getComputedStyle(e).fontSize)*.75,...box(e)}));
  return {folio:99,footerGapMm,blocks,images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:!!i.naturalWidth,...box(i)}))};
 });
 await fs.writeFile(`${dir}/opener.html`,(await page.content()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));
 await page.pdf({path:`${tmp}/opener.pdf`,preferCSSPageSize:true,printBackground:true});
 for(const [p,h]of Object.entries(inputs))if(sha(await fs.readFile(p))!==h)throw Error('Source changed: '+p);
 await fs.writeFile(`${dir}/CHECKS.json`,JSON.stringify({date:'2026-10-30',status:'Author-requested removal of repeated page-level sequence; opener explanation for review',inputs,copy,opener:{html:`${dir}/opener.html`,pdf:`${tmp}/opener.pdf`,...dom},mainBookChanged:false,sharedJsonChanged:false,scope:'Only page-level Recognise → Act → Prevent lines; inline advice labels retained'},null,2)+'\n');
 console.log(JSON.stringify({footerGapMm:dom.footerGapMm,copy}));
}finally{await browser.close();}
