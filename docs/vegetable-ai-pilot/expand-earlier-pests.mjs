import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {resolveVegetablePrintLayout,printChecksum} from '../../src/lib/vegetablePrint.ts';
const rev=revision(),data=readCollection('vegetables');
const audit=JSON.parse(fs.readFileSync('docs/vegetable-ai-pilot/pest-cap-earlier-audit.json','utf8'));
const keys=['bean_broad','bean_french','bean_runner','beetroot','carrot','lettuce','radish'];
for(const key of keys){
 const v=data[key],p=v.ai_print_layout;
 assert.equal(p.status,'approved');assert.equal(p.locked,false);assert.equal(resolveVegetablePrintLayout(v).warning,null);
 assert.equal(audit.results.find(r=>r.key===key)?.count,5);
 p.value.pest_limit=5;p.status='draft';p.updated_by='AI:gpt-6-astra';p.updated_at=new Date().toISOString();
 p.output_checksum=printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))});delete p.measurements;
}
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
