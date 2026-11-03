// Isolated review derivatives; never modifies approved inputs or the main book.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {applyHeaderWidgetTrial} from '../src/print/book/header-widget-trial/layout.mjs';
const root=process.cwd(),base='http://127.0.0.1:5173',dir='docs/publication/soil-acidity-crop-edits',out='output/pdf/soil-acidity/crops';
const sha=b=>createHash('sha256').update(b).digest('hex'),read=async p=>JSON.parse(await fs.readFile(p));
const copy=await read('src/print/book/soil-acidity/crop-edits.json'),plan=await read('docs/publication/contents-update/ASSEMBLY-PROPOSAL.json'),navs=(await read('docs/publication/whole-book-order-preview/integration-2026-10-31/FOOTERS.json')).navigation;
const categoryPath='docs/publication/whole-book-order-preview/integration-2026-10-31/CATEGORY-LABELS.json',category=await read(categoryPath);
const selected=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');
const keys=Object.keys(copy.guides).filter(k=>!selected||selected.includes(k)),units=['imperial','metric'];
const inputs={};for(const key of keys){const p=`../hackriculture-data/vegetables/${key}/${key}.json`;inputs[p]=sha(await fs.readFile(p));}
for(const p of [categoryPath,'scripts/build-soil-acidity-crop-edits.mjs','src/print/book/soil-acidity/crop-edits.json','src/print/book/workingCopy.ts','src/print/book/compact.css','src/print/book/production.css','src/print/book/bookvault.css','src/print/book/renderCompact.ts','src/print/book/header-widget-trial/layout.mjs'])inputs[p]=sha(await fs.readFile(p));
const bundle=await build({entryPoints:['src/print/book/renderCompact.ts'],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
const {prepareCompactBook}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].contents).toString('base64'));
await fs.mkdir(out,{recursive:true});await fs.mkdir(`${dir}/pages`,{recursive:true});
const browser=await chromium.launch(),results=[];
try{
 const page=await browser.newPage({viewport:{width:1000,height:1200}});
 for(const unit of units)for(const key of keys){
  const d=plan.editions[unit].documents.find(d=>d.key===key),slug=d.label.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''),nav=navs.decisions.find(n=>n.key===key);
  const frozen=['asparagus','cabbage','carrot','lettuce'].includes(key)?`docs/publication/reader-edit-pass/guides/${key}-${unit}.html`:null;
  if(frozen){inputs[frozen]=sha(await fs.readFile(frozen));await page.goto(`${base}/${frozen}`,{waitUntil:'networkidle'});}
  else{
   await page.goto(`${base}/print/vegetable/${slug}?units=${unit}`,{waitUntil:'networkidle'});
   await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
   const error=await page.evaluate(()=>document.body.dataset.printError);if(error)throw Error(error);
   await prepareCompactBook(page,base,'vegetable',slug,unit,root,{supplier:'bookvault',startPage:d.startPage});
   await page.evaluate(()=>{for(const leaf of document.querySelectorAll('.book-leaf'))leaf.replaceWith(leaf.querySelector('.sheet'));});
   await page.evaluate(applyHeaderWidgetTrial,{circleGapPx:20,titleGapPx:20});
  }
  await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  // Match the approved current category/header and navigation presentation.
  await page.addStyleTag({content:`@page{size:185mm 240mm;margin:0}body{margin:0}.sheet{position:relative!important;top:0!important;left:0!important}.sheet>header>.eyebrow{display:none!important}.soil-review-category{position:absolute;top:5.8mm;left:var(--inside,17mm);font:900 13.3333px/1 'Nunito Sans';color:var(--deep);letter-spacing:.2px}.sheet.verso .soil-review-category{left:8mm}.sheet.recto .soil-review-category{left:17mm}.soil-review-title{position:absolute;left:17mm;top:9mm;width:138mm}.soil-review-title h1{position:static!important;margin:0!important;white-space:nowrap;letter-spacing:0!important;font-size:38px!important;line-height:1.08!important}.soil-review footer{display:flex;align-items:baseline;gap:3mm;letter-spacing:.7px;font-weight:900;line-height:1.4}.soil-review footer .section-label,.soil-review footer .folio{white-space:nowrap}.soil-review footer .folio{margin-left:auto}.soil-review footer nav{white-space:nowrap;font:800 7.5pt/1.3 'Nunito Sans';letter-spacing:0}.soil-review footer nav .destination{color:#a44007}.soil-review .sheet.verso footer{flex-direction:row}`});
  await page.evaluate(({start,nav,titlePt})=>{
   document.body.classList.add('soil-review');
   const category=document.querySelector('.front header>.eyebrow').textContent;
   const h=document.querySelector('.back h1');h.replaceChildren(document.createTextNode('Growing guide · '));const crop=document.createElement('span');crop.textContent=nav.crop;crop.style.color='var(--deep)';h.append(crop);h.style.setProperty('font-size',titlePt+'pt','important');const title=document.createElement('div');title.className='soil-review-title';title.append(h);document.querySelector('.back').append(title);
   [...document.querySelectorAll('.sheet')].forEach((s,i)=>{
    const cat=document.createElement('div');cat.className='soil-review-category';cat.textContent=category.toUpperCase();s.append(cat);
    const f=s.querySelector('footer');f.replaceChildren();const label=document.createElement('span');label.className='section-label';label.textContent='VEGETABLE GUIDES';f.append(label);
    if(i&&nav.links.length){const n=document.createElement('nav');n.append('See also: ');nav.links.forEach((l,j)=>{if(j)n.append(' · ');const t=document.createElement('span');t.className='destination';t.textContent=l.text;n.append(t);});f.append(n);}
    const folio=document.createElement('span');folio.className='folio';folio.textContent=String(start+i);f.append(folio);
   });
  },{start:d.startPage,nav,titlePt:category.dom.find(r=>r.folio===d.startPage+1).blocks[1].fontPt});
  const baseline=`${out}/${key}-${unit}-before.pdf`;await page.pdf({path:baseline,preferCSSPageSize:true,printBackground:true});
  const check=await page.evaluate(({edits,start})=>{
   const sheets=[...document.querySelectorAll('.sheet')],mm=96/25.4;
   const text=()=>sheets.map(s=>s.innerText);
   const geometry=()=>sheets.map(s=>{const b=s.getBoundingClientRect(),f=s.querySelector('footer').getBoundingClientRect(),blocks=[...s.querySelectorAll(':scope>*')].filter(e=>!e.matches('footer,.soil-review-category,.soil-review-title'));return{bottom:Math.max(...blocks.map(e=>e.getBoundingClientRect().bottom))-b.top,gap:(f.top-Math.max(...blocks.map(e=>e.getBoundingClientRect().bottom)))/mm};});
   const before=text(),beforeGeometry=geometry();
   const changes=edits.map((edit,i)=>{const matches=[...document.querySelectorAll(edit.selector)].filter(e=>e.textContent.includes(edit.before));if(matches.length!==1)throw Error(`Expected exactly one match for ${edit.before}; found ${matches.length}`);const e=matches[0],expected=e.textContent,proposed=expected.replace(edit.before,edit.after),style=getComputedStyle(e);e.textContent=proposed;e.dataset.soilChange=String(i);const b=e.getBoundingClientRect(),s=e.closest('.sheet'),sb=s.getBoundingClientRect();return{...edit,expected,proposed,folio:start+sheets.indexOf(s),fontPt:parseFloat(style.fontSize)*.75,boxMm:[(b.left-sb.left)/mm,(b.top-sb.top)/mm,b.width/mm,b.height/mm]};});
   const afterGeometry=geometry(),violations=[];
   afterGeometry.forEach((g,i)=>{if(g.gap<Math.min(2.9,beforeGeometry[i].gap-.1))violations.push(`Page ${start+i}: footer gap ${g.gap.toFixed(2)} mm (before ${beforeGeometry[i].gap.toFixed(2)})`);});
   return{changes,baselineText:before,text:text(),pages:afterGeometry.map((g,i)=>({folio:start+i,footerGapMm:g.gap,baselineFooterGapMm:beforeGeometry[i].gap})),violations,images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0}))};
  },{edits:copy.guides[key],start:d.startPage});
  if(check.violations.length)throw Error(`${key}/${unit}: ${check.violations.join('; ')}`);
  const html=`${dir}/${key}-${unit}.html`,pdf=`${out}/${key}-${unit}.pdf`;
  await fs.writeFile(html,await page.content());await page.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});
  await page.addStyleTag({content:'[data-soil-change]{background:#fff0ad!important;outline:1px solid #b77b1e;outline-offset:1px}'});
  const highlighted=`${out}/${key}-${unit}-highlighted.pdf`;await page.pdf({path:highlighted,preferCSSPageSize:true,printBackground:true});
  inputs[d.pdf]=sha(await fs.readFile(d.pdf));
  results.push({key,label:d.label,unit,start:d.startPage,sourcePdf:d.pdf,sourceSha256:inputs[d.pdf],sourceHtml:frozen,baseline,pdf,highlighted,html,...check});
  console.log(JSON.stringify({key,unit,changes:check.changes.length,gaps:check.pages.map(p=>+p.footerGapMm.toFixed(1))}));
 }
}finally{await browser.close();}
for(const [p,h] of Object.entries(inputs))if(sha(await fs.readFile(p))!==h)throw Error('Source changed: '+p);
await fs.writeFile(`${dir}/CHECKS${selected?'-'+selected.join('-'):''}.json`,JSON.stringify({date:copy.date,status:copy.status,canonicalRecordsChanged:false,approvedSourcesChanged:false,fullBookChanged:false,inputs,results},null,2)+'\n');
