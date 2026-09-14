import type { RankedText } from "../types";

/** Extract display text from a `RankedText` object, plain string, or unknown. */
export function rt(v: unknown): string {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object" && "text" in (v as object))
        return (v as { text: string }).text;
    return "";
}

/** True when a `RankedText` item has `star: true`. */
export function isStar(v: unknown): boolean {
    return (
        typeof v === "object" &&
        v !== null &&
        "star" in v &&
        (v as { star?: boolean }).star === true
    );
}

/** Numeric rank of a possibly-ranked item; `fallback` when unranked. */
export function getRank(v: unknown, fallback = 0): number {
    if (typeof v === "object" && v !== null && "rank" in v) {
        const r = (v as { rank?: number }).rank;
        return typeof r === "number" ? r : fallback;
    }
    return fallback;
}

/** True when the input is a `{text, rank}` leaf and not a plain string / group. */
export function isRankedText(v: unknown): v is RankedText {
    return (
        typeof v === "object" &&
        v !== null &&
        "text" in v &&
        "rank" in v &&
        typeof (v as RankedText).text === "string" &&
        typeof (v as RankedText).rank === "number"
    );
}
