import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const directory = new URL(
    "../public/images/quick_facts/trial/",
    import.meta.url,
);
const browser = await chromium.launch();
try {
    const page = await browser.newPage({
        viewport: { width: 384, height: 384 },
    });
    const names = (await readdir(directory))
        .filter((name) => name.endsWith(".svg"))
        .map((name) => name.slice(0, -4))
        .sort();
    assert(names.length > 0);
    for (const name of names) {
        const svg = await readFile(new URL(`${name}.svg`, directory), "utf8");
        await page.setContent(
            `<html><head><style>html,body{margin:0;background:transparent}svg{display:block;width:384px;height:384px}</style></head><body>${svg}</body></html>`,
        );
        const pixels = await page.evaluate(async () => {
            const svg = document.querySelector("svg");
            const image = new Image();
            image.src = `data:image/svg+xml,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 384;
            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0, 384, 384);
            const data = context.getImageData(0, 0, 384, 384).data;
            let visible = 0;
            for (let index = 3; index < data.length; index += 4) {
                if (data[index] > 0) visible += 1;
            }
            return { cornerAlpha: data[3], coverage: visible / (384 * 384) };
        });
        assert.equal(pixels.cornerAlpha, 0);
        assert(pixels.coverage > 0.15 && pixels.coverage < 0.8);
        await page.screenshot({
            path: fileURLToPath(new URL(`${name}.png`, directory)),
            omitBackground: true,
        });
        console.log(
            `${name}: 384x384 transparent PNG, ${Math.round(pixels.coverage * 100)}% artwork coverage`,
        );
    }
} finally {
    await browser.close();
}
