// Follow-up priority correction: keep all seven previously selected distinct pests.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {readCollection,saveCollections,revision,dataRoot,recordPath} from '../../../hackriculture-data/lib/records.mjs';
import {layoutDependencies} from '../../src/lib/vegetablePrint.ts';
const expected='4b098af19b89cd4e19a00b8a84b56f116310eaf2691737f8f4575cd406336ae1';assert.equal(revision(),expected);
const data=readCollection('vegetables'),v=data.parsnip,bytes=fs.readFileSync(recordPath(dataRoot,'vegetables','parsnip'));
assert.equal(v.troubles.SPLITTING.rank,5);assert.equal(v.ai_print_layout.locked,false);v.troubles.SPLITTING.rank=3;
v.ai_print_layout.dependencies=layoutDependencies(v);v.ai_print_layout.updated_at=new Date().toISOString();
const old=new Set(fs.readdirSync(dataRoot+'backups/admin'));
const receipt=saveCollections({vegetables:data},{expectedRevision:expected,actor:'admin: John authorised Key Risks corrections; AI:gpt-6-astra retained seven approved parsnip pest priorities'});
const dirs=fs.readdirSync(dataRoot+'backups/admin').filter(x=>!old.has(x));assert.equal(dirs.length,1);
const backup=dataRoot+'backups/admin/'+dirs[0];assert.ok(fs.readFileSync(backup+'/0.json').equals(bytes));
const file='docs/icon-pilot/KEY-RISK-CORE-RECEIPT.json',r=JSON.parse(fs.readFileSync(file));r.priority_followup={...receipt,backup,exact_prior_bytes_verified:true,note:'Splitting rank 3, below the seven previously selected conditions. Full splitting advice retained in core; moisture already covered in printed care.'};r.final_revision=receipt.revision;fs.writeFileSync(file,JSON.stringify(r,null,2)+'\n');console.log(receipt);
