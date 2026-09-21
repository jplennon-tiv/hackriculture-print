import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {resolveVegetablePrintLayout,resolveVegetableExtracts,printChecksum} from '../../src/lib/vegetablePrint.ts';
import {VegetableSchema} from '../../src/schema.ts';
const expected={
 radish:['Flea Beetle','Bolting','Cabbage Root Fly','Woody Or Hollow Roots','Acid Soil','Slugs And Snails'],
 beetroot:['Bolting','Fanging','Mangold Fly (Leaf Miner)','Heart Rot','Blackleg','Speckled Yellows','Autumnal Fungal Root Rots','Leaf Spot'],
 carrot:['Carrot Fly','Fanging','Small Roots','Splitting','Sclerotinia Rot','Carrot-Willow Aphid','Black Rot','Motley Dwarf Virus','Green Top','Violet Root Rot'],
 lettuce:['Slugs','Root Aphid','Bolting','Downy Mildew','Aphid','Grey Mould (Botrytis)','Cutworm','Tipburn','No Hearts'],
 bean_broad:['Black Bean Aphid','Chocolate Spot','No Pods','Pea And Bean Weevil','Halo Blight','Bean Seed Fly','Foot Rot And Root Rot','Fusarium Wilt'],
 bean_french:['Black Bean Aphid','No Pods','Pea And Bean Weevil','Halo Blight','Bean Seed Fly','Foot Rot And Root Rot','Fusarium Wilt'],
 bean_runner:['No Pods','Halo Blight','Black Bean Aphid','Slugs','Mosaic Disease','Birds And Animals','Bean Disease','Bean Seed Fly'],
};
const changedSections={radish:['looking_after_the_crop'],lettuce:['looking_after_the_crop','harvesting'],bean_runner:['looking_after_the_crop','harvesting']};
const backup='../hackriculture-data/backups/admin/2026-09-21T17-26-33.073Z-c248cd3e-c2e1-450b-bb07-b7c4365c9119';
const originals=Object.fromEntries(JSON.parse(fs.readFileSync(`${backup}/transaction.json`)).files.map(({file,backup:record})=>[file.split('/')[1],JSON.parse(fs.readFileSync(`${backup}/${record}`))]));
const rev=revision(),data=readCollection('vegetables');
const checks=JSON.parse(fs.readFileSync('docs/vegetable-ai-pilot/earlier-pests-checks.json'));assert.equal(checks.length,14);
const files=['src/print/PrintVegetablePage.tsx','src/print/print.module.css','src/print/useVegetableLayout.ts','src/print/plantingIllustrations.ts','src/lib/vegetablePrint.ts','src/lib/sentences.ts','src/lib/cropApplicability.ts'];
const renderer_files=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
for(const [key,pests]of Object.entries(expected)){
 const v=data[key],old=originals[key],p=v.ai_print_layout,results=checks.filter(c=>c.key===key);
 VegetableSchema.parse(v);assert.equal(p.status,'draft');assert.equal(p.locked,false);assert.equal(resolveVegetablePrintLayout(v,true).warning,null);assert.deepEqual(resolveVegetableExtracts(v,true).warnings,[]);
 assert.equal(results.length,2);assert.deepEqual(results.map(c=>c.units).sort(),['imperial','metric']);
 for(const c of results){
  assert.equal(c.pages,2,key);assert.equal(c.error,null);assert.deepEqual(c.warnings,[]);assert.deepEqual(c.missing,[]);assert.equal(c.fonts,'loaded');
  assert.equal(c.layout_checksum,p.output_checksum);assert.equal(c.source_checksum,printChecksum(p.dependencies));
  for(const a of c.alignment)assert.ok(a.column_bottom_gap_px<=1,`${key}/${c.units}: ${a.column_bottom_gap_px}`);
  assert.deepEqual(c.pests,pests);assert.equal(c.pests.length,p.value.pest_limit);
  assert.ok(!/permethrin|heptenophos|mancozeb|lindane|cheshunt|pirimicarb|carbendazim|fungicide|insecticide/i.test(c.pestRows.join(' ')));
  assert.deepEqual(c.tipIcons,v.ai_print_extracts.sections.final_tips.value.map(t=>`/images/quick_facts/trial/${t.icon}.png`));
  const previous=old.ai_print_layout.measurements.results.find(r=>r.units===c.units);
  assert.deepEqual(c.varieties,previous.varieties);assert.deepEqual(c.risks.map(s=>s.toLowerCase()),previous.risks.map(s=>s.toLowerCase()));
 }
 for(const [slot,e]of Object.entries(old.ai_print_extracts.sections)){
  if(changedSections[key]?.includes(slot)){
   assert.equal(v.ai_print_extracts.sections[slot].status,'draft');assert.deepEqual(v.ai_print_extracts.sections[slot].dependencies,e.dependencies);
  }else assert.deepEqual(v.ai_print_extracts.sections[slot],e,`${key}/${slot}: approved section changed`);
 }
 for(const [field,value]of Object.entries(old))if(!field.startsWith('ai_')&&!['troubles','metadata','_field_metadata'].includes(field))assert.deepEqual(v[field],value,`${key}/${field}: source changed outside trouble edits`);
 p.measurements={checked_at:new Date().toISOString(),checked_by:'AI:gpt-6-astra',format:'A4',margin_mm:{top:18,bottom:20,left:14,right:14},renderer_files,results};
}
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
