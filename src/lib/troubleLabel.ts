/** Sentence case for problem labels and Key risks headings, preserving proper names and genera. */
export function troubleLabel(label: string): string {
    const lower = label.toLowerCase();
    const named = lower
        .replace(/\bnew zealand\b/g, 'New Zealand')
        .replace(/\bcolorado\b/g, 'Colorado')
        .replace(/\bbrussels\b/g, 'Brussels')
        .replace(/\b(botrytis|didymella|phytophthora)\b/g, word => word[0].toUpperCase() + word.slice(1));
    return named.replace(/[a-z]/i, letter => letter.toUpperCase());
}
