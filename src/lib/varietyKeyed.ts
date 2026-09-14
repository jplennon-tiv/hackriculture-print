/**
 * Some sowing / variety fields may be a plain string OR a variety-keyed
 * object (e.g. `{ first_early_varieties: "24 in.", maincrop_varieties: "30 in." }`).
 * `toStr` returns the first usable string it finds, or `null`. A `MeasurementPair`
 * `{ imperial, metric }` resolves to its imperial side by default (system-aware
 * display uses `resolveMeasurement` in lib/measure.ts).
 */
function isPair(o: Record<string, unknown>): boolean {
    return (
        ("imperial" in o || "metric" in o) &&
        Object.keys(o).every((k) => k === "imperial" || k === "metric")
    );
}

function pairToStr(o: Record<string, unknown>): string | null {
    if (typeof o.imperial === "string" && o.imperial) return o.imperial;
    if (typeof o.metric === "string" && o.metric) return o.metric;
    return null;
}

export function toStr(val: unknown): string | null {
    if (!val) return null;
    if (typeof val === "string") return val;
    if (typeof val === "object" && !Array.isArray(val)) {
        const o = val as Record<string, unknown>;
        if (isPair(o)) return pairToStr(o);
        for (const v of Object.values(o)) {
            if (typeof v === "string" && v) return v;
            if (
                v &&
                typeof v === "object" &&
                !Array.isArray(v) &&
                isPair(v as Record<string, unknown>)
            ) {
                const r = pairToStr(v as Record<string, unknown>);
                if (r) return r;
            }
        }
    }
    return null;
}
