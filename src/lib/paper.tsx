import { createContext, useContext, useState, type ReactNode } from "react";

export type PaperSize = "A4" | "A5" | "A6";

const STORAGE_KEY = "gg-paper";

interface PaperCtx {
    paper: PaperSize;
    setPaper: (p: PaperSize) => void;
}

const PaperContext = createContext<PaperCtx>({
    paper: "A4",
    setPaper: () => {},
});

/** Public-app paper-size preference for PDFs, persisted to localStorage. */
export function PaperProvider({ children }: { children: ReactNode }) {
    const [paper, setPaperState] = useState<PaperSize>(() => {
        try {
            const v = localStorage.getItem(STORAGE_KEY);
            return v === "A5" || v === "A6" ? v : "A4";
        } catch {
            return "A4";
        }
    });
    const setPaper = (p: PaperSize) => {
        setPaperState(p);
        try {
            localStorage.setItem(STORAGE_KEY, p);
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
