/** Stored print adaptations only. This module never calls an AI service. */
export const printFields = ['description', 'treatment', 'prevention'] as const;
export type PrintField = typeof printFields[number];
export interface AiFieldReview {
    updated_at: string;
    updated_by: string;
    status: 'draft' | 'approved';
    locked: boolean;
    /** Canonical JSON signatures: exact comparisons, no hash collisions. */
    dependencies: Record<string, string>;
    output_signature: string;
}
export interface AiPrintRecord {
    ai_description?: string | null;
    ai_treatment?: string | null;
    ai_prevention?: string | null;
    ai_print?: { version: 1; fields: Partial<Record<PrintField, AiFieldReview>> };
}

export function signature(value: unknown): string {
    if (value === undefined) return 'missing';
    if (Array.isArray(value)) return '[' + value.map(signature).join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort()
        .map(key => JSON.stringify(key) + ':' + signature((value as Record<string, unknown>)[key])).join(',') + '}';
    return JSON.stringify(value);
}

export function reviewAiField(record: AiPrintRecord, field: PrintField, source: Record<string, unknown>, reviewDrafts = false) {
    const value = record[`ai_${field}`];
    const meta = record.ai_print?.fields[field];
    if (value === undefined) return { usable: false, reason: meta ? 'missing AI text' : null };
    if (!meta || record.ai_print?.version !== 1) return { usable: false, reason: 'missing review record' };
    // Every adaptation may combine the three advice fields. Require all three,
    // plus explicitly recorded contextual dependencies (name, crops, etc.).
    if (!printFields.every(key => Object.prototype.hasOwnProperty.call(meta.dependencies, key))
        || Object.entries(meta.dependencies).some(([key, expected]) => signature(source[key]) !== expected))
        return { usable: false, reason: 'source changed' };
    if (signature(value) !== meta.output_signature) return { usable: false, reason: 'AI text edited since review' };
    if (meta.status !== 'approved') return { usable: reviewDrafts, reason: 'draft awaiting approval' };
    return { usable: true, reason: null };
}

/** Preparation writers must use this guard; explicit human edits remain possible. */
export function assertAiWritable(record: AiPrintRecord, field: PrintField) {
    const meta = record.ai_print?.fields[field];
    if (meta?.locked) throw new Error(`ai_${field} is locked against AI rewriting`);
    const value = record[`ai_${field}`];
    if (value !== undefined && (!meta || signature(value) !== meta.output_signature))
        throw new Error(`ai_${field} has unreviewed edits; preserve and review them first`);
}

export function layoutSourceSignature(input: unknown): string {
    const group=input as {source_heading:string;applies_to?:string[];introduction?:string|null;ai_introduction?:string;conditions?:Record<string,Record<string,unknown>>};
    return signature({heading:group.source_heading,crops:group.applies_to,introduction:group.introduction,
        ai_introduction:group.ai_introduction,conditions:Object.fromEntries(Object.entries(group.conditions??{}).map(([key,c])=>[
            key,Object.fromEntries(['name','image',...(c.image_revision===undefined?[]:['image_revision']),'visual_heading','visual_symptom','applies_to','active_period','rank',...printFields,...printFields.map(f=>'ai_'+f)].map(k=>[k,c[k]])),
        ]))});
}
