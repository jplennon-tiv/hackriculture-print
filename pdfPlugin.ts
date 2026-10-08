import {refreshGenerated} from '../hackriculture-data/lib/records.mjs';
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
import bookPagination from "./src/print/bookPagination.json";
import {bookEntry,requireCurrentPagination} from "./src/print/bookPagination";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Browser, Page } from "playwright";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { DEFAULT_PAPER, parsePaper, type PaperSize } from './src/lib/paperSize';
import { prepareCompactBook } from './src/print/book/renderCompact';
import type {BookProductionOptions} from './src/print/book/production';

// ── Shared render config ────────────────────────────────────────────────────
// A4 = 210mm. Margins: 14mm + 14mm = 28mm. Content = 182mm.
// 182mm × (96px / 25.4mm) = 688px wide.
// Height: (297 - 18 - 20)mm × 3.78 ≈ 979px (one content page).
const VIEWPORT = { width: 688, height: 979 } as const;

export class PrintContentError extends Error {}

// A-series sizes step down by 1/√2 per size, so the A4-designed layout maps
// faithfully onto A5/A6 by scaling both the render and the margins by the same
// factor (Chromium lays out at physicalContentWidth / scale ≈ the A4 width).
const PAPER_SCALE = {
    A4: 1,
    A5: 1 / Math.SQRT2,
    A6: 0.5,
};

function pdfOptions(paper: PaperSize) {
    if (paper === '185x240') return {
        width:'185mm', height:'240mm', preferCSSPageSize:true,
        printBackground:true, scale:1, margin:{top:'0mm',bottom:'0mm',left:'0mm',right:'0mm'},
    };
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
    paper: PaperSize = DEFAULT_PAPER,
    onWarnings?: (warnings: string[]) => void,
    root: string = process.cwd(),
    bookProduction?: BookProductionOptions,
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
    let warnings=await page.evaluate(()=>JSON.parse(document.body.dataset.printWarnings||'[]') as string[]);
    let expectedPages: number | undefined;
    let productionSize:{width:string;height:string}|undefined;
    if (paper === '185x240') {
        try {
            const layout = bookProduction
                ? await prepareCompactBook(page,baseUrl,type,slug,units,root,bookProduction)
                : await prepareCompactBook(page,baseUrl,type,slug,units,root);
            warnings = [...warnings, ...layout.warnings]; expectedPages = layout.pages;
            if(layout.geometry)productionSize={width:`${layout.geometry.width}mm`,height:`${layout.geometry.height}mm`};
        } catch (err) { throw new PrintContentError(String(err)); }
    }
    const pdf=await page.pdf({...pdfOptions(paper),...productionSize});
    // Chromium writes page dictionaries uncompressed; count actual output pages.
    const pages=(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
    if(expectedPages !== undefined && pages !== expectedPages) throw new PrintContentError(`Compact PDF has ${pages} pages; layout measured ${expectedPages}.`);
    if(paper !== '185x240' && type==='vegetable'&&pages>2)warnings.push(`Exported ${pages} PDF pages (usual target: 2).`);
    onWarnings?.(warnings);
    return pdf;
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
                            undefined,
                            server.config.root,
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
        vegetables: path.join(dataDir, "generated/master/vegetables.json"),
        troubles: path.join(dataDir, "generated/master/troubles.json"),
        output: path.join(root, "output"),
    };
}

async function handleBatch(
    res: ServerResponse,
    baseUrl: string,
    root: string,
    units: string = "imperial",
    paper: PaperSize = DEFAULT_PAPER,
): Promise<void> {
    res.setHeader("Content-Type", "application/x-ndjson");
    res.setHeader("Cache-Control", "no-store");
    res.writeHead(200);

    const write = (obj: unknown) => {
        res.write(JSON.stringify(obj) + "\n");
    };

    let browser: Browser | undefined;
    try {
        // Rebuild disposable projections from authoritative records before batch.
        refreshGenerated(path.resolve(root,'../hackriculture-data'));
        const {
            vegetables: vegPath,
            troubles: troublesPath,
            output: legacyOutputDir,
        } = resolveBatchPaths(root);
        const compact = paper === '185x240';
        const outputDir = compact ? path.join(legacyOutputDir,'book-185x240',units) : legacyOutputDir;
        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(path.join(outputDir,'collection-order.json'),JSON.stringify({units,paper,complete:false,documents:[]},null,2)+'\n');

        const vegetables = JSON.parse(
            await fs.readFile(vegPath, "utf-8"),
        ) as Record<string, { name?: string | null; category?: string | null }>;
        const troubles = JSON.parse(
            await fs.readFile(troublesPath, "utf-8"),
        ) as Record<string, unknown>;

        await requireCurrentPagination(bookPagination.sourceSignature,vegetables,troubles);
        const edition=bookPagination.editions[units==='metric'?'metric':'imperial'];
        if (!compact) {
            const contentsPlan=JSON.parse(await fs.readFile(path.join(root,'public/front-matter/pagination.json'),'utf8'));
            if(contentsPlan.sourceSignature!==bookPagination.sourceSignature||JSON.stringify(contentsPlan.edition)!==JSON.stringify(edition))throw new PrintContentError('Contents pagination is stale. Run node docs/front-matter/entry-pages/build.mjs.');
        }
        const jobs: {
            type: "front-matter" | "vegetable" | "trouble";
            slug: string;
            label: string;
            key?: string;
        }[] = [
            {type: "front-matter", slug: "cover", label: "Cover (A4)"},
            {type: "front-matter", slug: "contents", label: "Contents (A4)"},
            {type: "front-matter", slug: "how-to-use", label: "How to use these sheets (A4)"},
        ];
        if (compact) jobs.length = 0; // A4 cover/contents are not compact-book artwork.
        for (const entry of edition.vegetables) {
            jobs.push({ type: "vegetable", key:entry.key, slug:slugify(entry.label), label:entry.label });
        }
        for (const entry of edition.troubles) {
            jobs.push({ type: "trouble", key:entry.key, slug:entry.key, label:entry.label });
        }

        write({
            event: "start",
            total: jobs.length,
            vegetables: Object.keys(vegetables).length,
            troubles: Object.keys(troubles).length,
            frontMatter: compact ? 0 : 3,
            warnings: compact ? ['Guide proofs only. Book opening pages, final folios and contents are still to be prepared.'] : [],
            outputDir,
        });

        const { chromium } = await import("playwright");
        browser = await chromium.launch();
        const page = await browser.newPage();
        await page.setViewportSize(VIEWPORT);

        let okCount = 0;
        let errCount = 0;
        const report: {label:string;filename?:string;warnings?:string[];error?:string}[]=[];
        const collectionOrder:{filename:string;start:number|null;pages:number}[]=[];
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const index = i + 1;
            try {
                let warnings:string[]=[];
                const entry=job.type==='front-matter'||compact?null:bookEntry(edition,job.type,job.key!);
                // Approved, unit-independent A4 artwork; no AI/font/network work.
                const pdf = job.type === "front-matter"
                    ? await fs.readFile(path.join(root, `public/front-matter/${job.slug}-A4.pdf`))
                    : await renderPdf(
                    page,
                    baseUrl,
                    job.type,
                    job.slug,
                    units,
                    paper,
                    found=>{warnings=found;},
                    root,
                );
                const filename = job.type === "front-matter"
                    ? (job.slug === "cover" ? "00_cover_A4.pdf" : job.slug === "contents" ? "01_contents_A4.pdf" : "02_how-to-use_A4.pdf") : `${job.type}_${job.slug}.pdf`;
                await fs.writeFile(path.join(outputDir, filename), pdf);
                const pages = compact ? (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length : entry?.pages??1;
                collectionOrder.push({filename,start:entry?.start??null,pages});
                okCount++;
                report.push({label:job.label,filename,warnings});
                write({
                    event: "progress",
                    index,
                    total: jobs.length,
                    type: job.type,
                    slug: job.slug,
                    label: job.label,
                    filename,
                    status: "ok",
                    warnings,
                });
            } catch (err) {
                errCount++;
                report.push({label:job.label,error:String(err)});
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

        await fs.writeFile(path.join(outputDir,'collection-order.json'),JSON.stringify({units,paper,complete:!compact&&errCount===0,guidesComplete:errCount===0,scope:compact?'guide-proofs':'collection',numberedPages:compact?null:edition.totalPages,documents:collectionOrder},null,2)+'\n');
        await fs.writeFile(path.join(outputDir,'batch-report.json'),JSON.stringify({units,paper,generatedAt:new Date().toISOString(),results:report},null,2));
        await fs.writeFile(path.join(outputDir,'batch-report.txt'),report.map(item=>`${item.label}${item.filename?' - '+item.filename:''}\n${item.error?'ERROR: '+item.error:item.warnings?.length?item.warnings.join('\n'):'OK'}`).join('\n\n'));
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
