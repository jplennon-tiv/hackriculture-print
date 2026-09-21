// One-shot, user-authorised reference corrections; never changes asset bytes or prose.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {readCollection,saveCollections,revision} from '../../hackriculture-data/lib/records.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const assignments={
 tomato_troubles:{
  leaf_roll:'tomato_leaf_mould',tomato_leaf_mould:'root_rot',grey_mould_botrytis:'stem_rot_didymella',
  root_rot:'greenhouse_whitefly',foot_rot:'verticillium_wilt',stem_rot_didymella:'potato_blight_1',
  hormone_damage:'blotchy_ripening',greenhouse_whitefly:'sun_scald',eelworm:'dry_set',
  verticillium_wilt:'hollow_fruit',magnesium_deficiency:'potato_blight_2',potato_blight:'buckeye_rot',
  blossom_end_rot:'leaf_roll',blotchy_ripening:'grey_mould_botrytis',blossom_drop:'foot_rot',
  sun_scald:'hormone_damage',ghost_spot:'eelworm',dry_set:'magnesium_deficiency',
  greenback:'blossom_end_rot',hollow_fruit:'blossom_drop',tomato_moth:'ghost_spot',
  potato_blight_2:'greenback',split_fruit:'tomato_moth',buckeye_rot:'split_fruit'
 },
 cucurbit_troubles:{powdery_mildew:'red_spider_mite',sun_scald:'powdery_mildew',red_spider_mite:null}
};
const data=readCollection('troubles'),before=structuredClone(data),rev=revision();
let count=0;
for(const[slug,mapping]of Object.entries(assignments)){
 const g=data[slug];assert(!g.ai_layout,'New layout exists: stop and review before editing');
 assert.equal(new Set(Object.values(mapping).filter(Boolean)).size,Object.values(mapping).filter(Boolean).length);
 for(const[key,basename]of Object.entries(mapping)){
  const c=g.conditions[key];assert(c);
  const expected=slug==='cucurbit_troubles'&&key==='sun_scald'?null:`/images/troubles/${slug}/${key==='potato_blight'?'potato_blight_1':key}.png`;
  assert.equal(c.image,expected,'Already remapped or manually edited');
  c.image=basename?`/images/troubles/${slug}/${basename}.png`:null;
  if(c.image)c.image_revision=createHash('sha256').update(fs.readFileSync(path.join(root,'public',c.image))).digest('hex');
  else delete c.image_revision;
  count++;
 }
}
// Prove that only image reference/hash fields differ before the backed-up write.
const stripped=structuredClone(data);
for(const[slug,mapping]of Object.entries(assignments))for(const key of Object.keys(mapping)){
 const c=stripped[slug].conditions[key],old=before[slug].conditions[key];
 c.image=old.image;if(Object.hasOwn(old,'image_revision'))c.image_revision=old.image_revision;else delete c.image_revision;
}
assert.deepEqual(stripped,before);assert.equal(count,27);
console.log(saveCollections({troubles:data},{actor:'User-authorised AI artwork correction (model not recorded)',expectedRevision:rev}));
console.log({changedImageReferences:count});
