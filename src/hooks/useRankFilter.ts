import { useLocation } from "react-router-dom";
import { getRank } from "../lib/ranked";

export type RankFilter = (rank: number) => boolean;

/**
 * Parses the ?rank= query parameter and returns a predicate function.
 * No rank param → predicate always returns true.
 *
 * Supported formats:
 *   ?rank=5    → only items with rank === 5
 *   ?rank=gt5  → items with rank > 5  (more important)
 *   ?rank=lt5  → items with rank < 5  (less important)
 *   (none)     → all items
 */
export function useRankFilter(): RankFilter {
    const { search } = useLocation();
    const raw = new URLSearchParams(search).get("rank");
    if (!raw) return () => true;
    if (raw.startsWith("gt")) {
        const val = parseInt(raw.slice(2), 10);
        return (r) => r > val;
    }
    if (raw.startsWith("lt")) {
        const val = parseInt(raw.slice(2), 10);
        return (r) => r < val;
    }
    const val = parseInt(raw, 10);
    return (r) => r === val;
}

/**
 * Returns true when an item should be shown.
 * - Objects with a `rank` field are tested against the filter.
 * - Everything else (plain strings, nulls) always passes.
 */
export function passesRank(item: unknown, filter: RankFilter): boolean {
    if (item == null) return false;
    if (typeof item === "object" && "rank" in (item as object)) {
        return filter((item as { rank: number }).rank);
    }
    return true; // unranked item → always show
}

/**
 * Returns the rank query string (e.g. "?rank=gt7") if a rank param is present
 * in the current URL, otherwise returns "". Use this to preserve the rank
 * filter when building internal navigation links.
 */
export function useRankSearch(): string {
    const { search } = useLocation();
    const rank = new URLSearchParams(search).get("rank");
    return rank ? `?rank=${rank}` : "";
}

/**
 * Filter an array, keeping items that pass the rank predicate.
 * Items without a rank property always pass.
 */
export function filterRanked<T>(
    items: T[] | null | undefined,
    filter: RankFilter,
): T[] {
    if (!items) return [];
    return items.filter((item) => passesRank(item, filter));
}

/**
 * Sort an array of potentially-ranked items by rank descending (highest first).
 * Items without a rank property sort to the bottom (treated as rank 0).
 * Uses a stable sort so equal-rank items preserve their original JSON order.
 */
export function sortRanked<T>(items: T[]): T[] {
    // slice() to avoid mutating the input array
    return items.slice().sort((a, b) => getRank(b) - getRank(a));
}
