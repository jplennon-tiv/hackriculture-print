// Canonical helpers for the app's ISO-8601 truncated month tokens:
//   "--MM"        a single month   (e.g. "--03" = March)
//   "--MM/--MM"   an inclusive range
// Month indices are 0-based (0 = January … 11 = December), matching JS Date.

export const MONTH_INITIALS = [
    "J",
    "F",
    "M",
    "A",
    "M",
    "J",
    "J",
    "A",
    "S",
    "O",
    "N",
    "D",
];

export const MONTH_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

export const MONTH_FULL = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const SINGLE = /^--(\d{2})$/;
const RANGE = /^--(\d{2})\/--(\d{2})$/;

/** 0-based index (0–11) of a single "--MM" token, or null if malformed. */
export function monthTokenIndex(token: string): number | null {
    const m = token.trim().match(SINGLE);
    if (!m) return null;
    const n = parseInt(m[1], 10) - 1;
    return n >= 0 && n <= 11 ? n : null;
}

/**
 * Every 0-based month index explicitly named across `entries` — endpoints only,
 * so a range contributes its two ends, not the months in between. Order preserved.
 */
export function monthNumbers(entries: string[] | undefined): number[] {
    const out: number[] = [];
    for (const entry of entries ?? []) {
        for (const part of entry.split("/")) {
            const m = part.match(/--(\d{2})/);
            if (!m) continue;
            const n = parseInt(m[1], 10) - 1;
            if (n >= 0 && n <= 11) out.push(n);
        }
    }
    return out;
}

/**
 * Expand tokens to a Set of 0-based month indices. Single tokens add one month;
 * range tokens add the inclusive span. A descending range (from > to) adds
 * nothing when `wrap` is false (default); when true it wraps across the year end
 * (e.g. "--10/--03" → Oct, Nov, Dec, Jan, Feb, Mar).
 */
export function expandMonths(
    entries: string[] | undefined,
    opts: { wrap?: boolean } = {},
): Set<number> {
    const { wrap = false } = opts;
    const set = new Set<number>();
    for (const entry of entries ?? []) {
        const token = entry.trim();
        const range = token.match(RANGE);
        if (range) {
            const a = parseInt(range[1], 10) - 1;
            const b = parseInt(range[2], 10) - 1;
            if (a < 0 || a > 11 || b < 0 || b > 11) continue;
            if (a <= b) {
                for (let i = a; i <= b; i++) set.add(i);
            } else if (wrap) {
                for (let i = a; i <= 11; i++) set.add(i);
                for (let i = 0; i <= b; i++) set.add(i);
            }
            continue;
        }
        const single = monthTokenIndex(token);
        if (single != null) set.add(single);
    }
    return set;
}

/** A single "--MM" token → full month name; returns the input unchanged if it isn't a token. */
export function isoMonthToName(iso: string): string {
    const n = monthTokenIndex(iso);
    return n == null ? iso : MONTH_FULL[n];
}

/**
 * Short-name range ("Mar – May") between the earliest and latest month named in
 * `entries`. Returns a single short name when only one month is named, or
 * `empty` (default "") when none are. When a descending (wrap-around) range is
 * present, the span is computed as the complement of the largest off-season gap
 * so a winter crop reads "Oct – Mar" rather than an inverted "Mar – Oct".
 */
export function formatMonthRange(
    entries: string[] | undefined,
    opts: { empty?: string } = {},
): string {
    const { empty = "" } = opts;
    const nums = monthNumbers(entries);
    if (!nums.length) return empty;

    const hasWrap = (entries ?? []).some((e) => {
        const m = e.trim().match(RANGE);
        return m && parseInt(m[1], 10) > parseInt(m[2], 10);
    });

    if (hasWrap) {
        const covered = expandMonths(entries, { wrap: true });
        if (covered.size >= 12) return `${MONTH_SHORT[0]} – ${MONTH_SHORT[11]}`;
        // Largest contiguous run of uncovered months (circular) is the off-season;
        // the season is its complement.
        let bestStart = -1;
        let bestLen = 0;
        for (let s = 0; s < 12; s++) {
            if (covered.has(s) || !covered.has((s + 11) % 12)) continue;
            let len = 0;
            let i = s;
            while (!covered.has(i) && len < 12) {
                len++;
                i = (i + 1) % 12;
            }
            if (len > bestLen) {
                bestLen = len;
                bestStart = s;
            }
        }
        const seasonStart = (bestStart + bestLen) % 12;
        const seasonEnd = (bestStart + 11) % 12;
        return seasonStart === seasonEnd
            ? MONTH_SHORT[seasonStart]
            : `${MONTH_SHORT[seasonStart]} – ${MONTH_SHORT[seasonEnd]}`;
    }

    const min = Math.min(...nums);
    const max = Math.max(...nums);
    return min === max
        ? MONTH_SHORT[min]
        : `${MONTH_SHORT[min]} – ${MONTH_SHORT[max]}`;
}
