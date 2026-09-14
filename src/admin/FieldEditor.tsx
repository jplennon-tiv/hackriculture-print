import { useState, useEffect } from "react";
import { rt } from "../lib/ranked";
import { MONTH_SHORT } from "../lib/months";
import { QUICK_FACT_ICON_KEYS, quickFactIconPath } from "../lib/quickFactIcons";
import {
    convertMeasurement,
    isMeasurementPair,
    buildPair,
    hasImperial,
    hasMetric,
} from "../lib/measure";
import type { MeasurementPair } from "../types";
import styles from "./Admin.module.css";

// Keys whose values are measurements → edited as imperial/metric pairs.
const MEASUREMENT_KEYS = new Set([
    "row_spacing",
    "plant_spacing",
    "sowing_depth",
    "planting_depth",
    "trench_or_ridge_depth",
    "spacing",
    "mature_height",
]);

// ── Types ─────────────────────────────────────────────────────────────────────
export type EditorType =
    | "string"
    | "stringArray"
    | "keyNoteArray"
    | "rankedArray" // RankedText[] — text + rank + star per item
    | "rankedObject" // {[k]: RankedText|null} fixed keys (e.g. in_the_kitchen)
    | "rankedKv" // {[k]: RankedText|null} editable keys (e.g. troubles)
    | "flatObject"
    | "kvObject"
    | "mixedObject"
    | "calendar"
    | "coreNeeds"
    | "json";

// Available quick-facts icons for the PDF "Final Tips" list.
export const TIP_ICON_OPTIONS = QUICK_FACT_ICON_KEYS;

// ── RankedText helpers ────────────────────────────────────────────────────────
type RankedItem = {
    text: string;
    rank: number;
    star?: boolean;
    short_text?: string;
    icon?: string;
};

function isRankedItem(v: unknown): v is RankedItem {
    return (
        typeof v === "object" &&
        v !== null &&
        "text" in v &&
        "rank" in v &&
        typeof (v as RankedItem).text === "string" &&
        typeof (v as RankedItem).rank === "number"
    );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function Textarea({
    value,
    onChange,
    rows = 3,
    placeholder = "",
}: {
    value: string;
    onChange: (v: string) => void;
    rows?: number;
    placeholder?: string;
}) {
    return (
        <textarea
            className={styles.fieldTextarea}
            rows={rows}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

function RankInput({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) {
    return (
        <input
            type="number"
            min={1}
            max={10}
            className={styles.rankInput}
            value={value}
            title="Rank 1–10 (10 = most important)"
            onChange={(e) => {
                const n = Math.max(
                    1,
                    Math.min(10, parseInt(e.target.value) || 1),
                );
                onChange(n);
            }}
        />
    );
}

function StarCheck({
    value,
    onChange,
}: {
    value: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className={styles.starCheck} title="Star / highlight this item">
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span>★</span>
        </label>
    );
}

function IconPicker({
    value,
    onChange,
}: {
    value: string | undefined;
    onChange: (v: string) => void;
}) {
    return (
        <label
            className={styles.iconPicker}
            title="PDF Final Tip icon (blank = auto)"
        >
            <span className={styles.rankLabel}>Icon</span>
            {value ? (
                <img
                    src={quickFactIconPath(value)}
                    alt=""
                    className={styles.iconPickerPreview}
                />
            ) : (
                <span className={styles.iconPickerPreviewEmpty}>—</span>
            )}
            <select
                className={styles.iconPickerSelect}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">auto</option>
                {TIP_ICON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </label>
    );
}

// ── String editor ─────────────────────────────────────────────────────────────
function StringEditor({
    value,
    onChange,
}: {
    value: string | null;
    onChange: (v: string | null) => void;
}) {
    const [local, setLocal] = useState(value ?? "");
    useEffect(() => setLocal(value ?? ""), [value]);
    return (
        <Textarea
            value={local}
            rows={5}
            onChange={(v) => {
                setLocal(v);
                onChange(v || null);
            }}
        />
    );
}

// ── String array editor ───────────────────────────────────────────────────────
function StringArrayEditor({
    value,
    onChange,
}: {
    value: string[];
    onChange: (v: string[]) => void;
}) {
    const [items, setItems] = useState<string[]>(value.length ? value : [""]);
    useEffect(() => setItems(value.length ? value : [""]), [value]);
    const update = (next: string[]) => {
        setItems(next);
        onChange(next.filter((s) => s.trim()));
    };
    return (
        <div className={styles.arrayEditor}>
            {items.map((item, i) => (
                <div key={i} className={styles.arrayRow}>
                    <Textarea
                        value={item}
                        rows={2}
                        placeholder={`Item ${i + 1}`}
                        onChange={(v) => {
                            const next = [...items];
                            next[i] = v;
                            update(next);
                        }}
                    />
                    <div className={styles.arrayBtns}>
                        <button
                            type="button"
                            className={styles.arrayBtn}
                            disabled={i === 0}
                            onClick={() => {
                                const n = [...items];
                                [n[i - 1], n[i]] = [n[i], n[i - 1]];
                                update(n);
                            }}
                        >
                            ↑
                        </button>
                        <button
                            type="button"
                            className={styles.arrayBtn}
                            disabled={i === items.length - 1}
                            onClick={() => {
                                const n = [...items];
                                [n[i], n[i + 1]] = [n[i + 1], n[i]];
                                update(n);
                            }}
                        >
                            ↓
                        </button>
                        <button
                            type="button"
                            className={`${styles.arrayBtn} ${styles.arrayBtnRemove}`}
                            onClick={() =>
                                update(items.filter((_, j) => j !== i))
                            }
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
            <button
                type="button"
                className={styles.addRowBtn}
                onClick={() => update([...items, ""])}
            >
                + Add item
            </button>
        </div>
    );
}

// ── Key note array editor ({ title, body }[]) ─────────────────────────────────
type KeyNoteItem = { title: string; body: string };
function KeyNoteArrayEditor({
    value,
    onChange,
}: {
    value: KeyNoteItem[];
    onChange: (v: KeyNoteItem[]) => void;
}) {
    const blank = (): KeyNoteItem => ({ title: "", body: "" });
    const [items, setItems] = useState<KeyNoteItem[]>(
        value.length ? value : [blank()],
    );
    useEffect(() => setItems(value.length ? value : [blank()]), [value]);
    const update = (next: KeyNoteItem[]) => {
        setItems(next);
        onChange(next.filter((n) => n.title.trim() || n.body.trim()));
    };
    return (
        <div className={styles.arrayEditor}>
            {items.map((item, i) => (
                <div
                    key={i}
                    className={styles.arrayRow}
                    style={{
                        flexDirection: "column",
                        alignItems: "stretch",
                        gap: 4,
                    }}
                >
                    <input
                        className={styles.fieldInput}
                        placeholder={`Title ${i + 1} (short, bold heading)`}
                        value={item.title}
                        onChange={(e) => {
                            const n = [...items];
                            n[i] = { ...n[i], title: e.target.value };
                            update(n);
                        }}
                    />
                    <Textarea
                        value={item.body}
                        rows={3}
                        placeholder={`Body ${i + 1} (fuller explanation)`}
                        onChange={(v) => {
                            const n = [...items];
                            n[i] = { ...n[i], body: v };
                            update(n);
                        }}
                    />
                    <div
                        className={styles.arrayBtns}
                        style={{ justifyContent: "flex-end" }}
                    >
                        <button
                            type="button"
                            className={styles.arrayBtn}
                            disabled={i === 0}
                            onClick={() => {
                                const n = [...items];
                                [n[i - 1], n[i]] = [n[i], n[i - 1]];
                                update(n);
                            }}
                        >
                            ↑
                        </button>
                        <button
                            type="button"
                            className={styles.arrayBtn}
                            disabled={i === items.length - 1}
                            onClick={() => {
                                const n = [...items];
                                [n[i], n[i + 1]] = [n[i + 1], n[i]];
                                update(n);
                            }}
                        >
                            ↓
                        </button>
                        <button
                            type="button"
                            className={`${styles.arrayBtn} ${styles.arrayBtnRemove}`}
                            onClick={() =>
                                update(items.filter((_, j) => j !== i))
                            }
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
            <button
                type="button"
                className={styles.addRowBtn}
                onClick={() => update([...items, blank()])}
            >
                + Add note
            </button>
        </div>
    );
}

// ── Ranked array editor (RankedText[]) ────────────────────────────────────────
function RankedArrayEditor({
    value,
    onChange,
}: {
    value: RankedItem[];
    onChange: (v: RankedItem[]) => void;
}) {
    const blank = (): RankedItem => ({ text: "", rank: 5 });
    const norm = (arr: RankedItem[]) =>
        arr.map((x) => ({
            text: x.text,
            rank: x.rank,
            ...(x.star ? { star: true } : {}),
            ...(x.short_text !== undefined ? { short_text: x.short_text } : {}),
            ...(x.icon ? { icon: x.icon } : {}),
        }));
    const [items, setItems] = useState<RankedItem[]>(
        value.length ? norm(value) : [blank()],
    );
    useEffect(() => setItems(value.length ? norm(value) : [blank()]), [value]);
    const update = (next: RankedItem[]) => {
        setItems(next);
        onChange(next.filter((x) => x.text.trim()));
    };
    const set = <K extends keyof RankedItem>(
        i: number,
        k: K,
        v: RankedItem[K],
    ) => update(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
    return (
        <div className={styles.arrayEditor}>
            {items.map((item, i) => (
                <div key={i} className={styles.rankedRow}>
                    <Textarea
                        value={item.text}
                        rows={2}
                        placeholder={`Item ${i + 1}`}
                        onChange={(v) => set(i, "text", v)}
                    />
                    <div className={styles.shortTextSection}>
                        <label className={styles.shortTextLabel}>
                            Short text (PDF)
                        </label>
                        <Textarea
                            value={item.short_text ?? ""}
                            rows={1}
                            placeholder="Brief version for PDF cheat sheet"
                            onChange={(v) =>
                                set(i, "short_text", v || undefined)
                            }
                        />
                    </div>
                    <div className={styles.rankedMeta}>
                        <label className={styles.rankLabel}>Rank</label>
                        <RankInput
                            value={item.rank}
                            onChange={(v) => set(i, "rank", v)}
                        />
                        <StarCheck
                            value={item.star ?? false}
                            onChange={(v) => set(i, "star", v || undefined)}
                        />
                        <IconPicker
                            value={item.icon}
                            onChange={(v) => set(i, "icon", v || undefined)}
                        />
                    </div>
                    <div className={styles.arrayBtns}>
                        <button
                            type="button"
                            className={styles.arrayBtn}
                            disabled={i === 0}
                            onClick={() => {
                                const n = [...items];
                                [n[i - 1], n[i]] = [n[i], n[i - 1]];
                                update(n);
                            }}
                        >
                            ↑
                        </button>
                        <button
                            type="button"
                            className={styles.arrayBtn}
                            disabled={i === items.length - 1}
                            onClick={() => {
                                const n = [...items];
                                [n[i], n[i + 1]] = [n[i + 1], n[i]];
                                update(n);
                            }}
                        >
                            ↓
                        </button>
                        <button
                            type="button"
                            className={`${styles.arrayBtn} ${styles.arrayBtnRemove}`}
                            onClick={() =>
                                update(items.filter((_, j) => j !== i))
                            }
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
            <button
                type="button"
                className={styles.addRowBtn}
                onClick={() => update([...items, blank()])}
            >
                + Add item
            </button>
        </div>
    );
}

// ── Ranked object editor (fixed keys, RankedText|null) ────────────────────────
function RankedObjectEditor({
    value,
    onChange,
}: {
    value: Record<string, RankedItem | null>;
    onChange: (v: Record<string, RankedItem | null>) => void;
}) {
    const [obj, setObj] = useState({ ...value });
    useEffect(() => setObj({ ...value }), [value]);
    const updateKey = (
        k: string,
        text: string,
        rank: number,
        star: boolean,
    ) => {
        const next = {
            ...obj,
            [k]: text ? { text, rank, ...(star ? { star: true } : {}) } : null,
        };
        setObj(next);
        onChange(next);
    };
    return (
        <div className={styles.objEditor}>
            {Object.entries(obj).map(([k, v]) => (
                <div key={k} className={styles.rankedObjRow}>
                    <label className={styles.objLabel}>
                        {k.replace(/_/g, " ")}
                    </label>
                    <Textarea
                        value={v?.text ?? ""}
                        rows={3}
                        placeholder="(empty)"
                        onChange={(nv) =>
                            updateKey(k, nv, v?.rank ?? 5, v?.star ?? false)
                        }
                    />
                    <div className={styles.rankedMeta}>
                        <label className={styles.rankLabel}>Rank</label>
                        <RankInput
                            value={v?.rank ?? 5}
                            onChange={(n) =>
                                updateKey(k, v?.text ?? "", n, v?.star ?? false)
                            }
                        />
                        <StarCheck
                            value={v?.star ?? false}
                            onChange={(b) =>
                                updateKey(k, v?.text ?? "", v?.rank ?? 5, b)
                            }
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Ranked KV editor (editable keys, RankedText|null) ─────────────────────────
function RankedKvEditor({
    value,
    onChange,
}: {
    value: Record<string, unknown>;
    onChange: (v: Record<string, unknown>) => void;
}) {
    type Pair = {
        key: string;
        text: string;
        signs: string;
        control: string;
        rank: number;
        star: boolean;
        special: boolean;
    };
    const toPairs = (v: Record<string, unknown>): Pair[] =>
        Object.entries(v).map(([k, val]) => {
            const obj =
                typeof val === "object" && val !== null && !Array.isArray(val)
                    ? (val as Record<string, unknown>)
                    : {};
            return {
                key: k,
                text: rt(val),
                signs: typeof obj.signs === "string" ? obj.signs : "",
                control: typeof obj.control === "string" ? obj.control : "",
                rank: isRankedItem(val) ? val.rank : 5,
                star: isRankedItem(val) ? (val.star ?? false) : false,
                special: k === "_note" || k === "_redirect",
            };
        });
    const [pairs, setPairs] = useState<Pair[]>(toPairs(value));
    useEffect(() => setPairs(toPairs(value)), [value]);

    const emit = (next: Pair[]) => {
        const out: Record<string, unknown> = {};
        next.forEach((p) => {
            if (!p.key.trim()) return;
            if (p.special) {
                out[p.key.trim()] = p.text || null;
            } else {
                out[p.key.trim()] = p.text
                    ? {
                          text: p.text,
                          rank: p.rank,
                          ...(p.star ? { star: true } : {}),
                          ...(p.signs ? { signs: p.signs } : {}),
                          ...(p.control ? { control: p.control } : {}),
                      }
                    : null;
            }
        });
        onChange(out);
    };
    const update = (next: Pair[]) => {
        setPairs(next);
        emit(next);
    };
    const set = (i: number, patch: Partial<Pair>) =>
        update(pairs.map((p, j) => (j === i ? { ...p, ...patch } : p)));

    return (
        <div className={styles.objEditor}>
            {pairs.map((pair, i) => (
                <div
                    key={i}
                    className={pair.special ? styles.kvRow : styles.kvRankedRow}
                >
                    <input
                        className={styles.kvKey}
                        value={pair.key}
                        placeholder="e.g. SLUGS"
                        onChange={(e) => set(i, { key: e.target.value })}
                    />
                    <Textarea
                        value={pair.text}
                        rows={2}
                        placeholder="Description (full text)"
                        onChange={(v) => set(i, { text: v })}
                    />
                    {!pair.special && (
                        <>
                            <div className={styles.shortTextSection}>
                                <label className={styles.shortTextLabel}>
                                    Signs
                                </label>
                                <Textarea
                                    value={pair.signs}
                                    rows={1}
                                    placeholder="Visible symptoms (for print table)"
                                    onChange={(v) => set(i, { signs: v })}
                                />
                            </div>
                            <div className={styles.shortTextSection}>
                                <label className={styles.shortTextLabel}>
                                    Control
                                </label>
                                <Textarea
                                    value={pair.control}
                                    rows={1}
                                    placeholder="Treatment / action (for print table)"
                                    onChange={(v) => set(i, { control: v })}
                                />
                            </div>
                            <div className={styles.rankedMeta}>
                                <label className={styles.rankLabel}>Rank</label>
                                <RankInput
                                    value={pair.rank}
                                    onChange={(n) => set(i, { rank: n })}
                                />
                                <StarCheck
                                    value={pair.star}
                                    onChange={(b) => set(i, { star: b })}
                                />
                            </div>
                        </>
                    )}
                    <button
                        type="button"
                        className={`${styles.arrayBtn} ${styles.arrayBtnRemove}`}
                        onClick={() => update(pairs.filter((_, j) => j !== i))}
                    >
                        ✕
                    </button>
                </div>
            ))}
            <button
                type="button"
                className={styles.addRowBtn}
                onClick={() =>
                    update([
                        ...pairs,
                        {
                            key: "",
                            text: "",
                            signs: "",
                            control: "",
                            rank: 5,
                            star: false,
                            special: false,
                        },
                    ])
                }
            >
                + Add entry
            </button>
        </div>
    );
}

// ── Flat object editor (fixed keys, plain strings) ────────────────────────────
function FlatObjectEditor({
    value,
    onChange,
    quickFactsHints,
}: {
    value: Record<string, unknown>;
    onChange: (v: Record<string, unknown>) => void;
    quickFactsHints?: Record<string, string>;
}) {
    const [obj, setObj] = useState<Record<string, unknown>>({ ...value });
    useEffect(() => setObj({ ...value }), [value]);
    const updateKey = (k: string, v: string) => {
        const next = { ...obj, [k]: v || null };
        setObj(next);
        onChange(next);
    };
    // Only plain string/null facts are editable here; structured companions
    // (e.g. *_value duration objects) are carried through untouched on save.
    const editable = Object.entries(obj).filter(
        ([, v]) => v == null || typeof v === "string",
    );
    return (
        <div className={styles.objEditor}>
            {editable.map(([k, v]) => (
                <div key={k} className={styles.objRow}>
                    <div className={styles.objLabelRow}>
                        <label className={styles.objLabel}>
                            {k.replace(/_/g, " ")}
                        </label>
                        {quickFactsHints?.[k] && (
                            <span className={styles.qfBadge}>
                                → PDF: {quickFactsHints[k]}
                            </span>
                        )}
                    </div>
                    <Textarea
                        value={typeof v === "string" ? v : ""}
                        rows={2}
                        placeholder="(empty)"
                        onChange={(nv) => updateKey(k, nv)}
                    />
                </div>
            ))}
        </div>
    );
}

// ── KV object editor (editable keys, plain strings) ───────────────────────────
function KvObjectEditor({
    value,
    onChange,
}: {
    value: Record<string, string | null>;
    onChange: (v: Record<string, string | null>) => void;
}) {
    type Pair = { key: string; val: string };
    const [pairs, setPairs] = useState<Pair[]>(
        Object.entries(value).map(([k, v]) => ({ key: k, val: rt(v) })),
    );
    useEffect(
        () =>
            setPairs(
                Object.entries(value).map(([k, v]) => ({
                    key: k,
                    val: rt(v),
                })),
            ),
        [value],
    );
    const emit = (next: Pair[]) => {
        const out: Record<string, string | null> = {};
        next.forEach((p) => {
            if (p.key.trim()) out[p.key.trim()] = p.val || null;
        });
        onChange(out);
    };
    const update = (next: Pair[]) => {
        setPairs(next);
        emit(next);
    };
    return (
        <div className={styles.objEditor}>
            {pairs.map((pair, i) => (
                <div key={i} className={styles.kvRow}>
                    <input
                        className={styles.kvKey}
                        value={pair.key}
                        placeholder="Name (e.g. APHID)"
                        onChange={(e) =>
                            update(
                                pairs.map((p, j) =>
                                    j === i ? { ...p, key: e.target.value } : p,
                                ),
                            )
                        }
                    />
                    <Textarea
                        value={pair.val}
                        rows={2}
                        placeholder="Description / treatment"
                        onChange={(v) =>
                            update(
                                pairs.map((p, j) =>
                                    j === i ? { ...p, val: v } : p,
                                ),
                            )
                        }
                    />
                    <button
                        type="button"
                        className={`${styles.arrayBtn} ${styles.arrayBtnRemove}`}
                        onClick={() => update(pairs.filter((_, j) => j !== i))}
                    >
                        ✕
                    </button>
                </div>
            ))}
            <button
                type="button"
                className={styles.addRowBtn}
                onClick={() => update([...pairs, { key: "", val: "" }])}
            >
                + Add entry
            </button>
        </div>
    );
}

// ── Mixed object editor ───────────────────────────────────────────────────────
function MeasureSide({
    label,
    text,
    onText,
    onConvert,
    convertLabel,
}: {
    label: string;
    text: string;
    onText: (v: string) => void;
    onConvert: () => void;
    convertLabel: string;
}) {
    return (
        <div className={styles.measureSide}>
            <div className={styles.measureHead}>
                <span className={styles.measureLabel}>{label}</span>
                <button
                    type="button"
                    className={styles.measureConvBtn}
                    onClick={onConvert}
                    title={convertLabel}
                >
                    {convertLabel}
                </button>
            </div>
            <Textarea
                value={text}
                rows={2}
                placeholder="(empty)"
                onChange={onText}
            />
        </div>
    );
}

/** Side-by-side imperial/metric editor with convert buttons; recurses for
 *  variety-keyed dicts and falls back to a single field for plain strings. */
function MeasurePairEditor({
    value,
    onChange,
}: {
    value: unknown;
    onChange: (v: unknown) => void;
}) {
    if (isMeasurementPair(value)) {
        const pair = value as MeasurementPair;
        const convert = (from: "imperial" | "metric") => {
            const to = from === "imperial" ? "metric" : "imperial";
            const src = pair[from];
            const c = src ? convertMeasurement(src, to) : null;
            onChange({ ...pair, [to]: c ?? pair[to] });
        };
        return (
            <div className={styles.measurePair}>
                <MeasureSide
                    label="Imperial"
                    text={pair.imperial ?? ""}
                    onText={(t) => onChange({ ...pair, imperial: t || null })}
                    onConvert={() => convert("imperial")}
                    convertLabel="→ fill metric"
                />
                <MeasureSide
                    label="Metric"
                    text={pair.metric ?? ""}
                    onText={(t) => onChange({ ...pair, metric: t || null })}
                    onConvert={() => convert("metric")}
                    convertLabel="← fill imperial"
                />
            </div>
        );
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
        const dict = value as Record<string, unknown>;
        return (
            <div className={styles.measureVarieties}>
                {Object.entries(dict).map(([vk, vv]) => (
                    <div key={vk} className={styles.measureVarietyRow}>
                        <span className={styles.measureVarietyKey}>
                            {vk.replace(/_/g, " ")}
                        </span>
                        <MeasurePairEditor
                            value={vv}
                            onChange={(nv) => onChange({ ...dict, [vk]: nv })}
                        />
                    </div>
                ))}
            </div>
        );
    }
    const str = typeof value === "string" ? value : "";
    const canSplit = hasImperial(str) || hasMetric(str);
    return (
        <div className={styles.measureSingle}>
            <Textarea
                value={str}
                rows={2}
                placeholder="(empty)"
                onChange={(t) => onChange(t || null)}
            />
            {canSplit && (
                <button
                    type="button"
                    className={styles.measureConvBtn}
                    onClick={() => onChange(buildPair(str))}
                    title="Split into imperial / metric"
                >
                    Split units
                </button>
            )}
        </div>
    );
}

function MixedObjectEditor({
    value,
    onChange,
    quickFactsHints,
}: {
    value: Record<string, unknown>;
    onChange: (v: Record<string, unknown>) => void;
    quickFactsHints?: Record<string, string>;
}) {
    const [obj, setObj] = useState<Record<string, unknown>>({ ...value });
    useEffect(() => setObj({ ...value }), [value]);
    const updateKey = (k: string, v: unknown) => {
        const next = { ...obj, [k]: v };
        setObj(next);
        onChange(next);
    };
    return (
        <div className={styles.objEditor}>
            {Object.entries(obj).map(([k, v]) => (
                <div key={k} className={styles.objRow}>
                    <div className={styles.objLabelRow}>
                        <label className={styles.objLabel}>
                            {k.replace(/_/g, " ")}
                        </label>
                        {quickFactsHints?.[k] && (
                            <span className={styles.qfBadge}>
                                → PDF: {quickFactsHints[k]}
                            </span>
                        )}
                    </div>
                    {MEASUREMENT_KEYS.has(k) || isMeasurementPair(v) ? (
                        <MeasurePairEditor
                            value={v}
                            onChange={(nv) => updateKey(k, nv)}
                        />
                    ) : Array.isArray(v) &&
                      v.length > 0 &&
                      isRankedItem(v[0]) ? (
                        <RankedArrayEditor
                            value={v as RankedItem[]}
                            onChange={(nv) => updateKey(k, nv)}
                        />
                    ) : Array.isArray(v) &&
                      v.every((x) => typeof x === "string") ? (
                        <StringArrayEditor
                            value={v as string[]}
                            onChange={(nv) => updateKey(k, nv)}
                        />
                    ) : Array.isArray(v) && v.length === 0 ? (
                        <button
                            type="button"
                            className={styles.addRowBtn}
                            onClick={() =>
                                updateKey(k, [{ text: "", rank: 5 }])
                            }
                        >
                            + Add item
                        </button>
                    ) : v && typeof v === "object" && !Array.isArray(v) ? (
                        <MixedObjectEditor
                            value={v as Record<string, unknown>}
                            onChange={(nv) => updateKey(k, nv)}
                        />
                    ) : (
                        <Textarea
                            value={
                                typeof v === "string"
                                    ? v
                                    : v == null
                                      ? ""
                                      : JSON.stringify(v, null, 2)
                            }
                            rows={3}
                            placeholder="(empty)"
                            onChange={(nv) => updateKey(k, nv || null)}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Structured calendar editor ────────────────────────────────────────────────
const CAL_MONTHS = MONTH_SHORT;

// Parse first entry of most_popular array into 1-based [from, to] month pair
function parseMonthPair(entries: string[]): [number, number] | null {
    if (!entries?.length) return null;
    const parts: number[] = [];
    for (const part of entries[0].split("/")) {
        const m = part.match(/--(\d{2})/);
        if (m) parts.push(parseInt(m[1], 10));
    }
    if (!parts.length) return null;
    return [parts[0], parts.length > 1 ? parts[1] : parts[0]];
}

// Encode 1-based month pair back to calendar string
function toMonthEntry(from: number, to: number): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return from === to ? `--${pad(from)}` : `--${pad(from)}/--${pad(to)}`;
}

function MonthPicker({
    label,
    pair,
    onChange,
}: {
    label: string;
    pair: [number, number] | null;
    onChange: (pair: [number, number] | null) => void;
}) {
    const from = pair?.[0] ?? 0;
    const to = pair?.[1] ?? from;
    return (
        <div className={styles.calMonthRow}>
            <span className={styles.calMonthLabel}>{label}</span>
            <select
                className={styles.calMonthSelect}
                value={from}
                onChange={(e) => {
                    const n = parseInt(e.target.value);
                    if (!n) onChange(null);
                    else onChange([n, to || n]);
                }}
            >
                <option value={0}>—</option>
                {CAL_MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                        {m}
                    </option>
                ))}
            </select>
            <span className={styles.calMonthTo}>to</span>
            <select
                className={styles.calMonthSelect}
                value={to || from}
                disabled={!from}
                onChange={(e) => {
                    const n = parseInt(e.target.value);
                    if (from) onChange([from, n]);
                }}
            >
                {CAL_MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                        {m}
                    </option>
                ))}
            </select>
        </div>
    );
}

function CalendarEditor({
    value,
    onChange,
}: {
    value: unknown;
    onChange: (v: unknown) => void;
}) {
    type CalRec = Record<string, Record<string, unknown> | undefined>;
    const cal =
        value && typeof value === "object" && !Array.isArray(value)
            ? (value as CalRec)
            : ({} as CalRec);

    const getPop = (key: string) =>
        (cal[key]?.most_popular as string[] | undefined) ?? [];

    const harKey = "harvest_time";

    const updateMostPopular = (
        sectionKey: string,
        pair: [number, number] | null,
    ) => {
        const existing = (cal[sectionKey] ?? {}) as Record<string, unknown>;
        onChange({
            ...cal,
            [sectionKey]: {
                ...existing,
                most_popular: pair ? [toMonthEntry(pair[0], pair[1])] : [],
            },
        });
    };

    return (
        <div>
            <div className={styles.calMonthPanel}>
                <div className={styles.calMonthTitle}>
                    📅 Quick Facts months
                </div>
                <MonthPicker
                    label="SOW"
                    pair={parseMonthPair(getPop("sowing_time"))}
                    onChange={(p) => updateMostPopular("sowing_time", p)}
                />
                <MonthPicker
                    label="HARVEST"
                    pair={parseMonthPair(getPop(harKey))}
                    onChange={(p) => updateMostPopular(harKey, p)}
                />
                <p className={styles.calMonthNote}>
                    Updates <code>most_popular</code> only. Use the full JSON
                    below for less-usual months, notes, and all other details.
                </p>
            </div>
            <JsonEditor value={value} onChange={onChange} />
        </div>
    );
}

// ── JSON editor ───────────────────────────────────────────────────────────────
function JsonEditor({
    value,
    onChange,
}: {
    value: unknown;
    onChange: (v: unknown) => void;
}) {
    const [text, setText] = useState(JSON.stringify(value, null, 2));
    const [err, setErr] = useState("");
    useEffect(() => setText(JSON.stringify(value, null, 2)), [value]);
    const handleChange = (v: string) => {
        setText(v);
        try {
            onChange(JSON.parse(v));
            setErr("");
        } catch {
            setErr("Invalid JSON");
        }
    };
    return (
        <div>
            <Textarea value={text} rows={18} onChange={handleChange} />
            {err && <p className={styles.saveError}>{err}</p>}
        </div>
    );
}

// ── Core Needs editor — three 1–10 sliders (Sun · Water · Nutrition) ──────────
function CoreNeedsEditor({
    value,
    onChange,
}: {
    value: Record<string, unknown> | null;
    onChange: (v: unknown) => void;
}) {
    const cur = (value ?? {}) as Record<string, unknown>;
    const num = (v: unknown): number | null =>
        typeof v === "number" ? v : null;
    const clampOrNull = (raw: string): number | null => {
        if (raw === "") return null;
        const n = Math.round(Number(raw));
        return Number.isFinite(n) ? Math.max(1, Math.min(5, n)) : null;
    };
    const rows: { key: "sun" | "water" | "nutrition"; label: string }[] = [
        { key: "sun", label: "Sun" },
        { key: "water", label: "Water" },
        { key: "nutrition", label: "Nutrition" },
    ];
    const set = (key: string, raw: string) =>
        onChange({
            sun: num(cur.sun),
            water: num(cur.water),
            nutrition: num(cur.nutrition),
            [key]: clampOrNull(raw),
        });
    return (
        <div className={styles.coreNeeds}>
            {rows.map(({ key, label }) => {
                const v = num(cur[key]);
                return (
                    <div key={key} className={styles.coreNeedRow}>
                        <span className={styles.coreNeedLabel}>{label}</span>
                        <input
                            type="range"
                            min={1}
                            max={5}
                            step={1}
                            value={v ?? 1}
                            onChange={(e) => set(key, e.target.value)}
                            className={styles.coreNeedRange}
                        />
                        <input
                            type="number"
                            min={1}
                            max={5}
                            value={v ?? ""}
                            placeholder="–"
                            onChange={(e) => set(key, e.target.value)}
                            className={styles.coreNeedNum}
                        />
                        <span className={styles.coreNeedScale}>/ 5</span>
                    </div>
                );
            })}
        </div>
    );
}

// ── Public FieldEditor dispatcher ─────────────────────────────────────────────
export function FieldEditor({
    editorType,
    value,
    onChange,
    quickFactsHints,
}: {
    editorType: EditorType;
    value: unknown;
    onChange: (v: unknown) => void;
    quickFactsHints?: Record<string, string>;
}) {
    switch (editorType) {
        case "string":
            return (
                <StringEditor
                    value={value as string | null}
                    onChange={onChange}
                />
            );

        case "stringArray":
            return (
                <StringArrayEditor
                    value={
                        Array.isArray(value) ? (value as unknown[]).map(rt) : []
                    }
                    onChange={onChange}
                />
            );

        case "keyNoteArray":
            return (
                <KeyNoteArrayEditor
                    value={Array.isArray(value) ? (value as KeyNoteItem[]) : []}
                    onChange={onChange}
                />
            );

        case "rankedArray":
            return (
                <RankedArrayEditor
                    value={
                        Array.isArray(value)
                            ? (value as unknown[]).map((x) =>
                                  isRankedItem(x)
                                      ? x
                                      : { text: rt(x), rank: 5 },
                              )
                            : []
                    }
                    onChange={onChange}
                />
            );

        case "rankedObject":
            return (
                <RankedObjectEditor
                    value={
                        value &&
                        typeof value === "object" &&
                        !Array.isArray(value)
                            ? Object.fromEntries(
                                  Object.entries(
                                      value as Record<string, unknown>,
                                  ).map(([k, v]) => [
                                      k,
                                      isRankedItem(v)
                                          ? v
                                          : v
                                            ? { text: rt(v), rank: 5 }
                                            : null,
                                  ]),
                              )
                            : {}
                    }
                    onChange={onChange}
                />
            );

        case "rankedKv":
            return (
                <RankedKvEditor
                    value={
                        value &&
                        typeof value === "object" &&
                        !Array.isArray(value)
                            ? (value as Record<string, unknown>)
                            : {}
                    }
                    onChange={onChange}
                />
            );

        case "flatObject":
            return typeof value === "object" &&
                value !== null &&
                !Array.isArray(value) ? (
                <FlatObjectEditor
                    value={value as Record<string, unknown>}
                    onChange={onChange}
                    quickFactsHints={quickFactsHints}
                />
            ) : (
                <JsonEditor value={value} onChange={onChange} />
            );

        case "kvObject":
            return typeof value === "object" &&
                value !== null &&
                !Array.isArray(value) ? (
                <KvObjectEditor
                    value={Object.fromEntries(
                        Object.entries(value as Record<string, unknown>).map(
                            ([k, v]) => [k, typeof v === "string" ? v : null],
                        ),
                    )}
                    onChange={onChange}
                />
            ) : (
                <JsonEditor value={value} onChange={onChange} />
            );

        case "mixedObject":
            return typeof value === "object" &&
                value !== null &&
                !Array.isArray(value) ? (
                <MixedObjectEditor
                    value={value as Record<string, unknown>}
                    onChange={onChange}
                    quickFactsHints={quickFactsHints}
                />
            ) : (
                <JsonEditor value={value} onChange={onChange} />
            );

        case "calendar":
            return typeof value === "object" &&
                value !== null &&
                !Array.isArray(value) ? (
                <CalendarEditor value={value} onChange={onChange} />
            ) : (
                <JsonEditor value={value} onChange={onChange} />
            );

        case "coreNeeds":
            return (
                <CoreNeedsEditor
                    value={
                        value &&
                        typeof value === "object" &&
                        !Array.isArray(value)
                            ? (value as Record<string, unknown>)
                            : null
                    }
                    onChange={onChange}
                />
            );

        case "json":
        default:
            return <JsonEditor value={value} onChange={onChange} />;
    }
}
