// Presentation metadata, not a second gardening database. Captions live in the master.
import type { Vegetable } from '../types';
import { resolveMeasurement, type UnitSystem } from '../lib/measure';
import { readPlantingSource, plantingReviewIssue } from '../lib/planting';

export interface PlantingLayout {
    stages: { id: string; image: string; compact?: boolean }[];
    paired: boolean;
    imageMm: number;
    minImageMm: number;
    maxImageMm: number;
    measurements: { label: string; path: string }[];
}
const source = (field: string) => `sowing_and_planting.${field}`;
const standard = (plantLabel = 'Final plants') => [
    {label:'Seed depth',path:source('sowing_depth')},
    {label:'Rows',path:source('row_spacing')},
    {label:plantLabel,path:source('plant_spacing')},
];
const scene = (crop: string, file: string) => `/images/planting/${crop}/${file}.png`;
const bounds = {minImageMm:14,maxImageMm:22};

// POC review-only layouts: explicit plantingReview=1 includes these without
// relaxing normal export safeguards. Pagination still needs user-led review.
export const pendingPlantingLayouts: Record<string, PlantingLayout> = {
    artichoke_jerusalem: {"stages":[{"id":"step1","image":"/images/planting/artichoke_jerusalem/set-tuber-v1.png"},{"id":"step2","image":"/images/planting/artichoke_jerusalem/cover-tuber-v1.png"}],"paired":true,"imageMm":14,"minImageMm":14,"maxImageMm":14,"measurements":[{"label":"Tuber depth","path":"sowing_and_planting.planting_depth"},{"label":"Rows","path":"sowing_and_planting.row_spacing"},{"label":"Plants / blocks","path":"sowing_and_planting.plant_spacing"}]},
    artichoke_globe: {"stages":[{"id":"step1","image":"/images/planting/artichoke_globe/position-offset-v1.png"},{"id":"step2","image":"/images/planting/artichoke_globe/firm-at-the-same-level-v1.png"}],"paired":true,"imageMm":14,"minImageMm":14,"maxImageMm":14,"measurements":[{"label":"Final rows","path":"sowing_and_planting.row_spacing"},{"label":"Final plants","path":"sowing_and_planting.plant_spacing"}]},
    asparagus: {"stages":[{"id":"step1","image":"/images/planting/asparagus/prepare-mound-v1.png"},{"id":"step2","image":"/images/planting/asparagus/spread-roots-v1.png"},{"id":"step3","image":"/images/planting/asparagus/initial-cover-v1.png"}],"paired":false,"imageMm":14,"minImageMm":14,"maxImageMm":14,"measurements":[{"label":"Trench","path":"sowing_and_planting.trench_or_ridge_depth"},{"label":"Initial cover","path":"sowing_and_planting.planting_depth"},{"label":"Crowns","path":"sowing_and_planting.plant_spacing"}]},
    aubergine: {"stages":[{"id":"step1","image":"/images/planting/aubergine/raise-warm-v1.png"},{"id":"step2","image":"/images/planting/aubergine/plant-out-v1.png"}],"paired":true,"imageMm":14,"minImageMm":14,"maxImageMm":14,"measurements":[{"label":"Rows","path":"sowing_and_planting.row_spacing"},{"label":"Plants","path":"sowing_and_planting.plant_spacing"}]},
    capsicum: {"stages":[{"id":"step1","image":"/images/planting/capsicum/raise-warm-v1.png"},{"id":"step2","image":"/images/planting/capsicum/set-final-plant-v1.png"}],"paired":true,"imageMm":14,"minImageMm":14,"maxImageMm":14,"measurements":[{"label":"Rows","path":"sowing_and_planting.row_spacing"},{"label":"Plants","path":"sowing_and_planting.plant_spacing"}]},
    celeriac: {"stages":[{"id":"step1","image":"/images/planting/celeriac/surface-sow-v1.png"},{"id":"step2","image":"/images/planting/celeriac/grow-on-v1.png"},{"id":"step3","image":"/images/planting/celeriac/crown-clear-v1.png"}],"paired":false,"imageMm":14,"minImageMm":14,"maxImageMm":14,"measurements":[{"label":"Rows","path":"sowing_and_planting.row_spacing"},{"label":"Plants","path":"sowing_and_planting.plant_spacing"}]},
    celery: {"stages":[{"id":"step1","image":"/images/planting/celery/raise-seedlings-v1.png"},{"id":"step2","image":"/images/planting/celery/plant-at-module-level-v1.png"}],"paired":true,"imageMm":14,"minImageMm":14,"maxImageMm":14,"measurements":[{"label":"Spacing by type","path":"sowing_and_planting.plant_spacing"},{"label":"Rows / blocks","path":"sowing_and_planting.row_spacing"}]},
    florence_fennel: {"stages":[{"id":"step1","image":"/images/planting/florence_fennel/raise-in-modules-v3.png"},{"id":"step2","image":"/images/planting/florence_fennel/plant-level-v4.png"}],"paired":true,"imageMm":14,"minImageMm":14,"maxImageMm":14,"measurements":[{"label":"Rows","path":"sowing_and_planting.row_spacing"},{"label":"Direct-sown plants","path":"sowing_and_planting.seed_sowing.plant_spacing"}]},
    mushroom: {"stages":[{"id":"step1","image":"/images/planting/mushroom/spawned-compost-v1.png"},{"id":"step2","image":"/images/planting/mushroom/maintain-moisture-v1.png"}],"paired":true,"imageMm":14,"minImageMm":14,"maxImageMm":14,"measurements":[]},
    rhubarb: {"stages":[{"id":"step1","image":"/images/planting/rhubarb/set-crown-v1.png"},{"id":"step2","image":"/images/planting/rhubarb/firm-and-water-v1.png"}],"paired":true,"imageMm":14,"minImageMm":14,"maxImageMm":14,"measurements":[{"label":"Rows","path":"sowing_and_planting.row_spacing"},{"label":"Crowns","path":"sowing_and_planting.plant_spacing"}]},
    tomato_greenhouse: {"stages":[{"id":"step1","image":"/images/planting/tomato_greenhouse/grow-on-in-pot-v1.png"},{"id":"step2","image":"/images/planting/tomato_greenhouse/plant-and-support-v1.png"}],"paired":true,"imageMm":14,"minImageMm":14,"maxImageMm":14,"measurements":[{"label":"Pots / growbags","path":"sowing_and_planting.container_planting"},{"label":"Pot spacing","path":"sowing_and_planting.pot_spacing"},{"label":"Soil beds","path":"sowing_and_planting.soil_bed_spacing"}]},
    tomato_outdoor: {"stages":[{"id":"step1","image":"/images/planting/tomato_outdoor/grow-on-in-pot-v1.png"},{"id":"step2","image":"/images/planting/tomato_outdoor/plant-beside-support-v1.png"}],"paired":true,"imageMm":14,"minImageMm":14,"maxImageMm":14,"measurements":[{"label":"Tall plants","path":"sowing_and_planting.plant_spacing"}]},
    // These retain their previous review layouts; they are now approved for normal export.
    bean_runner: {...bounds,paired:false,imageMm:18,stages:[
        {id:'support',image:scene('bean_runner','set-supports-v1')},
        {id:'sow',image:scene('bean_runner','sow-beside-pole-v1')},
        {id:'establish',image:scene('bean_runner','establish-double-row-v1')},
    ],measurements:standard()},
    pea: {...bounds,paired:false,imageMm:18,stages:[
        {id:'sow',image:scene('pea','sow-broad-drill-v1')},
        {id:'support',image:scene('pea','cover-and-support-v1')},
    ],measurements:[
        {label:'Seed depth',path:source('sowing_depth')},
        {label:'Drill width',path:source('drill_width')},
        {label:'Rows / supports',path:source('row_spacing')},
        {label:'Seeds / clumps',path:source('plant_spacing')},
    ]},
    beet_leaf: {...bounds,paired:false,imageMm:18,stages:[
        {id:'sow',image:scene('beet_leaf','sow-clusters-v2')},
        {id:'thin',image:scene('beet_leaf','thin-young-plants-v1')},
    ],measurements:standard()},
};

// All prepared layouts are now approved for normal exports. Keep the explicit
// review query available for draft inspection, but use the same guarded fitter
// for the standard print and batch paths.
export const plantingLayouts: Record<string, PlantingLayout> = {
    ...pendingPlantingLayouts,
    marrow_courgette: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'sow',image:scene('marrow_courgette','sow-on-edge-v1')},
        {id:'plant',image:scene('marrow_courgette','plant-one-strong-plant-v1')},
    ],measurements:[
        {label:'Seed depth by route',path:source('sowing_depth')},
        {label:'Spacing by type',path:source('row_spacing')},
        {label:'Final plants',path:source('plant_spacing')},
    ]},
    squash_pumpkin: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'sow',image:scene('squash_pumpkin','sow-one-pot-v1')},
        {id:'plant',image:scene('squash_pumpkin','plant-intact-v1')},
    ],measurements:[
        {label:'Seed depth by route',path:source('sowing_depth')},
        {label:'Spacing by type',path:source('row_spacing')},
        {label:'Final plants',path:source('plant_spacing')},
    ]},
    cucumber_outdoor: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'sow',image:scene('cucumber_outdoor','sow-on-edge-v1')},
        {id:'plant',image:scene('cucumber_outdoor','plant-intact-v1')},
    ],measurements:[
        {label:'Direct outdoor seed depth',path:source('sowing_depth')},
        {label:'Trailing rows',path:source('row_spacing')},
        {label:'Final plants',path:source('plant_spacing')},
    ]},
    cucumber_greenhouse: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'sow',image:scene('cucumber_greenhouse','sow-on-edge-v1')},
        {id:'plant',image:scene('cucumber_greenhouse','plant-gently-v1')},
    ],measurements:[
        {label:'Seed depth',path:source('sowing_depth')},
        {label:'Pots / bags / mounds',path:source('plant_spacing')},
        {label:'Mound method only',path:source('trench_or_ridge_depth')},
    ]},
    bean_broad: {...bounds,paired:false,imageMm:18,stages:[
        {id:'sow',image:scene('bean_broad','sow-large-beans-v1')},
        {id:'rows',image:scene('bean_broad','establish-double-row-v1')},
    ],measurements:[
        {label:'Seed depth',path:source('sowing_depth')},
        {label:'Within each row pair',path:source('within_double_row_spacing')},
        {label:'Between row pairs',path:source('row_spacing')},
        {label:'Plants',path:source('plant_spacing')},
    ]},
    bean_french: {...bounds,paired:false,imageMm:18,stages:[
        {id:'sow',image:scene('bean_french','sow-station-v1')},
        {id:'thin',image:scene('bean_french','keep-strongest-v1')},
    ],measurements:[
        {label:'Seed depth',path:source('sowing_depth')},
        {label:'Dwarf rows',path:source('row_spacing')},
        {label:'Close-spaced dwarf rows: plants',path:source('plant_spacing')},
        {label:'Dwarf blocks: plants',path:source('dwarf_block_spacing')},
        {label:'Climbing supports',path:source('climbing_support_spacing')},
    ]},
    sweet_corn: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'plant',image:scene('sweet_corn','plant-intact-v1'),compact:true},
        {id:'block',image:scene('sweet_corn','make-block-v4'),compact:true},
    ],measurements:[
        {label:'Seed depth',path:source('sowing_depth')},
        {label:'Seeds per station',path:source('seeds_per_station')},
        {label:'Rows in block',path:source('row_spacing')},
        {label:'Plants by type',path:source('plant_spacing')},
    ]},
    garlic: {...bounds,paired:false,imageMm:18,stages:[
        {id:'set',image:scene('garlic','set-clove-v1')},
        {id:'cover',image:scene('garlic','cover-tip-v2')},
    ],measurements:[
        {label:'Soil above clove tip',path:source('planting_depth')},
        {label:'Rows / blocks',path:source('row_spacing')},
        {label:'Cloves',path:source('plant_spacing')},
    ]},
    onion_shallot: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'set',image:scene('onion_shallot','position-set-v1'),compact:true},
        {id:'firm',image:scene('onion_shallot','firm-tip-showing-v1'),compact:true},
    ],measurements:[
        {label:'Seed depth (not sets)',path:source('sowing_depth')},
        {label:'Rows by crop',path:source('row_spacing')},
        {label:'Plants / clumps',path:source('plant_spacing')},
    ]},
    lettuce: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'sow',image:scene('lettuce','sow-shallowly-v1'),compact:true},
        {id:'thin',image:scene('lettuce','thin-for-type-v1'),compact:true},
    ],measurements:standard()},
    endive: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'sow',image:scene('endive','sow-shallowly-v2'),compact:true},
        {id:'thin',image:scene('endive','thin-young-rosettes-v2'),compact:true},
    ],measurements:standard()},
    oriental_leaves: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'raise',image:scene('oriental_leaves','raise-small-plugs-v1')},
        {id:'plant',image:scene('oriental_leaves','plant-at-the-original-level-v1')},
    ],measurements:[
        {label:'Seed cover',path:source('seed_sowing.sowing_depth')},
        {label:'Direct-sown rows',path:source('seed_sowing.row_spacing')},
        {label:'Final plants / thinnings',path:source('seed_sowing.plant_spacing')},
        {label:'Module rows',path:source('planting.row_spacing')},
    ]},
    broccoli: {...bounds,paired:false,imageMm:18,stages:[
        {id:'raise',image:scene('broccoli','raise-seedlings-v2')},
        {id:'plant',image:scene('broccoli','transplant-firmly-v1')},
    ],measurements:[
        {label:'Seed depth',path:source('sowing_depth')},
        {label:'Nursery rows',path:source('row_spacing')},
        {label:'Final spacing',path:source('plant_spacing')},
        {label:'Transplant depth',path:source('planting_depth')},
    ]},
    brussels_sprouts: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'raise',image:scene('brussels_sprouts','raise-strong-plants-v1')},
        {id:'plant',image:scene('brussels_sprouts','plant-firmly-v1')},
    ],measurements:[
        {label:'Seed depth',path:source('sowing_depth')},
        {label:'Nursery rows',path:source('row_spacing')},
        {label:'Final spacing',path:source('plant_spacing')},
    ]},
    cabbage: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'raise',image:scene('cabbage','raise-seedlings-v1')},
        {id:'plant',image:scene('cabbage','plant-at-the-correct-level-v1')},
    ],measurements:[
        {label:'Seed depth',path:source('sowing_depth')},
        {label:'Nursery rows',path:source('row_spacing')},
        {label:'Final spacing',path:source('plant_spacing')},
    ]},
    cauliflower: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'raise',image:scene('cauliflower','raise-seedlings-v1')},
        {id:'plant',image:scene('cauliflower','firm-into-the-bed-v1')},
    ],measurements:standard()},
    kale: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'raise',image:scene('kale','raise-young-plants-v1')},
        {id:'plant',image:scene('kale','set-deeper-and-firm-v1')},
    ],measurements:[
        {label:'Seed depth',path:source('sowing_depth')},
        {label:'Nursery rows',path:source('row_spacing')},
        {label:'Final spacing',path:source('plant_spacing')},
        {label:'Final rows',path:source('final_row_spacing')},
        {label:'Transplant height',path:source('transplant_height')},
    ]},
    kohl_rabi: {...bounds,paired:false,imageMm:18,stages:[
        {id:'sow',image:scene('kohl_rabi','sow-shallowly-v2')},
        {id:'thin',image:scene('kohl_rabi','thin-young-plants-v1')},
    ],measurements:standard()},
    parsnip: {...bounds,paired:false,imageMm:16,stages:[
        {id:'sow',image:scene('parsnip','sow-fresh-seed-v1')},
        {id:'thin',image:scene('parsnip','thin-in-place-v1')},
    ],measurements:standard()},
    radish: {...bounds,paired:false,imageMm:18,stages:[
        {id:'sow',image:scene('radish','sow-short-drill-v1')},
        {id:'space',image:scene('radish','leave-room-v1')},
    ],measurements:[
        {label:'Seed depth',path:source('sowing_depth')},
        {label:'Salad rows',path:source('row_spacing.spring_summer_varieties')},
        {label:'Winter rows',path:source('row_spacing.winter_varieties')},
        {label:'Salad plants',path:source('plant_spacing.small_spring_radishes')},
        {label:'Oriental plants',path:source('plant_spacing.large_or_japanese_radishes')},
        {label:'Winter plants',path:source('plant_spacing.winter_radishes')},
    ]},
    turnip: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'sow',image:scene('turnip','sow-a-fine-drill-v1')},
        {id:'thin',image:scene('turnip','thin-for-intended-harvest-v1')},
    ],measurements:[
        {label:'Seed depth',path:source('sowing_depth')},
        {label:'Baby / spring rows',path:source('row_spacing.spring_baby_turnips')},
        {label:'Maincrop rows',path:source('row_spacing.autumn_or_maincrop_turnips')},
        {label:'Leaf-only rows',path:source('row_spacing.turnip_tops')},
        {label:'Baby / early plants',path:source('plant_spacing.baby_or_spring_turnips')},
        {label:'Maincrop plants',path:source('plant_spacing.maincrop_roots')},
        {label:'Leaf-only plants',path:source('plant_spacing.turnip_tops')},
    ]},
    swede: {...bounds,paired:false,imageMm:18,stages:[
        {id:'sow',image:scene('swede','sow-shallow-drills-v1')},
        {id:'thin',image:scene('swede','thin-small-seedlings-v1')},
    ],measurements:[
        {label:'Outdoor seed depth',path:source('seed_sowing.sowing_depth')},
        {label:'Rows',path:source('seed_sowing.row_spacing')},
        {label:'Plants',path:source('seed_sowing.plant_spacing')},
    ]},
    spinach: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'sow',image:scene('spinach','sow-the-drill-v1')},
        {id:'thin',image:scene('spinach','thin-young-leaves-v1')},
    ],measurements:[...standard(),
        {label:'New Zealand spinach (separate crop)',path:source('new_zealand_spinach')},
    ]},
    salsify_scorzonera: {...bounds,paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'sow',image:scene('salsify_scorzonera','sow-direct-v1'),compact:true},
        {id:'thin',image:scene('salsify_scorzonera','thin-in-place-v1'),compact:true},
    ],measurements:standard()},
    beetroot: { ...bounds, paired:false,imageMm:18,stages:[
        {id:'sow',image:scene('beetroot','sow-clusters-v2')},
        {id:'thin',image:scene('beetroot','thin-seedlings-v1')},
    ],measurements:standard('Individual plants')},
    carrot: { ...bounds, paired:false,imageMm:18,stages:[
        {id:'sow',image:scene('carrot','sow-thinly-v1')},
        {id:'cover',image:scene('carrot','cover-lightly-v1')},
        {id:'thin',image:scene('carrot','thin-later-v1')},
    ],measurements:standard()},
    potato: { ...bounds, paired:false,imageMm:18,stages:[
        {id:'place',image:scene('potato','sprouts-up-v1')},
        {id:'cover',image:scene('potato','cover-gently-v1')},
    ],measurements:[
        {label:'Trench depth',path:source('sowing_depth')},
        {label:'Plants',path:source('plant_spacing')},
        {label:'First-early rows',path:source('row_spacing.first_early_varieties')},
        {label:'Maincrop rows',path:source('row_spacing.maincrop_varieties')},
    ]},
    leek: { ...bounds, paired:false,imageMm:14,stages:[
        {id:'lower',image:scene('leek','lower-seedling-v1'),compact:true},
        {id:'water',image:scene('leek','water-hole-v1')},
    ],measurements:[
        {label:'Seed depth',path:source('sowing_depth')},
        {label:'Transplant hole',path:source('planting_depth')},
        {label:'Rows',path:source('row_spacing')},
        {label:'Plants',path:source('plant_spacing')},
    ]},
    chicory: { ...bounds, paired:true,imageMm:14,maxImageMm:14,stages:[
        {id:'sow',image:scene('chicory','sow-shallowly-v2')},
        {id:'thin',image:scene('chicory','thin-young-plants-v1')},
    ],measurements:standard()},
};

export function resolvePlanting(veg: Vegetable, key: string, units: UnitSystem, review = false) {
    const layout = plantingLayouts[key] ?? (review ? pendingPlantingLayouts[key] : undefined);
    const content = veg.print_planting;
    if (!layout || !content) return null;
    let issue = plantingReviewIssue(veg);
    const steps = layout.stages.map(stage => {
        const text = content.steps.find(s => s.id === stage.id);
        if (!text || (stage.compact && !text.compact_text)) issue = `Missing planting caption: ${stage.id}`;
        return {...stage,title:text?.title ?? stage.id,text:(stage.compact ? text?.compact_text : text?.text) ?? ''};
    });
    const measurements = layout.measurements.map(binding => {
        // Binding must select a single stage/variety; never choose the first dict entry.
        const field = readPlantingSource(veg,binding.path);
        const value = typeof field === 'string' || (field && typeof field === 'object' && 'metric' in field && 'imperial' in field && typeof (field as Record<string,unknown>)[units]==='string')
            ? resolveMeasurement(field,units) : null;
        if (!value) issue = `Missing ${units} planting measurement: ${binding.path}`;
        return {...binding,value:value ?? ''};
    });
    return {layout,content,steps,measurements,issue,review};
}
export type ResolvedPlanting = NonNullable<ReturnType<typeof resolvePlanting>>;
