import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(
    await readFile(new URL("TRANSFER-MANIFEST.json", root), "utf8"),
);
for (const entry of manifest.files) {
    const bytes = await readFile(new URL(entry.path, root));
    assert.equal(bytes.length, entry.bytes, entry.path);
    assert.equal(
        createHash("sha256").update(bytes).digest("hex"),
        entry.sha256,
        entry.path,
    );
}
for (const name of ["vegetables", "troubles"]) {
    assert(
        (await readFile(new URL(`${name}.json`, root))).equals(
            await readFile(new URL(`src/${name}.json`, root)),
        ),
        `${name} mirror differs`,
    );
}
console.log(
    `${manifest.files.length} source files match transfer hashes; both data mirrors match.`,
);
console.log(
    `${manifest.missingSourceAssets.length} pre-existing missing image references are listed in TRANSFER-MANIFEST.json.`,
);
