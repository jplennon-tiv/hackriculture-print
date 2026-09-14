// Imperial ⇄ metric conversion for the structured measurement fields.
// Works by replacing each "<number> <unit>" token in a string, so qualifier
// prose ("18 in. in rows") and ranges/grids ("12-14 in.", "90x90 cm") survive.

import type { MeasurementPair } from "../types";

export type { MeasurementPair };
export type UnitSystem = "imperial" | "metric";

type Canon = "in" | "ft" | "cm" | "mm" | "m" | "lb" | "oz" | "kg" | "g";

const METRIC_UNITS = new Set<Canon>(["cm", "mm", "m", "kg", "g"]);
const IMPERIAL_UNITS = new Set<Canon>(["in", "ft", "lb", "oz"]);

/** Matched unit text → canonical unit. */
function canonUnit(raw: string): Canon | null {
    const u = raw.toLowerCase().replace(/\.$/, "");
    if (/^(in|inch|inches)$/.test(u)) return "in";
    if (/^(ft|foot|feet)$/.test(u)) return "ft";
    if (/^(cm|centimet(re|er)s?)$/.test(u)) return "cm";
    if (/^(mm|millimet(re|er)s?)$/.test(u)) return "mm";
    if (/^(m|met(re|er)s?)$/.test(u)) return "m";
    if (/^(lb|lbs|pound|pounds)$/.test(u)) return "lb";
    if (/^(oz|ounce|ounces)$/.test(u)) return "oz";
    if (/^(kg|kilograms?)$/.test(u)) return "kg";
    if (/^(g|grams?)$/.test(u)) return "g";
    return null;
}

const UNIT_DISPLAY: Record<Canon, string> = {
    in: "in.",
    ft: "ft",
    cm: "cm",
    mm: "mm",
    m: "m",
    lb: "lb",
    oz: "oz",
    kg: "kg",
    g: "g",
};

const CM_PER_IN = 2.54;
const CM_PER_FT = 30.48;
const KG_PER_LB = 0.45359237;
const G_PER_OZ = 28.349523125;

const nearest = (n: number, step: number) => Math.round(n / step) * step;

/** Round a converted value to a sensible precision for its unit. */
function roundFor(unit: Canon, n: number): number {
    switch (unit) {
        case "cm":
            return n >= 3 ? Math.round(n) : Math.round(n * 10) / 10;
        case "mm":
            return Math.round(n);
        case "m":
            return Math.round(n * 10) / 10;
        case "in":
            return nearest(n, 0.5);
        case "ft":
            return nearest(n, 0.5);
        case "lb":
            return Math.round(n * 10) / 10;
        case "oz":
            return nearest(n, 0.5);
        case "kg":
            return n >= 1 ? Math.round(n * 10) / 10 : Math.round(n * 100) / 100;
        case "g":
            return nearest(n, 5);
    }
}

/** Convert one canonical value to the target system; returns null if already there. */
function convertValue(
    n: number,
    unit: Canon,
    to: UnitSystem,
): { value: number; unit: Canon } | null {
    if (to === "metric") {
        if (METRIC_UNITS.has(unit)) return null;
        if (unit === "in") return { value: n * CM_PER_IN, unit: "cm" };
        if (unit === "ft") return { value: n * CM_PER_FT, unit: "cm" };
        if (unit === "lb") return { value: n * KG_PER_LB, unit: "kg" };
        if (unit === "oz") return { value: n * G_PER_OZ, unit: "g" };
    } else {
        if (IMPERIAL_UNITS.has(unit)) return null;
        if (unit === "cm") return { value: n / CM_PER_IN, unit: "in" };
        if (unit === "mm") return { value: n / (CM_PER_IN * 10), unit: "in" };
        if (unit === "m") return { value: n / (CM_PER_FT / 100), unit: "ft" };
        if (unit === "kg") return { value: n / KG_PER_LB, unit: "lb" };
        if (unit === "g") return { value: n / G_PER_OZ, unit: "oz" };
    }
    return null;
}

/** Parse "24", "2.5", "1/2", "1 1/2" → number, or null. */
function parseAtom(s: string): number | null {
    const t = s.trim();
    let m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/); // mixed "1 1/2"
    if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
    m = t.match(/^(\d+)\/(\d+)$/); // fraction
    if (m) return Number(m[1]) / Number(m[2]);
    m = t.match(/^\d+(?:\.\d+)?$/); // int / decimal
    if (m) return Number(t);
    return null;
}

function fmtNum(n: number): string {
    return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}

// A numeric atom: mixed, fraction, or decimal/int.
const ATOM = String.raw`\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?`;
// A range or single atom.
const RANGE = String.raw`(?:${ATOM})(?:\s*[-–]\s*(?:${ATOM}))?`;
// A grid (AxB) or a single range.
const NUM = String.raw`(?:${RANGE})(?:\s*[x×]\s*(?:${RANGE}))?`;
const UNIT = String.raw`in\.?|inch(?:es)?|ft\.?|foot|feet|cm|mm|centimet(?:re|er)s?|millimet(?:re|er)s?|metres?|meters?|m|lbs?\.?|pounds?|oz\.?|ounces?|kg|kilograms?|grams?|g`;
const TOKEN = new RegExp(`(${NUM})\\s*(${UNIT})(?![A-Za-z])`, "gi");
// A whole measurement token (number + unit) and a "tokA / tokB" dual pair.
const TOKEN_INNER = String.raw`${NUM}\s*(?:${UNIT})(?![A-Za-z])`;
const DUAL_PAIR = new RegExp(`(${TOKEN_INNER})\\s*/\\s*(${TOKEN_INNER})`, "gi");
const DUAL_PAREN = new RegExp(
    `(${TOKEN_INNER})\\s*\\(\\s*(${TOKEN_INNER})\\s*\\)`,
    "gi",
);

/** Convert every measurement token in `text` to the target system. */
export function convertMeasurement(
    text: string,
    to: UnitSystem,
): string | null {
    let changed = false;
    const out = text.replace(
        TOKEN,
        (whole, numPart: string, unitRaw: string) => {
            const unit = canonUnit(unitRaw);
            if (!unit) return whole;
            const dims = numPart.split(/\s*[x×]\s*/);
            const convertedDims: string[] = [];
            let outUnit: Canon = unit;
            let any = false;
            for (const dim of dims) {
                const ends = dim.split(/\s*[-–]\s*/);
                const convertedEnds: string[] = [];
                for (const e of ends) {
                    const val = parseAtom(e);
                    if (val == null) return whole; // unparseable → leave token untouched
                    const c = convertValue(val, unit, to);
                    if (c) {
                        any = true;
                        outUnit = c.unit;
                        convertedEnds.push(fmtNum(roundFor(c.unit, c.value)));
                    } else {
                        convertedEnds.push(fmtNum(val));
                    }
                }
                convertedDims.push(convertedEnds.join("-"));
            }
            if (!any) return whole; // already target system
            changed = true;
            return `${convertedDims.join("x")} ${UNIT_DISPLAY[outUnit]}`;
        },
    );
    return changed ? out : null;
}

/** True if a string contains a metric measurement token. */
export function hasMetric(text: string): boolean {
    let found = false;
    text.replace(TOKEN, (w, _n, u: string) => {
        const c = canonUnit(u);
        if (c && METRIC_UNITS.has(c)) found = true;
        return w;
    });
    return found;
}

/** True if a string contains an imperial measurement token. */
export function hasImperial(text: string): boolean {
    let found = false;
    text.replace(TOKEN, (w, _n, u: string) => {
        const c = canonUnit(u);
        if (c && IMPERIAL_UNITS.has(c)) found = true;
        return w;
    });
    return found;
}

/**
 * Split an already-dual "metric / imperial" string on "/" into the two sides,
 * assigning each part by the unit it contains. Returns null if it isn't a clean
 * two-part dual string.
 */
export function splitDual(text: string): MeasurementPair | null {
    if (!text.includes("/")) return null;
    const parts = text.split("/").map((p) => p.trim());
    if (parts.length !== 2) return null;
    const [a, b] = parts;
    const aMet = hasMetric(a),
        aImp = hasImperial(a);
    const bMet = hasMetric(b),
        bImp = hasImperial(b);
    if (aMet && !aImp && bImp && !bMet) return { metric: a, imperial: b };
    if (aImp && !aMet && bMet && !bImp) return { imperial: a, metric: b };
    return null;
}

/**
 * Collapse each dual measurement to the `keep` system's side while preserving
 * all surrounding prose. Handles both "X unit / Y unit" and "X unit (Y unit)"
 * forms. Unlike `splitDual`, shared qualifiers are kept on BOTH generated sides.
 */
export function stripDualTokens(text: string, keep: UnitSystem): string {
    const collapse = (a: string, b: string): string | null => {
        const aMet = hasMetric(a),
            aImp = hasImperial(a);
        const bMet = hasMetric(b),
            bImp = hasImperial(b);
        if (aMet && !aImp && bImp && !bMet) return keep === "metric" ? a : b;
        if (aImp && !aMet && bMet && !bImp) return keep === "imperial" ? a : b;
        return null;
    };
    let out = text.replace(
        DUAL_PAIR,
        (w, a: string, b: string) => collapse(a, b) ?? w,
    );
    out = out.replace(
        DUAL_PAREN,
        (w, a: string, b: string) => collapse(a, b) ?? w,
    );
    return out;
}

/**
 * Build a `{ imperial, metric }` pair from a source string. A dual string
 * (contains both systems) collapses its cross-unit tokens per side, preserving
 * prose; a single-system string keeps the original and converts the other side.
 */
export function buildPair(text: string): MeasurementPair {
    const met = hasMetric(text),
        imp = hasImperial(text);
    if (met && imp) {
        return {
            imperial: stripDualTokens(text, "imperial"),
            metric: stripDualTokens(text, "metric"),
        };
    }
    if (imp)
        return { imperial: text, metric: convertMeasurement(text, "metric") };
    if (met)
        return { metric: text, imperial: convertMeasurement(text, "imperial") };
    // no units: keep as-is on both sides
    return { imperial: text, metric: text };
}

export function isMeasurementPair(v: unknown): v is MeasurementPair {
    return (
        typeof v === "object" &&
        v !== null &&
        !Array.isArray(v) &&
        ("imperial" in v || "metric" in v) &&
        Object.keys(v).every((k) => k === "imperial" || k === "metric")
    );
}

/** Choose the display string for a system, falling back to the other side. */
export function pickMeasurement(v: unknown, system: UnitSystem): string | null {
    if (isMeasurementPair(v)) {
        const other: UnitSystem = system === "metric" ? "imperial" : "metric";
        return v[system] ?? v[other] ?? null;
    }
    return typeof v === "string" ? v : null;
}

/** Default unit system when none is requested (data is historically imperial). */
export const DEFAULT_UNIT_SYSTEM: UnitSystem = "imperial";

/**
 * Resolve a measurement field — plain string, `MeasurementPair`, or a
 * variety-keyed dict of either — to a single display string for `system`.
 */
export function resolveMeasurement(
    value: unknown,
    system: UnitSystem,
): string | null {
    if (value == null) return null;
    if (typeof value === "string") return value;
    if (isMeasurementPair(value)) return pickMeasurement(value, system);
    if (typeof value === "object" && !Array.isArray(value)) {
        for (const v of Object.values(value as Record<string, unknown>)) {
            const r = resolveMeasurement(v, system);
            if (r) return r;
        }
    }
    return null;
}
