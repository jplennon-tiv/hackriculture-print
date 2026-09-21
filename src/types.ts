import type { PlantingPrintContent } from './lib/planting';
import type { AiPrintRecord } from './lib/aiPrint';
import type { TroubleLayoutPlan } from './print/troublePlan';

export interface RankedText {
    text: string;
    rank: number;
    star?: boolean;
    short_text?: string;
}

/**
 * Side-by-side imperial/metric display strings for a measurement. Either side
 * may be `null` (not yet filled) and the two are allowed to diverge after manual
 * rounding in the admin. Helpers live in [lib/measure.ts](./lib/measure.ts).
 */
export interface MeasurementPair {
    imperial: string | null;
    metric: string | null;
}

/** A measurement field: a plain string, a dual pair, or variety-keyed values of either. */
export type MeasurementValue =
    | string
    | MeasurementPair
    | Record<string, string | MeasurementPair>
    | null;

/**
 * Structured, machine-readable companion for a free-text duration field.
 * Added beside (never replacing) prose like "7-14 days" as `<field>_value`.
 * `max` is null for a single value; the whole object is null when the prose
 * couldn't be safely parsed (fill in later).
 */
export interface DurationValue {
    min: number;
    max: number | null;
    unit: "days" | "weeks" | "months" | "years";
}

/** Merged from the former plant_facts and seed_facts sections. */
export interface SeedAndGrowingFacts {
    [key: string]: string | DurationValue | null | undefined;
}

export interface SowingAndPlanting {
    method?: string | null;
    /**
     * Usually a display string, but a few crops (e.g. potato, onion) store a
     * variety-keyed object like `{ first_early_varieties: "24 in.", ... }`.
     * Measurement values may be a `MeasurementPair` `{ imperial, metric }`.
     */
    row_spacing?: MeasurementValue;
    row_spacing_summary?: MeasurementPair;
    plant_spacing_summary?: MeasurementPair;
    plant_spacing?: MeasurementValue;
    sowing_depth?: MeasurementValue;
    planting_depth?: MeasurementValue;
    trench_or_ridge_depth?: MeasurementValue;
    notes?: RankedText[] | null;
    /** Present on dual-route vegetables (e.g. Asparagus, Artichoke). */
    seed_sowing?: Record<string, unknown> | null;
    /** Present on dual-route vegetables (e.g. Asparagus, Artichoke). */
    planting?: Record<string, unknown> | null;
    [key: string]: unknown;
}

export interface InTheKitchen {
    overview?: RankedText | null;
    storage?: RankedText | null;
    cooking?: RankedText | null;
    freezing?: RankedText | null;
}

export interface CalendarEntry {
    most_popular?: string[];
    less_usual?: string[];
    under_cloches_or_cold_frame?: string[];
    indoors_under_glass?: string[];
    transplanting_under_glass?: string[];
    transplanting_under_glass_cover_with_cloches?: string[];
    notes?: string[];
}

export interface Calendar {
    date_format?: string;
    sowing_time?: CalendarEntry;
    planting_time?: CalendarEntry;
    sowing_and_planting_time_outdoor_crop?: CalendarEntry;
    sowing_and_planting_time_greenhouse_crop?: CalendarEntry;
    /** Consolidated harvest (pick/cut/lift/pull are the same action). */
    harvest_time?: CalendarEntry;
}

export type VarietyValue = RankedText | string | string[] | null | VarietyGroup;

export interface VarietyGroup {
    /**
     * Intro paragraph(s). Usually a string; a small number of entries
     * (e.g. oriental_leaves) hold an array of paragraphs.
     */
    overview?: string | string[] | null;
    other_names?: string | null;
    description?: string | null;
    /** Rendered as a readable month list ("--03" → "March"). */
    maturity_months?: string[];
    /** Free-text list of sub-group names (e.g. Spring, Summer, Winter). */
    types?: string[];
    [key: string]: VarietyValue | undefined;
}

export interface Varieties extends VarietyGroup {}

export interface Troubles {
    /** General note (not a named pest — renders as italic text) */
    _note?: string | null;
    /** Redirect stub — suppressed in UI when a full guide is linked */
    _redirect?: string | null;
    [trouble: string]: RankedText | string | null | undefined;
}

export interface KeyNote {
    title: string;
    body: string;
}

/**
 * A structured, machine-readable quantity that always preserves the original
 * prose in `text`. `min`/`max`/`unit` are null when the prose couldn't be
 * parsed (nothing is lost — `text` still holds it).
 */
export interface MeasuredValue {
    min: number | null;
    max: number | null;
    unit: string | null;
    text: string;
}

export type YieldBasis =
    | "per_plant"
    | "per_mature_plant"
    | "per_10_ft_row"
    | "per_10_ft_double_row";

/** Consolidated yield (replaces the flat `expected_yield_*` facts keys). */
export interface YieldGroup {
    default: Record<YieldBasis, MeasuredValue | null>;
    /** Per-variety overrides (e.g. bush/climbing); null when there are none. */
    by_variety: Record<
        string,
        Partial<Record<YieldBasis, MeasuredValue | null>>
    > | null;
}

export type TimeStart = "from_sowing" | "from_planting";
/**
 * Consolidated time-to-harvest (replaces the flat `approximate_time_between_*`,
 * `time_to_first_harvest` and `ready_in_short` facts keys). Harvest-verb
 * synonyms (pick/lift/cut/pull) are collapsed; only the start point is kept.
 */
export interface TimeToHarvestGroup {
    default: Record<TimeStart, MeasuredValue | null>;
    by_variety: Record<
        string,
        Partial<Record<TimeStart, MeasuredValue | null>>
    > | null;
    /** Concise human summary used in headers. */
    ready_in_short: string | null;
    ready_in_summary?: string;
}

export interface CoreNeeds {
    /** 1 (low) – 10 (high) need for direct sun. */
    sun: number | null;
    /** 1 (drought-tolerant) – 10 (very thirsty) water need. */
    water: number | null;
    /** 1 (light feeder) – 10 (hungry feeder) nutrition need. */
    nutrition: number | null;
}

export interface AuditedRecord {
    _field_metadata?: Record<string,{updated_at:string|null;updated_by:string;deleted?:boolean}>;
}
export interface Vegetable extends AuditedRecord {
    ai_print_extracts?: import('./lib/vegetablePrint').VegetablePrintExtracts;
    ai_print_layout?: import('./lib/vegetablePrint').VegetablePrintLayout;
    image_revision?:string;
    name?: string | null;
    image?: string | null;
    image_thumbnail?: string | null;
    ease_of_cultivation?: string | null;
    hero_header?: string | null;
    difficulty?: number | null;
    introduction?: string | null;
    seed_and_growing_facts?: SeedAndGrowingFacts | null;
    soil_facts?: RankedText[] | null;
    sowing_and_planting?: SowingAndPlanting | null;
    /** Additive print adaptation; detailed instructions remain authoritative. */
    print_planting?: PlantingPrintContent | null;
    looking_after_the_crop?: RankedText[] | null;
    harvesting?: RankedText[] | null;
    in_the_kitchen?: InTheKitchen | null;
    varieties?: Varieties | null;
    troubles?: Troubles | null;
    calendar?: Calendar | null;
    troubles_detail?: string[] | null;
    key_notes?: KeyNote[] | null;
    yield?: YieldGroup | null;
    time_to_harvest?: TimeToHarvestGroup | null;
    /** Visual 1–10 core-needs ratings (1 = low need, 10 = high need). */
    core_needs?: CoreNeeds | null;
    group_overview?: Record<string, unknown> | null;
    /** Home for one-off notes pertinent to a single vegetable only. */
    metadata?: Record<string, unknown> | null;
}

export type GardeningData = Record<string, Vegetable>;
// ── Troubles detail types ─────────────────────────────────────────────────────

export interface TroubleCondition extends AiPrintRecord {
    image_revision?:string;
    print_summary?: {
        version: 1;
        status: 'approved' | 'draft';
        source: { description: string | null; treatment: string | null; prevention: string | null };
        recognise: string | null;
        act: string | null;
        prevent: string | null;
    } | null;
    name: string;
    image?: string | null;
    visual_heading?: string | null;
    description?: string | null;
    treatment?: string | null;
    prevention?: string | null;
    rank?: number;
    star?: boolean;
    /**
     * Either a `{from, to}` date-range object or a map of plant-name →
     * ISO-ish month tokens (e.g. `{ "French beans": ["--07", "--08"] }`).
     */
    active_period?:
        | string
        | string[]
        | { from?: string; to?: string }
        | Record<string, string | string[]>
        | null;
    visual_symptom?: string | null;
    /** Vegetable keys this condition specifically applies to within the group. Absent = applies to all group members. */
    applies_to?: string[];
}

export interface SymptomRow {
    plant_part: string;
    symptom: string;
    likely_causes: (string | number)[];
}

export interface TroubleGroup extends AuditedRecord {
    ai_introduction?: string;
    ai_layout?: TroubleLayoutPlan;
    source_heading: string;
    applies_to?: string[];
    introduction?: string | null;
    symptom_lookup?: SymptomRow[];
    conditions?: Record<string, TroubleCondition>;
}

export type TroublesData = Record<string, TroubleGroup>;
