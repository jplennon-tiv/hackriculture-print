/** Missing/empty scope means every member of the already-selected trouble group. */
export function appliesToVegetable(condition:{applies_to?:string[]},key:string){
 return !condition.applies_to?.length||condition.applies_to.includes(key);
}
