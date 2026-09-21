// One-time correction: meaningful crop priorities, not equal maximum ranks.
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {layoutDependencies,printChecksum} from '../../src/lib/vegetablePrint.ts';
const baseline='95620c6b4bee1466b29d7ee6faa77d11040e9274fce307633ccc58edace95696';
assert.equal(revision(),baseline);
const data=readCollection('vegetables'),before=structuredClone(data);
const priorities={
 cauliflower:{'Club Root (Finger and Toe)':10,'Cabbage Caterpillars':10,'Cabbage Root Fly':9,'Button Cauliflowers':9,'Blind Plants':8,'Slugs and Snails':8,'Boron Deficiency':7,Whiptail:7,'Mealy Aphid':8,'Flea Beetle':8,'SUNLIGHT ON CURDS':6},
 kale:{'Cabbage Caterpillars':10,'Cabbage Whitefly':9,'Mealy Aphid':9,'Club Root (Finger and Toe)':10,Pigeons:9,'Slugs and Snails':8,'Cabbage Root Fly':8,'Flea Beetle':7},
 kohl_rabi:{'Woody Kohl Rabi':10,'Flea Beetle':9,'Cabbage Caterpillars':9,'Club Root (Finger and Toe)':9,'Cabbage Root Fly':8,'Slugs and Snails':8,Pigeons:7,'Mealy Aphid':7},
};
for(const [key,ranks]of Object.entries(priorities))for(const [name,rank]of Object.entries(ranks)){
 assert.ok(data[key].troubles[name],`${key}/${name}`);data[key].troubles[name].rank=rank;
}
console.log(saveCollections({vegetables:data},{expectedRevision:baseline,actor:'admin: John authorised fuller crop-specific trouble selection; priorities authored by AI:gpt-6-astra'}));
const rev=revision(),fresh=readCollection('vegetables'),now=new Date().toISOString();
const tips=fresh.cauliflower.ai_print_extracts.sections.final_tips;
tips.value[0].text='After peas or beans, keep soil settled; avoid pulling roots out.';
tips.output_checksum=printChecksum(tips.value);tips.updated_at=now;
for(const key of Object.keys(priorities)){
 const v=fresh[key],p=v.ai_print_layout;
 p.dependencies=layoutDependencies(v);
 p.output_checksum=printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([k,s])=>[k,s.value]))});
 p.updated_at=now;
 assert.deepEqual(v.print_planting,before[key].print_planting);
}
for(const key of Object.keys(before).filter(k=>!Object.hasOwn(priorities,k)))assert.deepEqual(fresh[key],before[key]);
console.log(saveCollections({vegetables:fresh},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
