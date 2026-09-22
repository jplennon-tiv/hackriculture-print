import {describe,it,expect} from 'vitest';
import type {Vegetable} from '../types';
import {printChecksum,extractDependencies,resolveVegetableExtracts,assertVegetableExtractWritable,layoutDependencies,resolveVegetablePrintLayout,VEGETABLE_PRINT_REVISION,printItems} from './vegetablePrint';
import {VegetablePrintExtractsSchema} from '../schema';
function fixture(){
 const v:Vegetable={name:'Radish',soil_facts:[{text:'Full source',rank:8}],harvesting:[{text:'Harvest',rank:8}]};
 const value=[{text:'Short source',rank:8}];
 v.ai_print_extracts={version:1,sections:{soil_facts:{value,dependencies:extractDependencies(v,['soil_facts']),output_checksum:printChecksum(value),status:'approved',locked:false,updated_at:'2026-09-21T12:00:00Z',updated_by:'AI:test',editorial_note:'test'}}};return v;
}
describe('vegetable print extracts',()=>{
 it('uses canonical, type-sensitive checksums',()=>{
  expect(printChecksum({a:1,b:2})).toBe(printChecksum({b:2,a:1}));
  expect(printChecksum(undefined)).not.toBe(printChecksum(null));expect(printChecksum([1,2])).not.toBe(printChecksum([2,1]));
 });
 it('reuses approved extracts and ignores unrelated/audit-only changes',()=>{
  const v=fixture();expect(resolveVegetableExtracts(v).warnings).toEqual([]);
  v.harvesting=[{text:'New harvesting',rank:8}];v._field_metadata={'/soil_facts/0/text':{updated_at:'2026-09-21T13:00:00Z',updated_by:'admin'}};
  expect(resolveVegetableExtracts(v).values.soil_facts).toBeDefined();
 });
 it('rejects dependent changes even without changed timestamps and requires complete linkage',()=>{
  const v=fixture();v.soil_facts![0].text='Changed source';expect(resolveVegetableExtracts(v,true).values.soil_facts).toBeUndefined();
  const other=fixture();delete other.ai_print_extracts!.sections.soil_facts!.dependencies.soil_facts;expect(resolveVegetableExtracts(other,true).warnings[0]).toContain('incomplete');
 });
 it('requires explicit draft review and protects manual edits/locks',()=>{
  const v=fixture(),e=v.ai_print_extracts!.sections.soil_facts!;e.status='draft';expect(resolveVegetableExtracts(v).values.soil_facts).toBeUndefined();expect(resolveVegetableExtracts(v,true).values.soil_facts).toBeDefined();
  e.locked=true;expect(()=>assertVegetableExtractWritable(v,'soil_facts')).toThrow('locked');e.locked=false;e.value=[];
  expect(()=>assertVegetableExtractWritable(v,'soil_facts')).toThrow('manual');expect(resolveVegetableExtracts(v,true).values.soil_facts).toBeUndefined();
 });
 it('validates section shapes and resolves unit-aware prose',()=>{
  const v=fixture();expect(VegetablePrintExtractsSchema.safeParse(v.ai_print_extracts).success).toBe(true);
  v.ai_print_extracts!.sections.soil_facts!.value='wrong shape';expect(VegetablePrintExtractsSchema.safeParse(v.ai_print_extracts).success).toBe(false);
  expect(printItems([{text:{metric:'5 cm',imperial:'2 in.'},rank:8}],'metric')![0].text).toBe('5 cm');
 });
 it('reuses saved choices but rejects changed source, output, renderer or stale extracts',()=>{
  const v=fixture(),value={pest_limit:4,target_pages:2 as const};
  v.ai_print_layout={...v.ai_print_extracts!.sections.soil_facts!,value,renderer_revision:VEGETABLE_PRINT_REVISION,dependencies:layoutDependencies(v),output_checksum:printChecksum({...value,extracts:{soil_facts:v.ai_print_extracts!.sections.soil_facts!.value}})};
  expect(resolveVegetablePrintLayout(v).layout).toEqual(value);v.metadata={notes:'Unrelated'};expect(resolveVegetablePrintLayout(v).layout).toEqual(value);
  v.ai_print_layout.renderer_revision='vegetable-extracts-v4';expect(resolveVegetablePrintLayout(v).layout).toEqual(value);
  v.ai_print_layout.renderer_revision='old';expect(resolveVegetablePrintLayout(v).warning).toContain('renderer');v.ai_print_layout.renderer_revision=VEGETABLE_PRINT_REVISION;
  v.ai_print_layout.value.pest_limit=5;expect(resolveVegetablePrintLayout(v).warning).toContain('manual');v.ai_print_layout.value.pest_limit=4;
  v.harvesting![0].text='Changed';expect(resolveVegetablePrintLayout(v).warning).toContain('source');
 });
 it('requires a new layout revision for paired source prose even with current dependencies',()=>{
  const v=fixture(),value={pest_limit:4,target_pages:2 as const};
  v.sowing_and_planting={method:{metric:'45 cm apart.',imperial:'18 in. apart.'}};
  v.ai_print_layout={...v.ai_print_extracts!.sections.soil_facts!,value,renderer_revision:'vegetable-extracts-v4',dependencies:layoutDependencies(v),output_checksum:printChecksum({...value,extracts:{soil_facts:v.ai_print_extracts!.sections.soil_facts!.value}})};
  expect(resolveVegetablePrintLayout(v).warning).toContain('renderer changed');
  v.ai_print_layout.renderer_revision=VEGETABLE_PRINT_REVISION;
  expect(resolveVegetablePrintLayout(v).layout).toEqual(value);
 });
 it('requires linked, available measurement pairs before rendering bound copy',()=>{
  const v=fixture(),e=v.ai_print_extracts!.sections.soil_facts!;
  e.value=[{text:'Depth:',measurement_path:'sowing_and_planting.depth',rank:8}];e.output_checksum=printChecksum(e.value);
  expect(resolveVegetableExtracts(v).warnings[0]).toContain('measurement');
  v.sowing_and_planting={depth:{metric:'5 cm',imperial:'2 in.'}};
  e.dependencies=extractDependencies(v,['soil_facts','sowing_and_planting']);
  expect(resolveVegetableExtracts(v).warnings).toEqual([]);
  expect(printItems(e.value,'metric',v)![0].text).toBe('Depth: 5 cm');
 });
});
