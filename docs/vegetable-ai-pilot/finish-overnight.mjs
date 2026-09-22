import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {resolveVegetablePrintLayout,printChecksum} from '../../src/lib/vegetablePrint.ts';
const label=process.argv[2];assert.match(label,/^overnight-\d\d$/);
const file=`docs/vegetable-ai-pilot/${label}-restore.json`,r=JSON.parse(fs.readFileSync(file)),checks=JSON.parse(fs.readFileSync(`docs/vegetable-ai-pilot/${label}-checks.json`));
const rev=revision(),data=readCollection('vegetables'),before=structuredClone(data);
const registry=JSON.parse(fs.readFileSync('docs/vegetable-ai-pilot/UNIT-PROSE-CHECKS.json')).files;
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
for(const[f,h]of Object.entries(registry))assert.equal(sha(f),h.current,`Renderer changed: ${f}`);
for(const key of Object.keys(r.selected)){
 const p=data[key].ai_print_layout,results=checks.filter(c=>c.key===key);
 assert.equal(p.status,'draft');assert.equal(resolveVegetablePrintLayout(data[key],true).warning,null);
 assert.equal(results.length,2);assert.deepEqual(results.map(c=>c.units).sort(),['imperial','metric']);
 for(const c of results){assert.equal(c.layout_checksum,p.output_checksum);assert.equal(c.source_checksum,printChecksum(p.dependencies));assert.equal(c.pdf_sha256,sha(`tmp/pdfs/${label}/${key}-${c.units}.pdf`));assert.equal(c.error,null);assert.deepEqual(c.missing,[]);assert.equal(c.fonts,'loaded');}
 p.measurements={checked_at:new Date().toISOString(),checked_by:'AI:gpt-6-astra',format:'A4',margin_mm:{top:18,bottom:20,left:14,right:14},renderer_files:Object.fromEntries(Object.entries(registry).map(([f,h])=>[f,h.current])),results};
 assert.deepEqual(data[key].print_planting,before[key].print_planting);
}
for(const key of Object.keys(before).filter(k=>!Object.hasOwn(r.selected,k)))assert.deepEqual(data[key],before[key]);
const save=saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'});
const backup=fs.readdirSync('../hackriculture-data/backups/admin',{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name).sort().at(-1);
r.transactions.push({at:new Date().toISOString(),previous_revision:rev,save,backup:`backups/admin/${backup}`,kind:'measurement'});r.revision=save.revision;
r.exceptions=checks.filter(c=>c.pages!==2||c.warnings.length||c.alignment.some(a=>a.column_bottom_gap_px>1)).map(c=>({key:c.key,units:c.units,pages:c.pages,warnings:c.warnings,alignment:c.alignment}));
r.status=r.exceptions.length?'review-proofs-with-exceptions':'checked-review-proofs';
fs.writeFileSync(file,JSON.stringify(r,null,2)+'\n');console.log(label,save,r.status);
