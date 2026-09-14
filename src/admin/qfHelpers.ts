import type { Vegetable } from "../types";
import { toStr } from "../lib/varietyKeyed";
import { formatMonthRange } from "../lib/months";
import {
    yieldFact,
    timeToHarvestSummary,
    durationFactSummary,
} from "../lib/facts";

// ── QF row extraction ─────────────────────────────────────────────────────────

export interface QfRow {
    label: string;
    value: string | null;
    sectionKey: string;
}

export function extractQfRows(veg: Vegetable): QfRow[] {
    const facts = (veg.seed_and_growing_facts ?? {}) as Record<string, unknown>;
    const sfStr = (k: string): string | null =>
        typeof facts[k] === "string" && (facts[k] as string).trim()
            ? (facts[k] as string)
            : null;

    const cal = veg.calendar;
    const calSow = cal?.sowing_time;
    const calHar = cal?.harvest_time;

    const sowing = veg.sowing_and_planting;
    const sowingKey = "sowing_and_planting";
    const factsKey = "seed_and_growing_facts";

    const depth: string | null =
        toStr(sowing?.sowing_depth) ?? toStr(sowing?.planting_depth) ?? null;

    const yf = yieldFact(veg.yield);
    const readyIn = timeToHarvestSummary(veg.time_to_harvest);

    return [
        {
            label: "SOW",
            value: formatMonthRange(calSow?.most_popular ?? []) || null,
            sectionKey: "calendar",
        },
        {
            label: "HARVEST",
            value: formatMonthRange(calHar?.most_popular ?? []) || null,
            sectionKey: "calendar",
        },
        {
            label: "GERMINATION",
            value:
                durationFactSummary(facts, "expected_germination_time") ??
                durationFactSummary(
                    facts,
                    "time_between_planting_and_sprouting",
                ) ??
                sfStr("germination_period"),
            sectionKey: factsKey,
        },
        { label: "DEPTH", value: depth, sectionKey: sowingKey },
        {
            label: "ROW SPACING",
            value: toStr(sowing?.row_spacing),
            sectionKey: sowingKey,
        },
        {
            label: "PLANT SPACING",
            value: toStr(sowing?.plant_spacing),
            sectionKey: sowingKey,
        },
        {
            label: yf?.label ?? "YIELD",
            value: yf?.value ?? null,
            sectionKey: "yield",
        },
        { label: "READY IN", value: readyIn, sectionKey: "time_to_harvest" },
        {
            label: "SEED LIFE",
            value: durationFactSummary(facts, "life_expectancy_of_stored_seed"),
            sectionKey: factsKey,
        },
    ];
}

export function computeQfScore(veg: Vegetable | null | undefined): {
    filled: number;
    total: number;
} {
    if (!veg) return { filled: 0, total: 9 };
    const rows = extractQfRows(veg);
    return { filled: rows.filter((r) => r.value).length, total: rows.length };
}
