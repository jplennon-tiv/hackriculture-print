import { useState, useEffect } from "react";
import { FieldEditor, type EditorType } from "./FieldEditor";
import styles from "./Admin.module.css";

interface EditableSectionProps {
    title: string;
    icon: string;
    sectionKey: string;
    value: unknown;
    editorType: EditorType;
    isSaving: boolean;
    onSave: (key: string, newValue: unknown) => Promise<void>;
    quickFactsBadge?: string[];
    quickFactsHints?: Record<string, string>;
    sectionNote?: string;
}

export function EditableSection({
    title,
    icon,
    sectionKey,
    value,
    editorType,
    isSaving,
    onSave,
    quickFactsBadge,
    quickFactsHints,
    sectionNote,
}: EditableSectionProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<unknown>(value);
    const [saveError, setSaveErr] = useState("");

    // Close on Escape
    useEffect(() => {
        if (!editing) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleCancel();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

    // When the section value is null and the editor needs a pre-existing object
    // to render fields (flatObject / kvObject / mixedObject), fall back to the
    // JSON textarea so the user can type in the full structure from scratch.
    const objectTypes: EditorType[] = ["flatObject", "kvObject", "mixedObject"];
    const effectiveEditorType: EditorType =
        value === null && objectTypes.includes(editorType)
            ? "json"
            : editorType;

    const handleEdit = () => {
        setDraft(value);
        setSaveErr("");
        setEditing(true);
    };

    const handleCancel = () => {
        setDraft(value);
        setSaveErr("");
        setEditing(false);
    };

    const handleSave = async () => {
        setSaveErr("");
        try {
            await onSave(sectionKey, draft);
            setEditing(false);
        } catch (err) {
            setSaveErr(String(err));
        }
    };

    const isNull = value === null || value === undefined;

    return (
        <div
            id={sectionKey}
            className={`${styles.editCard} ${editing ? styles.editCardActive : ""}`}
        >
            {/* Card header */}
            <div className={styles.editCardHeader}>
                <span className={styles.editCardIcon}>{icon}</span>
                <h2 className={styles.editCardTitle}>{title}</h2>
                {!editing && (
                    <button className={styles.editBtn} onClick={handleEdit}>
                        ✏️ {isNull ? "Add" : "Edit"}
                    </button>
                )}
            </div>

            {/* Quick Facts tags (always visible) */}
            {quickFactsBadge && quickFactsBadge.length > 0 && (
                <div className={styles.qfTagsRow}>
                    <span className={styles.qfTagsLabel}>Feeds PDF:</span>
                    {quickFactsBadge.map((b) => (
                        <span key={b} className={styles.qfHeaderBadge}>
                            {b}
                        </span>
                    ))}
                </div>
            )}
            {sectionNote && <p className={styles.sectionNote}>{sectionNote}</p>}

            {/* Display value summary (when not editing) */}
            {!editing && (
                <div className={styles.valueSummary}>
                    {isNull ? (
                        <span className={styles.nullBadge}>Not set</span>
                    ) : (
                        <span className={styles.valuePeek}>
                            {summarise(value)}
                        </span>
                    )}
                </div>
            )}

            {/* Editor (when editing) */}
            {editing && (
                <div className={styles.editorBody}>
                    <FieldEditor
                        editorType={effectiveEditorType}
                        value={draft}
                        onChange={setDraft}
                        quickFactsHints={quickFactsHints}
                    />
                    {saveError && (
                        <p className={styles.saveError}>{saveError}</p>
                    )}
                    <div className={styles.editActions}>
                        <button
                            className={styles.saveSectionBtn}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving…" : "💾 Save section"}
                        </button>
                        <button
                            className={styles.cancelSectionBtn}
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Peek summary ──────────────────────────────────────────────────────────────
function summarise(v: unknown): string {
    if (typeof v === "string")
        return v.length > 120 ? v.slice(0, 120) + "…" : v;
    if (Array.isArray(v)) {
        const first = v[0];
        const preview =
            first == null
                ? ""
                : typeof first === "string"
                  ? first
                  : typeof first === "object" && "text" in (first as object)
                    ? (first as { text: string }).text
                    : String(first);
        return `${v.length} item${v.length !== 1 ? "s" : ""}: ${preview.slice(0, 60)}…`;
    }
    if (typeof v === "object" && v !== null) {
        // RankedText single value — show the text
        if ("text" in v && "rank" in v)
            return `[rank ${(v as { rank: number }).rank}] ${(v as { text: string }).text.slice(0, 100)}`;
        const keys = Object.keys(v);
        return `{ ${keys.slice(0, 4).join(", ")}${keys.length > 4 ? "…" : ""} }`;
    }
    return String(v);
}
