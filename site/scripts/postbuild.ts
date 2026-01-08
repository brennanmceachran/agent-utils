import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const siteRoot = process.cwd();
const outDir = path.resolve(siteRoot, "out");
const repoRoot = path.resolve(siteRoot, "..");
const docsDir = path.join(repoRoot, "docs");

mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, ".nojekyll"), "");

rmSync(docsDir, { recursive: true, force: true });
mkdirSync(docsDir, { recursive: true });
cpSync(outDir, docsDir, { recursive: true });

console.log("Wrote .nojekyll file and synced docs output.");
