import { NavLink, useParams, useNavigate, useLocation } from "react-router-dom";
import groupsData from "../../../hackriculture-data/vegetable_groups.json";
import type { GardeningData, TroublesData } from "../types";
import { computeQfScore } from "./qfHelpers";
import { useAdminAuth } from "./useAdminAuth";
import { slugify } from "../lib/slug";
import styles from "./Admin.module.css";

const GROUPS = groupsData as Record<string, string[]>;

interface AdminNavProps {
    vegetables: string[];
    troublesData: TroublesData | null;
    vegetableData?: GardeningData | null;
}

export function AdminNav({
    vegetables,
    troublesData,
    vegetableData,
}: AdminNavProps) {
    const { slug } = useParams<{ slug: string }>();
    const location = useLocation();
    const { logout } = useAdminAuth();
    const navigate = useNavigate();

    const isTroublesSection = location.pathname.startsWith("/admin/troubles");
    const grouped = new Set(Object.values(GROUPS).flat());
    const ungrouped = vegetables.filter((v) => !grouped.has(v));

    // ── Completeness dot helper ───────────────────────────────────────────────
    const dot = (vegName: string) => {
        if (!vegetableData) return null;
        const score = computeQfScore(vegetableData[slugify(vegName)]);
        const cls =
            score.filled >= 7
                ? styles.qfDotGreen
                : score.filled >= 4
                  ? styles.qfDotAmber
                  : styles.qfDotRed;
        return (
            <span
                className={`${styles.qfDot} ${cls}`}
                title={`${score.filled}/${score.total} Quick Facts complete`}
            />
        );
    };

    const handleLogout = () => {
        logout();
        navigate("/admin/login");
    };

    return (
        <nav className={styles.adminNav}>
            <div className={styles.adminNavInner}>
                <ul className={styles.adminNavList}>
                    {Object.entries(GROUPS).map(([groupName, members]) => {
                        const available = members.filter((m) =>
                            vegetables.includes(m),
                        );
                        if (available.length === 0) return null;
                        const isGroupActive = available.some(
                            (m) => slugify(m) === slug,
                        );
                        return (
                            <li
                                key={groupName}
                                className={styles.adminNavGroup}
                            >
                                <button
                                    className={`${styles.adminGroupBtn} ${isGroupActive ? styles.adminGroupBtnActive : ""}`}
                                >
                                    {groupName}{" "}
                                    <span className={styles.adminCaret}>▾</span>
                                </button>
                                <ul className={styles.adminDropdown}>
                                    {available.map((veg) => (
                                        <li key={veg}>
                                            <NavLink
                                                to={`/admin/vegetable/${slugify(veg)}`}
                                                className={({ isActive }) =>
                                                    `${styles.adminDropdownLink} ${isActive ? styles.adminDropdownLinkActive : ""}`
                                                }
                                            >
                                                {veg}
                                                {dot(veg)}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        );
                    })}
                    {ungrouped.map((veg) => (
                        <li key={veg} className={styles.adminNavItem}>
                            <NavLink
                                to={`/admin/vegetable/${slugify(veg)}`}
                                className={({ isActive }) =>
                                    `${styles.adminNavLink} ${isActive ? styles.adminNavLinkActive : ""}`
                                }
                            >
                                {veg}
                                {dot(veg)}
                            </NavLink>
                        </li>
                    ))}

                    {/* Add vegetable */}
                    <li className={styles.adminNavItem}>
                        <NavLink
                            to="/admin/add"
                            className={styles.adminNavLink}
                        >
                            ＋ Add Vegetable
                        </NavLink>
                    </li>

                    {/* Troubles section */}
                    {troublesData && Object.keys(troublesData).length > 0 && (
                        <li className={styles.adminNavGroup}>
                            <button
                                className={`${styles.adminGroupBtn} ${isTroublesSection ? styles.adminGroupBtnActive : ""}`}
                            >
                                🐛 Pest &amp; Disease Guides{" "}
                                <span className={styles.adminCaret}>▾</span>
                            </button>
                            <ul className={styles.adminDropdown}>
                                {Object.entries(troublesData).map(
                                    ([key, group]) => (
                                        <li key={key}>
                                            <NavLink
                                                to={`/admin/troubles/${key}`}
                                                className={({ isActive }) =>
                                                    `${styles.adminDropdownLink} ${isActive ? styles.adminDropdownLinkActive : ""}`
                                                }
                                            >
                                                {group.source_heading}
                                            </NavLink>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </li>
                    )}
                </ul>

                <button className={styles.logoutBtn} onClick={handleLogout}>
                    Log out
                </button>
            </div>
        </nav>
    );
}
