// Bounded, revision-guarded case correction requested by John on 3 November.
// A receipt makes the transaction consumed: never rerun to refresh approvals.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {readCollection,revision,saveRecords,canonical,withoutAudit,dataRoot} from '../../../../hackriculture-data/lib/records.mjs';

const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(dir,'../../..');
const receiptPath=path.join(dir,'SAVE-RECEIPT.json');
assert(!fs.existsSync(receiptPath),'Consumed correction: receipt already exists.');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const tmp=path.join(root,'tmp/pdfs/pest-title-case');fs.mkdirSync(tmp,{recursive:true});
const helper=path.join(tmp,'helpers.mjs');
await build({stdin:{contents:"export * from './src/lib/vegetablePrint.ts';export * from './src/schema.ts';export * from './src/lib/troubleLabel.ts';export * from './src/lib/troubleIdentity.ts';export * from './src/print/vegetableModel.ts';",resolveDir:root},outfile:helper,bundle:true,platform:'node',format:'esm'});
const {troubleLabel,troubleIdentity,printChecksum,resolveVegetablePrintLayout,VegetableSchema,vegetableModel}=await import(helper);
const expectedRevision=revision(dataRoot),records=readCollection('vegetables',dataRoot),updates={},changes=[],inputs={};
const actor='admin-correction: John requested consistent sentence case for Pests & diseases titles on 3 November 2026; source correction by AI:Codex';
const now=new Date().toISOString();
for(const [key,previous] of Object.entries(records)){
 const entries=Object.entries(previous.troubles||{});
 const renamed=entries.map(([name,value])=>[name.startsWith('_')?name:troubleLabel(name),value]);
 assert.equal(new Set(renamed.map(([name])=>name)).size,entries.length,'Key collision: '+key);
 const delta=entries.flatMap(([from],i)=>from===renamed[i][0]?[]:[{from,to:renamed[i][0],valueSha256:hash(canonical(entries[i][1]))}]);
 if(!delta.length)continue;
 const next=structuredClone(previous);next.troubles=Object.fromEntries(renamed);
 assert.equal(canonical(entries.map(([,v])=>v)),canonical(Object.values(next.troubles)),'Advice/order changed');
 for(const change of delta){assert.equal(change.from.toLowerCase(),change.to.toLowerCase());assert.equal(troubleIdentity(change.from,previous.name),troubleIdentity(change.to,previous.name));}
 assert.equal(resolveVegetablePrintLayout(previous).warning,null,'Pre-existing layout needs review: '+key);
 assert.equal(previous.ai_print_layout.locked,false,'Locked layout: '+key);
 assert.equal(previous.ai_print_layout.dependencies.troubles,printChecksum(previous.troubles),'Stale dependency: '+key);
 // Reviewed case-only source change; retain the approved selections and their exact output.
 next.ai_print_layout.dependencies.troubles=printChecksum(next.troubles);
 next.ai_print_layout.updated_at=now;next.ai_print_layout.updated_by=actor;
 assert.equal(resolveVegetablePrintLayout(next).warning,null,'New layout dependency warning: '+key);
 VegetableSchema.parse(next); // Validate only; never save the parsed/stripped value.
 for(const units of ['imperial','metric']){
  const before=vegetableModel(previous,key,units),after=vegetableModel(next,key,units);
  assert.deepEqual(after.troubleEntries.map(([n,v])=>[n.toLowerCase(),v]),before.troubleEntries.map(([n,v])=>[n.toLowerCase(),v]),'Selected problem/advice changed: '+key+' '+units);
 }
 const copy=structuredClone(next);copy.troubles=previous.troubles;copy.ai_print_layout=previous.ai_print_layout;
 assert.equal(canonical(withoutAudit(copy)),canonical(withoutAudit(previous)),'Unrelated field changed');
 const file=path.join(dataRoot,'vegetables',key,key+'.json');inputs[path.relative(root,file)]=hash(fs.readFileSync(file));
 updates[key]=next;changes.push({key,labels:delta});
}
const plan={date:'2026-11-03',scope:'Case-only crop problem labels; stable crop/condition identities, advice, null entries, ranks, order, relationships and approved selections preserved.',expectedRevision,actor,recordCount:changes.length,labelChanges:changes.reduce((n,c)=>n+c.labels.length,0),inputs,changes,sharedTroublesRecordsChanged:0,selectedRowsAndAdviceCheckedInBothUnits:true};
fs.writeFileSync(path.join(dir,'SOURCE-CHANGES.json'),JSON.stringify(plan,null,2)+'\n');
if(process.argv.includes('--apply')){
 const backups=path.join(dataRoot,'backups/admin'),prior=new Set(fs.readdirSync(backups));
 const saved=saveRecords({vegetables:updates},{root:dataRoot,expectedRevision,actor});
 const newFolders=fs.readdirSync(backups).filter(x=>!prior.has(x));assert.equal(newFolders.length,1);
 const backup='backups/admin/'+newFolders[0],journal=JSON.parse(fs.readFileSync(path.join(dataRoot,backup,'transaction.json'),'utf8'));assert.equal(journal.state,'complete');
 for(const item of journal.files){const old=fs.readFileSync(path.join(dataRoot,backup,item.backup));assert.equal(hash(old),inputs[path.relative(root,path.join(dataRoot,item.file))]);}
 const after=readCollection('vegetables',dataRoot);
 for(const [key,next] of Object.entries(updates)){assert.equal(canonical(withoutAudit(after[key])),canonical(withoutAudit(next)));VegetableSchema.parse(after[key]);assert.equal(resolveVegetablePrintLayout(after[key]).warning,null);}
 const receipt={...saved,date:'2026-11-03',actor,backup,records:changes.length,labels:plan.labelChanges,adviceChanged:false,conditionIdsChanged:false,checks:'Schema, collision, case-only, exact advice/order, both-unit selected rows and layout dependencies passed; exact previous bytes verified.'};
 fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
}else console.log(JSON.stringify({mode:'dry run',records:changes.length,labels:plan.labelChanges,checks:'passed; no JSON saved'}));
