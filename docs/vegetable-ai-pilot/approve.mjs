// Run only after explicit user approval of the exact selected proof crops.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readCollection,revision,saveCollections,refreshGenerated} from '../../../hackriculture-data/lib/records.mjs';
import {resolveVegetableExtracts,resolveVegetablePrintLayout} from '../../src/lib/vegetablePrint.ts';
const rev=revision(),data=readCollection('vegetables'),before=structuredClone(data);
const rollout=process.argv.includes('--rollout');
const keys=rollout?['beetroot','carrot','lettuce','bean_broad','bean_french','bean_runner']:['asparagus','radish','celery'];
const now=new Date().toISOString(),actor=rollout?'admin: John approved corrected six-crop rollout proofs, 21 September 2026':'admin: John approved three vegetable proofs, 21 September 2026';
for(const key of keys){
 const v=data[key],plan=v.ai_print_layout;
 assert.deepEqual(resolveVegetableExtracts(v,true).warnings,[]);
 assert.equal(resolveVegetablePrintLayout(v,true).warning,null);
 for(const [file,hash] of Object.entries(plan.measurements.renderer_files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hash,file);
 assert.equal(plan.measurements.results.length,2);
 for(const r of plan.measurements.results){assert.equal(r.pages,2);assert.deepEqual(r.warnings,[]);assert.deepEqual(r.missing,[]);}
 for(const e of [...Object.values(v.ai_print_extracts.sections),plan]){
  assert.equal(e.status,'draft');assert.equal(e.locked,false);
  e.status='approved';e.updated_at=now;e.updated_by=actor;
 }
 assert.deepEqual(resolveVegetableExtracts(v).warnings,[]);
 assert.equal(resolveVegetablePrintLayout(v).warning,null);
}
const undo=structuredClone(data);
for(const key of keys){
 for(const [slot,e] of Object.entries(undo[key].ai_print_extracts.sections))for(const f of ['status','updated_at','updated_by'])e[f]=before[key].ai_print_extracts.sections[slot][f];
 for(const f of ['status','updated_at','updated_by'])undo[key].ai_print_layout[f]=before[key].ai_print_layout[f];
}
assert.deepEqual(undo,before);
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor}));refreshGenerated();
