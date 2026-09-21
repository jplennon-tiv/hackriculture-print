// Explicitly approved hero assets only; does not regenerate copy or packing.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readCollection,saveCollections,revision,refreshGenerated} from '../../../../hackriculture-data/lib/records.mjs';
import {layoutSourceSignature} from '../../../src/lib/aiPrint.ts';
const keys=process.argv.length>2?process.argv.slice(2):['turnip_swede_radish_troubles','bean_and_pea_troubles','brassica_troubles','carrot_and_parsnip_troubles','celery_troubles','cucurbit_troubles','lettuce_troubles'];
const rev=revision(),data=readCollection('troubles'),before=structuredClone(data);
for(const key of keys){
 const g=data[key];assert.equal(g.ai_layout.status,'approved');assert.equal(g.ai_layout.source_signature,layoutSourceSignature(g));
 const target=`/images/troubles/heroes/${key}-v1.png`;
 assert.notDeepEqual(g.ai_layout.hero_images,[target],'Already installed');
 if(key!=='turnip_swede_radish_troubles')fs.copyFileSync(new URL(key+'-v1.png',import.meta.url),new URL('../../../public'+target,import.meta.url));
 g.ai_layout.hero_images=[target];g.ai_layout.updated_at=new Date().toISOString();g.ai_layout.updated_by='admin: John-approved combined hero artwork';
}
const stripped=structuredClone(data);for(const key of keys)stripped[key].ai_layout=before[key].ai_layout;assert.deepEqual(stripped,before);
console.log(saveCollections({troubles:data},{actor:'admin: John-approved combined hero artwork',expectedRevision:rev}));refreshGenerated();
