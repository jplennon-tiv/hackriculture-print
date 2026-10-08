import {describe,expect,it} from 'vitest';
import vegetables from '../../../hackriculture-data/generated/master/vegetables.json';
import type {Vegetable} from '../types';
import {flattenVarieties,vegetableModel} from './vegetableModel';
import {formatVarietyName} from '../lib/varietyName';

describe('print variety selection',()=>{
 it('displays legacy capitalised names with initial capitals, preserving hybrid labels and apostrophes',()=>{
  for(const [source,display] of [
   ['BOLTARDY','Boltardy'],['BLUE LAKE WHITE SEEDED','Blue Lake White Seeded'],
   ['BELSTAR F1','Belstar F1'],["CONNOVER'S COLOSSAL","Connover's Colossal"],
   ["MONT D'OR (yellow)","Mont D'Or (yellow)"],
   ['PURPLE-PODDED CLIMBING (purple)','Purple-Podded Climbing (purple)'],
   ['Pablo F1','Pablo F1'],['Nero di Toscana','Nero di Toscana'],
  ])expect(formatVarietyName(source)).toBe(display);
 });
 it('reads deeper groups without turning group metadata into cultivars, in both units',()=>{
  const source={
   'GLOBE varieties':{overview:'Round roots',Red:{
    other_names:'Red beet',description:'Group description',maturity_months:['--06'],
    Boltardy:{text:{metric:'Roots 5 cm across.',imperial:'Roots 2 in. across.'},short_text:{metric:'5 cm roots.',imperial:'2 in. roots.'},rank:9,unknown:'keep'},
   },Yellow:{Golden:{text:'Yellow roots.',rank:6}}},
   'CYLINDRICAL varieties':{Cylindra:{text:'Long roots.',rank:8}},
  };
  const before=JSON.stringify(source);
  for(const system of ['metric','imperial'] as const){
   const entries=flattenVarieties(source,system);
   expect(entries.map(e=>e.name)).toEqual(['Boltardy','Golden','Cylindra']);
   expect(entries[0]).toMatchObject({type:'Globe · Red',rank:9,short_text:system==='metric'?'5 cm roots.':'2 in. roots.'});
  }
  expect(JSON.stringify(source)).toBe(before);
 });
 it('uses the reviewed description and rank of a metadata-style cultivar',()=>{
  const entries=flattenVarieties({Solent:{type:{text:'Softneck',rank:5},character:{text:'Full advice.',short_text:'Short advice.',rank:9},harvest:{text:'Summer',rank:8}}},'metric');
  expect(entries).toEqual([{name:'Solent',type:'Softneck',text:'Full advice.',short_text:'Short advice.',rank:9}]);
 });
 it('prints a cultivar once across seasonal groups while preserving distinct named strains',()=>{
  const v=structuredClone(vegetables.cabbage) as unknown as Vegetable;
  v.varieties={Spring:{Greyhound:{text:'Spring advice.',rank:8}},Summer:{Greyhound:{text:'Summer advice.',rank:9},'Another strain':{text:'Distinct advice.',rank:7}}};
  delete v.ai_print_layout;
  const result=vegetableModel(v,'cabbage','metric').topVarieties;
  expect(result.map(e=>e.name)).toEqual(['Greyhound','Another strain']);
  expect(result[0].text).toBe('Summer advice.');
  expect(v.varieties.Spring).toHaveProperty('Greyhound');
 });
 it('includes the previously hidden globe beetroot records',()=>{
  const entries=flattenVarieties(vegetables.beetroot.varieties,'metric');
  expect(entries.map(e=>e.name)).toEqual(expect.arrayContaining(['BOLTARDY','CHIOGGIA','ALBINA VEREDUNA','CYLINDRA']));
 });
});
