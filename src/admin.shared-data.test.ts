import { it, expect } from "vitest";
import { createServer } from "vite";
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import { adminApiPlugin } from "../adminApiPlugin";

it("admin saves and image mutations use shared data and preserve each previous version", async () => {
    const temporary = mkdtempSync(join(tmpdir(), "hackriculture-admin-test-"));
    const root = join(temporary, "hackriculture-print");
    const shared = join(temporary, "hackriculture-data");
    mkdirSync(root);
    mkdirSync(shared);
    for (const name of ["vegetables.json", "troubles.json"]) {
        copyFileSync(join(import.meta.dirname, "../../hackriculture-data", name), join(shared, name));
    }
    const original = readFileSync(join(shared, "vegetables.json"), "utf8");
    const oldPassword = process.env.ADMIN_PASSWORD;
    const password = randomBytes(32).toString("hex");
    process.env.ADMIN_PASSWORD = password;
    const server = await createServer({
        configFile: false, root, plugins: [adminApiPlugin()],
        server: { host: "127.0.0.1", port: 0 },
    });
    try {
        await server.listen();
        const address = server.httpServer!.address();
        if (!address || typeof address === "string") throw Error("Missing test address");
        const base = `http://127.0.0.1:${address.port}/api/admin`;
        const post = (route: string, body: object) => fetch(base + route, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, ...body }),
        });
        const data = await (await fetch(base + "/data")).json();
        expect(data.vegetables.carrot.name).toBe("Carrot");
        expect((await post("/save", { vegetables: {}, password: "wrong" })).status).toBe(401);
        expect((await post("/save", { vegetables: [] })).status).toBe(400);
        const invalidPrint=structuredClone(data);
        invalidPrint.vegetables.carrot.print_planting.steps[0].text='';
        expect((await post('/save',invalidPrint)).status).toBe(400);
        expect(readFileSync(join(shared, "vegetables.json"), "utf8")).toBe(original);
        expect(existsSync(join(shared, "backups"))).toBe(false);
        data.vegetables.carrot.metadata.shared_data_test = "round one";
        expect((await post("/save", data)).status).toBe(200);
        const first = readFileSync(join(shared, "vegetables.json"), "utf8");
        expect(JSON.parse(first).carrot.print_planting).toEqual(data.vegetables.carrot.print_planting);
        expect(JSON.parse(first).carrot.sowing_and_planting).toEqual(data.vegetables.carrot.sowing_and_planting);
        data.vegetables.carrot.metadata.shared_data_test = "round two";
        expect((await post("/save", data)).status).toBe(200);
        const backups = join(shared, "backups/admin");
        const versions = readdirSync(backups).filter(name => name.startsWith("vegetables_")).sort();
        expect(versions).toHaveLength(2);
        expect(readFileSync(join(backups, versions[0]), "utf8")).toBe(original);
        expect(readFileSync(join(backups, versions[1]), "utf8")).toBe(first);
        expect(readdirSync(backups).filter(name => name.startsWith("troubles_"))).toHaveLength(2);
        const upload = await post("/upload-image", {
            type: "vegetable", key: "carrot", fileName: "carrot.png",
            fileData: Buffer.from("test image bytes").toString("base64"),
        });
        expect(upload.status).toBe(200);
        expect(existsSync(join(root, "public/images/vegetables/carrot.png"))).toBe(true);
        expect((await post("/delete-image", {type:"vegetable", key:"carrot"})).status).toBe(200);
        expect(JSON.parse(readFileSync(join(shared, "vegetables.json"), "utf8")).carrot.image).toBe(null);
        expect(readdirSync(backups).filter(name => name.startsWith("vegetables_"))).toHaveLength(4);
        const troubleKey = Object.keys(data.troubles).find(key => Object.keys(data.troubles[key].conditions ?? {}).length > 0)!;
        const conditionKey = Object.keys(data.troubles[troubleKey].conditions)[0];
        expect((await post("/upload-image", {
            type:"trouble", key:troubleKey, conditionKey, fileName:"condition.png",
            fileData:Buffer.from("test trouble image bytes").toString("base64"),
        })).status).toBe(200);
        expect((await post("/delete-image", {type:"trouble", key:troubleKey, conditionKey})).status).toBe(200);
        expect(JSON.parse(readFileSync(join(shared, "troubles.json"), "utf8"))[troubleKey].conditions[conditionKey].image).toBe(null);
        expect(readdirSync(backups).filter(name => name.startsWith("troubles_"))).toHaveLength(4);
        for (const name of ["vegetables.json", "troubles.json", "src", "backup"]) {
            expect(existsSync(join(root, name))).toBe(false);
        }
    } finally {
        await server.close();
        if (oldPassword === undefined) delete process.env.ADMIN_PASSWORD;
        else process.env.ADMIN_PASSWORD = oldPassword;
        rmSync(temporary, {recursive:true, force:true});
    }
}, 30000);
