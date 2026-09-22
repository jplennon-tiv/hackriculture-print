// One-time correction authorised by John: explicit unit pairs and reader prose.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {readCollection, revision, saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {VegetableSchema} from '../../src/schema.ts';
import {buildPair, hasMetric, hasImperial} from '../../src/lib/measure.ts';

const expected='5756e478793764dcd9c3d9f28e8286200f2f4ab3db08a793f2c5235cdf4fd0d9';
assert.equal(revision(), expected, 'Reconcile newer edits before applying.');
const data=readCollection('vegetables'), before=structuredClone(data), v=data.kale;
const actor='admin: John authorised kale unit-pair and reader-prose corrections; authored by AI:gpt-6-astra';
const now=new Date().toISOString();
v.sowing_and_planting.notes[0].text='In nursery rows, thin seedlings to about 7–8 cm (3 in.) apart to give them room to grow before transplanting.';
v.sowing_and_planting.notes[3].text='Rape kale can be sown directly for a late crop of spring shoots. Thin seedlings in stages to about 45 cm (18 in.) between plants and rows, adjusting the spacing and sowing date to the named variety.';
v.sowing_and_planting.notes[5].text='For conventional rows, an alternative is to leave about 50 cm (20 in.) between plants and 75 cm (30 in.) between rows. In a deep bed, suitable compact plants can be spaced about 38 cm (15 in.) each way. Give larger varieties more room and follow the seed packet for the variety you grow.';
v.sowing_and_planting.notes[5].short_text='Adjust spacing for the variety and for rows or deep beds; give larger plants more room.';
v.calendar.sowing_time.notes=[
 'Sow outdoors from March to June, choosing the date to suit the variety, local weather and intended harvest.',
 'For curly-leaved kale to pick before Christmas, sow in April. A May sowing of leaf-and-spear or plain-leaved kale gives a later crop.',
 'Late June is a useful sowing time for rape kale grown for spring shoots; check the instructions for the named variety.',
 'Start seedlings in modules under cover in spring and harden them off before planting outdoors.',
 'A June to early July sowing under cover can follow an early crop and provide autumn and winter leaves. Choose a suitable variety, allow enough growing time before winter and protect seedlings from pests.',
 'For baby salad leaves, sow small batches and pick while the leaves are tender.'
];
v.calendar.harvest_time.notes[0]='Pick autumn and winter leaves from September through April, according to variety and growing conditions. Overwintered plants can provide fresh leaves and shoots in spring.';
const curly=v.varieties['Curly-leaved varieties'], plain=v.varieties['Plain-leaved varieties'], rape=v.varieties['Rape Kale varieties'], modern=v.varieties['Modern and coloured varieties'];
curly['Westland Autumn'].text='A curly-leaved kale grown for autumn and winter greens. Check the seed packet for its mature size and picking season.';
plain['Thousand-headed Kale'].text='A hardy, productive traditional kale grown for greens and young spring shoots.';
plain.Cottagers.text='A heritage kale with green and purple foliage, grown for winter leaves and spring side shoots.';
rape.overview='Late spring-shoot kales provide useful pickings when other winter crops finish. They can be sown directly; choose the sowing date and spacing to suit the named variety.';
rape['Asparagus Kale'].text='Grown especially for tender spring shoots; young leaves can also be eaten.';
modern['Red Russian'].text='A flat, serrated-leaved kale with mild young leaves, useful for salads as well as cooking. Pick leaves while tender.';
v.troubles.Frost.control='Keep plants secure against wind rock, support tall plants where needed and allow sound plants to recover. Remove badly damaged leaves when practical.';
v.troubles._redirect='Kale shares many pests and diseases with other brassicas. Check plants regularly, especially young seedlings and the undersides of leaves.';
// All measurement-bearing ranked prose in this crop uses the existing pair shape.
// Keep each original amount/qualifier; this is not an independent factual revision.
const pairedPaths=[];
function pair(value, path){
 if(typeof value!=='string'||(!hasMetric(value)&&!hasImperial(value)))return value;
 pairedPaths.push(path);return buildPair(value);
}
v.sowing_and_planting.method=pair(v.sowing_and_planting.method,'/sowing_and_planting/method');
function rankedPairs(value,path=''){
 if(!value||typeof value!=='object')return;
 if('rank' in value&&'text' in value){
  value.text=pair(value.text,path+'/text');
  if(value.short_text!==undefined)value.short_text=pair(value.short_text,path+'/short_text');
 }
 for(const [key,child] of Object.entries(value)){
  if(key==='metadata'||key==='_field_metadata'||key.startsWith('ai_')||key==='print_planting')continue;
  rankedPairs(child,path+'/'+key);
 }
}
rankedPairs(v);
v.metadata.normalisation.reader_prose_correction={
 at:now,by:actor,paired_paths:pairedPaths,
 note:'Reader prose uses explicit metric/imperial pairs; calendar and variety text contain gardening advice. Editorial ambiguity remains here and in planning, not in display strings. Historical numbers converted into pairs are not newly verified facts.',
 retained_questions:[
  {path:'/varieties/Curly-leaved varieties/Westland Autumn',note:'Supplier descriptions disagree about stature and harvest. Identity with Westland Winter is unconfirmed.'},
  {path:'/varieties/Plain-leaved varieties/Cottagers',note:'Perennial description and older source strain need confirmation.'},
  {path:'/varieties/Rape Kale varieties/Asparagus Kale',note:'Relationship between current supplier seed and older textbook strain is unconfirmed.'},
  {path:'/calendar/sowing_time/notes',note:'Specific April/May/late-June routes retained from original advice, qualified by variety. Broad March–June sowing and successive baby-leaf sowing checked against RHS.'}
 ]
};
VegetableSchema.parse(v);
for(const key of Object.keys(data).filter(k=>k!=='kale'))assert.deepEqual(data[key],before[key]);
assert.deepEqual(v.ai_print_extracts,before.kale.ai_print_extracts);
assert.deepEqual(v.ai_print_layout,before.kale.ai_print_layout);
assert.deepEqual(v.print_planting,before.kale.print_planting);
const save=saveCollections({vegetables:data},{expectedRevision:expected,actor});
assert.equal(save.changed,1);
const backup=fs.readdirSync('../hackriculture-data/backups/admin',{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name).sort().at(-1);
const journal=JSON.parse(fs.readFileSync(`../hackriculture-data/backups/admin/${backup}/transaction.json`));
assert.deepEqual(journal.files.map(f=>f.file),['vegetables/kale/kale.json']);
const reportPath='../hackriculture-data/planning/KALE-PILOT-APPLIED.json';
const report=JSON.parse(fs.readFileSync(reportPath));
report.reader_prose_correction={at:now,by:actor,save,backup:`backups/admin/${backup}`,paired_paths:pairedPaths};
report.current_revision=save.revision;
report.final_record_sha256=crypto.createHash('sha256').update(fs.readFileSync('../hackriculture-data/vegetables/kale/kale.json')).digest('hex');
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.reader_prose_correction,null,2));
