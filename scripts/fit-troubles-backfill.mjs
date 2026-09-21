// Small measured budget adjustments after image backfill; no prose changes.
import assert from 'node:assert/strict';
import {readCollection,saveCollections,revision,refreshGenerated} from '../../hackriculture-data/lib/records.mjs';
const rev=revision(),d=readCollection('troubles');
const b=d.brassica_troubles.ai_layout.pages,c=d.carrot_and_parsnip_troubles.ai_layout.pages;
assert.equal(b[0].columns[0][0].key,'cabbage_root_fly');
assert.equal(b[3].columns[0][1].key,'white_blister_white_rust');
b[0].columns[0]=[{key:'woody_kohl_rabi',height_mm:100},{key:'white_blister_white_rust',height_mm:97}];
b[3].columns[0][1].key='cabbage_root_fly';
c[0].columns[0][0].height_mm=102;c[0].columns[0][1].height_mm=85;
for(const g of [d.brassica_troubles,d.carrot_and_parsnip_troubles]){
 g.ai_layout.updated_at=new Date().toISOString();
 g.ai_layout.updated_by='User-authorised AI artwork backfill: measured budgets; approved prose unchanged';
}
console.log(saveCollections({troubles:d},{actor:'User-authorised AI artwork layout adjustment (model not recorded)',expectedRevision:rev}));
refreshGenerated();
