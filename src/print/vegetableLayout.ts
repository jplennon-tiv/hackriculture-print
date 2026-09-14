export const LAYOUT_LIMITS = {
    pageHeight: 965,
    page1Tolerance: 8,
    page2Tolerance: 15,
    introGap: 10,
    introSentences: 12,
    introRefinements: 2,
    varietyFloor: 3,
    imageMin: 220,
    imageMax: 480,
    imageStep: 12,
    page2TrimMax: 6,
    pdfSafety: 16,
} as const;

export type PageFitAction =
    | "trim-variety"
    | "grow-variety"
    | "shrink-image"
    | "grow-image"
    | "done";

export function pageFitAction({
    gap,
    previousGap,
    varieties,
    maxVarieties,
    imageHeight,
}: {
    gap: number;
    previousGap: number | null;
    varieties: number;
    maxVarieties: number;
    imageHeight: number;
}): PageFitAction {
    if (gap < -LAYOUT_LIMITS.page1Tolerance) {
        if (varieties > LAYOUT_LIMITS.varietyFloor) return "trim-variety";
        if (imageHeight > LAYOUT_LIMITS.imageMin) return "shrink-image";
        if (varieties > 2) return "trim-variety";
    } else if (gap > LAYOUT_LIMITS.page1Tolerance) {
        if (
            previousGap !== null &&
            previousGap < -LAYOUT_LIMITS.page1Tolerance
        ) {
            return "done";
        }
        if (varieties < maxVarieties) return "grow-variety";
        if (imageHeight < LAYOUT_LIMITS.imageMax) return "grow-image";
    }
    return "done";
}

export function introFitAction({
    gap,
    previousGap,
    extraSentences,
    totalSentences,
    sentenceCap,
}: {
    gap: number;
    previousGap: number | null;
    extraSentences: number;
    totalSentences: number;
    sentenceCap: number;
}): "grow" | "trim" | "done" {
    if (gap < 0 && extraSentences > 0) return "trim";
    if (
        gap > LAYOUT_LIMITS.page1Tolerance &&
        totalSentences < sentenceCap &&
        (previousGap === null || previousGap >= 0)
    ) {
        return "grow";
    }
    return "done";
}

export function nextPage2Trim(
    gap: number,
    previousGap: number | null,
    trim: number,
): number {
    if (
        gap < -LAYOUT_LIMITS.page2Tolerance &&
        trim < LAYOUT_LIMITS.page2TrimMax
    ) {
        return trim + 1;
    }
    if (
        gap > LAYOUT_LIMITS.page2Tolerance &&
        trim > 0 &&
        (previousGap === null || previousGap >= -LAYOUT_LIMITS.page2Tolerance)
    ) {
        return trim - 1;
    }
    return trim;
}

export function introContentBudget(
    minHeight: number,
    paddingBottom: number,
    borderBottom: number,
): number {
    return Math.min(
        LAYOUT_LIMITS.pageHeight,
        Math.floor(
            minHeight - paddingBottom - borderBottom - LAYOUT_LIMITS.pdfSafety,
        ),
    );
}
