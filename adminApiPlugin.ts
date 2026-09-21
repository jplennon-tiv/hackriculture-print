import {readCollection,saveCollections,revision} from "../hackriculture-data/lib/records.mjs";
import type { Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import {createHash} from 'node:crypto';
import type { IncomingMessage, ServerResponse } from "node:http";
import { GardeningDataSchema, TroublesDataSchema, PlantingPrintContentSchema, TroublePrintSummarySchema } from "./src/schema";

// ── Integrity validators ───────────────────────────────────────────────────────

type RankedItem = {
    text: string;
    rank: number;
    star?: boolean;
    short_text?: string;
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

function checkRankedArray(arr: unknown, path: string, errors: string[]) {
    if (arr == null) return;
    if (!Array.isArray(arr)) {
        errors.push(`${path}: must be array`);
        return;
    }
    arr.forEach((item, i) => {
        if (item == null) return;
        if (typeof item === "string") return; // plain string still OK
        if (!isRankedItem(item)) {
            errors.push(
                `${path}[${i}]: must be a string or {text, rank} object`,
            );
            return;
        }
        if (item.rank < 1 || item.rank > 10)
            errors.push(`${path}[${i}]: rank must be 1–10 (got ${item.rank})`);
        if (item.star !== undefined && typeof item.star !== "boolean")
            errors.push(`${path}[${i}]: star must be boolean`);
    });
}

function validateVegetables(data: unknown): string[] {
    const errors: string[] = [];
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        errors.push("vegetables.json must be a JSON object");
        return errors;
    }
    const vegs = data as Record<string, unknown>;
    for (const [key, veg] of Object.entries(vegs)) {
        if (!veg || typeof veg !== "object" || Array.isArray(veg)) {
            errors.push(`${key}: must be an object`);
            continue;
        }
        const v = veg as Record<string, unknown>;

        // Required fields
        if (!v.name || typeof v.name !== "string")
            errors.push(`${key}: name is missing or not a string`);

        // troubles_detail must be array or null, never a plain string
        if (typeof v.troubles_detail === "string")
            errors.push(
                `${key}: troubles_detail must be array or null, not a string`,
            );
        if (
            v.troubles_detail !== null &&
            v.troubles_detail !== undefined &&
            !Array.isArray(v.troubles_detail)
        )
            errors.push(`${key}: troubles_detail must be array or null`);

        // Ranked array fields
        for (const field of [
            "soil_facts",
            "looking_after_the_crop",
            "harvesting",
        ]) {
            checkRankedArray(v[field], `${key}.${field}`, errors);
        }
        // Notes inside sowing_and_planting (including nested sub-routes)
        const sp = v.sowing_and_planting as Record<string, unknown> | null;
        if (v.print_planting != null) {
            const print = PlantingPrintContentSchema.safeParse(v.print_planting);
            if (!print.success) errors.push(`${key}.print_planting: invalid illustrated print content`);
        }
        if (sp?.notes)
            checkRankedArray(
                sp.notes,
                `${key}.sowing_and_planting.notes`,
                errors,
            );
        // Also validate notes on any nested seed_sowing/planting sub-routes
        for (const sub of ["seed_sowing", "planting"]) {
            const subSec = sp?.[sub] as Record<string, unknown> | null;
            if (subSec?.notes)
                checkRankedArray(
                    subSec.notes,
                    `${key}.sowing_and_planting.${sub}.notes`,
                    errors,
                );
        }

        // in_the_kitchen: values must be RankedText or null
        const k = v.in_the_kitchen as Record<string, unknown> | null;
        if (k) {
            for (const field of [
                "overview",
                "storage",
                "cooking",
                "freezing",
            ]) {
                const val = k[field];
                if (val == null) continue;
                if (typeof val === "string") {
                    errors.push(
                        `${key}.in_the_kitchen.${field}: must be {text, rank} object (not plain string)`,
                    );
                    continue;
                }
                if (!isRankedItem(val))
                    errors.push(
                        `${key}.in_the_kitchen.${field}: must be {text, rank} object`,
                    );
                else if (val.rank < 1 || val.rank > 10)
                    errors.push(
                        `${key}.in_the_kitchen.${field}: rank must be 1–10`,
                    );
            }
        }

        // troubles: each named entry must be RankedText or null (not plain object without rank)
        const t = v.troubles as Record<string, unknown> | null;
        if (t) {
            for (const [tk, tv] of Object.entries(t)) {
                if (tk === "_note" || tk === "_redirect") continue;
                if (tv == null || typeof tv === "string") continue;
                if (!isRankedItem(tv))
                    errors.push(
                        `${key}.troubles.${tk}: must be {text, rank} object or string`,
                    );
                else if (tv.rank < 1 || tv.rank > 10)
                    errors.push(`${key}.troubles.${tk}: rank must be 1–10`);
            }
        }
    }
    return errors;
}

function validateTroubles(data: unknown): string[] {
    const errors: string[] = [];
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        errors.push("troubles.json must be a JSON object");
        return errors;
    }
    const groups = data as Record<string, unknown>;
    for (const [key, group] of Object.entries(groups)) {
        if (!group || typeof group !== "object" || Array.isArray(group)) {
            errors.push(`${key}: must be an object`);
            continue;
        }
        const g = group as Record<string, unknown>;
        if (!g.source_heading || typeof g.source_heading !== "string")
            errors.push(`${key}: missing source_heading`);
        if (
            !g.conditions ||
            typeof g.conditions !== "object" ||
            Array.isArray(g.conditions)
        )
            continue;
        const conds = g.conditions as Record<string, unknown>;
        for (const [ck, cond] of Object.entries(conds)) {
            if (!cond || typeof cond !== "object") {
                errors.push(`${key}.conditions.${ck}: must be an object`);
                continue;
            }
            const c = cond as Record<string, unknown>;
            if (c.print_summary != null && !TroublePrintSummarySchema.safeParse(c.print_summary).success)
                errors.push(`${key}.conditions.${ck}: invalid print_summary`);
            if (!c.name || typeof c.name !== "string")
                errors.push(`${key}.conditions.${ck}: missing name`);
            if (
                c.rank !== undefined &&
                (typeof c.rank !== "number" ||
                    (c.rank as number) < 1 ||
                    (c.rank as number) > 10)
            )
                errors.push(`${key}.conditions.${ck}: rank must be 1–10`);
            // applies_to must be array of strings when present
            if (c.applies_to !== undefined) {
                if (
                    !Array.isArray(c.applies_to) ||
                    !(c.applies_to as unknown[]).every(
                        (x) => typeof x === "string",
                    )
                )
                    errors.push(
                        `${key}.conditions.${ck}: applies_to must be string[]`,
                    );
            }
        }
    }
    return errors;
}

// ──────────────────────────────────────────────────────────────────────────────

export function adminApiPlugin(): Plugin {
    return {
        name: "admin-api",
        configureServer(server) {
            server.middlewares.use(
                async (
                    req: IncomingMessage,
                    res: ServerResponse,
                    next: () => void,
                ) => {
                    if (!req.url?.startsWith("/api/admin")) return next();

                    const ROOT = server.config.root;
                    const DATA = path.resolve(ROOT, "../hackriculture-data");
                    const PASSWORD = process.env.ADMIN_PASSWORD ?? "M4sterc4rd";

                    const endpoint = req.url
                        .replace(/\?.*$/, "")
                        .slice("/api/admin".length);
                    res.setHeader("Content-Type", "application/json");

                    // Parse body
                    let body: Record<string, unknown> = {};
                    if (req.method !== "GET") {
                        try {
                            const raw = await new Promise<string>(
                                (resolve, reject) => {
                                    const chunks: Buffer[] = [];
                                    req.on("data", (c: Buffer) =>
                                        chunks.push(Buffer.from(c)),
                                    );
                                    req.on("end", () =>
                                        resolve(
                                            Buffer.concat(chunks).toString(
                                                "utf-8",
                                            ),
                                        ),
                                    );
                                    req.on("error", reject);
                                },
                            );
                            body = raw
                                ? (JSON.parse(raw) as Record<string, unknown>)
                                : {};
                        } catch {
                            res.writeHead(400);
                            res.end(
                                JSON.stringify({ error: "Invalid JSON body" }),
                            );
                            return;
                        }
                    }

                    const send = (code: number, data: unknown) => {
                        res.writeHead(code);
                        res.end(JSON.stringify(data));
                    };

                    try {
                        // POST /verify
                        if (endpoint === "/verify" && req.method === "POST") {
                            const ok = body.password === PASSWORD;
                            return send(ok ? 200 : 401, { ok });
                        }

                        // GET /data — no auth needed (data already shipped with the app)
                        if (endpoint === "/data" && req.method === "GET") {
                            return send(200, {vegetables:readCollection("vegetables",DATA),troubles:readCollection("troubles",DATA),revision:revision(DATA)});
                        }

                        // Auth guard for mutating endpoints
                        if (body.password !== PASSWORD)
                            return send(401, { error: "Unauthorized" });

                        // POST /save
                        if (endpoint === "/save" && req.method === "POST") {
                            const { vegetables, troubles } = body as {
                                vegetables: Record<string, unknown>;
                                troubles?: Record<string, unknown>;
                            };

                            // ── Integrity checks before touching disk ────────
                            const vegErrors = validateVegetables(vegetables);
                            const trErrors = troubles
                                ? validateTroubles(troubles)
                                : [];

                            // ── Schema validation (belt-and-braces) ─────────
                            const vegSchema =
                                GardeningDataSchema.safeParse(vegetables);
                            if (!vegSchema.success) {
                                for (const issue of vegSchema.error.issues.slice(
                                    0,
                                    20,
                                )) {
                                    vegErrors.push(
                                        `schema: ${issue.path.join(".")} — ${issue.message}`,
                                    );
                                }
                            }
                            if (troubles) {
                                const trSchema =
                                    TroublesDataSchema.safeParse(troubles);
                                if (!trSchema.success) {
                                    for (const issue of trSchema.error.issues.slice(
                                        0,
                                        20,
                                    )) {
                                        trErrors.push(
                                            `schema: ${issue.path.join(".")} — ${issue.message}`,
                                        );
                                    }
                                }
                            }

                            const allErrors = [...vegErrors, ...trErrors];
                            if (allErrors.length > 0) {
                                return send(400, {
                                    error: `Save rejected — ${allErrors.length} integrity error${allErrors.length > 1 ? "s" : ""}`,
                                    details: allErrors,
                                });
                            }

                            if(typeof body.revision!=="string")return send(409,{error:"Reload the editor before saving (missing data revision)."});
                            const result=saveCollections({vegetables,...(troubles?{troubles}:{})},{root:DATA,actor:"admin",expectedRevision:body.revision});
                            return send(200,{ok:true,...result});
                        }

                        // POST /upload-image
                        if (
                            endpoint === "/upload-image" &&
                            req.method === "POST"
                        ) {
                            const {
                                type,
                                key,
                                conditionKey,
                                fileData,
                                fileName,
                            } = body as {
                                type: "vegetable" | "trouble";
                                key: string;
                                conditionKey?: string;
                                fileData: string; // base64
                                fileName: string;
                            };

                            if (!type || !key || !fileData || !fileName)
                                return send(400, { error: "Missing fields" });

                            const PUBLIC = path.join(ROOT, "public");
                            const ext =
                                path.extname(fileName).toLowerCase() || ".png";

                            let destDir: string;
                            let destName: string;
                            let jsonRelPath: string;

                            if (type === "vegetable") {
                                destDir = path.join(
                                    PUBLIC,
                                    "images",
                                    "vegetables",
                                );
                                destName = `${key}${ext}`;
                                jsonRelPath = `/images/vegetables/${destName}`;
                            } else {
                                if (!conditionKey)
                                    return send(400, {
                                        error: "conditionKey required",
                                    });
                                destDir = path.join(
                                    PUBLIC,
                                    "images",
                                    "troubles",
                                    key,
                                );
                                destName = `${conditionKey}${ext}`;
                                jsonRelPath = `/images/troubles/${key}/${destName}`;
                            }

                            fs.mkdirSync(destDir, { recursive: true });

                            // Delete old file if extension differs
                            if (type === "vegetable") {
                                const vegData = readCollection("vegetables",DATA) as Record<string, Record<string, unknown>>;
                                const old = vegData[key]?.image as
                                    | string
                                    | null;
                                if (old && old !== jsonRelPath) {
                                    const oldFull = path.join(PUBLIC, old);
                                    if (fs.existsSync(oldFull))
                                        fs.unlinkSync(oldFull);
                                }
                            } else {
                                const trData = readCollection("troubles",DATA) as Record<string, Record<string, unknown>>;
                                const conds = trData[key]?.conditions as
                                    | Record<string, Record<string, unknown>>
                                    | undefined;
                                const old = conds?.[conditionKey!]?.image as
                                    | string
                                    | null;
                                if (old && old !== jsonRelPath) {
                                    const oldFull = path.join(PUBLIC, old);
                                    if (fs.existsSync(oldFull))
                                        fs.unlinkSync(oldFull);
                                }
                            }

                            // Write the new image file
                            const imgBuf = Buffer.from(fileData, "base64");
                            fs.writeFileSync(
                                path.join(destDir, destName),
                                imgBuf,
                            );

                            // Update JSON
                            if (type === "vegetable") {
                                const vegData = readCollection("vegetables",DATA) as Record<string, Record<string, unknown>>;
                                vegData[key].image = jsonRelPath;
                                vegData[key].image_revision=createHash('sha256').update(imgBuf).digest('hex');
                                saveCollections({vegetables:vegData},{root:DATA,actor:"admin"});
                            } else {
                                const trData = readCollection("troubles",DATA) as Record<
                                    string,
                                    {
                                        conditions?: Record<
                                            string,
                                            Record<string, unknown>
                                        >;
                                    }
                                >;
                                const conds = trData[key]?.conditions;
                                if (conds?.[conditionKey!]) {
                                    conds[conditionKey!].image = jsonRelPath;
                                    conds[conditionKey!].image_revision=createHash('sha256').update(imgBuf).digest('hex');
                                }
                                saveCollections({troubles:trData},{root:DATA,actor:"admin"});
                            }

                            return send(200, {
                                ok: true,
                                imagePath: jsonRelPath,
                            });
                        }

                        // POST /delete-image
                        if (
                            endpoint === "/delete-image" &&
                            req.method === "POST"
                        ) {
                            const { type, key, conditionKey } = body as {
                                type: "vegetable" | "trouble";
                                key: string;
                                conditionKey?: string;
                            };

                            if (!type || !key)
                                return send(400, { error: "Missing fields" });

                            const PUBLIC = path.join(ROOT, "public");

                            if (type === "vegetable") {
                                const vegData = readCollection("vegetables",DATA) as Record<string, Record<string, unknown>>;
                                const old = vegData[key]?.image as
                                    | string
                                    | null;
                                if (old) {
                                    const full = path.join(PUBLIC, old);
                                    if (fs.existsSync(full))
                                        fs.unlinkSync(full);
                                    vegData[key].image = null;
                                }
                                saveCollections({vegetables:vegData},{root:DATA,actor:"admin"});
                            } else {
                                if (!conditionKey)
                                    return send(400, {
                                        error: "conditionKey required",
                                    });
                                const trData = readCollection("troubles",DATA) as Record<
                                    string,
                                    {
                                        conditions?: Record<
                                            string,
                                            Record<string, unknown>
                                        >;
                                    }
                                >;
                                const conds = trData[key]?.conditions;
                                if (conds?.[conditionKey]) {
                                    const old = conds[conditionKey].image as
                                        | string
                                        | null;
                                    if (old) {
                                        const full = path.join(PUBLIC, old);
                                        if (fs.existsSync(full))
                                            fs.unlinkSync(full);
                                        conds[conditionKey].image = null;
                                    }
                                }
                                saveCollections({troubles:trData},{root:DATA,actor:"admin"});
                            }

                            return send(200, { ok: true });
                        }

                        send(404, { error: "Unknown endpoint" });
                    } catch (err) {
                        if((err as {code?:string}).code==="STALE_DATA")return send(409,{error:String(err)});
                        send(500, { error: String(err) });
                    }
                },
            );
        },
    };
}
