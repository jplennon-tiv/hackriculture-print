import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {applyTwoPageTrial} from '../src/print/book/tomato-two-page-trial/layout.mjs';

const root=process.cwd(),base='http://127.0.0.1:5173';
const dir='docs/publication/tomato-two-page-review',scratch='tmp/tomato-two-page-trial';
const sourceOnly=process.argv.includes('--source');
const measure=process.argv.includes('--measure'),units=process.argv.includes('--imperial')?['imperial']:['imperial','metric'];
const hash=b=>createHash('sha256').update(b).digest('hex');
const copy=JSON.parse(await fs.readFile('src/print/book/tomato-two-page-trial/copy.json'));
const css=await fs.readFile('src/print/book/tomato-two-page-trial/trial.css','utf8');
const navigation=JSON.parse(await fs.readFile('docs/publication/whole-book-order-preview/NAVIGATION.json'));
const bundle=await build({entryPoints:['src/print/book/renderCompact.ts','src/print/book/production.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outdir:'unused',write:false});
const load=async name=>import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles.find(f=>f.path.endsWith('/'+name+'.js')).contents).toString('base64'));
const {prepareCompactBook}=await load('renderCompact'),{finishProductionPages}=await load('production');
const inputs={};for(const p of ['src/print/book/renderCompact.ts','src/print/book/compact.css','src/print/book/production.ts','src/print/book/production.css','src/print/book/bookvault.css','src/print/book/workingCopy.ts','src/print/book/tomato-two-page-trial/copy.json','src/print/book/tomato-two-page-trial/layout.mjs','src/print/book/tomato-two-page-trial/trial.css','../hackriculture-data/vegetables/tomato_greenhouse/tomato_greenhouse.json','../hackriculture-data/vegetables/tomato_outdoor/tomato_outdoor.json'])inputs[p]=hash(await fs.readFile(p));
await fs.mkdir(scratch,{recursive:true});await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1100,height:1200}}),results=[];
try{for(const unit of units)for(const slug of ['tomato_greenhouse','tomato_outdoor']){
 const key=slug,start=slug==='tomato_greenhouse'?86:90;
 await page.goto(`${base}/print/vegetable/${slug}?units=${unit}`,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
 const error=await page.evaluate(()=>document.body.dataset.printError);if(error)throw Error(error);
 await prepareCompactBook(page,base,'vegetable',slug,unit,root,{supplier:'bookvault',startPage:start});
 if(sourceOnly){
  const selectors=['.intro p','.soil p','.soil li','.planting p','.planting li','.planting .measurements','.planting figcaption','.care li','.care p','.harvest p','.harvest li','.pests tbody th','.pests tbody td','.tips p','.varieties p','.key-risks p','.remember p','.fact-grid'];
  const data=await page.evaluate(selectors=>Object.fromEntries(selectors.map(s=>[s,[...document.querySelectorAll(s)].map(e=>e.textContent)])),selectors);
  await fs.writeFile(`${scratch}/${slug}-${unit}-source.html`,await page.content());
  results.push({slug,units:unit,text:data});continue;
 }
 await page.addStyleTag({content:css});
 const nav=navigation.decisions.find(d=>d.key===key);
 const trial=await page.evaluate(applyTwoPageTrial,{slug,units:unit,edits:copy.crops[slug][unit],nav:{...nav,start}});
 const html=`${scratch}/${slug}-${unit}.html`;
 await fs.writeFile(html,await page.content());trial.html=html;
 if(!measure){
  if(trial.pages.length!==2||trial.pages.some(p=>p.footerGapMm<3))throw Error('Two-page trial does not fit: '+JSON.stringify(trial.pages));
  await finishProductionPages(page,{supplier:'bookvault',startPage:start});
  // Trim-sized review only; the same text already passed the production safety check.
  await page.evaluate(()=>{for(const leaf of document.querySelectorAll('.book-leaf'))leaf.replaceWith(leaf.querySelector('.sheet'));});
  await page.addStyleTag({content:'@page{size:185mm 240mm;margin:0}'});
  const pdf=`${scratch}/${slug}-${unit}.pdf`;
  await page.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});trial.pdf=pdf;trial.sha256=hash(await fs.readFile(pdf));
 }
 results.push(trial);console.log(JSON.stringify({slug,unit,gaps:trial.pages.map(p=>p.footerGapMm),blocks:trial.pages.map(p=>p.blocks),arrangement:trial.chosenArrangement,pestWidths:trial.pestColumnPercent,allPests:trial.pestRows,bodyTypeUnchanged:trial.bodyTypeUnchanged}));
}}finally{await browser.close();}
for(const [p,h]of Object.entries(inputs))if(hash(await fs.readFile(p))!==h)throw Error('Input changed during trial: '+p);
await fs.writeFile(sourceOnly?`${scratch}/SOURCE.json`:measure?`${scratch}/MEASUREMENTS.json`:`${dir}/TRIAL-CHECKS.json`,JSON.stringify({date:'2026-10-15',status:measure?'measurement_only':'two_page_proofs_generated_for_review',inputs,results},null,2)+'\n');
