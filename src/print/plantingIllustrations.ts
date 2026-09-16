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

export const plantingLayouts: Record<string, PlantingLayout> = {
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

export function resolvePlanting(veg: Vegetable, key: string, units: UnitSystem) {
    const layout = plantingLayouts[key];
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
    return {layout,content,steps,measurements,issue};
}
export type ResolvedPlanting = NonNullable<ReturnType<typeof resolvePlanting>>;
