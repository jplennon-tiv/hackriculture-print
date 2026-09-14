import type { Calendar, CalendarEntry } from "../types";
import { MONTH_INITIALS, MONTH_FULL, expandMonths } from "../lib/months";
import styles from "./CalendarCard.module.css";

interface CalendarCardProps {
    calendar: Calendar;
}

/** Parse "--MM" and "--MM/--MM" ranges into a Set of 0-based month indices */
function parseMonths(entry: CalendarEntry | undefined): {
    primary: Set<number>;
    secondary: Set<number>;
} {
    const primary = expandMonths(entry?.most_popular, { wrap: true });
    const secondary = expandMonths(
        [
            ...(entry?.less_usual ?? []),
            ...(entry?.under_cloches_or_cold_frame ?? []),
            ...(entry?.indoors_under_glass ?? []),
        ],
        { wrap: true },
    );
    return { primary, secondary };
}

interface RowDef {
    label: string;
    entry: CalendarEntry | undefined;
    colorClass: string;
}

export function CalendarCard({ calendar }: CalendarCardProps) {
    const rows: RowDef[] = [
        { label: "Sow", entry: calendar.sowing_time, colorClass: styles.sow },
        {
            label: "Plant",
            entry: calendar.planting_time,
            colorClass: styles.plant,
        },
        {
            label: "Sow / Plant",
            entry: calendar.sowing_and_planting_time_outdoor_crop,
            colorClass: styles.sowplant,
        },
        {
            label: "Under glass",
            entry: calendar.sowing_and_planting_time_greenhouse_crop,
            colorClass: styles.sowplant,
        },
        {
            label: "Harvest",
            entry: calendar.harvest_time,
            colorClass: styles.harvest,
        },
    ].filter((r) => {
        const { primary, secondary } = parseMonths(r.entry);
        return primary.size > 0 || secondary.size > 0;
    });

    if (rows.length === 0) return null;

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>📅</span>
                <h2 className={styles.cardTitle}>
                    Sowing &amp; Harvest Calendar
                </h2>
            </div>
            <p className={styles.hint}>
                Dates are a guide only and vary with variety, location, and
                conditions.
            </p>
            <div className={styles.calendarWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.rowLabel}></th>
                            {MONTH_INITIALS.map((m, i) => (
                                <th
                                    key={i}
                                    className={styles.monthHead}
                                    title={MONTH_FULL[i]}
                                >
                                    {m}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => {
                            const { primary, secondary } = parseMonths(
                                row.entry,
                            );
                            return (
                                <tr key={row.label}>
                                    <td className={styles.rowLabel}>
                                        {row.label}
                                    </td>
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const isPrimary = primary.has(i);
                                        const isSecondary = secondary.has(i);
                                        return (
                                            <td
                                                key={i}
                                                className={`${styles.cell} ${isPrimary ? `${row.colorClass} ${styles.primary}` : ""} ${isSecondary ? `${row.colorClass} ${styles.secondary}` : ""}`}
                                                title={
                                                    isPrimary || isSecondary
                                                        ? MONTH_FULL[i]
                                                        : undefined
                                                }
                                            />
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className={styles.legend}>
                <span className={styles.legendItem}>
                    <span
                        className={
                            styles.legendSwatch + " " + styles.legendPrimary
                        }
                    />
                    Most popular
                </span>
                <span className={styles.legendItem}>
                    <span
                        className={
                            styles.legendSwatch + " " + styles.legendSecondary
                        }
                    />
                    Less usual / under cover
                </span>
            </div>
        </div>
    );
}
