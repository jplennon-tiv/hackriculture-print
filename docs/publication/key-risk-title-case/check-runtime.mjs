import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const root=process.cwd(),dir='tmp/pdfs/key-risk-title-case';await fs.mkdir(dir,{recursive:true});
const bundle=await build({entryPoints:['pdfPlugin.ts'],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
const file=path.join(root,dir,'renderer.mjs');await fs.writeFile(file,bundle.outputFiles[0].contents);
const {renderPdf}=await import(file);
const labelBundle=await build({entryPoints:['src/lib/troubleLabel.ts'],bundle:true,format:'esm',write:false});
const {troubleLabel}=await import('data:text/javascript;base64,'+Buffer.from(labelBundle.outputFiles[0].contents).toString('base64'));
const browser=await chromium.launch();const results=[];
try{
 const page=await browser.newPage();
 for(const key of ['broccoli','spinach'])for(const units of ['imperial','metric']){
  let warnings=[];
  const bytes=await renderPdf(page,'http://127.0.0.1:5173','vegetable',key,units,'185x240',w=>warnings=w,root);
  const state=await page.evaluate(()=>({checks:JSON.parse(document.body.dataset.bookChecks),fonts:document.fonts.status,missing:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,labels:[...document.querySelectorAll('.sheet:not([data-template]) .key-risks h3')].map(e=>e.textContent),labelBoxes:[...document.querySelectorAll('.sheet:not([data-template]) .key-risks h3')].map(e=>{const r=e.getBoundingClientRect(),s=e.closest('.sheet'),b=s.getBoundingClientRect();return {text:e.textContent,page:[...document.querySelectorAll('.sheet:not([data-template])')].indexOf(s)+1,rect:[(r.left-b.left)*.75,(r.top-b.top)*.75,(r.right-b.left)*.75,(r.bottom-b.top)*.75]}})}));
  if(!state.checks.contentPreserved||state.fonts!=='loaded'||state.missing||!state.labels.length||state.labels.some(l=>l!==troubleLabel(l)))throw Error(JSON.stringify(state));
  const pdf=`${dir}/${key}-${units}.pdf`;await fs.writeFile(pdf,bytes);
  results.push({key,units,pdf,pages:state.checks.pages.length,warnings,...state});console.log(`${key}/${units}: ${state.checks.pages.length} compact pages, ${state.labels.length} consistent labels`);
 }
 await fs.writeFile('docs/publication/key-risk-title-case/RUNTIME-CHECKS.json',JSON.stringify({results},null,2)+'\n');
}finally{await browser.close();await fs.rm(file,{force:true});}
