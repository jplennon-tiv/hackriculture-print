import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {build} from 'esbuild';
import {bookLayoutRevision} from '../../hackriculture-data/lib/book-layout.mjs';
import {root, sharedRoot, sha256, readBookContent} from './lib/book-content.mjs';
import {renderGuideKey} from './lib/book-guide-key.mjs';

const dir='docs/publication/guide-key',out='output/pdf/guide-key',scratch='tmp/pdfs/guide-key';
const base=process.env.BASE_URL||'http://127.0.0.1:5173';
const python=process.env.BOOK_PYTHON||'/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
for(const folder of [dir,out,scratch])fs.mkdirSync(path.join(root,folder),{recursive:true});
const book=readBookContent();
const protectedFiles=JSON.parse(fs.readFileSync(path.join(root,'docs/redesign-rollout/APPROVAL.json'))).compactEntryPages.files;
const verify=()=>{for(const f of protectedFiles)if(sha256(fs.readFileSync(path.resolve(root,f.path)))!==f.sha256)throw Error('Approved source changed: '+f.path);};verify();
const bundle=await build({entryPoints:[path.join(root,'src/print/book/production.ts')],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
const modulePath=path.join(root,scratch,'production.mjs');fs.writeFileSync(modulePath,bundle.outputFiles[0].contents);
const {finishProductionPages}=await import(modulePath);
const checks={date:'2026-10-14',status:'One-page guide key proposal; actual PDF/visual checks pending',bookRevision:book.revision,copyInputs:book.inputs,protectedFiles,results:[]};
const browser=await chromium.launch();
try{
 const page=await browser.newPage();await page.route('**/@vite/client',r=>r.abort());
 for(const units of ['imperial','metric']){
  const {body}=renderGuideKey(book.data,units);
  const html=`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>The Vegetable Guru · Guide key · ${units}</title><link rel="stylesheet" href="/${dir}/guide-key.css"></head><body>${body}</body></html>`;
  fs.writeFileSync(path.join(root,dir,units+'.html'),html);
  await page.goto(base+'/'+dir+'/'+units+'.html');await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const dom=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(s=>{
   const b=s.getBoundingClientRect(),c=s.querySelector('.content').getBoundingClientRect(),f=s.querySelector('footer').getBoundingClientRect();
   const gap=(f.top-c.bottom)*25.4/96;if(gap<3)throw Error('Guide key footer collision: '+gap);
   const blocks=[...s.querySelectorAll('p,h1,h2,h3,figcaption,.eyebrow,.key-swatches,footer')].map(el=>{
    const r=el.getBoundingClientRect();if(el.scrollWidth>el.clientWidth+1)throw Error('Horizontal overflow: '+el.textContent);
    return {text:el.innerText,left:(r.left-b.left)*25.4/96,right:(r.right-b.left)*25.4/96,top:(r.top-b.top)*25.4/96,bottom:(r.bottom-b.top)*25.4/96};
   });
   const images=[...s.querySelectorAll('img')].map(i=>{const r=i.getBoundingClientRect();return {src:i.getAttribute('src'),loaded:!!i.naturalWidth,widthMm:r.width*25.4/96,heightMm:r.height*25.4/96};});
   if(images.length!==10)throw Error('Expected nine explanatory images and H5 header');
   return {folio:Number(s.dataset.folio),footerClearanceMm:gap,blocks,images};
  }));
  if(dom.length!==1)throw Error('Expected one guide key page');
  const assets=Object.fromEntries(dom.flatMap(d=>d.images).map(a=>{const p=a.src.startsWith('/images/')?'public'+a.src:a.src.slice(1);return [p,sha256(fs.readFileSync(path.join(root,p)))];}));
  await page.evaluate(dom=>document.body.dataset.bookChecks=JSON.stringify({type:'guide-key',pages:dom}),dom);
  const geometry=await finishProductionPages(page,{supplier:'bookvault',startPage:9});
  const raw=await page.pdf({width:geometry.width+'mm',height:geometry.height+'mm',preferCSSPageSize:true,printBackground:true,scale:1});
  const normal=execFileSync(python,[path.join(root,'scripts/normalise-book-pdf.py'),'--supplier','bookvault','--start-page','9'],{input:raw,maxBuffer:25*1024*1024});
  const file=out+'/guide-key-'+units+'.pdf';fs.writeFileSync(path.join(root,file),normal);
  checks.results.push({units,pdf:file,sha256:sha256(normal),html:dir+'/'+units+'.html',htmlSha256:sha256(html),dom,geometry,assets});
  console.log(units+': one guide-key page, all nine explanatory images; footer gap '+dom[0].footerClearanceMm.toFixed(2)+' mm');
 }
 verify();if(bookLayoutRevision(sharedRoot)!==book.revision)throw Error('Copy changed during export');
 checks.implementation=Object.fromEntries(['scripts/build-book-guide-key.mjs','scripts/lib/book-guide-key.mjs',dir+'/guide-key.css','docs/publication/vegetable-guru-entry-pages/entry-pages.css'].map(p=>[p,sha256(fs.readFileSync(path.join(root,p)))]));
 fs.writeFileSync(path.join(root,dir,'CHECKS.json'),JSON.stringify(checks,null,2)+'\n');
}finally{await browser.close();fs.rmSync(modulePath,{force:true});}
