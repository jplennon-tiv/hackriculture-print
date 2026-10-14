import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {build} from 'esbuild';
import {bookLayoutRevision} from '../../hackriculture-data/lib/book-layout.mjs';
import {root, sharedRoot, sha256, readBookContent} from './lib/book-content.mjs';
import {createContentsPlan, renderUpdatedContents} from './lib/book-contents.mjs';

const dir='docs/publication/contents-update', out='output/pdf/contents-update';
const base=process.env.BASE_URL||'http://127.0.0.1:5173';
const python=process.env.BOOK_PYTHON||'/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const json=p=>JSON.parse(fs.readFileSync(path.resolve(root,p),'utf8'));
const write=(p,value)=>fs.writeFileSync(path.resolve(root,p),JSON.stringify(value,null,2)+'\n');
for(const folder of [dir,out,'tmp/pdfs/contents-update'])fs.mkdirSync(path.join(root,folder),{recursive:true});
const book=readBookContent(),basePath='docs/publication/book-preparation/ASSEMBLY-PLAN-BOOKVAULT.json',basePlan=json(basePath);
const collection=json('docs/publication/topic-pages/techniques-expansion/COLLECTION-APPROVAL.json');
const cultivation=json('docs/publication/topic-pages/cultivation-dig-no-dig/APPROVAL.json');
const index=json('docs/publication/book-index/APPROVAL.json');
const approvals=json('docs/redesign-rollout/APPROVAL.json');
const protectedFiles=[...approvals.compactEntryPages.files,...collection.files,...cultivation.files,...index.files];
const verifyProtected=()=>{for(const f of protectedFiles)if(sha256(fs.readFileSync(path.resolve(root,f.path)))!==f.sha256)throw Error('Approved reference changed: '+f.path);};
verifyProtected();
const sources={}, inputs={};
function pdf(file,expected,count){
  const hash=sha256(fs.readFileSync(path.resolve(root,file)));
  if(hash!==expected)throw Error('PDF source hash changed: '+file);
  inputs[file]={sha256:hash,pages:count};return {pdf:file,sha256:hash};
}
for(const [units,edition] of Object.entries(basePlan.editions)){
  for(const d of edition.documents)pdf(d.pdf,d.sha256,d.physicalPages);
  const cp=collection.files.find(f=>f.path.endsWith('/'+units+'.pdf'));
  const xp=cultivation.files.find(f=>f.path.endsWith('/'+units+'.pdf'));
  const ip=index.files.find(f=>f.path.endsWith('/index.pdf'));
  const c=pdf(cp.path,cp.sha256,13),x=pdf(xp.path,xp.sha256,4),i=pdf(ip.path,ip.sha256,4);
  sources[units]=Object.fromEntries(collection.pageIds.map((id,n)=>['technique:'+id,{...c,sourcePage:n+1}]));
  ['overview','no-dig','digging','digging-finish'].forEach((id,n)=>sources[units]['cultivation:'+id]={...x,sourcePage:n+1});
  sources[units]['back:index']={...i,sourcePage:1,physicalPages:4};
}
const counts=JSON.parse(execFileSync(python,['-c','import json,sys; from pypdf import PdfReader; print(json.dumps({p:len(PdfReader(p).pages) for p in json.load(sys.stdin)}))'],{cwd:root,input:JSON.stringify(Object.keys(inputs)),encoding:'utf8',maxBuffer:1024*1024}));
for(const [p,item] of Object.entries(inputs))if(counts[p]!==item.pages)throw Error('Actual PDF count changed: '+p);
const {plan,topicMap}=createContentsPlan(basePlan,sources);
plan.basePlan={path:basePath,sha256:sha256(fs.readFileSync(path.join(root,basePath)))};
plan.limits=['John requested the new section order on 14 October; opener designs and contents remain for review.','Preserves crop spreads, adds blank versos before the first two section openers and an end balancing page.','Original guide/topic/how-to/index PDFs remain unchanged; the separate screen assembly updates folios.','176 pages is a working preview count, not a final production/cost/spine specification.'];
write(dir+'/ASSEMBLY-PROPOSAL.json',plan);write(dir+'/TOPIC-FOLIOS.json',topicMap);
const themes=json('src/print/familyThemes.json');
const bundle=await build({entryPoints:[path.join(root,'src/print/book/production.ts')],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
const modulePath=path.join(root,'tmp/pdfs/contents-update/production.mjs');fs.writeFileSync(modulePath,bundle.outputFiles[0].contents);
const {finishProductionPages}=await import(modulePath);
const checks={date:'2026-10-14',status:'Contents proposal: PDF/visual review pending',bookRevision:book.revision,copyInputs:book.inputs,sourcePdfs:inputs,protectedFiles,fullBookRegenerated:false,guidePdfsRegenerated:false,results:[]};
const browser=await chromium.launch();
try{
 const page=await browser.newPage();await page.route('**/@vite/client',r=>r.abort());
 for(const units of ['imperial','metric']){
  const rendered=renderUpdatedContents(book.data,units,plan,themes);
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>The Vegetable Guru · Updated contents · ${units}</title><link rel="stylesheet" href="/${dir}/contents.css"></head><body>${rendered.body}</body></html>`;
  fs.writeFileSync(path.join(root,dir,units+'.html'),html);
  await page.goto(base+'/'+dir+'/'+units+'.html');await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const dom=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(s=>{
    const b=s.getBoundingClientRect(),c=s.querySelector('.content').getBoundingClientRect(),f=s.querySelector('footer').getBoundingClientRect();
    const blocks=[...s.querySelectorAll('li,.trouble-item,p,h1,h2,h3,.eyebrow,.ribbon,footer')].map(el=>{const r=el.getBoundingClientRect();if(el.scrollWidth>el.clientWidth+1)throw Error('Horizontal overflow: '+el.textContent);return {text:el.textContent.trim(),left:(r.left-b.left)*25.4/96,right:(r.right-b.left)*25.4/96,top:(r.top-b.top)*25.4/96,bottom:(r.bottom-b.top)*25.4/96};});
    const gap=(f.top-c.bottom)*25.4/96;if(gap<3)throw Error('Footer collision folio '+s.dataset.folio+': '+gap);
    return {folio:Number(s.dataset.folio),footerClearanceMm:gap,blocks,images:[...s.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),loaded:!!i.naturalWidth}))};
  }));
  if(dom.length!==3)throw Error('Expected three contents sheets');
  await page.evaluate(dom=>document.body.dataset.bookChecks=JSON.stringify({type:'updated-contents',pages:dom}),dom);
  const geometry=await finishProductionPages(page,{supplier:'bookvault',startPage:4});
  const raw=await page.pdf({width:geometry.width+'mm',height:geometry.height+'mm',preferCSSPageSize:true,printBackground:true,scale:1});
  const normal=execFileSync(python,[path.join(root,'scripts/normalise-book-pdf.py'),'--supplier','bookvault','--start-page','4'],{input:raw,maxBuffer:25*1024*1024});
  const file=out+'/contents-'+units+'.pdf';fs.writeFileSync(path.join(root,file),normal);
  checks.results.push({units,pdf:file,sha256:sha256(normal),html:dir+'/'+units+'.html',htmlSha256:sha256(html),references:rendered.references,dom,geometry});
  console.log(units+': three contents pages, '+rendered.references.length+' references; proposed book '+plan.editions[units].plannedEvenTotal+' pages');
 }
 verifyProtected();
 if(bookLayoutRevision(sharedRoot)!==book.revision)throw Error('Copy changed during export');
 for(const [p,item] of Object.entries(inputs))if(sha256(fs.readFileSync(path.resolve(root,p)))!==item.sha256)throw Error('PDF source changed during export: '+p);
 checks.protectedFilesUnchanged=true;
 checks.implementation=Object.fromEntries(['scripts/build-updated-contents.mjs','scripts/lib/book-contents.mjs','scripts/lib/book-content.mjs',dir+'/contents.css','docs/publication/vegetable-guru-entry-pages/entry-pages.css','src/print/familyThemes.json'].map(p=>[p,sha256(fs.readFileSync(path.join(root,p)))]));
 checks.assemblyProposalSha256=sha256(fs.readFileSync(path.join(root,dir,'ASSEMBLY-PROPOSAL.json')));
 write(dir+'/CHECKS.json',checks);
}finally{await browser.close();fs.rmSync(modulePath,{force:true});}
