import { useEffect } from "react";
import { useParams } from "react-router-dom";
import troublesJson from "../../../hackriculture-data/troubles.json";
import type { TroublesData } from "../types";
import styles from "./print.module.css";

const data = troublesJson as TroublesData;

export function PrintTroublePage() {
    const { slug } = useParams<{ slug: string }>();
    const key = slug ?? "";
    const group = data[key];

    // Signal to the Playwright PDF renderer that the page is ready. Mirrors
    // the `data-print-ready` marker set by PrintVegetablePage.
    useEffect(() => {
        document.body.dataset.printReady = "true";
        return () => {
            delete document.body.dataset.printReady;
        };
    }, [slug]);

    if (!group) return <p>Trouble guide "{slug}" not found.</p>;

    const conditions = group.conditions
        ? Object.entries(group.conditions).sort(
              ([, a], [, b]) => (b.rank ?? 0) - (a.rank ?? 0),
          )
        : [];

    const appliesTo = group.applies_to?.length
        ? group.applies_to
              .map((k) =>
                  k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              )
              .join(", ")
        : null;

    return (
        <div>
            {/* Header */}
            <div className={styles.printHeader}>
                <div className={styles.printHeaderInner}>
                    <p className={styles.printLogoLine}>
                        hackriculture-print — Pest & Disease Guide
                    </p>
                    <h1 className={styles.printTitle}>
                        {group.source_heading}
                    </h1>
                    {appliesTo && (
                        <p className={styles.appliesTo}>
                            Applies to: {appliesTo}
                        </p>
                    )}
                </div>
            </div>

            {/* Introduction */}
            {group.introduction && (
                <div
                    className={styles.troubleItem}
                    style={{
                        marginBottom: 16,
                        borderColor: "#c8e6c0",
                        background: "#f0f7ed",
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: "10pt",
                            color: "#333",
                            lineHeight: 1.6,
                        }}
                    >
                        {group.introduction}
                    </p>
                </div>
            )}

            {/* Conditions */}
            {conditions.length > 0 && (
                <>
                    <div className={styles.sectionBar}>
                        <p className={styles.sectionTitle}>
                            Pests & Diseases Explained
                        </p>
                    </div>
                    {conditions.map(([, cond]) => (
                        <div key={cond.name} className={styles.condCard}>
                            <div className={styles.condNameRow}>
                                <h3 className={styles.condName}>{cond.name}</h3>
                                {cond.star && (
                                    <span className={styles.starBadge}>
                                        ★ Key Problem
                                    </span>
                                )}
                            </div>
                            {cond.visual_heading && (
                                <p className={styles.condVisual}>
                                    {cond.visual_heading}
                                </p>
                            )}
                            {cond.description && (
                                <p className={styles.condDesc}>
                                    {cond.description}
                                </p>
                            )}
                            {(cond.treatment || cond.prevention) && (
                                <div className={styles.condActions}>
                                    {cond.treatment && (
                                        <div className={styles.condActionBox}>
                                            <span
                                                className={
                                                    styles.condActionLabel
                                                }
                                            >
                                                Treatment
                                            </span>
                                            <span
                                                className={
                                                    styles.condActionText
                                                }
                                            >
                                                {cond.treatment}
                                            </span>
                                        </div>
                                    )}
                                    {cond.prevention && (
                                        <div className={styles.condActionBox}>
                                            <span
                                                className={
                                                    styles.condActionLabel
                                                }
                                            >
                                                Prevention
                                            </span>
                                            <span
                                                className={
                                                    styles.condActionText
                                                }
                                            >
                                                {cond.prevention}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}

            <div className={styles.printFooter}>
                <span>hackriculture-print — {group.source_heading}</span>
                <span>gardenguide.app</span>
            </div>
        </div>
    );
}
