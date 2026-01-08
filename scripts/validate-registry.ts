import { readFileSync, statSync } from "node:fs";
import path from "node:path";

type RegistryFile = {
  path: string;
  target?: string;
  content?: unknown;
  [key: string]: unknown;
};

type RegistryItem = {
  name: string;
  files: RegistryFile[];
  [key: string]: unknown;
};

type Registry = {
  items: RegistryItem[];
  [key: string]: unknown;
};

const repoRoot = path.resolve(import.meta.dir, "..");
const registryPath = path.join(repoRoot, "registry.json");
const publicRoot = path.join(repoRoot, "site", "public");

function readJson(filePath: string) {
  const raw = readFileSync(filePath, "utf8");
  return JSON.parse(raw) as Registry;
}

function assertFileExists(filePath: string) {
  try {
    const stat = statSync(filePath);
    if (!stat.isFile()) {
      throw new Error("Not a file");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing source file";
    throw new Error(`Missing file: ${filePath} (${message})`);
  }
}

function assertRepoScopedTarget(target: string | undefined, itemName: string) {
  if (!target || !target.startsWith("~/")) {
    throw new Error(
      `Registry item ${itemName} has non-repo-scoped target: ${target ?? "<missing>"}`,
    );
  }
}

function assertNoInlineContent(files: RegistryFile[], itemName: string) {
  for (const file of files) {
    if (Object.prototype.hasOwnProperty.call(file, "content")) {
      throw new Error(
        `Registry item ${itemName} includes files[].content at ${file.path}. Remove inline content to stay index-eligible.`,
      );
    }
  }
}

function assertRegistryPath(filePath: string, itemName: string) {
  if (!filePath.startsWith("registry/")) {
    throw new Error(
      `Registry item ${itemName} has invalid file path (must start with registry/): ${filePath}`,
    );
  }
}

function assertOutputFile(relativePath: string) {
  const outputPath = path.join(publicRoot, relativePath);
  assertFileExists(outputPath);
}

const registry = readJson(registryPath);

if (!Array.isArray(registry.items)) {
  throw new Error("registry.json must include an items array.");
}

assertFileExists(path.join(publicRoot, "registry.json"));

for (const item of registry.items) {
  if (!item.name) {
    throw new Error("Registry item is missing a name.");
  }

  assertFileExists(path.join(publicRoot, `${item.name}.json`));

  if (!Array.isArray(item.files)) {
    throw new Error(`Registry item ${item.name} is missing files[].`);
  }

  assertNoInlineContent(item.files, item.name);

  for (const file of item.files) {
    if (!file.path || typeof file.path !== "string") {
      throw new Error(`Registry item ${item.name} has a file without path.`);
    }

    assertRegistryPath(file.path, item.name);
    assertRepoScopedTarget(file.target, item.name);

    const sourcePath = path.join(repoRoot, file.path);
    assertFileExists(sourcePath);
    assertOutputFile(file.path);
  }
}

console.log("Registry validation complete.");
