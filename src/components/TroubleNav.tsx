import { NavLink } from "react-router-dom";
import { useRankSearch } from "../hooks/useRankFilter";
import type { TroublesData } from "../types";
import styles from "./TroubleNav.module.css";

interface TroubleNavProps {
    troublesData: TroublesData;
}

export function TroubleNav({ troublesData }: TroubleNavProps) {
    const rankSearch = useRankSearch();
    return (
        <nav className={styles.nav}>
            <div className={styles.navInner}>
                <ul className={styles.navList}>
                    {Object.entries(troublesData).map(([key, group]) => (
                        <li key={key}>
                            <NavLink
                                to={`/troubles/${key}${rankSearch}`}
                                className={({ isActive }) =>
                                    `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                                }
                            >
                                {group.source_heading}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
