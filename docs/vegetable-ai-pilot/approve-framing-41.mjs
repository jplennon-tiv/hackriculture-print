import crypto from 'node:crypto';
import{fs,assert,readCollection,revision,clone,save}from'../../../hackriculture-data/planning/normalisation-02-tools.mjs';
import{resolveVegetableExtracts,resolveVegetablePrintLayout,printChecksum}from'../../src/lib/vegetablePrint.ts';
const data=readCollection('vegetables'),rev=revision(),excluded=['asparagus','cucumber_outdoor','tomato_greenhouse'];
assert.equal(rev,'8c9d0dd6ce79d20216740de004196e8856ce0785365b11566a106bb0ab170534','Historical approval: do not replay');
const keys=Object.keys(data).filter(k=>!excluded.includes(k)),sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const actor='admin: John approved the framing review except asparagus, outdoor cucumber and greenhouse tomato on 23 September 2026; recorded by AI:gpt-6-astra';
for(const key of keys){const v=data[key],p=v.ai_print_layout;
 assert.equal(p.status,'draft');assert.equal(p.locked,false);assert.deepEqual(resolveVegetableExtracts(v,true).warnings,[]);assert.equal(resolveVegetablePrintLayout(v,true).warning,null);
 assert.equal(p.measurements.results.length,2);for(const[f,h]of Object.entries(p.measurements.renderer_files))assert.equal(sha(f),h);
 for(const r of p.measurements.results){assert.equal(r.pages,2);assert.equal(r.source_checksum,printChecksum(p.dependencies));assert.equal(r.layout_checksum,p.output_checksum);assert.equal(sha(r.path),r.pdf_sha256);assert.equal(r.error,null);assert.equal(r.fonts,'loaded');assert.deepEqual(r.missing,[]);assert.ok(r.alignment.every(a=>a.unused_bottom_mm>=0&&a.unused_bottom_mm<=10));}
 for(const e of [...Object.values(v.ai_print_extracts.sections),p]){assert.equal(e.locked,false);Object.assign(e,{status:'approved',updated_at:new Date().toISOString(),updated_by:actor});}
 for(const field of ['normalisation','measurement_framing'])if(v.metadata?.[field])Object.assign(v.metadata[field],{status:'approved-by-John',approved_at:new Date().toISOString(),approved_by:'John'});
 assert.deepEqual(resolveVegetableExtracts(v).warnings,[]);assert.equal(resolveVegetablePrintLayout(v).warning,null);
}
assert.equal(keys.length,41);save(data,rev,keys,'NORMALISATION-FRAMING-41-APPROVED.json',actor);
