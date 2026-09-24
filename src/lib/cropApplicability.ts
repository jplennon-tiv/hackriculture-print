/** Missing/empty scope means every member of the already-selected trouble group. */
export function appliesToVegetable(condition:{applies_to?:string[]},key:string){
 return !condition.applies_to?.length||condition.applies_to.includes(key);
}

/** Explicit inline scope can distinguish crop advice sharing a group label. */
export function inlineAppliesToVegetable(inline:{applies_to?:string[]},matches:{applies_to?:string[]}[],key:string){
 return inline.applies_to?.length ? appliesToVegetable(inline,key) : !matches.some(c=>!appliesToVegetable(c,key));
}
