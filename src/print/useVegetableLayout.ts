import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
) {
    const sentenceCap = Math.min(totalSentences, LAYOUT_LIMITS.introSentences);
    const [phase, setPhase] = useState<LayoutPhase>("intro");
    const [introSentences, setIntroSentences] = useState(2);
    const [introRefinements, setIntroRefinements] = useState(0);
    const [extraSentences, setExtraSentences] = useState(0);
    const [varCount, setVarCount] = useState(4);
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

    useLayoutEffect(() => {
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
    }, [p2TrimLevel]);

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
        if (gap > LAYOUT_LIMITS.introGap && introSentences < sentenceCap) {
            setIntroSentences((previous) => previous + 1);
        } else {
            previousPageGap.current = null;
            setPhase("page");
        }
    }, [phase, introSentences, sentenceCap, staggeredHero, assetsReady]);

    useLayoutEffect(() => {
        if (phase !== "page") return;
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
            introRefinements < LAYOUT_LIMITS.introRefinements &&
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
        };
    }, []);

    useLayoutEffect(() => {
        if (phase !== "top-up" || !assetsReady) return;
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

    useLayoutEffect(() => {
        document.body.dataset.printReady = String(
            phase === "done" && page2Ready && assetsReady,
        );
    }, [phase, page2Ready, assetsReady]);

    return {
        introSentenceCount: introSentences + extraSentences,
        varCount,
        imgMaxHeight,
        p2TrimLevel,
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
