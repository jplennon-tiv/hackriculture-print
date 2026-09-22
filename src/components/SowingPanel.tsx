import { filterRanked, sortRanked } from "../hooks/useRankFilter";
import type { RankFilter } from "../hooks/useRankFilter";
import { rt } from "../lib/ranked";
import { resolveMeasurement } from "../lib/measure";
import type { UnitSystem } from "../lib/measure";
import styles from "./SowingPanel.module.css";

interface SowingData {
    method?: import("../types").UnitText | null;
    row_spacing?: string | null;
    plant_spacing?: string | null;
    sowing_depth?: string | null;
    planting_depth?: string | null;
    trench_or_ridge_depth?: string | null;
    notes?: string[] | null;
    [key: string]: unknown;
}

interface SowingPanelProps {
    sowing: SowingData;
    rankFilter?: RankFilter;
    system: UnitSystem;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract the first numeric inch value from a measurement string. */
function parseInches(str: string | null | undefined): number | null {
    if (!str) return null;
    const frac = str.match(/(\d+)\/(\d+)\s*in/i);
    if (frac) return parseInt(frac[1]) / parseInt(frac[2]);
    const range = str.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*in/i);
    if (range) return (parseFloat(range[1]) + parseFloat(range[2])) / 2;
    const simple = str.match(/(\d+(?:\.\d+)?)\s*in/i);
    if (simple) return parseFloat(simple[1]);
    const feet = str.match(/(\d+(?:\.\d+)?)\s*ft/i);
    if (feet) return parseFloat(feet[1]) * 12;
    return null;
}

/** Trim a display value to the first unit measurement found. */
function shortValue(str: string | null | undefined): string {
    if (!str || str === "surface") return str ?? "—";
    const m = str.match(/\d[\d/\s]*(?:in\.?|ft\.?)/i);
    if (m) return m[0].replace(/\s+/g, "\u202f");
    const first = str.split(/[;,]/)[0].trim();
    return first.length > 22 ? first.slice(0, 20) + "…" : first;
}

// ── Cross-section schematic ───────────────────────────────────────────────────

interface SchematicProps {
    depthIn: number | null;
    trenchDepthIn: number | null;
    isPlanting: boolean;
    depthLabel: string;
    rowLabel: string;
}

function SowingSchematic({
    depthIn,
    trenchDepthIn,
    isPlanting,
    depthLabel,
    rowLabel,
}: SchematicProps) {
    // ── Canvas & layout constants ────────────────────────────────────────────
    const W = 240; // total SVG width
    const H = 168; // total SVG height
    const ML = 38; // left margin (depth label space)
    const MR = W - 6; // right edge
    const MB = 26; // bottom margin (row label space)
    const SK = 14; // horizontal skew for isometric top face
    const TH = 11; // isometric top-face height (3D depth)
    const SURF = 42; // Y of front-face top edge (bottom of iso top face)
    const TOP_SURF = SURF - TH; // Y of iso top-face back edge
    const BY = H - MB; // Y of soil bottom
    const SOIL_H = BY - SURF; // height of front face

    // ── Drill positions ──────────────────────────────────────────────────────
    const BODY_W = MR - ML;
    const COL1 = ML + BODY_W * 0.3;
    const COL2 = ML + BODY_W * 0.7;

    // ── Depth ratio ──────────────────────────────────────────────────────────
    const refDepth = trenchDepthIn ?? 8;
    const eff = trenchDepthIn ?? depthIn ?? 2;
    const ratio = Math.max(0.14, Math.min(eff / refDepth, 0.84));
    const seedY = SURF + ratio * SOIL_H;

    // ── Drill geometry ───────────────────────────────────────────────────────
    const DTW = isPlanting ? 13 : 9; // drill top half-width (front face)
    const DBW = isPlanting ? 5 : 1.5; // drill bottom half-width

    // ── Colors ───────────────────────────────────────────────────────────────
    const SOIL_TOP = "#d4a96a"; // lighter top face
    const SOIL_FRONT = "#c08050"; // main front face
    const SOIL_DARK = "#8a5e30"; // drill shadow
    const SURF_LINE = "#3d6b28"; // grass / surface line
    const ARROW_C = "#3a6020"; // measurement arrows
    const LABEL_C = "#2a4a18"; // measurement text

    // Helper: tiny arrowhead path
    const ah = (x1: number, y1: number, x2: number, y2: number, s = 4) => {
        const dx = x2 - x1,
            dy = y2 - y1;
        const L = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = (dx / L) * s,
            ny = (dy / L) * s;
        return `M${x2 - nx + ny * 0.5},${y2 - ny - nx * 0.5}L${x2},${y2}L${x2 - nx - ny * 0.5},${y2 - ny + nx * 0.5}`;
    };

    // ── Isometric top-face corners ───────────────────────────────────────────
    // front-left  front-right  back-right       back-left
    const iso = [
        [ML, SURF],
        [MR, SURF],
        [MR + SK, TOP_SURF],
        [ML + SK, TOP_SURF],
    ];
    const isoStr = iso.map(([x, y]) => `${x},${y}`).join(" ");

    return (
        <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            aria-hidden="true"
            className={styles.sowingSchematic}
        >
            {/* ── Isometric top face of soil block ── */}
            <polygon points={isoStr} fill={SOIL_TOP} />
            {/* top-face edge lines */}
            <line
                x1={ML}
                y1={SURF}
                x2={MR}
                y2={SURF}
                stroke={SOIL_DARK}
                strokeWidth="0.8"
            />
            <line
                x1={ML}
                y1={SURF}
                x2={ML + SK}
                y2={TOP_SURF}
                stroke={SOIL_DARK}
                strokeWidth="0.8"
            />
            <line
                x1={MR}
                y1={SURF}
                x2={MR + SK}
                y2={TOP_SURF}
                stroke={SOIL_DARK}
                strokeWidth="0.8"
            />
            <line
                x1={ML + SK}
                y1={TOP_SURF}
                x2={MR + SK}
                y2={TOP_SURF}
                stroke={SOIL_DARK}
                strokeWidth="0.8"
            />

            {/* ── Drill openings on top face (parallelogram-shaped) ── */}
            {[COL1, COL2].map((cx) => {
                // Map front-face drill opening onto the iso top face
                const tl = cx - DTW,
                    tr = cx + DTW;
                return (
                    <polygon
                        key={`iso-${cx}`}
                        points={`${tl},${SURF} ${tr},${SURF} ${tr + SK},${TOP_SURF} ${tl + SK},${TOP_SURF}`}
                        fill={SOIL_DARK}
                        opacity="0.55"
                    />
                );
            })}

            {/* ── Grass / surface line ── */}
            <line
                x1={ML}
                y1={SURF}
                x2={MR}
                y2={SURF}
                stroke={SURF_LINE}
                strokeWidth="2.5"
            />

            {/* ── Front face of soil block ── */}
            <rect
                x={ML}
                y={SURF}
                width={MR - ML}
                height={SOIL_H}
                fill={SOIL_FRONT}
            />
            {/* subtle horizontal soil bands */}
            {[12, 30, 50, 72].map((dy) => (
                <rect
                    key={dy}
                    x={ML}
                    y={SURF + dy}
                    width={MR - ML}
                    height="3"
                    fill="rgba(0,0,0,0.05)"
                />
            ))}

            {/* ── Drills / planting holes (front face) ── */}
            {[COL1, COL2].map((cx) => (
                <g key={cx}>
                    <polygon
                        points={`${cx - DTW},${SURF} ${cx + DTW},${SURF} ${cx + DBW},${seedY} ${cx - DBW},${seedY}`}
                        fill={SOIL_DARK}
                    />
                    {/* inner dark shadow for V shape */}
                    <polygon
                        points={`${cx - DTW + 1},${SURF} ${cx + DTW - 1},${SURF} ${cx},${seedY}`}
                        fill="rgba(0,0,0,0.22)"
                    />
                    {/* cover-soil direction arrow inside drill */}
                    <line
                        x1={cx}
                        y1={SURF + 4}
                        x2={cx}
                        y2={seedY - 6}
                        stroke="rgba(255,255,255,0.35)"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                    />
                    {/* seed / bulb */}
                    {isPlanting ? (
                        <g>
                            <ellipse
                                cx={cx}
                                cy={seedY + 4}
                                rx="5"
                                ry="3.5"
                                fill="#f0c040"
                                stroke="#906000"
                                strokeWidth="1"
                            />
                            <line
                                x1={cx}
                                y1={seedY}
                                x2={cx}
                                y2={seedY - 6}
                                stroke="#5a9c40"
                                strokeWidth="1.5"
                            />
                        </g>
                    ) : (
                        <>
                            <ellipse
                                cx={cx - 3.5}
                                cy={seedY}
                                rx="2.8"
                                ry="2"
                                fill="#e8c830"
                                stroke="#806800"
                                strokeWidth="0.8"
                            />
                            <ellipse
                                cx={cx + 3.5}
                                cy={seedY}
                                rx="2.8"
                                ry="2"
                                fill="#e8c830"
                                stroke="#806800"
                                strokeWidth="0.8"
                            />
                        </>
                    )}
                </g>
            ))}

            {/* ── Grass tufts on surface ── */}
            {[ML + 10, (COL1 + COL2) / 2, MR - 12].map((gx) => (
                <g key={gx}>
                    {[
                        [-4, -7],
                        [-1, -10],
                        [3, -6],
                    ].map(([dx, dy], i) => (
                        <line
                            key={i}
                            x1={gx}
                            y1={SURF}
                            x2={gx + dx}
                            y2={SURF + dy}
                            stroke={SURF_LINE}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    ))}
                </g>
            ))}

            {/* ── Depth measurement — left side, inside the diagram ── */}
            {depthIn !== null && depthLabel && (
                <g>
                    <line
                        x1={ML + 6}
                        y1={SURF}
                        x2={ML + 6}
                        y2={seedY}
                        stroke="rgba(255,255,255,0.75)"
                        strokeWidth="1.2"
                    />
                    <path
                        d={ah(ML + 6, seedY, ML + 6, SURF, 4)}
                        stroke="rgba(255,255,255,0.75)"
                        strokeWidth="1.2"
                        fill="none"
                    />
                    <path
                        d={ah(ML + 6, SURF, ML + 6, seedY, 4)}
                        stroke="rgba(255,255,255,0.75)"
                        strokeWidth="1.2"
                        fill="none"
                    />
                    {/* white label pill */}
                    <rect
                        x={ML - 32}
                        y={(SURF + seedY) / 2 - 8}
                        width={30}
                        height={14}
                        rx="3"
                        fill="rgba(255,255,255,0.82)"
                    />
                    <text
                        x={ML - 17}
                        y={(SURF + seedY) / 2 + 4}
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="700"
                        fill={LABEL_C}
                    >
                        {depthLabel}
                    </text>
                </g>
            )}

            {/* ── Row-spacing measurement — across the bottom of soil ── */}
            {rowLabel && (
                <g>
                    <line
                        x1={COL1}
                        y1={BY + 8}
                        x2={COL2}
                        y2={BY + 8}
                        stroke={ARROW_C}
                        strokeWidth="1.4"
                    />
                    <path
                        d={ah(COL2, BY + 8, COL1, BY + 8, 4)}
                        stroke={ARROW_C}
                        strokeWidth="1.2"
                        fill="none"
                    />
                    <path
                        d={ah(COL1, BY + 8, COL2, BY + 8, 4)}
                        stroke={ARROW_C}
                        strokeWidth="1.2"
                        fill="none"
                    />
                    <line
                        x1={COL1}
                        y1={BY + 5}
                        x2={COL1}
                        y2={BY + 11}
                        stroke={ARROW_C}
                        strokeWidth="1"
                    />
                    <line
                        x1={COL2}
                        y1={BY + 5}
                        x2={COL2}
                        y2={BY + 11}
                        stroke={ARROW_C}
                        strokeWidth="1"
                    />
                    {/* label */}
                    <rect
                        x={(COL1 + COL2) / 2 - 16}
                        y={BY + 13}
                        width={32}
                        height={11}
                        rx="2"
                        fill="rgba(255,255,255,0.0)"
                    />
                    <text
                        x={(COL1 + COL2) / 2}
                        y={BY + 21}
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="700"
                        fill={LABEL_C}
                    >
                        {rowLabel}
                    </text>
                </g>
            )}

            {/* ── TYPE banner ── */}
            <rect
                x={ML}
                y={TOP_SURF - 16}
                width={MR - ML + SK}
                height={13}
                rx="2"
                fill="#2a4a18"
            />
            <text
                x={ML + (MR - ML + SK) / 2}
                y={TOP_SURF - 6}
                textAnchor="middle"
                fontSize="7.5"
                fontWeight="800"
                fill="rgba(255,255,255,0.9)"
                letterSpacing="0.09em"
            >
                {isPlanting ? "PLANTING" : "SEED SOWING"}
            </text>
        </svg>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SowingPanel({ sowing, rankFilter, system }: SowingPanelProps) {
    // Display uses the chosen system; the SVG schematic geometry stays imperial.
    const rmD = (v: unknown) => resolveMeasurement(v, system);
    const rmI = (v: unknown) => resolveMeasurement(v, "imperial");
    const depthGeom = rmI(sowing.planting_depth) ?? rmI(sowing.sowing_depth);
    const depthDisp = rmD(sowing.planting_depth) ?? rmD(sowing.sowing_depth);
    const depthIn = parseInches(depthGeom);
    const trenchDepthIn = parseInches(rmI(sowing.trench_or_ridge_depth));
    const isPlanting = !!sowing.planting_depth;

    // Descriptive depth text that has no parseable number → append to notes
    const depthNote =
        depthGeom && depthGeom !== "surface" && parseInches(depthGeom) === null
            ? `${isPlanting ? "Planting depth" : "Sowing depth"}: ${depthDisp ?? depthGeom}`
            : null;

    const depthLabel =
        depthIn !== null
            ? shortValue(depthDisp)
            : depthGeom === "surface"
              ? "surface"
              : "";
    const rowLabel = sowing.row_spacing
        ? shortValue(rmD(sowing.row_spacing))
        : "";

    const metrics: Array<{
        icon: string;
        label: string;
        value: string;
        raw: string | null | undefined;
    }> = [
        {
            icon: "↕",
            label: "Row spacing",
            value: shortValue(rmD(sowing.row_spacing)),
            raw: rmI(sowing.row_spacing),
        },
        {
            icon: "↔",
            label: "Plant spacing",
            value: shortValue(rmD(sowing.plant_spacing)),
            raw: rmI(sowing.plant_spacing),
        },
        {
            icon: "⬇",
            label: isPlanting ? "Planting depth" : "Sowing depth",
            value: shortValue(depthDisp),
            raw: depthGeom,
        },
    ].filter(
        (m) => m.raw && (m.raw === "surface" || parseInches(m.raw) !== null),
    );

    const allNotes = (() => {
        const filtered = filterRanked(
            sowing.notes ?? [],
            rankFilter ?? (() => true),
        );
        const sorted = sortRanked(filtered);
        // depthNote is a plain string — always appended last
        return depthNote ? [...sorted, depthNote] : sorted;
    })();

    const showDiagram =
        metrics.length > 0 || depthIn !== null || trenchDepthIn !== null;

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <span className={styles.icon}>🌱</span>
                <h2 className={styles.title}>Sowing &amp; Planting</h2>
            </div>

            {sowing.method && <p className={styles.method}>{rt(sowing.method, system)}</p>}

            {showDiagram && (
                <div className={styles.statsArea}>
                    <SowingSchematic
                        depthIn={trenchDepthIn ?? depthIn}
                        trenchDepthIn={trenchDepthIn}
                        isPlanting={isPlanting}
                        depthLabel={depthLabel}
                        rowLabel={rowLabel}
                    />
                    <div className={styles.metricList}>
                        {metrics.map((m) => (
                            <div key={m.label} className={styles.metric}>
                                <span className={styles.metricIcon}>
                                    {m.icon}
                                </span>
                                <span className={styles.metricLabel}>
                                    {m.label}
                                </span>
                                <span className={styles.metricValue}>
                                    {m.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {allNotes.length > 0 && (
                <ul className={styles.notes}>
                    {allNotes.map((n, i) => {
                        const starred =
                            typeof n === "object" &&
                            n !== null &&
                            "star" in n &&
                            (n as { star?: boolean }).star === true;
                        const text = rt(n, system);
                        return (
                            <li
                                key={i}
                                className={
                                    starred ? styles.noteStarred : undefined
                                }
                            >
                                {starred && (
                                    <span className={styles.starBadge}>
                                        ★ Star Tip
                                    </span>
                                )}
                                {text}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
