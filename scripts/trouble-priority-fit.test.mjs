import test from 'node:test';
import assert from 'node:assert/strict';
import {packPriority,explorePriorityFit} from './lib/trouble-priority-fit.mjs';

test('whole entries cannot be split or silently dropped',()=>{
 assert.equal(packPriority(['large'],{large:121},[120,120]),null);
 const p=packPriority(['a','b','c'],{a:60,b:60,c:60},[120,120]);
 assert.equal(p.length,2);assert.deepEqual(p.flatMap(p=>p.keys),['a','b','c']);
});
test('final content can balance into two natural columns without added spacing',()=>{
 const p=packPriority(['a','b'],{a:30,b:35},[120,120]);
 assert.deepEqual(p[0].columns,[['a'],['b']]);assert.deepEqual(p[0].heights,[30,35]);
});
test('features cannot be consecutive or directly opposite',()=>{
 assert.throws(()=>explorePriorityFit(['a','b'],{a:40,b:40},[120,120],[{key:'a',rank:10,star:true},{key:'b',rank:9,star:true}]),/star separation/);
});
test('fit exploration preserves coverage and the one-page movement boundary',()=>{
 const order=Array.from({length:10},(_,i)=>'p'+i),values=[30,60,45,40,30,55,40,30,20,50];
 const heights=Object.fromEntries(order.map((k,i)=>[k,values[i]])),ranks=[10,9,9,8,8,7,6,6,5,4];
 const result=explorePriorityFit(order,heights,[120,120],order.map((key,i)=>({key,rank:ranks[i],star:false})));
 assert.deepEqual([...result.selected.order].sort(),order);
 assert.ok(result.selected.score<=result.baseline.score);
 for(const key of order)assert.ok(Math.abs(result.selected.pageByKey[key]-result.baseline.pageByKey[key])<=1);
 assert.equal(result.selected.pageByKey.p0,0);
});
