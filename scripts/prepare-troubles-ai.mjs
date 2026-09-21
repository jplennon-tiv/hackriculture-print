// Prepare review-only fields; --apply uses the backed-up shared writer. No AI calls.
// Usage: node scripts/prepare-troubles-ai.mjs <saved-plan.json>
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {readCollection,saveCollections,revision} from '../../hackriculture-data/lib/records.mjs';
import {signature,assertAiWritable,printFields,layoutSourceSignature} from '../src/lib/aiPrint.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(!process.argv[2])throw Error('Supply a saved trial plan; add --apply only when ready to store its draft fields.');
const plan=JSON.parse(fs.readFileSync(path.resolve(process.argv[2]),'utf8'));
const dataRoot=path.resolve(root,'../hackriculture-data'),rev=revision(dataRoot);
const data=readCollection('troubles',dataRoot),group=data[plan.group];
const before=JSON.stringify(group);
const source=structuredClone(group);
delete source.ai_layout;delete source.ai_introduction;delete source._field_metadata;
for(const condition of Object.values(source.conditions??{})){
 delete condition.ai_print;for(const field of printFields)delete condition[`ai_${field}`];
}
assert.deepEqual(source,plan.source,'Source differs from saved trial; review source changes first.');
const updated_at=new Date().toISOString();
for(const [key,condition]of Object.entries(group.conditions)){
 const copy=plan.copy[key];if(!copy)throw Error(`Missing trial copy: ${key}`);
 const dependencies=Object.fromEntries([...printFields,'name','applies_to','active_period'].map(key=>[key,signature(condition[key])]));
 for(const field of printFields){
  assertAiWritable(condition,field);
  // Do not downgrade or replace previously reviewed/approved copy automatically.
  if(condition[`ai_${field}`]!==undefined)continue;
  const value=copy[{description:'recognise',treatment:'act',prevention:'prevent'}[field]];
  if(value!==null&&typeof value!=='string')throw Error(`Invalid trial text: ${key}.${field}`);
  condition[`ai_${field}`]=value;
  condition.ai_print??={version:1,fields:{}};
  condition.ai_print.fields[field]={updated_at,updated_by:'AI (original trial model not recorded)',status:'draft',locked:false,dependencies,output_signature:signature(value)};
 }
}
if(!group.ai_layout){
 // Existing reviewed trial wording, not newly generated advice. Keep manual text.
 group.ai_introduction??=[plan.copy.__intro.recognise,plan.copy.__intro.prevent].filter(Boolean).join('\n\n');
 group.ai_layout={version:1,status:'draft',renderer:'troubles-cards-2',updated_at,updated_by:'AI (pilot layout)',
  hero_images:['/images/vegetables/carrot.png','/images/vegetables/parsnip.png'],
  pages:[{intro_height_mm:48,columns:[[{key:'old_seed_poor_germination',height_mm:93.5},{key:'green_top',height_mm:93.5}],[{key:'carrot_fly',height_mm:190}]]},
   ...plan.pages.slice(1).map(keys=>({columns:[keys.slice(0,2),keys.slice(2)].map(col=>col.map(key=>({key:key==='green_top'?'parsnip_canker':key,height_mm:117.5})))}))],
  source_signature:layoutSourceSignature(group),
 };
}
if(before===JSON.stringify(group)){console.log('No changes needed.');}
else if(process.argv.includes('--apply'))console.log(saveCollections({troubles:data},{root:dataRoot,actor:'AI: assisted print',expectedRevision:rev}));
else console.log('Draft additions ready. Use --apply to save with automatic backups and field stamps.');
