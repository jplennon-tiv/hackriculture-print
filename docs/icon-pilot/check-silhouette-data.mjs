// Read-only canonical-data and approval guard for the silhouette rollout.
import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {readCollection,revision,recordPath,dataRoot} from '../../../hackriculture-data/lib/records.mjs';
import {resolveVegetableExtracts,resolveVegetablePrintLayout} from '../../src/lib/vegetablePrint.ts';
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const result={revision:revision(),files:{},warnings:[]};
for(const c of ['vegetables','troubles'])for(const [k,v] of Object.entries(readCollection(c))){result.files[c+'/'+k]=sha(recordPath(dataRoot,c,k));if(c==='vegetables'){const warnings=[...resolveVegetableExtracts(v).warnings,resolveVegetablePrintLayout(v).warning].filter(Boolean);if(warnings.length)result.warnings.push({crop:k,warnings});}}
const mode=process.argv[2],file='docs/icon-pilot/SILHOUETTE-DATA-BASELINE.json';
if(mode==='before'){assert.ok(!fs.existsSync(file),'Do not overwrite initial guard');fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');}
else {const before=JSON.parse(fs.readFileSync(file));assert.deepEqual(result,before);}
console.log(JSON.stringify({revision:result.revision,records:Object.keys(result.files).length,warnings:result.warnings,mode}));
