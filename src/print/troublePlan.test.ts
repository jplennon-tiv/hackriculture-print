import {describe,it,expect} from 'vitest';
import {troubleLayoutSignature,troublePlanStatus,troubleLayoutVersion,compactTroublePage} from './troublePlan';
import type {TroubleGroup} from '../types';
function fixture():TroubleGroup {
 const group:TroubleGroup={source_heading:'Test',introduction:'Intro',ai_introduction:'Short intro',conditions:{one:{name:'One',description:'Signs'}}};
 group.ai_layout={version:1,status:'draft',renderer:troubleLayoutVersion,updated_at:'2026-09-19T12:00:00Z',updated_by:'admin',source_signature:troubleLayoutSignature(group),hero_images:[],pages:[{columns:[[{key:'one',height_mm:100}],[]]}]};return group;
}
describe('saved Troubles layout validity',()=>{
 it('compacts only incomplete final pages, including a one-page set',()=>{
  const plan=fixture().ai_layout!;
  expect(compactTroublePage(plan,0)).toBe(true);
  plan.pages.push(structuredClone(plan.pages[0]));
  expect(compactTroublePage(plan,0)).toBe(false);
  expect(compactTroublePage(plan,1)).toBe(true);
  const card={key:'test',height_mm:100};
  for(const count of [2,3,4]){
   plan.pages[1].columns=[Array.from({length:count},()=>({...card})),[]];
   expect(compactTroublePage(plan,1)).toBe(count<4);
  }
 });
 it('requires approval outside review mode',()=>{
  const g=fixture();expect(troublePlanStatus(g).usable).toBe(false);expect(troublePlanStatus(g,true).usable).toBe(true);
  g.ai_layout!.status='approved';expect(troublePlanStatus(g).usable).toBe(true);
 });
 it('invalidates on source, AI copy, image, crop or renderer changes',()=>{
  for(const mutate of [
   (g:TroubleGroup)=>{g.conditions!.one.description='Changed';},
   (g:TroubleGroup)=>{g.conditions!.one.ai_description='Changed';},
   (g:TroubleGroup)=>{g.conditions!.one.image='/changed.png';},
   (g:TroubleGroup)=>{g.conditions!.one.image_revision='a'.repeat(64);},
   (g:TroubleGroup)=>{g.applies_to=['other'];},
   (g:TroubleGroup)=>{g.ai_layout!.renderer='old';},
  ]){const g=fixture();mutate(g);expect(troublePlanStatus(g,true).usable).toBe(false);}
 });
 it('rejects missing or duplicate cards even if the source signature matches',()=>{
  const g=fixture();g.ai_layout!.pages[0].columns[0].push({key:'one',height_mm:20});expect(troublePlanStatus(g,true).usable).toBe(false);
  g.ai_layout!.pages[0].columns[0]=[];expect(troublePlanStatus(g,true).usable).toBe(false);
 });
});
