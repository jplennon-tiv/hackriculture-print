import { useState, useEffect, Component } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AdminLogin } from "./AdminLogin";
import { AdminNav } from "./AdminNav";
import { AdminVegetablePage } from "./AdminVegetablePage";
import { AdminTroublePage } from "./AdminTroublePage";
import { AddVegetablePage } from "./AddVegetablePage";
import { useAdminAuth } from "./useAdminAuth";
import {
    fetchAdminData,
    saveData,
    uploadImage,
    deleteImage,
    type ImageTarget,
} from "./adminApi";
import type { GardeningData, TroublesData } from "../types";
import { slugify } from "../lib/slug";
import styles from "./Admin.module.css";

// ── Error boundary so runtime errors show a message instead of blank page ────
class AdminErrorBoundary extends Component<
    { children: React.ReactNode },
    { error: string | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { error: null };
    }
    static getDerivedStateFromError(e: unknown) {
        return { error: String(e) };
    }
    render() {
        if (this.state.error) {
            return (
                <div
                    style={{
                        padding: "2rem",
                        fontFamily: "monospace",
                        background: "#fff1f2",
                        color: "#9f1239",
                        minHeight: "100vh",
                    }}
                >
                    <h2>Admin render error</h2>
                    <pre style={{ whiteSpace: "pre-wrap" }}>
                        {this.state.error}
                    </pre>
                    <button onClick={() => this.setState({ error: null })}>
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ── Protected wrapper ─────────────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthed } = useAdminAuth();
    if (!isAuthed()) return <Navigate to="/admin/login" replace />;
    return <>{children}</>;
}

// ── Admin shell with nav + data ───────────────────────────────────────────────
function AdminShell() {
    const { getPassword, logout } = useAdminAuth();
    const navigate = useNavigate();

    const [vegetables, setVegetables] = useState<GardeningData | null>(null);
    const [troubles, setTroubles] = useState<TroublesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        fetchAdminData()
            .then((d) => {
                setVegetables(d.vegetables);
                setTroubles(d.troubles);
            })
            .catch((err) => {
                const msg = String(err);
                setLoadError(msg);
                // If it looks like an auth issue, log out
                if (msg.includes("401")) {
                    logout();
                    navigate("/admin/login");
                }
            })
            .finally(() => setLoading(false));
    }, [logout, navigate]);

    const handleSave = async (
        newVeg: GardeningData,
        newTroubles?: TroublesData,
    ) => {
        const pw = getPassword();
        await saveData(pw, newVeg, newTroubles);
        setVegetables(newVeg);
        if (newTroubles) setTroubles(newTroubles);
    };

    const handleSaveTroubles = async (newTroubles: TroublesData) => {
        const pw = getPassword();
        await saveData(pw, vegetables!, newTroubles);
        setTroubles(newTroubles);
    };

    const handleImageUpload = async (target: ImageTarget, file: File) => {
        const pw = getPassword();
        await uploadImage(pw, target, file);
        // Reload so local state reflects new image paths
        const d = await fetchAdminData();
        setVegetables(d.vegetables);
        setTroubles(d.troubles);
    };

    const handleImageDelete = async (target: ImageTarget) => {
        const pw = getPassword();
        await deleteImage(pw, target);
        const d = await fetchAdminData();
        setVegetables(d.vegetables);
        setTroubles(d.troubles);
    };

    if (loading)
        return <div className={styles.loadingState}>Loading data…</div>;

    if (loadError) {
        return (
            <div className={styles.errorState}>
                <p>
                    <strong>Could not load admin data.</strong>
                </p>
                <p>{loadError}</p>
                <p>
                    Make sure the dev server is running (
                    <code>npm run dev</code>).
                </p>
            </div>
        );
    }

    const vegList = Object.values(vegetables ?? {})
        .map((v) => v.name ?? "")
        .filter(Boolean);
    const firstSlug = vegList.length > 0 ? slugify(vegList[0]) : "";
    const firstTroubleSlug = troubles ? (Object.keys(troubles)[0] ?? "") : "";

    return (
        <div className={styles.adminShell}>
            {/* Amber admin header */}
            <header className={styles.adminHeader}>
                <div className={styles.adminHeaderInner}>
                    <div className={styles.adminLogo}>
                        <span className={styles.adminLogoIcon}>🌿</span>
                        <span className={styles.adminLogoText}>
                            hackriculture-print
                        </span>
                    </div>
                    <span className={styles.adminBadge}>Admin</span>
                </div>
            </header>

            {/* Nav */}
            <AdminNav
                vegetables={vegList}
                troublesData={troubles}
                vegetableData={vegetables}
            />

            {/* Content */}
            <main className={styles.adminMain}>
                <Routes>
                    <Route
                        path="vegetable"
                        element={
                            <Navigate
                                to={
                                    firstSlug
                                        ? `/admin/vegetable/${firstSlug}`
                                        : "/admin/add"
                                }
                                replace
                            />
                        }
                    />
                    <Route
                        path="vegetable/:slug"
                        element={
                            vegetables ? (
                                <AdminVegetablePage
                                    data={vegetables}
                                    onSave={handleSave}
                                    onImageUpload={handleImageUpload}
                                    onImageDelete={handleImageDelete}
                                />
                            ) : null
                        }
                    />
                    <Route
                        path="add"
                        element={
                            vegetables ? (
                                <AddVegetablePage
                                    data={vegetables}
                                    onSave={handleSave}
                                />
                            ) : null
                        }
                    />
                    <Route
                        path="troubles"
                        element={
                            <Navigate
                                to={
                                    firstTroubleSlug
                                        ? `/admin/troubles/${firstTroubleSlug}`
                                        : "/admin"
                                }
                                replace
                            />
                        }
                    />
                    <Route
                        path="troubles/:slug"
                        element={
                            troubles ? (
                                <AdminTroublePage
                                    troublesData={troubles}
                                    onSave={handleSaveTroubles}
                                    onImageUpload={handleImageUpload}
                                    onImageDelete={handleImageDelete}
                                />
                            ) : null
                        }
                    />
                    <Route
                        path="*"
                        element={<Navigate to="vegetable" replace />}
                    />
                </Routes>
            </main>

            <footer className={styles.adminFooter}>
                hackriculture-print Admin — changes are backed up automatically to
                hackriculture-data/backups/admin/
            </footer>
        </div>
    );
}

// ── Public export ─────────────────────────────────────────────────────────────
export function AdminApp() {
    return (
        <AdminErrorBoundary>
            <Routes>
                <Route path="login" element={<AdminLogin />} />
                <Route
                    path="*"
                    element={
                        <RequireAuth>
                            <AdminShell />
                        </RequireAuth>
                    }
                />
            </Routes>
        </AdminErrorBoundary>
    );
}
