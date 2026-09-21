import {describe,it,expect} from 'vitest';
import {troubleColour,troublePalette,troubleCopy} from './troubleContent';
import palettes from './vegetable_palettes.json';
import {TroublePrintSummarySchema} from '../schema';
import type {TroubleCondition} from '../types';
describe('Troubles print content',()=>{
 it('reuses each vegetable page tint, with neutral grey for mixed or unknown groups',()=>{
  for(const [category,palette] of Object.entries(palettes)){
   expect(troublePalette({source_heading:'test',applies_to:['a']},{a:{category}})).toEqual(palette);
  }
  const veg={a:{category:'Root Crops'},b:{category:'Brassicas'},c:{category:'Unrecognised'}};
  for(const applies_to of [[],['a','b'],['missing'],['a','missing'],['c']]){
   expect(troublePalette({source_heading:'test',applies_to},veg)).toEqual({highlight:'#808580',pageBackground:'#F8F8F7'});
  }
 });
 it('uses vegetable palette or grey for mixed, missing or unknown categories',()=>{
  const veg={a:{category:'Root Crops'},b:{category:'Root Crops'},c:{category:'Brassicas'}};
  const group={source_heading:'test',applies_to:['a','b']};
  expect(troubleColour(group,veg)).toBe('#D85B00');
  for(const applies_to of [[],['a','c'],['a','missing']])expect(troubleColour({...group,applies_to},veg)).toBe('#808580');
 });
 it('uses only approved current summaries and falls back without blocking export',()=>{
  const c:TroubleCondition={name:'Test',description:'Full signs',treatment:'Full action',prevention:'Full prevention',print_summary:{version:1,status:'approved',source:{description:'Full signs',treatment:'Full action',prevention:'Full prevention'},recognise:'Short signs',act:'Short action',prevent:'Short prevention'}};
  expect(troubleCopy(c)).toMatchObject({recognise:'Short signs',warning:null});
  expect(troubleCopy({...c,description:'Edited signs'})).toMatchObject({recognise:'Edited signs',warning:expect.stringContaining('review')});
  expect(troubleCopy({...c,print_summary:{...c.print_summary!,status:'draft'}}).recognise).toBe('Full signs');
  expect(troubleCopy({name:'Empty'}).act).toBeUndefined();
  expect(TroublePrintSummarySchema.safeParse(c.print_summary).success).toBe(true);
  expect(TroublePrintSummarySchema.safeParse({...c.print_summary,act:42}).success).toBe(false);
 });
});
