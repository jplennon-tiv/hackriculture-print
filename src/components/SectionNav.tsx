import { NavLink, useLocation } from "react-router-dom";
import { useRankSearch } from "../hooks/useRankFilter";
import styles from "./SectionNav.module.css";

interface SectionNavProps {
    defaultVegetableSlug: string;
    defaultTroubleSlug: string;
}

export function SectionNav({
    defaultVegetableSlug,
    defaultTroubleSlug,
}: SectionNavProps) {
    const rankSearch = useRankSearch();
    // useLocation keeps the active-tab detection in sync
    useLocation();
    return (
        <div className={styles.bar}>
            <div className={styles.inner}>
                <NavLink
                    to={`/vegetable/${defaultVegetableSlug}${rankSearch}`}
                    className={({ isActive }) =>
                        `${styles.tab} ${isActive ? styles.tabActive : ""}`
                    }
                    // Mark active for any /vegetable/* route
                    end={false}
                >
                    🌱 Vegetables
                </NavLink>
                <NavLink
                    to={`/troubles/${defaultTroubleSlug}${rankSearch}`}
                    className={({ isActive }) =>
                        `${styles.tab} ${isActive ? styles.tabActive : ""}`
                    }
                    end={false}
                >
                    🐛 Pest &amp; Disease Guides
                </NavLink>
            </div>
        </div>
    );
}
