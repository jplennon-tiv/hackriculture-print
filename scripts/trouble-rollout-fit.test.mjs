import test from 'node:test';import assert from 'node:assert/strict';
import {exploreRolloutFit} from './lib/trouble-rollout-fit.mjs';
function verify(f,keys){assert.equal(f.selected.violations,0);assert.deepEqual([...f.selected.order].sort(),[...keys].sort());for(const k of keys)assert.ok(Math.abs(f.selected.pageByKey[k]-f.baseline.pageByKey[k])<=1);}
test('separates adjacent high-priority features by changing sequence and column breaks',()=>{
 const keys=['a','b','c','d','e','f'],heights={a:310,b:310,c:230,d:220,e:200,f:200};
 const meta=keys.map((key,i)=>({key,rank:i<3?10:9,star:i<2}));
 const f=exploreRolloutFit(keys,heights,[700,770],meta,{startPage:100,bodyTops:[130,80]});verify(f,keys);assert.ok(f.baseline.violations>0);
});
test('three top-priority stars stay within one page when another rank is needed for separation',()=>{
 const keys=['a','b','c','d','e','f','g','h','i','j'],values=[313,313,280,212,221,254,254,239,239,220],heights=Object.fromEntries(keys.map((k,i)=>[k,values[i]]));
 const meta=keys.map((key,i)=>({key,rank:i<3?10:i<5?9:8,star:i<3}));
 const f=exploreRolloutFit(keys,heights,[722,772],meta,{startPage:140,bodyTops:[130,80]});verify(f,keys);assert.equal(f.rules.maxInvertedRankGap,2);assert.ok(f.rules.rankGapReason);
});
test('unfeatured tied entries do not gain an alphabetical rule',()=>{
 const keys=['z','a','m'],heights={z:100,a:100,m:100},meta=keys.map(key=>({key,rank:5,star:false}));
 const f=exploreRolloutFit(keys,heights,[400,400],meta);verify(f,keys);assert.deepEqual(f.selected.order,keys);
});
test('oversized complete entries fail without clipping or shrinking',()=>{
 assert.throws(()=>exploreRolloutFit(['large'],{large:800},[700,700],[{key:'large',rank:10,star:false}]),/exceeds/);
});
