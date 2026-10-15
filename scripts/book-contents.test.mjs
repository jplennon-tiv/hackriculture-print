import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createContentsPlan,renderUpdatedContents} from './lib/book-contents.mjs';
import {readBookContent} from './lib/book-content.mjs';
import {validateBookLayout} from '../../hackriculture-data/lib/book-layout.mjs';
const base=JSON.parse(fs.readFileSync('docs/publication/book-preparation/ASSEMBLY-PLAN-BOOKVAULT.json'));
const topics=JSON.parse(fs.readFileSync('docs/publication/topic-pages/techniques-expansion/COLLECTION-APPROVAL.json')).pageIds;
const sources=Object.fromEntries(['imperial','metric'].map(u=>[u,Object.fromEntries([...topics.map(s=>'technique:'+s),...['overview','no-dig','digging','digging-finish'].map(s=>'cultivation:'+s),'back:index'].map(s=>[s,{pdf:'fixture.pdf',sourcePage:1,physicalPages:s==='back:index'?4:1}]))]));
test('proposed pagination covers every page once and preserves crop spreads and blanks',()=>{
 const before=structuredClone(base),{plan,topicMap}=createContentsPlan(base,sources);
 assert.deepEqual(base,before);
 for(const [unit,e] of Object.entries(plan.editions)){
  const occupied=plan.openingPlan.map(p=>p.page);
  for(const d of e.documents){occupied.push(...Array.from({length:d.physicalPages},(_,i)=>d.startPage+i),...d.blankFoliosAfter);if(d.type==='vegetable')assert.equal(d.startPage%2,0);}
  occupied.push(...e.sectionOpeners.filter(d=>d.startPage>9).map(d=>d.startPage),...e.extraBlanks.filter(d=>d.page>9).map(d=>d.page));
  occupied.push(...e.additions.filter(d=>d.source!=='technique:why-grow').map(d=>d.startPage),...Array.from({length:e.index.physicalPages},(_,i)=>e.index.startPage+i));
  assert.deepEqual(occupied.sort((a,b)=>a-b),Array.from({length:174},(_,i)=>i+1));
  assert.equal(e.documents[0].startPage,10);assert.equal(e.index.startPage,170);assert.equal(e.techniquePages,16);
  assert.deepEqual(e.sectionOpeners.map(x=>x.startPage),[8,107,153]);
  assert.ok(e.sectionOpeners.filter(x=>x.source!=='opening:varieties').every(x=>x.startPage%2===1));
  assert.equal(e.sectionOpeners[0].startPage%2,0);
  assert.ok(e.extraBlanks.some(x=>x.page===3));
  assert.ok(e.extraBlanks.some(x=>x.page===6));
  assert.ok(!e.extraBlanks.some(x=>x.page===9));
  for(const [a,b] of [['technique:plot-layout','technique:plot-layout-branching'],['cultivation:digging','cultivation:digging-finish'],['technique:compost-bins','technique:compost-use'],['technique:greenhouse-beds','technique:greenhouse-no-dig-seasons']]){assert.equal(topicMap[unit][a]%2,0);assert.equal(topicMap[unit][b],topicMap[unit][a]+1);}
  assert.deepEqual(e.documents.map(d=>d.startPage%2),base.editions[unit].documents.map(d=>d.startPage%2));
  assert.equal(topicMap[unit]['technique:why-grow'],7);assert.equal(topicMap[unit]['cultivation:overview'],158);
 }
});
test('contents include every added destination once, and reject unresolved or duplicate destinations',()=>{
 const {data}=readBookContent(),{plan}=createContentsPlan(base,sources),themes=JSON.parse(fs.readFileSync('src/print/familyThemes.json'));
 for(const unit of ['imperial','metric'])assert.equal(renderUpdatedContents(data,unit,plan,themes).references.length,80);
 const bad=structuredClone(data);bad.contents.expanded.groups[0].entries[0].source='technique:missing';
 assert.throws(()=>renderUpdatedContents(bad,'imperial',plan,themes),/Missing or duplicate/);
 bad.contents.expanded.groups[0].entries[0].source=bad.contents.expanded.gettingStarted.entries[0].source;
 assert.throws(()=>validateBookLayout(bad),/unique stable/);
});
