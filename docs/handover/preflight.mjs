// Read-only: no saved data, generated projections, PDFs, installs or servers changed.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

if(Number(process.versions.node.split('.')[0])<24){
 console.error('Use Node 24 or later; this check imports erasable TypeScript.');
 process.exit(1);
}
const printRoot=fileURLToPath(new URL('../../',import.meta.url));
const sharedRoot=path.resolve(printRoot,'../hackriculture-data');
const expectedRevision='e4f2d595341f164a7b087bc90caf75f2a824b1dee9fde8f4178d5020c1b700c9';
const approved=['asparagus','celery','radish','beetroot','carrot','lettuce','bean_broad','bean_french','bean_runner','broccoli','brussels_sprouts','cabbage'];
const reviewDrafts=['cauliflower','kale','kohl_rabi'];
const issues=[],notes=[];
try{
 const {readCollection,revision}=await import('../../../hackriculture-data/lib/records.mjs');
 const {resolveVegetableExtracts,resolveVegetablePrintLayout,VEGETABLE_PRINT_REVISION}=await import('../../src/lib/vegetablePrint.ts');
 const data=readCollection('vegetables'),currentRevision=revision();
 const remaining=Object.keys(data).filter(k=>!data[k].ai_print_layout);
 if(currentRevision!==expectedRevision)notes.push('Shared revision differs from the handover. Inspect newer edits; DO NOT restore the old revision.');
 if(fs.existsSync(path.join(sharedRoot,'.records.lock')))issues.push('Shared writer lock exists. Inspect owner/journal before writing; do not remove it blindly.');
 for(const key of [...approved,...reviewDrafts]){
  const v=data[key],plan=v?.ai_print_layout;
  const allowDrafts=reviewDrafts.includes(key),expectedStatus=allowDrafts?'draft':'approved';
  if(!v||!plan){issues.push(`${key}: prepared record/plan missing`);continue;}
  if(plan.status!==expectedStatus)issues.push(`${key}: plan is ${plan.status}, expected ${expectedStatus}; inspect newer review decisions`);
  issues.push(...resolveVegetableExtracts(v,allowDrafts).warnings.map(w=>`${key}: ${w}`));
  const warning=resolveVegetablePrintLayout(v,allowDrafts).warning;if(warning)issues.push(`${key}: ${warning}`);
  const evidence=plan.measurements;
  if(!evidence?.renderer_files||!evidence?.results){issues.push(`${key}: missing measurement evidence`);continue;}
  for(const [file,hash]of Object.entries(evidence.renderer_files)){
   const p=path.join(printRoot,file);
   if(!fs.existsSync(p)||createHash('sha256').update(fs.readFileSync(p)).digest('hex')!==hash)issues.push(`${key}: measured renderer file differs: ${file}`);
  }
  if(evidence.results.length!==2||!['metric','imperial'].every(u=>evidence.results.some(r=>r.units===u)))issues.push(`${key}: both-unit evidence missing`);
  for(const r of evidence.results)if(r.pages!==2||r.error||r.warnings?.length||r.missing?.length||r.alignment?.some(a=>a.column_bottom_gap_px>1))issues.push(`${key}/${r.units}: saved measurements need review`);
 }
 const backups=fs.existsSync(path.join(sharedRoot,'backups/admin'))?fs.readdirSync(path.join(sharedRoot,'backups/admin'),{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name).sort():[];
 console.log(JSON.stringify({read_only:true,print_root:printRoot,shared_root:sharedRoot,node:process.version,renderer:VEGETABLE_PRINT_REVISION,shared_revision:currentRevision,approved:Object.keys(data).filter(k=>data[k].ai_print_layout?.status==='approved'),drafts:Object.keys(data).filter(k=>data[k].ai_print_layout?.status==='draft'),unprepared_count:remaining.length,unprepared:remaining,latest_backup:backups.at(-1)??null},null,2));
 for(const name of ['vegetable-ai-pilot-review.pdf','vegetable-batch-01-review.pdf','vegetable-batch-02-review.pdf'])if(!fs.existsSync(path.join(printRoot,'output/pdf',name)))notes.push(`Disposable proof missing: ${name}; canonical data is still authoritative.`);
 for(const repo of [printRoot,sharedRoot]){
  try{console.log(`\nWorking-tree status (${repo}; preserve existing changes):\n`+execFileSync('git',['--no-optional-locks','status','--short'],{cwd:repo,encoding:'utf8',timeout:5000,maxBuffer:1024*1024}));}
  catch{notes.push(`Could not read git status: ${repo}`);}
 }
 if(process.argv.includes('--server')){
  try{const response=await fetch('http://localhost:5173/',{signal:AbortSignal.timeout(2500)});notes.push(`Local HTTP probe: ${response.status}; this does not certify PDF readiness.`);}
  catch{notes.push('No response from localhost:5173. Start the print server through start.command when needed.');}
 }
 console.log('\nNotes:\n'+(notes.join('\n')||'None.'));
 console.log('\nChecks:\n'+(issues.join('\n')||'Prepared records and saved renderer evidence match. No files changed.'));
 process.exitCode=issues.length?1:0;
}catch(error){console.error('Read-only preflight failed:',error.message);process.exitCode=1;}
