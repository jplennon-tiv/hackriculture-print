import { describe, it, expect } from "vitest";
import {
    convertMeasurement,
    splitDual,
    stripDualTokens,
    buildPair,
    isMeasurementPair,
    pickMeasurement,
    resolveMeasurement,
    hasMetric,
    hasImperial,
} from "./measure";

describe("convertMeasurement → metric", () => {
    it("converts inches and feet to cm, preserving qualifiers", () => {
        expect(convertMeasurement("24 in.", "metric")).toBe("61 cm");
        expect(convertMeasurement("36 in. between rows", "metric")).toBe(
            "91 cm between rows",
        );
        expect(convertMeasurement("2 ft", "metric")).toBe("61 cm");
    });
    it("handles fractions and small values with one decimal", () => {
        expect(convertMeasurement("1/2 in.", "metric")).toBe("1.3 cm");
        expect(convertMeasurement("1 in.", "metric")).toBe("2.5 cm");
    });
    it("handles ranges and grids", () => {
        expect(convertMeasurement("12-14 in.", "metric")).toBe("30-36 cm");
        expect(convertMeasurement("90x90 cm", "imperial")).toBe(
            "35.5x35.5 in.",
        );
    });
    it("converts multiple tokens in one prose string", () => {
        expect(
            convertMeasurement(
                "18 in. in rows; 15 in. each way in deep beds",
                "metric",
            ),
        ).toBe("46 cm in rows; 38 cm each way in deep beds");
    });
    it("converts weights", () => {
        expect(convertMeasurement("5 lb", "metric")).toBe("2.3 kg");
        expect(convertMeasurement("1 oz", "metric")).toBe("30 g");
    });
    it("returns null when nothing needs converting", () => {
        expect(convertMeasurement("60 cm", "metric")).toBeNull();
        expect(convertMeasurement("no measurements here", "metric")).toBeNull();
    });
});

describe("hasMetric / hasImperial", () => {
    it("detect the unit systems present", () => {
        expect(hasImperial("24 in.")).toBe(true);
        expect(hasMetric("24 in.")).toBe(false);
        expect(hasMetric("30-35 cm")).toBe(true);
        expect(hasImperial("30-35 cm / 12-14 in.")).toBe(true);
        expect(hasMetric("30-35 cm / 12-14 in.")).toBe(true);
    });
});

describe("splitDual", () => {
    it("splits a metric / imperial string by unit", () => {
        expect(splitDual("30-35 cm / 12-14 in.")).toEqual({
            metric: "30-35 cm",
            imperial: "12-14 in.",
        });
    });
    it("returns null for non-dual strings", () => {
        expect(splitDual("24 in.")).toBeNull();
        expect(splitDual("a / b / c")).toBeNull();
    });
});

describe("buildPair", () => {
    it("splits an already-dual string", () => {
        expect(buildPair("30-35 cm / 12-14 in.")).toEqual({
            metric: "30-35 cm",
            imperial: "12-14 in.",
        });
    });
    it("keeps shared prose on BOTH sides of a prose dual", () => {
        expect(
            buildPair(
                "About 5 cm / 2 in. deep, or deep enough for the pointed tip to be just covered with soil",
            ),
        ).toEqual({
            imperial:
                "About 2 in. deep, or deep enough for the pointed tip to be just covered with soil",
            metric: "About 5 cm deep, or deep enough for the pointed tip to be just covered with soil",
        });
        expect(
            buildPair(
                "About 9-10 in. / 25 cm in newer notes; older small rows may be closer",
            ),
        ).toEqual({
            imperial:
                "About 9-10 in. in newer notes; older small rows may be closer",
            metric: "About 25 cm in newer notes; older small rows may be closer",
        });
    });
    it("collapses a multi-clause interleaved dual per side", () => {
        expect(
            buildPair(
                "10 cm / 4 in. minimum for pak choi; 20-25 cm / 8-10 in. for larger leaf crops; 35 cm / 14 in. for Chinese cabbage",
            ),
        ).toEqual({
            imperial:
                "4 in. minimum for pak choi; 8-10 in. for larger leaf crops; 14 in. for Chinese cabbage",
            metric: "10 cm minimum for pak choi; 20-25 cm for larger leaf crops; 35 cm for Chinese cabbage",
        });
    });
    it("keeps an imperial source and derives metric", () => {
        expect(buildPair("24 in.")).toEqual({
            imperial: "24 in.",
            metric: "61 cm",
        });
    });
    it("keeps a metric source and derives imperial", () => {
        expect(buildPair("100 cm or more")).toEqual({
            metric: "100 cm or more",
            imperial: "39.5 in. or more",
        });
    });
});

describe("stripDualTokens", () => {
    it("keeps only the requested system's token, preserving prose", () => {
        const t = "Thin to about 3-5 cm / 1-2 in and harvest progressively";
        expect(stripDualTokens(t, "imperial")).toBe(
            "Thin to about 1-2 in and harvest progressively",
        );
        expect(stripDualTokens(t, "metric")).toBe(
            "Thin to about 3-5 cm and harvest progressively",
        );
    });
});

describe("isMeasurementPair / pickMeasurement", () => {
    it("recognises a pair object only", () => {
        expect(isMeasurementPair({ imperial: "24 in.", metric: "60 cm" })).toBe(
            true,
        );
        expect(isMeasurementPair({ imperial: "24 in." })).toBe(true);
        expect(isMeasurementPair({ first_early: "24 in." })).toBe(false);
        expect(isMeasurementPair("24 in.")).toBe(false);
        expect(isMeasurementPair(null)).toBe(false);
    });
    it("picks the requested side, falling back to the other", () => {
        const p = { imperial: "24 in.", metric: "60 cm" };
        expect(pickMeasurement(p, "metric")).toBe("60 cm");
        expect(pickMeasurement(p, "imperial")).toBe("24 in.");
        expect(
            pickMeasurement({ imperial: null, metric: "60 cm" }, "imperial"),
        ).toBe("60 cm");
        expect(pickMeasurement("24 in.", "metric")).toBe("24 in.");
        expect(pickMeasurement(null, "metric")).toBeNull();
    });
});
