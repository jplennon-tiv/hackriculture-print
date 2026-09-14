import { defineConfig } from "vitest/config";

// Pure-logic + data-integrity tests only — no React/DOM or app plugins needed.
export default defineConfig({
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
    },
});
