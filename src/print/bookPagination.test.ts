import {describe,it,expect} from 'vitest';
import book from './bookPagination.json';
import vegetables from '../../../hackriculture-data/generated/master/vegetables.json';
import troubles from '../../../hackriculture-data/generated/master/troubles.json';
import {makeBookEdition,applyBookNumbers,requireCurrentPagination} from './bookPagination';
describe('continuous collection numbering',()=>{
 it('covers all current guides without gaps or duplicates in both editions',async()=>{
  await requireCurrentPagination(book.sourceSignature,vegetables,troubles);
  for(const edition of Object.values(book.editions)){
   expect(edition.vegetables.map(v=>v.key).sort()).toEqual(Object.keys(vegetables).sort());
   expect(edition.troubles.map(v=>v.key).sort()).toEqual(Object.keys(troubles).sort());
   expect(edition.vegetables[0].start).toBe(1);expect(edition.troubles[0].start).toBe(89);
   let next=1;for(const e of [...edition.vegetables,...edition.troubles]){expect(e.start).toBe(next);next+=e.pages;}
   expect(next-1).toBe(edition.totalPages);
  }
 });
 it('continues immediately after odd-length Troubles guides',()=>{
  const e=makeBookEdition([{key:'v',label:'Veg'}],[{key:'a',label:'A'},{key:'b',label:'B'}],{a:3,b:1});
  expect(e.troubles.map(r=>r.start)).toEqual([3,6]);expect(e.totalPages).toBe(6);
 });
 it('numbers actual page markers and rejects a changed count',()=>{
  const marks=[{textContent:''},{textContent:''}];
  const root={querySelectorAll:()=>marks} as unknown as HTMLElement;
  applyBookNumbers(root,{key:'x',label:'X',start:87,pages:2});expect(marks.map(m=>m.textContent)).toEqual(['87','88']);
  expect(()=>applyBookNumbers(root,{key:'x',label:'X',start:87,pages:3})).toThrow('contents expects 3');
 });
 it('rejects stale source data before using downstream references',async()=>{
  await expect(requireCurrentPagination(book.sourceSignature,vegetables,{...troubles,changed:{}})).rejects.toThrow('pagination is stale');
 });
});
