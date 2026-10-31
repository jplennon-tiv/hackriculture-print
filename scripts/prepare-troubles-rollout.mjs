// Capture existing complete book bodies, build invisible masks, measure A4 dependencies.
import fs from 'node:fs/promises';import path from 'node:path';import {build} from 'esbuild';import {chromium} from 'playwright';
import {readCollection} from '../../hackriculture-data/lib/records.mjs';
import {buildWrappingMasks} from './lib/troubles-mask.mjs';
import {root,base,ev,tmp,hash,json,save,source,trim,measure} from './lib/troubles-rollout-io.mjs';
await fs.mkdir(tmp,{recursive:true});await fs.mkdir(path.join(ev,'masks'),{recursive:true});
if(await fs.stat('docs/publication/troubles-rollout/APPROVAL.json').then(()=>true,()=>false))throw Error('Approved Troubles proofs are frozen; use a new revision destination.');
const records=readCollection('troubles'),oldMap=await json(path.join(root,'docs/publication/whole-book-order-preview/PAGE-MAP.json'));
const groups=Object.entries(records).map(([key,g])=>({key,label:g.source_heading,oldStart:oldMap.find(p=>p.kind==='trouble'&&p.label===g.source_heading)?.folio})).sort((a,b)=>a.oldStart-b.oldStart);
if(groups.length!==14||groups.some(g=>!g.oldStart))throw Error('Group map');
const receiptFile=path.join(ev,'BASELINES.json');let report;try{report=await json(receiptFile);}catch{report={groups,results:[],masks:{}};}
const features=(await json(path.join(root,'src/print/book/troubleFeatures.json'))).features;
const {outputFiles}=await build({entryPoints:[path.join(root,'src/print/book/renderCompact.ts')],bundle:true,platform:'node',format:'esm',packages:'external',write:false});await fs.writeFile(path.join(tmp,'renderer.mjs'),outputFiles[0].contents);const {prepareCompactBook}=await import(path.join(tmp,'renderer.mjs'));
const browser=await chromium.launch();
try{const page=await browser.newPage({viewport:{width:1100,height:1100}});
for(const group of groups){const {key,oldStart}=group;const sourceHash=hash(await fs.readFile(path.join(root,`../hackriculture-data/troubles/${key}/${key}.json`)));
for(const units of ['imperial','metric']){
 const done=report.results.find(r=>r.key===key&&r.units===units);if(done){if(done.sourceHash!==sourceHash)throw Error('Source changed after baseline '+key);continue;}
 const a4=await source(page,key,units);await page.pdf({path:path.join(tmp,`${key}-${units}-a4.pdf`),format:'A4',printBackground:true});
 // Old body design with its original geometry, retaining all advice and art.
 await page.evaluate(()=>document.querySelectorAll('h2').forEach(h=>h.textContent=h.textContent.replace(/\s*★\s*$/,'')));
 await prepareCompactBook(page,base,'trouble',key,units,root,{supplier:'bookvault',startPage:oldStart},false);
 await trim(page,oldStart);const before=await measure(page,oldStart);
 await fs.writeFile(path.join(ev,`${key}-${units}-before.html`),await page.content());
 await page.pdf({path:path.join(tmp,`${key}-${units}-before.pdf`),preferCSSPageSize:true,printBackground:true});
 if(!report.masks[key]){
  let masks;if(key==='brassica_troubles')masks=(await json(path.join(root,'docs/publication/brassica-flow-preview/MASKS.json'))).masks;
  else{masks=await page.evaluate(buildWrappingMasks);for(const m of masks){m.sourceSha256=hash(await fs.readFile(path.join(root,'public',m.src)));m.sha256=hash(m.svg);m.url=`/docs/publication/troubles-rollout/masks/${key}-${m.key}.svg`;await fs.writeFile(path.join(root,m.url),m.svg);delete m.svg;}}
  report.masks[key]=masks;await save(path.join(root,'src/print/book/troubleMasks.json'),{version:1,groups:report.masks});
 }
 const priority=Object.entries(records[key].conditions).map(([k,c])=>({key:k,rank:c.rank,star:c.star===true,kind:features.find(f=>f.group===key&&f.key===k)?.kind}));
 await source(page,key,units);await prepareCompactBook(page,base,'trouble',key,units,root,{supplier:'bookvault',startPage:oldStart},{masks:report.masks[key],priority});await trim(page,oldStart);const strict=await measure(page,oldStart);
 report.results.push({key,units,sourceHash,a4,before,strict});await save(receiptFile,report);
 console.log(JSON.stringify({key,units,baselinePages:before.length,strictPages:strict.length,masks:report.masks[key].length}));
}}
await page.goto(base+'/print-shell.html');
for(const group of groups){await page.setContent('<html><head><style>body{margin:15px;background:#fff8e8;font:13px system-ui}main{display:grid;grid-template-columns:repeat(4,180px);gap:16px}.pair{position:relative;width:180px;height:210px}.pair img{position:absolute;width:180px;height:210px;object-fit:contain;mix-blend-mode:multiply}.mask{opacity:.23;filter:invert(30%) sepia(90%) saturate(5000%) hue-rotate(300deg)}</style></head><body><main></main></body></html>');await page.evaluate(ms=>{for(const m of ms){const c=document.createElement('section');c.innerHTML=`<p>${m.key.replaceAll('_',' ')}</p><div class="pair"><img src="${m.src}"><img class="mask" src="${m.url}"></div>`;document.querySelector('main').append(c);}},report.masks[group.key]);await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));await page.locator('main').screenshot({path:path.join(ev,group.key+'-masks.png')});}
}finally{await browser.close();}
