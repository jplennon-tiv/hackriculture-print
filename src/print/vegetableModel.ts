import troublesJson from '../../../hackriculture-data/generated/master/troubles.json';
import type {TroublesData,Vegetable} from '../types';
import {troubleIdentity,distinctTroubleEntries} from '../lib/troubleIdentity';
import {rt,isStar} from '../lib/ranked';
import {resolveMeasurement,isMeasurementPair,type UnitSystem} from '../lib/measure';
import {expandMonths,formatMonthRange} from '../lib/months';
import {yieldFact,timeToHarvestDetails,durationFactSummary} from '../lib/facts';
import {firstSentence,firstNSentences} from '../lib/sentences';
import {appliesToVegetable,inlineAppliesToVegetable} from '../lib/cropApplicability';
import {quickFactIconPath} from '../lib/quickFactIcons';
import {resolvePlanting} from './plantingIllustrations';
import {rankedSelection,distinctTips,measurementFact} from '../lib/vegetableEditorial';
import {resolveVegetableExtracts,resolveVegetablePrintLayout,printItems,RICH_CONTENT_LAYOUT_REVISION} from '../lib/vegetablePrint';
import {familyPalette} from './familyTheme';
const troublesData=troublesJson as TroublesData;
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


function rankVal(v: unknown): number {
    if (typeof v === "object" && v !== null && "rank" in v)
        return (v as { rank?: number }).rank ?? 5;
    return 5;
}

function listItems(arr: unknown[] | null | undefined): unknown[] {
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => rt(x).trim());
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

function flattenVarieties(varieties: Record<string, unknown>, system: UnitSystem): VarietyEntry[] {
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

        if (typeof obj.text === 'string' || isMeasurementPair(obj.text)) {
            // Flat variety entry
            result.push({
                type: "",
                name: key,
                text: rt(obj, system),
                short_text:
                    rt(obj.short_text, system) || undefined,
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

                if (typeof varObj.text === 'string' || isMeasurementPair(varObj.text)) {
                    result.push({
                        type: displayType,
                        name: varKey,
                        text: rt(varObj, system),
                        short_text:
                            rt(varObj.short_text, system) || undefined,
                        rank: typeof varObj.rank === "number" ? varObj.rank : 5,
                    });
                }
            }
        }
    }
    return result;
}


export function vegetableModel(sourceVeg:Vegetable,key:string,system:UnitSystem,aiReview=false){
    const curated=resolveVegetableExtracts(sourceVeg,aiReview);
    const saved=resolveVegetablePrintLayout(sourceVeg,aiReview);
    const veg:Vegetable={...sourceVeg,
        ...(typeof curated.values.introduction==='string'?{introduction:curated.values.introduction}:{}),
        ...(curated.values.key_notes?{key_notes:curated.values.key_notes as {title:string;body:string}[]}:{}),
    };
    const name = veg.name ?? key;
    const plantingReview=aiReview;
    const planting=resolvePlanting(veg,key,system,plantingReview);

    const rawVarieties = veg.varieties;
    const allVarietyEntries: VarietyEntry[] =
        rawVarieties && typeof rawVarieties === "object"
            ? flattenVarieties(rawVarieties as Record<string, unknown>, system)
            : [];
    const varietyPool = (() => {
        const sorted = [...allVarietyEntries].sort((a, b) => b.rank - a.rank);
        return sorted;
    })();
    const varCount=saved.layout?.variety_count??Math.min(4,varietyPool.length);
    const p2TrimLevel=0;
    const keyRisksCount = 4;

    // ── Category colour palette ───────────────────────────────────────────────
    const category=(veg as Vegetable & {category?:string}).category??'Other';
    const palette = familyPalette(category);

    const diff = difficultyInfo(veg.difficulty, palette.deep);

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
    const sowRange = formatMonthRange(sowPopular,{empty:"—"});
    const harRange = formatMonthRange(cal?.harvest_time?.most_popular ?? [],{empty:"—"});

    const sowing = (veg.sowing_and_planting ?? null) as Record<
        string,
        unknown
    > | null;
    const sowingDepth =
        resolveMeasurement(sowing?.sowing_depth, system) ??
        resolveMeasurement(sowing?.planting_depth, system);
    const sowingMethodFull = rt(sowing?.method, system);
    // Prose is truncated by sentence as p2TrimLevel rises — biggest lever for long-sowing overflow.
    const sowingMethod = sowingMethodFull
        ? firstNSentences(sowingMethodFull, Math.max(2, 5 - p2TrimLevel))
        : undefined;
    const sowingRowSpacing = measurementFact(sowing?.row_spacing, sowing?.row_spacing_summary, system);
    const sowingPlantSpacing = measurementFact(sowing?.plant_spacing, sowing?.plant_spacing_summary, system);

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
    const readyInVal = timeToHarvestDetails(veg.time_to_harvest);
    if (readyInVal) quickFacts.push({ label: "Ready in", value: readyInVal });

    const coreNeeds = veg.core_needs ?? null;

    // ── Inline troubles ───────────────────────────────────────────────────────
    const troubles = veg.troubles ?? null;
    let inlineTroubleEntries: Array<[string, unknown]> = troubles
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
    const normTroubleName = (raw: string) => troubleIdentity(raw, name);
    // Old inline mirrors may contain a condition now explicitly scoped to
    // another crop. Respect the shared condition scope without deleting source.
    const scopedConditions=(veg.troubles_detail??[]).flatMap(groupKey=>Object.values(troublesData[groupKey]?.conditions??{}));
    inlineTroubleEntries=inlineTroubleEntries.filter(([label,value])=>inlineAppliesToVegetable(value as {applies_to?:string[]},scopedConditions.filter(c=>normTroubleName(c.name)===normTroubleName(label)),key));
    inlineTroubleEntries = distinctTroubleEntries([...inlineTroubleEntries].sort((a,b)=>rankVal(b[1])-rankVal(a[1])), name);
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
                if (!appliesToVegetable(cond,key)) continue;
                const troubleKey = normTroubleName(cond.name);
                if (seenTroubleNames.has(troubleKey)) continue;
                seenTroubleNames.add(troubleKey);
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

    const rankedTroubleEntries = [
        ...[...inlineTroubleEntries].sort(
            (a, b) => rankVal(b[1]) - rankVal(a[1]),
        ),
        ...[...fallbackTroubleEntries].sort(
            (a, b) => rankVal(b[1]) - rankVal(a[1]),
        ),
    ];
    const troubleEntries = rankedTroubleEntries.slice(0, saved.layout?.pest_limit??Math.max(3, 10 - p2TrimLevel));

    // KEY RISKS — top 4 by rank; inline troubles first, then troubles_detail groups
    // Build the full sorted key-risk pool; slice to keyRisksCount in render
    const allKeyRisksPool: Array<{ name: string; text: string }> = (() => {
        if (rankedTroubleEntries.length > 0) {
            return [...rankedTroubleEntries]
                .sort((a, b) => rankVal(b[1]) - rankVal(a[1]))
                .map(([k, v]) => ({ name: k, text: rt({text:(v as {short_text?:unknown}).short_text},system) || rt(v, system) }));
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
                if (cond.name && cond.description && appliesToVegetable(cond,key)) {
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
    // Saved extracts own the whole selection. Legacy caps remain visible in the editorial report.
    const t = p2TrimLevel;
    const soilItems = printItems(curated.values.soil_facts,system,sourceVeg)??rankedSelection(
        listItems(veg.soil_facts as unknown[]),
        Math.max(2, 6 - t),
    );
    const careItems = printItems(curated.values.looking_after_the_crop,system,sourceVeg)??rankedSelection(
        listItems(veg.looking_after_the_crop as unknown[]),
        Math.max(3, 8 - t),
    );
    const harvestItems = printItems(curated.values.harvesting,system,sourceVeg)??rankedSelection(
        listItems(veg.harvesting as unknown[]),
        Math.max(2, 6 - t),
    );
    const sowingNotes = printItems(curated.values.sowing_notes,system,sourceVeg)??rankedSelection(
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
    const tipItems = printItems(curated.values.final_tips,system,sourceVeg)??(
        starItems.length > 0
            ? rankedSelection(distinctTips(starItems), Math.max(3, 5 - p2TrimLevel))
            : rankedSelection(distinctTips(careItems), Math.max(3, 4 - p2TrimLevel)));

    // A crop without a sowing source or companion has no notes to curate
    // (for example, mushroom's reviewed supplied-compost planting route).
    const sowingNotesNotApplicable = sourceVeg.sowing_and_planting == null &&
        !sourceVeg.ai_print_extracts?.sections.sowing_notes && sowingNotes.length === 0;
    const editorialReport = Object.fromEntries([
        ['soil_facts',soilItems,veg.soil_facts],
        ['looking_after_the_crop',careItems,veg.looking_after_the_crop],
        ['harvesting',harvestItems,veg.harvesting],
        ['sowing_notes',sowingNotes,sowing?.notes],
        ['final_tips',tipItems,starItems],
    ].map(([slot,selected,source])=>[slot,{
        mode:slot==='sowing_notes'&&sowingNotesNotApplicable?'not_applicable':curated.values[slot as keyof typeof curated.values]!==undefined?'reviewed':'automatic',
        source_items:Array.isArray(source)?source.length:0,
        printed_items:Array.isArray(selected)?selected.length:0,
        editorial_note:sourceVeg.ai_print_extracts?.sections[slot as keyof typeof curated.values]?.editorial_note ?? null,
    }]));


    const itemText=(item:unknown)=>{const obj=item as {short_text?:unknown}|null;return rt(obj?.short_text,system)||rt(item,system)};
    const warnings=[...curated.warnings,...(saved.warning?[saved.warning]:[]),...(planting?.issue?[planting.issue]:[]),...(['soil_facts','looking_after_the_crop','harvesting','sowing_notes','final_tips'] as const).filter(k=>curated.values[k]===undefined&&!(k==='sowing_notes'&&sowingNotesNotApplicable)).map(k=>`${k}: automatic fallback selection; review required.`)];
    return {richFill:sourceVeg.ai_print_layout?.renderer_revision===RICH_CONTENT_LAYOUT_REVISION&&saved.layout?{alignColumns:!!saved.layout.align_bottoms,fillBottoms:!!saved.layout.fill_bottoms}:null,key,name,category,veg,palette,diff,calRows,hasCalendar,quickFacts:quickFacts.map(f=>({...f,icon:QF_ICONS[f.iconKey??f.label]})),coreNeeds,planting,sowing,sowingMethod,sowingDepth,sowingRowSpacing,sowingPlantSpacing,soilItems,careItems,harvestItems,sowingNotes,tipItems,keyRisks,topVarieties,troubleEntries,keyNotes,curated,editorialReport,itemText,warnings,intro:firstNSentences(veg.introduction??'',saved.layout?.intro_sentences??999),seasons:getHarvestSeasons(cal?.harvest_time?.most_popular??[])};
}
