import {migrateRecords,readCollection,recordPath} from "../../hackriculture-data/lib/records.mjs";
import { it, expect, vi } from "vitest";
import { createServer } from "vite";
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import { adminApiPlugin } from "../adminApiPlugin";
import {sharedRecordsPlugin} from '../sharedRecordsPlugin';

it("admin saves and image mutations use shared data and preserve each previous version", async () => {
    const temporary = mkdtempSync(join(tmpdir(), "hackriculture-admin-test-"));
    const root = join(temporary, "hackriculture-print");
    const shared = join(temporary, "hackriculture-data");
    mkdirSync(root);
    mkdirSync(shared);
    for (const name of ["vegetables.json", "troubles.json"]) {
        copyFileSync(join(import.meta.dirname, "../../hackriculture-data/generated/master", name), join(shared, name));
    }
    migrateRecords(shared);
    const carrotPath=recordPath(shared,"vegetables","carrot");
    const original = readFileSync(carrotPath,"utf8");
    const oldPassword = process.env.ADMIN_PASSWORD;
    const password = randomBytes(32).toString("hex");
    process.env.ADMIN_PASSWORD = password;
    const server = await createServer({
        configFile: false, root, plugins: [sharedRecordsPlugin(),adminApiPlugin()],
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
        let data = await (await fetch(base + "/data")).json();
        expect(data.vegetables.carrot.name).toBe("Carrot");
        expect((await post("/save", { vegetables: {}, password: "wrong" })).status).toBe(401);
        expect((await post("/save", { vegetables: [] })).status).toBe(400);
        const invalidPrint=structuredClone(data);
        invalidPrint.vegetables.carrot.print_planting.steps[0].text='';
        expect((await post('/save',invalidPrint)).status).toBe(400);
        expect(readFileSync(carrotPath, "utf8")).toBe(original);
        expect(existsSync(join(shared, "backups/admin"))).toBe(false);
        data.vegetables.carrot.metadata.shared_data_test = "round one";
        data.vegetables.carrot.sowing_and_planting.notes[0].text = {metric:'Allow 10 cm.',imperial:'Allow 4 in.'};
        data.vegetables.carrot.sowing_and_planting.notes[0].short_text = {metric:'10 cm apart.',imperial:'4 in. apart.'};
        data.vegetables.carrot.sowing_and_planting.method = {metric:'Sow 1 cm deep.',imperial:'Sow ½ in. deep.'};
        expect((await post("/save", data)).status).toBe(200);
        const first = readFileSync(carrotPath, "utf8");
        expect(JSON.parse(first).print_planting).toEqual(data.vegetables.carrot.print_planting);
        expect(JSON.parse(first).sowing_and_planting).toEqual(data.vegetables.carrot.sowing_and_planting);
        expect((await post("/save",data)).status).toBe(409);
        data=await(await fetch(base+"/data")).json();
        data.vegetables.carrot.metadata.shared_data_test = "round two";
        expect((await post("/save", data)).status).toBe(200);
        const backups = join(shared, "backups/admin");
        const versions = readdirSync(backups).sort();
        expect(versions).toHaveLength(2);
        expect(readFileSync(join(backups, versions[0],"0.json"), "utf8")).toBe(original);
        expect(readFileSync(join(backups, versions[1],"0.json"), "utf8")).toBe(first);
        expect(JSON.parse(first)._field_metadata["/metadata/shared_data_test"].updated_by).toBe("admin");
        const upload = await post("/upload-image", {
            type: "vegetable", key: "carrot", fileName: "carrot.png",
            fileData: Buffer.from("test image bytes").toString("base64"),
        });
        expect(upload.status).toBe(200);
        expect(existsSync(join(root, "public/images/vegetables/carrot.png"))).toBe(true);
        expect((await post("/delete-image", {type:"vegetable", key:"carrot"})).status).toBe(200);
        expect(JSON.parse(readFileSync(carrotPath, "utf8")).image).toBe(null);
        expect(readdirSync(backups)).toHaveLength(4);
        const troubleKey = Object.keys(data.troubles).find(key => Object.keys(data.troubles[key].conditions ?? {}).length > 0)!;
        const conditionKey = Object.keys(data.troubles[troubleKey].conditions)[0];
        expect((await post("/upload-image", {
            type:"trouble", key:troubleKey, conditionKey, fileName:"condition.png",
            fileData:Buffer.from("test trouble image bytes").toString("base64"),
        })).status).toBe(200);
        expect((await post("/delete-image", {type:"trouble", key:troubleKey, conditionKey})).status).toBe(200);
        expect(readCollection("troubles",shared)[troubleKey].conditions[conditionKey].image).toBe(null);
        expect(readdirSync(backups)).toHaveLength(6);
        const manual=JSON.parse(readFileSync(carrotPath,'utf8'));manual.hero_header='External edit fixture';
        writeFileSync(carrotPath,JSON.stringify(manual));
        await vi.waitFor(()=>expect(JSON.parse(readFileSync(join(shared,'generated/master/vegetables.json'),'utf8')).carrot.hero_header).toBe('External edit fixture'),{timeout:5000});
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
