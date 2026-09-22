import {authorBatch} from './overnight-author.mjs';
export const specs={
 beet_leaf:{
  layout:{tips_position:'full-width',intro_sentences:3,variety_count:4},
  pests:[
   ['Slugs',8,'Young leaves and seedlings are chewed.','Check young plants after dark; hand-pick and protect establishment.'],
   ['Downy Mildew',7,'Yellow patches above; grey-purple mould below.','Remove diseased leaves; thin promptly and improve drainage.'],
   ['Manganese Deficiency',5,'Yellowing between veins; margins may curl.','Check drainage and soil pH; avoid over-liming and confirm the cause.'],
   ['Leaf Spot',5,'Brown-centred spots with darker borders.','Remove affected leaves and debris; rotate and avoid crowding.']
  ],
  pestSources:{Slugs:'Leaf beet is usually hardy and trouble-free, but slugs may nibble young plants, especially in autumn or damp weather. Inspect vulnerable young plants after dark and hand-pick slugs where damage is significant. Protect establishment; mature plants generally tolerate some damage.'},
  coverage:'Three applicable shared/inline conditions plus slugs explicitly mentioned in the crop source. Copied true-spinach bolting is excluded by host scope; spinach blight and New Zealand frost do not apply. All four variety entries retained. Soil combines fertility, drainage and climate; care keeps thinning, moisture, flowering and repeat harvest. Notes distinguish chard and spinach-beet routes. Original master prose preserved; copied host scope logged for normalisation.',
  sections:{
   key_notes:[{title:'Keep leaves growing steadily.',body:'Rich soil, regular picking and reliable moisture give tender leaves.'},{title:'Choose the type for your kitchen.',body:'Chard gives colourful stems; spinach beet is grown mainly for its leaves.'}],
   soil_facts:['Grow in fertile soil with compost or well-rotted manure, avoiding waterlogged ground. Check pH before liming; about 6.5 suits the crop.','Chard tolerates a wide range of conditions, while spinach beet prefers cool, moist weather and a deep, fertile soil.'],
   looking_after_the_crop:['Thin seedlings to the spacing for the chosen type, weed regularly and remove flower stems when they appear.','Water in dry spells and mulch to conserve moisture. Regular picking encourages fresh, tender leaves.'],
   harvesting:['Pick outer leaves without disturbing the roots, leaving the young centre to keep growing.','Use small leaves in salads; cook larger leaves and thick chard midribs separately if needed.','Overwintered plants can give an early spring picking before they flower.'],
   sowing_notes:['Each corky seed cluster can produce several seedlings: thin to the strongest. Pre-soaking is optional.','Sow spinach beet in spring and again in midsummer for a longer supply. Give chard more room when growing it for stems; late-summer sowings can overwinter in mild areas.'],
   final_tips:[['Pick a little from several plants to keep a supply of young leaves coming.','harvest'],['Keep late sowings growing before winter; they may provide useful early spring leaves.','sow']]
  }
 },
 spinach:{
  layout:{tips_position:'full-width',intro_sentences:2,variety_count:6},
  pests:[
   ['BOLTING',10,'Plants run to seed in heat or dry soil.','Keep soil moist; sow small replacement rows in suitable cool conditions.'],
   ['MOULD OR DOWNY MILDEW',8,'Yellow patches above; grey mould below.','Remove affected leaves; clear badly diseased crops and rotate.'],
   ['MANGANESE DEFICIENCY',6,'Leaves yellow in over-limed, high-pH soil.','Check the cause and pH; avoid further unnecessary lime.'],
   ['NEW ZEALAND SPINACH FROST',7,'Frost damages or kills this tender substitute.','Sow or plant New Zealand spinach after frost danger has passed.'],
   ['Leaf Spot',5,'Pale-centred spots with dark or purple rims.','Remove diseased leaves and debris; rotate and avoid crowding.'],
   ['Spinach Blight',5,'Young leaves yellow, pucker and become narrow.','Remove infected plants; clear weed hosts and monitor aphids.']
  ],
  coverage:'Six distinct conditions: four inline rows plus leaf spot and spinach blight, with mildew aliases merged and New Zealand frost explicitly scoped. Introduction separates true spinach from its tender summer substitute. Soil/care retain season, fertility, moisture, pH and winter protection. Harvest preserves outer/centre and winter/NZ distinctions. Complete notes retain wet-winter and NZ station routes alongside approved true-spinach captions. No nutrition claims added; full source remains available.',
  sections:{
   introduction:'Spinach is a quick leafy crop that needs rich soil and steady moisture to avoid bolting. Choose summer or winter varieties for the season; New Zealand spinach is a separate, frost-tender summer substitute.',
   key_notes:[{title:'Keep true spinach cool and moist.',body:'Rich soil and timely thinning help plants keep producing tender leaves.'},{title:'Match the crop to the season.',body:'Winter spinach and frost-tender New Zealand spinach need different treatment.'}],
   soil_facts:['Use fertile, moisture-retentive but well-drained soil improved with compost. Aim for pH 6–6.5; test before liming and avoid over-liming.','Summer true spinach benefits from partial shade. Winter crops need sun; New Zealand spinach tolerates summer warmth but must be protected from frost.'],
   looking_after_the_crop:['Thin promptly, keep weeds down and mulch to conserve moisture. Water during dry weather, especially summer true spinach.','Protect winter crops with cloches in colder areas. Remove bolted true-spinach plants and replace them with a suitable new sowing.','Keep the strongest New Zealand seedling at each station and harvest regularly once warm-weather growth is established.'],
   harvesting:['Pick young outer leaves from several plants and leave the centre intact. Take winter leaves sparingly to preserve further growth.','Cut young shoots from New Zealand spinach little and often. True spinach cooks down considerably, so allow enough plants for useful pickings.'],
   sowing_notes:['Choose named varieties for the season and sow short rows in succession. Raised ridges help on wet winter ground; flat beds suit better-drained conditions.','Sow New Zealand spinach after frost danger has passed. Soak its seed for 24 hours, sow three per station and retain the strongest seedling.'],
   final_tips:[['Use tender thinnings in the kitchen instead of letting seedlings crowd one another.','plant_spacing'],['Have a replacement short row ready when heat or flowering ends a true-spinach crop.','sow']]
  }
 },
 pea:{
  layout:{tips_position:'full-width',intro_sentences:2,variety_count:7},
  pests:[
   ['PEA MOTH / CATERPILLARS',9,'Caterpillars feed on peas inside pods.','Early crops can escape; use insect mesh before flowering where needed.'],
   ['MILDEW',9,'White powdery growth on leaves and pods.','Choose resistant varieties; water roots and keep plants well spaced.'],
   ['BIRDS',9,'Seeds disappear; seedlings and leaves are pecked.','Use securely fixed, taut netting or wire guards from sowing.'],
   ['MICE',8,'Seeds disappear before germination.','Start in protected modules or protect direct-sown seed.'],
   ['SLUGS',8,'Young plants and low pods are chewed.','Support early; inspect young plants and hand-pick where necessary.'],
   ['PEA AND BEAN WEEVIL',7,'U-shaped notches appear on leaf edges.','Protect establishment; vigorous plants usually outgrow light damage.'],
   ['PEA THRIPS',6,'Tiny dark insects; silvery, damaged leaves or pods.','Confirm the pest; keep plants watered and tolerate minor damage.'],
   ['Pea Aphid',6,'Colonies stunt shoots and damage flowers.','Tolerate small colonies; squash damaging clusters and favour predators.'],
   ['Downy Mildew',6,'Yellow blotches; mauve-brown mould beneath.','Remove affected leaves; improve airflow and avoid prolonged wet foliage.'],
   ['Foot Rot and Root Rot',5,'Yellowing plants; roots and stem bases rot.','Remove badly affected plants; improve drainage and rotate.']
  ],
  pestSources:{'PEA THRIPS':'Tiny brown-black or yellowish thrips damage leaves and pods, leaving silvery patches or tiny holes. Severe attacks may yellow and shrivel plants, especially in hot, dry weather. Confirm the pest by inspecting damaged growth. Keep plants watered to reduce stress, encourage natural predators and tolerate minor damage; do not use household soap or detergent sprays.'},
  coverage:'Ten distinct useful pea problems selected by crop relevance: seven inline plus pea aphid, downy mildew and root rot. Powdery-mildew aliases combined; bean-specific fly/aphid/chocolate spot excluded. Less prominent seed beetle, marsh spot, wilt, anthracnose/leaf-pod spot and ambiguous halo-blight/no-pods shared advice remain in master for later review, not displaced at first overflow. Household-soap thrips prescription replaced with reviewed shared organic advice and RHS non-chemical principles. Soil/care/harvest retain support, moisture, shell/mangetout/snap, shoots and drying. Notes preserve early protected, clump and mild-autumn routes alongside approved captions. Variety aliases and unit-only summaries logged, not normalised.',
  sections:{
   key_notes:[{title:'Support and protect peas early.',body:'Guard newly sown rows against birds and provide supports before plants sprawl.'},{title:'Water when flowers and pods form.',body:'Moisture at this stage helps produce a useful, tender crop.'}],
   soil_facts:['Choose fertile, moisture-retentive, well-drained soil. Add compost or well-rotted manure where needed, but avoid heavy nitrogen feeding.','Peas prefer cool, moist conditions. Test before liming towards pH 6.5; avoid sowing into cold, waterlogged ground.'],
   looking_after_the_crop:['Fit supports early: twiggy sticks suit dwarf peas; tall varieties need sturdy posts and netting. Keep rows weed-free.','Water at flowering and while pods fill, and mulch to conserve moisture. Avoid prolonged wet foliage and keep plants ventilated.','Protect young growth with secure guards or taut netting. After cropping, cut stems at ground level and leave healthy roots in the soil.'],
   harvesting:['Pick shelling peas when pods are full but peas are still sweet; hold the vine with one hand while picking with the other.','Pick mangetout while pods are flat and snap peas when plump but crisp. Check plants regularly, starting with the lower pods.','Use a separate sowing for shoots. For drying peas or saving suitable seed, let pods mature fully and finish drying under cover if weather turns wet.'],
   sowing_notes:['Early crops can start under cover or cloches; plant out when conditions suit. For clumps, use two or three seeds per module and follow the variety’s clump spacing.','Hardy round-seeded peas can be sown in November in mild areas with protection, but establishment is less reliable. Later successions face greater heat, mildew and moth pressure.'],
   final_tips:[['Sow a succession of short rows for manageable pickings instead of one large glut.','sow'],['Pick frequently: pods left to mature can slow further cropping.','harvest']]
  }
 }
};
if(process.argv[1]?.endsWith('/overnight-02.mjs'))authorBatch('overnight-02',specs);
