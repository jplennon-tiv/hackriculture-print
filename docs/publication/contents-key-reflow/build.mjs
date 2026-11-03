import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {build} from 'esbuild';

const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'../../..');
const relative=path.relative(root,dir);
const output=path.join(root,'output/pdf/contents-key-reflow');
const working=path.join(root,'tmp/pdfs/contents-key-reflow');
const python=process.env.PDF_PYTHON||'/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const source=JSON.parse(await fs.readFile(path.join(root,'docs/publication/contents-update/CHECKS.json'),'utf8'));
const fixed=[
 'docs/publication/contents-update/CHECKS.json',
 'docs/publication/contents-update/current.css',
 'docs/publication/contents-update/contents.css',
 'docs/publication/contents-colour-study/key-preview/key.css',
 'docs/publication/contents-colour-study/study.css',
 'docs/publication/vegetable-guru-entry-pages/entry-pages.css',
 'docs/publication/contents-update/imperial.html',
 'docs/publication/contents-update/metric.html',
 'output/pdf/contents-update/contents-imperial.pdf',
 'output/pdf/contents-update/contents-metric.pdf',
 'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf',
 ...source.artwork.map(a=>a.file),
 ...source.protectedFiles.map(f=>f.path)
];
const hashSources=async()=>Object.fromEntries(await Promise.all([...new Set(fixed)].map(async p=>[p,digest(await fs.readFile(path.resolve(root,p)))])));
const inputs=await hashSources();
await fs.mkdir(output,{recursive:true});await fs.mkdir(working,{recursive:true});
const bundle=await build({entryPoints:[path.join(root,'src/print/book/production.ts')],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
const modulePath=path.join(working,'production.mjs');await fs.writeFile(modulePath,bundle.outputFiles[0].contents);
const {finishProductionPages}=await import(modulePath);
try{await fs.access(path.join(dir,'APPROVAL.json'));throw Error('Approved proposal is frozen; use a new revision folder.');}catch(e){if(e.code!=='ENOENT')throw e;}
const report={date:'2026-11-03',status:'Layout proposal; actual PDF and visual checks follow',inputs,results:[],mainBookChanged:false,copyChanged:false};
const browser=await chromium.launch();
try{
 for(const units of ['imperial','metric']){
  const page=await browser.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.route('**/@vite/client',r=>r.abort());
  await page.goto(`http://127.0.0.1:5173/docs/publication/contents-update/${units}.html`);
  await page.emulateMedia({media:'print'});
  const baseline=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(s=>({folio:s.dataset.folio,text:s.innerText,rows:[...s.querySelectorAll('li')].map(e=>e.innerText),key:[...s.querySelectorAll('.category-key-item')].map(e=>({text:e.innerText,colour:e.style.getPropertyValue('--deep')})),images:[...s.querySelectorAll('img')].map(e=>e.getAttribute('src'))})));
  await page.evaluate(relative=>{
   const s=document.querySelector('[data-folio="5"]');
   const img=s.querySelector('[data-artwork="H6"]');
   s.querySelector('.contents-grid>section').append(img);img.classList.add('left-column-harvest');
   const key=s.querySelector('.category-key'),items=[...key.children];
   // Preserve the accepted key's down-column reading order over four shorter columns.
   [0,2,4,6,1,3,5,7].forEach(i=>key.append(items[i]));
   document.querySelector('link[rel="stylesheet"]').href=`/${relative}/proposal.css`;
   document.querySelectorAll('script').forEach(e=>e.remove());
   document.title='The Vegetable Guru · Contents layout trial';
  },relative);
  const html='<!doctype html>\n'+await page.evaluate(()=>document.documentElement.outerHTML);
  const htmlPath=path.join(dir,`${units}.html`);await fs.writeFile(htmlPath,html);
  await page.goto(`http://127.0.0.1:5173/${relative}/${units}.html`);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const current=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(s=>({folio:s.dataset.folio,text:s.innerText,rows:[...s.querySelectorAll('li')].map(e=>e.innerText),key:[...s.querySelectorAll('.category-key-item')].map(e=>({text:e.innerText,colour:e.style.getPropertyValue('--deep')})),images:[...s.querySelectorAll('img')].map(e=>e.getAttribute('src'))})));
  if(current[0].text!==baseline[0].text)throw Error('Page 4 text changed');
  for(let i=0;i<2;i++){
   for(const field of ['rows','images'])if(JSON.stringify(current[i][field])!==JSON.stringify(baseline[i][field]))throw Error(`${units}: ${field} changed`);
   if(JSON.stringify([...current[i].key].sort((a,b)=>a.text.localeCompare(b.text)))!==JSON.stringify([...baseline[i].key].sort((a,b)=>a.text.localeCompare(b.text))))throw Error('Key labels or colours changed');
  }
  const dom=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(s=>{
   const b=s.getBoundingClientRect(),f=s.querySelector('footer').getBoundingClientRect(),content=s.querySelector('.content').getBoundingClientRect();
   const mm=r=>({left:(r.left-b.left)*25.4/96,right:(r.right-b.left)*25.4/96,top:(r.top-b.top)*25.4/96,bottom:(r.bottom-b.top)*25.4/96});
   const selectors='li>span,h1,.contents-section>span,footer,.category-key-title,.category-key-label';
   const blocks=[...s.querySelectorAll(selectors)].map(e=>{
    const r=e.getBoundingClientRect();if(e.scrollWidth>e.clientWidth+1)throw Error('Overflow: '+e.textContent);
    return {text:e.textContent.trim(),...mm(r),fontPt:parseFloat(getComputedStyle(e).fontSize)*.75};
   });
   const images=[...s.querySelectorAll('img')].map(img=>{
    const r=img.getBoundingClientRect();if(!img.naturalWidth||r.left<b.left||r.right>b.right||r.top<b.top||r.bottom>f.top-3*96/25.4)throw Error('Unsafe or missing image');
    for(const el of s.querySelectorAll('li>span,h1,.contents-section>span,.category-key-panel')){const t=el.getBoundingClientRect();if(r.left<t.right&&r.right>t.left&&r.top<t.bottom&&r.bottom>t.top)throw Error('Image overlaps content');}
    return {src:img.getAttribute('src'),...mm(r)};
   });
   const gap=(f.top-content.bottom)*25.4/96;if(gap<3)throw Error('Footer gap '+gap);
   const key=s.querySelector('.category-key-panel');
   return {folio:Number(s.dataset.folio),footerClearanceMm:gap,blocks,images,key:key?mm(key.getBoundingClientRect()):null};
  }));
  if(errors.length)throw Error(errors.join('\n'));
  const pdf=units==='imperial'?path.join(output,'contents-preview.pdf'):path.join(working,'contents-metric-proof.pdf');
  const raw=path.join(working,`${units}-raw.pdf`);
  await page.evaluate(dom=>document.body.dataset.bookChecks=JSON.stringify({type:'updated-contents',pages:dom}),dom);
  const geometry=await finishProductionPages(page,{supplier:'bookvault',startPage:4});
  await page.pdf({path:raw,width:geometry.width+'mm',height:geometry.height+'mm',preferCSSPageSize:true,printBackground:true});
  const normal=execFileSync(python,[path.join(root,'scripts/normalise-book-pdf.py'),'--supplier','bookvault','--start-page','4'],{input:await fs.readFile(raw),maxBuffer:25*1024*1024});
  await fs.writeFile(pdf,normal);
  await fs.rm(raw);
  report.results.push({units,pdf:path.relative(root,pdf),sha256:digest(await fs.readFile(pdf)),html:path.relative(root,htmlPath),htmlSha256:digest(html),dom,rowsAndKeyPreserved:true,errors});
  await page.close();
 }
 if(JSON.stringify(inputs)!==JSON.stringify(await hashSources()))throw Error('Protected source changed during preview');
 report.implementation=Object.fromEntries(await Promise.all(['proposal.css','build.mjs','check-proof.py'].map(async p=>[`${relative}/${p}`,digest(await fs.readFile(path.join(dir,p)))])));
 for(const p of ['src/print/book/production.ts','scripts/normalise-book-pdf.py'])report.implementation[p]=digest(await fs.readFile(path.join(root,p)));
 report.protectedSourcesUnchanged=true;
 await fs.writeFile(path.join(dir,'CHECKS.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report.results.map(r=>({units:r.units,footerClearanceMm:r.dom.map(p=>p.footerClearanceMm),key:r.dom[1].key}))));
}finally{await browser.close();await fs.rm(modulePath,{force:true});}
