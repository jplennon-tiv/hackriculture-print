import { describe, it, expect } from "vitest";
import { yieldSummary, yieldFact, timeToHarvestSummary } from "./facts";
import type { YieldGroup, TimeToHarvestGroup, MeasuredValue } from "../types";

const mv = (text: string): MeasuredValue => ({
    min: null,
    max: null,
    unit: null,
    text,
});

describe("yieldSummary", () => {
    it("returns null for null/undefined", () => {
        expect(yieldSummary(null)).toBeNull();
        expect(yieldSummary(undefined)).toBeNull();
    });
    it("prefers default bases in priority order", () => {
        const y: YieldGroup = {
            default: {
                per_plant: null,
                per_mature_plant: mv("10 heads"),
                per_10_ft_row: mv("8 lb"),
                per_10_ft_double_row: null,
            },
            by_variety: null,
        };
        expect(yieldSummary(y)).toBe("10 heads");
    });
    it("falls back to a variety override when defaults are empty", () => {
        const y: YieldGroup = {
            default: {
                per_plant: null,
                per_mature_plant: null,
                per_10_ft_row: null,
                per_10_ft_double_row: null,
            },
            by_variety: { bush: { per_10_ft_row: mv("8 lb") } },
        };
        expect(yieldSummary(y)).toBe("8 lb");
    });
    it("returns null when every leaf is empty text", () => {
        const y: YieldGroup = {
            default: {
                per_plant: mv(""),
                per_mature_plant: null,
                per_10_ft_row: null,
                per_10_ft_double_row: null,
            },
            by_variety: null,
        };
        expect(yieldSummary(y)).toBeNull();
    });
});

describe("yieldFact (units-aware label)", () => {
    it("returns null when there is no yield", () => {
        expect(yieldFact(null)).toBeNull();
    });
    it("labels a per-plant yield", () => {
        const y: YieldGroup = {
            default: {
                per_plant: mv("3-5 lb"),
                per_mature_plant: null,
                per_10_ft_row: null,
                per_10_ft_double_row: null,
            },
            by_variety: null,
        };
        expect(yieldFact(y)).toEqual({
            label: "Yield per plant",
            value: "3-5 lb",
        });
    });
    it("labels a 10 ft row yield, imperial and metric", () => {
        const y: YieldGroup = {
            default: {
                per_plant: null,
                per_mature_plant: null,
                per_10_ft_row: mv("10 lb"),
                per_10_ft_double_row: null,
            },
            by_variety: null,
        };
        expect(yieldFact(y, "imperial")?.label).toBe("Yield (10 ft row)");
        expect(yieldFact(y, "metric")?.label).toBe("Yield (3 m row)");
        // value is converted for metric weights
        expect(yieldFact(y, "metric")?.value).not.toBe("10 lb");
    });
    it("labels a double row yield and follows variety overrides", () => {
        const y: YieldGroup = {
            default: {
                per_plant: null,
                per_mature_plant: null,
                per_10_ft_row: null,
                per_10_ft_double_row: mv("20 lb"),
            },
            by_variety: null,
        };
        expect(yieldFact(y, "imperial")?.label).toBe(
            "Yield (10 ft double row)",
        );
        expect(yieldFact(y, "metric")?.label).toBe("Yield (3 m double row)");

        const v: YieldGroup = {
            default: {
                per_plant: null,
                per_mature_plant: null,
                per_10_ft_row: null,
                per_10_ft_double_row: null,
            },
            by_variety: { bush: { per_10_ft_row: mv("8 lb") } },
        };
        expect(yieldFact(v)?.label).toBe("Yield (10 ft row)");
    });
});

describe("timeToHarvestSummary", () => {
    it("returns null for null/undefined", () => {
        expect(timeToHarvestSummary(null)).toBeNull();
        expect(timeToHarvestSummary(undefined)).toBeNull();
    });
    it("prefers ready_in_short", () => {
        const t: TimeToHarvestGroup = {
            default: { from_sowing: mv("12 weeks"), from_planting: null },
            by_variety: null,
            ready_in_short: "3–4 months",
        };
        expect(timeToHarvestSummary(t)).toBe("3–4 months");
    });
    it("falls back to default from_sowing then from_planting", () => {
        const t: TimeToHarvestGroup = {
            default: { from_sowing: null, from_planting: mv("40 weeks") },
            by_variety: null,
            ready_in_short: null,
        };
        expect(timeToHarvestSummary(t)).toBe("40 weeks");
    });
    it("falls back to a variety override last", () => {
        const t: TimeToHarvestGroup = {
            default: { from_sowing: null, from_planting: null },
            by_variety: { early: { from_sowing: mv("12 weeks") } },
            ready_in_short: null,
        };
        expect(timeToHarvestSummary(t)).toBe("12 weeks");
    });
});


describe("variant facts",()=>{
 it("shows the full duration range rather than the first variant",()=>{
  const t={default:{from_sowing:null,from_planting:null},ready_in_short:null,by_variety:{early:{from_sowing:{min:14,max:null,unit:"weeks",text:"14 weeks"}},late:{from_sowing:{min:26,max:null,unit:"weeks",text:"26 weeks"}}}} as TimeToHarvestGroup;
  expect(timeToHarvestSummary(t)).toBe("14–26 weeks");
 });
 it("labels both yield variants in either unit",()=>{
  const y={default:{per_plant:null,per_mature_plant:null,per_10_ft_row:null,per_10_ft_double_row:null},by_variety:{bush:{per_10_ft_row:mv("8 lb")},climbing:{per_10_ft_row:mv("12 lb")}}};
  expect(yieldFact(y)?.value).toBe("bush: 8 lb; climbing: 12 lb");
  expect(yieldFact(y,"metric")?.value).toMatch(/bush: .*kg; climbing: .*kg/);
 });
});
