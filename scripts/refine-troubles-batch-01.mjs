// Bounded draft-layout revision after measuring batch 01; never approves copy.
import assert from 'node:assert/strict';
import {readCollection,saveCollections,revision} from '../../hackriculture-data/lib/records.mjs';
import {layoutSourceSignature} from '../src/lib/aiPrint.ts';
const data=readCollection('troubles'),rev=revision();
const edits={
beetroot_troubles:[[['mangold_fly_leaf_miner','fanging'],['bolting','autumnal_fungal_root_rots']],[['heart_rot','speckled_yellows'],['blackleg','leaf_spot']]],
brassica_troubles:[[['cabbage_root_fly','woody_kohl_rabi'],['club_root_finger_and_toe']],[['cabbage_caterpillars','flea_beetle'],['slugs_and_snails','pigeons']],[['mealy_aphid','cabbage_whitefly'],['diamond_back_moth','swede_midge']],[['downy_mildew','white_blister_white_rust'],['black_rot','leaf_spot_ring_spot']],[['wire_stem','gall_weevil'],['chafer_grubs','cutworm']],[['heartless_cabbages','split_hearts'],['blown_brussels_sprouts','button_cauliflowers']],[['whiptail','boron_deficiency'],['magnesium_deficiency']],[['frost','cabbage_stem_flea_beetle'],['manganese_deficiency']]],
bean_and_pea_troubles:[[['seed_beetle','bean_seed_fly'],['mice','birds']],[['black_bean_aphid','pea_aphid'],['pea_and_bean_weevil','pea_thrips']],[['no_flowers','no_pods'],['pea_moth','marsh_spot']],[['chocolate_spot','halo_blight'],['anthracnose']],[['downy_mildew','powdery_mildew'],['grey_mould_botrytis']],[['fusarium_wilt','leaf_and_pod_spot'],['foot_rot_and_root_rot']]]
};
for(const [slug,pages]of Object.entries(edits)){
 if(process.argv[2]&&slug!==process.argv[2])continue;
 const g=data[slug];assert.equal(g.ai_layout.status,'draft');assert.equal(g.ai_layout.source_signature,layoutSourceSignature(g));
 g.ai_layout.pages=pages.map((cols,p)=>({...p===0?{intro_height_mm:38}:{},columns:cols.map(keys=>keys.map((key,i)=>({key,height_mm:slug==='beetroot_troubles'&&p===0?(i===0?110:87):((p===0?200:238)-(keys.length-1)*3)/keys.length})))}));
 if(slug==='brassica_troubles')g.ai_layout.pages[0].columns[0].forEach((c,i)=>c.height_mm=i===0?111:86);
 g.ai_layout.updated_at=new Date().toISOString();
 g.ai_layout.updated_by='AI: measured batch 01 layout (model not recorded)';
 assert.deepEqual(pages.flat(2).sort(),Object.keys(g.conditions).sort());
}
console.log(saveCollections({troubles:data},{actor:'AI: assisted print',expectedRevision:rev}));
