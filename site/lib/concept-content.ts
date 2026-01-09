import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { renderMarkdown } from "@/lib/markdown";

const repoRoot = path.resolve(process.cwd(), "..");
const CONTENT_SECTIONS = ["quickstart", "usage", "examples", "notes"] as const;

type ContentSection = (typeof CONTENT_SECTIONS)[number];

export type ConceptContent = Record<ContentSection, string>;

function readMarkdownFile(slug: string, section: ContentSection) {
  const filePath = path.join(repoRoot, "registry", slug, "content", `${section}.md`);
  if (!existsSync(filePath)) {
    return "";
  }
  return readFileSync(filePath, "utf8");
}

export async function getConceptContent(slug: string): Promise<ConceptContent> {
  const entries = await Promise.all(
    CONTENT_SECTIONS.map(async (section) => {
      const markdown = readMarkdownFile(slug, section);
      if (!markdown.trim()) {
        return [section, ""] as const;
      }
      const html = await renderMarkdown(markdown);
      return [section, html] as const;
    }),
  );

  return Object.fromEntries(entries) as ConceptContent;
}
