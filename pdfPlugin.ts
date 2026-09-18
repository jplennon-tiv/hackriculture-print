/**
 * pdfPlugin.ts
 *
 * Vite dev-server plugin that generates PDFs via Playwright.
 *
 * Endpoints (no auth required — dev-only plugin):
 *   GET  /api/pdf/vegetable/:key           → attachment download (beetroot.pdf)
 *   GET  /api/pdf/vegetable/:key?inline=1  → inline preview in the browser tab
 *   GET  /api/pdf/trouble/:key             → attachment download
 *   GET  /api/pdf/trouble/:key?inline=1    → inline preview in the browser tab
 *   POST /api/pdf/batch                    → NDJSON stream. Renders every
 *                                            vegetable and trouble group to
 *                                            ./output/<slug>.pdf. Each line of
 *                                            the response is a JSON object:
 *                                              {type,slug,status:"ok"|"error",...}
 *                                            Final line is {done:true,...summary}.
 *
 * Each endpoint visits the matching /print/* route in the running Vite server,
 * renders it with a headless Chromium, and returns/writes the PDF.
 */
import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Browser, Page } from "playwright";
import { promises as fs } from "node:fs";
import * as path from "node:path";

// ── Shared render config ────────────────────────────────────────────────────
// A4 = 210mm. Margins: 14mm + 14mm = 28mm. Content = 182mm.
// 182mm × (96px / 25.4mm) = 688px wide.
// Height: (297 - 18 - 20)mm × 3.78 ≈ 979px (one content page).
const VIEWPORT = { width: 688, height: 979 } as const;

type PaperSize = "A4" | "A5" | "A6";
export class PrintContentError extends Error {}

// A-series sizes step down by 1/√2 per size, so the A4-designed layout maps
// faithfully onto A5/A6 by scaling both the render and the margins by the same
// factor (Chromium lays out at physicalContentWidth / scale ≈ the A4 width).
const PAPER_SCALE: Record<PaperSize, number> = {
    A4: 1,
    A5: 1 / Math.SQRT2,
    A6: 0.5,
};

function parsePaper(value: string | null): PaperSize {
    return value === "A5" || value === "A6" ? value : "A4";
}

function pdfOptions(paper: PaperSize) {
    const f = PAPER_SCALE[paper];
    const mm = (n: number) => `${+(n * f).toFixed(2)}mm`;
    return {
        format: paper,
        printBackground: true,
        scale: f,
        margin: { top: mm(18), bottom: mm(20), left: mm(14), right: mm(14) },
    };
}

/** Render a single /print/* URL to a PDF buffer. */
export async function renderPdf(
    page: Page,
    baseUrl: string,
    type: "vegetable" | "trouble",
    slug: string,
    units: string = "imperial",
    paper: PaperSize = "A4",
): Promise<Buffer> {
    const printUrl = `${baseUrl}/print/${type}/${encodeURIComponent(slug)}?units=${units === "metric" ? "metric" : "imperial"}`;
    await page.goto(printUrl, { waitUntil: "networkidle" });
    // Wait for React's intro-text measurement loop to complete
    await page.waitForFunction(
        () => document.body.dataset.printReady === "true" || !!document.body.dataset.printError,
        undefined, { timeout: 15000 },
    );
    const printError=await page.evaluate(()=>document.body.dataset.printError);
    if(printError)throw new PrintContentError(printError);
    return await page.pdf(pdfOptions(paper));
}

export function pdfPlugin(): Plugin {
    return {
        name: "pdf-gen",
        configureServer(server) {
            server.middlewares.use(
                async (
                    req: IncomingMessage,
                    res: ServerResponse,
                    next: () => void,
                ) => {
                    if (!req.url?.startsWith("/api/pdf/")) return next();

                    const addr = server.httpServer?.address();
                    const port =
                        addr && typeof addr === "object" ? addr.port : 5173;
                    const baseUrl = `http://localhost:${port}`;

                    // ── Batch endpoint ──────────────────────────────────────
                    if (
                        req.url.startsWith("/api/pdf/batch") &&
                        req.method === "POST"
                    ) {
                        const batchQuery = req.url.split("?")[1] ?? "";
                        const batchParams = new URLSearchParams(batchQuery);
                        const batchUnits =
                            batchParams.get("units") === "metric"
                                ? "metric"
                                : "imperial";
                        const batchPaper = parsePaper(batchParams.get("paper"));
                        await handleBatch(
                            res,
                            baseUrl,
                            server.config.root,
                            batchUnits,
                            batchPaper,
                        );
                        return;
                    }

                    // ── Single-item endpoint ────────────────────────────────
                    // Parse  /api/pdf/<type>/<slug>[?inline=1]
                    const [pathPart, queryPart = ""] = req.url.split("?");
                    const parts = pathPart.split("/").filter(Boolean);
                    // parts = ["api", "pdf", "vegetable", "beetroot"]
                    const type = parts[2]; // "vegetable" | "trouble"
                    const slug = parts[3];
                    const inline =
                        new URLSearchParams(queryPart).get("inline") === "1";
                    const units =
                        new URLSearchParams(queryPart).get("units") === "metric"
                            ? "metric"
                            : "imperial";
                    const paper = parsePaper(
                        new URLSearchParams(queryPart).get("paper"),
                    );

                    if (
                        !type ||
                        !slug ||
                        !["vegetable", "trouble"].includes(type)
                    ) {
                        res.writeHead(400, {
                            "Content-Type": "application/json",
                        });
                        res.end(
                            JSON.stringify({ error: "Invalid type or slug" }),
                        );
                        return;
                    }

                    let browser: Browser | undefined;
                    try {
                        const { chromium } = await import("playwright");
                        browser = await chromium.launch();
                        const page = await browser.newPage();
                        await page.setViewportSize(VIEWPORT);

                        const pdf = await renderPdf(
                            page,
                            baseUrl,
                            type as "vegetable" | "trouble",
                            slug,
                            units,
                            paper,
                        );

                        await browser.close();
                        browser = undefined;

                        const filename = `${slug}.pdf`;
                        res.setHeader("Content-Type", "application/pdf");
                        res.setHeader(
                            "Content-Disposition",
                            inline
                                ? `inline; filename="${filename}"`
                                : `attachment; filename="${filename}"`,
                        );
                        res.writeHead(200);
                        res.end(pdf);
                    } catch (err) {
                        if (browser) await browser.close().catch(() => {});
                        console.error("[pdf-gen]", err);
                        res.writeHead(err instanceof PrintContentError ? 422 : 500, {
                            "Content-Type": "application/json",
                        });
                        res.end(
                            JSON.stringify({
                                error: err instanceof PrintContentError ? err.message : "PDF generation failed — make sure Playwright Chromium is installed (npx playwright install chromium)",
                                detail: String(err),
                            }),
                        );
                    }
                },
            );
        },
    };
}

// ── Batch handler ───────────────────────────────────────────────────────────

/** Shared slugifier — mirrors src/lib/slug.ts so URLs match /print/* lookups. */
function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}

/** POST /api/pdf/batch — streams NDJSON progress while writing to ./output/. */
export function resolveBatchPaths(root: string) {
    const dataDir = path.resolve(root, "../hackriculture-data");
    return {
        vegetables: path.join(dataDir, "vegetables.json"),
        troubles: path.join(dataDir, "troubles.json"),
        output: path.join(root, "output"),
    };
}

async function handleBatch(
    res: ServerResponse,
    baseUrl: string,
    root: string,
    units: string = "imperial",
    paper: PaperSize = "A4",
): Promise<void> {
    res.setHeader("Content-Type", "application/x-ndjson");
    res.setHeader("Cache-Control", "no-store");
    res.writeHead(200);

    const write = (obj: unknown) => {
        res.write(JSON.stringify(obj) + "\n");
    };

    let browser: Browser | undefined;
    try {
        // Load JSON fresh each run so admin edits are picked up
        const {
            vegetables: vegPath,
            troubles: troublesPath,
            output: outputDir,
        } = resolveBatchPaths(root);
        await fs.mkdir(outputDir, { recursive: true });

        const vegetables = JSON.parse(
            await fs.readFile(vegPath, "utf-8"),
        ) as Record<string, { name?: string | null }>;
        const troubles = JSON.parse(
            await fs.readFile(troublesPath, "utf-8"),
        ) as Record<string, unknown>;

        const jobs: {
            type: "front-matter" | "vegetable" | "trouble";
            slug: string;
            label: string;
        }[] = [{type: "front-matter", slug: "cover", label: "Cover (A4)"}];
        for (const [key, veg] of Object.entries(vegetables)) {
            const slug = slugify(veg?.name ?? key);
            jobs.push({ type: "vegetable", slug, label: veg?.name ?? key });
        }
        for (const key of Object.keys(troubles)) {
            jobs.push({ type: "trouble", slug: key, label: key });
        }

        write({
            event: "start",
            total: jobs.length,
            vegetables: Object.keys(vegetables).length,
            troubles: Object.keys(troubles).length,
            frontMatter: 1,
            outputDir,
        });

        const { chromium } = await import("playwright");
        browser = await chromium.launch();
        const page = await browser.newPage();
        await page.setViewportSize(VIEWPORT);

        let okCount = 0;
        let errCount = 0;
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const index = i + 1;
            try {
                // Approved, unit-independent A4 artwork; no AI/font/network work.
                const pdf = job.type === "front-matter"
                    ? await fs.readFile(path.join(root, "public/front-matter/cover-A4.pdf"))
                    : await renderPdf(
                    page,
                    baseUrl,
                    job.type,
                    job.slug,
                    units,
                    paper,
                );
                const filename = job.type === "front-matter"
                    ? "00_cover_A4.pdf" : `${job.type}_${job.slug}.pdf`;
                await fs.writeFile(path.join(outputDir, filename), pdf);
                okCount++;
                write({
                    event: "progress",
                    index,
                    total: jobs.length,
                    type: job.type,
                    slug: job.slug,
                    label: job.label,
                    filename,
                    status: "ok",
                });
            } catch (err) {
                errCount++;
                write({
                    event: "progress",
                    index,
                    total: jobs.length,
                    type: job.type,
                    slug: job.slug,
                    label: job.label,
                    status: "error",
                    detail: String(err),
                });
                console.error(`[pdf-batch] ${job.type}/${job.slug}`, err);
            }
        }

        write({
            event: "done",
            total: jobs.length,
            ok: okCount,
            errors: errCount,
            outputDir,
        });
        res.end();
    } catch (err) {
        console.error("[pdf-batch] fatal", err);
        write({
            event: "fatal",
            error: "Batch print failed — is Playwright Chromium installed? (npx playwright install chromium)",
            detail: String(err),
        });
        res.end();
    } finally {
        if (browser) await browser.close().catch(() => {});
    }
}
