import { useRef, useState } from "react";
import styles from "./Admin.module.css";

interface AdminImageEditorProps {
    /** Label shown above the preview (e.g. vegetable name or condition name). */
    label: string;
    /** Current image URL, or null/undefined if no image. */
    currentImage: string | null | undefined;
    /** Called with the selected File when the user picks a replacement. */
    onUpload: (file: File) => Promise<void>;
    /** Called when the user clicks delete. */
    onDelete: () => Promise<void>;
    /** Suppress interactions while parent is already saving. */
    isSaving?: boolean;
}

export function AdminImageEditor({
    label,
    currentImage,
    onUpload,
    onDelete,
    isSaving = false,
}: AdminImageEditorProps) {
    const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
        "idle",
    );
    const inputRef = useRef<HTMLInputElement>(null);
    // Append timestamp to bust browser cache after upload
    const [bust, setBust] = useState(0);

    const busy = isSaving || status === "saving";

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setStatus("saving");
        try {
            await onUpload(file);
            setBust((n) => n + 1);
            setStatus("done");
            setTimeout(() => setStatus("idle"), 3000);
        } catch {
            setStatus("error");
            setTimeout(() => setStatus("idle"), 4000);
        }
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleDelete = async () => {
        if (!confirm(`Delete the image for "${label}"?`)) return;
        setStatus("saving");
        try {
            await onDelete();
            setBust((n) => n + 1);
            setStatus("done");
            setTimeout(() => setStatus("idle"), 3000);
        } catch {
            setStatus("error");
            setTimeout(() => setStatus("idle"), 4000);
        }
    };

    const imgSrc = currentImage ? `${currentImage}?t=${bust}` : null;

    return (
        <div className={styles.imageEditorCard}>
            <div className={styles.imageEditorLabel}>{label}</div>

            <div className={styles.imageEditorPreview}>
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={label}
                        className={styles.imageEditorImg}
                    />
                ) : (
                    <div className={styles.imageEditorPlaceholder}>
                        No image
                    </div>
                )}
            </div>

            <div className={styles.imageEditorActions}>
                {/* Hidden file input */}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={busy}
                    style={{ display: "none" }}
                />
                <button
                    className={styles.saveSectionBtn}
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                >
                    {busy && status === "saving"
                        ? "Saving…"
                        : currentImage
                          ? "↑ Replace"
                          : "↑ Upload"}
                </button>

                {currentImage && (
                    <button
                        className={styles.deleteBtn}
                        onClick={handleDelete}
                        disabled={busy}
                        style={{ padding: "0.35rem 0.65rem" }}
                    >
                        🗑
                    </button>
                )}

                {status === "done" && (
                    <span className={styles.saveMsg}>Saved ✓</span>
                )}
                {status === "error" && (
                    <span className={styles.errorMsg}>Error ✗</span>
                )}
            </div>
        </div>
    );
}
