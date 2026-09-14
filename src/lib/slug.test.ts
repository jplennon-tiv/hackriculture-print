import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
    it("lower-cases and replaces non-alphanumerics with underscores", () => {
        expect(slugify("Brussels Sprouts")).toBe("brussels_sprouts");
        expect(slugify("Salsify & Scorzonera")).toBe("salsify_scorzonera");
    });
    it("collapses runs and trims leading/trailing underscores", () => {
        expect(slugify("  Marrow / Courgette  ")).toBe("marrow_courgette");
        expect(slugify("--Onion--")).toBe("onion");
    });
    it("handles numerics and already-slug input", () => {
        expect(slugify("10 ft row")).toBe("10_ft_row");
        expect(slugify("bean_runner")).toBe("bean_runner");
    });
});
