// Authoring transaction for John's explicitly authorised 23 September normalisation.
// Default is a read-only plan. Re-running --apply against any other revision is refused.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {readCollection,revision,saveCollections,recordPath,dataRoot,canonical} from '../../hackriculture-data/lib/records.mjs';
import {assertAiWritable,layoutSourceSignature,reviewAiField,printFields,signature} from '../src/lib/aiPrint.ts';
import {TroublesDataSchema} from '../src/schema.ts';
import {edits,editorialReplacements} from '../docs/troubles-normalisation/broad-edits.mjs';
const expected='9d160ab41960c5ec7c3f524a65713a03733d573e93344c08b6b30eb59c83a009';
assert.equal(revision(),expected,'Live data changed; review and rebase the plan before writing.');
const original=readCollection('troubles'),next=structuredClone(original),vegetables=readCollection('vegetables'),sha=b=>createHash('sha256').update(b).digest('hex');
const out=path.join(dataRoot,'planning/troubles-normalisation');fs.mkdirSync(out,{recursive:true});
const pilot=new Set(['mangold_fly_leaf_miner','blackleg','bolting','autumnal_fungal_root_rots'].map(k=>'beetroot_troubles/'+k));
const decisions=new Map(),log=(g,k,decision)=>{const id=g+'/'+k;if(!decisions.has(id))decisions.set(id,[]);decisions.get(id).push(decision);};
for(const [gk,g]of Object.entries(original)){
 assert.ok(!g.ai_layout.locked,'Locked layout '+gk);assert.equal(g.ai_layout.source_signature,layoutSourceSignature(g),'Stale layout '+gk);
 for(const [key,c]of Object.entries(g.conditions)){for(const f of printFields){assertAiWritable(c,f);assert.ok(reviewAiField(c,f,c).usable,'Not current approved: '+gk+'/'+key+'/'+f);}}
}
for(const j of edits){assert.ok(next[j.group]?.conditions[j.key]);assert.ok(!pilot.has(j.group+'/'+j.key));Object.assign(next[j.group].conditions[j.key],j.source);for(const[f,text]of Object.entries(j.print))next[j.group].conditions[j.key]['ai_'+f]=text;log(j.group,j.key,{kind:'researched-or-editorial',reason:j.reason,sources:j.sources,uncertain:j.uncertain});}
for(const [gk,g]of Object.entries(next)){
 for(const [key,c]of Object.entries(g.conditions)){
  if(pilot.has(gk+'/'+key))continue;
  for(const f of [...printFields,...printFields.map(f=>'ai_'+f)]){
   let s=c[f];if(typeof s!=='string')continue;const prior=s;
   // Remove contradictory import boilerplate only when an action follows it.
   s=s.replace(/^None\.\s+(?=\S)/,'').replace(/^No practical method available\.\s+(?=\S)/,'');
   for(const[a,b]of editorialReplacements)s=s.replaceAll(a,b);
   s=s.replace(/\.\./g,'.').replace(/;\./g,'.').trim();
   if(s!==prior){c[f]=s;log(gk,key,{kind:'editorial',field:f,reason:'State existing organic action directly; remove contradictory boilerplate or unnecessary treatment comparison. Diagnostic and safety qualifications retained.'});}
  }
 }
 // Preserve the causes themselves and key links; strip obsolete book pagination only.
 for(const row of g.symptom_lookup??[]){const before=structuredClone(row.likely_causes);row.likely_causes=row.likely_causes.map(x=>typeof x==='string'?x.replace(/\s*\(see pages?\s+\d+(?:[-–,\s]+\d+)*\)/gi,'').trim():x);if(canonical(before)!==canonical(row.likely_causes))log(gk,'$symptom_lookup',{kind:'import-cleanup',reason:'Remove obsolete book-page pointers; retain cause labels and condition keys.',before,after:row.likely_causes});}
}
const changed=[],inventory=[];
for(const [gk,g]of Object.entries(next)){
 for(const [key,c]of Object.entries(g.conditions)){
  const old=original[gk].conditions[key],didChange=canonical(old)!==canonical(c);if(didChange)changed.push({group:gk,key,fields:Object.keys(c).filter(f=>canonical(old[f])!==canonical(c[f])),decisions:decisions.get(gk+'/'+key)??[]});
  inventory.push({group:gk,key,name:c.name,status:pilot.has(gk+'/'+key)?'approved pilot preserved':didChange?'corrected; draft print review required':'reviewed; retained without rewrite',host_scope:c.applies_to??g.applies_to,identity_note:key.endsWith('_2')?'Separate tuber/fruit presentation retained; not merged by key similarity':undefined});
  assert.deepEqual(c.image,old.image);assert.deepEqual(c.image_revision,old.image_revision);assert.deepEqual(c.rank,old.rank);assert.deepEqual(c.star,old.star);if(pilot.has(gk+'/'+key))assert.deepEqual(c,old);
  for(const host of c.applies_to??g.applies_to){assert.ok(vegetables[host],host);assert.ok(g.applies_to.includes(host));}
 }
}
assert.equal(inventory.length,220);TroublesDataSchema.parse(next);
const contentChanges=changed.map(({group,key,fields,decisions})=>({group,key,decisions,changes:Object.fromEntries(fields.map(f=>[f,{before:original[group].conditions[key][f],after:next[group].conditions[key][f]}]))}));
const conflicts=[];
for(const j of changed){const old=original[j.group].conditions[j.key],fresh=next[j.group].conditions[j.key];for(const [crop,v]of Object.entries(vegetables)){if(!(v.troubles_detail??[]).includes(j.group)&&!next[j.group].applies_to.includes(crop))continue;const entries=Object.entries(v.troubles??{}).filter(([label])=>[old.name,fresh.name].some(n=>n.toLowerCase()===label.toLowerCase()));for(const[label,value]of entries)conflicts.push({crop,path:`troubles.${label}`,group:j.group,condition:j.key,classification:'requires comparison with approved embedded advice; not every textual difference is a factual conflict',current_vegetable_advice:value,changed_trouble_fields:j.fields});}}
const groups=Object.keys(next).filter(k=>canonical(original[k])!==canonical(next[k]));
const report={at:new Date().toISOString(),actor:'AI:GPT-6',expected_revision:expected,reviewed:220,pilot_preserved:4,remaining_reviewed:216,changed_conditions:changed.length,changed_groups:groups,inventory,changes:contentChanges,group_only_changes:Object.fromEntries([...decisions].filter(([k])=>k.endsWith('/$symptom_lookup'))),vegetable_comparison_queue:conflicts,unresolved:changed.flatMap(j=>j.decisions.filter(d=>d.uncertain).map(d=>({group:j.group,key:j.key,note:d.uncertain})))};
fs.writeFileSync(path.join(out,'BROAD-PLAN.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({reviewed:220,changed:changed.length,groups,comparison_candidates:conflicts.length,unresolved:report.unresolved.length,apply:process.argv.includes('--apply')},null,2));
if(!process.argv.includes('--apply'))process.exit(0);
const priorBytes=Object.fromEntries(['vegetables','troubles'].flatMap(col=>Object.keys(readCollection(col)).map(key=>[path.relative(dataRoot,recordPath(dataRoot,col,key)),fs.readFileSync(recordPath(dataRoot,col,key))]))),backupRoot=path.join(dataRoot,'backups/admin'),priorBackups=new Set(fs.readdirSync(backupRoot));
// Source pass cannot modify the AI layer; print changes are reserved for the AI-guarded pass.
const source=structuredClone(next);for(const gk of groups)for(const key of Object.keys(source[gk].conditions))for(const f of printFields)source[gk].conditions[key]['ai_'+f]=original[gk].conditions[key]['ai_'+f];
const sourceReceipt=saveCollections({troubles:source},{actor:'User-authorised AI:GPT-6 broader troubles source normalisation',expectedRevision:expected});
const intermediateBytes=Object.fromEntries(groups.map(gk=>[gk,fs.readFileSync(recordPath(dataRoot,'troubles',gk))]));
const drafts=readCollection('troubles'),now=new Date().toISOString();
for(const {group,key}of changed){const c=drafts[group].conditions[key];for(const f of printFields){assertAiWritable(c,f);c['ai_'+f]=next[group].conditions[key]['ai_'+f];const m=c.ai_print.fields[f];m.status='draft';m.updated_at=now;m.updated_by='AI:GPT-6';delete m.approved_at;delete m.approved_by;for(const dep of new Set([...Object.keys(m.dependencies),...printFields,'name','applies_to','active_period']))m.dependencies[dep]=signature(c[dep]);m.output_signature=signature(c['ai_'+f]);}}
for(const gk of groups){const g=drafts[gk];g.ai_layout.status='draft';g.ai_layout.updated_at=now;g.ai_layout.updated_by='AI:GPT-6';delete g.ai_layout.approved_at;delete g.ai_layout.approved_by;g.ai_layout.source_signature=layoutSourceSignature(g);assert.deepEqual(g.ai_layout.pages,original[gk].ai_layout.pages);}
TroublesDataSchema.parse(drafts);const draftReceipt=saveCollections({troubles:drafts},{actor:'AI:GPT-6',expectedRevision:sourceReceipt.revision});
const backups=fs.readdirSync(backupRoot).filter(x=>!priorBackups.has(x)).sort();assert.equal(backups.length,2);
const verification=backups.map((b,i)=>{const folder=path.join(backupRoot,b),journal=JSON.parse(fs.readFileSync(path.join(folder,'transaction.json')));assert.equal(journal.state,'complete');for(const f of journal.files){const bytes=fs.readFileSync(path.join(folder,f.backup)),gk=f.file.split('/')[1];assert.ok(bytes.equals(i===0?priorBytes[f.file]:intermediateBytes[gk]),'Backup byte mismatch '+f.file);}return {folder,files:journal.files.length,exact_prior_bytes_verified:true};});
for(const[file,bytes]of Object.entries(priorBytes))if(file.startsWith('vegetables/')||!groups.includes(file.split('/')[1]))assert.ok(fs.readFileSync(path.join(dataRoot,file)).equals(bytes),'Unrelated record changed');
const saved=readCollection('troubles');for(const[gk,g]of Object.entries(saved)){assert.equal(g.ai_layout.source_signature,layoutSourceSignature(g));for(const c of Object.values(g.conditions))for(const f of printFields)assert.ok(reviewAiField(c,f,c,true).usable);}
const receipt={at:now,sourceReceipt,draftReceipt,backups:verification,changed_conditions:changed.length,groups,vegetable_records_byte_identical:44,pilot_conditions_byte_content_identical:4,prior_record_sha256:Object.fromEntries(Object.entries(priorBytes).map(([p,b])=>[p,sha(b)]))};fs.writeFileSync(path.join(out,'BROAD-RECEIPT.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({...receipt,prior_record_sha256:'saved'},null,2));
