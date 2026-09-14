import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { GardeningData, Vegetable } from "../types";
import type { ImageTarget } from "./adminApi";
import { EditableSection } from "./EditableSection";
import { AdminImageEditor } from "./AdminImageEditor";
import type { EditorType } from "./FieldEditor";
import { extractQfRows, type QfRow } from "./qfHelpers";
import { slugify } from "../lib/slug";
import styles from "./Admin.module.css";

type SectionDef = {
    key: keyof Vegetable;
    title: string;
    icon: string;
    editorType: EditorType;
    quickFactsBadge?: string[];
    quickFactsHints?: Record<string, string>;
    sectionNote?: string;
};

// ── Quick Facts hint maps (field key → PDF label) ─────────────────────────────
const QF_FACTS_HINTS: Record<string, string> = {
    ready_in_short: "READY IN (header)",
    expected_germination_time: "GERMINATION",
    time_between_planting_and_sprouting: "GERMINATION",
    germination_period: "GERMINATION",
    expected_yield_per_plant: "YIELD",
    expected_yield_per_mature_plant: "YIELD",
    expected_yield_from_a_10_ft_row_maincrop: "YIELD",
    expected_yield_from_a_10_ft_row: "YIELD",
    expected_yield_per_10_ft_row: "YIELD",
    approximate_time_between_sowing_and_lifting_maincrop: "READY IN",
    approximate_time_between_sowing_and_picking: "READY IN",
    approximate_time_between_spring_sowing_and_picking: "READY IN",
    approximate_time_between_planting_and_lifting: "READY IN",
    approximate_time_between_planting_and_cutting: "READY IN",
    approximate_time_between_sowing_and_cutting: "READY IN",
    approximate_time_between_sowing_and_harvesting: "READY IN",
    approximate_time_between_planting_and_harvesting: "READY IN",
    life_expectancy_of_stored_seed: "SEED LIFE",
};
const QF_FACTS_BADGE = ["GERMINATION", "YIELD", "READY IN", "SEED LIFE"];

const QF_SOWING_HINTS: Record<string, string> = {
    sowing_depth: "DEPTH",
    planting_depth: "DEPTH",
    row_spacing: "ROW SPACING",
    plant_spacing: "PLANT SPACING",
};
const QF_SOWING_BADGE = ["DEPTH", "ROW SPACING", "PLANT SPACING"];

const SECTIONS: SectionDef[] = [
    {
        key: "name",
        title: "Display Name",
        icon: "✏️",
        editorType: "string",
    },
    {
        key: "image_thumbnail",
        title: "Thumbnail Image URL",
        icon: "🖼️",
        editorType: "string",
    },
    {
        key: "hero_header",
        title: "Hero Header",
        icon: "✨",
        editorType: "string",
    },
    {
        key: "introduction",
        title: "Introduction",
        icon: "📖",
        editorType: "string",
    },
    {
        key: "seed_and_growing_facts",
        title: "Seed & Growing Facts",
        icon: "🌰",
        editorType: "flatObject",
        quickFactsBadge: QF_FACTS_BADGE,
        quickFactsHints: QF_FACTS_HINTS,
    },
    {
        key: "soil_facts",
        title: "Soil & Preparation",
        icon: "🌍",
        editorType: "rankedArray",
    },
    {
        key: "sowing_and_planting",
        title: "Sowing & Planting",
        icon: "🌱",
        editorType: "mixedObject",
        quickFactsBadge: QF_SOWING_BADGE,
        quickFactsHints: QF_SOWING_HINTS,
    },
    {
        key: "looking_after_the_crop",
        title: "Looking After the Crop",
        icon: "🪴",
        editorType: "rankedArray",
    },
    {
        key: "harvesting",
        title: "Harvesting",
        icon: "🧺",
        editorType: "rankedArray",
    },
    {
        key: "in_the_kitchen",
        title: "In the Kitchen",
        icon: "🍳",
        editorType: "rankedObject",
    },
    { key: "varieties", title: "Varieties", icon: "🏷️", editorType: "json" },
    {
        key: "troubles",
        title: "Pests & Diseases",
        icon: "🐛",
        editorType: "rankedKv",
    },
    {
        key: "calendar",
        title: "Calendar",
        icon: "📅",
        editorType: "calendar",
        quickFactsBadge: ["SOW", "HARVEST"],
        sectionNote:
            'SOW → "sowing_time.most_popular"  ·  HARVEST → "harvest_time.most_popular"',
    },
    {
        key: "troubles_detail",
        title: "Troubles Detail Ref",
        icon: "🔗",
        editorType: "string",
    },
    {
        key: "key_notes",
        title: "Page 2 Bubble Notes",
        icon: "💬",
        editorType: "keyNoteArray",
        sectionNote:
            "Speech bubble content for page 2 header. Max 2 shown (1 for names > 9 chars). Each note has a bold title and a body paragraph.",
    },
    {
        key: "yield",
        title: "Yield",
        icon: "⚖️",
        editorType: "json",
        sectionNote:
            "Structured yield: default (per_plant / per_10_ft_row / …) + by_variety overrides. Each leaf keeps original prose in `text`.",
    },
    {
        key: "time_to_harvest",
        title: "Time to Harvest",
        icon: "⏱️",
        editorType: "json",
        sectionNote:
            "Structured time-to-harvest: default (from_sowing / from_planting) + by_variety overrides + ready_in_short. Harvest verbs (pick/lift/cut) are collapsed.",
    },
    {
        key: "core_needs",
        title: "Core Needs (1–5)",
        icon: "📊",
        editorType: "coreNeeds",
        sectionNote:
            "Page-1 CORE NEEDS bars. 1 = low need, 5 = high need · Sun / Water / Nutrition.",
    },
    {
        key: "metadata",
        title: "Metadata (one-off notes)",
        icon: "🧾",
        editorType: "json",
        sectionNote:
            "Home for one-off facts pertinent to a single vegetable only (e.g. mushroom spore-saving). Free-form JSON object.",
    },
];

interface AdminVegetablePageProps {
    data: GardeningData;
    onSave: (newData: GardeningData) => Promise<void>;
    onImageUpload: (target: ImageTarget, file: File) => Promise<void>;
    onImageDelete: (target: ImageTarget) => Promise<void>;
}

// ── Quick Facts summary panel ─────────────────────────────────────────────────
function QuickFactsSummary({ veg }: { veg: Vegetable }) {
    const rows: QfRow[] = extractQfRows(veg);
    const filled = rows.filter((r) => r.value).length;

    const jumpTo = (sectionKey: string) =>
        document
            .getElementById(sectionKey)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });

    return (
        <div className={styles.qfSummaryPanel}>
            <div className={styles.qfSummaryHeader}>
                <span className={styles.qfSummaryTitle}>
                    📄 Quick Facts Preview
                </span>
                <span className={styles.qfSummaryScore}>
                    {filled} / {rows.length} complete
                </span>
            </div>
            <table className={styles.qfSummaryTable}>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={row.label}
                            className={`${styles.qfSummaryRow}${!row.value ? " " + styles.qfSummaryRowMissing : ""}`}
                            onClick={() => jumpTo(row.sectionKey)}
                            title={`Jump to ${row.sectionKey.replace(/_/g, " ")} → ${row.value ?? "not set"}`}
                        >
                            <td className={styles.qfSummaryLabel}>
                                {row.label}
                            </td>
                            <td
                                className={styles.qfSummaryVal}
                                title={row.value ?? ""}
                            >
                                {row.value ? (
                                    row.value.length > 65 ? (
                                        row.value.slice(0, 63) + "…"
                                    ) : (
                                        row.value
                                    )
                                ) : (
                                    <span className={styles.qfSummaryMissing}>
                                        missing
                                    </span>
                                )}
                            </td>
                            <td className={styles.qfSummaryJump}>↓</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function AdminVegetablePage({
    data,
    onSave,
    onImageUpload,
    onImageDelete,
}: AdminVegetablePageProps) {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const vegetables = Object.values(data)
        .map((v) => v.name ?? "")
        .filter(Boolean);
    // slug from URL IS the JSON key
    const key = slug ?? slugify(vegetables[0]);
    const veg: Vegetable = data[key] ?? {};
    const name = veg.name ?? key;

    const [isSaving, setIsSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(name);
    const renameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setNewName(veg.name ?? key);
        setIsRenaming(false);
        setSaveMsg("");
    }, [key, veg.name]);

    // ── Save a single section ─────────────────────────────────────────────────
    const handleSaveSection = async (sectionKey: string, value: unknown) => {
        setIsSaving(true);
        setSaveMsg("");
        try {
            const updatedVeg = { ...veg, [sectionKey]: value };
            const updatedData = { ...data, [key]: updatedVeg };
            await onSave(updatedData);
            setSaveMsg("Saved ✓");
            setTimeout(() => setSaveMsg(""), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Rename vegetable (updates the name field, keeps the JSON key stable) ──
    const handleRename = async () => {
        const trimmed = newName.trim();
        if (!trimmed || trimmed === name) {
            setIsRenaming(false);
            return;
        }
        setIsSaving(true);
        try {
            const updatedVeg = { ...veg, name: trimmed };
            const updatedData = { ...data, [key]: updatedVeg };
            await onSave(updatedData);
            setIsRenaming(false);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Delete vegetable ──────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (
            !confirm(
                `Delete "${name}"? This cannot be undone (a backup will be created).`,
            )
        )
            return;
        setIsSaving(true);
        try {
            const { [key]: _removed, ...rest } = data;
            await onSave(rest as GardeningData);
            const remaining = Object.keys(rest);
            navigate(
                remaining.length > 0
                    ? `/admin/vegetable/${remaining[0]}`
                    : "/admin",
                { replace: true },
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.adminPage}>
            {/* Page header */}
            <div className={styles.adminPageHeader}>
                <div className={styles.adminPageTitle}>
                    {isRenaming ? (
                        <div className={styles.renameRow}>
                            <input
                                ref={renameRef}
                                className={styles.renameInput}
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRename();
                                    if (e.key === "Escape")
                                        setIsRenaming(false);
                                }}
                                autoFocus
                            />
                            <button
                                className={styles.saveSectionBtn}
                                onClick={handleRename}
                                disabled={isSaving}
                            >
                                Save name
                            </button>
                            <button
                                className={styles.cancelSectionBtn}
                                onClick={() => {
                                    setIsRenaming(false);
                                    setNewName(name);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <>
                            <h1 className={styles.adminVegTitle}>{name}</h1>
                            <button
                                className={styles.editBtn}
                                onClick={() => setIsRenaming(true)}
                                title="Rename"
                            >
                                ✏️ Rename
                            </button>
                        </>
                    )}
                </div>
                <div className={styles.adminPageActions}>
                    {saveMsg && (
                        <span className={styles.saveMsg}>{saveMsg}</span>
                    )}
                    <button
                        className={styles.deleteBtn}
                        onClick={handleDelete}
                        disabled={isSaving}
                    >
                        🗑 Delete vegetable
                    </button>
                </div>
            </div>

            {/* Hero image + Quick Facts row */}
            <div className={styles.heroQfRow}>
                <div
                    className={`${styles.imageSection} ${styles.imageSectionCompact}`}
                >
                    <div className={styles.imageSectionTitle}>Hero Image</div>
                    <AdminImageEditor
                        label={name}
                        currentImage={veg.image ?? null}
                        isSaving={isSaving}
                        onUpload={(file) =>
                            onImageUpload({ type: "vegetable", key }, file)
                        }
                        onDelete={() =>
                            onImageDelete({ type: "vegetable", key })
                        }
                    />
                </div>
                <QuickFactsSummary veg={veg} />
            </div>

            {/* Sections */}
            <div className={styles.sectionsGrid}>
                {SECTIONS.map((def) => (
                    <EditableSection
                        key={def.key}
                        title={def.title}
                        icon={def.icon}
                        sectionKey={def.key}
                        value={veg[def.key] ?? null}
                        editorType={def.editorType}
                        isSaving={isSaving}
                        onSave={handleSaveSection}
                        quickFactsBadge={def.quickFactsBadge}
                        quickFactsHints={def.quickFactsHints}
                        sectionNote={def.sectionNote}
                    />
                ))}
            </div>
        </div>
    );
}
