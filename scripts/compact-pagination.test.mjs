import test from 'node:test';
import assert from 'node:assert/strict';
import {afterGuide} from './compact-pagination.mjs';

test('mixed two/three/four-page crops retain facing openings with explicit blanks',()=>{
    let next=8;const starts=[],blanks=[];
    for(const pages of [2,3,2,4,3,2]){
        starts.push(next);const result=afterGuide(next,pages,'vegetable','vegetable-spreads');
        blanks.push(...result.blankFoliosAfter);next=result.nextPage;
    }
    assert.deepEqual(starts,[8,10,14,16,20,24]);
    assert.deepEqual(blanks,[13,23]);assert.equal(next,26);
});
test('Troubles continue naturally; continuous policy never adds blanks',()=>{
    assert.equal(afterGuide(8,3,'trouble','vegetable-spreads').nextPage,11);
    assert.equal(afterGuide(8,3,'vegetable').nextPage,11);
});
test('invalid counts and unknown policies cannot silently alter folios',()=>{
    for(const args of [[0,2,'vegetable'],[8,0,'vegetable'],[8,2,'vegetable','unknown']])assert.throws(()=>afterGuide(...args));
});
