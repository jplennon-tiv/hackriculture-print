import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {layoutDependencies} from '../../src/lib/vegetablePrint.ts';
const expected='b73b33f40a9ce55c848b0aaeae6fb6b3a09a66029f9416e91c75382f6e6b30c8';
assert.equal(revision(),expected);
const data=readCollection('vegetables');
// Full growth/protection advice remains in text and the care section.
data.radish.troubles['FLEA BEETLE'].signs='Shot-holed leaves.';
data.radish.troubles['FLEA BEETLE'].control='Keep moist; use fine mesh.';
console.log(saveCollections({vegetables:data},{expectedRevision:expected,actor:'admin: John fuller-list revision; AI:gpt-6-astra concise radish table line, full master advice retained'}));
const rev=revision(),fresh=readCollection('vegetables');fresh.radish.ai_print_layout.dependencies=layoutDependencies(fresh.radish);delete fresh.radish.ai_print_layout.measurements;
console.log(saveCollections({vegetables:fresh},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
