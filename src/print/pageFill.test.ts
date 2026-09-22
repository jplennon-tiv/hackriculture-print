import{describe,it,expect}from'vitest';
import{pageFillGrowth}from'./pageFill';
describe('reviewed page remainder',()=>{
 it('preserves existing layouts unless deliberately enabled',()=>{
  expect(pageFillGrowth(958,900,false)).toBe(0);
  expect(pageFillGrowth(958,900,true)).toBe(58);
 });
 it('never shrinks overflow or conceals an editorial content shortage',()=>{
  expect(pageFillGrowth(958,980,true)).toBe(0);
  expect(pageFillGrowth(958,750,true)).toBe(0);
  expect(pageFillGrowth(958,NaN,true)).toBe(0);
 });
});
