import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import path from "node:path";

type RegistryFile = {
  path: string;
  type?: string;
  target?: string;
  [key: string]: unknown;
};

type RegistryMeta = {
  [key: string]: unknown;
};

type RegistryItem = {
  name: string;
  files: RegistryFile[];
  meta?: RegistryMeta;
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

  try {
    return JSON.parse(raw) as Registry;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown JSON parse error";
    throw new Error(`Failed to parse ${filePath}: ${message}`);
  }
}

function assertFileExists(filePath: string) {
  try {
    const stat = statSync(filePath);
    if (!stat.isFile()) {
      throw new Error("Not a file");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing source file";
    throw new Error(`Missing source file: ${filePath} (${message})`);
  }
}

function assertNoInlineContent(items: RegistryItem[]) {
  for (const item of items) {
    if (!Array.isArray(item.files)) {
      throw new Error(`Registry item ${item.name} is missing files[]`);
    }

    for (const file of item.files) {
      if (Object.prototype.hasOwnProperty.call(file, "content")) {
        throw new Error(
          `Registry item ${item.name} has files[].content at ${file.path}. Remove inline content to stay index-eligible.`,
        );
      }
    }
  }
}

function assertRegistryPath(filePath: string) {
  if (!filePath.startsWith("registry/")) {
    throw new Error(
      `Registry file path must start with "registry/" to be index-eligible: ${filePath}`,
    );
  }
}

function removeLegacyOutput() {
  const legacyPath = path.join(publicRoot, "r");
  if (existsSync(legacyPath)) {
    rmSync(legacyPath, { recursive: true, force: true });
  }
}

function removeRegistryOutput() {
  const registryOutput = path.join(publicRoot, "registry");
  if (existsSync(registryOutput)) {
    rmSync(registryOutput, { recursive: true, force: true });
  }
}

function removeVersionedOutput() {
  if (!existsSync(publicRoot)) {
    return;
  }

  const entries = readdirSync(publicRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    if (/\.v\d+\.json$/.test(entry.name)) {
      rmSync(path.join(publicRoot, entry.name));
    }
  }
}

function copyRegistryFile(relativePath: string) {
  const sourcePath = path.resolve(repoRoot, relativePath);
  assertFileExists(sourcePath);

  const destinationPath = path.resolve(publicRoot, relativePath);
  mkdirSync(path.dirname(destinationPath), { recursive: true });
  copyFileSync(sourcePath, destinationPath);
}

const registry = readJson(registryPath);

if (!registry || !Array.isArray(registry.items)) {
  throw new Error("registry.json must include an items array.");
}

assertNoInlineContent(registry.items);
mkdirSync(publicRoot, { recursive: true });
removeLegacyOutput();
removeRegistryOutput();
removeVersionedOutput();

assertFileExists(path.join(publicRoot, "registry.json"));

for (const item of registry.items) {
  if (!item.name) {
    throw new Error("Registry item is missing a name.");
  }

  assertFileExists(path.join(publicRoot, `${item.name}.json`));

  for (const file of item.files) {
    if (!file.path || typeof file.path !== "string") {
      throw new Error(`Registry item ${item.name} has a file without path.`);
    }

    assertRegistryPath(file.path);
    copyRegistryFile(file.path);
  }
}

console.log("Registry build complete.");
