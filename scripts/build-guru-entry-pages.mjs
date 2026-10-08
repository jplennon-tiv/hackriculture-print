// Separate four-page Bookvault proposal; never modifies approved A4 or guide PDFs.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
import {build} from 'esbuild';

const root=path.resolve(import.meta.dirname,'..');
const dir=path.join(root,'docs/publication/vegetable-guru-entry-pages');
const out=path.join(root,'output/pdf/vegetable-guru-entry-pages');
const scratch=path.join(root,'tmp/pdfs/vegetable-guru-entry-pages');
const base=process.env.BASE_URL||'http://127.0.0.1:5173';
const python='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const sourceDir='docs/front-matter/entry-pages';
const sourceUrl=base+'/'+sourceDir+'/';
const approval=await read('docs/redesign-rollout/APPROVAL.json');
const planPath='docs/publication/book-preparation/ASSEMBLY-PLAN-BOOKVAULT.json';
const planBytes=await fs.readFile(path.join(root,planPath)),plan=JSON.parse(planBytes);
const sourceFiles=[`${sourceDir}/contents.html`,`${sourceDir}/how-to.html`,`${sourceDir}/contents.pdf`,`${sourceDir}/how-to.pdf`,'public/front-matter/contents-A4.pdf','public/front-matter/how-to-use-A4.pdf'];
const sourceHashes={};
for(const f of sourceFiles)sourceHashes[f]=hash(await fs.readFile(path.join(root,f)));
const entry=approval.entryPages||approval.frontMatter?.entryPages;
if(!entry)throw Error('Approved entry-page manifest missing');
for(const component of [entry.contents,entry.howTo])for(const file of component.files){
 if(sourceHashes[file.path]!==file.sha256)throw Error('Approved source hash mismatch: '+file.path);
}
await fs.mkdir(out,{recursive:true});await fs.mkdir(scratch,{recursive:true});
const bundle=await build({entryPoints:[path.join(root,'src/print/book/production.ts')],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
const modulePath=path.join(scratch,'production.mjs');await fs.writeFile(modulePath,bundle.outputFiles[0].contents);
const {finishProductionPages}=await import(modulePath);
const browser=await chromium.launch();
const receipt={date:'2026-10-07',status:'Separate unapproved compact contents/how-to proposal',supplier:'Bookvault',trimMm:[185,240],bleedMm:3,physicalFolios:[4,5,6,7],assemblyPlan:{path:planPath,sha256:hash(planBytes)},approvedSources:sourceHashes,changes:[
 'Approved Harvest corner contents reflowed over facing pages 4–5; original family order, colours, harvest illustration and all 44/14 entries retained.',
 'Book folios replace A4 folios. Two-page-only wording replaced with two-or-more-pages wording. The old A4 unnumbered-opening/page-range note is removed; crop-applicability explanation is retained.',
 'Approved illustrated how-to split over pages 6–7: calendar and climate keys, then difficulty and Core needs. Original explanation paragraphs and all ten how-to/harvest images retained.',
 'These sheets becomes this book; footers use The Vegetable Guru. No new explanatory sections, title page, introduction or author copy added in this pass.',
 'Separate proof only: original A4 assets, current seven-page opening packs, 148-page book assemblies, guide PDFs and canonical data remain untouched.'
],results:[]};
try{
 const page=await browser.newPage({viewport:{width:900,height:1100},deviceScaleFactor:1});
 await page.route('**/@vite/client',r=>r.abort());
 await page.goto(sourceUrl+'contents.html');
 const toc=await page.evaluate(()=>({
  families:[...document.querySelectorAll('.family')].map(s=>({name:s.querySelector('h3').textContent,style:s.getAttribute('style'),labels:[...s.querySelectorAll('li')].map(li=>li.firstElementChild.textContent)})),
  troubleLabels:[...document.querySelectorAll('.trouble-list>div')].map(e=>e.firstElementChild.textContent)
 }));
 await page.goto(sourceUrl+'how-to.html');
 const how=await page.evaluate(()=>{
  const src=e=>{const copy=e.cloneNode(true);copy.querySelectorAll('[src]').forEach(img=>img.setAttribute('src',new URL(img.getAttribute('src'),location.href).pathname));return copy.outerHTML};
  const calendar=document.querySelector('.calendar-explainer');
  const scale=document.querySelector('.scale-sections');
  const headings=[...scale.querySelectorAll(':scope>h2')];
  const sections=headings.map(h=>{const p=h.nextElementSibling,row=p.nextElementSibling;return `<section class="scale-section">${src(h)}${src(p)}${src(row)}</section>`});
  return {intro:document.querySelector('header p').textContent,calendar:src(calendar),sections,explanations:[...document.querySelectorAll('.explanation')].map(p=>p.textContent),images:[...document.images].map(i=>new URL(i.getAttribute('src'),location.href).pathname)};
 });
 // Stack the exact calendar capture above its original two climate keys.
 how.calendar=how.calendar.replace('<div class="study-row">','<div class="calendar-study">');
 receipt.howToExplanations=how.explanations;
 receipt.artwork={};for(const url of new Set(how.images)){const rel=url.replace(/^\//,'');receipt.artwork[rel]=hash(await fs.readFile(path.join(root,rel)));}
 const harvest=`<img class="harvest" src="/${sourceDir}/studies/assets/harvest-cluster.png" alt="Approved harvest cluster of vegetables">`;
 const header=(eyebrow,title,body,cls='')=>`<header class="page-header ${cls}"><div class="eyebrow">${eyebrow}</div>${harvest}<h1>${title}</h1>${body}</header>`;
 for(const units of ['imperial','metric']){
  const docs=plan.editions[units].documents;
  const vegetables=docs.filter(d=>d.type==='vegetable'),troubles=docs.filter(d=>d.type==='trouble');
  const vegMap=new Map(vegetables.map(d=>[d.label,d])),troubleMap=new Map(troubles.map(d=>[d.label.replace(/\s+troubles$/i,''),d]));
  if(vegetables.length!==44||troubles.length!==14)throw Error('Unexpected guide count');
  const seen=new Set(),refs=[];
  const row=(label,map,type)=>{const d=map.get(label);if(!d||seen.has(d.id))throw Error('Missing or duplicate contents identity: '+label);seen.add(d.id);refs.push({type,key:d.key,label,startPage:d.startPage});return `<span>${esc(label)}</span><span class="page-ref">${d.startPage}</span>`};
  const family=name=>{const f=toc.families.find(f=>f.name===name);if(!f)throw Error('Missing family '+name);return `<section class="family" style="${f.style}"><h3>${esc(f.name)}</h3><ul>${f.labels.map(label=>`<li data-toc="${esc(label)}">${row(label,vegMap,'vegetable')}</li>`).join('')}</ul></section>`};
  const sheet=(folio,cls,body)=>`<section class="sheet ${folio%2===0?'verso':''} ${cls}" data-folio="${folio}"><div class="content">${body}</div><footer><span>THE VEGETABLE GURU</span><span class="footer-right">${units.toUpperCase()} · ${folio}</span></footer></section>`;
  const first=sheet(4,'contents-first',header('YOUR GUIDE TO THE COLLECTION',"What's <span>inside.</span>",'<div class="ribbon">44 vegetable guides · 14 Troubles guides</div><p>Each vegetable guide gives you two or more pages of practical growing advice, with separate Troubles guides for more detailed help.</p>')+`<div class="contents-grid"><div>${['Root Crops','Brassicas'].map(family).join('')}</div><div>${['Peas & Beans','Salads & Leaves','Onion Family'].map(family).join('')}</div></div><p class="contents-note">Contents continue opposite. Numbers show the first page of each guide.</p>`);
  const second=sheet(5,'contents-second',header('CONTENTS · CONTINUED',"What's <span>inside.</span>",'<p>More vegetable guides and the illustrated Troubles section.</p>')+`<div class="contents-grid"><div>${['Fruiting Crops','Stalks & Shoots','Other'].map(family).join('')}</div><section class="troubles"><h2>Troubles guides</h2>${toc.troubleLabels.map(label=>`<div class="trouble-item" data-toc="${esc(label)}">${row(label,troubleMap,'trouble')}</div>`).join('')}</section></div><p class="contents-note">Cucurbit Troubles covers cucumber, courgette, marrow, squash and pumpkin; Brassica Troubles includes several leafy and root crops. Check the crop labels beside each condition.</p>`);
  if(seen.size!==58)throw Error('Contents coverage mismatch');
  const calendar=sheet(6,'how-calendar',header('A FEW DETAILS WORTH KNOWING','How to use<br><span>this book.</span>',`<p>${esc(how.intro)}</p>`,'how-header')+how.calendar);
  const scales=sheet(7,'how-scales',header('HOW TO USE THIS BOOK · CONTINUED','Difficulty &amp;<br><span>core needs.</span>','','scales-header')+how.sections.join(''));
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="${base}/"><title>The Vegetable Guru · Contents and how-to · ${units}</title><link rel="stylesheet" href="/docs/publication/vegetable-guru-entry-pages/entry-pages.css"></head><body>${first+second+calendar+scales}</body></html>`;
  const htmlPath=path.join(dir,units+'.html');await fs.writeFile(htmlPath,html);
  await page.goto(base+'/'+path.relative(root,htmlPath));await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
  const checks=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(sheet=>{
   const content=sheet.querySelector('.content').getBoundingClientRect(),footer=sheet.querySelector('footer').getBoundingClientRect();
   const clipped=[...sheet.querySelectorAll('li,.trouble-item,p,h1,h2,h3')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent);
   if(content.bottom>footer.top-12||clipped.length)throw Error('Content fit failure folio '+sheet.dataset.folio+JSON.stringify({gap:footer.top-content.bottom,clipped}));
   return {folio:Number(sheet.dataset.folio),footerClearanceMm:(footer.top-content.bottom)*25.4/96,images:[...sheet.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),loaded:!!i.naturalWidth,widthMm:i.getBoundingClientRect().width*25.4/96,heightMm:i.getBoundingClientRect().height*25.4/96})),horizontalOverflow:clipped};
  }));
  const actualCopy=await page.locator('.explanation').allTextContents();if(JSON.stringify(actualCopy)!==JSON.stringify(how.explanations))throw Error('Approved explanation changed');
  await page.evaluate(({units,checks})=>document.body.dataset.bookChecks=JSON.stringify({type:'entry-pages',units,pages:checks}),{units,checks});
  const geometry=await finishProductionPages(page,{supplier:'bookvault',startPage:4});
  const raw=await page.pdf({width:geometry.width+'mm',height:geometry.height+'mm',preferCSSPageSize:true,printBackground:true,scale:1,margin:{top:0,right:0,bottom:0,left:0}});
  const rawPath=path.join(scratch,units+'-raw.pdf');await fs.writeFile(rawPath,raw);const fd=await fs.open(rawPath,'r');let norm;
  try{norm=spawnSync(python,[path.join(root,'scripts/normalise-book-pdf.py'),'--supplier','bookvault','--start-page','4'],{stdio:[fd.fd,'pipe','pipe'],maxBuffer:50*1024*1024,timeout:60000})}finally{await fd.close()}
  if(norm.status!==0)throw Error(norm.stderr.toString());
  const pdfPath=path.join(out,`contents-how-to-${units}.pdf`);await fs.writeFile(pdfPath,norm.stdout);
  receipt.results.push({units,html:path.relative(root,htmlPath),pdf:path.relative(root,pdfPath),sha256:hash(norm.stdout),contents:refs,dom:checks,geometry,pdfVisualReview:'pending'});
  console.log(units+': four-page proof saved');
 }
 for(const [f,digest] of Object.entries(sourceHashes))if(hash(await fs.readFile(path.join(root,f)))!==digest)throw Error('Approved source changed during build: '+f);
 await fs.writeFile(path.join(dir,'CHECKS.json'),JSON.stringify(receipt,null,2)+'\n');
}finally{await browser.close();await fs.rm(modulePath,{force:true})}
