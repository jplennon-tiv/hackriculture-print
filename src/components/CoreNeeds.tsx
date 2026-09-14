import type { ReactElement } from "react";
import type { CoreNeeds } from "../types";

// Inline SVG icons for the Core Needs widget (swappable for PNGs later).
// Shared by the print/PDF page and the public web page so there's one source.
export type CoreNeedIconProps = { color: string };

export function SunIcon({ color }: CoreNeedIconProps) {
    return (
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <circle cx="12" cy="12" r="4.6" fill={color} />
            <g stroke={color} strokeWidth="2" strokeLinecap="round" fill="none">
                <line x1="12" y1="1.5" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22.5" />
                <line x1="1.5" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22.5" y2="12" />
                <line x1="4.4" y1="4.4" x2="6.1" y2="6.1" />
                <line x1="17.9" y1="17.9" x2="19.6" y2="19.6" />
                <line x1="19.6" y1="4.4" x2="17.9" y2="6.1" />
                <line x1="6.1" y1="17.9" x2="4.4" y2="19.6" />
            </g>
        </svg>
    );
}

export function WateringCanIcon({ color }: CoreNeedIconProps) {
    return (
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path
                d="M4 10h10l-1.1 7.4a1.6 1.6 0 0 1-1.6 1.4H6.7a1.6 1.6 0 0 1-1.6-1.4L4 10z"
                fill={color}
            />
            <rect
                x="3.1"
                y="8.1"
                width="11.8"
                height="2.3"
                rx="1.15"
                fill={color}
            />
            <path
                d="M14.2 11l5.8-3.4"
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
            />
            <path d="M18.4 6l3-1.2-.8 3z" fill={color} />
            <path
                d="M6.6 8.1c0-2.3 5.8-2.3 5.8 0"
                stroke={color}
                strokeWidth="1.6"
                fill="none"
            />
        </svg>
    );
}

export function WheelbarrowIcon({ color }: CoreNeedIconProps) {
    return (
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path d="M4.5 8.5l13 1-2.7 4.6H8z" fill={color} />
            <path
                d="M6 8.3c1.1-1.7 8.4-1.1 10 .7"
                stroke={color}
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M14.8 14.1l2.2 3M4.5 8.5L2.3 7.4"
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
            />
            <circle
                cx="8.6"
                cy="17.4"
                r="2.3"
                stroke={color}
                strokeWidth="1.8"
                fill="none"
            />
        </svg>
    );
}

export const CORE_NEED_DEFS: {
    key: "sun" | "water" | "nutrition";
    label: string;
    color: string;
    /** Illustrated PNG in public/images/icons (used by the print sheet). */
    img: string;
    /** Flat SVG fallback (used by the self-contained web bars). */
    Icon: (p: CoreNeedIconProps) => ReactElement;
}[] = [
    {
        key: "sun",
        label: "Sun",
        color: "#f5a623",
        img: "/images/icons/sun.png",
        Icon: SunIcon,
    },
    {
        key: "water",
        label: "Water",
        color: "#2f80ed",
        img: "/images/icons/water.png",
        Icon: WateringCanIcon,
    },
    {
        key: "nutrition",
        label: "Nutrition",
        color: "#8a5a2b",
        img: "/images/icons/nutrition.png",
        Icon: WheelbarrowIcon,
    },
];

/** Self-contained Core Needs bars (inline styles so it drops into any card). */
export function CoreNeedsBars({
    needs,
}: {
    needs: CoreNeeds | null | undefined;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {CORE_NEED_DEFS.map(({ key, label, color, Icon }) => {
                const v = needs?.[key];
                const pct =
                    typeof v === "number"
                        ? Math.max(0, Math.min(5, v)) * 20
                        : 0;
                return (
                    <div
                        key={key}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "20px 82px 1fr",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Icon color={color} />
                        </span>
                        <span
                            style={{
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                letterSpacing: "0.05em",
                                color: "#374151",
                            }}
                        >
                            {label.toUpperCase()}
                        </span>
                        <span
                            style={{
                                position: "relative",
                                height: 10,
                                background: "#e9ecef",
                                borderRadius: 5,
                                overflow: "hidden",
                            }}
                        >
                            <span
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: `${pct}%`,
                                    background: color,
                                    borderRadius: 5,
                                }}
                            />
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
