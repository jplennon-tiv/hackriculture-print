import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {layoutDependencies} from '../../src/lib/vegetablePrint.ts';
const expected='3de567757c2da7f6d9af84a0e6e9b87ffd4ba6764fbfb2fe2a2f69e2860db9ec';assert.equal(revision(),expected);
const data=readCollection('vegetables');
// Preserve the previous shared aphid priority and Key Risks selection when
// adding its concise crop-specific inline control.
data.bean_runner.troubles['Black Bean Aphid'].rank=10;
console.log(saveCollections({vegetables:data},{expectedRevision:expected,actor:'admin: John fuller-list revision; AI:gpt-6-astra preserved existing runner aphid risk priority'}));
const rev=revision(),fresh=readCollection('vegetables');fresh.bean_runner.ai_print_layout.dependencies=layoutDependencies(fresh.bean_runner);delete fresh.bean_runner.ai_print_layout.measurements;
console.log(saveCollections({vegetables:fresh},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
