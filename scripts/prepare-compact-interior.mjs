// Resumable, source-preserving compact publication review. No canonical writes.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {revision} from '../../hackriculture-data/lib/records.mjs';
import {spawnSync} from 'node:child_process';
import {afterGuide,facingPolicies} from './compact-pagination.mjs';

const root=path.resolve(import.meta.dirname,'..');
const base='http://127.0.0.1:5173';
const evidence=path.join(root,'docs/publication/book-preparation');
let output=path.join(root,'output/pdf/book-preparation');
const scratch=path.join(root,'tmp/pdfs/book-preparation');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const args=Object.fromEntries(process.argv.slice(2).map(a=>a.replace(/^--/,'').split('=')));
const only=args.only?.split(',');
const requestedUnits=args.units?.split(',')??['imperial','metric'];
const kind=args.kind??'vegetable';
const supplier=args.supplier;
const facingPolicy=args.facing??'continuous';
if(!facingPolicies.includes(facingPolicy)||!supplier&&facingPolicy!=='continuous')throw Error('Invalid production facing policy');
if(supplier&&!['kdp','bookvault'].includes(supplier))throw Error('Invalid supplier');
if(supplier)output=path.join(output,supplier);
const firstPage=Number(args.start??8);
if(!['vegetable','trouble','all'].includes(kind)||requestedUnits.some(u=>!['metric','imperial'].includes(u)))throw Error('Invalid scope');
const map=JSON.parse(await fs.readFile(path.join(root,'src/print/bookPagination.json'),'utf8'));
const sourceRevision=revision();
const implementation={};
for(const f of ['pdfPlugin.ts','src/print/book/renderCompact.ts','src/print/book/compact.css','src/print/book/kaleCopy.ts'])implementation[f]=hash(await fs.readFile(path.join(root,f)));
if(supplier)for(const f of ['src/print/book/production.ts','src/print/book/production.css','src/print/book/workingCopy.ts','scripts/normalise-book-pdf.py','scripts/compact-pagination.mjs'])implementation[f]=hash(await fs.readFile(path.join(root,f)));
if(supplier==='bookvault')implementation['src/print/book/bookvault.css']=hash(await fs.readFile(path.join(root,'src/print/book/bookvault.css')));
const signature=hash(JSON.stringify({sourceRevision,implementation,supplier,facingPolicy}));
await fs.mkdir(evidence,{recursive:true});await fs.mkdir(scratch,{recursive:true});
const receipt=path.join(evidence,supplier?`PRODUCTION-${supplier.toUpperCase()}.json`:'INTERIOR-CHECKS.json');
let report;try{report=JSON.parse(await fs.readFile(receipt,'utf8'));}catch{report={version:1,scope:'Working compact guide proofs; not approved or assembled production files',results:[]};}
const {outputFiles}=await build({entryPoints:[path.join(root,'pdfPlugin.ts')],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
const modulePath=path.join(scratch,'renderer.mjs');await fs.writeFile(modulePath,outputFiles[0].contents);
const {renderPdf}=await import(modulePath+'?v='+signature);
const browser=await chromium.launch();
const checkpoint=async()=>{
 report.checkedAt=new Date().toISOString();report.sourceRevision=sourceRevision;report.implementation=implementation;report.currentSignature=signature;
 report.facingPolicy=facingPolicy;
 report.current=report.results.filter(r=>r.signature===signature).reduce((a,r)=>{a[r.status]=(a[r.status]??0)+1;return a;},{});
 report.savedProofs=report.results.reduce((a,r)=>{a[r.status]=(a[r.status]??0)+1;return a;},{});
 await fs.writeFile(receipt,JSON.stringify(report,null,2)+'\n');
 const statePath=path.join(root,'docs/publication/BOOK-PREPARATION-STATE.json');
 const state=JSON.parse(await fs.readFile(statePath,'utf8'));state.status='in_progress';state.queue.find(q=>q.id==='interior').status='in_progress';
 state.interiorCheckpoint={updatedAt:report.checkedAt,receipt:'book-preparation/'+path.basename(receipt),signature,...report.current};
 state.lastCompletedStep='Compact guide batch checkpoint saved; numerical and physical-PDF checks are distinct from pending visual review and final assembly.';
 await fs.writeFile(statePath,JSON.stringify(state,null,2)+'\n');
};
try{
 const page=await browser.newPage({viewport:{width:1100,height:1200}});
 let completed=0;
 const folios=Object.fromEntries(requestedUnits.map(u=>[u,firstPage]));
 const jobs=[];
 for(const units of requestedUnits)for(const type of ['vegetable','trouble']){
  if(kind!=='all'&&type!==kind)continue;
  for(const entry of map.editions[units][type==='vegetable'?'vegetables':'troubles']){
   if(only&&!only.includes(entry.key))continue;
   const slug=type==='trouble'?entry.key:entry.label.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
   jobs.push({type,units,key:entry.key,label:entry.label,slug});
  }
 }
 if(!jobs.length)throw Error('No guide keys matched the requested scope');
 for(const job of jobs){
  const id=job.units+'/'+job.type+'/'+job.key;
  const startPage=supplier?folios[job.units]:undefined;
  const state=JSON.parse(await fs.readFile(path.join(root,'docs/publication/BOOK-PREPARATION-STATE.json'),'utf8'));
  if(Date.now()>=Date.parse(state.deadlineUtc)){console.log('Unattended deadline reached; saved proofs remain available.');break;}
  const file=path.join(output,job.units,job.type+'_'+job.slug+'.pdf');
  const old=report.results.find(r=>r.id===id);
  if(args.force!=='true'&&old?.signature===signature&&old.status==='ok'&&old.startPage===startPage){
   try{if(hash(await fs.readFile(file))===old.sha256){if(supplier)folios[job.units]=afterGuide(startPage,old.physicalPages,job.type,facingPolicy).nextPage;continue;}}catch{}
  }
  if(args.limit&&completed>=Number(args.limit))break;
  const result={id,...job,startPage,facingPolicy,signature,startedAt:new Date().toISOString(),visualReview:'pending'};
  let warnings=[];
  try{
   let bytes=await renderPdf(page,base,job.type,job.slug,job.units,'185x240',w=>warnings=w,root,supplier?{supplier,startPage}:undefined);
   const dom=await page.evaluate(()=>({...JSON.parse(document.body.dataset.bookChecks),fonts:document.fonts.status,conditions:[...document.querySelectorAll('.entry')].map(e=>e.dataset.key),images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),texts:[...document.querySelectorAll('.sheet')].map(s=>s.innerText)}));
   const pages=(bytes.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
   if(pages!==dom.pages.length||!dom.contentPreserved||dom.fonts!=='loaded'||dom.images.some(i=>!i.loaded))throw Error('Content, font, image or physical-pagination check failed');
   if(supplier){
    // A regular-file stdin gives the normaliser a definite EOF. A large pipe
    // input stalled in spawnSync on macOS; keep this step bounded and resumable.
    const inputPath=path.join(scratch,'normalise-input.pdf');
    await fs.writeFile(inputPath,bytes);
    const input=await fs.open(inputPath,'r');
    try{
     const normalised=spawnSync('/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',[path.join(root,'scripts/normalise-book-pdf.py'),'--supplier',supplier,'--start-page',String(startPage)],{stdio:[input.fd,'pipe','pipe'],maxBuffer:100*1024*1024,timeout:60000});
     if(normalised.status!==0)throw Error(normalised.error?.message||normalised.stderr?.toString()||`PDF normalisation failed: ${normalised.signal}`);
     bytes=normalised.stdout;const pagination=afterGuide(startPage,pages,job.type,facingPolicy);folios[job.units]=pagination.nextPage;Object.assign(result,pagination);
    }finally{await input.close();await fs.rm(inputPath,{force:true});}
   }
   await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,bytes);
   Object.assign(result,{status:'ok',pdf:path.relative(root,file),sha256:hash(bytes),physicalPages:pages,warnings,dom});
  }catch(error){Object.assign(result,{status:'error',error:String(error),warnings});}
  report.results=report.results.filter(r=>r.id!==id);report.results.push(result);
  if(revision()!==sourceRevision)throw Error('Canonical source changed during batch; stop and review before continuing');
  await checkpoint();completed++;
  console.log(JSON.stringify({id,status:result.status,pages:result.physicalPages,warnings:result.warnings,error:result.error}));
  if(supplier&&result.status==='error')break; // Later physical folios are unknown.
 }
}finally{await browser.close();await fs.rm(modulePath,{force:true});}
