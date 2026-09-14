import { describe, expect, it } from "vitest";
import * as path from "node:path";
import { resolveBatchPaths } from "../pdfPlugin";

describe("batch PDF data paths", () => {
    it("uses sibling shared data and keeps output in the project root", () => {
        const root = path.join(path.sep, "workspace", "hackriculture-print");

        expect(resolveBatchPaths(root)).toEqual({
            vegetables: path.join(
                path.sep,
                "workspace",
                "hackriculture-data",
                "vegetables.json",
            ),
            troubles: path.join(
                path.sep,
                "workspace",
                "hackriculture-data",
                "troubles.json",
            ),
            output: path.join(root, "output"),
        });
    });
});
