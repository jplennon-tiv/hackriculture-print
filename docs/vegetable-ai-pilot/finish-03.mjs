// Save current measured evidence only; never approves or reauthors copy.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {resolveVegetablePrintLayout,printChecksum} from '../../src/lib/vegetablePrint.ts';
const checks=JSON.parse(fs.readFileSync('docs/vegetable-ai-pilot/batch-03-checks.json','utf8'));
const expected={
 broccoli:{varieties:['Express Corona','Green Comet','Early Purple Sprouting','Red Arrow','Late Purple Sprouting'],risks:['CLUB ROOT','FROST','Club Root (Finger and Toe)','Cabbage Caterpillars']},
 brussels_sprouts:{varieties:['Troika','Widgeon','Sheriff','Peer Gynt'],risks:['Club Root (Finger and Toe)','Cabbage Caterpillars','SLUGS','FROST']},
 cabbage:{varieties:['Ormskirk Late','April','Hispi','Minicole','Winnigstadt','Holland Late Winter'],risks:['Club Root (Finger and Toe)','Cabbage Caterpillars','Cabbage Root Fly','Pigeons']},
};
const rev=revision(),data=readCollection('vegetables');assert.equal(checks.length,6);
const files=['src/print/PrintVegetablePage.tsx','src/print/print.module.css','src/print/useVegetableLayout.ts','src/print/plantingIllustrations.ts','src/lib/vegetablePrint.ts','src/lib/sentences.ts','src/lib/cropApplicability.ts'];
const renderer_files=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
for(const [key,selection] of Object.entries(expected)){
 const v=data[key],p=v.ai_print_layout,results=checks.filter(c=>c.key===key);
 assert.equal(p.status,'draft');assert.equal(p.locked,false);assert.equal(resolveVegetablePrintLayout(v,true).warning,null);
 assert.equal(results.length,2);assert.deepEqual(results.map(c=>c.units).sort(),['imperial','metric']);
 for(const c of results){
  assert.equal(c.pages,2);assert.equal(c.error,null);assert.deepEqual(c.warnings,[]);assert.deepEqual(c.missing,[]);assert.equal(c.fonts,'loaded');
  assert.equal(c.layout_checksum,p.output_checksum);assert.equal(c.source_checksum,printChecksum(p.dependencies));
  assert.equal(c.alignment.length,2);for(const a of c.alignment)assert.ok(a.column_bottom_gap_px<=1);
  assert.deepEqual(c.varieties,selection.varieties);assert.deepEqual(c.risks,selection.risks);
  assert.deepEqual(c.tipIcons,v.ai_print_extracts.sections.final_tips.value.map(t=>`/images/quick_facts/trial/${t.icon}.png`));
 }
 p.measurements={checked_at:new Date().toISOString(),checked_by:'AI:gpt-6-astra',format:'A4',margin_mm:{top:18,bottom:20,left:14,right:14},renderer_files,results};
}
// Compare master data against the exact initial prior-byte snapshot.
const backup='../hackriculture-data/backups/admin/2026-09-21T16-25-41.126Z-2d4f9e13-23ab-48b1-9369-6f579035e3e5';
for(const [i,key]of Object.keys(expected).entries()){
 const old=JSON.parse(fs.readFileSync(`${backup}/${i}.json`,'utf8'));
 const strip=v=>Object.fromEntries(Object.entries(v).filter(([k])=>k!=='_field_metadata'&&!k.startsWith('ai_')));
 assert.deepEqual(strip(data[key]),strip(old),`${key}: master changed`);
}
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
