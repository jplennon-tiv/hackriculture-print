import {it,expect} from 'vitest';
import {appliesToVegetable} from './cropApplicability';
it('does not leak parsnip-only conditions into carrot sheets',()=>{
 expect(appliesToVegetable({applies_to:['parsnip']},'carrot')).toBe(false);
 expect(appliesToVegetable({applies_to:['parsnip']},'parsnip')).toBe(true);
 expect(appliesToVegetable({},'carrot')).toBe(true);
 expect(appliesToVegetable({applies_to:[]},'carrot')).toBe(true);
 expect(appliesToVegetable({applies_to:['carrot','parsnip']},'carrot')).toBe(true);
});

import {inlineAppliesToVegetable} from './cropApplicability';
it('keeps explicitly scoped broad-bean pod-set advice without admitting unrelated shared advice',()=>{
 const shared=[{applies_to:['bean_french','bean_runner']}];
 expect(inlineAppliesToVegetable({applies_to:['bean_broad']},shared,'bean_broad')).toBe(true);
 expect(inlineAppliesToVegetable({},shared,'bean_broad')).toBe(false);
 expect(inlineAppliesToVegetable({applies_to:['bean_broad']},shared,'pea')).toBe(false);
});
