import { describe, it, expect } from "vitest";
import {
    MONTH_INITIALS,
    MONTH_SHORT,
    MONTH_FULL,
    monthTokenIndex,
    monthNumbers,
    expandMonths,
    isoMonthToName,
    formatMonthRange,
} from "./months";

describe("month constant arrays", () => {
    it("each has 12 entries", () => {
        expect(MONTH_INITIALS).toHaveLength(12);
        expect(MONTH_SHORT).toHaveLength(12);
        expect(MONTH_FULL).toHaveLength(12);
    });
    it("endpoints line up", () => {
        expect(MONTH_SHORT[0]).toBe("Jan");
        expect(MONTH_SHORT[11]).toBe("Dec");
        expect(MONTH_FULL[2]).toBe("March");
    });
});

describe("monthTokenIndex", () => {
    it("parses a valid single token to a 0-based index", () => {
        expect(monthTokenIndex("--01")).toBe(0);
        expect(monthTokenIndex("--12")).toBe(11);
        expect(monthTokenIndex("  --03 ")).toBe(2);
    });
    it("returns null for malformed or out-of-range tokens", () => {
        expect(monthTokenIndex("--00")).toBeNull();
        expect(monthTokenIndex("--13")).toBeNull();
        expect(monthTokenIndex("March")).toBeNull();
        expect(monthTokenIndex("--03/--05")).toBeNull();
    });
});

describe("monthNumbers", () => {
    it("collects endpoints only (not the months between)", () => {
        expect(monthNumbers(["--03/--05"])).toEqual([2, 4]);
        expect(monthNumbers(["--02", "--04/--06"])).toEqual([1, 3, 5]);
    });
    it("handles undefined/empty", () => {
        expect(monthNumbers(undefined)).toEqual([]);
        expect(monthNumbers([])).toEqual([]);
    });
});

describe("expandMonths", () => {
    it("expands an ascending inclusive range", () => {
        expect([...expandMonths(["--03/--05"])].sort((a, b) => a - b)).toEqual([
            2, 3, 4,
        ]);
    });
    it("adds a single token", () => {
        expect([...expandMonths(["--06"])]).toEqual([5]);
    });
    it("hides a descending range when wrap is false (default)", () => {
        expect(expandMonths(["--10/--03"]).size).toBe(0);
    });
    it("wraps a descending range across year-end when wrap is true", () => {
        expect(
            [...expandMonths(["--10/--03"], { wrap: true })].sort(
                (a, b) => a - b,
            ),
        ).toEqual([0, 1, 2, 9, 10, 11]);
    });
    it("ignores malformed range endpoints", () => {
        expect(expandMonths(["--13/--15"], { wrap: true }).size).toBe(0);
    });
});

describe("isoMonthToName", () => {
    it("maps a token to a full month name", () => {
        expect(isoMonthToName("--03")).toBe("March");
    });
    it("returns the input unchanged when not a token", () => {
        expect(isoMonthToName("spring")).toBe("spring");
    });
});

describe("formatMonthRange", () => {
    it("returns empty string for no entries", () => {
        expect(formatMonthRange([])).toBe("");
        expect(formatMonthRange(undefined)).toBe("");
        expect(formatMonthRange([], { empty: "—" })).toBe("—");
    });
    it("preserves gaps in ascending data", () => {
        expect(formatMonthRange(["--03/--05"])).toBe("Mar – May");
        expect(formatMonthRange(["--02", "--04"])).toBe("Feb; Apr");
        expect(formatMonthRange(["--03", "--05", "--07"])).toBe("Mar; May; Jul");
        expect(formatMonthRange(["--06"])).toBe("Jun");
    });
    it("keeps separate windows and ignores invalid tokens", () => {
        expect(formatMonthRange(["--03/--05","--08/--09"])).toBe("Mar – May; Aug – Sep");
        expect(formatMonthRange(["--10/--02","--05"])).toBe("May; Oct – Feb");
        expect(formatMonthRange(["--01/--12"])).toBe("Jan – Dec");
        expect(formatMonthRange(["--13/--15","nonsense"])).toBe("");
    });
    it("reads a wrap-around range in season order, not inverted", () => {
        expect(formatMonthRange(["--10/--03"])).toBe("Oct – Mar");
        expect(formatMonthRange(["--09/--01"])).toBe("Sep – Jan");
        expect(formatMonthRange(["--11/--03"])).toBe("Nov – Mar");
    });
    it("combines mixed ranges into the overall covered season", () => {
        expect(formatMonthRange(["--01/--04", "--12", "--09/--04"])).toBe(
            "Sep – Apr",
        );
        // spinach: only April is uncovered → season is May through the next March
        expect(formatMonthRange(["--05/--10", "--10/--03", "--08/--09"])).toBe(
            "May – Mar",
        );
    });
});
