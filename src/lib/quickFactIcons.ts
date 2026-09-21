export const QUICK_FACT_ICON_KEYS = [
    "sow",
    "soil",
    "water",
    "feeding",
    "harvest",
    "depth",
    "germination",
    "ph",
    "plant_spacing",
    "ready_in",
    "row_spacing",
    "seed_life",
    "yield",
    "planting",
    "storage",
    "mulching",
    "weeding",
    "support",
    "protection",
] as const;

type QuickFactIconKey = (typeof QUICK_FACT_ICON_KEYS)[number];

export function quickFactIconPath(key: string): string {
    return QUICK_FACT_ICON_KEYS.includes(key as QuickFactIconKey)
        ? `/images/quick_facts/trial/${key}.png`
        : `/images/quick_facts/${key}.png`;
}

const CONTEXT_RULES: Array<[QuickFactIconKey, RegExp]> = [
    [
        "seed_life",
        /\b(seed (?:life|viability|storage)|stor(?:e|ed|ing) seeds?|seeds? (?:keep|remain viable))\b/i,
    ],
    ["storage", /\b(stor(?:e|ed|ing|age)|freez(?:e|ing)|refrigerat\w*)\b/i],
    ["protection", /\b(frost|fleece|cloches?|netting|protect\w*)\b/i],
    [
        "support",
        /\b(support\w*|stakes?|staking|trellis\w*|canes?|tie|tying)\b/i,
    ],
    ["mulching", /\b(mulch\w*|earth[ -]?up|earthing[ -]?up)\b/i],
    ["weeding", /\b(weeds?|weeding|hoe|hoeing)\b/i],
    [
        "planting",
        /\b(transplant\w*|plant(?:ing)? out|plant(?:ing)? (?:the )?(?:sets|cloves|tubers|crowns))\b/i,
    ],
];

const REFINEMENTS: Partial<
    Record<QuickFactIconKey, readonly QuickFactIconKey[]>
> = {
    sow: ["seed_life", "planting", "protection", "support"],
    soil: ["mulching", "weeding", "protection", "support"],
    harvest: ["storage"],
};

const GENERAL_RULES: Array<[QuickFactIconKey, RegExp]> = [
    [
        "harvest",
        /\b(harvest\w*|lift(?!ing time)\w*|pick\w*|pull(?:ed|ing)?|cut|yield|ready to)\b/i,
    ],
    ["water", /\b(water\w*|drought|moist\w*|damp|dry|irrigat\w*)\b/i],
    ["feeding", /\b(feed\w*|fertili[sz]\w*|potash|nitrogen|phosph\w*)\b/i],
    ["sow", /\b(sow\w*|seeds?|seedlings?|modules?|chit\w*)\b/i],
    [
        "soil",
        /\b(soil|compost|manur\w*|no.dig|dig\w*|beds?|acid\w*|alkalin\w*|lime)\b/i,
    ],
];

export function pickFinalTipIcon(
    item: unknown,
    text: string,
    _fallbackIdx: number,
    exact = false,
): string | undefined {
    const explicit =
        item && typeof item === "object"
            ? (item as { icon?: unknown }).icon
            : undefined;
    if (typeof explicit === "string" && explicit.trim()) {
        const key = explicit.trim();
        if (exact) return quickFactIconPath(key);
        const refinements = REFINEMENTS[key as QuickFactIconKey];
        const context = CONTEXT_RULES.filter(([candidate]) =>
            refinements?.includes(candidate),
        )
            .map(([candidate, pattern]) => ({
                key: candidate,
                index: text.search(pattern),
            }))
            .filter((match) => match.index >= 0)
            .sort((first, second) => first.index - second.index)[0];
        return quickFactIconPath(context?.key ?? key);
    }
    const match = [...CONTEXT_RULES, ...GENERAL_RULES].find(([, pattern]) =>
        pattern.test(text),
    );
    return match ? quickFactIconPath(match[0]) : undefined;
}
