// Run only after explicit user approval of the named proof. No text generation.
import assert from 'node:assert/strict';
import {readCollection,saveCollections,revision} from '../../hackriculture-data/lib/records.mjs';
import {reviewAiField,printFields,layoutSourceSignature} from '../src/lib/aiPrint.ts';
const key=process.argv[2];if(!key||process.argv[3]!=='--approved-by-john')throw Error('Usage: approve-troubles-ai.mjs GROUP --approved-by-john (requires explicit approval)');
const rev=revision(),data=readCollection('troubles'),group=data[key];assert(group?.ai_layout,'No saved proof');
assert.equal(group.ai_layout.source_signature,layoutSourceSignature(group),'Layout source changed since proof');
assert.equal(group.ai_layout.renderer,'troubles-cards-2','Layout version changed');
const now=new Date().toISOString();
for(const condition of Object.values(group.conditions))for(const field of printFields){
 assert(reviewAiField(condition,field,condition,true).usable,condition.name+': '+field+' needs review');
 const meta=condition.ai_print.fields[field];if(meta.status!=='approved')Object.assign(meta,{status:'approved',approved_at:now,approved_by:'John Lennon'});
}
if(group.ai_layout.status!=='approved')Object.assign(group.ai_layout,{status:'approved',approved_at:now,approved_by:'John Lennon'});
console.log(saveCollections({troubles:data},{actor:'admin',expectedRevision:rev}));
