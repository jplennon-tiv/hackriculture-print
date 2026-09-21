// Record reviewed evidence for this bounded batch only; no approvals/content edits.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {resolveVegetablePrintLayout,resolveVegetableExtracts,printChecksum} from '../../src/lib/vegetablePrint.ts';
import {VegetableSchema} from '../../src/schema.ts';
const keys=['cauliflower','kale','kohl_rabi'];
const rev=revision(),data=readCollection('vegetables'),before=structuredClone(data);
const signoff=JSON.parse(fs.readFileSync('docs/vegetable-ai-pilot/widget-signoff.json'));
const checks=JSON.parse(fs.readFileSync('docs/vegetable-ai-pilot/batch-04-checks.json'));
const restorePath='docs/vegetable-ai-pilot/batch-04-restore.json',restore=JSON.parse(fs.readFileSync(restorePath));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
for(const [file,sum]of Object.entries(signoff.renderer_files))assert.equal(hash(file),sum,`Signed-off renderer changed: ${file}`);
for(const key of signoff.approved){assert.equal(data[key].ai_print_layout.status,'approved');assert.equal(resolveVegetablePrintLayout(data[key]).warning,null);assert.deepEqual(resolveVegetableExtracts(data[key]).warnings,[]);}
assert.equal(checks.length,6);
for(const key of keys){
 const v=data[key],p=v.ai_print_layout,results=checks.filter(c=>c.key===key);
 assert.equal(p.status,'draft');assert.equal(resolveVegetablePrintLayout(v,true).warning,null);
 assert.deepEqual(resolveVegetableExtracts(v,true).warnings,[]);VegetableSchema.parse(v);
 assert.equal(results.length,2);assert.deepEqual(results.map(c=>c.units).sort(),['imperial','metric']);
 for(const c of results){
  assert.equal(c.pages,2);assert.equal(c.error,null);assert.deepEqual(c.warnings,[]);assert.deepEqual(c.missing,[]);assert.equal(c.fonts,'loaded');
  assert.equal(c.layout_checksum,p.output_checksum);assert.equal(c.source_checksum,printChecksum(p.dependencies));
  assert.ok(c.alignment.every(a=>a.column_bottom_gap_px<=1));assert.ok(Object.values(c.editorial).every(e=>e.mode==='reviewed'));
  assert.equal(c.pests.length,p.value.pest_limit);
  const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
  assert.deepEqual(c.pests.map(norm).sort(),restore.selected[key].map(norm).sort());
  assert.equal(c.varieties.length,p.value.variety_count);
  c.pdf_sha256=hash(`tmp/pdfs/vegetable-batch-04/${key}-${c.units}.pdf`);
 }
 p.measurements={checked_at:new Date().toISOString(),checked_by:'AI:gpt-6-astra',format:'A4',margin_mm:{top:18,bottom:20,left:14,right:14},renderer_files:signoff.renderer_files,results};
 assert.deepEqual(v.print_planting,before[key].print_planting);
}
for(const key of Object.keys(before).filter(k=>!keys.includes(k)))assert.deepEqual(data[key],before[key]);
const save=saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'});
const backups=fs.readdirSync('../hackriculture-data/backups/admin',{withFileTypes:true}).filter(e=>e.isDirectory()&&e.name>'2026-09-21T20-36').map(e=>e.name).sort();
Object.assign(restore,{measurementSave:save,revision:revision(),backups,checks:'batch-04-checks.json',proof:'output/pdf/vegetable-batch-04-review.pdf',proof_sha256:hash('output/pdf/vegetable-batch-04-review.pdf'),validation:'Six both-unit physical PDFs, two pages each; source/renderer/checksum/readiness/icon/variety/pest checks; zero column gaps. Shared integrity checked. No production code changed; prior 243 tests/build remain the signed-off baseline.',visual_samples:['All six metric pages; kohlrabi imperial back. Final priority/wording revision: cauliflower and kale changed pages.'],limitations:'Kale variety duplicates, conflicting source routes and unprinted legacy controls are indexed in DATA-NORMALISATION.md. Poppler Type 3 glyph bounding-box advisories showed no visible damage in inspected pages.'});
fs.writeFileSync(restorePath,JSON.stringify(restore,null,2)+'\n');
console.log(save);
