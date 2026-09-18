import fs from 'node:fs';
import {plantingSourceFingerprint} from '../../src/lib/planting.ts';
const old=JSON.parse(fs.readFileSync('../hackriculture-data/vegetables.json'));
const s='sowing_and_planting.';
const step=(id,title,text,...source_paths)=>({id,title,text,source_paths});
const contents={
marrow_courgette:{steps:[step('sow','Sow on edge','Sow singly in warm pots or modules, with the seed on edge. Keep compost lightly moist; cold, wet compost can rot the seed.',s+'method',s+'notes.2'),step('plant','Keep one strong plant','Harden off and plant after frost risk. For direct sowing in warm soil, sow two or three per station and keep the strongest.',s+'method',s+'notes.0',s+'notes.3')],supplementary:[],optional_note_paths:[s+'notes.1',s+'notes.4']},
squash_pumpkin:{steps:[step('sow','Start in a pot','Sow singly under cover. Pot modules on as the first leaf develops, then harden off. Direct-sow only when soil and nights are warm.',s+'method',s+'notes.1'),step('plant','Give room to spread','Set one plant in each compost-rich station. Give pumpkins ample room to trail and root at the stem nodes.',s+'method',s+'notes.2')],supplementary:[],optional_note_paths:[s+'notes.0',s+'notes.3',s+'notes.4']},
cucumber_outdoor:{steps:[step('sow','Raise in warmth','Sow one seed edgeways in a warm pot. Avoid overwatering; harden off before moving outside.',s+'notes.0',s+'notes.6'),step('plant','Plant roots intact','Wait until frost risk has passed. Handle the fragile stem gently, keep the rootball intact and water in thoroughly.',s+'method',s+'notes.1',s+'notes.6')],supplementary:[{id:'direct',text:'Direct sowing: wait for genuinely warm soil, usually in June; protect stations initially with cloches or jars.',source_paths:[s+'method',s+'notes.5']}],optional_note_paths:[s+'notes.4',s+'notes.5']},
cucumber_greenhouse:{steps:[step('sow','Sow on edge','Sow one seed edgeways in a warm pot or module. Water as compost starts drying; avoid keeping small pots constantly wet.',s+'method',s+'notes.4'),step('plant','Handle gently','Plant in settled, warm greenhouse conditions. Protect the fragile roots and stem; use a pot, growbag or prepared mound and water in.',s+'method',s+'notes.2',s+'notes.5',s+'notes.6')],supplementary:[],optional_note_paths:[s+'notes.0',s+'notes.1',s+'notes.3']}
};
const patch=['*** Begin Patch','*** Update File: /Users/johnlennon/Documents/web_site/hackriculture-data/vegetables.json'];
// Source order matters to the patch engine.
for(const key of Object.keys(old).filter(k=>contents[k])){
 if(old[key].print_planting)throw Error('Already prepared '+key);
 const c={version:1,...contents[key],reviewed_source:''};c.reviewed_source=plantingSourceFingerprint(old[key],c);
 const a=JSON.stringify(old[key],null,2).split('\n'),tail=a.slice(-8,-1).map(l=>'  '+l);
 patch.push(`@@   "${key}": {`,...tail.slice(0,-1).map(l=>' '+l),'-'+tail.at(-1),'+'+tail.at(-1)+',',...JSON.stringify(c,null,2).split('\n').map((l,i)=>'+'+(i===0?'    "print_planting": {':'    '+l)),'   },');
}
patch.push('*** End Patch');console.log(patch.join('\n'));
