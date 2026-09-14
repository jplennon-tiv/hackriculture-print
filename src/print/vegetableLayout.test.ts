import { describe, expect, it } from "vitest";
import {
    introContentBudget,
    introFitAction,
    nextPage2Trim,
    pageFitAction,
} from "./vegetableLayout";

describe("page-one fitting priorities", () => {
    const fit = {
        gap: -30,
        previousGap: null,
        varieties: 4,
        maxVarieties: 8,
        imageHeight: 400,
    };

    it("trims varieties before reducing the image", () => {
        expect(pageFitAction(fit)).toBe("trim-variety");
        expect(pageFitAction({ ...fit, varieties: 3 })).toBe("shrink-image");
        expect(pageFitAction({ ...fit, varieties: 3, imageHeight: 220 })).toBe(
            "trim-variety",
        );
        expect(pageFitAction({ ...fit, varieties: 2, imageHeight: 220 })).toBe(
            "done",
        );
    });

    it("grows varieties before the image and stops at the bounds", () => {
        expect(pageFitAction({ ...fit, gap: 30 })).toBe("grow-variety");
        expect(pageFitAction({ ...fit, gap: 30, varieties: 8 })).toBe(
            "grow-image",
        );
        expect(
            pageFitAction({ ...fit, gap: 30, varieties: 8, imageHeight: 480 }),
        ).toBe("done");
    });

    it("does not regrow immediately after overflow", () => {
        expect(pageFitAction({ ...fit, gap: 30, previousGap: -30 })).toBe(
            "done",
        );
    });

    it.each([-8, 0, 8])("accepts a gap of %i pixels", (gap) => {
        expect(pageFitAction({ ...fit, gap })).toBe("done");
    });
});

describe("optional intro fitting", () => {
    const fit = {
        gap: 40,
        previousGap: null,
        extraSentences: 0,
        totalSentences: 2,
        sentenceCap: 12,
    };

    it("adds a sentence only with room and remaining content", () => {
        expect(introFitAction(fit)).toBe("grow");
        expect(introFitAction({ ...fit, gap: 8 })).toBe("done");
        expect(introFitAction({ ...fit, totalSentences: 12 })).toBe("done");
    });

    it("rolls back an overflowing addition, then stops", () => {
        expect(introFitAction({ ...fit, gap: -1, extraSentences: 1 })).toBe(
            "trim",
        );
        expect(introFitAction({ ...fit, previousGap: -1 })).toBe("done");
    });

    it("never removes the original intro to cure pre-existing overflow", () => {
        expect(introFitAction({ ...fit, gap: -100 })).toBe("done");
    });

    it("reserves padding, border and the PDF safety allowance", () => {
        expect(introContentBudget(978.89, 16, 1.5)).toBe(945);
        expect(introContentBudget(1200, 16, 1.5)).toBe(965);
    });
});

describe("page-two fitting", () => {
    it("trims overflow within its fixed range", () => {
        expect(nextPage2Trim(-30, null, 0)).toBe(1);
        expect(nextPage2Trim(-30, null, 6)).toBe(6);
        expect(nextPage2Trim(30, null, 0)).toBe(0);
    });

    it("restores one level but never oscillates after overflow", () => {
        expect(nextPage2Trim(30, null, 2)).toBe(1);
        expect(nextPage2Trim(30, -30, 2)).toBe(2);
        expect(nextPage2Trim(0, null, 2)).toBe(2);
    });
});
