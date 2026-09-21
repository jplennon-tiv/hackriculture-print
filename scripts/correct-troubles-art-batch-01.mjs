// One-shot correction of visually audited legacy assignments. Originals stay intact.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {readCollection,saveCollections,revision} from '../../hackriculture-data/lib/records.mjs';
import {layoutSourceSignature} from '../src/lib/aiPrint.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const assignments={
bean_and_pea_troubles:{
 seed_beetle:'bean_seed_fly',bean_seed_fly:'black_bean_aphid',mice:'downy_mildew',
 black_bean_aphid:'foot_rot_and_root_rot',pea_aphid:'pea_thrips',downy_mildew:'halo_blight',
 powdery_mildew:'no_pods',foot_rot_and_root_rot:'birds',pea_and_bean_weevil:'fusarium_wilt',
 pea_thrips:'anthracnose',no_flowers:'mice',halo_blight:'pea_aphid',chocolate_spot:'powdery_mildew',
 no_pods:'pea_and_bean_weevil',marsh_spot:'no_flowers',birds:'chocolate_spot',
 grey_mould_botrytis:'marsh_spot',fusarium_wilt:'grey_mould_botrytis',pea_moth:'pea_moth',
 anthracnose:'seed_beetle',leaf_and_pod_spot:'leaf_and_pod_spot'
},
brassica_troubles:{
 downy_mildew:'downy_mildew',cabbage_root_fly:'club_root_finger_and_toe',gall_weevil:'black_rot',
 club_root_finger_and_toe:'cabbage_caterpillars',white_blister_white_rust:'slugs_and_snails',
 wire_stem:'flea_beetle',black_rot:'button_cauliflowers',leaf_spot_ring_spot:'magnesium_deficiency',
 whiptail:'boron_deficiency',cabbage_caterpillars:'cutworm',pigeons:'cabbage_root_fly',
 heartless_cabbages:'white_blister_white_rust',slugs_and_snails:'leaf_spot_ring_spot',
 split_hearts:'pigeons',blown_brussels_sprouts:'split_hearts',flea_beetle:'frost',frost:'frost-v2',
 swede_midge:'manganese_deficiency',button_cauliflowers:'diamond_back_moth',
 mealy_aphid:'cabbage_stem_flea_beetle',cabbage_whitefly:'gall_weevil',magnesium_deficiency:'wire_stem',
 manganese_deficiency:'whiptail',chafer_grubs:'heartless_cabbages',boron_deficiency:'blown_brussels_sprouts',
 diamond_back_moth:'swede_midge',cutworm:'cabbage_whitefly',cabbage_stem_flea_beetle:'chafer_grubs'
},
beetroot_troubles:{fanging:'fanging-v1',autumnal_fungal_root_rots:'autumnal_fungal_root_rots-v1'}
};
const data=readCollection('troubles'),rev=revision();
let changes=0;
for(const [slug,mapping]of Object.entries(assignments)){
 const g=data[slug];
 assert.equal(g.ai_layout.status,'draft');
 assert.equal(g.ai_layout.source_signature,layoutSourceSignature(g),'Stale layout: stop and review');
 assert.equal(new Set(Object.values(mapping)).size,Object.keys(mapping).length);
 for(const[key,basename]of Object.entries(mapping)){
  const c=g.conditions[key],target=`/images/troubles/${slug}/${basename}.png`;
  assert(c);
  if(slug!=='beetroot_troubles')assert.equal(c.image,`/images/troubles/${slug}/${key}.png`,'Already remapped or manually edited');
  else assert(!c.image,'Preserve an existing image');
  const bytes=fs.readFileSync(path.join(root,'public',target));
  if(c.image!==target)changes++;
  c.image=target;c.image_revision=createHash('sha256').update(bytes).digest('hex');
 }
 if(slug==='brassica_troubles')g.conditions.frost.visual_heading='Cold-damaged leaves';
 if(slug==='beetroot_troubles'){
  g.ai_introduction='Protect young seedlings and keep roots growing steadily. Check leaf damage, bolting and root quality separately. Confirm nutrient problems before adding trace elements, and lift sound roots before prolonged autumn wet or severe frost.';
  g.ai_layout.pages=[
   {intro_height_mm:28,columns:[[{key:'mangold_fly_leaf_miner',height_mm:108},{key:'blackleg',height_mm:99}],[{key:'bolting',height_mm:104},{key:'leaf_spot',height_mm:103}]]},
   {columns:[[{key:'fanging',height_mm:117.5},{key:'heart_rot',height_mm:117.5}],[{key:'autumnal_fungal_root_rots',height_mm:117.5},{key:'speckled_yellows',height_mm:117.5}]]}
  ];
 }
 assert.deepEqual(g.ai_layout.pages.flatMap(p=>p.columns.flat().map(c=>c.key)).sort(),Object.keys(g.conditions).sort());
 g.ai_layout.source_signature=layoutSourceSignature(g);
 g.ai_layout.updated_at=new Date().toISOString();
 g.ai_layout.updated_by='AI: audited artwork correction (model not recorded)';
}
assert.equal(changes,48);
console.log(saveCollections({troubles:data},{actor:'User-authorised AI artwork correction (model not recorded)',expectedRevision:rev}));
console.log({imagePathsChanged:changes});
