import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { nextPlantingFit, plantingPageBudget, type PlantingFitState } from './plantingFit';
import {pageFillGrowth} from './pageFill';
import {
    introContentBudget,
    introFitAction,
    LAYOUT_LIMITS,
    nextPage2Trim,
    pageFitAction,
} from "./vegetableLayout";

type LayoutPhase = "intro" | "page" | "top-up" | "done";

function contentHeight(page: HTMLElement, sentinel: HTMLElement): number {
    return (
        sentinel.getBoundingClientRect().bottom -
        page.getBoundingClientRect().top
    );
}

export function useVegetableLayout(
    totalSentences: number,
    maxVarieties: number,
    staggeredHero = false,
    planting?: {imageMm:number;minImageMm:number;maxImageMm:number;optionalNoteCount:number;issue:string|null;review?:boolean} | null,
    editorialWarnings:string[]=[],
    savedIntroSentences?:number,
    savedVarieties?:number,
    fillBottoms=false,
) {
    const sentenceCap = Math.min(totalSentences, LAYOUT_LIMITS.introSentences);
    const [phase, setPhase] = useState<LayoutPhase>("intro");
    const [introSentences, setIntroSentences] = useState(Math.min(savedIntroSentences??2,sentenceCap));
    const [introRefinements, setIntroRefinements] = useState(0);
    const [extraSentences, setExtraSentences] = useState(0);
    const [varCount, setVarCount] = useState(Math.min(savedVarieties??4,maxVarieties));
    const [imgMaxHeight, setImgMaxHeight] = useState(400);
    const [p2TrimLevel, setP2TrimLevel] = useState(0);
    const [page2Ready, setPage2Ready] = useState(false);
    const [assetsReady, setAssetsReady] = useState(false);
    const page1Ref = useRef<HTMLDivElement>(null);
    const page1SentinelRef = useRef<HTMLDivElement>(null);
    const page2Ref = useRef<HTMLDivElement>(null);
    const page2SentinelRef = useRef<HTMLDivElement>(null);
    const introWrapperRef = useRef<HTMLDivElement>(null);
    const introSentinelRef = useRef<HTMLDivElement>(null);
    const heroImgRef = useRef<HTMLImageElement>(null);
    const introParaRef = useRef<HTMLParagraphElement>(null);
    const previousPageGap = useRef<number | null>(null);
    const previousIntroGap = useRef<number | null>(null);
    const previousPage2Gap = useRef<number | null>(null);
    const [plantingActive,setPlantingActive]=useState(false);
    const plantingBudget=useRef(958);
    const [plantingImagesReady,setPlantingImagesReady]=useState(false);
    const [plantingImagesFailed,setPlantingImagesFailed]=useState(false);
    const [plantingFit,setPlantingFit]=useState<PlantingFitState>({phase:'initial',noteCount:0,imageMm:planting?.imageMm??18,showImages:true});
    const onPlantingAssets=useCallback((failed:boolean)=>{
        setPlantingImagesFailed(failed);setPlantingImagesReady(true);
    },[]);

    useLayoutEffect(() => {
        // First fit the existing text-only sheet. Once locked, pictures never trim neighbours.
        if (plantingActive) return;
        const page = page2Ref.current;
        const sentinel = page2SentinelRef.current;
        if (!page || !sentinel) {
            setPage2Ready(true);
            return;
        }
        const gap = LAYOUT_LIMITS.pageHeight - contentHeight(page, sentinel);
        const nextTrim = nextPage2Trim(
            gap,
            previousPage2Gap.current,
            p2TrimLevel,
        );
        previousPage2Gap.current = gap;
        if (nextTrim !== p2TrimLevel) {
            setP2TrimLevel((previous) => previous + nextTrim - p2TrimLevel);
        } else {
            setPage2Ready(true);
        }
    }, [p2TrimLevel,plantingActive]);

    useLayoutEffect(() => {
        if (phase !== "intro" || (staggeredHero && !assetsReady)) return;
        const paragraph = introParaRef.current;
        const target = staggeredHero
            ? introWrapperRef.current
            : (heroImgRef.current ?? introWrapperRef.current);
        const gap = paragraph
            ? (target?.getBoundingClientRect().bottom ?? 0) -
              paragraph.getBoundingClientRect().bottom
            : 0;
        if (savedIntroSentences===undefined && gap > LAYOUT_LIMITS.introGap && introSentences < sentenceCap) {
            setIntroSentences((previous) => previous + 1);
        } else {
            previousPageGap.current = null;
            setPhase("page");
        }
    }, [phase, introSentences, sentenceCap, staggeredHero, assetsReady]);

    useLayoutEffect(() => {
        if (phase !== "page") return;
        // A reviewed count is a content decision, not a starting guess. Keep it
        // reproducible; the final overflow check still reports an invalid plan.
        if(savedVarieties!==undefined){setPhase('top-up');return;}
        const page = page1Ref.current;
        const sentinel = page1SentinelRef.current;
        if (!page || !sentinel) {
            setPhase("top-up");
            return;
        }
        const style = getComputedStyle(page);
        const budget = staggeredHero
            ? introContentBudget(
                  parseFloat(style.minHeight),
                  parseFloat(style.paddingBottom),
                  parseFloat(style.borderBottomWidth),
              )
            : LAYOUT_LIMITS.pageHeight;
        const gap = budget - contentHeight(page, sentinel);
        const action = pageFitAction({
            gap,
            previousGap: previousPageGap.current,
            varieties: varCount,
            maxVarieties,
            imageHeight: imgMaxHeight,
        });
        previousPageGap.current = gap;
        switch (action) {
            case "trim-variety":
                setVarCount((previous) => previous - 1);
                return;
            case "grow-variety":
                setVarCount((previous) => previous + 1);
                return;
            case "shrink-image":
                setImgMaxHeight((previous) =>
                    Math.max(
                        LAYOUT_LIMITS.imageMin,
                        previous - LAYOUT_LIMITS.imageStep,
                    ),
                );
                return;
            case "grow-image":
                setImgMaxHeight((previous) =>
                    Math.min(
                        LAYOUT_LIMITS.imageMax,
                        previous + LAYOUT_LIMITS.imageStep,
                    ),
                );
                return;
        }
        const wrapper = introWrapperRef.current;
        const introEnd = introSentinelRef.current;
        if (
            savedIntroSentences===undefined && introRefinements < LAYOUT_LIMITS.introRefinements &&
            introSentences < sentenceCap &&
            wrapper &&
            introEnd &&
            wrapper.getBoundingClientRect().bottom -
                introEnd.getBoundingClientRect().top >
                LAYOUT_LIMITS.introGap
        ) {
            setIntroRefinements((previous) => previous + 1);
            setIntroSentences((previous) => previous + 1);
            setPhase("intro");
        } else {
            setPhase("top-up");
        }
    }, [
        phase,
        varCount,
        imgMaxHeight,
        maxVarieties,
        staggeredHero,
        introRefinements,
        introSentences,
        sentenceCap,
    ]);

    useEffect(() => {
        let cancelled = false;
        document.body.dataset.printReady = "false";
        Promise.all([
            document.fonts.ready,
            ...Array.from(document.images, (image) =>
                image.decode().catch(() => undefined),
            ),
        ]).then(() => {
            if (!cancelled) setAssetsReady(true);
        });
        return () => {
            cancelled = true;
            document.body.dataset.printReady = "false";
            delete document.body.dataset.printError;
            delete document.body.dataset.printWarnings;
            delete document.body.dataset.plantingLayout;
            delete document.body.dataset.plantingReview;
        };
    }, []);

    useLayoutEffect(() => {
        if (phase !== "top-up" || !assetsReady) return;
        if(savedIntroSentences!==undefined){setPhase('done');return;}
        const page = page1Ref.current;
        const sentinel = page1SentinelRef.current;
        if (!page || !sentinel) {
            setPhase("done");
            return;
        }
        const style = getComputedStyle(page);
        const budget = introContentBudget(
            parseFloat(style.minHeight),
            parseFloat(style.paddingBottom),
            parseFloat(style.borderBottomWidth),
        );
        const gap = budget - contentHeight(page, sentinel);
        const action = introFitAction({
            gap,
            previousGap: previousIntroGap.current,
            extraSentences,
            totalSentences: introSentences + extraSentences,
            sentenceCap,
        });
        previousIntroGap.current = gap;
        if (action === "grow") setExtraSentences((previous) => previous + 1);
        else if (action === "trim")
            setExtraSentences((previous) => previous - 1);
        else setPhase("done");
    }, [phase, assetsReady, extraSentences, introSentences, sentenceCap]);

    useLayoutEffect(()=>{
        if(planting&&!planting.issue&&phase==='done'&&page2Ready&&assetsReady&&!plantingActive) {
            const page=page2Ref.current,sentinel=page2SentinelRef.current;
            if(page&&sentinel)plantingBudget.current=plantingPageBudget(contentHeight(page,sentinel));
            setPlantingActive(true);
        }
    },[planting,phase,page2Ready,assetsReady,plantingActive]);

    useLayoutEffect(()=>{
        if(!planting||!plantingActive||!plantingImagesReady)return;
        if(plantingImagesFailed&&plantingFit.showImages){setPlantingFit(s=>({...s,showImages:false}));return;}
        const page=page2Ref.current,sentinel=page2SentinelRef.current;
        if(!page||!sentinel)return;
        const gap=plantingBudget.current-contentHeight(page,sentinel);
        const next=nextPlantingFit(plantingFit,gap,planting);
        if(next!==plantingFit)setPlantingFit(next);
    },[planting,plantingActive,plantingImagesReady,plantingImagesFailed,plantingFit]);

    useLayoutEffect(() => {
        document.body.dataset.printError=planting?.issue??'';
        // Saved opt-in, after natural fitting and asset readiness. Reset before
        // measuring so rerenders/StrictMode cannot accumulate artificial height.
        const ready=phase==='done'&&assetsReady&&page2Ready&&(!planting||!!planting.issue||(plantingActive&&plantingImagesReady&&['done','error'].includes(plantingFit.phase)));
        for(const [page,sentinel,budget] of [[page1Ref.current,page1SentinelRef.current,958],[page2Ref.current,page2SentinelRef.current,958]] as const){
            const body=page?.querySelector<HTMLElement>('[data-align-bottoms]');
            if(!page||!sentinel||!body)continue;
            body.style.removeProperty('min-height');
            const growth=pageFillGrowth(budget,contentHeight(page,sentinel),fillBottoms&&ready);
            if(growth>0)body.style.minHeight=`${body.getBoundingClientRect().height+growth}px`;
        }
        const warnings:string[]=[...editorialWarnings];
        for(const [label,page,sentinel,budget] of [
            ['Page 1',page1Ref.current,page1SentinelRef.current,965],
            ['Page 2',page2Ref.current,page2SentinelRef.current,plantingBudget.current],
        ] as const){
            if(page&&sentinel){
                const excess=contentHeight(page,sentinel)-budget;
                if(excess>1)warnings.push(`${label}: content exceeds the layout budget by approximately ${Math.ceil(excess*25.4/96)} mm; check the exported PDF for spillover.`);
            }
        }
        document.body.dataset.printWarnings=JSON.stringify(warnings);
        document.body.dataset.plantingLayout=planting?`${plantingActive?plantingFit.phase:'baseline'}:${plantingFit.noteCount}:${plantingFit.imageMm}:${plantingFit.showImages?'images':'text'}`:'legacy';
        document.body.dataset.plantingReview=String(!!planting?.review);
        document.body.dataset.printReady = String(
            phase === "done" && page2Ready && assetsReady && (!planting||!!planting.issue||(plantingActive&&plantingImagesReady&&['done','error'].includes(plantingFit.phase))),
        );
    }, [phase,page2Ready,assetsReady,planting,plantingActive,plantingImagesReady,plantingFit,fillBottoms]);

    return {
        alignmentReady:phase==='done',
        introSentenceCount: introSentences + extraSentences,
        varCount,
        imgMaxHeight,
        p2TrimLevel,
        plantingActive,plantingFit,onPlantingAssets,
        page1Ref,
        page1SentinelRef,
        page2Ref,
        page2SentinelRef,
        introWrapperRef,
        introSentinelRef,
        heroImgRef,
        introParaRef,
    };
}
