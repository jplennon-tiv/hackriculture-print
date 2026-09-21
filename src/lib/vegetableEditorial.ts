import {rt, isStar} from './ranked';
import {resolveMeasurement, type UnitSystem} from './measure';

/** Legacy fallback only. Reviewed extracts are complete, ordered decisions. */
export function rankedSelection(items: unknown[], max: number): unknown[] {
    if (items.length <= max) return items;
    const rank = (item: unknown) => typeof item === 'object' && item !== null && 'rank' in item && typeof item.rank === 'number' ? item.rank : 5;
    return [...items].sort((a,b) => Number(isStar(b))-Number(isStar(a)) || rank(b)-rank(a)).slice(0,max);
}

export function distinctTips(items: unknown[]): unknown[] {
    const seen = new Set<string>();
    return items.filter(item => {
        const key=rt(item).trim().toLowerCase().replace(/\s+/g,' ');
        if (!key || seen.has(key)) return false;
        seen.add(key); return true;
    });
}

/** A labelled summary is additive: never flatten the underlying variant dictionary. */
export function measurementFact(value: unknown, summary: unknown, system: UnitSystem): string | null {
    const explicit=resolveMeasurement(summary,system);
    if (explicit) return explicit;
    if (value && typeof value === 'object' && !('metric' in value) && !('imperial' in value)) {
        const variants=Object.entries(value).map(([key,v])=>({key,value:resolveMeasurement(v,system)})).filter(v=>v.value);
        const values=new Set(variants.map(v=>v.value));
        if (values.size===1) return variants[0].value;
        return variants.map(v=>`${v.key.replace(/_/g,' ')}: ${v.value}`).join('; ') || null;
    }
    return resolveMeasurement(value,system);
}
