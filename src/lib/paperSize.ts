/** Shared by the web controls and the PDF server. */
export const PAPER_SIZES = ["185x240", "A4", "A5", "A6"] as const;
export type PaperSize = typeof PAPER_SIZES[number];
export const DEFAULT_PAPER: PaperSize = "185x240";
// Start the approved book edition with its new default, then retain each choice.
export const PAPER_STORAGE_KEY = "gg-paper-book-v1";
export function parsePaper(value: unknown): PaperSize {
    return PAPER_SIZES.includes(value as PaperSize) ? value as PaperSize : DEFAULT_PAPER;
}
