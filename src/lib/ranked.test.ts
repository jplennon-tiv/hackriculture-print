import { describe, it, expect } from "vitest";
import { rt, isStar, getRank, isRankedText } from "./ranked";

describe("rt", () => {
    it('selects explicit source prose without converting or losing qualifications', () => {
        const text = {metric:'Allow about 45 cm; more for large plants.', imperial:'Allow about 18 in.; more for large plants.'};
        expect(rt({text,rank:8}, 'metric')).toBe(text.metric);
        expect(rt({text,rank:8}, 'imperial')).toBe(text.imperial);
        expect(rt(text, 'metric')).toBe(text.metric);
        expect(isRankedText({text,rank:8})).toBe(true);
        expect(rt({metric:null,imperial:'18 in.'}, 'metric')).toBe('18 in.');
    });
    it("returns the string as-is", () => {
        expect(rt("hello")).toBe("hello");
    });
    it("extracts text from a ranked object", () => {
        expect(rt({ text: "note", rank: 5 })).toBe("note");
    });
    it("returns empty string for nullish or shapeless input", () => {
        expect(rt(null)).toBe("");
        expect(rt(undefined)).toBe("");
        expect(rt(42)).toBe("");
        expect(rt({ rank: 5 })).toBe("");
    });
});

describe("isStar", () => {
    it("is true only when star === true", () => {
        expect(isStar({ text: "x", star: true })).toBe(true);
        expect(isStar({ text: "x", star: false })).toBe(false);
        expect(isStar({ text: "x" })).toBe(false);
        expect(isStar("x")).toBe(false);
        expect(isStar(null)).toBe(false);
    });
});

describe("getRank", () => {
    it("returns the numeric rank", () => {
        expect(getRank({ text: "x", rank: 7 })).toBe(7);
    });
    it("returns fallback when unranked", () => {
        expect(getRank({ text: "x" })).toBe(0);
        expect(getRank("x", 9)).toBe(9);
        expect(getRank(null, 3)).toBe(3);
    });
});

describe("isRankedText", () => {
    it("is true for a {text, rank} leaf", () => {
        expect(isRankedText({ text: "x", rank: 5 })).toBe(true);
    });
    it("is false for strings, partial shapes, and wrong types", () => {
        expect(isRankedText("x")).toBe(false);
        expect(isRankedText({ text: "x" })).toBe(false);
        expect(isRankedText({ rank: 5 })).toBe(false);
        expect(isRankedText({ text: 1, rank: 5 })).toBe(false);
        expect(isRankedText(null)).toBe(false);
    });
});
