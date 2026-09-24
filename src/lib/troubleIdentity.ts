/** Explicit display aliases only. Never deletes or merges master advice. */
export function troubleIdentity(raw: string, cropName = ''): string {
    let name = raw.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim().replace(/\s*\d+$/, '');
    if (/^slugs?(?: and snails?)?$/.test(name)) return 'slugs';
    if (/^club\s?root(?: \(finger and toe\))?$/.test(name)) return 'clubroot';
    if (['mangold fly (leaf miner)', 'beet leaf miner (mangold fly)'].includes(name)) return 'beet leaf miner';
    if (['old seed / poor germination', 'poor germination'].includes(name)) return 'poor germination';
    if (['carrot fly', 'carrot root fly'].includes(name)) return 'carrot fly';
    if (['fanging', 'forking', 'forked roots'].includes(name)) return 'forked roots';
    const crop = cropName.toLowerCase().trim();
    if (crop === 'radish' && ['woody or hollow roots','woody, hollow or soft radish roots'].includes(name)) return 'woody radish roots';
    if (crop === 'parsnip' && ['leaf miner', 'celery fly (leaf miner)'].includes(name)) return 'celery leaf miner';
    if (crop && name.startsWith(crop + ' ')) name = name.slice(crop.length + 1);
    return name;
}

/** Keep the first representative from an explicitly prioritised list. */
export function distinctTroubleEntries<T>(entries: Array<[string, T]>, cropName: string): Array<[string, T]> {
    const seen = new Set<string>();
    return entries.filter(([label]) => {
        const id = troubleIdentity(label, cropName);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}
