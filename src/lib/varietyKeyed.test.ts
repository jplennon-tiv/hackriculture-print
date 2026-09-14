import { describe, it, expect } from "vitest";
import { toStr } from "./varietyKeyed";

describe("toStr", () => {
    it("returns a plain string unchanged", () => {
        expect(toStr("24 in.")).toBe("24 in.");
    });
    it("returns the first usable string from a variety-keyed object", () => {
        expect(
            toStr({ first_early_varieties: "24 in.", maincrop: "30 in." }),
        ).toBe("24 in.");
    });
    it("skips empty/non-string values when picking from an object", () => {
        expect(toStr({ a: "", b: 5, c: "30 in." })).toBe("30 in.");
    });
    it("returns null for nullish, arrays, and objects with no string", () => {
        expect(toStr(null)).toBeNull();
        expect(toStr(undefined)).toBeNull();
        expect(toStr("")).toBeNull();
        expect(toStr(["a", "b"])).toBeNull();
        expect(toStr({ a: 1, b: 2 })).toBeNull();
    });
    it("resolves a MeasurementPair to its imperial side", () => {
        expect(toStr({ imperial: "24 in.", metric: "60 cm" })).toBe("24 in.");
        expect(toStr({ imperial: null, metric: "60 cm" })).toBe("60 cm");
    });
    it("resolves a variety-dict of pairs to the first imperial value", () => {
        expect(toStr({ early: { imperial: "12 in.", metric: "30 cm" } })).toBe(
            "12 in.",
        );
    });
});
