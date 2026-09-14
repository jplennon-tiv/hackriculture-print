import { NavLink, useParams } from "react-router-dom";
import { useRankSearch } from "../hooks/useRankFilter";
import groupsData from "../../../hackriculture-data/vegetable_groups.json";
import styles from "./Nav.module.css";

const GROUPS = groupsData as Record<string, string[]>;

interface NavProps {
    vegetables: string[];
    slugify: (name: string) => string;
}

export function Nav({ vegetables, slugify }: NavProps) {
    const { slug } = useParams<{ slug: string }>();
    const rankSearch = useRankSearch();

    // Vegetables not assigned to any group (safety net)
    const grouped = new Set(Object.values(GROUPS).flat());
    const ungrouped = vegetables.filter((v) => !grouped.has(v));

    return (
        <nav className={styles.nav}>
            <div className={styles.navInner}>
                <ul className={styles.navList}>
                    {Object.entries(GROUPS).map(([groupName, members]) => {
                        // Only show groups that have vegetables in the dataset
                        const available = members.filter((m) =>
                            vegetables.includes(m),
                        );
                        if (available.length === 0) return null;

                        const isGroupActive = available.some(
                            (m) => slugify(m) === slug,
                        );

                        return (
                            <li key={groupName} className={styles.navGroup}>
                                <button
                                    className={`${styles.groupBtn} ${isGroupActive ? styles.groupBtnActive : ""}`}
                                    tabIndex={0}
                                >
                                    {groupName}
                                    <span className={styles.caret}>▾</span>
                                </button>
                                <ul className={styles.dropdown}>
                                    {available.map((veg) => (
                                        <li key={veg}>
                                            <NavLink
                                                to={`/vegetable/${slugify(veg)}${rankSearch}`}
                                                className={({ isActive }) =>
                                                    `${styles.dropdownLink} ${isActive ? styles.dropdownLinkActive : ""}`
                                                }
                                            >
                                                {veg}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        );
                    })}

                    {/* Fallback for any ungrouped vegetables */}
                    {ungrouped.map((veg) => (
                        <li key={veg} className={styles.navItem}>
                            <NavLink
                                to={`/vegetable/${slugify(veg)}${rankSearch}`}
                                className={({ isActive }) =>
                                    `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                                }
                            >
                                {veg}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
