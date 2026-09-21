import {readCollection} from '../../hackriculture-data/lib/records.mjs';
// Read-only review queue. No AI calls and no file mutations.
import {reviewAiField,printFields,layoutSourceSignature} from '../src/lib/aiPrint.ts';
const data=readCollection('troubles');
const keys=process.argv.slice(2);if(!keys.length)keys.push('carrot_and_parsnip_troubles');
const report=[],layouts=[];
for(const key of keys){
 const group=data[key];if(!group)throw Error('Unknown trouble group: '+key);
 const plan=group.ai_layout;
 if(!plan)layouts.push({group:key,reason:'not prepared'});
 else if(plan.source_signature!==layoutSourceSignature(group)||plan.renderer!=='troubles-cards-2')layouts.push({group:key,reason:'source or design changed'});
 else if(plan.status!=='approved')layouts.push({group:key,reason:'draft awaiting approval'});
 for(const [id,condition]of Object.entries(group.conditions??{})){
  for(const field of printFields){
   const result=reviewAiField(condition,field,condition);
   if(!result.usable)report.push({group:key,condition:id,field,reason:result.reason??'not prepared',locked:condition.ai_print?.fields[field]?.locked??false});
  }
 }
}
console.log(JSON.stringify({reviewRequired:report.length+layouts.length,fields:report,layouts},null,2));
