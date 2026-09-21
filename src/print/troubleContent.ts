import type { TroubleCondition, TroubleGroup } from '../types';
import palettes from './vegetable_palettes.json';
import {reviewAiField, printFields} from '../lib/aiPrint';

const neutralPalette = {highlight: '#808580', pageBackground: '#F8F8F7'};

export function troublePalette(group: TroubleGroup, vegetables: Record<string, {category?: unknown}>) {
    const categories = (group.applies_to ?? []).map(key => vegetables[key]?.category);
    const category = categories[0];
    if (!category || categories.some(c => c !== category)) return neutralPalette;
    return (palettes as Record<string, {highlight:string;pageBackground:string}>)[String(category)] ?? neutralPalette;
}

export function troubleColour(group: TroubleGroup, vegetables: Record<string, {category?: unknown}>) {
    return troublePalette(group, vegetables).highlight;
}

export function troubleCopy(condition: TroubleCondition, reviewDrafts = false) {
    const summary = condition.print_summary;
    const valid = summary?.version === 1 && summary.status === 'approved'
        && (['description','treatment','prevention'] as const).every(field => summary.source[field] === (condition[field] ?? null));
    if (condition.ai_print || printFields.some(field => condition[`ai_${field}`] !== undefined)) {
        const labels = {description: 'recognise', treatment: 'act', prevention: 'prevent'} as const;
        const copy: {recognise?: string | null; act?: string | null; prevent?: string | null; warning: string | null} = {warning: null};
        const warnings: string[] = [];
        for (const field of printFields) {
            const result = reviewAiField(condition, field, condition as unknown as Record<string, unknown>, reviewDrafts);
            // Preserve earlier approved, still-current adaptations during migration.
            copy[labels[field]] = result.usable ? condition[`ai_${field}`] : valid ? summary[labels[field]] : condition[field];
            if (result.reason) warnings.push(`${field}: ${result.reason}${result.usable ? ' (review preview)' : valid ? '; prior approved summary used' : '; full source wording used'}`);
        }
        copy.warning = warnings.length ? `${condition.name}: ${warnings.join('; ')}.` : null;
        return copy;
    }
    return {
        recognise: valid ? summary.recognise : condition.description,
        act: valid ? summary.act : condition.treatment,
        prevent: valid ? summary.prevent : condition.prevention,
        warning: summary && !valid ? `${condition.name}: print summary needs review; full source wording used.` : null,
    };
}
