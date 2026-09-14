import dayjs from "dayjs";
import durationPlugin from "dayjs/plugin/duration";

dayjs.extend(durationPlugin);

export type DurationUnit = "days" | "weeks" | "months" | "years";

/** Minimal shape shared by `DurationValue` and `MeasuredValue`. */
export interface DurationParts {
    min: number | null;
    max?: number | null;
    unit: string | null;
}

const ISO_DESIGNATOR: Record<DurationUnit, string> = {
    days: "D",
    weeks: "W",
    months: "M",
    years: "Y",
};

export function isDurationUnit(u: unknown): u is DurationUnit {
    return u === "days" || u === "weeks" || u === "months" || u === "years";
}

/** Singular/plural unit label: 1 → "week", 2 → "weeks". */
function unitLabel(n: number, unit: DurationUnit): string {
    return n === 1 ? unit.slice(0, -1) : unit;
}

/**
 * Exact, range-aware human display for a structured duration — "2 weeks",
 * "2–4 weeks", "1 year". Returns null when there's no usable numeric value or
 * the unit isn't a duration (e.g. a yield's "lb"), so callers can fall back to
 * the original prose. dayjs's `humanize` is intentionally avoided: it rounds and
 * has no "weeks" unit, so it would render "2 weeks" as "14 days".
 */
export function formatDuration(
    v: DurationParts | null | undefined,
): string | null {
    if (!v || typeof v.min !== "number" || !isDurationUnit(v.unit)) return null;
    const { min, unit } = v;
    const max = v.max;
    if (typeof max === "number" && max !== min) {
        return `${min}–${max} ${unitLabel(max, unit)}`;
    }
    return `${min} ${unitLabel(min, unit)}`;
}

/**
 * ISO-8601 duration string that preserves the unit (weeks → "P2W"). Built
 * directly because dayjs's own `toISOString()` normalises weeks to days ("P14D").
 */
export function toISODuration(n: number, unit: DurationUnit): string {
    return `P${n}${ISO_DESIGNATOR[unit]}`;
}

/** Approximate day-count (months ≈ 30.44d, years ≈ 365.25d) for sorting/compare. */
export function durationToDays(n: number, unit: DurationUnit): number {
    return dayjs.duration(n, unit).asDays();
}
