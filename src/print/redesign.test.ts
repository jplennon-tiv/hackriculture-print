import {describe,it,expect} from 'vitest';
import vegetables from '../../../hackriculture-data/generated/master/vegetables.json';
import troubles from '../../../hackriculture-data/generated/master/troubles.json';
import type {Vegetable,TroublesData} from '../types';
import {vegetableModel} from './vegetableModel';
import {editorialOrder} from './editorialTroubleLayout';
import {troubleFamilies,familyPalette} from './familyTheme';
import {getRiskIcon} from '../lib/keyRiskIcons';
import {RICH_CONTENT_LAYOUT_REVISION,printChecksum} from '../lib/vegetablePrint';

describe('approved-data redesign adapter',()=>{
 it('preserves source records and both-unit reviewed prose selections across all crops',()=>{
  const before=JSON.stringify(vegetables);
  for(const [key,v] of Object.entries(vegetables))for(const units of ['metric','imperial'] as const){
   const m=vegetableModel(v as unknown as Vegetable,key,units);
   for(const [slot,items] of [['soil_facts',m.soilItems],['looking_after_the_crop',m.careItems],['harvesting',m.harvestItems],['sowing_notes',m.sowingNotes],['final_tips',m.tipItems]] as const){
    const resolved=m.curated.values[slot];
    if(Array.isArray(resolved))expect(items.length,`${key}/${units}/${slot}`).toBe(resolved.length);
   }
   expect(m.planting?.issue??null,key).toBeNull();
  }
  expect(JSON.stringify(vegetables)).toBe(before);
 });
 it('keeps draft content-fitting layouts out of ordinary exports',()=>{
  const v=structuredClone(vegetables.carrot) as unknown as Vegetable;
  expect(vegetableModel(v,'carrot','metric').richFill).toEqual({alignColumns:true,fillBottoms:true});
  const layout=v.ai_print_layout!;
  layout.renderer_revision=RICH_CONTENT_LAYOUT_REVISION;
  layout.status='draft';
  layout.value.fill_bottoms=true;
  layout.output_checksum=printChecksum({...layout.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts!.sections).map(([k,e])=>[k,e!.value]))});
  expect(vegetableModel(v,'carrot','metric').richFill).toBeNull();
  expect(vegetableModel(v,'carrot','metric',true).richFill).toEqual({alignColumns:true,fillBottoms:true});
 });
 it('keeps the onion-specific bolting icon and mushroom establishment route',()=>{
  expect(getRiskIcon('Bolting','onion_shallot')).toContain('onion_bolting');
  const m=vegetableModel(vegetables.mushroom as unknown as Vegetable,'mushroom','metric');
  expect(m.planting?.steps.some(s=>/kit|compost|spawn/i.test(s.text))).toBe(true);
  expect(m.quickFacts.some(f=>f.label==='Germination')).toBe(false);
  expect(m.sowingNotes).toEqual([]);
  expect(m.editorialReport.sowing_notes.mode).toBe('not_applicable');
  expect(m.warnings).toEqual([]);
 });
 it('still warns when sowing notes exist without review or a companion is invalid',()=>{
  const v=structuredClone(vegetables.carrot) as unknown as Vegetable;
  delete v.ai_print_extracts!.sections.sowing_notes;
  expect(vegetableModel(v,'carrot','metric').warnings).toContain('sowing_notes: automatic fallback selection; review required.');
  const mushroom=structuredClone(vegetables.mushroom) as unknown as Vegetable;
  mushroom.ai_print_extracts!.sections.sowing_notes=structuredClone(vegetables.carrot.ai_print_extracts.sections.sowing_notes) as NonNullable<Vegetable['ai_print_extracts']>['sections']['sowing_notes'];
  const m=vegetableModel(mushroom,'mushroom','metric');
  expect(m.editorialReport.sowing_notes.mode).toBe('automatic');
  expect(m.warnings.some(w=>w.startsWith('sowing_notes: source changed'))).toBe(true);
 });
 it('keeps every Trouble condition exactly once and assigns all guide families explicitly',()=>{
  for(const [key,g]of Object.entries(troubles as TroublesData)){
   const order=editorialOrder(g);expect([...order].sort()).toEqual(Object.keys(g.conditions??{}).sort());
   expect(new Set(order).size).toBe(order.length);expect(troubleFamilies[key]).toBeTruthy();
   expect(familyPalette(troubleFamilies[key]).group).toBe(troubleFamilies[key]);
  }
 });
});
