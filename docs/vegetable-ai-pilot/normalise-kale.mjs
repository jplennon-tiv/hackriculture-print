// One-time, user-authorised kale master update. No PDF or renderer changes.
// Historical: mixed-unit/internal prose below was superseded by correct-kale-prose.mjs.
// Do not reuse these strings as templates for subsequent normalisation.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {VegetableSchema} from '../../src/schema.ts';
import {printChecksum,printSource,resolveVegetablePrintLayout} from '../../src/lib/vegetablePrint.ts';
const report=JSON.parse(fs.readFileSync('../hackriculture-data/planning/KALE-PILOT-PROPOSALS.json'));
const rev=revision(),data=readCollection('vegetables'),before=structuredClone(data),v=data.kale;
assert.equal(rev,report.shared_revision,'Reconcile newer data before applying this one-time update.');
assert.equal(resolveVegetablePrintLayout(v).warning,null);
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('../hackriculture-data/vegetables/kale/kale.json')).digest('hex'),report.record_sha256);
const now=new Date().toISOString();
const actor='admin: John authorised kale normalisation and JSON update; researched and authored by AI:gpt-6-astra';
for(const p of report.proposals){
 const parts=p.path.split('/').slice(1).map(k=>k.replaceAll('~1','/').replaceAll('~0','~'));
 let parent=v;for(const k of parts.slice(0,-1))parent=parent[k];
 assert.deepEqual(parent[parts.at(-1)],p.before,p.path);parent[parts.at(-1)]=structuredClone(p.proposed);
}
v.soil_facts[1].short_text='Use settled, fertile, well-drained ground; firm transplants and lime only if a soil test indicates a need.';
v.soil_facts[2].text='Kale is winter-hardy, although tolerance varies with variety and exposure. It will grow in most well-drained soils; fertile ground and steady growth give better crops.';
v.soil_facts[2].short_text='Choose fertile, well-drained soil; winter hardiness varies with variety and exposure.';
v.soil_facts[3].text='Use settled soil and firm each transplant so it resists wind rock. Either prepare the bed in advance and let it settle, or use a no-dig bed mulched with mature compost. Do not compact wet ground.';
v.soil_facts[3].short_text='Use a settled prepared or no-dig bed; firm transplants without compacting wet soil.';
v.key_notes[0]={...v.key_notes[0],title:'Use settled, fertile soil.',body:'Choose sun or light shade and good drainage. Kale can follow an early crop. Improve soil with mature compost where needed and firm transplants securely.'};
v.key_notes[1].body='Overwintered plants may produce fresh side shoots in early spring. If growth is weak, use an organic liquid feed as growth resumes; feeding is not compulsory simply because it is March.';
v.key_notes[2]={...v.key_notes[2],title:'Keep young plants growing steadily.',body:'Water during establishment and dry spells. Remove weeds carefully and firm or support plants that rock in the wind.'};
v.looking_after_the_crop[0].text='Remove weeds carefully and firm loose plants to prevent wind rock. Water young plants while they establish and during dry weather; avoid treading heavily on wet soil.';
v.looking_after_the_crop[0].short_text='Weed carefully, water young plants and secure loose stems against wind rock.';
v.looking_after_the_crop[2].text='Overwintered plants may look worn but still produce tender spring side shoots. Use an organic liquid feed if growth is weak as growth resumes, rather than feeding routinely by a fixed calendar date.';
v.looking_after_the_crop[2].short_text='Feed weak plants organically as spring growth resumes, if needed.';
v.looking_after_the_crop[4].text='Use supported insect-proof mesh where caterpillars and other brassica pests are troublesome. Keep covers clear of leaves, check beneath them and secure bird protection carefully. Leaf colour does not make a variety immune to pests.';
v.looking_after_the_crop[4].short_text='Protect against insects and birds; check beneath covers and keep them clear of leaves.';
v.looking_after_the_crop[4].icon='protection';
v.harvesting[1].text='For the spring-shoot route, removing a mature crown may encourage side shoots. Pick tender shoots from late winter into spring while young, typically about 10–13 cm (4–5 in.) long. This is separate from routine outer-leaf picking; flowering and cropping dates vary with variety and weather.';
v.harvesting[1].short_text='Pick tender spring side shoots; crown cutting is a separate harvest method.';
v.harvesting[2].text='Pick tender leaves regularly once plants are large enough, leaving enough foliage and the growing centre for further growth. Autumn and winter crops can continue into spring; yield depends on variety, conditions and picking method.';
v.harvesting[2].short_text='Pick tender leaves regularly and leave the growing centre for repeated harvests.';
v.harvesting[4].text='Red Russian is useful for tender baby salad leaves. Overwintered plants may provide fresh leaves from the new year into spring, but baby-leaf picking is not restricted to that season. Pick regularly before leaves become tough.';
v.harvesting[4].short_text='Pick Red Russian leaves young; overwintered plants can also provide tender spring leaves.';
v.harvesting[5].text='When healthy plants are finished, cut the stems into short lengths, about 10–15 cm (4–6 in.), before composting so that they break down more readily. Keep diseased roots out of home compost where disease guidance advises it.';
v.sowing_and_planting.method='Sow directly where plants will grow, or raise seedlings in modules or a nursery seedbed. Sow thinly, cover lightly and thin crowded seedlings. Move sturdy transplants before they become checked, usually when about 10–15 cm (4–6 in.) tall; harden off plants raised under cover.';
v.sowing_and_planting.plant_spacing={...v.sowing_and_planting.plant_spacing,metric:'About 45 cm between standard plants; allow more room for large varieties. Follow the packet for compact or baby-leaf crops.',imperial:'About 18 in. between standard plants; allow more room for large varieties. Follow the packet for compact or baby-leaf crops.'};
v.sowing_and_planting.final_row_spacing={...v.sowing_and_planting.final_row_spacing,metric:'Usually 45–60 cm between rows of full-size plants; adjust for variety and growing method.',imperial:'Usually 18–24 in. between rows of full-size plants; adjust for variety and growing method.'};
v.sowing_and_planting.notes[0].text='In nursery rows, thin seedlings to about 7–8 cm (3 in.) apart. This is nursery spacing, not the final spacing for mature plants.';
v.sowing_and_planting.notes[0].short_text='Thin nursery seedlings to about 7–8 cm (3 in.) apart.';
v.sowing_and_planting.notes[2].text='Set sturdy transplants with their lowest leaves just above the soil, firm gently and water in. Allow about 45 cm (18 in.) between standard plants, with more space for large varieties; follow the seed packet for compact and baby-leaf crops.';
v.sowing_and_planting.notes[2].short_text='Firm and water transplants; use spacing suited to variety and harvest size.';
v.sowing_and_planting.notes[3].text='Direct sowing is the traditional route described here for rape kale, including late spring-shoot crops. Thin in stages towards about 45 cm (18 in.) between standard plants and rows. Follow the named variety and supplier instructions rather than assuming every rape kale must be grown identically.';
v.sowing_and_planting.notes[3].short_text='Direct sow late spring-shoot kale where appropriate; follow variety-specific spacing and timing.';
v.sowing_and_planting.notes[4].text='A June to early July sowing can follow early carrots, broad beans, lettuce or another early crop. Plant out promptly when ready, often in July or early August. Choose a suitable variety and account for local season length; later sowing does not guarantee avoidance of caterpillars.';
v.sowing_and_planting.notes[4].short_text='June–early July sowings can follow early crops; allow time to establish and protect from pests.';
v.sowing_and_planting.notes[5].text='Older sources describe alternative layouts: about 50 cm (20 in.) between plants and 75 cm (30 in.) between conventional rows, or about 38 cm (15 in.) each way in a deep bed. These are retained as source-specific alternatives, not universal spacing; their variety and bed context need confirmation.';
v.sowing_and_planting.notes[5].short_text='Legacy row and deep-bed spacings are retained as alternatives pending confirmation of crop context.';
v.sowing_and_planting.notes[6].text='Spring sowing allows more growing time and can produce larger plants before winter. Earlier and later crops can both encounter caterpillars; protection and regular inspection are more dependable than sowing date alone.';
v.sowing_and_planting.notes[6].short_text='Spring sowing gives more growing time; protect both early and late crops from pests.';
v.calendar.sowing_time.most_popular=['--03/--06'];v.calendar.sowing_time.less_usual=['--07'];
v.calendar.sowing_time.indoors_under_glass=['--03/--05'];
v.calendar.sowing_time.notes=['Main outdoor sowing window: March to June, adjusted for variety, soil conditions and locality. The legacy most_popular field denotes the main window here, not measured popularity.','Modules can be started under cover in spring; harden off before planting.','June to early July sowing is a later follow-crop route where variety and local season length permit. It does not guarantee reduced pest pressure.','Choose timing for the intended harvest: baby leaves, autumn/winter leaves or later spring shoots. Follow the named variety instructions for rape kale.'];
v.calendar.planting_time.most_popular=['--04/--07'];v.calendar.planting_time.less_usual=['--08'];
v.calendar.planting_time.notes=['Plant sturdy, hardened transplants when ready rather than waiting for a fixed month.','Early August planting belongs to the later sowing route and needs enough growing time before winter. Direct-sown crops do not require transplanting.'];
v.calendar.harvest_time.notes=['The main September–April window describes autumn/winter leaf crops and their spring continuation, not the earliest possible baby-leaf harvest.','Baby leaves can be picked earlier once plants are large enough; timing depends on variety and growing conditions.','Tender side shoots and young flowering shoots may extend the crop into May. Pick before they become coarse and do not remove the growing centre during routine leaf picking.'];
v.time_to_harvest.default.from_sowing={...v.time_to_harvest.default.from_sowing,min:null,max:null,unit:null,text:'Depends on variety, sowing date and harvest stage: baby leaves can be picked earlier than a full-size autumn/winter crop; overwintered plants may continue with spring shoots.'};
v.time_to_harvest.ready_in_short='Varies by stage';
v.time_to_harvest.ready_in_summary='First picking depends on variety and leaf size; main crops give autumn/winter leaves and later spring shoots.';
// Preserve all uncertain old entries; only the exact same-name duplicate is merged.
delete v.varieties['Modern and coloured varieties']['Dwarf Green Curled'];
v.varieties['Plain-leaved varieties'].overview='Plain-leaved kales vary in height, hardiness and kitchen use. Pick tender leaves or spring shoots according to the named variety; do not assume all flat-leaved types are only useful after winter.';
v.varieties['Plain-leaved varieties']['Thousand-headed Kale'].text='A hardy, productive traditional kale grown for greens and young spring shoots. This name may refer to the same variety as Thousand Head in this record; the identity and source strain remain to be confirmed.';
v.varieties['Plain-leaved varieties'].Cottagers.text='A heritage kale with green and purple foliage, grown for winter leaves and spring side shoots. Current UK seed listings exist. Its perennial description and the identity of the older source strain need checking before treating it as a standard biennial crop.';
v.varieties['Rape Kale varieties'].overview='Late spring-shoot kales provide useful pickings when other winter crops finish. Direct sowing is the traditional route in the source notes; follow the named variety and supplier instructions for timing and establishment.';
v.varieties['Rape Kale varieties']['Asparagus Kale'].text='A spring-shoot kale listed by Real Seeds, grown especially for tender shoots; young leaves can also be eaten. Its relationship to the older textbook strain has not been confirmed.';
v.varieties['Curly-leaved varieties']['Reflex F1']={text:'A green curly kale for repeated winter picking. Recommended by the RHS and listed by UK suppliers.',rank:9};
v.varieties['Modern and coloured varieties']['Yurok F1']={text:'A compact Tuscan-type kale with dark puckered leaves, for autumn and winter picking. Recommended by the RHS.',rank:9};
v.varieties['Modern and coloured varieties']['Red Russian'].text='A flat, serrated-leaved kale with mild young leaves, useful for salads as well as cooking. Pick leaves while tender. Red Winter is retained as a possible alias in review notes pending strain confirmation.';
v.varieties['Curly-leaved varieties']['Westland Autumn'].text='A curly-leaved winter kale still found in seed catalogues. Current supplier descriptions disagree on stature and harvest details; check the named strain and availability before choosing it. Do not assume it is identical to Westland Winter.';
for(const [g,n,r]of [['Modern and coloured varieties','Nero di Toscana',10],['Modern and coloured varieties','Red Russian',9],['Modern and coloured varieties','Redbor F1',9],['Modern and coloured varieties','Sutherland',8],['Leaf and Spear variety','Pentland Brig',8],['Curly-leaved varieties','Dwarf Green Curled',8]])v.varieties[g][n].rank=r;
for(const n of ['Fribor','Spurt','Darkibor','Tall Green Curled'])v.varieties['Curly-leaved varieties'][n].rank=5;
v.troubles.Frost.text='Kale is winter-hardy, but severe frost and wind rock can damage exposed plants. Hardiness varies with variety, establishment and weather. Damaged foliage does not necessarily mean the whole plant is lost.';
v.troubles.Frost.control='Keep plants secure against wind rock, support tall plants where needed and allow sound plants to recover. Remove badly damaged leaves when practical; do not apply cabbage-head storage advice to a leaf crop.';
const boron=readCollection('troubles').brassica_troubles.conditions.boron_deficiency;
v.troubles['Boron Deficiency'].control=boron.treatment+' '+boron.prevention;
for(const [n,k]of [['Magnesium Deficiency','magnesium_deficiency'],['Manganese Deficiency','manganese_deficiency'],['Chafer Grubs','chafer_grubs'],['Cutworm','cutworm']]){
 const c=readCollection('troubles').brassica_troubles.conditions[k];v.troubles[n].control=[c.treatment,c.prevention].filter(s=>s&&s!=='None.').join(' ');
}
v.troubles._redirect='See the shared brassica_troubles record. Use crop-specific applicability and kale overrides; the old source-book page numbers are retained in review provenance only.';
v.metadata??={};v.metadata.normalisation={reviewed_at:now,updated_by:actor,status:'master-updated-awaiting-John-diff-review',evidence:'planning/KALE-PILOT.md',scope:'Kale only; UK garden advice and organic controls. Variety ranks are editorial selection priorities, not sales popularity or agronomic severity.',previous_source_revision:rev,merged_variety:{name:'Dwarf Green Curled',retained_group:'Curly-leaved varieties',previous_additional_group:'Modern and coloured varieties',original_values_preserved_in:'planning/KALE-PILOT-PROPOSALS.json and guarded transaction backup'},legacy_harvest_duration:before.kale.time_to_harvest.default.from_sowing,variety_review:{current_recommended_pool:['Nero di Toscana','Red Russian','Redbor F1','Dwarf Green Curled','Pentland Brig','Sutherland','Reflex F1','Yurok F1'],uk_availability_unconfirmed:['Tall Green Curled','Fribor','Spurt','Darkibor'],listed_but_stock_or_identity_needs_review:['Westland Autumn','Hungry Gap','Asparagus Kale','Cottagers','Thousand-headed Kale','Thousand Head'],additional_candidates:['Black Magic','Starbor F1','Dazzling Blue'],unresolved_aliases:[{names:['Thousand-headed Kale','Thousand Head'],action:'Both retained pending identity/strain confirmation.'},{names:['Nero di Toscana','Lacinato Blue'],action:'Lacinato Blue removed from asserted synonyms; retained here for investigation.'},{names:['Red Russian','Red Winter'],action:'Verify strain identity before merging further records.'}]},retained_issues:[{path:'/troubles/Boron Deficiency',status:'retained-out-of-scope-copy',note:'Cauliflower curd advice; excluded from kale by shared scope. Organic control corrected; reconcile shared ownership later.'},{path:'/group_overview',status:'retained-shared-chapter-copy',note:'Contains other brassica crops and old generic rules; kale-specific soil/method/notes take precedence. Shared chapter ownership remains unresolved.'},{path:'/troubles/_redirect',status:'obsolete-reference-replaced',original:'Brassica troubles are described on pages 28-31.',note:'Source book/edition not established.'},{path:'/sowing_and_planting/notes/5',status:'qualified-legacy-alternative',note:'Retain bed-layout alternatives pending source/cultivar confirmation.'},{path:'/in_the_kitchen',status:'further-evidence-review',note:'Blanching/storage/cooking details not refreshed in this growing-data pass.'},{path:'/yield/default/per_plant',status:'estimate-context-unverified',note:'Legacy 2 lb estimate retained; not a yield guarantee.'},{path:'/varieties/Curly-leaved varieties/Fribor/text',status:'height-unverified',note:'Legacy 9-inch stature needs confirmation; do not promote it as a verified metric fact.'}],sources:[...new Set(report.proposals.flatMap(p=>p.evidence).filter(x=>x.startsWith('https:')).concat(['https://charlesdowding.co.uk/blogs/homeacres/seeds-and-varieties-my-tips','https://www.realseeds.co.uk/kale.html','https://vitalseeds.co.uk/product/kale-pentland-brigg/','https://marshallsgarden.com/products/kale-yurok-f1-seeds-10204214','https://www.suttons.co.uk/vegetable-seeds/kale-seeds/kale-seeds-f1-reflex_MH-32525']))]};
// Preserve exact old copy, checksums and measurements as historical evidence.
// Changed dependencies deliberately remain stale until a fresh proof is reviewed.
const staleSections=[];
for(const [slot,e]of Object.entries(v.ai_print_extracts.sections))if(Object.entries(e.dependencies).some(([p,h])=>printChecksum(printSource(v,p))!==h)){
 assert.equal(e.locked,false);assert.equal(printChecksum(e.value),e.output_checksum);e.status='draft';e.updated_at=now;e.updated_by=actor;staleSections.push(slot);
}
assert.equal(v.ai_print_layout.locked,false);v.ai_print_layout.status='draft';v.ai_print_layout.updated_at=now;v.ai_print_layout.updated_by=actor;
assert.deepEqual(v.print_planting,before.kale.print_planting);
VegetableSchema.parse(v);
for(const k of Object.keys(before).filter(k=>k!=='kale'))assert.deepEqual(data[k],before[k]);
assert.ok(!/mancozeb|permethrin|lindane|cheshunt|heptenophos/i.test(JSON.stringify(v.troubles)));
const save=saveCollections({vegetables:data},{expectedRevision:rev,actor});assert.equal(save.changed,1);
const backupRoot='../hackriculture-data/backups/admin';
const backup=fs.readdirSync(backupRoot,{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name).sort().at(-1);
const journal=JSON.parse(fs.readFileSync(`${backupRoot}/${backup}/transaction.json`));assert.deepEqual(journal.files.map(f=>f.file),['vegetables/kale/kale.json']);
fs.writeFileSync('../hackriculture-data/planning/KALE-PILOT-APPLIED.json',JSON.stringify({at:now,by:actor,previous_revision:rev,save,backup:`backups/admin/${backup}`,stale_sections:staleSections,print_status:'Draft with intentionally stale source dependencies; previous measurement evidence is historical. New proof deferred until John reviews the JSON diff.',validation:'Kale Zod parse; only kale changed; 17 proposal preconditions verified; no selected legacy chemical names in live troubles; approved planting companion untouched.'},null,2)+'\n');
console.log({save,backup,staleSections});
