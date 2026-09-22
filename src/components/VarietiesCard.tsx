import type { ReactNode } from "react";
import type { Varieties, VarietyGroup } from "../types";
import type { RankFilter } from "../hooks/useRankFilter";
import { useUnits } from "../lib/units";
import type { UnitSystem } from "../lib/measure";
import { isRankedText, rt } from "../lib/ranked";
import { isoMonthToName } from "../lib/months";
import styles from "./VegetablePage.module.css";

/** True if any non-meta entry in the group (recursively) would be visible. */
function hasVisibleEntries(
    raw: Record<string, unknown>,
    rankFilter?: RankFilter,
): boolean {
    return Object.entries(raw).some(([k, val]) => {
        if (META_KEYS.has(k) || val == null || val === "" || Array.isArray(val))
            return false;
        if (isRankedText(val)) return !rankFilter || rankFilter(val.rank);
        if (typeof val === "object")
            return hasVisibleEntries(
                val as Record<string, unknown>,
                rankFilter,
            );
        return true; // plain unranked string — always visible
    });
}

// Keys rendered separately — not as variety items
const META_KEYS = new Set([
    "overview",
    "other_names",
    "description",
    "maturity_months",
]);

/** Recursively render a group of varieties (may contain sub-groups) */
function renderGroup(
    group: VarietyGroup,
    system: UnitSystem,
    depth = 0,
    rankFilter?: RankFilter,
): ReactNode {
    // Pull out all known meta fields
    const raw = group as Record<string, unknown>;
    const overview = raw.overview as string | undefined;
    const other_names = raw.other_names as string | undefined;
    const description = raw.description as string | undefined;
    const maturity_months = raw.maturity_months as string[] | undefined;

    const entries = Object.entries(raw)
        .filter(
            ([k, val]) =>
                !META_KEYS.has(k) &&
                val != null &&
                val !== "" &&
                !Array.isArray(val) &&
                (!(isRankedText(val) && rankFilter) || rankFilter(val.rank)),
        )
        .sort(([, a], [, b]) => {
            const ra = isRankedText(a) ? a.rank : 0;
            const rb = isRankedText(b) ? b.rank : 0;
            return rb - ra;
        });

    return (
        <>
            {other_names && (
                <p className={styles.varietyOtherNames}>{other_names}</p>
            )}
            {/* overview or description — render as intro text */}
            {(overview || description) && (
                <p
                    className={
                        depth === 0
                            ? styles.cardText
                            : styles.varietyGroupOverview
                    }
                >
                    {overview ?? description}
                </p>
            )}
            {/* maturity_months — render as a readable month list */}
            {maturity_months && maturity_months.length > 0 && (
                <p className={styles.varietyMaturityMonths}>
                    Harvests: {maturity_months.map(isoMonthToName).join(", ")}
                </p>
            )}
            {entries.length > 0 && (
                <div
                    className={
                        depth === 0 ? styles.varietyList : styles.varietySubList
                    }
                >
                    {entries.map(([name, val]) => {
                        // Format underscore_keys → "Sentence case" for display
                        const displayName = name.includes("_")
                            ? name
                                  .replace(/_/g, " ")
                                  .replace(/^\w/, (c) => c.toUpperCase())
                            : name;
                        if (typeof val === "object" && val !== null) {
                            // RankedText leaf — render as a variety item
                            if (isRankedText(val)) {
                                return (
                                    <div
                                        key={name}
                                        className={`${styles.varietyItem}${val.star ? " " + styles.varietyItemStarred : ""}`}
                                    >
                                        {val.star && (
                                            <span className={styles.starBadge}>
                                                ★ Star Variety
                                            </span>
                                        )}
                                        <span className={styles.varietyName}>
                                            {displayName}
                                        </span>
                                        <p className={styles.varietyDesc}>
                                            {rt(val, system)}
                                        </p>
                                    </div>
                                );
                            }
                            // Variety sub-group — recurse
                            return (
                                <div key={name} className={styles.varietyGroup}>
                                    <h3 className={styles.varietyGroupName}>
                                        {displayName}
                                    </h3>
                                    {renderGroup(
                                        val as VarietyGroup,
                                        system,
                                        depth + 1,
                                        rankFilter,
                                    )}
                                </div>
                            );
                        }
                        return (
                            <div key={name} className={styles.varietyItem}>
                                <span className={styles.varietyName}>
                                    {displayName}
                                </span>
                                <p className={styles.varietyDesc}>
                                    {val as string}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}

interface VarietiesCardProps {
    varieties: Varieties;
    rankFilter?: RankFilter;
}

export function VarietiesCard({ varieties, rankFilter }: VarietiesCardProps) {
    const { system } = useUnits();
    const raw = varieties as Record<string, unknown>;
    const hasContent = raw.overview || hasVisibleEntries(raw, rankFilter);

    if (!hasContent) return null;

    return (
        <div className={styles.card + " " + styles.varietiesCard}>
            <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🏷️</span>
                <h2 className={styles.cardTitle}>Recommended Varieties</h2>
            </div>
            {renderGroup(raw as VarietyGroup, system, 0, rankFilter)}
        </div>
    );
}
