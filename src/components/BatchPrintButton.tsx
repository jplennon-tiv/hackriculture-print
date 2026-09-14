import { useState } from "react";
import { useUnits } from "../lib/units";
import { usePaper } from "../lib/paper";

interface BatchProgress {
    total: number;
    done: number;
    ok: number;
    errors: number;
    current?: string;
    finished: boolean;
    outputDir?: string;
    fatal?: string;
    errorList: { label: string; detail?: string }[];
}

const INITIAL: BatchProgress = {
    total: 0,
    done: 0,
    ok: 0,
    errors: 0,
    finished: false,
    errorList: [],
};

/**
 * Header button that triggers POST /api/pdf/batch and displays streaming
 * NDJSON progress from the server. Writes all PDFs to ./output/ on disk.
 */
export function BatchPrintButton() {
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState<BatchProgress>(INITIAL);
    const { system } = useUnits();
    const { paper } = usePaper();

    const handleClick = async () => {
        if (running) return;
        setRunning(true);
        setProgress(INITIAL);

        try {
            const res = await fetch(
                `/api/pdf/batch?units=${system}&paper=${paper}`,
                {
                    method: "POST",
                },
            );
            if (!res.ok || !res.body) {
                throw new Error(`Batch request failed: ${res.status}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                // Split complete NDJSON lines
                let idx: number;
                while ((idx = buffer.indexOf("\n")) !== -1) {
                    const line = buffer.slice(0, idx).trim();
                    buffer = buffer.slice(idx + 1);
                    if (!line) continue;
                    let msg: Record<string, unknown>;
                    try {
                        msg = JSON.parse(line);
                    } catch {
                        continue;
                    }

                    setProgress((prev) => reducer(prev, msg));
                }
            }
        } catch (err) {
            setProgress((prev) => ({
                ...prev,
                fatal: String(err),
                finished: true,
            }));
        } finally {
            setRunning(false);
        }
    };

    const pct =
        progress.total > 0
            ? Math.round((progress.done / progress.total) * 100)
            : 0;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
                onClick={handleClick}
                disabled={running}
                style={{
                    padding: "6px 12px",
                    fontSize: "0.85rem",
                    background: running ? "#4b5563" : "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: running ? "wait" : "pointer",
                }}
                title="Render every vegetable and trouble group to ./output/"
            >
                {running ? `🖨 ${pct}%` : "🖨 Batch print all"}
            </button>
            {running && progress.current && (
                <span style={{ fontSize: "0.75rem", color: "#d1d5db" }}>
                    {progress.done}/{progress.total} · {progress.current}
                </span>
            )}
            {progress.finished && !progress.fatal && (
                <span style={{ fontSize: "0.75rem", color: "#a7f3d0" }}>
                    ✅ {progress.ok} ok
                    {progress.errors > 0 && ` · ⚠️ ${progress.errors} errors`}
                    {progress.outputDir && ` → ${progress.outputDir}`}
                </span>
            )}
            {progress.fatal && (
                <span style={{ fontSize: "0.75rem", color: "#fca5a5" }}>
                    ⛔ {progress.fatal}
                </span>
            )}
        </div>
    );
}

function reducer(
    prev: BatchProgress,
    msg: Record<string, unknown>,
): BatchProgress {
    const event = msg.event as string | undefined;
    if (event === "start") {
        return {
            ...INITIAL,
            total: Number(msg.total ?? 0),
            outputDir: msg.outputDir as string | undefined,
        };
    }
    if (event === "progress") {
        const label = String(msg.label ?? msg.slug ?? "");
        const status = msg.status as string | undefined;
        const isErr = status === "error";
        const errorList = isErr
            ? [
                  ...prev.errorList,
                  { label, detail: msg.detail as string | undefined },
              ]
            : prev.errorList;
        return {
            ...prev,
            done: prev.done + 1,
            ok: prev.ok + (isErr ? 0 : 1),
            errors: prev.errors + (isErr ? 1 : 0),
            current: label,
            errorList,
        };
    }
    if (event === "done") {
        return {
            ...prev,
            finished: true,
            ok: Number(msg.ok ?? prev.ok),
            errors: Number(msg.errors ?? prev.errors),
            outputDir: (msg.outputDir as string) ?? prev.outputDir,
            current: undefined,
        };
    }
    if (event === "fatal") {
        return {
            ...prev,
            finished: true,
            fatal:
                (msg.error as string) ?? String(msg.detail ?? "batch failed"),
        };
    }
    return prev;
}
