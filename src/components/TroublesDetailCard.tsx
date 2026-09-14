import type { TroubleGroup } from "../types";
import type { RankFilter } from "../hooks/useRankFilter";
import styles from "./TroublesDetailCard.module.css";
import vpStyles from "./VegetablePage.module.css";

interface TroublesDetailCardProps {
    groups: TroubleGroup[];
    rankFilter?: RankFilter;
    /** When set, conditions with applies_to that excludes this key are hidden. */
    vegKey?: string;
}

export function TroublesDetailCard({
    groups,
    rankFilter,
    vegKey,
}: TroublesDetailCardProps) {
    if (groups.length === 0) return null;

    return (
        <>
            {groups.map((group) => {
                const allConditions = group.conditions
                    ? Object.entries(group.conditions)
                    : [];

                // Filter conditions by rank, then sort highest rank first
                const conditions = (
                    rankFilter
                        ? allConditions.filter(
                              ([, cond]) =>
                                  cond.rank == null || rankFilter(cond.rank),
                          )
                        : allConditions
                )
                    // Filter out conditions tagged as only applying to a different vegetable
                    .filter(
                        ([, cond]) =>
                            !vegKey ||
                            !cond.applies_to ||
                            cond.applies_to.includes(vegKey),
                    )
                    .sort(([, a], [, b]) => (b.rank ?? 0) - (a.rank ?? 0));

                // For the symptom lookup, a row is visible only when at least
                // one of its causes links to a condition that passes the rank
                // filter.  Free-text causes ("Slugs — see page 110") pass only
                // when no rank filter is active (show-all mode).
                const visibleCondKeys = new Set(conditions.map(([k]) => k));
                const filteredSymptoms = (group.symptom_lookup ?? []).filter(
                    (row) => {
                        const hasVisibleCond = row.likely_causes.some(
                            (cause) => {
                                const k = String(cause);
                                return (
                                    group.conditions?.[k] !== undefined &&
                                    visibleCondKeys.has(k)
                                );
                            },
                        );
                        if (hasVisibleCond) return true;
                        // No linked condition passes: hide when filtering
                        return !rankFilter;
                    },
                );

                return (
                    <div
                        key={group.source_heading}
                        className={`${vpStyles.card} ${styles.detailCard}`}
                    >
                        <div className={vpStyles.cardHeader}>
                            <span className={vpStyles.cardIcon}>🔬</span>
                            <h2 className={vpStyles.cardTitle}>
                                {group.source_heading} — Full Guide
                            </h2>
                        </div>

                        {group.introduction && (
                            <p className={styles.intro}>{group.introduction}</p>
                        )}

                        {/* Symptom look-up table */}
                        {filteredSymptoms.length > 0 && (
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    Symptom Finder
                                </h3>
                                <div className={styles.tableWrap}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th className={styles.th}>
                                                    Part affected
                                                </th>
                                                <th className={styles.th}>
                                                    Symptom
                                                </th>
                                                <th className={styles.th}>
                                                    Likely cause(s)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSymptoms.map((row, i) => (
                                                <tr
                                                    key={i}
                                                    className={
                                                        i % 2 === 0
                                                            ? styles.rowEven
                                                            : styles.rowOdd
                                                    }
                                                >
                                                    <td className={styles.td}>
                                                        {row.plant_part}
                                                    </td>
                                                    <td className={styles.td}>
                                                        {row.symptom}
                                                    </td>
                                                    <td className={styles.td}>
                                                        {row.likely_causes
                                                            .map((cause) => {
                                                                const key =
                                                                    String(
                                                                        cause,
                                                                    );
                                                                const cond =
                                                                    group
                                                                        .conditions?.[
                                                                        key
                                                                    ];
                                                                return cond
                                                                    ? cond.name
                                                                    : key;
                                                            })
                                                            .join(", ")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Condition cards */}
                        {conditions.length > 0 && (
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    Pests &amp; Diseases Explained
                                </h3>
                                <div className={styles.conditionGrid}>
                                    {conditions.map(([, cond]) => (
                                        <div
                                            key={cond.name}
                                            className={`${styles.conditionCard}${cond.star ? " " + styles.conditionCardStarred : ""}`}
                                        >
                                            <div
                                                className={
                                                    styles.conditionHeader
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.conditionName
                                                    }
                                                >
                                                    {cond.star && (
                                                        <span
                                                            className={
                                                                vpStyles.starBadge
                                                            }
                                                        >
                                                            ★ Key Problem
                                                        </span>
                                                    )}
                                                    {cond.name}
                                                </span>
                                                {cond.visual_heading && (
                                                    <span
                                                        className={
                                                            styles.conditionVisual
                                                        }
                                                    >
                                                        {cond.visual_heading}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    cond.image
                                                        ? styles.conditionBody
                                                        : undefined
                                                }
                                            >
                                                {cond.image && (
                                                    <img
                                                        src={cond.image}
                                                        alt={
                                                            cond.visual_heading ??
                                                            cond.name
                                                        }
                                                        className={
                                                            styles.conditionImage
                                                        }
                                                        loading="lazy"
                                                    />
                                                )}
                                                <div>
                                                    {cond.description && (
                                                        <p
                                                            className={
                                                                styles.conditionDesc
                                                            }
                                                        >
                                                            {cond.description}
                                                        </p>
                                                    )}
                                                    {(cond.treatment ||
                                                        cond.prevention) && (
                                                        <div
                                                            className={
                                                                styles.conditionActions
                                                            }
                                                        >
                                                            {cond.treatment && (
                                                                <div
                                                                    className={
                                                                        styles.actionItem
                                                                    }
                                                                >
                                                                    <span
                                                                        className={
                                                                            styles.actionLabel
                                                                        }
                                                                    >
                                                                        Treatment
                                                                    </span>
                                                                    <span
                                                                        className={
                                                                            styles.actionText
                                                                        }
                                                                    >
                                                                        {
                                                                            cond.treatment
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {cond.prevention && (
                                                                <div
                                                                    className={
                                                                        styles.actionItem
                                                                    }
                                                                >
                                                                    <span
                                                                        className={
                                                                            styles.actionLabel
                                                                        }
                                                                    >
                                                                        Prevention
                                                                    </span>
                                                                    <span
                                                                        className={
                                                                            styles.actionText
                                                                        }
                                                                    >
                                                                        {
                                                                            cond.prevention
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
}
