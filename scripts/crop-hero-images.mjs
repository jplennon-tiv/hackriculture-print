import {refreshGenerated} from '../../hackriculture-data/lib/records.mjs';
refreshGenerated();
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const data = JSON.parse(
    await readFile(new URL("../hackriculture-data/generated/master/vegetables.json", root), "utf8"),
);
const args = process.argv.slice(2);
const keys = args.includes("--all")
    ? Object.keys(data)
    : args.length
      ? args
      : ["chicory"];
const manifestUrl = new URL("src/print/heroImageCrops.json", root);
let manifest = {};
try {
    manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
} catch (error) {
    if (error.code !== "ENOENT") throw error;
}
await mkdir(new URL("public/images/vegetables/cropped/", root), {
    recursive: true,
});

for (const key of keys) {
    assert(data[key], `Unknown crop: ${key}`);
    const source = data[key].image;
    if (!source?.startsWith("/images/vegetables/") || !source.endsWith(".png"))
        continue;
    const input = fileURLToPath(new URL(`public${source}`, root));
    const metadata = await sharp(input).metadata();
    if (!metadata.hasAlpha || metadata.depth !== "uchar") continue;
    const { data: pixels, info } = await sharp(input)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    assert.equal(info.channels, 4);
    let left = info.width;
    let top = info.height;
    let right = -1;
    let bottom = -1;
    for (let row = 0; row < info.height; row++) {
        for (let column = 0; column < info.width; column++) {
            if (pixels[(row * info.width + column) * 4 + 3] === 0) continue;
            left = Math.min(left, column);
            right = Math.max(right, column);
            top = Math.min(top, row);
            bottom = Math.max(bottom, row);
        }
    }
    assert(right >= left && bottom >= top, `${key}: empty artwork`);
    const margin = Math.ceil(Math.max(info.width, info.height) * 0.02);
    left = Math.max(0, left - margin);
    top = Math.max(0, top - margin);
    right = Math.min(info.width - 1, right + margin);
    bottom = Math.min(info.height - 1, bottom + margin);
    const width = right - left + 1;
    const height = bottom - top + 1;
    if (width / info.width > 0.9 && height / info.height > 0.9) {
        delete manifest[source];
        console.log(`${key}: margins already small; unchanged`);
        continue;
    }
    const src = `/images/vegetables/cropped/${key}.png`;
    const output = fileURLToPath(new URL(`public${src}`, root));
    await sharp(input)
        .extract({ left, top, width, height })
        .keepMetadata()
        .png()
        .toFile(output);
    const cropped = await sharp(output).ensureAlpha().raw().toBuffer();
    for (let row = 0; row < height; row++) {
        const offset = ((row + top) * info.width + left) * 4;
        assert(
            pixels
                .subarray(offset, offset + width * 4)
                .equals(
                    cropped.subarray(row * width * 4, (row + 1) * width * 4),
                ),
            `${key}: pixel mismatch in row ${row}`,
        );
    }
    manifest[source] = {
        src,
        width,
        height,
        originalWidth: info.width,
        originalHeight: info.height,
    };
    console.log(
        `${key}: ${info.width}x${info.height} -> ${width}x${height}; retained RGBA pixels identical`,
    );
}
await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);
