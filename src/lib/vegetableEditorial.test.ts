import {describe,it,expect} from 'vitest';
import {rankedSelection,distinctTips,measurementFact} from './vegetableEditorial';
describe('legacy editorial safeguards',()=>{
 it('retains a late starred essential instead of taking the first low-ranked rows',()=>{
  const low=Array.from({length:6},(_,i)=>({text:`minor ${i}`,rank:5}));
  const essential={text:'essential',rank:10,star:true};
  expect(rankedSelection([...low,essential],3)).toEqual([essential,low[0],low[1]]);
 });
 it('does not reorder a complete selection or mutate source arrays',()=>{
  const items=[{text:'first',rank:5},{text:'second',rank:9}];
  expect(rankedSelection(items,3)).toBe(items);
  expect(rankedSelection(items,1)).toEqual([items[1]]);
  expect(items[0].text).toBe('first');
 });
 it('deduplicates repeated tip text without collapsing distinct advice',()=>{
  expect(distinctTips([{text:'Water well.'},{text:' water  well. '},{text:'Water in dry spells.'}])).toHaveLength(2);
 });
 it('prefers data summaries while preserving all variant values in fallback',()=>{
  const variants={early:{metric:'60 cm',imperial:'24 in.'},maincrop:{metric:'75 cm',imperial:'30 in.'}};
  expect(measurementFact(variants,null,'metric')).toBe('early: 60 cm; maincrop: 75 cm');
  expect(measurementFact(variants,{metric:'Earlies 60 cm; maincrop 75 cm',imperial:'Earlies 24 in.; maincrop 30 in.'},'imperial')).toBe('Earlies 24 in.; maincrop 30 in.');
  expect(measurementFact({a:'30 cm',b:'30 cm'},null,'metric')).toBe('30 cm');
 });
});
