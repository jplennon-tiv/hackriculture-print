import{fs,assert,readCollection,revision,clone,refresh,save}from'../../../hackriculture-data/planning/normalisation-02-tools.mjs';
const data=readCollection('vegetables'),before=clone(data),rev=revision(),keys=['asparagus','cucumber_outdoor','tomato_greenhouse'];
assert.equal(rev,'1d5c4d4a75749d48913d4270d91161dc695a2f785f447868fef6c5585312486f','Historical one-shot correction: do not replay');
const pair=(metric,imperial)=>({metric,imperial});
const a=data.asparagus.sowing_and_planting;
for(const s of [a,a.planting]){
 s.trench_or_ridge_depth=pair('Dig trenches 30 cm wide and 20 cm deep. Leave 45 cm between trench centres. Stagger plants in adjacent trenches.','Dig trenches 12 in. wide and 8 in. deep. Leave 18 in. between trench centres. Stagger plants in adjacent trenches.');
 s.row_spacing=pair('45 cm between rows; stagger plants in adjacent rows','18 in. between rows; stagger plants in adjacent rows');
}
const c=data.cucumber_outdoor,cs=c.sowing_and_planting;
cs.row_spacing=pair('120 cm between rows when vines trail over the ground','4 ft between rows when vines trail over the ground');
cs.plant_spacing=pair('60 cm between plants along each row; one plant per prepared site','2 ft between plants along each row; one plant per prepared site');
cs.planting_method='Choose a sunny, sheltered spot. Enrich each planting site with mature compost or well-rotted manure and allow prepared soil to settle. Harden off indoor-raised plants and plant out after frost risk has passed, usually from June in settled warmth. Water pots first, keep the rootball intact and set the compost surface level with the surrounding soil. Water in thoroughly. For a trailing crop, guide shoots across the bed and keep developing fruits clean on tiles. Alternatively, fit sturdy trellis or netting at planting and guide climbing stems onto it to save ground space.';
c.print_planting.steps[1].text='Harden off, then plant in settled warmth after frost risk has passed. Water the pot first; keep the rootball intact, set it at soil level and water in.';
c.print_planting.steps[1].source_paths.push('sowing_and_planting.planting_method');
c.print_planting.supplementary.unshift({id:'outdoor-bed',text:'Choose a sunny, sheltered bed enriched with mature compost. For a trailing crop, guide shoots across the soil and rest fruits on tiles. To save ground space, fit sturdy trellis or netting at planting and guide stems onto it.',source_paths:['sowing_and_planting.planting_method','sowing_and_planting.notes.7']});
c.print_planting.optional_note_paths=[];
const t=data.tomato_greenhouse,ts=t.sowing_and_planting;
ts.container_planting=pair('One plant per 30–45 cm diameter pot; two per standard growbag. Use peat-free potting compost.','One plant per 12–18 in. diameter pot; two per standard growbag. Use peat-free potting compost.');
ts.pot_spacing=pair('For upright cordons, allow about 60 cm between pot centres so foliage has room.','For upright cordons, allow about 24 in. between pot centres so foliage has room.');
ts.soil_bed_spacing=pair('45–60 cm between plants in compost-enriched soil; use the wider spacing for vigorous cordons and airflow.','18–24 in. between plants in compost-enriched soil; use the wider spacing for vigorous cordons and airflow.');
ts.planting_out=pair('Plant well-rooted plants when the greenhouse is reliably warm, commonly as the first truss opens. Water the pot first and keep the rootball intact. Use large pots, growbags or a prepared soil bed. In soil, allow 45–60 cm between plants, choosing the wider spacing for vigorous varieties and airflow. For upright cordons in pots, allow about 60 cm between pot centres.','Plant well-rooted plants when the greenhouse is reliably warm, commonly as the first truss opens. Water the pot first and keep the rootball intact. Use large pots, growbags or a prepared soil bed. In soil, allow 18–24 in. between plants, choosing the wider spacing for vigorous varieties and airflow. For upright cordons in pots, allow about 24 in. between pot centres.');
t.print_planting.steps[1].text='Plant well-rooted plants into pots, growbags or a soil bed once the greenhouse is warm. Water first, set slightly deeper and support cordons with a cane or string.';
t.print_planting.steps[1].source_paths.push('sowing_and_planting.container_planting','sowing_and_planting.soil_bed_spacing');
const decisions={
 asparagus:{summary:'Combined trench dimensions and row spacing. John confirmed his width/depth reversal was a typo: retain 30 cm wide, 20 cm deep. Row spacing is 45 cm centre-to-centre; stagger plants, not trenches.',sources:['https://www.rhs.org.uk/vegetables/asparagus/grow-your-own']},
 cucumber_outdoor:{summary:'Explain outdoor establishment and trailing vs supported growth. Retain accepted 60 cm plants/120 cm trailing rows, supported by the upper end of primary seed-producer guidance (30–60 cm plants, 100–120 cm rows). RHS has a closer 30 cm planting route; not silently substituted for the approved trailing arrangement.',sources:['https://www.rhs.org.uk/vegetables/cucumbers/grow-your-own','https://www.mrfothergills.com.au/blogs/all/how-to-grow-cucumbers']},
 tomato_greenhouse:{summary:'RHS: one plant in a 30–45 cm pot, two per standard growbag; 45–60 cm between soil-grown plants. Pot centres about 60 cm for upright cordons is an explicit practical editorial application of plant-spacing/airflow guidance, not an RHS quotation specifying pot centres. Container diameter and centre spacing are separate.',sources:['https://www.rhs.org.uk/vegetables/tomatoes/grow-your-own']}
};
for(const k of keys){data[k].metadata.planting_followup={at:new Date().toISOString(),by:'AI:gpt-6-astra',status:'draft-for-John-review',...decisions[k]};refresh(data[k],before[k]);}
fs.writeFileSync('tmp/planting-followup/before.json',JSON.stringify(Object.fromEntries(keys.map(k=>[k,before[k]])),null,2));
save(data,rev,keys,'NORMALISATION-PLANTING-WRITTEN.json','admin: John requested three planting clarifications; authored by AI:gpt-6-astra');
