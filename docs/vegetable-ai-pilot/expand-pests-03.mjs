// John's explicit master-advice correction request, 21 September 2026.
// Source correction only; draft layout/extract refresh is a separate AI save.
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {VegetableSchema} from '../../src/schema.ts';
import {resolveVegetablePrintLayout} from '../../src/lib/vegetablePrint.ts';
const rev=revision();assert.equal(rev,'6b47a3018f9abec6728ebd6f14cd05ecbf413f05634dad9e3ef5577f6c68151a','Inspect intervening edits before rerunning');
const data=readCollection('vegetables'),before=structuredClone(data),shared=readCollection('troubles').brassica_troubles.conditions;
for(const key of ['broccoli','brussels_sprouts','cabbage'])assert.equal(resolveVegetablePrintLayout(data[key],true).warning,null);
// Match existing shared condition names while preserving every object field.
const aliases={'CATERPILLARS':'Cabbage Caterpillars','CLUB ROOT':'Club Root (Finger and Toe)'};
data.broccoli.troubles=Object.fromEntries(Object.entries(data.broccoli.troubles).map(([k,v])=>[aliases[k]??k,v]));
function add(key,id){const c=shared[id];assert.ok(c);assert.ok(!c.applies_to||c.applies_to.includes(key));assert.equal(data[key].troubles[c.name],undefined);data[key].troubles[c.name]={text:c.description,rank:c.rank};}
for(const id of ['cabbage_root_fly','slugs_and_snails','flea_beetle'])add('broccoli',id);
for(const id of ['club_root_finger_and_toe','cabbage_caterpillars','cabbage_root_fly','mealy_aphid'])add('brussels_sprouts',id);
const advice={
 'Club Root (Finger and Toe)':{signs:'Swollen roots; wilting and poor growth.',control:'No cure. Avoid infected soil; improve drainage. Test before liming: it reduces disease, not infection.'},
 'Cabbage Caterpillars':{signs:'Chewed leaves; caterpillars present.',control:'Pick off eggs and caterpillars. Use fine mesh held clear of leaves.',rank:10},
 'Cabbage Root Fly':{signs:'Wilting; maggots tunnel roots.',control:'Fit stem collars at planting or use insect-proof mesh. Rotate crops to avoid trapped overwintered flies.'},
 'Slugs and Snails':{signs:'Irregular holes; young plants eaten.',control:'Hand-pick on damp evenings. Clear yellow leaves around vulnerable plants; retain habitat elsewhere for predators.'},
 'Flea Beetle':{signs:'Small round holes; jumping beetles.',control:'Protect young plants with insect-proof mesh. Established brassicas usually tolerate minor feeding.'},
 'Mealy Aphid':{signs:'Waxy grey colonies; curled leaves.',control:'Squash damaging colonies on young growth; encourage predators. Tolerate small populations on established plants.'},
 'Cabbage Whitefly':{signs:'White insects rise from leaf undersides.',control:'Usually tolerate outer-leaf colonies. Encourage predators; glasshouse-whitefly biological controls are unsuitable.'},
};
for(const key of ['broccoli','brussels_sprouts','cabbage']){
 const t=data[key].troubles;
 for(const [name,fields]of Object.entries(advice))if(t[name])Object.assign(t[name],fields);
 const club=t['Club Root (Finger and Toe)'];
 if(key==='broccoli')club.text='Club root causes swollen, distorted roots and poor growth in broccoli. Soil can remain infected for up to 20 years; firming and lime do not cure the disease.';
 else club.text+=' Soil can remain infected for up to 20 years; liming reduces disease but does not eliminate it.';
 if(t.PIGEONS)Object.assign(t.PIGEONS,{signs:'Leaves pecked or stripped.',control:'Net plants thoroughly, keeping the cover clear of leaves.'});
 if(t.Pigeons)Object.assign(t.Pigeons,{signs:'Leaves pecked or stripped.',control:'Net plants thoroughly, keeping the cover clear of leaves.'});
}
const b=data.broccoli.troubles;
b.FROST.signs='Severe cold damages shoots and leaves.';
b.FROST.control='Firm weather-loosened plants and stake exposed stems. Mulch in very cold winters.';
const v=data.brussels_sprouts,t=v.troubles;
Object.assign(t.SLUGS,advice['Slugs and Snails']);
Object.assign(t.FROST,{signs:'Older buttons damaged by severe cold.',control:'Pick mature sprouts regularly. Cut stems can be kept briefly in a cool, frost-free shed.'});
t.FROST.text='Extreme frost can damage sprouts, especially old ones. Regular picking reduces losses; cut stems can be hung in a cool, frost-free shed and picked as needed.';
Object.assign(t['FUNGAL LEAF SPOTS'],{signs:'Dark spots or rings on leaves and sprouts.',control:'Remove badly affected leaves and improve airflow. Lightly marked sprouts can be peeled.'});
t['FUNGAL LEAF SPOTS'].text='Wet weather encourages fungal leaf spots and ringspot, marking outer leaves and sprouts. Lightly marked sprouts can be peeled; remove badly affected leaves and improve airflow.';
Object.assign(t['BLOWN SPROUTS'],{text:'Open, leafy sprouts are linked to cultivar choice, poor soil and weak or checked growth. Loose planting itself is not a direct cause. Small tender blown sprouts are still edible, but firm buttons are the goal.',signs:'Open, leafy buttons.',control:'Maintain fertile soil and steady watering. F1 varieties usually give firmer buttons; pick tender blown sprouts promptly.'});
v.introduction=v.introduction.replace('Loose soil, poor planting, drought or badly checked plants can give open, leafy sprouts','Cultivar choice, poor soil or badly checked growth can give open, leafy sprouts');
v.soil_facts[0].text='Brussels sprouts need firm, fertile soil with plenty of organic matter. Poor soil, weak growth and cultivar choice contribute to open sprouts; loose planting itself is not a direct cause.';
v.soil_facts[0].short_text='Use fertile soil and maintain steady growth; cultivar choice affects sprout firmness.';
v.key_notes[0].body='Poor soil, weak growth and cultivar choice contribute to open sprouts; loose planting itself is not a direct cause.';
const white=data.cabbage.troubles['Cabbage Whitefly'];
white.text='Cabbage whitefly are small white-winged insects with scale-like nymphs beneath brassica leaves. Adults rise when disturbed and sooty mould can develop. Colonies on outer leaves usually cause little harm to cabbage heads; this is a different species from glasshouse whitefly.';
// All other top-level data and all unrelated records must remain identical.
const undo=structuredClone(data);
for(const key of ['broccoli','brussels_sprouts','cabbage']){
 VegetableSchema.parse(data[key]);undo[key].troubles=before[key].troubles;
 if(key==='brussels_sprouts')for(const f of ['introduction','soil_facts','key_notes'])undo[key][f]=before[key][f];
}
assert.deepEqual(undo,before);
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'admin: John requested fuller pest lists and master advice corrections; executed by AI:gpt-6-astra using RHS'}));
