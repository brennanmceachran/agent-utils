import { readFileSync } from "node:fs";
import path from "node:path";

export type RegistryFile = {
  path: string;
  target?: string;
  type?: string;
};

type RegistryMeta = {
  concept?: string;
  platform?: string;
  kind?: string[];
  postInstall?: string;
  installPath?: string;
  [key: string]: unknown;
};

export type RegistryItem = {
  name: string;
  title?: string;
  description?: string;
  docs?: string;
  files: RegistryFile[];
  meta?: RegistryMeta;
  [key: string]: unknown;
};

export type Registry = {
  name?: string;
  homepage?: string;
  items: RegistryItem[];
};

export type Concept = {
  slug: string;
  name: string;
  summary: string;
  why: string[];
  what: string[];
  useCases: string[];
  tags: string[];
};

const repoRoot = path.resolve(process.cwd(), "..");

function readJson<T>(filePath: string): T {
  const raw = readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export function getRegistry(): Registry {
  const registryPath = path.join(repoRoot, "registry.json");
  return readJson<Registry>(registryPath);
}

export function getRegistryItems(): RegistryItem[] {
  return getRegistry().items || [];
}

export function getConcepts(): Concept[] {
  const registry = getRegistry();
  const concepts = new Set<string>();

  for (const item of registry.items || []) {
    const slug = item.meta?.concept;
    if (slug) {
      concepts.add(slug);
    }
  }

  return Array.from(concepts).map((slug) => {
    const conceptPath = path.join(repoRoot, "registry", slug, "concept.json");
    return readJson<Concept>(conceptPath);
  });
}

export function getConceptBySlug(slug: string): Concept | null {
  const concepts = getConcepts();
  return concepts.find((concept) => concept.slug === slug) ?? null;
}

export function getItemsByConcept(slug: string): RegistryItem[] {
  return getRegistryItems().filter((item) => item.meta?.concept === slug);
}

export function readRegistryFile(relativePath: string): string {
  const filePath = path.join(repoRoot, relativePath);
  return readFileSync(filePath, "utf8");
}
