import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {applyTwoPageTrial as applyTomato} from '../src/print/book/tomato-two-page-trial/layout.mjs';
import {applyTwoPageTrial as applyCarrot} from '../src/print/book/two-page-trial/layout.mjs';
import {applyHeaderWidgetTrial} from '../src/print/book/header-widget-trial/layout.mjs';

const root=process.cwd(),base='http://127.0.0.1:5173';
const dir='docs/publication/reader-edit-pass/guides',out='output/pdf/reader-edit-pass/guides';
const sourceOnly=process.argv.includes('--source');
const selected=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');
const units=process.argv.includes('--imperial')?['imperial']:['imperial','metric'];
const keys=['carrot','celeriac','cabbage','lettuce','leek','marrow_courgette','tomato_greenhouse','asparagus','onion_and_leek_troubles'].filter(k=>!selected||selected.includes(k));
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse(await fs.readFile(p));
const plan=await read('docs/publication/contents-update/ASSEMBLY-PROPOSAL.json');
const navigation=await read('docs/publication/whole-book-order-preview/NAVIGATION.json');
const tomato=await read('src/print/book/tomato-two-page-trial/copy.json');
const carrot=await read('src/print/book/two-page-trial/copy.json');
const trialCss={tomato_greenhouse:await fs.readFile('src/print/book/tomato-two-page-trial/trial.css','utf8'),carrot:await fs.readFile('src/print/book/two-page-trial/trial.css','utf8')};
const bundle=await build({entryPoints:['src/print/book/renderCompact.ts','src/print/book/production.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outdir:'unused',write:false});
const load=async name=>import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles.find(f=>f.path.endsWith('/'+name+'.js')).contents).toString('base64'));
const {prepareCompactBook}=await load('renderCompact'),{finishProductionPages}=await load('production');
await fs.mkdir(dir,{recursive:true});await fs.mkdir(out,{recursive:true});
const inputPaths=['src/print/book/renderCompact.ts','src/print/book/compact.css','src/print/book/production.ts','src/print/book/production.css','src/print/book/bookvault.css','src/print/book/workingCopy.ts','src/print/book/header-widget-trial/layout.mjs','src/print/book/tomato-two-page-trial/copy.json','src/print/book/tomato-two-page-trial/layout.mjs','src/print/book/tomato-two-page-trial/trial.css','src/print/book/two-page-trial/copy.json','src/print/book/two-page-trial/layout.mjs','src/print/book/two-page-trial/trial.css',...keys.map(k=>`../hackriculture-data/${k.endsWith('_troubles')?'troubles':'vegetables'}/${k}/${k}.json`)];
const inputs=Object.fromEntries(await Promise.all(inputPaths.map(async p=>[p,sha(await fs.readFile(p))])));
let copy,applyReaderEdits;
if(!sourceOnly){copy=await read('src/print/book/reader-edit-pass/guide-copy.json');({applyReaderEdits}=await import('../src/print/book/reader-edit-pass/guide-layout.mjs'));}
const browser=await chromium.launch(),results=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:1200}});
 for(const unit of units)for(const key of keys){
  const d=plan.editions[unit].documents.find(d=>d.key===key),slug=d.label.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  const route=d.type==='trouble'?key:slug;
  await page.goto(`${base}/print/${d.type}/${route}?units=${unit}`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
  const error=await page.evaluate(()=>document.body.dataset.printError);if(error)throw Error(error);
  const prepared=await prepareCompactBook(page,base,d.type,route,unit,root,{supplier:'bookvault',startPage:d.startPage});
  const nav={...navigation.decisions.find(n=>n.key===key),start:d.startPage};
  if(key==='tomato_greenhouse'||key==='carrot'){
   await page.addStyleTag({content:trialCss[key]});
   await page.evaluate(key==='carrot'?applyCarrot:applyTomato,{slug:route,units:unit,edits:(key==='carrot'?carrot:tomato).crops[key][unit],nav});
  }
  await page.evaluate(()=>{for(const leaf of document.querySelectorAll('.book-leaf'))leaf.replaceWith(leaf.querySelector('.sheet'));});
  await page.addStyleTag({content:`@page{size:185mm 240mm;margin:0}body{margin:0}.sheet{position:relative!important;top:0!important;left:0!important}.reader-pass footer{align-items:baseline;gap:3mm;letter-spacing:.7px;font-weight:900;line-height:1.4}.reader-pass footer .section-label,.reader-pass footer .folio{white-space:nowrap}.reader-pass footer .folio{margin-left:auto}.reader-pass footer nav{white-space:nowrap;font:800 7.5pt/1.3 'Nunito Sans';letter-spacing:0}.reader-pass footer nav .destination{color:#a44007}.reader-pass .sheet.verso footer{flex-direction:row}`});
  // Preserve the approved current header and navigation while leaving body type untouched.
  await page.evaluate(({type,nav,start})=>{
   document.body.classList.add('reader-pass');
   if(type==='vegetable'){
    const h=document.querySelector('.back h1');h.replaceChildren(document.createTextNode('Growing guide · '));const crop=document.createElement('span');crop.textContent=nav.crop;crop.style.color='var(--deep)';h.append(crop);
    h.style.cssText+=';white-space:nowrap;letter-spacing:-.35px;width:135mm;font-size:38px!important';
    let size=38;while(h.scrollWidth>h.clientWidth+.5&&size>25){size-=.3333;h.style.setProperty('font-size',size+'px','important');}
   }
   [...document.querySelectorAll('.sheet')].forEach((s,i)=>{
    const f=s.querySelector('footer');f.replaceChildren();const label=document.createElement('span');label.className='section-label';label.textContent=type==='vegetable'?'VEGETABLE GUIDES':'VEGETABLE TROUBLES';f.append(label);
    if(type==='vegetable'&&i&&nav.links.length){const n=document.createElement('nav');n.append('See also: ');nav.links.forEach((l,j)=>{if(j)n.append(' · ');const t=document.createElement('span');t.className='destination';t.textContent=l.text;n.append(t);});f.append(n);}
    const folio=document.createElement('span');folio.className='folio';folio.textContent=String(start+i);f.append(folio);
   });
  },{type:d.type,nav,start:d.startPage});
  const header=d.type==='vegetable'?await page.evaluate(applyHeaderWidgetTrial,{circleGapPx:20,titleGapPx:20}):null;
  await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  if(sourceOnly){
   const selectors=['.fact-grid h3','.fact-grid p','.intro p','.soil p','.soil li','.planting p','.planting li','.planting .measurements','.planting figcaption','.care li','.care p','.harvest p','.harvest li','.pests tbody th','.pests tbody td','.tips p','.varieties small','.varieties article h3','.key-risks p','.remember p','.condition','.entry','.body p'];
   const data=await page.evaluate(selectors=>({text:Object.fromEntries(selectors.map(s=>[s,[...document.querySelectorAll(s)].map(e=>e.textContent)])),sheets:[...document.querySelectorAll('.sheet')].map(s=>s.innerText)}),selectors);
   await fs.writeFile(`${dir}/${key}-${unit}-source.html`,await page.content());
   results.push({key,slug:route,unit,type:d.type,start:d.startPage,prepared,header,...data});
   console.log(JSON.stringify({key,unit,source:true}));continue;
  }
  const edits=copy.guides[key][unit]||copy.guides[key].both;
  const beforePdf=`${out}/${key}-${unit}-baseline.pdf`;
  await page.pdf({path:beforePdf,preferCSSPageSize:true,printBackground:true});
  const check=await page.evaluate(applyReaderEdits,{key,unit,type:d.type,start:d.startPage,edits});
  await fs.writeFile(`${dir}/${key}-${unit}.html`,await page.content());
  const safety=await finishProductionPages(page,{supplier:'bookvault',startPage:d.startPage});
  await page.evaluate(()=>{for(const leaf of document.querySelectorAll('.book-leaf'))leaf.replaceWith(leaf.querySelector('.sheet'));});
  await page.addStyleTag({content:'@page{size:185mm 240mm;margin:0}'});
  const pdf=`${out}/${key}-${unit}-clean.pdf`,highlighted=`${out}/${key}-${unit}-highlighted.pdf`;
  await page.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});
  await page.addStyleTag({content:'[data-reader-change]{background-color:rgba(255,225,80,.40)!important;outline:1px solid #cb8100;outline-offset:1px;border-radius:2px}'});
  await page.pdf({path:highlighted,preferCSSPageSize:true,printBackground:true});
  results.push({key,slug:route,unit,type:d.type,start:d.startPage,folios:Array.from({length:d.physicalPages},(_,i)=>d.startPage+i),sourcePdf:d.pdf,sourceSha256:d.sha256,pdf,sha256:sha(await fs.readFile(pdf)),highlighted,highlightedSha256:sha(await fs.readFile(highlighted)),baselinePdf:beforePdf,header,safety,...check});
  console.log(JSON.stringify({key,unit,pages:check.pages.map(p=>({folio:p.folio,footerGapMm:p.footerGapMm})),changes:check.changes.length}));
 }
}finally{await browser.close();}
for(const [p,h]of Object.entries(inputs))if(sha(await fs.readFile(p))!==h)throw Error('Source changed during pass: '+p);
await fs.writeFile(`${dir}/${sourceOnly?'SOURCE':'CHECKS'}${selected?'-'+selected.join('-'):''}${units.length===1?'-imperial':''}.json`,JSON.stringify({date:'2026-10-15',status:sourceOnly?'read_only_source_capture':'reader_changes_proofed_for_review',inputs,canonicalRecordsChanged:false,frozenSourcesChanged:false,results},null,2)+'\n');
