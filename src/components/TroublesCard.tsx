import type { Troubles } from "../types";
import type { RankFilter } from "../hooks/useRankFilter";
import { useUnits } from "../lib/units";
import { getRank, rt } from "../lib/ranked";
import styles from "./VegetablePage.module.css";

interface TroublesCardProps {
    troubles: Troubles;
    rankFilter?: RankFilter;
}

export function TroublesCard({ troubles, rankFilter }: TroublesCardProps) {
    const { system } = useUnits();
    const passRank = rankFilter ?? (() => true);
    const note = troubles._note;
    const entries = Object.entries(troubles)
        .filter(([key, val]) => {
            if (key === "_note" || key === "_redirect") return false;
            if (val == null || val === "") return false;
            if (typeof val === "object" && "rank" in val) {
                return passRank((val as { rank: number }).rank);
            }
            return true;
        })
        .sort(([, a], [, b]) => getRank(b) - getRank(a));

    if (entries.length === 0 && !note) return null;

    return (
        <div className={styles.card + " " + styles.troublesCard}>
            <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🐛</span>
                <h2 className={styles.cardTitle}>Pests &amp; Diseases</h2>
            </div>
            {note && <p className={styles.troublesNote}>{note}</p>}
            {entries.length > 0 && (
                <div className={styles.troublesList}>
                    {entries.map(([name, desc]) => {
                        const starred =
                            typeof desc === "object" &&
                            desc !== null &&
                            "star" in desc &&
                            (desc as { star?: boolean }).star === true;
                        return (
                            <div
                                key={name}
                                className={`${styles.troubleItem}${starred ? " " + styles.troubleItemStarred : ""}`}
                            >
                                <span className={styles.troubleName}>
                                    {starred && (
                                        <span className={styles.starBadge}>
                                            ★ Key Pest
                                        </span>
                                    )}
                                    {name}
                                </span>
                                <p className={styles.troubleDesc}>
                                    {rt(desc, system)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
