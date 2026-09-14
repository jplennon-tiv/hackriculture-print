import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { adminApiPlugin } from "./adminApiPlugin";
import { pdfPlugin } from "./pdfPlugin";

export default defineConfig({
    server: {
        fs: {
            allow: [
                fileURLToPath(new URL(".", import.meta.url)),
                ...["vegetables.json", "troubles.json", "vegetable_groups.json"].map(
                    name => fileURLToPath(new URL(`../hackriculture-data/${name}`, import.meta.url)),
                ),
            ],
        },
    },
    plugins: [react(), adminApiPlugin(), pdfPlugin()],
});
