import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
if(process.argv[2]!=='--save')throw Error('Use --save once after reviewing source corrections');
const rev=revision(),data=readCollection('vegetables'),before=structuredClone(data),changes=[];
function set(key,path,value){let v=data[key];for(const p of path.slice(0,-1))v=v[p];const leaf=path.at(-1);changes.push({key,path,before:v[leaf],after:value});v[leaf]=value;}
const a=data.asparagus,c=data.celery;
assert.match(a.troubles['ASPARAGUS BEETLE'].text,/derris or permethrin/);
set('asparagus',['troubles','ASPARAGUS BEETLE','text'],a.troubles['ASPARAGUS BEETLE'].text.replace('Pick off adults early in the morning where practical, or spray/dust with derris or permethrin at the first sign of attack.','Check plants regularly from spring onwards and pick off adults and larvae where damage is developing. Small populations can be tolerated; encourage their natural predators.'));
set('asparagus',['troubles','ASPARAGUS BEETLE','control'],'Check regularly; pick off beetles and larvae where needed and encourage natural predators.');
set('asparagus',['troubles','SLUGS','text'],'Spears are gnawed, making them unfit for table use. Check vulnerable shoots on mild, damp evenings and hand-pick slugs; encourage natural predators.');
set('asparagus',['troubles','SLUGS','control'],'Check shoots on damp evenings, hand-pick slugs and encourage natural predators.');
assert.match(c.soil_facts[1].text,/lime may be used/);
set('celery',['soil_facts',1,'text'],'Celery tolerates fairly acid soil and does not usually need lime. Where slugs are troublesome, check plants on mild, damp evenings and hand-pick them; encourage natural predators.');
set('celery',['soil_facts',1,'short_text'],'Do not lime routinely; hand-pick slugs on damp evenings and encourage predators.');
assert.match(c.soil_facts[2].text,/15 in/);
set('celery',['soil_facts',2,'text'],'For trench varieties, prepare a trench in spring about 12 in. (30 cm) deep and 16-20 in. (40-50 cm) wide. Refill with soil mixed with well-rotted manure or garden compost to 4 in. (10 cm) below ground level. Leave the remaining soil nearby for earthing-up later.');
set('celery',['soil_facts',2,'short_text'],'Prepare a 12 in. deep, 16-20 in. wide trench; refill with soil and compost to 4 in. below ground.');
const undo=structuredClone(data);for(const change of changes){let v=undo[change.key];for(const p of change.path.slice(0,-1))v=v[p];v[change.path.at(-1)]=change.before;}assert.deepEqual(undo,before);
console.log(JSON.stringify({changes,...saveCollections({vegetables:data},{actor:'admin: user-authorised RHS organic/source corrections (AI)',expectedRevision:rev})},null,2));
