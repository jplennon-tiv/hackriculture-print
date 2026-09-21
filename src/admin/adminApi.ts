import type { GardeningData, TroublesData } from "../types";

const BASE = "/api/admin";
let loadedRevision: string | undefined;

export async function verifyPassword(password: string): Promise<boolean> {
    const res = await fetch(`${BASE}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
    });
    return res.ok;
}

export async function fetchAdminData(): Promise<{
    vegetables: GardeningData;
    troubles: TroublesData;
}> {
    const res = await fetch(`${BASE}/data`);
    if (!res.ok) throw new Error("Failed to fetch admin data");
    const data=await res.json();loadedRevision=data.revision;return data;
}

export async function saveData(
    password: string,
    vegetables: GardeningData,
    troubles?: TroublesData,
): Promise<void> {
    const res = await fetch(`${BASE}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            password,
            revision: loadedRevision,
            vegetables,
            ...(troubles ? { troubles } : {}),
        }),
    });
    if (!res.ok) {
        const err = (await res.json()) as {
            error?: string;
            details?: string[];
        };
        const base = err.error ?? "Save failed";
        const detail = err.details?.length
            ? "\n\n" + err.details.map((d) => "• " + d).join("\n")
            : "";
        throw new Error(base + detail);
    }
    loadedRevision=(await res.json()).revision;
}

// ── Image management ──────────────────────────────────────────────────────────

export type ImageTarget =
    | { type: "vegetable"; key: string }
    | { type: "trouble"; key: string; conditionKey: string };

/** Upload a new image file and associate it with a vegetable or trouble condition. */
export async function uploadImage(
    password: string,
    target: ImageTarget,
    file: File,
): Promise<string> {
    const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]); // strip data: prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const res = await fetch(`${BASE}/upload-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            password,
            ...target,
            fileData,
            fileName: file.name,
        }),
    });
    if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Upload failed");
    }
    const data = (await res.json()) as { imagePath: string };
    return data.imagePath;
}

/** Delete an image and set the image field to null in the JSON. */
export async function deleteImage(
    password: string,
    target: ImageTarget,
): Promise<void> {
    const res = await fetch(`${BASE}/delete-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, ...target }),
    });
    if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Delete failed");
    }
}
