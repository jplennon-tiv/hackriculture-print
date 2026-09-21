import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {readCollection,saveCollections,revision,refreshGenerated} from '../../hackriculture-data/lib/records.mjs';
import {signature,printFields,layoutSourceSignature} from '../src/lib/aiPrint.ts';
import plans from '../docs/troubles-design/batch-05-copy.mjs';
import sourceEdits from '../docs/troubles-design/batch-05-source-edits.mjs';
const data=readCollection('troubles'),rev=revision();
for(const [slug,p]of Object.entries(plans)){assert(!data[slug].ai_layout);assert.deepEqual(Object.keys(p.copy).sort(),Object.keys(data[slug].conditions).sort());for(const c of Object.values(data[slug].conditions))assert(!c.ai_print);}
const edits=sourceEdits;
for(const [slug,conditions]of Object.entries(edits))for(const [key,fields]of Object.entries(conditions))Object.assign(data[slug].conditions[key],fields);
const images=JSON.parse(fs.readFileSync('docs/troubles-design/batch-05-results.json','utf8'));assert.equal(images.length,8);
for(const j of images){const c=data[j.group].conditions[j.key];assert(c);c.image='/'+j.destination.replace(/^public\//,'');c.image_revision=createHash('sha256').update(fs.readFileSync(j.destination)).digest('hex');}
console.log('Source/art',saveCollections({troubles:data},{actor:'User-authorised organic source correction and artwork batch 05 (model not recorded)',expectedRevision:rev}));
const draftRev=revision(),now=new Date().toISOString(),actor='AI: assisted print (model not recorded)';
for(const [slug,p]of Object.entries(plans)){
 const g=data[slug];for(const [key,values]of Object.entries(p.copy)){
 const c=g.conditions[key],dependencies=Object.fromEntries([...printFields,'name','applies_to','active_period'].map(f=>[f,signature(c[f])]));
 c.ai_print={version:1,fields:{}};printFields.forEach((f,i)=>{c['ai_'+f]=values[i];c.ai_print.fields[f]={updated_at:now,updated_by:actor,status:'draft',locked:false,dependencies,output_signature:signature(values[i])};});
 }
 g.ai_introduction=p.intro;const keys=Object.keys(p.copy),pages=[];
 while(keys.length){const b=keys.splice(0,4),split=b.length===2?1:2,cols=[b.slice(0,split),b.slice(split)];pages.push({...pages.length===0?{intro_height_mm:32}:{},columns:cols.map(c=>c.map(key=>({key,height_mm:((pages.length===0?206:238)-(c.length-1)*3)/c.length})))});}
 g.ai_layout={version:1,status:'draft',renderer:'troubles-cards-2',updated_at:now,updated_by:actor,hero_images:p.heroes.map(k=>'/images/vegetables/'+k+'.png'),pages,source_signature:layoutSourceSignature(g)};
}
console.log('Drafts',saveCollections({troubles:data},{actor,expectedRevision:draftRev}));refreshGenerated();
