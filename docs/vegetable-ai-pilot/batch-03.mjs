// One-time, bounded authoring. Refuses to overwrite any existing companion.
import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {extractDependencies,printChecksum,layoutDependencies,VEGETABLE_PRINT_REVISION} from '../../src/lib/vegetablePrint.ts';
const rev=revision(),data=readCollection('vegetables'),before=structuredClone(data),now=new Date().toISOString();
const items=(texts,icon)=>texts.map(text=>({text,rank:8,icon}));
const tips=(pairs)=>pairs.map(([text,icon])=>({text,rank:8,icon}));
const edits={
 broccoli:{
  key_notes:[{title:'Choose a sunny site.',body:'Prepare in autumn, adding compost or well-rotted manure if soil is poor.'},{title:'Firm the planting ground.',body:'Do not leave brassica soil loose and fluffy before transplanting.'},{title:'Water and mulch in dry weather.',body:'Feed crops that are growing poorly.'}],
  soil_facts:items(['Choose a sunny site with firm, fertile, humus-rich soil. Prepare in autumn, adding compost or well-rotted manure if soil is poor; lime only if needed.','Let the bed settle and firm the surface before planting. Sprouting broccoli can follow peas, beans, garlic, early roots or salads if the ground is ready in time.'],'soil'),
  looking_after_the_crop:items(['Hoe regularly. Protect young plants and late calabrese with mesh; keep bird netting clear of leaves so pigeons cannot peck through.','Water in dry weather and mulch in summer. Feed crops that are slow or hungry.','Stake tall sprouting plants in exposed gardens; mulch with straw in very cold winters.','Watch for club root, caterpillars and other brassica troubles. Pick pests off early and remove diseased or damaged leaves.'],'protection'),
  harvesting:items(['Cut calabrese when the central head is well formed, before buds open or stems elongate. Avoid damaging surrounding leaves.','Side shoots usually follow in two or three weeks; keep plants growing for further pickings. Late calabrese can crop into autumn, but drought reduces yield and frost damages buds.','Pick the main sprouting-broccoli spear first, then tender side shoots regularly. Early varieties may start in January in mild seasons; late sorts continue into April or May.'],'harvest'),
  sowing_notes:items(['For early calabrese, sow indoors in March and plant under fleece in April. Sow late calabrese from May to late June for autumn heads.','Sow purple sprouting broccoli in April for large plants, or June for smaller plants.'],'sow'),
  final_tips:tips([['Keep netting clear of the leaves.','protection'],['Stake tall plants on exposed sites.','support'],['Cut spears before flower buds open.','harvest']]),
 },
 brussels_sprouts:{
  key_notes:[{title:'Firm, fertile soil gives firm sprouts.',body:'Add organic matter and let the ground settle before planting.'},{title:'Choose sun and shelter.',body:'Tall plants may need stakes where winds are strong.'},{title:'Keep young plants weed-free.',body:'Catch crops can use wide gaps only while sprouts are small.'}],
  soil_facts:items(['Choose a sunny, sheltered site with fertile soil rich in organic matter. Prepare deeply with compost or well-rotted manure, then firm the surface before planting.','Lime acid soil if needed. Keep sprout plants clear of weeds; catch crops such as lettuce can use wide gaps while the plants are small.'],'soil'),
  looking_after_the_crop:items(['Protect young plants from sparrows and mature plants from pigeons with netting held clear of the leaves.','Hoe while plants are small, then earth up stems. Firm soil and earthing-up usually give support; stake tall plants on exposed sites.','Mulch dry or hungry soil and prevent drought or checks to growth, which increase the risk of open, blown sprouts.','Remove yellow lower leaves before they decay over the sprouts. Watch for caterpillars, aphids, slugs, leaf spots and frost damage.'],'protection'),
  harvesting:items(['Pick tight, usable sprouts from the bottom upwards as their accompanying leaves begin to yellow. Discard loose or damaged lower buttons.','Pick regularly through winter before mature sprouts deteriorate. Remove yellow leaves even if you are not picking immediately.','Tender late-winter flowering shoots and the leafy top are edible before they toughen. By late spring, cut down and chop finished stems for composting.'],'harvest'),
  sowing_notes:items(['Sow early in spring for the earliest sprouts. Late April to mid-May is useful for normal crops; early June sowings give smaller plants.','Early indoor seedlings can move through frames or a holding bed before final planting.'],'sow'),
  final_tips:tips([['Keep growth steady and soil firm.','soil'],['Remove yellow lower leaves.','protection'],['Pick firm buttons regularly.','harvest']]),
 },
 cabbage:{
  key_notes:[{title:'Firm the bed before planting.',body:'Tread it firm, rake lightly and clear surface rubbish.'},{title:'Remove yellow lower leaves.',body:'Do not let them rot against winter cabbage or savoy heads.'},{title:'Use fertile, well-consolidated soil.',body:'Add organic matter and lime acid ground only if needed.'}],
  soil_facts:items(['Prepare a reasonably sunny bed in autumn with compost or well-rotted manure if soil is poor. Let the ground settle; avoid fresh manure just before planting.','Cabbages need fertile, firm soil. Lime acid ground if needed, tread the bed firm and rake lightly before planting. Use collars or fine mesh where cabbage root fly is common.'],'soil'),
  looking_after_the_crop:items(['Protect plants from birds and caterpillars with mesh or netting held clear of the leaves.','Hoe carefully until plants suppress weeds. Keep soil firm and earth up stems loosened by wind or frost.','Water in dry weather to avoid checks. Feed weak plants as heads mature, but avoid excess late nitrogen before winter and soft, lush growth.','Remove yellow lower leaves, especially on winter cabbages and savoys, before they rot against heads or shelter slugs.'],'protection'),
  harvesting:items(['Thin spring cabbage rows for greens, leaving selected plants to heart. Cut mature heads cleanly near ground level.','A shallow cross in healthy spring or summer stumps can encourage small shoots or mini-heads. Remove stumps if disease is a concern; chop healthy stems for compost.','Cut winter heads as needed, or store sound mature heads frost-free before very hard frost. Red and winter white types store best: remove loose leaves, keep cool and dry on straw or in lined boxes, and check for rot.'],'harvest'),
  sowing_notes:items(['Sow spring cabbage in late summer for autumn planting; suitable quick varieties can start under glass in late winter for June cutting.','Sow winter and storage types in spring or early summer and plant by midsummer. Avoid excess nitrogen before winter.'],'sow'),
  final_tips:tips([['Keep summer crops steadily watered.','water'],['Use spring thinnings as greens.','harvest'],['Check stored heads regularly for rot.','storage']]),
 },
};
for(const [key,values] of Object.entries(edits)){
 const v=data[key];assert.equal(v.ai_print_extracts,undefined,key);assert.equal(v.ai_print_layout,undefined,key);
 const sections={};for(const [slot,value] of Object.entries(values)){
  const paths=slot==='sowing_notes'?['sowing_and_planting']:slot==='final_tips'||slot==='key_notes'?['key_notes','soil_facts','looking_after_the_crop','harvesting','sowing_and_planting']:[slot];
  sections[slot]={value,dependencies:extractDependencies(v,paths),output_checksum:printChecksum(value),updated_at:now,updated_by:'AI:gpt-6-astra',status:'draft',locked:false,editorial_note:'Batch 03 source-linked condensation; repeated soil/care advice merged, crop routes and seasonal qualifications retained. Full master, unit pairs and approved planting companion unchanged. Intro and varieties use existing source selection. See BATCH-03.md for omissions and known source limitations.'};
 }
 v.ai_print_extracts={version:1,sections};
 const value={pest_limit:4,target_pages:2,tips_position:'full-width',intro_sentences:4,variety_count:6,align_bottoms:true};
 v.ai_print_layout={value,dependencies:layoutDependencies(v),output_checksum:printChecksum({...value,extracts:values}),updated_at:now,updated_by:'AI:gpt-6-astra',status:'draft',locked:false,renderer_revision:VEGETABLE_PRINT_REVISION};
}
const undo=structuredClone(data);for(const key of Object.keys(edits)){delete undo[key].ai_print_extracts;delete undo[key].ai_print_layout;}assert.deepEqual(undo,before);
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
