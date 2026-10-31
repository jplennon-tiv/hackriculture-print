import test from 'node:test';
import assert from 'node:assert/strict';
import {headingPage,compactReferences,indexPageOffsets} from './lib/book-index.mjs';
import {readBookLayout,validateBookLayout} from '../../hackriculture-data/lib/book-layout.mjs';

test('condition locators use the explanation heading rather than an incidental mention',()=>{
 const pages=['An introduction mentions slugs and snails in passing.','ALL CROPS\n\nSlugs and Snails\nRECOGNISE\n\nHoles and slime trails.'];
 assert.equal(headingPage(pages,'Slugs and Snails'),1);
 assert.equal(headingPage([...pages].reverse(),'Slugs and Snails'),0);
 assert.throws(()=>headingPage(['Slugs and Snails\n\nAdvice.','Slugs and Snails\nRECOGNISE'],'Slugs and Snails'),/found 2/);
 assert.throws(()=>headingPage(['Only a passing reference to clubroot.'],'Clubroot'),/found 0/);
});
test('ranges deduplicate consecutive pages and keep temporary topic namespaces distinct',()=>{
 const rows=[{prefix:'',folio:9},{prefix:'T',folio:2},{prefix:'',folio:8},{prefix:'',folio:9},{prefix:'C',folio:2},{prefix:'T',folio:3},{prefix:'',folio:11}].map((x,i)=>({...x,pdf:'source.pdf',page:i+1}));
 assert.deepEqual(compactReferences(rows).map(r=>r.label),['8–9','11','C2','T2–T3']);
 const moved=rows.map(x=>({...x,folio:x.folio+10}));
 assert.deepEqual(compactReferences(moved).map(r=>r.label),['18–19','21','C12','T12–T13']);
});
test('page-specific index locators stay within the named section',()=>{
 assert.deepEqual(indexPageOffsets({source:'technique:netting'},2),[0,1]);
 assert.deepEqual(indexPageOffsets({source:'technique:supports',pageOffset:1},2),[1]);
 for(const pageOffset of [-1,2,0.5,'1'])assert.throws(()=>indexPageOffsets({source:'technique:supports',pageOffset},2),/Invalid index page offset/);
 const data=readBookLayout();
 for(const ref of [{source:'technique:supports',pageOffset:-1},{source:'technique:supports',pageOffset:0.5},{source:'trouble:brassica_troubles',condition:'pigeons',pageOffset:0}]){
  const bad=structuredClone(data);bad.index.entries.find(e=>e.refs).refs=[ref];
  assert.throws(()=>validateBookLayout(bad),/pageOffset/);
 }
});
test('index editing rejects broken destinations, alias chains and unknown source identities',()=>{
 const data=readBookLayout();
 const bad=structuredClone(data);bad.index.entries.find(e=>e.see).see='does-not-exist';
 assert.throws(()=>validateBookLayout(bad),/missing or self cross-reference/);
 const chain=structuredClone(data);const aliases=chain.index.entries.filter(e=>e.see);aliases[0].see=aliases[1].id;
 assert.throws(()=>validateBookLayout(chain),/directly to a substantive/);
 const source=structuredClone(data);source.index.entries.find(e=>e.refs).refs[0]={source:'vegetable:missing_crop'};
 assert.throws(()=>validateBookLayout(source),/unknown record/);
 const duplicate=structuredClone(data);duplicate.index.entries.push(structuredClone(duplicate.index.entries[0]));
 assert.throws(()=>validateBookLayout(duplicate),/duplicate entry identity/);
});
