// Record measurements only after the six current proof PDFs pass basic checks.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {resolveVegetablePrintLayout} from '../../src/lib/vegetablePrint.ts';
const batch=process.argv.includes('--batch-01');
const batch02=process.argv.includes('--batch-02');
const checks=JSON.parse(fs.readFileSync(`docs/vegetable-ai-pilot/${batch02?'batch-02-checks':batch?'batch-01-checks':'checks'}.json`,'utf8'));
assert.equal(checks.length,6);
for(const c of checks){assert.equal(c.pages,2);assert.equal(c.error,null);assert.deepEqual(c.warnings,[]);assert.deepEqual(c.missing,[]);for(const a of c.alignment??[])assert.ok(a.column_bottom_gap_px<=1);}
const rev=revision(),data=readCollection('vegetables');
const files=['src/print/PrintVegetablePage.tsx','src/print/print.module.css','src/print/useVegetableLayout.ts','src/print/plantingIllustrations.ts','src/lib/vegetablePrint.ts','src/lib/sentences.ts','src/lib/cropApplicability.ts'];
const renderer_files=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
for(const key of (batch02?['bean_broad','bean_french','bean_runner']:batch?['beetroot','carrot','lettuce']:['asparagus','radish','celery'])){
 assert.ok(data[key].ai_print_layout.status==='draft'||(process.argv.includes('--refresh-approved')&&data[key].ai_print_layout.status==='approved'));
 assert.equal(resolveVegetablePrintLayout(data[key],true).warning,null);
 data[key].ai_print_layout.measurements={checked_at:new Date().toISOString(),checked_by:'AI:gpt-6-astra',format:'A4',margin_mm:{top:18,bottom:20,left:14,right:14},renderer_files,results:checks.filter(c=>c.key===key)};
}
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
