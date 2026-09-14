import type {
    MeasuredValue,
    YieldGroup,
    YieldBasis,
    TimeToHarvestGroup,
} from "../types";
import { formatDuration } from "./duration";
import { convertMeasurement, type UnitSystem } from "./measure";

const YIELD_ORDER: readonly YieldBasis[] = [
    "per_plant",
    "per_mature_plant",
    "per_10_ft_row",
    "per_10_ft_double_row",
];

/** Units-aware label for each yield basis (10 ft ≈ 3 m). */
const YIELD_BASIS_LABEL: Record<YieldBasis, Record<UnitSystem, string>> = {
    per_plant: { imperial: "Yield per plant", metric: "Yield per plant" },
    per_mature_plant: {
        imperial: "Yield per mature plant",
        metric: "Yield per mature plant",
    },
    per_10_ft_row: {
        imperial: "Yield (10 ft row)",
        metric: "Yield (3 m row)",
    },
    per_10_ft_double_row: {
        imperial: "Yield (10 ft double row)",
        metric: "Yield (3 m double row)",
    },
};

function firstText(v: MeasuredValue | null | undefined): string | null {
    return v && v.text ? v.text : null;
}

/** Structured duration display when possible, else the preserved prose. */
function durationOrText(v: MeasuredValue | null | undefined): string | null {
    return formatDuration(v) ?? firstText(v);
}

/**
 * Representative yield: the first non-empty basis in `default` (priority order),
 * else the first non-empty basis across `by_variety` overrides.
 */
function pickYield(
    y: YieldGroup | null | undefined,
): { basis: YieldBasis; raw: string } | null {
    if (!y) return null;
    for (const b of YIELD_ORDER) {
        const t = firstText(y.default?.[b]);
        if (t) return { basis: b, raw: t };
    }
    for (const overrides of Object.values(y.by_variety ?? {})) {
        for (const b of YIELD_ORDER) {
            const t = firstText(overrides?.[b]);
            if (t) return { basis: b, raw: t };
        }
    }
    return null;
}

/**
 * Representative yield string, preferring `default` bases then variety splits.
 * Weights (lb) convert to the requested `system`; counts pass through unchanged.
 */
export function yieldSummary(
    y: YieldGroup | null | undefined,
    system: UnitSystem = "imperial",
): string | null {
    const picked = pickYield(y);
    if (!picked) return null;
    return system === "metric"
        ? (convertMeasurement(picked.raw, "metric") ?? picked.raw)
        : picked.raw;
}

export interface YieldFact {
    label: string;
    value: string;
}

/**
 * Like `yieldSummary`, but also returns a units-aware label reflecting the
 * basis used (per plant / per 10 ft row / per 3 m row, etc.).
 */
export function yieldFact(
    y: YieldGroup | null | undefined,
    system: UnitSystem = "imperial",
): YieldFact | null {
    const picked = pickYield(y);
    if (!picked) return null;
    const value =
        system === "metric"
            ? (convertMeasurement(picked.raw, "metric") ?? picked.raw)
            : picked.raw;
    return { label: YIELD_BASIS_LABEL[picked.basis][system], value };
}

/** Representative time-to-harvest string: summary → default → variety splits. */
export function timeToHarvestSummary(
    t: TimeToHarvestGroup | null | undefined,
): string | null {
    if (!t) return null;
    if (t.ready_in_short) return t.ready_in_short;
    const t1 =
        durationOrText(t.default?.from_sowing) ??
        durationOrText(t.default?.from_planting);
    if (t1) return t1;
    for (const overrides of Object.values(t.by_variety ?? {})) {
        for (const mv of Object.values(overrides ?? {})) {
            const tt = durationOrText(mv);
            if (tt) return tt;
        }
    }
    return null;
}

/**
 * Compact display for a `seed_and_growing_facts` duration fact (e.g.
 * `expected_germination_time`): prefer the structured `<key>_value` companion
 * (rendered via `formatDuration`), else the preserved prose string.
 */
export function durationFactSummary(
    facts: Record<string, unknown>,
    key: string,
): string | null {
    const companion = facts[`${key}_value`];
    if (companion && typeof companion === "object") {
        const f = formatDuration(companion as MeasuredValue);
        if (f) return f;
    }
    const prose = facts[key];
    return typeof prose === "string" && prose.trim() ? prose : null;
}
