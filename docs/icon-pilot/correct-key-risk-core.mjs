// One-time, revision-guarded core corrections authorised by John on 24 September.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections,recordPath,dataRoot} from '../../../hackriculture-data/lib/records.mjs';
import {layoutDependencies,resolveVegetableExtracts,resolveVegetablePrintLayout} from '../../src/lib/vegetablePrint.ts';
import {GardeningDataSchema} from '../../src/schema.ts';
const expected='dc2673fcd2119f35fe2d0392847e2e058e972f509f4118e9e2cb52adb9ab52fb';
assert.equal(revision(),expected,'Historical correction: do not replay over newer edits.');
const data=readCollection('vegetables'),before=structuredClone(data.parsnip);
const bytes=Object.fromEntries(['vegetables','troubles'].flatMap(c=>Object.keys(readCollection(c)).map(k=>[`${c}/${k}`,fs.readFileSync(recordPath(dataRoot,c,k))])));
const v=data.parsnip,actor='admin: John authorised Key Risks core-data corrections; researched and applied by AI:gpt-6-astra';
assert.equal(v.ai_print_layout.locked,false);
assert.equal(resolveVegetablePrintLayout(v).warning,null);
assert.deepEqual(resolveVegetableExtracts(v).warnings,[]);
assert.ok(!Object.values(v._field_metadata).some(x=>x.locked));
v.troubles['CARROT ROOT FLY'].text='Carrot fly larvae tunnel into parsnip roots, leaving rusty-brown scars and making damaged roots vulnerable to rot. Cover the crop with insect-proof mesh from sowing, securing the edges. Sow thinly and thin carefully if needed, avoiding damage to nearby plants. Minor damage on large roots can be trimmed away; discard badly damaged or decaying roots.';
v.troubles['CARROT ROOT FLY'].signs='Rusty-brown scars and tunnels in roots; damaged roots may rot.';
v.troubles['CARROT ROOT FLY'].control='Cover with insect-proof mesh from sowing; secure every edge.';
assert.ok(!v.troubles.SPLITTING);
v.troubles.SPLITTING={text:'Parsnip roots can split when soil moisture fluctuates. Keep the soil evenly moist during dry spells and mulch to reduce moisture loss. Inspect split roots at harvest and use sound roots promptly rather than putting damaged roots into long storage.',rank:5,signs:'Roots develop lengthways cracks.',control:'Keep soil moisture steady; mulch and water during dry spells.'};
// Keep John's approved layout choices; refresh their source linkage. Dated old
// measurements remain historical evidence, with new proofs recorded separately.
v.ai_print_layout.dependencies=layoutDependencies(v);
v.ai_print_layout.updated_at=new Date().toISOString();v.ai_print_layout.updated_by=actor;
assert.deepEqual(v.ai_print_layout.value,before.ai_print_layout.value);
assert.deepEqual(v.ai_print_extracts,before.ai_print_extracts);
assert.equal(resolveVegetablePrintLayout(v).warning,null);
GardeningDataSchema.parse(data);
const backups=path.join(dataRoot,'backups/admin'),old=new Set(fs.readdirSync(backups));
const receipt=saveCollections({vegetables:data},{actor,expectedRevision:expected});assert.equal(receipt.changed,1);
const dirs=fs.readdirSync(backups).filter(x=>!old.has(x));assert.equal(dirs.length,1);
const dir=path.join(backups,dirs[0]),journal=JSON.parse(fs.readFileSync(path.join(dir,'transaction.json')));
assert.equal(journal.state,'complete');
for(const item of journal.files)assert.ok(fs.readFileSync(path.join(dir,item.backup)).equals(bytes[item.file.split('/').slice(0,2).join('/')]));
for(const [id,b] of Object.entries(bytes))if(id!=='vegetables/parsnip')assert.deepEqual(fs.readFileSync(recordPath(dataRoot,...id.split('/'))),b);
fs.writeFileSync('docs/icon-pilot/KEY-RISK-CORE-RECEIPT.json',JSON.stringify({date:new Date().toISOString(),prior_revision:expected,...receipt,backup:dir,exact_prior_bytes_verified:true,unchanged_records:57,actor,changes:['Parsnip carrot fly: accurate root tunnelling and mesh control; retained minor-damage trimming.','Parsnip-specific splitting entry replaces carrot wording. Rank 5 retains forking as a more useful Key Risk and the existing seven-row pest selection.','Existing approved layout choices and extract text preserved; source dependencies refreshed. Changed proofs await review.'],sources:['https://www.rhs.org.uk/biodiversity/carrot-fly','https://www.rhs.org.uk/vegetables/parsnips/grow-your-own'],inference:'Rank 5 for splitting is editorial prioritisation; storage caution retains the shared master advice.'},null,2)+'\n');
console.log(JSON.stringify(receipt));
