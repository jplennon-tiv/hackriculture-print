// Bounded reconciliation of legacy inline display fields with approved organic advice.
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
const rev=revision(),data=readCollection('vegetables'),before=structuredClone(data);
const changes=[];
function set(key,name,field,expected,value){
 const t=data[key].troubles[name];
 if(t[field]===value)return;
 assert.equal(t[field],expected,`${key}/${name}/${field}: preserve intervening edits`);
 changes.push([key,name,field,t[field]]);t[field]=value;
}
for(const key of ['bean_broad','bean_french']){
 set(key,'Black Bean Aphid','control','Pinch out infested tips. Spray severe colonies at dusk, avoiding flowers and bees.',key==='bean_broad'?'Pinch off infested tips; squash small damaging colonies. Allow natural predators time to act.':'Squash small damaging colonies and allow natural predators time to act.');
 set(key,'Pea and Bean Weevil','control','Keep seedlings vigorous. Hoe around plants and treat severe attacks.','Water seedlings in dry spells and protect vulnerable young plants with insect-proof mesh.');
 set(key,'No Pods','signs','','Flowers fall without forming pods.');
 const noPods=data[key].troubles['No Pods'].text;
 if(!noPods.startsWith('Flowers fall without forming pods.')){
  assert.ok(noPods.startsWith('Runner beans may lose their flowers without forming pods.'));
  // Preserve every original crop-qualified detail, but give the one-sentence
  // Key Risks display a general symptom rather than another crop's name.
  set(key,'No Pods','text',noPods,'Flowers fall without forming pods. '+noPods);
 }
}
const undo=structuredClone(data);for(const [k,n,f,v]of changes)undo[k].troubles[n][f]=v;assert.deepEqual(undo,before);
// Source edits are explicitly authorised by John's organic-method steer; unlike
// routine extract creation this is an admin correction, executed by the AI.
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'admin: John-authorised organic/source correction, executed by AI:gpt-6-astra'}));
