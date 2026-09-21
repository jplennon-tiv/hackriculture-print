// One-time guarded application of the reviewed in-memory proposal. Do not rerun.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {resolveVegetablePrintLayout,resolveVegetableExtracts} from '../../src/lib/vegetablePrint.ts';
import {VegetableSchema} from '../../src/schema.ts';
import {curate,plan,keys} from './redraft-earlier-content.mjs';
const baseline='6371a3651f79e65caf705b78fdf97dc3b9c2d52406b35e7eb4b9d317e3f99df4';
assert.equal(revision(),baseline,'Inspect later work; do not overwrite it.');
const original=readCollection('vegetables'),proposal=curate(structuredClone(original),readCollection('troubles'));
export const counts={radish:6,beetroot:8,carrot:10,lettuce:9,bean_broad:8,bean_french:7,bean_runner:8};
for(const key of keys){
 assert.equal(resolveVegetablePrintLayout(original[key],true).warning,null);assert.equal(original[key].ai_print_layout.locked,false);
 original[key].troubles=proposal[key].troubles;
}
const sourceSave=saveCollections({vegetables:original},{expectedRevision:baseline,actor:'admin: John requested individual fuller pest tables and organic source controls; authored by AI:gpt-6-astra'});
console.log(sourceSave);
const afterSource=revision(),data=readCollection('vegetables');
for(const key of keys){
 data[key].ai_print_extracts=proposal[key].ai_print_extracts;plan(data[key],counts[key]);
 assert.deepEqual(resolveVegetableExtracts(data[key],true).warnings,[]);assert.equal(resolveVegetablePrintLayout(data[key],true).warning,null);VegetableSchema.parse(data[key]);
}
const draftSave=saveCollections({vegetables:data},{expectedRevision:afterSource,actor:'AI:gpt-6-astra'});console.log(draftSave);
fs.writeFileSync('docs/vegetable-ai-pilot/earlier-redraft-restore.json',JSON.stringify({baseline,sourceSave,draftSave,counts,revision:revision()},null,2)+'\n');
