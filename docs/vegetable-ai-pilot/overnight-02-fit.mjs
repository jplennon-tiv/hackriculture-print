import{specs}from'./overnight-02.mjs';
import{authorBatch}from'./overnight-author.mjs';
const p=specs.pea;
const compact=[
 ['Caterpillars inside pods.','Sow early; mesh before flowering.'],
 ['White powder on leaves or pods.','Resistant varieties; water roots, space well.'],
 ['Seeds or young leaves taken.','Protect with taut netting or wire guards.'],
 ['Seed vanishes before sprouting.','Use protected modules or seed guards.'],
 ['Young plants or low pods chewed.','Support early; check and hand-pick.'],
 ['U-shaped leaf-edge notches.','Protect seedlings; light damage is tolerated.'],
 ['Tiny insects; silvery damage.','Confirm pest; water, tolerate minor damage.'],
 ['Colonies on tender shoots.','Squash damaging clusters; favour predators.'],
 ['Yellow patches; mould beneath.','Remove affected leaves; improve airflow.'],
 ['Yellowing; roots and base rot.','Remove affected plants; drain and rotate.']
];
p.pests=p.pests.map((r,i)=>[r[0],r[1],...compact[i],r[4]]);
p.sections.looking_after_the_crop=['Support early with pea sticks or sturdy netting suited to the variety. Weed and protect young plants with secure guards.','Water as flowers and pods form; mulch, avoid wet foliage and maintain airflow. After cropping, leave healthy roots in the soil.'];
p.sections.harvesting=['Pick shelling peas full but sweet, mangetout flat and snap peas plump but crisp. Hold the vine and pick regularly from the bottom up.','Use a separate sowing for shoots. Let drying peas or suitable seed mature fully; finish drying under cover in wet weather.'];
p.sections.soil_facts=['Use fertile, moisture-retentive but well-drained soil, improved with compost. Avoid heavy nitrogen feeding.','Choose cool, moist conditions, never cold waterlogged ground. Test before liming towards pH 6.5.'];
p.sections.sowing_notes=['Early crops can start under cover. Sow two or three seeds per module for clumps; use the variety’s clump spacing.','Hardy round-seeded peas can overwinter from November sowings in mild areas, with protection. Later sowings face more heat, mildew and moths.'];
p.coverage+=' Initial physical PDF spilled and clipped with ten long rows. Condensed all ten signs/controls and coordinated soil/care/harvest/notes; no pest row removed.';
authorBatch('overnight-02',{pea:p},{revise:true});
