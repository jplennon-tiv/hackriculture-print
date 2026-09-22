import { useParams, Link } from "react-router-dom";
import type { GardeningData, TroublesData, Vegetable } from "../types";
import { CalendarCard } from "./CalendarCard";
import { SowingPanel } from "./SowingPanel";
import { useUnits } from "../lib/units";
import { VarietiesCard } from "./VarietiesCard";
import { TroublesCard } from "./TroublesCard";
import { CoreNeedsBars } from "./CoreNeeds";
import {
    useRankFilter,
    useRankSearch,
    filterRanked,
    sortRanked,
    passesRank,
} from "../hooks/useRankFilter";
import { rt, isStar } from "../lib/ranked";
import {
    yieldFact,
    timeToHarvestSummary,
    durationFactSummary,
} from "../lib/facts";
import styles from "./VegetablePage.module.css";

import VegetablePdfDownload from "../pdf/VegetablePdfDownload";

interface VegetablePageProps {
    data: GardeningData;
    troublesData: TroublesData;
    slugify: (name: string) => string;
}

/** Inline badge rendered before starred item text */
function StarBadge({ label }: { label: string }) {
    return <span className={styles.starBadge}>★ {label}</span>;
}

export function VegetablePage({
    data,
    troublesData,
    slugify,
}: VegetablePageProps) {
    const { slug } = useParams<{ slug: string }>();
    const { system } = useUnits();
    // Find the JSON key whose slugified display name matches the URL slug.
    // Falls back to treating slug as a direct key (handles old-style URLs).
    const key =
        Object.keys(data).find((k) => slugify(data[k].name ?? k) === slug) ??
        slug ??
        Object.keys(data)[0];
    const veg: Vegetable = data[key] ?? {};
    const name = veg.name ?? key;

    const rankFilter = useRankFilter();
    const rankSearch = useRankSearch();

    // Pre-compute filtered + sorted lists so empty cards are never rendered
    const filteredSoilFacts = sortRanked(
        filterRanked(veg.soil_facts, rankFilter),
    );
    const filteredLookingAfter = sortRanked(
        filterRanked(veg.looking_after_the_crop, rankFilter),
    );
    const filteredHarvesting = sortRanked(
        filterRanked(veg.harvesting, rankFilter),
    );

    const kitchen = veg.in_the_kitchen;
    const showKitchenOverview =
        !!kitchen?.overview && passesRank(kitchen.overview, rankFilter);
    const showKitchenStorage =
        !!kitchen?.storage && passesRank(kitchen.storage, rankFilter);
    const showKitchenCooking =
        !!kitchen?.cooking && passesRank(kitchen.cooking, rankFilter);
    const showKitchenFreezing =
        !!kitchen?.freezing && passesRank(kitchen.freezing, rankFilter);
    const showKitchenCard =
        showKitchenOverview ||
        showKitchenStorage ||
        showKitchenCooking ||
        showKitchenFreezing;

    const sowingOrPlanting = veg.sowing_and_planting;
    const hasSowingMethod =
        sowingOrPlanting?.method ||
        sowingOrPlanting?.row_spacing ||
        sowingOrPlanting?.plant_spacing ||
        sowingOrPlanting?.sowing_depth ||
        sowingOrPlanting?.planting_depth;

    const imageSrc = veg.image ?? null;

    // ── Hero quick-fact chips ────────────────────────────────────────────────
    const rawFacts = (veg.seed_and_growing_facts ?? {}) as Record<
        string,
        unknown
    >;
    const sf = (v: unknown): string | null =>
        typeof v === "string" && v ? v : null;
    const heroStats: Array<{ label: string; value: string }> = [];
    const germ =
        durationFactSummary(rawFacts, "expected_germination_time") ??
        durationFactSummary(rawFacts, "time_between_planting_and_sprouting");
    if (germ) heroStats.push({ label: "Germinates in", value: germ });
    const readyIn = timeToHarvestSummary(veg.time_to_harvest);
    if (readyIn) heroStats.push({ label: "Ready in", value: readyIn });
    const yf = yieldFact(veg.yield, system);
    if (yf) heroStats.push({ label: yf.label, value: yf.value });
    const pl = durationFactSummary(rawFacts, "productive_life");
    if (pl) heroStats.push({ label: "Productive life", value: pl });
    const heroNote = sf(rawFacts.note);

    // Resolve troubles_detail key(s) — now always an array
    const troubleKeys = veg.troubles_detail ?? [];

    return (
        <div className={styles.page}>
            {/* Hero — vegetable image used as faded background, right-anchored */}
            <div
                className={styles.hero}
                style={
                    imageSrc
                        ? {
                              backgroundImage: [
                                  // Gradient overlay: opaque left (text area) → transparent right (image shows)
                                  "linear-gradient(to right, #162d1f 0%, rgba(22,45,31,0.97) 35%, rgba(22,45,31,0.72) 58%, rgba(22,45,31,0.28) 100%)",
                                  `url(${imageSrc})`,
                              ].join(", "),
                              backgroundSize: "auto, auto 92%",
                              backgroundPosition: "left, right center",
                              backgroundRepeat: "no-repeat, no-repeat",
                          }
                        : undefined
                }
            >
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>{name}</h1>
                    {veg.ease_of_cultivation && (
                        <div className={styles.difficultyWrapper}>
                            <div className={styles.difficultyBadge}>
                                <span className={styles.difficultyLabel}>
                                    Difficulty
                                </span>
                                <span className={styles.difficultyValue}>
                                    {veg.ease_of_cultivation}
                                </span>
                            </div>
                        </div>
                    )}
                    {veg.introduction && (
                        <p className={styles.heroIntro}>{veg.introduction}</p>
                    )}

                    {/* Quick-fact chips */}
                    {heroStats.length > 0 && (
                        <div className={styles.heroStats}>
                            {heroStats.map(({ label, value }) => (
                                <div key={label} className={styles.heroStat}>
                                    <span className={styles.heroStatLabel}>
                                        {label}
                                    </span>
                                    <span className={styles.heroStatValue}>
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    {heroNote && <p className={styles.heroNote}>{heroNote}</p>}
                    <VegetablePdfDownload
                        name={name}
                        className={styles.pdfBtn}
                    />
                </div>
            </div>

            {/* Calendar + Sowing side by side */}
            {(veg.calendar || hasSowingMethod) && (
                <div className={styles.calendarSowingRow}>
                    {veg.calendar && (
                        <div className={styles.calendarCol}>
                            <CalendarCard calendar={veg.calendar} />
                        </div>
                    )}
                    {hasSowingMethod && sowingOrPlanting && (
                        <div className={styles.sowingCol}>
                            <SowingPanel
                                sowing={
                                    sowingOrPlanting as Record<string, unknown>
                                }
                                rankFilter={rankFilter}
                                system={system}
                            />
                        </div>
                    )}
                </div>
            )}

            <div className={styles.grid}>
                {/* Core Needs — visual 1–10 overview (mirrors the PDF widget) */}
                {veg.core_needs && (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon}>📊</span>
                            <h2 className={styles.cardTitle}>Core Needs</h2>
                        </div>
                        <CoreNeedsBars needs={veg.core_needs} />
                    </div>
                )}

                {/* Soil */}
                {filteredSoilFacts.length > 0 && (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon}>🌍</span>
                            <h2 className={styles.cardTitle}>
                                Soil &amp; Preparation
                            </h2>
                        </div>
                        <ul className={styles.tipList}>
                            {filteredSoilFacts.map((tip, i) => (
                                <li
                                    key={i}
                                    className={`${styles.tipItem}${isStar(tip) ? " " + styles.tipItemStarred : ""}`}
                                >
                                    {isStar(tip) && (
                                        <StarBadge label="Star Need" />
                                    )}
                                    {rt(tip, system)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Looking After the Crop */}
                {filteredLookingAfter.length > 0 && (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon}>🪴</span>
                            <h2 className={styles.cardTitle}>
                                Looking After the Crop
                            </h2>
                        </div>
                        <ol className={styles.orderedList}>
                            {filteredLookingAfter.map((step, i) => (
                                <li
                                    key={i}
                                    className={`${styles.orderedItem}${isStar(step) ? " " + styles.orderedItemStarred : ""}`}
                                >
                                    {isStar(step) && (
                                        <StarBadge label="Star Need" />
                                    )}
                                    {rt(step, system)}
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Harvesting */}
                {filteredHarvesting.length > 0 && (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon}>🧵</span>
                            <h2 className={styles.cardTitle}>Harvesting</h2>
                        </div>
                        <ul className={styles.tipList}>
                            {filteredHarvesting.map((tip, i) => (
                                <li
                                    key={i}
                                    className={`${styles.tipItem}${isStar(tip) ? " " + styles.tipItemStarred : ""}`}
                                >
                                    {isStar(tip) && (
                                        <StarBadge label="Star Tip" />
                                    )}
                                    {rt(tip, system)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Pests & Troubles — inline summary */}
                {veg.troubles && !troubleKeys.length && (
                    <TroublesCard
                        troubles={veg.troubles}
                        rankFilter={rankFilter}
                    />
                )}
            </div>

            {/* Full-width section: kitchen, varieties, trouble guides */}
            <div className={styles.fullWidthSection}>
                {/* In the Kitchen */}
                {kitchen && showKitchenCard && (
                    <div className={styles.card + " " + styles.kitchenCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon}>🍳</span>
                            <h2 className={styles.cardTitle}>In the Kitchen</h2>
                        </div>
                        {showKitchenOverview && (
                            <p className={styles.cardText}>
                                {isStar(kitchen.overview) && (
                                    <StarBadge label="Star Tip" />
                                )}
                                {rt(kitchen.overview, system)}
                            </p>
                        )}
                        <div className={styles.kitchenGrid}>
                            {showKitchenStorage && (
                                <div
                                    className={`${styles.kitchenItem}${isStar(kitchen.storage) ? " " + styles.kitchenItemStarred : ""}`}
                                >
                                    <span className={styles.kitchenItemLabel}>
                                        {isStar(kitchen.storage) && (
                                            <StarBadge label="Star Tip" />
                                        )}
                                        Storage
                                    </span>
                                    <p className={styles.kitchenItemText}>
                                        {rt(kitchen.storage, system)}
                                    </p>
                                </div>
                            )}
                            {showKitchenCooking && (
                                <div
                                    className={`${styles.kitchenItem}${isStar(kitchen.cooking) ? " " + styles.kitchenItemStarred : ""}`}
                                >
                                    <span className={styles.kitchenItemLabel}>
                                        {isStar(kitchen.cooking) && (
                                            <StarBadge label="Star Tip" />
                                        )}
                                        Preparation &amp; Cooking
                                    </span>
                                    <p className={styles.kitchenItemText}>
                                        {rt(kitchen.cooking, system)}
                                    </p>
                                </div>
                            )}
                            {showKitchenFreezing && (
                                <div
                                    className={`${styles.kitchenItem}${isStar(kitchen.freezing) ? " " + styles.kitchenItemStarred : ""}`}
                                >
                                    <span className={styles.kitchenItemLabel}>
                                        {isStar(kitchen.freezing) && (
                                            <StarBadge label="Star Tip" />
                                        )}
                                        Freezing
                                    </span>
                                    <p className={styles.kitchenItemText}>
                                        {rt(kitchen.freezing, system)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {veg.varieties && (
                    <VarietiesCard
                        varieties={veg.varieties}
                        rankFilter={rankFilter}
                    />
                )}

                {/* Link(s) to Pest & Disease guide pages */}
                {troubleKeys.length > 0 && (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon}>🔬</span>
                            <h2 className={styles.cardTitle}>
                                Pest &amp; Disease Guides
                            </h2>
                        </div>
                        <div className={styles.troubleLinks}>
                            {troubleKeys.map((k) => (
                                <Link
                                    key={k}
                                    to={`/troubles/${k}${rankSearch ? rankSearch + "&" : "?"}from=${key}`}
                                    className={styles.troubleLink}
                                >
                                    {troublesData[k]?.source_heading ?? k}
                                    <span className={styles.troubleLinkArrow}>
                                        →
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Calendar */}
            </div>
        </div>
    );
}
