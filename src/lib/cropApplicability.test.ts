import {it,expect} from 'vitest';
import {appliesToVegetable} from './cropApplicability';
it('does not leak parsnip-only conditions into carrot sheets',()=>{
 expect(appliesToVegetable({applies_to:['parsnip']},'carrot')).toBe(false);
 expect(appliesToVegetable({applies_to:['parsnip']},'parsnip')).toBe(true);
 expect(appliesToVegetable({},'carrot')).toBe(true);
 expect(appliesToVegetable({applies_to:[]},'carrot')).toBe(true);
 expect(appliesToVegetable({applies_to:['carrot','parsnip']},'carrot')).toBe(true);
});
