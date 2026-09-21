import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {resolveVegetablePrintLayout,printChecksum} from '../../src/lib/vegetablePrint.ts';
import {VegetableSchema} from '../../src/schema.ts';
const checks=['batch-03-checks','earlier-pests-checks'].flatMap(f=>JSON.parse(fs.readFileSync(`docs/vegetable-ai-pilot/${f}.json`,'utf8')));
const expected={
 broccoli:['Cabbage Caterpillars','Club Root (Finger And Toe)','Frost','Pigeons','Cabbage Root Fly','Slugs And Snails'],
 brussels_sprouts:['Club Root (Finger And Toe)','Cabbage Caterpillars','Slugs','Frost','Pigeons','Cabbage Root Fly','Blown Sprouts'],
 cabbage:['Club Root (Finger And Toe)','Cabbage Caterpillars','Cabbage Root Fly','Pigeons','Slugs And Snails','Flea Beetle','Mealy Aphid'],
 radish:['Flea Beetle','Bolting','Cabbage Root Fly','Woody Or Hollow Roots','Acid Soil'],
 beetroot:['Bolting','Fanging','Mangold Fly (Leaf Miner)','Heart Rot','Blackleg'],
 carrot:['Carrot Fly','Fanging','Small Roots','Splitting','Sclerotinia Rot'],
 lettuce:['Slugs','Root Aphid','Mildew','Tipburn','Bolting'],
 bean_broad:['Black Bean Aphid','Chocolate Spot','No Pods','Pea And Bean Weevil','Halo Blight'],
 bean_french:['Black Bean Aphid','No Pods','Pea And Bean Weevil','Halo Blight','Bean Seed Fly'],
 bean_runner:['No Pods','Halo Blight','Slugs','Mosaic Disease','Birds And Animals'],
};
assert.equal(checks.length,20);const rev=revision(),data=readCollection('vegetables');
const historical=['checks','batch-01-checks','batch-02-checks'].flatMap(f=>JSON.parse(fs.readFileSync(`docs/vegetable-ai-pilot/${f}.json`,'utf8')));
const files=['src/print/PrintVegetablePage.tsx','src/print/print.module.css','src/print/useVegetableLayout.ts','src/print/plantingIllustrations.ts','src/lib/vegetablePrint.ts','src/lib/sentences.ts','src/lib/cropApplicability.ts'];
const renderer_files=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
for(const [key,pests]of Object.entries(expected)){
 const v=data[key],p=v.ai_print_layout,results=checks.filter(c=>c.key===key);
 VegetableSchema.parse(v);assert.equal(p.status,'draft');assert.equal(p.locked,false);assert.equal(resolveVegetablePrintLayout(v,true).warning,null);
 assert.equal(results.length,2);assert.deepEqual(results.map(c=>c.units).sort(),['imperial','metric']);
 for(const c of results){
  assert.equal(c.pages,2,key);assert.equal(c.error,null);assert.deepEqual(c.warnings,[]);assert.deepEqual(c.missing,[]);assert.equal(c.fonts,'loaded');
  assert.equal(c.layout_checksum,p.output_checksum);assert.equal(c.source_checksum,printChecksum(p.dependencies));
  for(const a of c.alignment)assert.ok(a.column_bottom_gap_px<=1,`${key}/${c.units}: ${a.column_bottom_gap_px}`);
  assert.deepEqual(c.pests,pests);assert.equal(c.pests.length,p.value.pest_limit);
  assert.ok(!/permethrin|heptenophos|mancozeb|lindane|cheshunt|pirimicarb/i.test(c.pestRows.join(' ')));
  assert.deepEqual(c.tipIcons,v.ai_print_extracts.sections.final_tips.value.map(t=>`/images/quick_facts/trial/${t.icon}.png`));
  const old=historical.find(r=>r.key===key&&r.units===c.units);if(old){assert.deepEqual(c.varieties,old.varieties);assert.deepEqual(c.risks,old.risks);}
  if(key==='broccoli')assert.deepEqual(c.risks,['Cabbage Caterpillars','Club Root (Finger and Toe)','FROST','PIGEONS']);
 }
 p.measurements={checked_at:new Date().toISOString(),checked_by:'AI:gpt-6-astra',format:'A4',margin_mm:{top:18,bottom:20,left:14,right:14},renderer_files,results};
}
// Earlier approved text/section reviews are byte-for-value unchanged.
const backup='../hackriculture-data/backups/admin/2026-09-21T16-56-18.493Z-796bd31d-42db-436f-9db9-f1ccfeae3ed6';
for(const {file,backup:record}of JSON.parse(fs.readFileSync(`${backup}/transaction.json`,'utf8')).files){
 const key=file.split('/')[1],old=JSON.parse(fs.readFileSync(`${backup}/${record}`,'utf8'));
 assert.deepEqual(data[key].ai_print_extracts,old.ai_print_extracts);
 assert.deepEqual(data[key].print_planting,old.print_planting);
}
for(const key of ['asparagus','celery'])assert.equal(resolveVegetablePrintLayout(data[key]).warning,null);
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
