// Run only after John explicitly approves this review. Never called by export/build.
import fs from'node:fs/promises';import path from'node:path';import assert from'node:assert/strict';import{createHash}from'node:crypto';
import{readCollection,revision,recordPath,saveCollections,dataRoot}from'../../../hackriculture-data/lib/records.mjs';
if(!process.argv.includes('--john-approved'))throw Error('Requires explicit approval from John of the content-refinement review; no records changed.');
const file=path.join(dataRoot,'planning/vegetable-content-refinement/PROPOSAL.json');const proposal=JSON.parse(await fs.readFile(file));
const report=JSON.parse(await fs.readFile(path.join(import.meta.dirname,'REPORT.json')));
const sha=b=>createHash('sha256').update(b).digest('hex');
assert.equal(report.proposalSHA256,sha(await fs.readFile(file)),'Proposal changed since proofs were checked');
for(const[file,hash]of Object.entries(report.rendererFiles))assert.equal(sha(await fs.readFile(path.resolve(import.meta.dirname,'../..',file))),hash,'Renderer changed since proofs: '+file);
assert.equal(report.failedChecks,0);assert.equal(proposal.expectedRevision,revision(),'Source changed; re-review before installing');
const records=readCollection('vegetables'),before=new Map(),now=new Date().toISOString();
for(const[k,p]of Object.entries(proposal.crops)){
 const v=records[k];before.set(path.relative(dataRoot,recordPath(dataRoot,'vegetables',k)),await fs.readFile(recordPath(dataRoot,'vegetables',k)));
 for(const[slot,section]of Object.entries(p.sections)){
  assert(!v.ai_print_extracts.sections[slot]?.locked,`${k}/${slot} locked`);
  v.ai_print_extracts.sections[slot]={...section,status:'approved',updated_at:now,updated_by:'John approval recorded by AI:Codex'};
 }
 assert(!v.ai_print_layout.locked,`${k} layout locked`);
 v.ai_print_layout={...p.layout,status:'approved',updated_at:now,updated_by:'John approval recorded by AI:Codex'};
}
const backups=path.join(dataRoot,'backups/admin'),prior=new Set(await fs.readdir(backups));
const result=saveCollections({vegetables:records},{expectedRevision:proposal.expectedRevision,actor:'admin: John approved Richer A content-refinement proofs; source-grounded editing and recording by AI:Codex'});
const dirs=(await fs.readdir(backups)).filter(d=>!prior.has(d));assert.equal(dirs.length,1);
const backup=path.join(backups,dirs[0]),journal=JSON.parse(await fs.readFile(path.join(backup,'transaction.json')));assert.equal(journal.state,'complete');
for(const item of journal.files){assert(before.has(item.file),item.file);assert.deepEqual(await fs.readFile(path.join(backup,item.backup)),before.get(item.file),item.file+' previous bytes');}
await fs.writeFile(path.join(import.meta.dirname,'SAVE-RECEIPT.json'),JSON.stringify({date:now,...result,backup,exactPriorBytesVerified:true,expectedRevision:proposal.expectedRevision},null,2)+'\n');console.log(result);
