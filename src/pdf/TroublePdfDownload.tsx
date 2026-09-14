import { useState } from "react";

interface Props {
    troubleKey: string;
    className?: string;
}

export default function TroublePdfDownload({ troubleKey, className }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const previewUrl = `/api/pdf/trouble/${encodeURIComponent(troubleKey)}?inline=1`;

    const handleSave = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `/api/pdf/trouble/${encodeURIComponent(troubleKey)}`,
            );
            if (!res.ok) {
                const body = (await res.json().catch(() => ({}))) as {
                    error?: string;
                };
                throw new Error(body.error ?? "PDF generation failed");
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${troubleKey.replace(/_/g, "-")}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
                style={{ marginRight: 8, textDecoration: "none" }}
            >
                👁 Preview PDF
            </a>
            <button
                onClick={handleSave}
                className={className}
                disabled={loading}
            >
                {loading ? "Generating…" : "💾 Save PDF"}
            </button>
            {error && (
                <span
                    style={{
                        fontSize: "0.72rem",
                        color: "#fca5a5",
                        marginLeft: 8,
                    }}
                >
                    {error}
                </span>
            )}
        </>
    );
}
