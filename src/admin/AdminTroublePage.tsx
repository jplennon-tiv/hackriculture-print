import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { TroublesData, TroubleGroup } from "../types";
import type { ImageTarget } from "./adminApi";
import { EditableSection } from "./EditableSection";
import { AdminImageEditor } from "./AdminImageEditor";
import type { EditorType } from "./FieldEditor";
import styles from "./Admin.module.css";

type SectionDef = {
    key: keyof TroubleGroup;
    title: string;
    icon: string;
    editorType: EditorType;
};

const SECTIONS: SectionDef[] = [
    {
        key: "source_heading",
        title: "Guide Title",
        icon: "📖",
        editorType: "string",
    },
    {
        key: "applies_to",
        title: "Applies To (vegetables)",
        icon: "🌱",
        editorType: "stringArray",
    },
    {
        key: "introduction",
        title: "Introduction",
        icon: "📝",
        editorType: "string",
    },
    {
        key: "symptom_lookup",
        title: "Symptom Finder Table",
        icon: "🔍",
        editorType: "json",
    },
    {
        key: "conditions",
        title: "Conditions (pests & diseases)",
        icon: "🐛",
        editorType: "json",
    },
];

interface AdminTroublePageProps {
    troublesData: TroublesData;
    onSave: (newTroubles: TroublesData) => Promise<void>;
    onImageUpload: (target: ImageTarget, file: File) => Promise<void>;
    onImageDelete: (target: ImageTarget) => Promise<void>;
}

export function AdminTroublePage({
    troublesData,
    onSave,
    onImageUpload,
    onImageDelete,
}: AdminTroublePageProps) {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const keys = Object.keys(troublesData);
    const key = slug && troublesData[slug] ? slug : keys[0];
    const group: TroubleGroup = troublesData[key] ?? {};

    const [isSaving, setIsSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");

    useEffect(() => {
        setSaveMsg("");
    }, [key]);

    const handleSaveSection = async (sectionKey: string, value: unknown) => {
        setIsSaving(true);
        setSaveMsg("");
        try {
            const updatedGroup = { ...group, [sectionKey]: value };
            const updatedTroubles = { ...troublesData, [key]: updatedGroup };
            await onSave(updatedTroubles);
            setSaveMsg("Saved ✓");
            setTimeout(() => setSaveMsg(""), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (
            !confirm(
                `Delete "${group.source_heading}"? This cannot be undone (a backup will be created).`,
            )
        )
            return;
        setIsSaving(true);
        try {
            const { [key]: _removed, ...rest } = troublesData;
            await onSave(rest as TroublesData);
            const remaining = Object.keys(rest);
            navigate(
                remaining.length > 0
                    ? `/admin/troubles/${remaining[0]}`
                    : "/admin",
                { replace: true },
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.adminPage}>
            <div className={styles.adminPageHeader}>
                <div className={styles.adminPageTitle}>
                    <h1 className={styles.adminVegTitle}>
                        {group.source_heading ?? key}
                    </h1>
                    <span
                        style={{
                            fontSize: "0.78rem",
                            color: "#92400e",
                            fontFamily: "monospace",
                        }}
                    >
                        key: {key}
                    </span>
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
                        🗑 Delete guide
                    </button>
                </div>
            </div>

            <div className={styles.sectionsGrid}>
                {SECTIONS.map((def) => (
                    <EditableSection
                        key={def.key}
                        title={def.title}
                        icon={def.icon}
                        sectionKey={def.key}
                        value={group[def.key] ?? null}
                        editorType={def.editorType}
                        isSaving={isSaving}
                        onSave={handleSaveSection}
                    />
                ))}
            </div>

            {/* Condition images */}
            {group.conditions && Object.keys(group.conditions).length > 0 && (
                <div className={styles.imageSection}>
                    <div className={styles.imageSectionTitle}>
                        🐛 Condition Images
                    </div>
                    <div className={styles.conditionImagesGrid}>
                        {Object.entries(group.conditions).map(
                            ([condKey, cond]) => (
                                <AdminImageEditor
                                    key={condKey}
                                    label={cond.name}
                                    currentImage={cond.image ?? null}
                                    isSaving={isSaving}
                                    onUpload={(file) =>
                                        onImageUpload(
                                            {
                                                type: "trouble",
                                                key,
                                                conditionKey: condKey,
                                            },
                                            file,
                                        )
                                    }
                                    onDelete={() =>
                                        onImageDelete({
                                            type: "trouble",
                                            key,
                                            conditionKey: condKey,
                                        })
                                    }
                                />
                            ),
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
