import type { Vegetable } from '../types';

/** Editorial companion only: never replaces the detailed gardening record. */
export interface PlantingPrintText {
    id: string;
    text: string;
    source_paths: string[];
}
export interface PlantingPrintStep extends PlantingPrintText {
    title: string;
    /** An explicitly authored combined caption, not runtime truncation. */
    compact_text?: string;
}
export interface PlantingPrintContent {
    version: 1;
    steps: PlantingPrintStep[];
    supplementary: PlantingPrintText[];
    /** Only reviewed, existing source notes may be used for white-space top-up. */
    optional_note_paths: string[];
    reviewed_source: string;
}

export function readPlantingSource(root: unknown, path: string): unknown {
    let value = root;
    for (const key of path.split('.')) {
        if (!value || typeof value !== 'object' || !Object.prototype.hasOwnProperty.call(value, key)
            || ['__proto__', 'constructor', 'prototype'].includes(key)) return undefined;
        value = (value as Record<string, unknown>)[key];
    }
    return value;
}

function stable(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
    if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stable((value as Record<string, unknown>)[k])}`).join(',')}}`;
    return JSON.stringify(value) ?? 'undefined';
}

export function plantingSourcePaths(content: PlantingPrintContent): string[] {
    return [...new Set([...content.steps, ...content.supplementary].flatMap(s => s.source_paths))].sort();
}

/** Stable 64-bit change detector, not an authentication/security hash. */
export function plantingSourceFingerprint(veg: Vegetable, content: PlantingPrintContent): string {
    const text = stable(plantingSourcePaths(content).map(path => [path, readPlantingSource(veg, path)]));
    let hash = 14695981039346656037n;
    for (const byte of new TextEncoder().encode(text)) hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 1099511628211n);
    return `fnv1a64:${hash.toString(16).padStart(16, '0')}`;
}

export function plantingReviewIssue(veg: Vegetable): string | null {
    const content = veg.print_planting;
    if (!content) return null;
    for (const path of [...plantingSourcePaths(content), ...content.optional_note_paths]) {
        if (readPlantingSource(veg, path) == null) return `Missing planting source: ${path}`;
    }
    if (plantingSourceFingerprint(veg, content) !== content.reviewed_source) {
        return 'Planting source advice has changed. Review the stored print captions against the detailed instructions, then confirm review in the editor.';
    }
    return null;
}
