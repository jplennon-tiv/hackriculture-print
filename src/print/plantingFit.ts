export interface PlantingFitState {
    phase: 'initial' | 'notes' | 'image' | 'done' | 'error';
    noteCount: number;
    imageMm: number;
    showImages: boolean;
}
export interface PlantingFitOptions { minImageMm:number; maxImageMm:number; optionalNoteCount:number; review?:boolean }
/** Dense legacy sheets may already exceed 958px. Reuse only their measured
 * height, never beyond the existing 965px page target or a larger new footprint. */
export function plantingPageBudget(baselineHeight: number): number {
    return Number.isFinite(baselineHeight) ? Math.max(958,Math.min(965,baselineHeight)) : 958;
}
/** Never changes other cards, truncates text or shrinks type. Every phase is bounded. */
export function nextPlantingFit(state: PlantingFitState, gap: number, options: PlantingFitOptions): PlantingFitState {
    if (state.phase === 'done' || state.phase === 'error') return state;
    // Explicit draft-only mode: retain illustrations and all frozen baseline text.
    // Source/image readiness is still enforced by the caller; production is unchanged.
    if (options.review) return {...state,phase:'done',noteCount:0,imageMm:options.minImageMm};
    if (state.phase === 'initial') {
        if (gap < 0) {
            if (state.showImages && state.imageMm > options.minImageMm) return {...state,imageMm:Math.max(options.minImageMm,state.imageMm-2)};
            if (state.showImages) return {...state,showImages:false};
            return {...state,phase:'error'};
        }
        return {...state,phase:'notes'};
    }
    if (state.phase === 'notes') {
        if (gap < 0) return {...state,noteCount:Math.max(0,state.noteCount-1),phase:'image'};
        if (state.noteCount < options.optionalNoteCount) return {...state,noteCount:state.noteCount+1};
        return {...state,phase:'image'};
    }
    if (gap < 0) return {...state,imageMm:Math.max(options.minImageMm,state.imageMm-1),phase:'done'};
    if (state.showImages && state.imageMm < options.maxImageMm) return {...state,imageMm:state.imageMm+1};
    return {...state,phase:'done'};
}
