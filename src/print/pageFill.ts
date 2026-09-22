/** Share a modest, measured remainder only after editorial content is chosen.
 * Larger holes require more content, not disproportionately stretched rows. */
export function pageFillGrowth(budget:number, content:number, enabled:boolean):number {
    const spare=budget-content;
    return enabled&&Number.isFinite(spare)&&spare>0&&spare<=96 ? spare : 0;
}
