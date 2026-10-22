import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createContentsPlan,renderUpdatedContents} from './lib/book-contents.mjs';
import {readBookContent} from './lib/book-content.mjs';
import {validateBookLayout} from '../../hackriculture-data/lib/book-layout.mjs';
const base=JSON.parse(fs.readFileSync('docs/publication/book-preparation/ASSEMBLY-PLAN-BOOKVAULT.json'));
const topics=JSON.parse(fs.readFileSync('docs/publication/topic-pages/techniques-expansion/COLLECTION-APPROVAL.json')).pageIds;
const sources=Object.fromEntries(['imperial','metric'].map(u=>[u,Object.fromEntries([...topics.map(s=>'technique:'+s),...['overview','no-dig','digging','digging-finish'].map(s=>'cultivation:'+s),'technique:nutrient-cycles','back:index'].map(s=>[s,{pdf:'fixture.pdf',sourcePage:1,physicalPages:s==='back:index'?4:s==='technique:rotation'?2:1}]))]));
test('proposed pagination covers every page once and preserves crop spreads and blanks',()=>{
 const before=structuredClone(base),{plan,topicMap}=createContentsPlan(base,sources);
 assert.deepEqual(base,before);
 for(const [unit,e] of Object.entries(plan.editions)){
  const occupied=plan.openingPlan.map(p=>p.page);
  for(const d of e.documents){occupied.push(...Array.from({length:d.physicalPages},(_,i)=>d.startPage+i),...d.blankFoliosAfter);if(d.type==='vegetable')assert.equal(d.startPage%2,0);}
  occupied.push(...e.sectionOpeners.filter(d=>d.startPage>9).map(d=>d.startPage),...e.extraBlanks.filter(d=>d.page>9).map(d=>d.page));
  occupied.push(...e.additions.filter(d=>d.source!=='technique:why-grow').flatMap(d=>Array.from({length:d.physicalPages},(_,i)=>d.startPage+i)),...Array.from({length:e.index.physicalPages},(_,i)=>e.index.startPage+i));
  assert.deepEqual(occupied.sort((a,b)=>a-b),Array.from({length:176},(_,i)=>i+1));
  assert.equal(e.documents[0].startPage,10);assert.equal(e.index.startPage,172);assert.equal(e.techniquePages,18);
  assert.deepEqual(e.sectionOpeners.map(x=>x.startPage),[9,107,153]);
  assert.ok(e.sectionOpeners.filter(x=>x.source!=='opening:varieties').every(x=>x.startPage%2===1));
  assert.equal(e.sectionOpeners[0].startPage%2,1);
  assert.ok(e.extraBlanks.some(x=>x.page===8));
  assert.ok(e.extraBlanks.some(x=>x.page===3));
  assert.ok(e.extraBlanks.some(x=>x.page===6));
  assert.ok(!e.extraBlanks.some(x=>x.page===9));
  for(const [a,b] of [['technique:plot-layout','technique:plot-layout-branching'],['cultivation:digging','cultivation:digging-finish'],['technique:compost-bins','technique:compost-use'],['technique:greenhouse-beds','technique:greenhouse-no-dig-seasons']])assert.equal(topicMap[unit][b],topicMap[unit][a]+1);
  assert.deepEqual(e.documents.map(d=>d.startPage%2),base.editions[unit].documents.map(d=>d.startPage%2));
  assert.equal(topicMap[unit]['technique:why-grow'],7);assert.equal(topicMap[unit]['cultivation:overview'],163);
 }
});
test('contents include every added destination once, and reject unresolved or duplicate destinations',()=>{
 const {data}=readBookContent(),{plan}=createContentsPlan(base,sources),themes=JSON.parse(fs.readFileSync('src/print/familyThemes.json'));
 for(const unit of ['imperial','metric'])assert.equal(renderUpdatedContents(data,unit,plan,themes).references.length,81);
 const bad=structuredClone(data);bad.contents.expanded.groups[0].entries[0].source='technique:missing';
 assert.throws(()=>renderUpdatedContents(bad,'imperial',plan,themes),/Missing or duplicate/);
 bad.contents.expanded.groups[0].entries[0].source=bad.contents.expanded.gettingStarted.entries[0].source;
 assert.throws(()=>validateBookLayout(bad),/unique stable/);
});
test('four approved two-page guides remove overflow and alignment leaves, preserving facing spreads',()=>{
 const keys=['carrot','onion_shallot','tomato_greenhouse','tomato_outdoor'];
 const replacements=Object.fromEntries(['imperial','metric'].map(u=>[u,Object.fromEntries(keys.map(key=>[key,{key,pdf:`${u}/${key}.pdf`,sha256:'fixture',physicalPages:2}]))]));
 const before=structuredClone(base),{plan}=createContentsPlan(base,sources,replacements);
 assert.deepEqual(base,before);
 for(const [u,e] of Object.entries(plan.editions)){
  assert.equal(e.plannedEvenTotal,168);assert.equal(e.index.startPage,164);
  assert.ok(!e.extraBlanks.some(b=>b.page>=145&&b.page<164));
  assert.deepEqual(e.sectionOpeners.map(d=>d.startPage),[9,99,145]);
  const crops=e.documents.filter(d=>d.type==='vegetable');
  assert.equal(crops.length,44);assert.ok(crops.every(d=>d.physicalPages===2&&d.startPage%2===0&&d.blankAfterPages===0));
  assert.deepEqual(crops.filter(d=>keys.includes(d.key)).map(d=>d.startPage),[14,66,82,84]);
  const occupied=new Set(plan.openingPlan.map(p=>p.page));
  const put=p=>{assert.ok(!occupied.has(p),'Duplicate folio '+p);occupied.add(p);};
  for(const d of e.documents){assert.equal(d.sourceStartPage,base.editions[u].documents.find(o=>o.id===d.id).startPage);for(let f=d.startPage;f<=d.endPage;f++)put(f);}
  e.sectionOpeners.filter(d=>d.startPage>9).forEach(d=>put(d.startPage));e.extraBlanks.filter(d=>d.page>9).forEach(d=>put(d.page));
  e.additions.filter(d=>d.startPage>9).forEach(d=>{for(let i=0;i<d.physicalPages;i++)put(d.startPage+i);});for(let f=e.index.startPage;f<=e.index.endPage;f++)put(f);
  assert.deepEqual([...occupied].sort((a,b)=>a-b),Array.from({length:168},(_,i)=>i+1));
 }
});
