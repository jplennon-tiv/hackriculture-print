import { useParams, Navigate, useSearchParams } from "react-router-dom";
import type { TroublesData } from "../types";
import { TroublesDetailCard } from "./TroublesDetailCard";
import { useRankFilter } from "../hooks/useRankFilter";
import styles from "./VegetablePage.module.css";

import TroublePdfDownload from "../pdf/TroublePdfDownload";

interface TroublePageProps {
    troublesData: TroublesData;
}

export function TroublePage({ troublesData }: TroublePageProps) {
    const { slug } = useParams<{ slug: string }>();

    const keys = Object.keys(troublesData);
    const key = slug && troublesData[slug] ? slug : keys[0];

    if (!key) return null;

    // Redirect bare /troubles to the first entry
    if (!slug || !troublesData[slug]) {
        return <Navigate to={`/troubles/${key}`} replace />;
    }

    const group = troublesData[key];
    const rankFilter = useRankFilter();
    const [searchParams] = useSearchParams();
    const fromVegKey = searchParams.get("from") ?? undefined;

    return (
        <div className={styles.page}>
            {/* Hero */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <p className={styles.heroSubtitle}>
                        Pest &amp; Disease Guide
                    </p>
                    <h1 className={styles.heroTitle}>{group.source_heading}</h1>
                    {group.applies_to && group.applies_to.length > 0 && (
                        <p className={styles.heroIntro}>
                            Applies to: {group.applies_to.join(", ")}
                        </p>
                    )}
                    <TroublePdfDownload
                        troubleKey={key}
                        className={styles.pdfBtn}
                    />
                </div>
            </div>

            {/* Full detail */}
            <div className={styles.fullWidthSection}>
                <TroublesDetailCard
                    groups={[group]}
                    rankFilter={rankFilter}
                    vegKey={fromVegKey}
                />
            </div>
        </div>
    );
}
