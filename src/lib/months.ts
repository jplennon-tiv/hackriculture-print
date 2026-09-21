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

/** Exact contiguous windows, including winter wraps, without filling seasonal gaps. */
export function formatMonthRange(entries: string[] | undefined, opts: {empty?:string} = {}): string {
    const covered=expandMonths(entries,{wrap:true});
    if (!covered.size) return opts.empty ?? '';
    if (covered.size===12) return 'Jan – Dec';
    const starts=Array.from({length:12},(_,i)=>i).filter(i=>covered.has(i)&&!covered.has((i+11)%12));
    return starts.map(start=>{
        let end=start;
        while(covered.has((end+1)%12)) end=(end+1)%12;
        return start===end ? MONTH_SHORT[start] : `${MONTH_SHORT[start]} – ${MONTH_SHORT[end]}`;
    }).join('; ');
}
