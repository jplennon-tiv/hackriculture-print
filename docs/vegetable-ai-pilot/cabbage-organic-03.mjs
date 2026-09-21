import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {layoutDependencies} from '../../src/lib/vegetablePrint.ts';
const rev=revision(),data=readCollection('vegetables'),shared=readCollection('troubles').brassica_troubles.conditions;
for(const [name,id]of Object.entries({'Downy Mildew':'downy_mildew','Wire Stem':'wire_stem','Diamond-back Moth':'diamond_back_moth','Swede Midge':'swede_midge','Gall Weevil':'gall_weevil'})){
 const c=shared[id];assert.equal(c.ai_print.fields.treatment.status,'approved');assert.equal(c.ai_print.fields.prevention.status,'approved');
 data.cabbage.troubles[name].control=[c.treatment,c.prevention].filter(t=>t!=='None.'&&t!=='No practical method available.').join(' ');
}
// Generic insecticide wording replaced with the already-approved biological
// conditions and identification caveat, without recommending chemical products.
for(const [name,id]of [['Cutworm','cutworm'],['Chafer Grubs','chafer_grubs']]){
 const c=shared[id];data.cabbage.troubles[name].control=[c.treatment,c.prevention].filter(t=>t!=='None.').join(' ');
}
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'admin: John organic-only master correction; AI:gpt-6-astra reconciled previously approved brassica controls'}));
const fresh=readCollection('vegetables'),next=revision();fresh.cabbage.ai_print_layout.dependencies=layoutDependencies(fresh.cabbage);delete fresh.cabbage.ai_print_layout.measurements;
console.log(saveCollections({vegetables:fresh},{expectedRevision:next,actor:'AI:gpt-6-astra'}));
