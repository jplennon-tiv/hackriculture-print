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
const expectedRevision='ef74442574b8150b3fc3ae3ce5cab7660b979af7bbe0b67f2d3083b1a45a12cd';
const approved=["artichoke_globe","artichoke_jerusalem","asparagus","aubergine","bean_broad","bean_french","bean_runner","beet_leaf","beetroot","broccoli","brussels_sprouts","cabbage","capsicum","carrot","cauliflower","celeriac","celery","chicory","cucumber_greenhouse","cucumber_outdoor","endive","florence_fennel","garlic","kale","kohl_rabi","leek","lettuce","marrow_courgette","mushroom","onion_shallot","oriental_leaves","parsnip","pea","potato","radish","rhubarb","salsify_scorzonera","spinach","squash_pumpkin","swede","sweet_corn","tomato_greenhouse","tomato_outdoor","turnip"];
const overnightRestores=fs.readdirSync(path.join(printRoot,'docs/vegetable-ai-pilot')).filter(f=>/^overnight-\d\d-restore\.json$/.test(f)).map(f=>JSON.parse(fs.readFileSync(path.join(printRoot,'docs/vegetable-ai-pilot',f))));
const verifiedOvernight=overnightRestores.filter(r=>['checked-review-proofs','review-proofs-with-exceptions'].includes(r.status));
const overnightKeys=verifiedOvernight.flatMap(r=>Object.keys(r.selected));
const reviewDrafts=['kale',...overnightKeys].filter(key=>!approved.includes(key));
// Kale's accepted source and planting review were refreshed at final sign-off.
const pendingSourceReview={};
// Accepted documented exception: mushroom has no sowing_and_planting source; do not
// invent a source field or change the approved renderer to hide this warning.
const knownPrintWarnings={mushroom:['sowing_notes: automatic fallback selection; prepare a coordinated editorial extract before approval.']};
const issues=[],notes=[];
// Exact checked v4→v5 transition; never rewrite historical approval evidence.
const unitProseCheck=JSON.parse(fs.readFileSync(path.join(printRoot,'docs/vegetable-ai-pilot/UNIT-PROSE-CHECKS.json')));
const fillCheckPath=path.join(printRoot,'docs/vegetable-ai-pilot/PAGE-FILL-CODE-CHECKS.json');
const fillCheck=fs.existsSync(fillCheckPath)?JSON.parse(fs.readFileSync(fillCheckPath)):null;
const fillResultsPath=path.join(printRoot,'docs/vegetable-ai-pilot/PAGE-FILL-CHECKS.json');
const fillResults=fs.existsSync(fillResultsPath)?JSON.parse(fs.readFileSync(fillResultsPath)):[];
for(const [file,hashes] of Object.entries(unitProseCheck.files)){
 const p=path.join(printRoot,file);
 const transition=fillCheck?.files[file];
 if(transition&&transition.previous!==hashes.current)issues.push(`Page-fill transition baseline differs: ${file}`);
 if(!fs.existsSync(p)||createHash('sha256').update(fs.readFileSync(p)).digest('hex')!==(transition?.current??hashes.current))issues.push(`Checked renderer file differs: ${file}`);
}
for(const[file,hashes]of Object.entries(fillCheck?.files??{}))if(!unitProseCheck.files[file]&&createHash('sha256').update(fs.readFileSync(path.join(printRoot,file))).digest('hex')!==hashes.current)issues.push(`Page-fill file differs: ${file}`);
try{
 const {readCollection,revision}=await import('../../../hackriculture-data/lib/records.mjs');
 const {resolveVegetableExtracts,resolveVegetablePrintLayout,printChecksum,VEGETABLE_PRINT_REVISION}=await import('../../src/lib/vegetablePrint.ts');
 const data=readCollection('vegetables'),currentRevision=revision();
 const remaining=Object.keys(data).filter(k=>!data[k].ai_print_layout);
 if(currentRevision!==expectedRevision)notes.push('Shared revision differs from the handover. Inspect newer edits; DO NOT restore the old revision.');
 if(fs.existsSync(path.join(sharedRoot,'.records.lock')))issues.push('Shared writer lock exists. Inspect owner/journal before writing; do not remove it blindly.');
 for(const key of [...approved,...reviewDrafts]){
  const v=data[key],plan=v?.ai_print_layout;
  const allowDrafts=reviewDrafts.includes(key),expectedStatus=allowDrafts?'draft':'approved';
  if(!v||!plan){issues.push(`${key}: prepared record/plan missing`);continue;}
  if(plan.status!==expectedStatus)issues.push(`${key}: plan is ${plan.status}, expected ${expectedStatus}; inspect newer review decisions`);
  const extractWarnings=resolveVegetableExtracts(v,allowDrafts).warnings;
  const expectedStale=(pendingSourceReview[key]??[]).map(slot=>`${slot}: source changed; existing source rendering used.`);
  for(const w of extractWarnings)(expectedStale.includes(w)?notes:issues).push(`${key}: ${w}`);
  const warning=resolveVegetablePrintLayout(v,allowDrafts).warning;
  if(warning)(pendingSourceReview[key]&&warning==='Vegetable saved layout: layout source changed; automatic fitting used.'?notes:issues).push(`${key}: ${warning}`);
  if(pendingSourceReview[key])notes.push(`${key}: normalisation JSON awaits John's diff review; saved PDF evidence is historical, not current. See shared planning/KALE-PILOT-APPLIED.json. Remove this exception after remeasurement.`);
  const evidence=plan.measurements;
  if(!evidence?.renderer_files||!evidence?.results){issues.push(`${key}: missing measurement evidence`);continue;}
  for(const [file,hash]of Object.entries(evidence.renderer_files)){
   const p=path.join(printRoot,file);
   const actual=fs.existsSync(p)?createHash('sha256').update(fs.readFileSync(p)).digest('hex'):null;
   const checked=unitProseCheck.files[file];
   const priorCompatible=plan.renderer_revision===unitProseCheck.compatible_previous_revision&&checked?.previous===hash;
   const fillCompatible=!plan.value.fill_bottoms&&!plan.value.tips_columns&&fillCheck?.files[file]?.current===actual&&(fillCheck.files[file].previous===hash||priorCompatible);
   if(actual!==hash&&!fillCompatible&&!(priorCompatible&&checked?.current===actual))issues.push(`${key}: measured renderer file differs: ${file}`);
  }
  if(evidence.results.length!==2||!['metric','imperial'].every(u=>evidence.results.some(r=>r.units===u)))issues.push(`${key}: both-unit evidence missing`);
  for(const r of evidence.results){
   for(const w of r.warnings??[])(knownPrintWarnings[key]?.includes(w)?notes:issues).push(`${key}/${r.units}: ${w}`);
   if(r.pages!==2||r.error||r.missing?.length||r.alignment?.some(a=>a.column_bottom_gap_px>1))issues.push(`${key}/${r.units}: saved measurements need review`);
  }
  if(key==='kale'||overnightKeys.includes(key)){
   const record=verifiedOvernight.find(r=>Object.hasOwn(r.selected,key));
   for(const result of evidence.results){
    if(result.layout_checksum!==plan.output_checksum||result.source_checksum!==printChecksum(plan.dependencies))issues.push(`${key}/${result.units}: overnight measurement checksum differs`);
    const filled=fillResults.find(r=>r.key===key&&r.units===result.units&&r.layout_checksum===plan.output_checksum);
    const pdf=path.join(printRoot,result.path??filled?.path??`tmp/pdfs/${record.label}/${key}-${result.units}.pdf`);
    if(!fs.existsSync(pdf)||createHash('sha256').update(fs.readFileSync(pdf)).digest('hex')!==result.pdf_sha256)issues.push(`${key}/${result.units}: overnight PDF missing or changed`);
   }
   if(allowDrafts)notes.push(`${key}: checked draft only; editorial/visual exceptions remain in OVERNIGHT-PROGRESS.md.`);
  }
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
 console.log('\nChecks:\n'+(issues.join('\n')||(Object.keys(pendingSourceReview).length?'No unexpected failures. Explicit pending source reviews are listed above; their old PDF evidence is not current. No files changed.':'Prepared records and saved renderer evidence match. No files changed.')));
 process.exitCode=issues.length?1:0;
}catch(error){console.error('Read-only preflight failed:',error.message);process.exitCode=1;}
