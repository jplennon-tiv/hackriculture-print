export interface PlantingFitState {
    phase: 'initial' | 'notes' | 'image' | 'done' | 'error';
    noteCount: number;
    imageMm: number;
    showImages: boolean;
}
export interface PlantingFitOptions { minImageMm:number; maxImageMm:number; optionalNoteCount:number }
/** Never changes other cards, truncates text or shrinks type. Every phase is bounded. */
export function nextPlantingFit(state: PlantingFitState, gap: number, options: PlantingFitOptions): PlantingFitState {
    if (state.phase === 'done' || state.phase === 'error') return state;
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
