/** Present legacy capitals consistently without renaming source record keys. */
export function formatVarietyName(name: string): string {
    return name.replace(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu, word => {
        // Keep hybrid designations and deliberately mixed-case cultivar spellings.
        if (/^F\d+$/.test(word) || word !== word.toUpperCase()) return word;
        const lower = word.toLowerCase();
        const initial = lower[0].toUpperCase() + lower.slice(1);
        // O'… / D'… / L'… start a name; a possessive 's stays lowercase.
        return initial.replace(/^([ODL]['’])(\p{L})/u, (_, prefix: string, letter: string) => prefix + letter.toUpperCase());
    });
}
