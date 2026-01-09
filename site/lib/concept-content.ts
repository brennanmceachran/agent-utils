import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";

const CONTENT_SECTIONS = ["overview", "quickstart", "usage", "examples", "notes"] as const;

type ContentSection = (typeof CONTENT_SECTIONS)[number];

type MdxSection = ComponentType<{ components?: MDXComponents }> | null;

export type ConceptContent = Record<ContentSection, MdxSection>;

async function importSection(slug: string, section: ContentSection): Promise<MdxSection> {
  try {
    const mod = await import(`../../registry/${slug}/content/${section}.mdx`);
    return mod.default ?? null;
  } catch (error) {
    return null;
  }
}

export async function getConceptContent(slug: string): Promise<ConceptContent> {
  const entries = await Promise.all(
    CONTENT_SECTIONS.map(async (section) => {
      const sectionModule = await importSection(slug, section);
      return [section, sectionModule] as const;
    }),
  );

  return Object.fromEntries(entries) as ConceptContent;
}
