import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readCollection} from '../../hackriculture-data/lib/records.mjs';
import {resolveNavigation,cropMention} from './lib/book-navigation.mjs';
import {sectionNames,sectionLabel,topicHeadings} from './lib/book-review-refinements.mjs';
const edition=JSON.parse(fs.readFileSync('docs/publication/contents-update/ASSEMBLY-PROPOSAL.json','utf8')).editions.imperial;
const crops=readCollection('vegetables'),troubles=readCollection('troubles');
const texts=Object.fromEntries([...edition.documents.filter(d=>d.type==='trouble').map(d=>['trouble:'+d.key,Array(d.physicalPages).fill(troubles[d.key].applies_to.map(k=>crops[k].name).join(' / '))]),...edition.additions.map(d=>[d.source,['General growing advice.']])]);
test('Every second page has one combined title; named third pages are retained',()=>{
  const n=resolveNavigation(edition,crops,troubles,texts);
  assert.equal(n.decisions.length,44);assert.equal(n.pages.filter(p=>p.newHeading).length,44);
  assert.equal(n.pages.filter(p=>p.existingNamedContinuation).length,4);
  assert.equal(n.pages.find(p=>p.key==='carrot'&&p.offset===1).newHeading,'Growing guide · Carrot');
  assert.ok(n.pages.filter(p=>p.offset===0).every(p=>!p.links.length));
});
test('Membership alone is insufficient; each page in a range must name the crop',()=>{
  const explicit=structuredClone(texts);explicit['trouble:carrot_and_parsnip_troubles']=['Carrot fly.','Parsnip only.','Carrots with root damage.'];
  const carrot=resolveNavigation(edition,crops,troubles,explicit).decisions.find(d=>d.key==='carrot');
  assert.deepEqual(carrot.links.map(l=>[l.start,l.end,l.offset]),[[120,120,0],[122,122,2]]);
});
test('No generic technique or index fallback for crops without explicit mentions',()=>{
  const n=resolveNavigation(edition,crops,troubles,texts);
  for(const key of ['mushroom','artichoke_globe','aubergine'])assert.deepEqual(n.decisions.find(d=>d.key===key).links,[]);
  assert.ok(n.decisions.every(d=>d.links.every(l=>l.source!=='back:index')));
});
test('Mention matching respects word boundaries, source notes and growing context',()=>{
  assert.equal(cropMention('Repeat watering.', 'pea',crops.pea,'technique:watering'),null);
  assert.equal(cropMention('General advice. John: Pea JSON.', 'pea',crops.pea,'technique:sowing'),null);
  assert.ok(cropMention('Sow peas.', 'pea',crops.pea,'technique:sowing'));
  assert.equal(cropMention('Grow tomatoes.', 'tomato_outdoor',crops.tomato_outdoor,'technique:greenhouse-beds'),null);
  assert.ok(cropMention('Grow tomatoes.', 'tomato_greenhouse',crops.tomato_greenhouse,'technique:greenhouse-beds'));
});
test('Specific technique mentions qualify and destinations follow a relocated plan',()=>{
  const explicit=structuredClone(texts);explicit['technique:rotation']=['Peas and carrots.'];
  const before=resolveNavigation(edition,crops,troubles,explicit);
  assert.ok(before.decisions.find(d=>d.key==='carrot').links.some(l=>l.source==='technique:rotation'));
  assert.ok(!before.decisions.find(d=>d.key==='beetroot').links.some(l=>l.source==='technique:rotation'));
  const moved=structuredClone(edition);for(const d of [...moved.documents,...moved.additions])d.startPage+=20;
  const after=resolveNavigation(moved,crops,troubles,explicit);
  for(let i=0;i<before.decisions.length;i++)for(let k=0;k<before.decisions[i].links.length;k++)assert.equal(after.decisions[i].links[k].start,before.decisions[i].links[k].start+20);
  delete explicit['trouble:beetroot_troubles'];assert.throws(()=>resolveNavigation(edition,crops,troubles,explicit),/Missing page text/);
});

test('Section labels follow the section boundaries; blanks and title have no footer',()=>{
  const n=resolveNavigation(edition,crops,troubles,texts);
  for(const [folio,label] of [[2,'THE VEGETABLE GURU'],[7,'THE VEGETABLE GURU'],[8,'VEGETABLE GUIDES'],[105,'VEGETABLE GUIDES'],[107,'VEGETABLE TROUBLES'],[152,'VEGETABLE TROUBLES'],[153,'GROWING TECHNIQUES'],[169,'GROWING TECHNIQUES'],[170,'INDEX']]) {
    assert.equal(sectionLabel(folio,edition),label);
    assert.equal(n.pages.find(p=>p.folio===folio).label,label);
  }
  for(const blank of [1,3,6,17,71,89,93,106,174])assert.ok(!n.pages.some(p=>p.folio===blank));
  assert.equal(n.pages.length,165);
  assert.ok(n.decisions.flatMap(d=>d.links).every(l=>[sectionNames.trouble,sectionNames.technique].includes(l.label)));
  assert.equal(Object.keys(topicHeadings).length,16);
  for(const heading of Object.values(topicHeadings))assert.ok(edition.additions.some(d=>d.source===heading.source));
});

test('Technique topic families keep a common first line and distinct page qualifiers',()=>{
  const headings=Object.values(topicHeadings);
  assert.deepEqual(headings.filter(h=>h.group==='Cultivation').map(h=>[h.eyebrow,...h.lines]),[
    ['Growing Techniques - Cultivation','Dig or No-Dig','Choosing your approach'],
    ['Growing Techniques - Cultivation','Dig or No-Dig','No dig'],
    ['Growing Techniques - Cultivation','Dig or No-Dig','Digging part 1'],
    ['Growing Techniques - Cultivation','Dig or No-Dig','Digging part 2'],
  ]);
  for(const group of new Set(headings.map(h=>h.group))){
    const pages=headings.filter(h=>h.group===group);
    assert.equal(new Set(pages.map(h=>h.lines[0])).size,1,group);
    assert.equal(new Set(pages.map(h=>h.eyebrow)).size,1,group);
    assert.equal(new Set(pages.map(h=>h.lines[1])).size,pages.length,group);
    assert.ok(pages.every(h=>h.lines.length===2&&h.lines.every(Boolean)));
  }
  assert.deepEqual(new Set(headings.map(h=>h.source)),new Set(edition.additions.filter(d=>d.source!=='technique:why-grow').map(d=>d.source)));
});
