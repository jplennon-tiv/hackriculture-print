import { describe, it, expect } from "vitest";
import {
    formatDuration,
    toISODuration,
    durationToDays,
    isDurationUnit,
} from "./duration";

describe("isDurationUnit", () => {
    it("accepts the four duration units only", () => {
        for (const u of ["days", "weeks", "months", "years"]) {
            expect(isDurationUnit(u)).toBe(true);
        }
        expect(isDurationUnit("lb")).toBe(false);
        expect(isDurationUnit(null)).toBe(false);
        expect(isDurationUnit("pumpkins")).toBe(false);
    });
});

describe("formatDuration", () => {
    it("formats a single value with correct pluralisation", () => {
        expect(formatDuration({ min: 2, max: null, unit: "weeks" })).toBe(
            "2 weeks",
        );
        expect(
            formatDuration({ min: 1, max: null, unit: "week" as never }),
        ).toBeNull();
        expect(
            formatDuration({ min: 1, max: null, unit: "year" as never }),
        ).toBeNull();
        expect(formatDuration({ min: 1, max: null, unit: "years" })).toBe(
            "1 year",
        );
        expect(formatDuration({ min: 7, unit: "months" })).toBe("7 months");
    });
    it("formats a range sharing the unit, pluralising on the upper bound", () => {
        expect(formatDuration({ min: 2, max: 4, unit: "weeks" })).toBe(
            "2–4 weeks",
        );
        expect(formatDuration({ min: 10, max: 30, unit: "days" })).toBe(
            "10–30 days",
        );
        expect(formatDuration({ min: 1, max: 2, unit: "years" })).toBe(
            "1–2 years",
        );
    });
    it("treats an equal max as a single value", () => {
        expect(formatDuration({ min: 3, max: 3, unit: "months" })).toBe(
            "3 months",
        );
    });
    it("returns null for non-duration units or missing numbers (prose fallback)", () => {
        expect(formatDuration({ min: 5, max: null, unit: "lb" })).toBeNull();
        expect(
            formatDuration({ min: null, max: null, unit: "weeks" }),
        ).toBeNull();
        expect(formatDuration(null)).toBeNull();
        expect(formatDuration(undefined)).toBeNull();
    });
});

describe("toISODuration", () => {
    it("preserves the unit designator (weeks → W, not days)", () => {
        expect(toISODuration(2, "weeks")).toBe("P2W");
        expect(toISODuration(10, "days")).toBe("P10D");
        expect(toISODuration(6, "months")).toBe("P6M");
        expect(toISODuration(2, "years")).toBe("P2Y");
    });
});

describe("durationToDays", () => {
    it("converts units to an approximate day count", () => {
        expect(durationToDays(10, "days")).toBe(10);
        expect(durationToDays(2, "weeks")).toBe(14);
        expect(durationToDays(2, "years")).toBe(730);
        expect(durationToDays(6, "months")).toBeCloseTo(182.5, 1);
    });
});
