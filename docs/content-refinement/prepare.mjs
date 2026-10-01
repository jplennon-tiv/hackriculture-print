import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import{readCollection,revision}from'../../../hackriculture-data/lib/records.mjs';
import{printChecksum,extractDependencies,layoutDependencies,assertVegetableExtractWritable,RICH_CONTENT_LAYOUT_REVISION}from'../../src/lib/vegetablePrint.ts';
import{additions,introCaps,notes,textOverrides}from'./choices.mjs';
const root=path.resolve(import.meta.dirname,'../..'),dir=path.join(root,'../hackriculture-data/planning/vegetable-content-refinement');
const live=readCollection('vegetables'),draft=structuredClone(live),changed=new Map();const now=new Date().toISOString();
const touch=k=>{if(!changed.has(k))changed.set(k,new Set());return changed.get(k);};
const concat=(a,b)=>typeof a==='string'&&typeof b==='string'?a+' '+b:Object.fromEntries(['metric','imperial'].map(u=>[u,(typeof a==='string'?a:a[u])+' '+(typeof b==='string'?b:b[u])]));
for(const c of additions){
 const v=draft[c.key],e=v.ai_print_extracts.sections[c.slot];assertVegetableExtractWritable(live[c.key],c.slot);
 for(const p of c.paths)assert(p.split('.').reduce((v,k)=>v?.[k],v)!==undefined,p);
 if(c.index<0)e.value.push({text:c.text,rank:8});else e.value[c.index].text=concat(e.value[c.index].text,c.text);
 touch(c.key).add(c.slot);
}
for(const c of textOverrides){assertVegetableExtractWritable(live[c.key],c.slot);draft[c.key].ai_print_extracts.sections[c.slot].value[c.index].text=c.text;touch(c.key).add(c.slot);}
for(const[k,n]of Object.entries(introCaps)){draft[k].ai_print_layout.value.intro_sentences=n;touch(k);}
// All crops receive a measured layout review, even when their text stays unchanged.
for(const k of Object.keys(draft))touch(k);
const crops={};
for(const[k,slots]of changed){
 const v=draft[k];assert(!live[k].ai_print_layout.locked);
 v.ai_print_layout.value.fill_bottoms=true;v.ai_print_layout.value.align_bottoms=true;
 const old=live[k].ai_print_layout;assert.equal(printChecksum({...old.value,extracts:Object.fromEntries(Object.entries(live[k].ai_print_extracts.sections).map(([s,e])=>[s,e.value]))}),old.output_checksum,k+' manual layout edit');
 const sections={};
 for(const slot of slots){const e=v.ai_print_extracts.sections[slot];const paths=additions.filter(c=>c.key===k&&c.slot===slot).flatMap(c=>c.paths);Object.assign(e,{updated_at:now,updated_by:'AI:Codex',status:'draft',dependencies:extractDependencies(v,[...Object.keys(e.dependencies),...paths]),output_checksum:printChecksum(e.value),editorial_note:e.editorial_note+' Richer A content review, 30 September: restored source-supported detail while retaining the previous selected text. Added source paths: '+[...new Set(paths)].join(', ')+'. Draft for John’s review.'});sections[slot]=e;}
 Object.assign(v.ai_print_layout,{renderer_revision:RICH_CONTENT_LAYOUT_REVISION,updated_at:now,updated_by:'AI:Codex',status:'draft',dependencies:layoutDependencies(v),output_checksum:printChecksum({...v.ai_print_layout.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))})});
 crops[k]={sections,layout:v.ai_print_layout,sourceAdditions:additions.filter(c=>c.key===k),introCap:introCaps[k]??null};
}
await fs.mkdir(dir,{recursive:true});
await fs.writeFile(path.join(dir,'PROPOSAL.json'),JSON.stringify({status:'draft-not-installed',date:now,expectedRevision:revision(),scope:'All 44 vegetable guides audited. Source-grounded content additions and introduction selections; current approved data unchanged pending review.',crops,retained:notes},null,2)+'\n');
console.log(`Prepared ${Object.keys(crops).length} crop drafts, ${additions.length} source-linked additions; no canonical record changed.`);
