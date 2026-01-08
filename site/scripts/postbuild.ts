import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "out");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, ".nojekyll"), "");

console.log("Wrote .nojekyll file.");
