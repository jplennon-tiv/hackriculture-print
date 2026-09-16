import { useParams, useSearchParams } from "react-router-dom";
import vegetablesJson from "../../../hackriculture-data/vegetables.json";
import troublesJson from "../../../hackriculture-data/troubles.json";
import palettesJson from "./vegetable_palettes.json";
import heroImageCropsJson from "./heroImageCrops.json";
import type { GardeningData, TroublesData, Vegetable } from "../types";
import { slugify } from "../lib/slug";
import { rt, isStar } from "../lib/ranked";
import { toStr } from "../lib/varietyKeyed";
import { resolveMeasurement } from "../lib/measure";
import type { UnitSystem } from "../lib/measure";
import { CORE_NEED_DEFS } from "../components/CoreNeeds";
import { MONTH_SHORT, MONTH_INITIALS, expandMonths } from "../lib/months";
import {
    yieldFact,
    timeToHarvestSummary,
    durationFactSummary,
} from "../lib/facts";
import styles from "./print.module.css";
import { useVegetableLayout } from "./useVegetableLayout";
import { quickFactIconPath, pickFinalTipIcon } from "../lib/quickFactIcons";
import { resolvePlanting } from './plantingIllustrations';
import { readPlantingSource } from '../lib/planting';
import { PlantingCard } from './PlantingCard';

const data = vegetablesJson as unknown as GardeningData;
const troublesData = troublesJson as unknown as TroublesData;
const heroImageCrops: Record<
    string,
    {
        src: string;
        width: number;
        height: number;
        originalWidth: number;
        originalHeight: number;
    }
> = heroImageCropsJson;

type Palette = {
    pageBackground: string;
    highlight: string;
    tableHighlight: string;
    tableHeader: string;
};
const palettes = palettesJson as Record<string, Palette>;
const DEFAULT_PALETTE: Palette = palettes["Root Crops"];

const QF_ICONS: Record<string, string> = {
    Sow: quickFactIconPath("sow"),
    Harvest: quickFactIconPath("harvest"),
    Germination: quickFactIconPath("germination"),
    Depth: quickFactIconPath("depth"),
    "Row spacing": quickFactIconPath("row_spacing"),
    "Plant spacing": quickFactIconPath("plant_spacing"),
    Yield: quickFactIconPath("yield"),
    "Ready in": quickFactIconPath("ready_in"),
    "Seed life": quickFactIconPath("seed_life"),
    Soil: quickFactIconPath("soil"),
    Feeding: quickFactIconPath("feeding"),
    Water: quickFactIconPath("water"),
    pH: quickFactIconPath("ph"),
};

const P = "/images/key_risks/";
const RISK_ICONS: Record<string, string> = {
    // Aphids
    Aphid: P + "aphid.png",
    "Aphid (Greenfly)": P + "aphid.png",
    Aphids: P + "aphid.png",
    "Black Bean Aphid": P + "aphid.png",
    "Mealy Aphid": P + "aphid.png",
    "Pea Aphid": P + "aphid.png",
    "Carrot-Willow Aphid": P + "aphid.png",
    "Root Aphid": P + "aphid.png",
    // Flies & leaf miners
    "Carrot Fly": P + "fly.png",
    "Cabbage Root Fly": P + "fly.png",
    "Cabbage Root Fly on Leaf Radish": P + "fly.png",
    "Bean Seed Fly": P + "fly.png",
    "Onion Fly": P + "fly.png",
    "Allium Leaf Miner": P + "fly.png",
    "Celery Fly (Leaf Miner)": P + "fly.png",
    "Mangold Fly (Leaf Miner)": P + "fly.png",
    "Swede Midge": P + "fly.png",
    // Caterpillars & moths
    Caterpillars: P + "caterpillar.png",
    "Cabbage Caterpillars": P + "caterpillar.png",
    "Diamond-back Moth": P + "caterpillar.png",
    "Tomato Moth": P + "caterpillar.png",
    "Pea Moth": P + "caterpillar.png",
    "Leek Moth": P + "caterpillar.png",
    "Rosy Rustic Moth": P + "caterpillar.png",
    "Swift Moth": P + "caterpillar.png",
    "Vine Borer": P + "caterpillar.png",
    // Beetles & weevils
    "Flea Beetle": P + "beetle.png",
    "Cabbage Stem Flea Beetle": P + "beetle.png",
    "Colorado Beetle": P + "beetle.png",
    "Seed Beetle": P + "beetle.png",
    "Gall Weevil": P + "beetle.png",
    "Pea and Bean Weevil": P + "beetle.png",
    "Capsid Bug": P + "beetle.png",
    // Whitefly
    "Cabbage Whitefly": P + "whitefly.png",
    "Greenhouse Whitefly": P + "whitefly.png",
    // Mites
    "Red Spider Mite": P + "spider_mite.png",
    // Slugs
    Slugs: P + "slug.png",
    "Slugs and Snails": P + "slug.png",
    // Soil pests
    Eelworm: P + "soil_grub.png",
    "Potato Cyst Eelworm": P + "soil_grub.png",
    "Stem & Bulb Eelworm": P + "soil_grub.png",
    Wireworm: P + "soil_grub.png",
    "Chafer Grubs": P + "soil_grub.png",
    Cutworm: P + "soil_grub.png",
    "Lettuce Root Maggot": P + "soil_grub.png",
    "Pea Thrips": P + "soil_grub.png",
    // Birds
    Pigeons: P + "bird.png",
    Birds: P + "bird.png",
    "Bird Damage": P + "bird.png",
    "Birds Pulling Sets": P + "bird.png",
    // Mice
    Mice: P + "mouse.png",
    // Grey mould & rots
    "Grey Mould (Botrytis)": P + "grey_mould.png",
    "Sclerotinia Rot": P + "grey_mould.png",
    "Soft Rot": P + "grey_mould.png",
    "Neck Rot": P + "grey_mould.png",
    Shanking: P + "grey_mould.png",
    "White Rot (Mouldy Nose)": P + "grey_mould.png",
    "White Tip": P + "grey_mould.png",
    Gummosis: P + "grey_mould.png",
    "Heart Rot": P + "grey_mould.png",
    "Celery Heart Rot": P + "grey_mould.png",
    "Stem Rot": P + "grey_mould.png",
    "Stem Rot (Didymella)": P + "grey_mould.png",
    "Basal Stem Rot": P + "grey_mould.png",
    "Foot Rot": P + "grey_mould.png",
    "Foot Rot and Root Rot": P + "root_rot.png",
    "Storage Rot from Stem Damage": P + "grey_mould.png",
    // Powdery/downy mildew
    "Powdery Mildew": P + "powdery_mildew.png",
    "Downy Mildew": P + "powdery_mildew.png",
    "White Blister (White Rust)": P + "powdery_mildew.png",
    // Rust & spots
    Rust: P + "rust_spots.png",
    "Parsnip Rust Fungus": P + "rust_spots.png",
    "Chocolate Spot": P + "rust_spots.png",
    // Leaf spot
    "Leaf Spot": P + "leaf_spot.png",
    "Leaf Spot (Ring Spot)": P + "leaf_spot.png",
    "Ring Spot": P + "leaf_spot.png",
    Anthracnose: P + "leaf_spot.png",
    "Anthracnose (Leaf Spot)": P + "leaf_spot.png",
    "Anthracnose on Fruit": P + "leaf_spot.png",
    "Leaf and Pod Spot": P + "leaf_spot.png",
    Blotch: P + "leaf_spot.png",
    "Celery Leaf Spot (Blight)": P + "leaf_spot.png",
    Smut: P + "leaf_spot.png",
    "Tomato Leaf Mould": P + "leaf_spot.png",
    // Club root
    "Club Root (Finger and Toe)": P + "club_root.png",
    // Blight
    "Potato Blight": P + "blight.png",
    "Buckeye Rot": P + "blight.png",
    "Black Rot": P + "blight.png",
    "Fusarium Wilt": P + "blight.png",
    "Verticillium Wilt": P + "blight.png",
    Blackleg: P + "blight.png",
    // Damping off / collar rot
    "Damping Off": P + "damping_off.png",
    "Wire Stem": P + "damping_off.png",
    Saddleback: P + "damping_off.png",
    // Root rot
    "Root Rot": P + "root_rot.png",
    "Violet Root Rot": P + "root_rot.png",
    "Autumnal Fungal Root Rots": P + "root_rot.png",
    "Dry Rot": P + "root_rot.png",
    Gangrene: P + "root_rot.png",
    "Parsnip Canker": P + "root_rot.png",
    // Scab
    "Common Scab": P + "root_rot.png",
    "Powdery Scab": P + "root_rot.png",
    "Wart Disease": P + "root_rot.png",
    // Virus
    Virus: P + "virus_leaf.png",
    "Mosaic Virus": P + "virus_leaf.png",
    "Cucumber Mosaic Virus": P + "virus_leaf.png",
    "Cucumber Mosaic Virus on Fruit": P + "virus_leaf.png",
    "Turnip Mosaic Virus": P + "virus_leaf.png",
    "Leaf Roll Virus": P + "virus_leaf.png",
    "Motley Dwarf Virus": P + "virus_leaf.png",
    "Spinach Blight": P + "virus_leaf.png",
    // Deficiency
    "Magnesium Deficiency": P + "deficiency.png",
    "Manganese Deficiency": P + "deficiency.png",
    "Boron Deficiency": P + "deficiency.png",
    "Boron Deficiency / Brown Heart": P + "deficiency.png",
    "Speckled Yellows": P + "deficiency.png",
    Whiptail: P + "deficiency.png",
    // Bolting
    Bolting: P + "bolting.png",
    "Bolting / Premature Flowering": P + "bolting.png",
    "Bolting / Stemmy Bulbs": P + "bolting.png",
    "Bolting Winter Radish": P + "bolting.png",
    // Frost
    Frost: P + "frost.png",
    "Frost Damage": P + "frost.png",
    "Frost and Winter Decline": P + "frost.png",
    "New Zealand Spinach Frost Damage": P + "frost.png",
    // Forked / malformed roots
    Fanging: P + "forked_root.png",
    "Green Top": P + "forked_root.png",
    "Checked Growth / Poor Root Quality": P + "forked_root.png",
    "Small Roots": P + "forked_root.png",
    "Woody Kohl Rabi": P + "forked_root.png",
    "Woody, Hollow or Soft Radish Roots": P + "forked_root.png",
    // Splitting
    Splitting: P + "splitting.png",
    "Split Fruit": P + "splitting.png",
    "Split Hearts": P + "splitting.png",
    // Hollow
    "Hollow Heart": P + "hollow_root.png",
    "Hollow Fruit": P + "hollow_root.png",
    // Poor germination
    "Old Seed / Poor Germination": P + "poor_germination.png",
    Gapping: P + "poor_germination.png",
    "Drooping Leaves": P + "poor_germination.png",
    // Blossom / fruit set
    "Blossom Drop": P + "blossom_drop.png",
    "No Flowers": P + "blossom_drop.png",
    "No Fruit": P + "blossom_drop.png",
    "No Pods": P + "blossom_drop.png",
    "Dry Set": P + "blossom_drop.png",
    "Withering of Young Fruit": P + "blossom_drop.png",
    "Under-ripe Squash and Pumpkin Fruit": P + "blossom_drop.png",
    "Blotchy Ripening": P + "blossom_drop.png",
    Greenback: P + "blossom_drop.png",
    // Blossom end rot
    "Blossom End Rot": P + "blossom_end_rot.png",
    "Ghost Spot": P + "blossom_end_rot.png",
    // Sun scald
    "Sun Scald": P + "sun_scald.png",
    // Tipburn
    Tipburn: P + "tipburn.png",
    "Marsh Spot": P + "tipburn.png",
    // Distorted / other
    "Hormone Damage": P + "virus_leaf.png",
    "Leaf Roll": P + "virus_leaf.png",
    "Button Cauliflowers": P + "poor_germination.png",
    "Blown Brussels Sprouts": P + "poor_germination.png",
    "Heartless Cabbages": P + "poor_germination.png",
    "No Hearts": P + "poor_germination.png",
    "Dryness and Poor Hearting": P + "poor_germination.png",
    "Dry Soil / Checked Growth": P + "poor_germination.png",
    "Bull Neck (Thick Neck)": P + "poor_germination.png",
    "Poor Quality": P + "poor_germination.png",
    "Poor Yield": P + "poor_germination.png",
    "Set Division": P + "poor_germination.png",
    "Soft Tubers": P + "poor_germination.png",
    Bitterness: P + "poor_germination.png",
    Clayburn: P + "forked_root.png",
    Spraing: P + "forked_root.png",
    "Spindly Sprouts": P + "forked_root.png",
    "Root Disturbance in Pak Choi": P + "forked_root.png",
    // ── Entries added to cover ALL inline trouble names ───────────────────────
    // Flies & leaf miners (additional names)
    "CARROT ROOT FLY": P + "fly.png",
    "CELERY FLY": P + "fly.png",
    "LEAF MINER": P + "fly.png",
    "FRIT FLY": P + "fly.png",
    // Beetles & weevils
    "ASPARAGUS BEETLE": P + "beetle.png",
    "RHUBARB CURCULIO": P + "beetle.png",
    // Caterpillars
    "PEA MOTH / CATERPILLARS": P + "caterpillar.png",
    // Birds & animals
    "BIRDS AND ANIMALS": P + "bird.png",
    "BIRDS AND CATERPILLARS": P + "bird.png",
    "BIRDS OR FROST LIFTING CLOVES": P + "bird.png",
    BADGERS: P + "mouse.png",
    // Slugs & woodlice
    "SLUGS AND WOODLICE": P + "slug.png",
    "SLUGS UNDER FORCING POTS": P + "slug.png",
    WOODLICE: P + "soil_grub.png",
    // Soil pests (generic)
    CUTWORMS: P + "soil_grub.png",
    PESTS: P + "soil_grub.png",
    "SOIL PESTS": P + "soil_grub.png",
    // Aphids & whitefly combos
    "APHIDS AND WHITEFLY": P + "aphid.png",
    WHITEFLY: P + "whitefly.png",
    // Mildew & powdery
    MILDEW: P + "powdery_mildew.png",
    "MOULD OR DOWNY MILDEW": P + "powdery_mildew.png",
    "WHITE BLISTER": P + "powdery_mildew.png",
    // Moulds & rots (grey mould group)
    BOTRYTIS: P + "grey_mould.png",
    MOULD: P + "grey_mould.png",
    "LOWER SHEATH ROT": P + "grey_mould.png",
    ROTTING: P + "grey_mould.png",
    "STORAGE ROTS": P + "grey_mould.png",
    "POOR STORAGE": P + "grey_mould.png",
    "WHITE ROT": P + "grey_mould.png",
    // Stem & fruit rots (new icon — stem_rot.png)
    "STEM AND FRUIT ROTS": P + "stem_rot.png",
    "STEM DAMAGE AND ROT": P + "stem_rot.png",
    "FRUIT ROT": P + "stem_rot.png",
    "GROUND ROT": P + "stem_rot.png",
    // Root rots & canker
    CANKER: P + "root_rot.png",
    "CROWN ROT": P + "root_rot.png",
    "HONEY FUNGUS": P + "root_rot.png",
    SCAB: P + "root_rot.png",
    // Fungal leaf spots
    "ARTICHOKE LEAF SPOT": P + "leaf_spot.png",
    "FUNGAL LEAF SPOTS": P + "leaf_spot.png",
    "RUST FUNGUS": P + "rust_spots.png",
    // Blight & wilt (generic)
    BLIGHT: P + "blight.png",
    "BEAN DISEASE": P + "blight.png",
    DISEASES: P + "blight.png",
    "HALO BLIGHT": P + "blight.png",
    "PETAL BLIGHT": P + "blight.png",
    "VERTICILLIUM WILT AND PHYTOPHTHORA BLIGHT": P + "blight.png",
    "MOSAIC DISEASE": P + "virus_leaf.png",
    // Club root
    "CLUB ROOT": P + "club_root.png",
    // Deficiency & soil
    "ACID SOIL": P + "deficiency.png",
    "GENERAL HEALTH": P + "deficiency.png",
    "POOR GROWTH OR STRINGY STEMS": P + "deficiency.png",
    // Bolting / premature flowering
    "BOLTING OR STEMMY BULBS": P + "bolting.png",
    FLOWERING: P + "bolting.png",
    // Cold & warmth (new icon — thermometer.png)
    "LACK OF WARMTH": P + "thermometer.png",
    "COLD CHECK": P + "thermometer.png",
    "COLD SPRINGS": P + "thermometer.png",
    // Frost
    "NEW ZEALAND SPINACH FROST": P + "frost.png",
    // Forked / distorted roots
    "FORKED ROOTS": P + "forked_root.png",
    FORKING: P + "forked_root.png",
    "ROOT DISTURBANCE": P + "forked_root.png",
    "SNAPPED ROOTS": P + "forked_root.png",
    // Hollow / woody roots
    "HOLLOW OR HOLED ROOTS": P + "hollow_root.png",
    "WOODY OR HOLLOW ROOTS": P + "hollow_root.png",
    "WOODY ROOTS": P + "hollow_root.png",
    // Splitting / dryness
    "DRYNESS AND CHECKS": P + "splitting.png",
    // Poor germination / development
    "BLIND PLANTS": P + "poor_germination.png",
    "BLOWN SPROUTS": P + "poor_germination.png",
    BUTTONING: P + "poor_germination.png",
    "FEW REGULAR PROBLEMS": P + "poor_germination.png",
    "POOR GERMINATION": P + "poor_germination.png",
    "QUALITY PROBLEMS": P + "poor_germination.png",
    "SMALL OR DRY BULBS": P + "poor_germination.png",
    "SPINDLY SPEARS": P + "poor_germination.png",
    // Blossom / fruit set
    "CROSS POLLINATION": P + "blossom_drop.png",
    "POOR FRUIT SET": P + "blossom_drop.png",
    "POOR POLLINATION": P + "blossom_drop.png",
    "SOFT UNDERRIPE FRUIT": P + "blossom_drop.png",
    // Weeds (new icon — weed.png)
    "PERENNIAL WEEDS": P + "weed.png",
    // Wind (new icon — wind.png)
    "WIND ROCK": P + "wind.png",
};

// Case-insensitive lookup — inline troubles use ALL CAPS keys, troubles.json uses Title Case
const RISK_ICONS_LOWER: Record<string, string> = Object.fromEntries(
    Object.entries(RISK_ICONS).map(([k, v]) => [k.toLowerCase(), v]),
);
function getRiskIcon(name: string): string | undefined {
    return RISK_ICONS[name] ?? RISK_ICONS_LOWER[name.toLowerCase()];
}

function rankVal(v: unknown): number {
    if (typeof v === "object" && v !== null && "rank" in v)
        return (v as { rank?: number }).rank ?? 5;
    return 5;
}

function listItems(arr: unknown[] | null | undefined): unknown[] {
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => rt(x).trim());
}

function smartTrim(items: unknown[], max: number, minRank = 7): unknown[] {
    if (items.length <= max) return items;
    const filtered = items.filter((i) => isStar(i) || rankVal(i) >= minRank);
    if (filtered.length >= 3 && filtered.length <= max) return filtered;
    if (filtered.length > max) return filtered.slice(0, max);
    return items.slice(0, max);
}

function firstSentence(text: string): string {
    const m = text.match(/^[^.!?]+[.!?]/);
    return m ? m[0] : text.slice(0, 80) + (text.length > 80 ? "…" : "");
}

function countSentences(text: string): number {
    const m = text.match(/[.!?]+(?:\s|$)/g);
    return m ? m.length : 1;
}

function firstNSentences(text: string, n: number): string {
    const re = /[.!?]+(?:\s+|$)/g;
    let count = 0;
    let lastIdx = text.length;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        count++;
        if (count >= n) {
            lastIdx = m.index + m[0].trimEnd().length;
            break;
        }
    }
    return text.slice(0, lastIdx).trim();
}

function formatMonthRange(ranges: string[]): string {
    const all = expandMonths(ranges, { wrap: true });
    if (!all.size) return "—";
    const sorted = Array.from(all).sort((a, b) => a - b);
    return `${MONTH_SHORT[sorted[0]]} – ${MONTH_SHORT[sorted[sorted.length - 1]]}`;
}

function difficultyInfo(
    d: number | null | undefined,
    categoryColour: string,
): { label: string; bg: string } {
    // 5-level scale — badge always uses the page's category colour
    const bg = categoryColour;
    if (!d || d <= 1) return { label: "Easy", bg };
    if (d === 2) return { label: "Not Difficult", bg };
    if (d === 3) return { label: "Not Easy", bg };
    if (d === 4) return { label: "Tricky", bg };
    return { label: "Difficult", bg };
}

/** Map harvest months to season names, in calendar order. */
function getHarvestSeasons(ranges: string[]): string[] {
    const months = expandMonths(ranges, { wrap: true });
    const seasons = new Set<string>();
    for (const m of months) {
        if (m >= 2 && m <= 4) seasons.add("Spring");
        else if (m >= 5 && m <= 7) seasons.add("Summer");
        else if (m >= 8 && m <= 10) seasons.add("Autumn");
        else seasons.add("Winter");
    }
    const ORDER = ["Spring", "Summer", "Autumn", "Winter"];
    return [...seasons].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
}

/** Flatten nested or flat variety structures into a uniform list. */
interface VarietyEntry {
    type: string;
    name: string;
    text: string;
    short_text?: string;
    rank: number;
}

// ── Variety type label translations ──────────────────────────────────────────
// Maps raw JSON group keys (snake_case) to clean display labels.
// Keys not in this map fall back to title-cased, suffix-stripped versions.
const VARIETY_TYPE_LABELS: Record<string, string> = {
    all_female_varieties: "All Female",
    ordinary_varieties: "Ordinary",
    beefsteak_varieties: "Beefsteak",
    f1_hybrid_varieties: "F1 Hybrid",
    trench_varieties: "Trench",
    self_blanching_varieties: "Self Blanching",
    celery_leaf: "Celery Leaf",
    shop_bought_softneck: "Shop-Bought Softneck",
    standard_ridge_varieties: "Standard Ridge",
    japanese_varieties: "Japanese",
    gherkin_varieties: "Gherkin",
    apple_varieties: "Apple",
    first_early_varieties: "First Early",
    second_early_varieties: "Second Early",
    maincrop_varieties: "Maincrop",
    spring_summer_varieties: "Spring/Summer",
    winter_varieties: "Winter",
    summer_varieties: "Summer",
    early_varieties: "Early",
    traditional_varieties: "Traditional",
    supersweet_varieties: "Supersweet",
    recommended_modern_varieties: "Modern",
    novelty_varieties: "Novelty",
    flavour_varieties: "Flavour",
    cordon_varieties: "Cordon",
    bush_varieties: "Bush",
    new_zealand_variety: "New Zealand",
    leaf_and_dual_purpose: "Leaf & Dual-Purpose",
    book3_indoor_tall_varieties: "Tall",
    book3_outdoor_bush_varieties: "Outdoor Bush",
    // suppress meta/notes keys — no display label
    categories_from_organic_gardening: "",
    leaf_and_heart_varieties_from_organic_gardening: "Leaf & Heart",
    supersweet_and_baby_corn_notes: "",
    book3_outdoor_tall_notes: "",
    additional_flavour_notes: "",
};

function flattenVarieties(varieties: Record<string, unknown>): VarietyEntry[] {
    const result: VarietyEntry[] = [];
    // Keys that indicate a garlic-style metadata group (outer key = variety name)
    const META_KEYS = new Set([
        "type",
        "character",
        "flavour",
        "sow_or_plant",
        "spacing_cm",
        "height_cm",
        "harvest",
        "special_care",
        "general",
    ]);

    for (const [key, val] of Object.entries(varieties)) {
        if (
            key === "overview" ||
            key === "types" ||
            key === "general" ||
            typeof val !== "object" ||
            val === null
        )
            continue;
        const obj = val as Record<string, unknown>;

        if ("text" in obj && typeof obj.text === "string") {
            // Flat variety entry
            result.push({
                type: "",
                name: key,
                text: obj.text,
                short_text:
                    typeof obj.short_text === "string"
                        ? obj.short_text
                        : undefined,
                rank: typeof obj.rank === "number" ? obj.rank : 5,
            });
        } else {
            // Check if this is a garlic-style group where sub-keys are attribute fields
            const innerKeys = Object.keys(obj);
            const metaCount = innerKeys.filter((k) => META_KEYS.has(k)).length;
            const isMeta = metaCount >= 2;

            if (isMeta) {
                // Outer key IS the variety name; build entry from character/type sub-fields
                const charObj = obj.character as
                    | Record<string, unknown>
                    | undefined;
                const typeObj = obj.type as Record<string, unknown> | undefined;
                const desc =
                    (charObj?.text as string) ||
                    (typeObj?.text as string) ||
                    "";
                const typeName = (typeObj?.text as string) || "";
                if (desc) {
                    result.push({
                        type: typeName,
                        name: key,
                        text: desc,
                        short_text: undefined,
                        rank:
                            typeof charObj?.rank === "number"
                                ? (charObj.rank as number)
                                : 5,
                    });
                }
                continue;
            }

            // Nested group — derive a short display type from the group key
            const displayType =
                key in VARIETY_TYPE_LABELS
                    ? VARIETY_TYPE_LABELS[key]
                    : key
                          .replace(/\s+varieties?\b/gi, "")
                          .replace(/\s+types?\b/gi, "")
                          .trim()
                          .toLowerCase()
                          .replace(/\b\w/g, (c) => c.toUpperCase());

            for (const [varKey, varVal] of Object.entries(obj)) {
                if (varKey === "overview" || varKey === "other_names") continue;
                if (typeof varVal !== "object" || varVal === null) continue;
                const varObj = varVal as Record<string, unknown>;

                if ("text" in varObj && typeof varObj.text === "string") {
                    result.push({
                        type: displayType,
                        name: varKey,
                        text: varObj.text,
                        short_text:
                            typeof varObj.short_text === "string"
                                ? varObj.short_text
                                : undefined,
                        rank: typeof varObj.rank === "number" ? varObj.rank : 5,
                    });
                }
            }
        }
    }
    return result;
}

// ── Core Needs widget — icons + defs shared with the public page ────────────
export function PrintVegetablePage() {
    const { slug } = useParams<{ slug: string }>();
    const [searchParams] = useSearchParams();
    const system: UnitSystem =
        searchParams.get("units") === "metric" ? "metric" : "imperial";
    const key =
        Object.keys(data).find((k) => slugify(data[k].name ?? k) === slug) ??
        slug ??
        "";
    const veg = data[key];

    if (!veg) return <p>Vegetable "{slug}" not found.</p>;

    return (
        <VegetablePrintSheet
            key={`${key}:${system}:${JSON.stringify(veg)}`}
            veg={veg}
            vegetableKey={key}
            system={system}
        />
    );
}

function VegetablePrintSheet({
    veg,
    vegetableKey: key,
    system,
}: {
    veg: Vegetable;
    vegetableKey: string;
    system: UnitSystem;
}) {
    const name = veg.name ?? key;
    const planting=resolvePlanting(veg,key,system);

    const rawVarieties = veg.varieties;
    const allVarietyEntries: VarietyEntry[] =
        rawVarieties && typeof rawVarieties === "object"
            ? flattenVarieties(rawVarieties as Record<string, unknown>)
            : [];
    const varietyPool = (() => {
        const sorted = [...allVarietyEntries].sort((a, b) => b.rank - a.rank);
        const highRank = sorted.filter((entry) => entry.rank >= 6);
        return highRank.length >= 4 ? highRank : sorted;
    })();
    const {
        introSentenceCount,
        varCount,
        imgMaxHeight,
        p2TrimLevel,
        plantingActive,plantingFit,onPlantingAssets,
        page1Ref,
        page1SentinelRef,
        page2Ref,
        page2SentinelRef,
        introWrapperRef,
        introSentinelRef,
        heroImgRef,
        introParaRef,
    } = useVegetableLayout(
        countSentences(veg.introduction ?? ""),
        varietyPool.length,
        true,
        planting?{...planting.layout,optionalNoteCount:planting.content.optional_note_paths.length,issue:planting.issue}:null,
    );
    const keyRisksCount = 4;

    // ── Category colour palette ───────────────────────────────────────────────
    const palette: Palette =
        palettes[(veg as unknown as { category?: string }).category ?? ""] ??
        DEFAULT_PALETTE;

    const diff = difficultyInfo(veg.difficulty, palette.highlight);

    // ── Calendar ──────────────────────────────────────────────────────────────
    const cal = veg.calendar;
    // For vegetables sown under glass (e.g. Celeriac), most_popular may be empty
    // while indoors_under_glass has the real sowing months — use it as fallback.
    const sowPopular = cal?.sowing_time?.most_popular?.length
        ? cal.sowing_time.most_popular
        : (cal?.sowing_time?.indoors_under_glass ?? []);
    const sowMain = expandMonths(sowPopular, { wrap: true });
    const sowLess = expandMonths(cal?.sowing_time?.less_usual ?? [], {
        wrap: true,
    });
    const harMain = expandMonths(cal?.harvest_time?.most_popular ?? [], {
        wrap: true,
    });
    const harLess = expandMonths(cal?.harvest_time?.less_usual ?? [], {
        wrap: true,
    });
    const hasCalendar = sowMain.size > 0 || harMain.size > 0;

    const calRows: Array<{
        label: string;
        main: Set<number>;
        less: Set<number>;
    }> = [];
    if (sowMain.size > 0 || sowLess.size > 0)
        calRows.push({ label: "SOW", main: sowMain, less: sowLess });
    // CLOCHE row omitted — data preserved in JSON but saves calendar height
    if (harMain.size > 0 || harLess.size > 0)
        calRows.push({ label: "HARVEST", main: harMain, less: harLess });

    // ── Quick facts ───────────────────────────────────────────────────────────
    const facts = (veg.seed_and_growing_facts ?? {}) as Record<string, unknown>;
    const sfStr = (k: string) =>
        typeof facts[k] === "string" ? (facts[k] as string) : null;
    const sowRange = formatMonthRange(sowPopular);
    const harRange = formatMonthRange(cal?.harvest_time?.most_popular ?? []);

    const sowing = (veg.sowing_and_planting ?? null) as Record<
        string,
        unknown
    > | null;
    const sowingDepth =
        resolveMeasurement(sowing?.sowing_depth, system) ??
        resolveMeasurement(sowing?.planting_depth, system);
    const sowingMethodFull = toStr(sowing?.method);
    // Prose is truncated by sentence as p2TrimLevel rises — biggest lever for long-sowing overflow.
    const sowingMethod = sowingMethodFull
        ? firstNSentences(sowingMethodFull, Math.max(2, 5 - p2TrimLevel))
        : undefined;
    const sowingRowSpacing = resolveMeasurement(sowing?.row_spacing, system);
    const sowingPlantSpacing = resolveMeasurement(
        sowing?.plant_spacing,
        system,
    );

    const quickFacts: Array<{
        label: string;
        value: string;
        iconKey?: string;
    }> = [];
    if (sowRange !== "—") quickFacts.push({ label: "Sow", value: sowRange });
    if (harRange !== "—")
        quickFacts.push({ label: "Harvest", value: harRange });
    const germ =
        durationFactSummary(facts, "expected_germination_time") ??
        durationFactSummary(facts, "time_between_planting_and_sprouting") ??
        sfStr("germination_period");
    if (germ) quickFacts.push({ label: "Germination", value: germ });
    if (sowingDepth) quickFacts.push({ label: "Depth", value: sowingDepth });
    if (sowingRowSpacing)
        quickFacts.push({ label: "Row spacing", value: sowingRowSpacing });
    if (sowingPlantSpacing)
        quickFacts.push({ label: "Plant spacing", value: sowingPlantSpacing });
    const yf = yieldFact(veg.yield, system);
    if (yf)
        quickFacts.push({
            label: yf.label,
            value: yf.value,
            iconKey: "Yield",
        });
    const readyInVal = timeToHarvestSummary(veg.time_to_harvest);
    if (readyInVal) quickFacts.push({ label: "Ready in", value: readyInVal });

    const coreNeeds = veg.core_needs ?? null;

    // ── Inline troubles ───────────────────────────────────────────────────────
    const troubles = veg.troubles ?? null;
    const inlineTroubleEntries: Array<[string, unknown]> = troubles
        ? Object.entries(troubles).filter(
              ([k, v]) =>
                  k !== "_note" &&
                  k !== "_redirect" &&
                  v != null &&
                  v !== "" &&
                  typeof v === "object" &&
                  "text" in (v as object),
          )
        : [];

    // Top up from troubles_detail groups (troubles.json) when inline is thin.
    // Dedupe against inline AND against earlier fallback rows by a normalized
    // name — strip the vegetable name prefix ("Potato Blight" ↔ "Blight") and
    // trailing digits so data-side dupes like "potato_blight" + "potato_blight_2"
    // collapse to one row.
    const vegNameNorm = (name || "").toLowerCase().trim();
    const normTroubleName = (raw: string): string => {
        let n = raw
            .toLowerCase()
            .replace(/\s+/g, " ")
            .replace(/_/g, " ")
            .trim();
        n = n.replace(/\s*\d+$/, "");
        if (vegNameNorm && n.startsWith(vegNameNorm + " ")) {
            n = n.slice(vegNameNorm.length + 1);
        }
        return n;
    };
    const seenTroubleNames = new Set(
        inlineTroubleEntries.map(([k]) => normTroubleName(k)),
    );
    const fallbackTroubleEntries: Array<[string, unknown]> = [];
    const detailKeysForPests = veg.troubles_detail;
    if (detailKeysForPests?.length) {
        for (const groupKey of detailKeysForPests) {
            const group = troublesData[groupKey as string];
            if (!group?.conditions) continue;
            for (const cond of Object.values(group.conditions)) {
                if (!cond?.name || !cond?.description) continue;
                const key = normTroubleName(cond.name);
                if (seenTroubleNames.has(key)) continue;
                seenTroubleNames.add(key);
                const signs = firstSentence(cond.description);
                const treatment =
                    cond.treatment && cond.treatment !== "None."
                        ? cond.treatment
                        : "";
                const control = treatment || cond.prevention || "";
                fallbackTroubleEntries.push([
                    cond.name,
                    {
                        text: cond.description,
                        signs,
                        control,
                        rank: cond.rank ?? 5,
                    },
                ]);
            }
        }
    }

    const troubleEntries = [
        ...[...inlineTroubleEntries].sort(
            (a, b) => rankVal(b[1]) - rankVal(a[1]),
        ),
        ...[...fallbackTroubleEntries].sort(
            (a, b) => rankVal(b[1]) - rankVal(a[1]),
        ),
    ].slice(0, Math.max(3, 10 - p2TrimLevel));

    // KEY RISKS — top 4 by rank; inline troubles first, then troubles_detail groups
    // Build the full sorted key-risk pool; slice to keyRisksCount in render
    const allKeyRisksPool: Array<{ name: string; text: string }> = (() => {
        if (troubleEntries.length > 0) {
            return [...troubleEntries]
                .sort((a, b) => rankVal(b[1]) - rankVal(a[1]))
                .map(([k, v]) => ({ name: k, text: rt(v) }));
        }
        // Fall back to troubles_detail groups from troubles.json
        const detailKeys = veg.troubles_detail;
        if (!detailKeys?.length) return [];
        const conditions: Array<{ name: string; text: string; rank: number }> =
            [];
        for (const groupKey of detailKeys) {
            const group = troublesData[groupKey as string];
            if (!group?.conditions) continue;
            for (const cond of Object.values(group.conditions)) {
                if (cond.name && cond.description) {
                    conditions.push({
                        name: cond.name,
                        text: cond.description,
                        rank: cond.rank ?? 5,
                    });
                }
            }
        }
        return conditions
            .sort((a, b) => b.rank - a.rank)
            .map(({ name, text }) => ({ name, text }));
    })();
    const keyRisks = allKeyRisksPool.slice(0, keyRisksCount);

    // ── Recommended varieties ─────────────────────────────────────────────────
    const topVarieties = varietyPool.slice(0, varCount);

    // ── Content lists for page 2 ──────────────────────────────────────────────
    // Caps shrink with p2TrimLevel to absorb a taller-than-usual page 2 header.
    const t = p2TrimLevel;
    const soilItems = smartTrim(
        listItems(veg.soil_facts as unknown[]),
        Math.max(2, 6 - t),
    );
    const careItems = smartTrim(
        listItems(veg.looking_after_the_crop as unknown[]),
        Math.max(3, 8 - t),
    );
    const harvestItems = smartTrim(
        listItems(veg.harvesting as unknown[]),
        Math.max(2, 6 - t),
    );
    const sowingNotes = smartTrim(
        Array.isArray((sowing as Record<string, unknown> | null)?.notes)
            ? listItems((sowing as Record<string, unknown>).notes as unknown[])
            : [],
        Math.max(2, 4 - t),
    );

    // ── Key notes strip (page 1 bottom) ───────────────────────────────────────
    const keyNotePool = [
        ...listItems(veg.soil_facts as unknown[]),
        ...listItems(veg.looking_after_the_crop as unknown[]),
    ].sort((a, b) => {
        if (isStar(a) && !isStar(b)) return -1;
        if (!isStar(a) && isStar(b)) return 1;
        return rankVal(b) - rankVal(a);
    });
    const keyNotes = keyNotePool.slice(0, 3);

    // ── Star/key tips (page 2 bottom) ─────────────────────────────────────────
    const starItems = [
        ...listItems(veg.looking_after_the_crop as unknown[]),
        ...listItems(veg.soil_facts as unknown[]),
    ].filter(isStar);
    const tipItems =
        starItems.length > 0
            ? starItems.slice(0, Math.max(3, 5 - p2TrimLevel))
            : careItems.slice(0, Math.max(3, 4 - p2TrimLevel));

    // ── JSX helpers ───────────────────────────────────────────────────────────
    const itemText = (item: unknown): string => {
        if (!item) return "";
        if (typeof item === "object" && item !== null) {
            const obj = item as Record<string, unknown>;
            if (typeof obj.short_text === "string" && obj.short_text)
                return obj.short_text;
        }
        return rt(item);
    };

    const StepList = ({
        items,
        numbered,
    }: {
        items: unknown[];
        numbered?: boolean;
    }) => {
        return numbered ? (
            <ol className={styles.cheatStepList}>
                {items.map((item, i) => (
                    <li
                        key={i}
                        className={`${styles.cheatStep} ${isStar(item) ? styles.cheatStepKey : ""}`}
                    >
                        <span className={styles.cheatStepNum}>{i + 1}</span>
                        {isStar(item) && (
                            <span className={styles.cheatStarTag}>★ KEY</span>
                        )}
                        <span className={styles.cheatStepTxt}>
                            {itemText(item)}
                        </span>
                    </li>
                ))}
            </ol>
        ) : (
            <ul className={styles.cheatBulletList}>
                {items.map((item, i) => (
                    <li
                        key={i}
                        className={`${styles.cheatBulletItem} ${isStar(item) ? styles.cheatStepKey : ""}`}
                    >
                        <span className={styles.cheatBullet}>•</span>
                        {isStar(item) && (
                            <span className={styles.cheatStarTag}>★ KEY</span>
                        )}
                        <span className={styles.cheatStepTxt}>
                            {itemText(item)}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    // ── (palette and diff already computed above) ───────────────────────────
    const pageStyle = {
        ["--hl" as string]: palette.highlight,
        ["--bg" as string]: palette.pageBackground,
        ["--th" as string]: palette.tableHeader,
        ["--thl" as string]: palette.tableHighlight,
        background: palette.pageBackground,
    } as React.CSSProperties;

    // Difficulty dot rating: 1 filled dot per level (5 dots total)
    const diffDots = Math.max(1, Math.min(5, veg.difficulty ?? 1));

    // Hero image floats in the right column; the intro text wraps its silhouette.
    const heroCrop = veg.image ? heroImageCrops[veg.image] : undefined;
    const heroSrc = heroCrop?.src ?? veg.image;
    const heroColumnWidth = heroCrop
        ? (36 * heroCrop.width) / heroCrop.originalWidth
        : 36;
    const heroImageEl = heroSrc ? (
        <img
            src={heroSrc}
            alt={name}
            ref={heroImgRef}
            className={styles.cheatBodyImg}
            style={{
                shapeOutside: `url(${heroSrc})`,
                maxHeight: heroCrop
                    ? (imgMaxHeight * heroCrop.height) / heroCrop.originalHeight
                    : imgMaxHeight,
                objectPosition: heroCrop ? "left top" : undefined,
            }}
        />
    ) : null;

    const introEl = (
        <div ref={introWrapperRef} className={styles.cheatStaggeredIntro}>
            {veg.hero_header && (
                <p className={styles.cheatHeroHeader}>{veg.hero_header}</p>
            )}
            {veg.introduction && (
                <p ref={introParaRef} className={styles.cheatIntro}>
                    {firstNSentences(veg.introduction, introSentenceCount)}
                </p>
            )}
            <div ref={introSentinelRef} />
        </div>
    );

    return (
        <>
            {(planting?.issue||plantingFit.phase==='error')&&<p role="alert">
                PDF export paused: {planting?.issue??'The planting card does not fit safely. Review its layout; no neighbouring advice has been removed.'}
            </p>}
            {/* ════════════════════════════════════════════════ PAGE 1 — FRONT */}
            <div ref={page1Ref} className={styles.cheatPage} style={pageStyle}>
                {/* Header — 3-section flex layout */}
                <div className={styles.cheatHeader}>
                    <div className={styles.cheatHeaderAccent} />
                    <div className={styles.cheatHeaderInner}>
                        {/* Left: category + name */}
                        <div className={styles.cheatHeaderLeft}>
                            <p className={styles.cheatCategory}>
                                {(
                                    (veg as unknown as { category?: string })
                                        .category ?? "Vegetable"
                                ).toUpperCase()}
                            </p>
                            <h1
                                className={styles.cheatName}
                                style={
                                    name.length > 18
                                        ? { fontSize: "19pt" }
                                        : name.length > 13
                                          ? { fontSize: "26pt" }
                                          : undefined
                                }
                            >
                                {name.toUpperCase()}
                            </h1>
                        </div>

                        {/* Centre: Crops (harvest seasons) + Ready In */}
                        <div className={styles.cheatHeaderCenter}>
                            {(() => {
                                const HC = "/images/header_chars/";
                                const harvestRanges =
                                    cal?.harvest_time?.most_popular ?? [];
                                const seasons =
                                    getHarvestSeasons(harvestRanges);
                                // Compact icon/padding when 4 seasons AND a long name
                                const compactHeader =
                                    seasons.length === 4 && name.length > 10;
                                const iconStyle = compactHeader
                                    ? { width: 26, height: 26 }
                                    : undefined;
                                const charPad = compactHeader
                                    ? "0 10px"
                                    : undefined;
                                // Prefer ready_in_short (concise header version)
                                // over the full Quick Facts "Ready in" value
                                const readyIn =
                                    veg.time_to_harvest?.ready_in_short ??
                                    quickFacts.find(
                                        (f) => f.label === "Ready in",
                                    )?.value ??
                                    null;
                                return (
                                    <>
                                        {seasons.length > 0 && (
                                            <div
                                                className={
                                                    styles.cheatHeaderChar
                                                }
                                                style={
                                                    charPad
                                                        ? { padding: charPad }
                                                        : undefined
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.cheatHeaderSeasonIcons
                                                    }
                                                >
                                                    {seasons.map((s) => (
                                                        <img
                                                            key={s}
                                                            src={`${HC}season_${s.toLowerCase()}.png`}
                                                            alt={s}
                                                            className={
                                                                styles.cheatHeaderCharIcon
                                                            }
                                                            style={iconStyle}
                                                        />
                                                    ))}
                                                </div>
                                                <span
                                                    className={
                                                        styles.cheatHeaderCharLabel
                                                    }
                                                >
                                                    {seasons
                                                        .map((s) =>
                                                            s
                                                                .slice(0, 3)
                                                                .toUpperCase(),
                                                        )
                                                        .join(" / ")}
                                                </span>
                                            </div>
                                        )}
                                        {readyIn && (
                                            <div
                                                className={
                                                    styles.cheatHeaderChar
                                                }
                                            >
                                                <img
                                                    src={`${HC}calendar.png`}
                                                    alt=""
                                                    className={
                                                        styles.cheatHeaderCharIcon
                                                    }
                                                />
                                                <span
                                                    className={
                                                        styles.cheatHeaderCharLabel
                                                    }
                                                >
                                                    {readyIn}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Right: difficulty */}
                        <div className={styles.cheatHeaderMeta}>
                            <span className={styles.cheatDiffTitle}>
                                DIFFICULTY
                            </span>
                            <div
                                className={styles.cheatDiffBadge}
                                style={{ background: diff.bg }}
                            >
                                <span className={styles.cheatDiffValue}>
                                    {diff.label.toUpperCase()}
                                </span>
                            </div>
                            <div className={styles.cheatDiffDots}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <span
                                        key={i}
                                        className={`${styles.cheatDiffDot} ${i <= diffDots ? styles.cheatDiffDotFilled : ""}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body — the hero image floats within the RIGHT column so the
                    calendar tucks in beneath it (organic spill, no manual push) */}
                <div
                    className={`${styles.cheatBody} ${styles.cheatStaggeredBody}`}
                    style={{
                        gridTemplateColumns: `44% ${56 - heroColumnWidth}% ${heroColumnWidth}%`,
                    }}
                >
                    {introEl}
                    {heroImageEl}
                    {/* LEFT: Quick Facts */}
                    <div className={styles.cheatLeft}>
                        {quickFacts.length > 0 && (
                            <div className={styles.cheatQfCard}>
                                <div className={styles.cheatQfHd}>
                                    QUICK FACTS
                                </div>
                                <div className={styles.cheatQfList}>
                                    {quickFacts.map((f, i) => {
                                        const icon =
                                            QF_ICONS[f.iconKey ?? f.label];
                                        return (
                                            <div
                                                key={i}
                                                className={styles.cheatQfRow}
                                            >
                                                <div
                                                    className={
                                                        styles.cheatQfIconCell
                                                    }
                                                >
                                                    {icon && (
                                                        <img
                                                            src={icon}
                                                            alt=""
                                                            className={
                                                                styles.cheatQfIcon
                                                            }
                                                        />
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        styles.cheatQfContent
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.cheatQfLbl
                                                        }
                                                    >
                                                        {f.label.toUpperCase()}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.cheatQfVal
                                                        }
                                                    >
                                                        {f.value}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        <div className={styles.cheatReqCard}>
                            <div
                                className={`${styles.cheatQfHd} ${styles.cheatNeedHd}`}
                            >
                                <span>CORE NEEDS</span>
                                <span className={styles.cheatNeedLegend}>
                                    1 = LOW&nbsp;&nbsp;&nbsp;5 = HIGH
                                </span>
                            </div>
                            <div className={styles.cheatNeedList}>
                                {CORE_NEED_DEFS.map(
                                    ({ key, label, color, img }) => {
                                        const raw = coreNeeds?.[key];
                                        const v =
                                            typeof raw === "number"
                                                ? Math.max(0, Math.min(5, raw))
                                                : null;
                                        return (
                                            <div
                                                key={key}
                                                className={styles.cheatNeedRow}
                                            >
                                                <img
                                                    src={img}
                                                    alt=""
                                                    className={
                                                        styles.cheatNeedIcon
                                                    }
                                                />
                                                <span
                                                    className={
                                                        styles.cheatNeedLbl
                                                    }
                                                >
                                                    {label.toUpperCase()}
                                                </span>
                                                <span
                                                    className={
                                                        styles.cheatNeedSeg
                                                    }
                                                >
                                                    {Array.from(
                                                        { length: 5 },
                                                        (_, i) => (
                                                            <span
                                                                key={i}
                                                                className={
                                                                    styles.cheatNeedCell
                                                                }
                                                                style={
                                                                    v !==
                                                                        null &&
                                                                    i < v
                                                                        ? {
                                                                              background:
                                                                                  color,
                                                                          }
                                                                        : undefined
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </span>
                                                <span
                                                    className={
                                                        styles.cheatNeedVal
                                                    }
                                                    style={{ color }}
                                                >
                                                    {v !== null
                                                        ? `${v}/5`
                                                        : "—"}
                                                </span>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: hero image floats + intro wraps the silhouette,
                        then the calendar tucks beneath, then varieties */}
                    <div className={styles.cheatRight}>
                        {hasCalendar && (
                            <div className={styles.cheatCard}>
                                <div className={styles.cheatCardHd}>
                                    SOWING &amp; HARVEST CALENDAR
                                </div>
                                <div className={styles.cheatCalWrap}>
                                    <table className={styles.cheatCalTbl}>
                                        <thead>
                                            <tr>
                                                <th
                                                    className={
                                                        styles.cheatCalLbl
                                                    }
                                                ></th>
                                                {MONTH_INITIALS.map((m, i) => (
                                                    <th
                                                        key={i}
                                                        className={
                                                            styles.cheatCalMoHd
                                                        }
                                                    >
                                                        {m}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {calRows.map(
                                                ({ label, main, less }) => (
                                                    <tr key={label}>
                                                        <td
                                                            className={
                                                                styles.cheatCalLbl
                                                            }
                                                        >
                                                            {label}
                                                        </td>
                                                        {Array.from(
                                                            { length: 12 },
                                                            (_, i) => {
                                                                return (
                                                                    <td
                                                                        key={i}
                                                                        className={
                                                                            main.has(
                                                                                i,
                                                                            )
                                                                                ? label ===
                                                                                  "HARVEST"
                                                                                    ? styles.cheatCalHarMain
                                                                                    : styles.cheatCalSowMain
                                                                                : less.has(
                                                                                        i,
                                                                                    )
                                                                                  ? label ===
                                                                                    "HARVEST"
                                                                                      ? styles.cheatCalHarLess
                                                                                      : styles.cheatCalSowLess
                                                                                  : styles.cheatCalEmpty
                                                                        }
                                                                    />
                                                                );
                                                            },
                                                        )}
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {/* RECOMMENDED VARIETIES */}
                        {topVarieties.length > 0 && (
                            <div className={styles.cheatCard}>
                                <div className={styles.cheatCardHd}>
                                    RECOMMENDED VARIETIES
                                </div>
                                <table
                                    className={styles.cheatFtTbl}
                                    style={{ width: "100%" }}
                                >
                                    <thead>
                                        <tr className={styles.cheatVarHdRow}>
                                            {topVarieties.some(
                                                (v) => v.type,
                                            ) && (
                                                <th
                                                    className={
                                                        styles.cheatVarHdType
                                                    }
                                                >
                                                    TYPE
                                                </th>
                                            )}
                                            <th
                                                className={
                                                    styles.cheatVarHdName
                                                }
                                            >
                                                VARIETY
                                            </th>
                                            <th
                                                className={
                                                    styles.cheatVarHdDesc
                                                }
                                            >
                                                NOTES
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            // Sort by type so entries are grouped, then by rank
                                            const sorted = [
                                                ...topVarieties,
                                            ].sort((a, b) => {
                                                if (a.type !== b.type)
                                                    return a.type.localeCompare(
                                                        b.type,
                                                    );
                                                return b.rank - a.rank;
                                            });
                                            const hasTypes = sorted.some(
                                                (v) => v.type,
                                            );
                                            return sorted.map((v2, i) => {
                                                const prevType =
                                                    i > 0
                                                        ? sorted[i - 1].type
                                                        : null;
                                                const showType =
                                                    v2.type !== prevType;
                                                return (
                                                    <tr
                                                        key={i}
                                                        className={
                                                            styles.cheatVarRow
                                                        }
                                                    >
                                                        {hasTypes && (
                                                            <td
                                                                className={
                                                                    styles.cheatVarType
                                                                }
                                                            >
                                                                {showType
                                                                    ? v2.type
                                                                    : ""}
                                                            </td>
                                                        )}
                                                        <td
                                                            className={
                                                                styles.cheatVarName
                                                            }
                                                        >
                                                            {v2.name
                                                                .toLowerCase()
                                                                .replace(
                                                                    /\b\w/g,
                                                                    (c) =>
                                                                        c.toUpperCase(),
                                                                )}
                                                        </td>
                                                        <td
                                                            className={
                                                                styles.cheatVarDesc
                                                            }
                                                        >
                                                            {v2.short_text ??
                                                                firstSentence(
                                                                    v2.text,
                                                                )}
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* KEY RISKS — full width, bottom of page 1 */}
                {keyRisks.length > 0 && (
                    <div
                        className={styles.cheatCard}
                        style={{
                            marginTop: 10,
                            borderColor: palette.highlight,
                        }}
                    >
                        <div
                            className={styles.cheatCardHd}
                            style={{ background: palette.highlight }}
                        >
                            KEY RISKS
                        </div>
                        <div
                            className={styles.cheatKeyRisksGrid}
                            style={{
                                gridTemplateColumns: `repeat(${keyRisks.length}, 1fr)`,
                            }}
                        >
                            {keyRisks.map((risk, i) => {
                                const icon = getRiskIcon(risk.name);
                                return (
                                    <div
                                        key={i}
                                        className={styles.cheatKeyRiskItem}
                                    >
                                        <div
                                            className={
                                                styles.cheatKeyRiskIconSlot
                                            }
                                        >
                                            {icon && (
                                                <img
                                                    src={icon}
                                                    alt=""
                                                    className={
                                                        styles.cheatKeyRiskIcon
                                                    }
                                                />
                                            )}
                                        </div>
                                        <span
                                            className={styles.cheatKeyRiskName}
                                        >
                                            {risk.name}
                                        </span>
                                        <span
                                            className={styles.cheatKeyRiskText}
                                        >
                                            {firstSentence(risk.text)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {/* Page 1 content-end sentinel — used to measure true content height */}
                <div ref={page1SentinelRef} style={{ height: 0 }} />
            </div>

            {/* ════════════════════════════════════════════════ PAGE 2 — BACK */}
            <div ref={page2Ref} className={styles.cheatPage} style={pageStyle}>
                {/* Page 2 header — speech bubble design */}
                <div className={styles.cheatPage2Hd}>
                    <div className={styles.cheatPage2HdInner}>
                        {/* Left: category + name */}
                        <div className={styles.cheatPage2HdLeft}>
                            <p className={styles.cheatCategory}>
                                {(
                                    (veg as unknown as { category?: string })
                                        .category ?? "Vegetable"
                                ).toUpperCase()}
                            </p>
                            <h2 className={styles.cheatPage2HdName}>
                                {name.toUpperCase()}
                            </h2>
                        </div>
                        {/* Middle: speech bubbles — fewer for longer names */}
                        {(() => {
                            type KN = { title: string; body: string };
                            const rawNotes: KN[] =
                                Array.isArray(veg.key_notes) &&
                                veg.key_notes.length > 0
                                    ? (veg.key_notes as KN[])
                                    : keyNotes.map((item) => ({
                                          title: firstSentence(rt(item)),
                                          body: rt(item),
                                      }));

                            if (rawNotes.length === 0) return null;
                            // 3 bubbles for short names, 2 for medium, 1 for very long.
                            const bubbleCount =
                                name.length <= 10
                                    ? 3
                                    : name.length <= 17
                                      ? 2
                                      : 1;
                            const notes = rawNotes.slice(
                                0,
                                Math.min(bubbleCount, rawNotes.length),
                            );
                            const iconUrl = `/images/vegetable_icons/${key}.png`;
                            return (
                                <div className={styles.cheatPage2Bubbles}>
                                    {notes.map((note, i) => {
                                        const isLast = i === notes.length - 1;
                                        return (
                                            <div
                                                key={i}
                                                className={
                                                    isLast
                                                        ? styles.cheatPage2BubbleLast
                                                        : styles.cheatPage2Bubble
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.cheatPage2BubbleIcon
                                                    }
                                                    style={{
                                                        WebkitMaskImage: `url('${iconUrl}')`,
                                                        maskImage: `url('${iconUrl}')`,
                                                    }}
                                                />
                                                <p
                                                    className={
                                                        styles.cheatPage2BubbleTitle
                                                    }
                                                >
                                                    {note.title}
                                                </p>
                                                {note.body &&
                                                    note.body !==
                                                        note.title && (
                                                        <p
                                                            className={
                                                                styles.cheatPage2BubbleBody
                                                            }
                                                        >
                                                            {note.body}
                                                        </p>
                                                    )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                        {/* Right: gardener head character */}
                        <div className={styles.cheatPage2HeadWrap}>
                            <img
                                src="/images/icons/head.png"
                                alt=""
                                className={styles.cheatPage2Head}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.cheatBody}>
                    {/* LEFT: Soil + Sowing */}
                    <div className={styles.cheatLeft}>
                        {soilItems.length > 0 && (
                            <div className={styles.cheatCard}>
                                <div className={styles.cheatCardHd}>
                                    SOIL &amp; PREPARATION
                                </div>
                                <StepList items={soilItems} numbered />
                            </div>
                        )}

                        {plantingActive && planting ? <PlantingCard
                            planting={planting} fit={plantingFit} onAssets={onPlantingAssets}
                            notes={[
                                ...sowingNotes.map(itemText),
                                ...planting.content.optional_note_paths.map(path=>itemText(readPlantingSource(veg,path)))
                                    .filter(text=>text&&!sowingNotes.some(n=>itemText(n)===text)).slice(0,plantingFit.noteCount),
                            ]}
                        /> : sowing && (
                            <div className={styles.cheatCard}>
                                <div className={styles.cheatCardHd}>
                                    SOWING &amp; PLANTING
                                </div>
                                <div className={styles.cheatSowInner}>
                                    {sowingMethod && (
                                        <p className={styles.cheatSowMethod}>
                                            {sowingMethod}
                                        </p>
                                    )}
                                    {(sowingDepth ||
                                        sowingRowSpacing ||
                                        sowingPlantSpacing) && (
                                        <div className={styles.cheatSowChips}>
                                            {sowingDepth && (
                                                <span
                                                    className={
                                                        styles.cheatSowChip
                                                    }
                                                >
                                                    <b>Depth:</b> {sowingDepth}
                                                </span>
                                            )}
                                            {sowingRowSpacing && (
                                                <span
                                                    className={
                                                        styles.cheatSowChip
                                                    }
                                                >
                                                    <b>Rows:</b>{" "}
                                                    {sowingRowSpacing}
                                                </span>
                                            )}
                                            {sowingPlantSpacing && (
                                                <span
                                                    className={
                                                        styles.cheatSowChip
                                                    }
                                                >
                                                    <b>Spacing:</b>{" "}
                                                    {sowingPlantSpacing}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {sowingNotes.length > 0 && (
                                    <StepList items={sowingNotes} numbered />
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Looking After + Harvesting + Pests */}
                    <div className={styles.cheatRight}>
                        {careItems.length > 0 && (
                            <div className={styles.cheatCard}>
                                <div className={styles.cheatCardHd}>
                                    LOOKING AFTER THE CROP
                                </div>
                                <StepList items={careItems} numbered />
                            </div>
                        )}

                        {harvestItems.length > 0 && (
                            <div className={styles.cheatCard}>
                                <div className={styles.cheatCardHd}>
                                    HARVESTING
                                </div>
                                <StepList items={harvestItems} />
                            </div>
                        )}

                        {troubleEntries.length > 0 && (
                            <div className={styles.cheatCard}>
                                <div className={styles.cheatCardHd}>
                                    PESTS &amp; DISEASES
                                </div>
                                <table
                                    className={styles.cheatFtTbl}
                                    style={{ width: "100%" }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                className={
                                                    styles.cheatPestHdName
                                                }
                                            >
                                                PEST / DISEASE
                                            </th>
                                            <th
                                                className={
                                                    styles.cheatPestHdDesc
                                                }
                                            >
                                                SIGNS
                                            </th>
                                            <th
                                                className={
                                                    styles.cheatPestHdDesc
                                                }
                                            >
                                                CONTROL
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {troubleEntries.map(([k, v], i) => {
                                            const obj = v as unknown as Record<
                                                string,
                                                unknown
                                            >;
                                            const signs =
                                                (obj.signs as string) ||
                                                rt(v).split(".")[0] + ".";
                                            const control =
                                                (obj.control as string) || "";
                                            return (
                                                <tr key={i}>
                                                    <td
                                                        className={
                                                            styles.cheatPestLbl
                                                        }
                                                    >
                                                        {k
                                                            .toLowerCase()
                                                            .replace(
                                                                /\b\w/g,
                                                                (c) =>
                                                                    c.toUpperCase(),
                                                            )}
                                                    </td>
                                                    <td
                                                        className={
                                                            styles.cheatPestVal
                                                        }
                                                    >
                                                        {signs}
                                                    </td>
                                                    <td
                                                        className={
                                                            styles.cheatPestVal
                                                        }
                                                    >
                                                        {control}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Final Tips */}
                {tipItems.length > 0 && (
                    <div className={styles.cheatFinalTips}>
                        <div className={styles.cheatFinalTipsHd}>
                            FINAL TIPS
                        </div>
                        <div className={styles.cheatFinalTipsGrid}>
                            {tipItems.map((tip, i) => (
                                <div
                                    key={i}
                                    className={styles.cheatFinalTipItem}
                                >
                                    <img
                                        src={pickFinalTipIcon(
                                            tip,
                                            itemText(tip),
                                            i,
                                        )}
                                        alt=""
                                        className={styles.cheatFinalTipIcon}
                                    />
                                    <span className={styles.cheatFinalTipText}>
                                        {itemText(tip)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Page 2 content-end sentinel — used by p2TrimLevel algorithm */}
                <div ref={page2SentinelRef} style={{ height: 0 }} />
            </div>
        </>
    );
}
