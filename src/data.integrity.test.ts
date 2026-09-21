import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { GardeningDataSchema, TroublesDataSchema } from "./schema";
import { isMeasurementPair } from "./lib/measure";
import {readCollection} from '../../hackriculture-data/lib/records.mjs';

const here = import.meta.dirname;
const shared = join(here, "../../hackriculture-data");

const vegetables = readCollection('vegetables',shared) as Record<
    string,
    Record<string, unknown>
>;
const troubles = readCollection('troubles',shared);

const LEGACY_HARVEST = [
    "picking_time",
    "cutting_time",
    "lifting_time",
    "pulling_time",
];
const MONTH_TOKEN = /^--(0[1-9]|1[0-2])(\/--(0[1-9]|1[0-2]))?$/;
const CAL_ARRAY_FIELDS = [
    "most_popular",
    "less_usual",
    "under_cloches_or_cold_frame",
    "indoors_under_glass",
    "transplanting_under_glass",
    "transplanting_under_glass_cover_with_cloches",
];

/** Walk every object node, invoking `visit(node, path)`. */
function walk(
    node: unknown,
    path: string,
    visit: (n: Record<string, unknown>, p: string) => void,
) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
        node.forEach((v, i) => walk(v, `${path}[${i}]`, visit));
        return;
    }
    visit(node as Record<string, unknown>, path);
    for (const [k, v] of Object.entries(node)) if(k!=='_field_metadata')walk(v, `${path}.${k}`, visit);
}

const isMeasuredValue = (n: Record<string, unknown>) =>
    "text" in n && "min" in n && "max" in n && "unit" in n;

// Fields whose values are imperial/metric measurement pairs (or legacy strings).
const MEASUREMENT_KEYS = [
    "row_spacing",
    "plant_spacing",
    "sowing_depth",
    "planting_depth",
    "trench_or_ridge_depth",
    "spacing",
    "mature_height",
];

describe("schema validation", () => {
    it("vegetables.json validates cleanly against GardeningDataSchema", () => {
        const r = GardeningDataSchema.safeParse(vegetables);
        expect(
            r.success,
            r.success
                ? ""
                : JSON.stringify(r.error?.issues.slice(0, 5), null, 2),
        ).toBe(true);
    });
    it("troubles.json validates cleanly against TroublesDataSchema", () => {
        const r = TroublesDataSchema.safeParse(troubles);
        expect(
            r.success,
            r.success
                ? ""
                : JSON.stringify(r.error?.issues.slice(0, 5), null, 2),
        ).toBe(true);
    });
});

describe("shared source", () => {
    it("keeps all three datasets only in hackriculture-data", () => {
        for (const name of ["vegetables.json", "troubles.json", "vegetable_groups.json"]) {
            expect(existsSync(join(shared, name))).toBe(name==='vegetable_groups.json');
            expect(existsSync(join(here, name))).toBe(false);
            expect(existsSync(join(here, "..", name))).toBe(false);
        }
        expect(existsSync(join(shared,'records.json'))).toBe(true);
        expect(existsSync(join(shared,'vegetables/carrot/carrot.json'))).toBe(true);
    });
});

describe("structural invariants", () => {
    it("every vegetable has a metadata object (bag for one-off facts)", () => {
        for (const [slug, veg] of Object.entries(vegetables)) {
            const m = veg.metadata;
            expect(
                m !== null && typeof m === "object" && !Array.isArray(m),
                `${slug}.metadata should be an object`,
            ).toBe(true);
        }
    });

    it("no legacy per-action harvest keys survive anywhere", () => {
        const hits: string[] = [];
        walk(vegetables, "root", (n, p) => {
            for (const k of LEGACY_HARVEST) if (k in n) hits.push(`${p}.${k}`);
        });
        expect(hits, hits.join("\n")).toEqual([]);
    });

    it("no dropped/renamed legacy keys reappear (usual_spacing, calendar_by_planting_type)", () => {
        const hits: string[] = [];
        walk(vegetables, "root", (n, p) => {
            if ("usual_spacing" in n) hits.push(`${p}.usual_spacing`);
            if ("calendar_by_planting_type" in n)
                hits.push(`${p}.calendar_by_planting_type`);
        });
        expect(hits, hits.join("\n")).toEqual([]);
    });

    it("all structured month tokens are well-formed", () => {
        const bad: string[] = [];
        walk(vegetables, "root", (n, p) => {
            for (const f of CAL_ARRAY_FIELDS) {
                const arr = n[f];
                if (Array.isArray(arr)) {
                    for (const t of arr) {
                        if (typeof t === "string" && !MONTH_TOKEN.test(t))
                            bad.push(`${p}.${f}: ${t}`);
                    }
                }
            }
        });
        expect(bad, bad.join("\n")).toEqual([]);
    });
});

describe("no lost data (text-preservation invariants)", () => {
    it("every MeasuredValue keeps non-empty prose in `text`", () => {
        const bad: string[] = [];
        walk(vegetables, "root", (n, p) => {
            if (isMeasuredValue(n)) {
                if (typeof n.text !== "string" || !n.text.trim()) bad.push(p);
            }
        });
        expect(
            bad,
            `MeasuredValue with empty text:\n${bad.join("\n")}`,
        ).toEqual([]);
    });

    it("a filled MeasuredValue never has a lone max without a min", () => {
        const bad: string[] = [];
        walk(vegetables, "root", (n, p) => {
            if (
                isMeasuredValue(n) &&
                n.min === null &&
                typeof n.max === "number"
            )
                bad.push(p);
        });
        expect(bad, bad.join("\n")).toEqual([]);
    });

    it("every duration `*_value` companion is a valid DurationValue", () => {
        const bad: string[] = [];
        walk(vegetables, "root", (n, p) => {
            for (const [k, v] of Object.entries(n)) {
                if (
                    !k.endsWith("_value") ||
                    v === null ||
                    typeof v !== "object" ||
                    Array.isArray(v)
                )
                    continue;
                const d = v as Record<string, unknown>;
                const okMin = typeof d.min === "number";
                const okMax = d.max === null || typeof d.max === "number";
                const okUnit = typeof d.unit === "string";
                if (!(okMin && okMax && okUnit))
                    bad.push(`${p}.${k}: ${JSON.stringify(v)}`);
            }
        });
        expect(bad, bad.join("\n")).toEqual([]);
    });
});

describe("imperial/metric measurement pairs", () => {
    it("every MeasurementPair has both sides (string|null) and is not blank on both", () => {
        const bad: string[] = [];
        walk(vegetables, "root", (n, p) => {
            if (!isMeasurementPair(n)) return;
            const imp = n.imperial;
            const met = n.metric;
            const okImp = imp === null || typeof imp === "string";
            const okMet = met === null || typeof met === "string";
            if (
                !("imperial" in n) ||
                !("metric" in n) ||
                !okImp ||
                !okMet ||
                (imp === null && met === null)
            )
                bad.push(`${p}: ${JSON.stringify(n).slice(0, 100)}`);
        });
        expect(bad, bad.join("\n")).toEqual([]);
    });

    it("measurement fields are string | pair | variety-dict of those | null", () => {
        const okLeaf = (v: unknown) =>
            v === null || typeof v === "string" || isMeasurementPair(v);
        const bad: string[] = [];
        walk(vegetables, "root", (n, p) => {
            for (const key of MEASUREMENT_KEYS) {
                if (!(key in n)) continue;
                const v = n[key];
                if (okLeaf(v)) continue;
                // variety-keyed dict: every value must be a leaf
                if (
                    v &&
                    typeof v === "object" &&
                    !Array.isArray(v) &&
                    !isMeasurementPair(v) &&
                    Object.values(v as Record<string, unknown>).every(okLeaf)
                )
                    continue;
                bad.push(`${p}.${key}: ${JSON.stringify(v).slice(0, 80)}`);
            }
        });
        expect(bad, bad.join("\n")).toEqual([]);
    });
});
