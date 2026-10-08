import { createContext, useContext, useState, type ReactNode } from "react";

import { DEFAULT_PAPER, PAPER_STORAGE_KEY, parsePaper, type PaperSize } from "./paperSize";
export type { PaperSize } from "./paperSize";

interface PaperCtx {
    paper: PaperSize;
    setPaper: (p: PaperSize) => void;
}

const PaperContext = createContext<PaperCtx>({
    paper: DEFAULT_PAPER,
    setPaper: () => {},
});

/** Public-app paper-size preference for PDFs, persisted to localStorage. */
export function PaperProvider({ children }: { children: ReactNode }) {
    const [paper, setPaperState] = useState<PaperSize>(() => {
        try {
            return parsePaper(localStorage.getItem(PAPER_STORAGE_KEY));
        } catch {
            return DEFAULT_PAPER;
        }
    });
    const setPaper = (p: PaperSize) => {
        setPaperState(p);
        try {
            localStorage.setItem(PAPER_STORAGE_KEY, p);
        } catch {
            /* storage unavailable — session-only */
        }
    };
    return (
        <PaperContext.Provider value={{ paper, setPaper }}>
            {children}
        </PaperContext.Provider>
    );
}

export function usePaper(): PaperCtx {
    return useContext(PaperContext);
}
