import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const siteRoot = process.cwd();
const outDir = path.resolve(siteRoot, "out");
const repoRoot = path.resolve(siteRoot, "..");
const docsDir = path.join(repoRoot, "docs");

function addOgImageAliases(rootDir: string) {
  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      addOgImageAliases(fullPath);
      continue;
    }

    if (entry.isFile() && entry.name === "opengraph-image") {
      const aliasPath = `${fullPath}.png`;
      if (!existsSync(aliasPath)) {
        copyFileSync(fullPath, aliasPath);
      }
    }
  }
}

mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, ".nojekyll"), "");
addOgImageAliases(outDir);

rmSync(docsDir, { recursive: true, force: true });
mkdirSync(docsDir, { recursive: true });
cpSync(outDir, docsDir, { recursive: true });

console.log("Wrote .nojekyll file and synced docs output.");
