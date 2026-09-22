// Bounded editorial author. Explicit crop-specific selections only; no catalogue defaults.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {extractDependencies,printChecksum,layoutDependencies,VEGETABLE_PRINT_REVISION,assertVegetableExtractWritable} from '../../src/lib/vegetablePrint.ts';
import {VegetableSchema} from '../../src/schema.ts';
export function authorBatch(label,specs,{expectedRevision,revise=false}={}){
 const rev=revision();if(expectedRevision)assert.equal(rev,expectedRevision);
 const data=readCollection('vegetables'),before=structuredClone(data),shared=readCollection('troubles'),now=new Date().toISOString();
 const keys=Object.keys(specs);
 for(const[key,spec]of Object.entries(specs)){
  const v=data[key];assert.ok(v,key);
  if(!revise){assert.equal(v.ai_print_layout,undefined);assert.equal(v.ai_print_extracts,undefined);}
  else {assert.equal(v.ai_print_layout.status,'draft');assert.equal(v.ai_print_layout.locked,false);for(const slot of Object.keys(v.ai_print_extracts.sections))assertVegetableExtractWritable(v,slot);}
  for(const[name,rank]of Object.entries(spec.priorities??{})){assert.ok(v.troubles[name]);v.troubles[name].rank=rank;}
  const selected={};
  for(const [name,rank,signs,control,from] of spec.pests){
   let t=v.troubles?.[name];
   if(spec.pestSources?.[name]){assert.equal(typeof spec.pestSources[name],'string');t={...(t??{}),text:spec.pestSources[name],rank};delete t.control;}
   if(!t){const c=(v.troubles_detail??[]).flatMap(g=>Object.values(shared[g]?.conditions??{})).find(c=>c.name===(from??name));assert.ok(c,name);if(c.applies_to)assert.ok(c.applies_to.includes(key));t={text:[c.description,c.treatment,c.prevention].filter(Boolean).join(' '),rank:c.rank??5};}
   t=structuredClone(t);
   if(t.control&&!/permethrin|heptenophos|mancozeb|lindane|cheshunt|borax|malathion|pirimicarb|insecticide|fungicide|spray.*chemical/i.test(t.control)&&!t.text.includes(t.control))t.text+=' '+t.control;
   t.signs=signs;t.control=control;t.rank=rank;
   selected[name]=t;
  }
  v.troubles={...selected,...Object.fromEntries(Object.entries(v.troubles??{}).filter(([n])=>!Object.hasOwn(selected,n)))};
  const values={};
  for(const[slot,rows]of Object.entries(spec.sections)){
   values[slot]=slot==='key_notes'||slot==='introduction'?rows:rows.map(row=>typeof row==='string'?{text:row,rank:8}:Array.isArray(row)?{text:row[0],rank:8,icon:row[1]}:{text:row,rank:8});
  }
  v.ai_print_extracts={version:1,sections:{}};
  for(const[slot,value]of Object.entries(values)){
   const paths=spec.sourcePaths?.[slot]??(slot==='introduction'?['introduction']:slot==='key_notes'||slot==='final_tips'?['key_notes','soil_facts','looking_after_the_crop','harvesting','sowing_and_planting','calendar']:slot==='sowing_notes'?['sowing_and_planting','calendar','print_planting']:[slot,'calendar']);
   v.ai_print_extracts.sections[slot]={value,dependencies:extractDependencies(v,paths),output_checksum:printChecksum(value),updated_at:now,updated_by:'AI:gpt-6-astra',status:'draft',locked:false,editorial_note:spec.coverage};
  }
  const value={...spec.layout,pest_limit:spec.pests.length,target_pages:2,align_bottoms:true};
  v.ai_print_layout={value,dependencies:layoutDependencies(v),output_checksum:printChecksum({...value,extracts:values}),updated_at:now,updated_by:'AI:gpt-6-astra',status:'draft',locked:false,renderer_revision:VEGETABLE_PRINT_REVISION};
  assert.deepEqual(v.print_planting,before[key].print_planting);VegetableSchema.parse(v);
 }
 for(const k of Object.keys(before).filter(k=>!keys.includes(k)))assert.deepEqual(data[k],before[k]);
 const save=saveCollections({vegetables:data},{expectedRevision:rev,actor:'admin: John authorised organic source/table curation for overnight PDF rollout; authored by AI:gpt-6-astra'});
 const backup=fs.readdirSync('../hackriculture-data/backups/admin',{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name).sort().at(-1);
 const file=`docs/vegetable-ai-pilot/${label}-restore.json`;
 const record=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{label,transactions:[]};
 record.transactions.push({at:now,previous_revision:rev,save,backup:`backups/admin/${backup}`});record.revision=save.revision;record.selected={...record.selected,...Object.fromEntries(Object.entries(specs).map(([k,s])=>[k,s.pests.map(p=>p[0])]))};record.coverage={...record.coverage,...Object.fromEntries(Object.entries(specs).map(([k,s])=>[k,s.coverage]))};
 fs.writeFileSync(file,JSON.stringify(record,null,2)+'\n');console.log(label,save,backup);
}
