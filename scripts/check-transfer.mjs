import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inflateSync } from "node:zlib";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:5173";
assert(
    ["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname),
    "Use the local server only",
);
const output = await mkdtemp(join(tmpdir(), "garden-transfer-check-"));
function pageCount(buffer) {
    const text = buffer.toString("latin1");
    let count = [...text.matchAll(/\/Type\s*\/Page(?!s)\b/g)].length;
    for (const match of text.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)) {
        try {
            count += [
                ...inflateSync(Buffer.from(match[1], "latin1"))
                    .toString("latin1")
                    .matchAll(/\/Type\s*\/Page(?!s)\b/g),
            ].length;
        } catch {}
    }
    return count;
}
const browser = await chromium.launch();
try {
    const page = await browser.newPage({
        viewport: { width: 688, height: 979 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const slug of ["chicory", "carrot", "bean_broad", "lettuce"]) {
        await page.goto(`${base}/print/vegetable/${slug}?units=metric`, {
            waitUntil: "networkidle",
        });
        await page.waitForFunction(
            () => document.body.dataset.printReady === "true",
        );
        const broken = await page
            .locator("img")
            .evaluateAll((images) =>
                images
                    .filter(
                        (image) => !image.complete || image.naturalWidth === 0,
                    )
                    .map((image) => image.src),
            );
        assert.deepEqual(broken, [], `${slug}: missing rendered images`);
        await page.screenshot({
            path: join(output, `${slug}.png`),
            fullPage: true,
        });
        for (const units of ["imperial", "metric"]) {
            const response = await fetch(
                `${base}/api/pdf/vegetable/${slug}?units=${units}&paper=A4`,
            );
            assert.equal(response.status, 200);
            const bytes = Buffer.from(await response.arrayBuffer());
            assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
            assert.equal(
                pageCount(bytes),
                2,
                `${slug}/${units}: expected 2 pages`,
            );
            await writeFile(join(output, `${slug}-${units}.pdf`), bytes);
        }
        console.log(
            `${slug}: images loaded; imperial and metric A4 PDFs both 2 pages`,
        );
    }
    const response = await fetch(
        `${base}/api/pdf/trouble/bean_and_pea_troubles`,
    );
    assert.equal(response.status, 200);
    const trouble = Buffer.from(await response.arrayBuffer());
    assert.equal(trouble.subarray(0, 5).toString(), "%PDF-");
    assert(pageCount(trouble) > 0);
    await writeFile(join(output, "bean-and-pea-troubles.pdf"), trouble);
    await page.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
    assert((await page.locator('input[type="password"]').count()) > 0);
    assert.deepEqual(errors, []);
    console.log(
        `Trouble PDF and admin login page passed. Review PDFs/screenshots in ${output}`,
    );
} finally {
    await browser.close();
}
