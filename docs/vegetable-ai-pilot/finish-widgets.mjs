// Save evidence only after reviewing the actual current PDFs. No content edits.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {resolveVegetablePrintLayout,resolveVegetableExtracts,printChecksum} from '../../src/lib/vegetablePrint.ts';
import {VegetableSchema} from '../../src/schema.ts';
const rev=revision(),data=readCollection('vegetables');
const checks=JSON.parse(fs.readFileSync('docs/vegetable-ai-pilot/widget-checks.json'));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const files=['src/print/PrintVegetablePage.tsx','src/print/print.module.css','src/print/useVegetableLayout.ts','src/print/vegetableLayout.ts','src/print/plantingFit.ts','src/print/plantingIllustrations.ts','src/print/PlantingCard.tsx','src/print/planting.module.css','src/lib/vegetablePrint.ts','src/lib/vegetableEditorial.ts','src/lib/months.ts','src/lib/facts.ts','src/lib/measure.ts','src/lib/quickFactIcons.ts','src/lib/planting.ts','src/lib/sentences.ts','src/lib/cropApplicability.ts'];
const renderer_files=Object.fromEntries(files.map(f=>[f,hash(f)]));
assert.equal(checks.length,24);
for(const [key,v]of Object.entries(data))if(v.ai_print_layout){
 const p=v.ai_print_layout,results=checks.filter(c=>c.key===key);
 assert.equal(resolveVegetablePrintLayout(v,true).warning,null);
 assert.deepEqual(resolveVegetableExtracts(v,true).warnings,[]);VegetableSchema.parse(v);
 assert.equal(results.length,2);assert.deepEqual(results.map(c=>c.units).sort(),['imperial','metric']);
 for(const c of results){
  assert.equal(c.pages,2);assert.equal(c.error,null);assert.deepEqual(c.warnings,[]);
  assert.deepEqual(c.missing,[]);assert.equal(c.fonts,'loaded');
  assert.equal(c.layout_checksum,p.output_checksum);assert.equal(c.source_checksum,printChecksum(p.dependencies));
  assert.ok(c.alignment.every(a=>a.column_bottom_gap_px<=1));
  assert.ok(Object.values(c.editorial).every(e=>e.mode==='reviewed'));
  assert.equal(c.pests.length,p.value.pest_limit);
  c.pdf_sha256=hash(`tmp/pdfs/vegetable-widgets/${key}-${c.units}.pdf`);
 }
 p.measurements={checked_at:new Date().toISOString(),checked_by:'AI:gpt-6-astra',format:'A4',margin_mm:{top:18,bottom:20,left:14,right:14},renderer_files,results};
}
const save=saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'});
console.log(save);
const restorePath='docs/vegetable-ai-pilot/widget-restore.json',restore=JSON.parse(fs.readFileSync(restorePath));
const root='../hackriculture-data/backups/admin';
const backups=fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isDirectory()&&e.name>'2026-09-21T20-00').map(e=>e.name).sort();
Object.assign(restore,{measurementSave:save,revision:revision(),backups,checks:'widget-checks.json',proof:'output/pdf/vegetable-widgets-review.pdf',proof_sha256:hash('output/pdf/vegetable-widgets-review.pdf'),tests:'243 tests passed; production build passed (existing large-chunk advisory)',visual_samples:['brussels_sprouts','bean_french','radish','celery','cabbage'],limitations:'Existing duplicated variety/risk identities and occasional mixed-unit master prose remain indexed for normalisation. Poppler Type 3 glyph bounding-box warnings did not show visible damage in inspected pages.'});
fs.writeFileSync(restorePath,JSON.stringify(restore,null,2)+'\n');
