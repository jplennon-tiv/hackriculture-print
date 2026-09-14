import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import {
    QUICK_FACT_ICON_KEYS,
    pickFinalTipIcon,
    quickFactIconPath,
} from "./quickFactIcons";

describe("quick fact icons", () => {
    it("uses the first specific action in a mixed, broadly tagged tip", () => {
        expect(
            pickFinalTipIcon(
                { icon: "soil" },
                "Weed young rows and earth stems up lightly for support.",
                0,
            ),
        ).toBe(quickFactIconPath("weeding"));
    });

    it.each(QUICK_FACT_ICON_KEYS)(
        "has a PNG and editable master for %s",
        (key) => {
            const path = quickFactIconPath(key);
            expect(path).toContain("/trial/");
            expect(existsSync(`public${path}`)).toBe(true);
            expect(existsSync(`public${path.replace(/\.png$/, ".svg")}`)).toBe(
                true,
            );
        },
    );

    it.each([
        ["sow", "Transplant seedlings after hardening off.", "planting"],
        ["sow", "Protect seedlings from frost with fleece.", "protection"],
        ["sow", "Tie plants to supporting canes.", "support"],
        ["sow", "Store seeds in a cool, dry place.", "seed_life"],
        ["harvest", "Store the harvest in a cool shed.", "storage"],
        ["soil", "Mulch to conserve moisture.", "mulching"],
        ["soil", "Hoe between rows to remove weeds.", "weeding"],
        ["water", "Water well after planting out.", "water"],
        ["planting", "Protect seedlings after transplanting.", "planting"],
        ["sow", "Sow seeds in shallow drills.", "sow"],
        ["sow", "Cover seeds lightly with compost.", "sow"],
        ["soil", "Cover the bed with compost.", "soil"],
    ])("refines %s for %s", (icon, text, expected) => {
        expect(pickFinalTipIcon({ icon }, text, 0)).toBe(
            quickFactIconPath(expected),
        );
    });

    it.each([
        ["Freeze surplus harvest.", "storage"],
        ["Plant cloves in autumn.", "planting"],
        ["Use a trellis for support.", "support"],
        ["Water during drought.", "water"],
        ["Apply fertiliser before sowing.", "feeding"],
    ])("recognises untagged context: %s", (text, expected) => {
        expect(pickFinalTipIcon({}, text, 0)).toBe(quickFactIconPath(expected));
    });

    it("preserves custom legacy keys and deterministic fallback", () => {
        expect(
            pickFinalTipIcon({ icon: " custom " }, "Mulch the soil.", 0),
        ).toBe("/images/quick_facts/custom.png");
        expect(pickFinalTipIcon(null, "A general tip.", 6)).toBe(
            quickFactIconPath("soil"),
        );
    });
});
