import { lazy, Suspense } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";
import { Nav } from "./components/Nav";
import { TroubleNav } from "./components/TroubleNav";
import { SectionNav } from "./components/SectionNav";
import { BatchPrintButton } from "./components/BatchPrintButton";
import UnitToggle from "./components/UnitToggle";
import PaperToggle from "./components/PaperToggle";
import { UnitsProvider } from "./lib/units";
import { PaperProvider } from "./lib/paper";
import { VegetablePage } from "./components/VegetablePage";
import vegetablesJson from "../../hackriculture-data/generated/master/vegetables.json";
import troublesJson from "../../hackriculture-data/generated/master/troubles.json";
import type { GardeningData, TroublesData } from "./types";
import { slugify } from "./lib/slug";
import {
    GardeningDataSchema,
    TroublesDataSchema,
    safeParseWithWarnings,
} from "./schema";
import "./App.css";

// Split heavy routes into their own chunks
const TroublePage = lazy(() =>
    import("./components/TroublePage").then((m) => ({
        default: m.TroublePage,
    })),
);
const AdminApp = lazy(() =>
    import("./admin/AdminApp").then((m) => ({ default: m.AdminApp })),
);
const PrintVegetablePage = lazy(() =>
    import("./print/PrintVegetablePage").then((m) => ({
        default: m.PrintVegetablePage,
    })),
);
const PrintTroublePage = lazy(() =>
    import("./print/PrintTroublePage").then((m) => ({
        default: m.PrintTroublePage,
    })),
);

const RouteFallback = () => (
    <p style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
        Loading…
    </p>
);

const data = safeParseWithWarnings(
    GardeningDataSchema,
    vegetablesJson,
    "vegetables.json",
) as GardeningData;
const troublesData = safeParseWithWarnings(
    TroublesDataSchema,
    troublesJson,
    "troubles.json",
) as TroublesData;
// Extract ordered display names from the new name field
const vegetables = Object.values(data)
    .map((v) => v.name ?? "")
    .filter(Boolean);
const defaultVegSlug = slugify(vegetables[0]);
const defaultTroubleSlug = Object.keys(troublesData)[0];

// ── Public app shell — uses useLocation so must be inside BrowserRouter ──────
function PublicShell() {
    const location = useLocation();
    const isTroubles = location.pathname.startsWith("/troubles");

    return (
        <UnitsProvider>
            <PaperProvider>
                <div className="app">
                    <header className="app-header">
                        <div className="app-header-inner">
                            <div className="app-logo">
                                <span className="app-logo-icon">🌿</span>
                                <span className="app-logo-text">
                                    hackriculture-print
                                </span>
                            </div>
                            <UnitToggle />
                            <PaperToggle />
                            <BatchPrintButton />
                        </div>
                    </header>

                    {/* ── Section tabs: Vegetables | Pest & Disease Guides ── */}
                    <SectionNav
                        defaultVegetableSlug={defaultVegSlug}
                        defaultTroubleSlug={defaultTroubleSlug}
                    />

                    {/* ── Context-sensitive sub-nav ── */}
                    {isTroubles ? (
                        <TroubleNav troublesData={troublesData} />
                    ) : (
                        <Nav vegetables={vegetables} slugify={slugify} />
                    )}

                    <main className="app-main">
                        <Suspense fallback={<RouteFallback />}>
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <Navigate
                                            to={`/vegetable/${defaultVegSlug}`}
                                            replace
                                        />
                                    }
                                />
                                <Route
                                    path="/vegetable/:slug"
                                    element={
                                        <VegetablePage
                                            data={data}
                                            troublesData={troublesData}
                                            slugify={slugify}
                                        />
                                    }
                                />
                                <Route
                                    path="/troubles"
                                    element={
                                        <Navigate
                                            to={`/troubles/${defaultTroubleSlug}`}
                                            replace
                                        />
                                    }
                                />
                                <Route
                                    path="/troubles/:slug"
                                    element={
                                        <TroublePage
                                            troublesData={troublesData}
                                        />
                                    }
                                />
                            </Routes>
                        </Suspense>
                    </main>
                    <footer className="app-footer">
                        <p>hackriculture-print &mdash; Vegetable Growing Reference</p>
                    </footer>
                </div>
            </PaperProvider>
        </UnitsProvider>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
                <Routes>
                    {/* ── Admin area: full-page, own layout ── */}
                    <Route path="/admin/*" element={<AdminApp />} />

                    {/* ── Print routes: no navigation, rendered by Playwright ── */}
                    <Route
                        path="/print/vegetable/:slug"
                        element={<PrintVegetablePage />}
                    />
                    <Route
                        path="/print/trouble/:slug"
                        element={<PrintTroublePage />}
                    />

                    {/* ── Public app ── */}
                    <Route path="*" element={<PublicShell />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
