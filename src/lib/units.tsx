import { createContext, useContext, useState, type ReactNode } from "react";
import type { UnitSystem } from "./measure";

const STORAGE_KEY = "gg-units";

interface UnitsCtx {
    system: UnitSystem;
    setSystem: (s: UnitSystem) => void;
}

const UnitsContext = createContext<UnitsCtx>({
    system: "imperial",
    setSystem: () => {},
});

/** Public-app units preference, persisted to localStorage. */
export function UnitsProvider({ children }: { children: ReactNode }) {
    const [system, setSystemState] = useState<UnitSystem>(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === "metric"
                ? "metric"
                : "imperial";
        } catch {
            return "imperial";
        }
    });
    const setSystem = (s: UnitSystem) => {
        setSystemState(s);
        try {
            localStorage.setItem(STORAGE_KEY, s);
        } catch {
            /* storage unavailable — session-only */
        }
    };
    return (
        <UnitsContext.Provider value={{ system, setSystem }}>
            {children}
        </UnitsContext.Provider>
    );
}

export function useUnits(): UnitsCtx {
    return useContext(UnitsContext);
}
