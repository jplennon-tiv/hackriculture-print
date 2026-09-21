/**
 * Runtime validation schemas mirroring src/types.ts.
 *
 * Design goals:
 *  - **Data granularity preserved**: every object uses `z.looseObject` so
 *    unknown fields round-trip through parse() unchanged. This means legacy
 *    or future-experimental fields survive admin save/load cycles.
 *  - **Soft-parse helper** (`safeParseWithWarnings`) lets us validate at app
 *    boot without crashing on unexpected data — it logs a console warning and
 *    falls back to the raw value.
 *  - **Hard-parse** is used server-side in adminApiPlugin before writing.
 */
import { z } from "zod";

// ── Primitives ──────────────────────────────────────────────────────────────

/** {text, rank, star?, short_text?, icon?} — the workhorse rankable-string type. */
export const RankedTextSchema = z.looseObject({
    text: z.string(),
    rank: z.number(),
    star: z.boolean().optional(),
    short_text: z.string().optional(),
    icon: z.string().optional(),
});

/** Side-by-side imperial/metric display strings (see lib/measure.ts). */
export const MeasurementPairSchema = z.looseObject({
    imperial: z.string().nullable(),
    metric: z.string().nullable(),
});

/** A field that may be a plain string, a dual pair, OR a variety-keyed dict of either. */
const StringOrVarietyDict = z.union([
    z.string(),
    MeasurementPairSchema,
    z.looseObject({}).catchall(z.union([z.string(), MeasurementPairSchema])),
    z.null(),
]);

// ── Vegetable subsections ───────────────────────────────────────────────────

/** Structured duration companion: {min, max, unit} (see types.ts DurationValue). */
export const DurationValueSchema = z.object({
    min: z.number(),
    max: z.number().nullable(),
    unit: z.enum(["days", "weeks", "months", "years"]),
});

export const SeedAndGrowingFactsSchema = z
    .looseObject({})
    .catchall(z.union([z.string(), DurationValueSchema, z.null()]));

export const SowingAndPlantingSchema = z.looseObject({
    method: z.string().nullable().optional(),
    row_spacing: StringOrVarietyDict.optional(),
    plant_spacing: StringOrVarietyDict.optional(),
    sowing_depth: StringOrVarietyDict.optional(),
    planting_depth: StringOrVarietyDict.optional(),
    trench_or_ridge_depth: StringOrVarietyDict.optional(),
    notes: z.array(RankedTextSchema).nullable().optional(),
    seed_sowing: z.looseObject({}).nullable().optional(),
    planting: z.looseObject({}).nullable().optional(),
});

const PlantingSourcePath = z.string().regex(/^(sowing_and_planting|looking_after_the_crop)\.[a-zA-Z0-9_.]+$/);
const PlantingPrintTextSchema = z.looseObject({
    id:z.string().regex(/^[a-z][a-z0-9_-]*$/),
    text:z.string().trim().min(1),
    source_paths:z.array(PlantingSourcePath).min(1),
});
export const PlantingPrintContentSchema = z.looseObject({
    version:z.literal(1),
    steps:z.array(PlantingPrintTextSchema.extend({title:z.string().trim().min(1),compact_text:z.string().trim().min(1).optional()})).min(1).max(4),
    supplementary:z.array(PlantingPrintTextSchema),
    optional_note_paths:z.array(PlantingSourcePath),
    reviewed_source:z.string().regex(/^fnv1a64:[0-9a-f]{16}$/),
}).refine(c => new Set(c.steps.map(s=>s.id)).size === c.steps.length, {message:'Planting step IDs must be unique'});

export const InTheKitchenSchema = z.looseObject({
    overview: RankedTextSchema.nullable().optional(),
    storage: RankedTextSchema.nullable().optional(),
    cooking: RankedTextSchema.nullable().optional(),
    freezing: RankedTextSchema.nullable().optional(),
});

const StringArray = z.array(z.string());
export const CalendarEntrySchema = z.looseObject({
    most_popular: StringArray.optional(),
    less_usual: StringArray.optional(),
    under_cloches_or_cold_frame: StringArray.optional(),
    indoors_under_glass: StringArray.optional(),
    transplanting_under_glass: StringArray.optional(),
    transplanting_under_glass_cover_with_cloches: StringArray.optional(),
    notes: StringArray.optional(),
});

export const CalendarSchema = z.looseObject({
    date_format: z.string().optional(),
    sowing_time: CalendarEntrySchema.optional(),
    planting_time: CalendarEntrySchema.optional(),
    sowing_and_planting_time_outdoor_crop: CalendarEntrySchema.optional(),
    sowing_and_planting_time_greenhouse_crop: CalendarEntrySchema.optional(),
    harvest_time: CalendarEntrySchema.optional(),
});

// VarietyGroup is recursive: values may be nested VarietyGroups.
type VarietyGroupType = {
    overview?: string | string[] | null;
    other_names?: string | null;
    description?: string | null;
    maturity_months?: string[];
    types?: string[];
    [key: string]:
        | string
        | string[]
        | null
        | undefined
        | z.infer<typeof RankedTextSchema>
        | VarietyGroupType;
};

export const VarietyGroupSchema: z.ZodType<VarietyGroupType> = z.lazy(() =>
    z
        .looseObject({
            overview: z
                .union([z.string(), z.array(z.string()), z.null()])
                .optional(),
            other_names: z.string().nullable().optional(),
            description: z.string().nullable().optional(),
            maturity_months: StringArray.optional(),
            types: StringArray.optional(),
        })
        .catchall(
            z.union([
                RankedTextSchema,
                z.string(),
                z.array(z.string()),
                z.null(),
                VarietyGroupSchema,
            ]),
        ),
);

export const VarietiesSchema = VarietyGroupSchema;

export const TroublesSchema = z
    .looseObject({
        _note: z.string().nullable().optional(),
        _redirect: z.string().nullable().optional(),
    })
    .catchall(z.union([RankedTextSchema, z.string(), z.null()]));

export const KeyNoteSchema = z.looseObject({
    title: z.string(),
    body: z.string(),
});

/** {min, max, unit, text} — structured quantity that keeps the original prose. */
export const MeasuredValueSchema = z.looseObject({
    min: z.number().nullable(),
    max: z.number().nullable(),
    unit: z.string().nullable(),
    text: z.string(),
});

const VarietyOverrides = z
    .looseObject({})
    .catchall(z.looseObject({}).catchall(MeasuredValueSchema.nullable()));

export const YieldGroupSchema = z.looseObject({
    default: z.looseObject({
        per_plant: MeasuredValueSchema.nullable(),
        per_mature_plant: MeasuredValueSchema.nullable(),
        per_10_ft_row: MeasuredValueSchema.nullable(),
        per_10_ft_double_row: MeasuredValueSchema.nullable(),
    }),
    by_variety: VarietyOverrides.nullable(),
});

export const TimeToHarvestGroupSchema = z.looseObject({
    default: z.looseObject({
        from_sowing: MeasuredValueSchema.nullable(),
        from_planting: MeasuredValueSchema.nullable(),
    }),
    by_variety: VarietyOverrides.nullable(),
    ready_in_short: z.string().nullable(),
});

export const CoreNeedsSchema = z.looseObject({
    sun: z.number().min(1).max(5).nullable(),
    water: z.number().min(1).max(5).nullable(),
    nutrition: z.number().min(1).max(5).nullable(),
});

const FieldAuditSchema=z.record(z.string(),z.looseObject({updated_at:z.string().datetime().nullable(),updated_by:z.string().min(1),deleted:z.boolean().optional()}));
export const VegetableSchema = z.looseObject({
    _field_metadata:FieldAuditSchema.optional(),
    image_revision:z.string().regex(/^[a-f0-9]{64}$/).optional(),
    name: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    image_thumbnail: z.string().nullable().optional(),
    ease_of_cultivation: z.string().nullable().optional(),
    hero_header: z.string().nullable().optional(),
    difficulty: z.number().nullable().optional(),
    introduction: z.string().nullable().optional(),
    seed_and_growing_facts: SeedAndGrowingFactsSchema.nullable().optional(),
    soil_facts: z.array(RankedTextSchema).nullable().optional(),
    sowing_and_planting: SowingAndPlantingSchema.nullable().optional(),
    print_planting: PlantingPrintContentSchema.nullable().optional(),
    looking_after_the_crop: z.array(RankedTextSchema).nullable().optional(),
    harvesting: z.array(RankedTextSchema).nullable().optional(),
    in_the_kitchen: InTheKitchenSchema.nullable().optional(),
    varieties: VarietiesSchema.nullable().optional(),
    troubles: TroublesSchema.nullable().optional(),
    calendar: CalendarSchema.nullable().optional(),
    troubles_detail: StringArray.nullable().optional(),
    key_notes: z.array(KeyNoteSchema).nullable().optional(),
    yield: YieldGroupSchema.nullable().optional(),
    time_to_harvest: TimeToHarvestGroupSchema.nullable().optional(),
    core_needs: CoreNeedsSchema.nullable().optional(),
    group_overview: z.looseObject({}).nullable().optional(),
    metadata: z.looseObject({}).nullable().optional(),
});

export const GardeningDataSchema = z.looseObject({}).catchall(VegetableSchema);

// ── Troubles detail types ───────────────────────────────────────────────────

const ActivePeriod = z.union([
    z.string(),
    z.array(z.string()),
    z.looseObject({
        from: z.string().optional(),
        to: z.string().optional(),
    }),
    z.looseObject({}).catchall(z.union([z.string(), z.array(z.string())])),
    z.null(),
]);

export const TroublePrintSummarySchema = z.looseObject({
    version: z.literal(1),
    status: z.enum(['approved', 'draft']),
    source: z.looseObject({description: z.string().nullable(), treatment: z.string().nullable(), prevention: z.string().nullable()}),
    recognise: z.string().nullable(),
    act: z.string().nullable(),
    prevent: z.string().nullable(),
});

export const AiFieldReviewSchema = z.looseObject({
    updated_at: z.string().datetime(), updated_by: z.string().min(1),
    status: z.enum(['draft', 'approved']), locked: z.boolean(),
    dependencies: z.record(z.string(), z.string()), output_signature: z.string(),
});
export const AiPrintRecordSchema = z.looseObject({
    ai_description: z.string().nullable().optional(),
    ai_treatment: z.string().nullable().optional(),
    ai_prevention: z.string().nullable().optional(),
    ai_print: z.looseObject({version: z.literal(1), fields: z.looseObject({
        description: AiFieldReviewSchema.optional(), treatment: AiFieldReviewSchema.optional(), prevention: AiFieldReviewSchema.optional(),
    })}).optional(),
});
export const TroubleConditionSchema = z.looseObject({
    image_revision:z.string().regex(/^[a-f0-9]{64}$/).optional(),
    ...AiPrintRecordSchema.shape,
    print_summary: TroublePrintSummarySchema.nullable().optional(),
    name: z.string(),
    image: z.string().nullable().optional(),
    visual_heading: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    treatment: z.string().nullable().optional(),
    prevention: z.string().nullable().optional(),
    rank: z.number().optional(),
    star: z.boolean().optional(),
    active_period: ActivePeriod.optional(),
    visual_symptom: z.string().nullable().optional(),
    applies_to: StringArray.optional(),
});

export const SymptomRowSchema = z.looseObject({
    plant_part: z.string(),
    symptom: z.string(),
    likely_causes: z.array(z.union([z.string(), z.number()])),
});

export const TroubleGroupSchema = z.looseObject({
    _field_metadata:FieldAuditSchema.optional(),
    ai_introduction: z.string().optional(),
    ai_layout: z.looseObject({
        version:z.literal(1),status:z.enum(['draft','approved']),renderer:z.string(),source_signature:z.string(),
        updated_at:z.string().datetime(),updated_by:z.string().min(1),hero_images:z.array(z.string()),
        pages:z.array(z.looseObject({intro_height_mm:z.number().positive().max(150).optional(),
            columns:z.array(z.array(z.looseObject({key:z.string(),height_mm:z.number().positive().max(238)}))).length(2),
        })).min(1),
    }).optional(),
    source_heading: z.string(),
    applies_to: StringArray.optional(),
    introduction: z.string().nullable().optional(),
    symptom_lookup: z.array(SymptomRowSchema).optional(),
    conditions: z.looseObject({}).catchall(TroubleConditionSchema).optional(),
});

export const TroublesDataSchema = z
    .looseObject({})
    .catchall(TroubleGroupSchema);

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Soft-parse: returns parsed data on success, or the raw input plus a console
 * warning on failure. Use at app boot so a malformed JSON doesn't kill the UI.
 */
export function safeParseWithWarnings(
    schema: z.ZodType,
    data: unknown,
    label: string,
): unknown {
    const result = schema.safeParse(data);
    if (result.success) return result.data;
    // eslint-disable-next-line no-console
    console.warn(
        `[schema] ${label} failed validation; using raw data.`,
        result.error.issues.slice(0, 5),
    );
    return data;
}
