import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import type {Vegetable} from '../types';
import {VegetableSchema,PlantingPrintContentSchema} from '../schema';
import {plantingSourceFingerprint,plantingReviewIssue,readPlantingSource} from '../lib/planting';
import {plantingLayouts,pendingPlantingLayouts,resolvePlanting} from './plantingIllustrations';
import {nextPlantingFit,plantingPageBudget,type PlantingFitState} from './plantingFit';
import {rt} from '../lib/ranked';

const data=JSON.parse(readFileSync(resolve(import.meta.dirname,'../../../hackriculture-data/generated/master/vegetables.json'),'utf8')) as Record<string,Vegetable>;
const copy=(key='carrot')=>structuredClone(data[key]);

describe('additive, source-bound planting content',()=>{
    it.each(Object.keys(plantingLayouts))('%s has valid reviewed content and original detail',key=>{
        const veg=data[key];
        expect(PlantingPrintContentSchema.safeParse(veg.print_planting).success).toBe(true);
        expect(plantingReviewIssue(veg)).toBeNull();
        if(key==='mushroom')expect(veg.looking_after_the_crop?.length).toBeGreaterThan(0);
        else expect(rt(veg.sowing_and_planting?.method).length).toBeGreaterThan(20);
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
        expect(potato.measurements.find(m=>m.label==='First-early rows')!.value).toBe('60 cm between rows');
        expect(potato.measurements.find(m=>m.label==='Maincrop rows')!.value).toBe('75 cm between rows');
        const leek=resolvePlanting(data.leek,'leek','metric')!;
        expect(leek.measurements.find(m=>m.label==='Seed depth')!.value).toBe('1.5 cm');
        expect(leek.measurements.find(m=>m.label==='Transplant hole')!.value).toContain('15 cm');
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
        expect(resolvePlanting(data.asparagus,'asparagus','metric')!.steps).toHaveLength(3);
        const veg=copy();delete veg.print_planting;
        expect(resolvePlanting(veg,'carrot','metric')).toBeNull();
    });
    it('keeps rollout crop variants bound to their own live fields',()=>{
        const radish=copy('radish');
        const spacing=radish.sowing_and_planting!.plant_spacing as Record<string,unknown>;
        spacing.large_or_japanese_radishes={metric:'Oriental test spacing',imperial:'Oriental imperial'};
        const r=resolvePlanting(radish,'radish','metric')!;
        expect(r.measurements.find(m=>m.label==='Oriental plants')!.value).toBe('Oriental test spacing');
        expect(r.measurements.find(m=>m.label==='Winter plants')!.value).toContain('15-20');
        const t=resolvePlanting(data.turnip,'turnip','metric')!;
        expect(t.measurements.find(m=>m.label==='Maincrop plants')!.value).toContain('25 cm');
        expect(t.measurements.find(m=>m.label==='Baby / early plants')!.value).toContain('10 cm');
        expect(t.measurements.find(m=>m.label==='Leaf-only plants')!.value).toContain('Heavy thinning is not usually needed');
    });
    it('retains nested swede instructions and separate species guidance',()=>{
        const swede=resolvePlanting(data.swede,'swede','metric')!;
        expect(swede.measurements[0].path).toBe('sowing_and_planting.seed_sowing.sowing_depth');
        expect(swede.content.supplementary.some(t=>t.text.includes('pot-bound'))).toBe(true);
        const changed=copy('swede');
        (changed.sowing_and_planting!.seed_sowing as Record<string,unknown>).method='Changed sowing method';
        expect(plantingReviewIssue(changed)).toMatch(/changed/);
        const spinach=resolvePlanting(data.spinach,'spinach','metric')!;
        expect(spinach.measurements.find(m=>m.label==='Rows')!.value).toBe('Between rows: 20 cm for true spinach');
        expect(spinach.measurements.find(m=>m.label==='Final plants')!.value).toContain('8 cm');
        expect(spinach.measurements.find(m=>m.label==='Final plants')!.value).toContain('15 cm');
        expect(spinach.measurements.find(m=>m.label.includes('New Zealand'))!.value).toContain('90–120 cm');
        const salsify=resolvePlanting(data.salsify_scorzonera,'salsify_scorzonera','metric')!;
        expect(salsify.measurements.every(m=>m.value.includes('scorzonera: follow'))).toBe(true);
    });
    it('separates brassica nursery rows from final crop and transplant measurements',()=>{
        for(const key of ['broccoli','brussels_sprouts','cabbage','kale']) {
            const result=resolvePlanting(data[key],key,'metric')!;
            expect(result.measurements.find(m=>m.label==='Nursery rows')!.value).toContain('seed rows');
            expect(result.measurements.find(m=>m.label==='Final spacing')!.path).toBe('sowing_and_planting.plant_spacing');
        }
        const broccoli=resolvePlanting(data.broccoli,'broccoli','metric')!;
        expect(broccoli.measurements.find(m=>m.label==='Transplant depth')!.value).toContain('lowest leaves at soil level');
        expect(broccoli.steps[0].image).toContain('v2.png');
        expect(resolvePlanting(data.kohl_rabi,'kohl_rabi','metric')!.steps[0].image).toContain('v2.png');
    });
    it('preserves cultivar and conditional routes in the brassica companions',()=>{
        const cabbage=resolvePlanting(data.cabbage,'cabbage','metric')!;
        expect(cabbage.content.supplementary[0].text).toContain('Chinese cabbage');
        expect(cabbage.measurements.find(m=>m.label==='Final spacing')!.value).toContain('spring greens');
        const cauliflower=resolvePlanting(data.cauliflower,'cauliflower','metric')!;
        expect(cauliflower.measurements.find(m=>m.label==='Final plants')!.value).toContain('mini-cauliflowers');
        const kale=resolvePlanting(data.kale,'kale','metric')!;
        expect(kale.measurements.find(m=>m.label==='Final spacing')!.value).toContain('45 cm');
        expect(kale.measurements.find(m=>m.label==='Final rows')!.value).toContain('45–60 cm');
        expect(rt(data.kale.sowing_and_planting!.notes![5],'metric')).toContain('baby leaves');
        expect(kale.measurements.find(m=>m.label==='Transplant height')!.value).toBe('10-15 cm');
        expect(resolvePlanting(data.kale,'kale','imperial')!.measurements.find(m=>m.label==='Transplant height')!.value).toBe('4-6 in.');
        expect(kale.content.supplementary[0].text).toContain('Rape kale');
    });
    it('keeps clove cover separate from seed depth and preserves onion routes',()=>{
        const garlic=resolvePlanting(data.garlic,'garlic','metric')!;
        expect(garlic.measurements[0].path).toBe('sowing_and_planting.planting_depth');
        expect(garlic.measurements[0].label).toBe('Soil above clove tip');
        expect(garlic.measurements[0].value).toContain('2.5 cm');
        expect(garlic.steps[1].image).toContain('v2.png');
        const onions=resolvePlanting(data.onion_shallot,'onion_shallot','metric')!;
        expect(onions.measurements[0].label).toBe('Seed depth (not sets)');
        expect(onions.measurements[2].value).toContain('module clumps');
        expect(onions.measurements[2].value).toContain('shallots 15–20 cm');
        expect(onions.content.supplementary[0].text).toContain('Seed route');
        const changed=copy('onion_shallot');
        (changed.sowing_and_planting!.planting as Record<string,unknown>).method='Changed set planting';
        expect(plantingReviewIssue(changed)).toMatch(/changed/);
    });
    it('retains leaf-crop variants, nested sowing advice and selected reuse',()=>{
        const oriental=resolvePlanting(data.oriental_leaves,'oriental_leaves','metric')!;
        expect(oriental.measurements.find(m=>m.label==='Final plants / thinnings')!.value).toContain('Baby leaves 10–15 cm');
        expect(oriental.measurements.find(m=>m.label==='Final plants / thinnings')!.value).toContain('mature pak choi or cabbage hearts 30 cm');
        const changed=copy('oriental_leaves');
        (changed.sowing_and_planting!.seed_sowing as Record<string,unknown>).method='Changed direct sowing';
        expect(plantingReviewIssue(changed)).toMatch(/changed/);
        expect(resolvePlanting(data.lettuce,'lettuce','metric')!.measurements[2].value).toContain('loose-leaf');
        for(const [crop,original] of [['beet_leaf','beetroot/01-sow-clusters-v2.png'],['endive','chicory/01-sow-shallowly-v2.png']]) {
            const scene=(plantingLayouts[crop]??pendingPlantingLayouts[crop]).stages[0].image;
            expect(readFileSync(resolve(import.meta.dirname,'../../public',scene.slice(1))).equals(readFileSync(resolve(import.meta.dirname,'../../docs/planting-illustrations/drafts/2026-09-15',original)))).toBe(true);
        }
    });
    it('keeps the prepared leaf-beet widget inactive until its legacy overflow is resolved',()=>{
        expect(resolvePlanting(data.beet_leaf,'beet_leaf','metric')!.steps).toHaveLength(2);
        expect(PlantingPrintContentSchema.safeParse(data.beet_leaf.print_planting).success).toBe(true);
        expect(plantingReviewIssue(data.beet_leaf)).toBeNull();
        for(const stage of pendingPlantingLayouts.beet_leaf.stages)expect(existsSync(resolve(import.meta.dirname,'../../public',stage.image.slice(1)))).toBe(true);
    });
    it('keeps broad-bean row pairs and French-bean growing systems distinct',()=>{
        const broad=resolvePlanting(data.bean_broad,'bean_broad','metric')!;
        expect(broad.measurements.find(m=>m.label==='Within each row pair')!.value).toContain('25 cm');
        expect(broad.measurements.find(m=>m.label==='Between row pairs')!.value).toContain('60 cm');
        const french=resolvePlanting(data.bean_french,'bean_french','metric')!;
        expect(french.measurements.find(m=>m.label==='Close-spaced dwarf rows: plants')!.value).toBe('10 cm between plants');
        expect(french.measurements.find(m=>m.label==='Dwarf blocks: plants')!.value).toBe('15 cm each way');
        expect(french.measurements.find(m=>m.label==='Climbing supports')!.value).toContain('one plant per cane');
        const changed=copy('bean_french');
        (changed.sowing_and_planting as Record<string,unknown>).climbing_support_spacing={metric:'Changed spacing',imperial:'Changed imperial'};
        expect(plantingReviewIssue(changed)).toBeNull();
        expect(resolvePlanting(changed,'bean_french','metric')!.measurements.at(-1)!.value).toBe('Changed spacing');
    });
    it('retains full sweetcorn steps while combining raising and planting beside the selected block',()=>{
        const corn=resolvePlanting(data.sweet_corn,'sweet_corn','metric')!;
        expect(corn.content.steps).toHaveLength(3);
        expect(corn.steps).toHaveLength(2);
        expect(corn.steps[0].text).toContain('Sow in warm pots or modules');
        expect(corn.steps[0].text).toContain('intact rootball');
        expect(corn.steps[1].text).toContain('four short rows');
        expect(corn.steps[1].image).toContain('make-block-v4.png');
        expect(corn.measurements.at(-1)!.value).toContain('baby corn');
        const changed=copy('sweet_corn');
        (changed.sowing_and_planting!.planting as Record<string,unknown>).method='Changed transplant route';
        expect(plantingReviewIssue(changed)).toMatch(/changed/);
    });
    it.each(['bean_runner','pea'])('keeps %s prepared but inactive because its before PDF already overflows',key=>{
        expect(resolvePlanting(data[key],key,'metric')!.steps.length).toBeGreaterThan(0);
        expect(PlantingPrintContentSchema.safeParse(data[key].print_planting).success).toBe(true);
        expect(plantingReviewIssue(data[key])).toBeNull();
        for(const stage of pendingPlantingLayouts[key].stages)expect(existsSync(resolve(import.meta.dirname,'../../public',stage.image.slice(1)))).toBe(true);
    });
});

describe('bounded planting-only fitting',()=>{
    it('permits illustration review without changing the production overflow guard',()=>{
        const initial:PlantingFitState={phase:'initial',noteCount:0,imageMm:18,showImages:true};
        const options={minImageMm:14,maxImageMm:22,optionalNoteCount:3};
        expect(nextPlantingFit(initial,-500,{...options,review:true})).toEqual({...initial,phase:'done',imageMm:14});
        expect(nextPlantingFit(initial,-500,options).phase).toBe('initial');
        expect(resolvePlanting(data.pea,'pea','metric')!.steps).toHaveLength(2);
        expect(resolvePlanting(data.pea,'pea','metric',true)!.steps).toHaveLength(2);
        const stale=copy('pea');stale.sowing_and_planting!.method='Changed advice';
        expect(resolvePlanting(stale,'pea','metric',true)!.issue).toMatch(/changed/);
    });
    it('separates cucumber growing systems and squash cultivar spacing',()=>{
        const greenhouse=resolvePlanting(data.cucumber_greenhouse,'cucumber_greenhouse','metric')!;
        expect(greenhouse.measurements.some(m=>m.path.endsWith('row_spacing'))).toBe(false);
        expect(greenhouse.measurements.find(m=>m.label==='Pots / bags / mounds')!.value).toContain('2 per growbag');
        const outdoor=resolvePlanting(data.cucumber_outdoor,'cucumber_outdoor','metric')!;
        expect(outdoor.measurements[0].label).toBe('Direct outdoor seed depth');
        expect(outdoor.content.supplementary.find(s=>s.id==='direct')!.text).toContain('June');
        const squash=resolvePlanting(data.squash_pumpkin,'squash_pumpkin','metric')!;
        expect(squash.measurements.find(m=>m.label==='Spacing by type')!.value).toContain('giant pumpkins');
    });
    it('allows only the existing dense baseline height, within a hard page cap',()=>{
        expect(plantingPageBudget(920)).toBe(958);
        expect(plantingPageBudget(961.5)).toBe(961.5);
        expect(plantingPageBudget(1000)).toBe(965);
        expect(plantingPageBudget(NaN)).toBe(958);
    });
    const start:PlantingFitState={phase:'initial',noteCount:0,imageMm:18,showImages:true};
    const options={minImageMm:14,maxImageMm:22,optionalNoteCount:3};
    it('shrinks artwork to its minimum and still exports illustrations on overflow',()=>{
        let s=start;
        for(let i=0;i<4;i++)s=nextPlantingFit(s,-100,options);
        expect(s).toEqual({phase:'done',noteCount:0,imageMm:14,showImages:true});
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
