import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import type {Vegetable} from '../types';
import {VegetableSchema,PlantingPrintContentSchema} from '../schema';
import {plantingSourceFingerprint,plantingReviewIssue,readPlantingSource} from '../lib/planting';
import {plantingLayouts,resolvePlanting} from './plantingIllustrations';
import {nextPlantingFit,type PlantingFitState} from './plantingFit';

const data=JSON.parse(readFileSync(resolve(import.meta.dirname,'../../../hackriculture-data/vegetables.json'),'utf8')) as Record<string,Vegetable>;
const copy=(key='carrot')=>structuredClone(data[key]);

describe('additive, source-bound planting content',()=>{
    it.each(Object.keys(plantingLayouts))('%s has valid reviewed content and original detail',key=>{
        const veg=data[key];
        expect(PlantingPrintContentSchema.safeParse(veg.print_planting).success).toBe(true);
        expect(plantingReviewIssue(veg)).toBeNull();
        expect(veg.sowing_and_planting?.method?.length).toBeGreaterThan(20);
        for(const unit of ['metric','imperial'] as const){
            const result=resolvePlanting(veg,key,unit)!;
            expect(result.issue).toBeNull();
            for(const m of result.measurements)expect(m.value.length).toBeGreaterThan(0);
            for(const step of result.steps)expect(existsSync(resolve(import.meta.dirname,'../../public',step.image.slice(1)))).toBe(true);
        }
    });
    it('keeps unknown fields and detailed prose through schema round trips',()=>{
        const veg=copy();
        Object.assign(veg,{future_crop_data:{custom:'untouched'}});
        Object.assign(veg.print_planting!,{future_print_setting:{custom:'untouched'}});
        expect(VegetableSchema.parse(veg)).toEqual(veg);
    });
    it('detects changed method, source notes and missing source references',()=>{
        const veg=copy();veg.sowing_and_planting!.method='A materially different method.';
        expect(plantingReviewIssue(veg)).toMatch(/changed/);
        veg.print_planting!.reviewed_source=plantingSourceFingerprint(veg,veg.print_planting!);
        expect(plantingReviewIssue(veg)).toBeNull();
        delete veg.sowing_and_planting!.method;
        expect(plantingReviewIssue(veg)).toMatch(/Missing/);
        const beet=copy('beetroot');beet.sowing_and_planting!.notes![2].text+=' Changed advice.';
        expect(plantingReviewIssue(beet)).toMatch(/changed/);
    });
    it('updates measurements without rewriting captions or requiring review',()=>{
        const veg=copy();veg.sowing_and_planting!.sowing_depth={metric:'2 cm',imperial:'3/4 in.'};
        expect(plantingReviewIssue(veg)).toBeNull();
        expect(resolvePlanting(veg,'carrot','metric')!.measurements[0].value).toBe('2 cm');
        expect(resolvePlanting(veg,'carrot','imperial')!.measurements[0].value).toBe('3/4 in.');
    });
    it('does not silently fall back to the wrong units or first variety',()=>{
        const veg=copy();veg.sowing_and_planting!.sowing_depth={metric:null,imperial:'1 in.'};
        expect(resolvePlanting(veg,'carrot','metric')!.issue).toMatch(/Missing metric/);
        veg.sowing_and_planting!.sowing_depth={a:'1 cm',b:'2 cm'};
        expect(resolvePlanting(veg,'carrot','metric')!.issue).toMatch(/Missing/);
    });
    it('keeps potato varieties and leek seed/hole depths separate',()=>{
        const potato=resolvePlanting(data.potato,'potato','metric')!;
        expect(potato.measurements.find(m=>m.label==='First-early rows')!.value).toBe('60 cm');
        expect(potato.measurements.find(m=>m.label==='Maincrop rows')!.value).toBe('75 cm');
        const leek=resolvePlanting(data.leek,'leek','metric')!;
        expect(leek.measurements.find(m=>m.label==='Seed depth')!.value).toBe('1.3 cm');
        expect(leek.measurements.find(m=>m.label==='Transplant hole')!.value).toContain('13-15 cm');
        expect(leek.steps).toHaveLength(2);
        expect(leek.steps[0].text).toContain('dibbed hole');
        expect(data.leek.print_planting!.steps).toHaveLength(3);
    });
    it('rejects malformed captions, duplicate IDs and unsafe references',()=>{
        const content=copy().print_planting!;
        content.steps[0].text='';expect(PlantingPrintContentSchema.safeParse(content).success).toBe(false);
        content.steps[0].text='A caption';content.steps[0].id=content.steps[1].id;
        expect(PlantingPrintContentSchema.safeParse(content).success).toBe(false);
        content.steps[0].id='sow';content.steps[0].source_paths=['print_planting.steps'];
        expect(PlantingPrintContentSchema.safeParse(content).success).toBe(false);
        expect(readPlantingSource({},'__proto__.constructor')).toBeUndefined();
    });
    it('leaves non-pilots on the existing renderer',()=>{
        expect(resolvePlanting(data.lettuce,'lettuce','metric')).toBeNull();
        const veg=copy();delete veg.print_planting;
        expect(resolvePlanting(veg,'carrot','metric')).toBeNull();
    });
});

describe('bounded planting-only fitting',()=>{
    const start:PlantingFitState={phase:'initial',noteCount:0,imageMm:18,showImages:true};
    const options={minImageMm:14,maxImageMm:22,optionalNoteCount:3};
    it('shrinks only artwork before text-only fallback, then reports overflow',()=>{
        let s=start;
        for(let i=0;i<4;i++)s=nextPlantingFit(s,-100,options);
        expect(s).toEqual({phase:'error',noteCount:0,imageMm:14,showImages:false});
    });
    it('tries optional notes first and rolls back an overflowing note',()=>{
        let s=nextPlantingFit(start,100,options);expect(s.phase).toBe('notes');
        s=nextPlantingFit(s,100,options);expect(s.noteCount).toBe(1);
        s=nextPlantingFit(s,-1,options);expect(s.noteCount).toBe(0);expect(s.phase).toBe('image');
    });
    it('rolls back image growth once without oscillation',()=>{
        let s=nextPlantingFit({...start,phase:'image'},5,options);expect(s.imageMm).toBe(19);
        s=nextPlantingFit(s,-1,options);expect(s.imageMm).toBe(18);expect(s.phase).toBe('done');
        expect(nextPlantingFit(s,500,options)).toBe(s);
    });
    it.each([0,30,60,100,200,1000])('terminates for a %i-pixel space budget',budget=>{
        let s=start,i=0;
        while(!['done','error'].includes(s.phase)&&i++<40)s=nextPlantingFit(s,budget-s.noteCount*40-(s.showImages?s.imageMm*3:0),options);
        expect(i).toBeLessThan(40);expect(s.noteCount).toBeLessThanOrEqual(3);
        expect(s.imageMm).toBeGreaterThanOrEqual(14);expect(s.imageMm).toBeLessThanOrEqual(22);
    });
});
